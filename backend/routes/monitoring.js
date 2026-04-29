const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const { client: client } = require("../redisclient");
const User = require("../models/User");

// In-memory store for tracking which employees should be monitored
// Format: { "employee_email": "start" | "stop" }
const monitoringStatus = {};

// Called by the React Dashboard to START monitoring
router.post('/start_monitoring', async (req, res) => {
    const { email } = req.body;
    console.log("req.body",req.body);
    if (!email) return res.status(400).json({ error: "Email is required" });


    const key = `monitor:status:${email}`;
    
    await client.set(key , "active");
    await User.findOneAndUpdate({ sanitizedEmail: email }, { status: "active" });

    const status = await client.get(key);

    //Emits real time updates to dashboard
    req.io.emit("monitoring-status", {
        email,
        status: status
    })

    console.log(`Realtime emitted for ${email}`);

    res.status(200).json({
        email,
        status: status
    })
    // monitoringStatus[email] = "start";
    console.log(`[Dashboard] Start monitoring requested for: ${email}`);
    // res.json({ message: "Monitoring started successfully", status: "active" });
});

// Called by the React Dashboard to STOP monitoring
router.post('/stop_monitoring', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const key = `monitor:status:${email}`;
    await client.set(key , "inactive");
    await User.findOneAndUpdate({ sanitizedEmail: email }, { status: "inactive" });

    const status = await client.get(key);

    //Emits real time updates to dashboard
    req.io.emit("monitoring-status", {
        email,
        status: status
    })

    res.status(200).json({
        email,
        status: status
    })

    // monitoringStatus[email] = "stop";
    console.log(`[Dashboard] Stop monitoring requested for: ${email}`);
    // res.status(200).json({ message: "Monitoring stopped", status: "stop" });
});

// Called continuously by the Python Desktop Agent to check its status
router.get('/status/:employeeId', async (req, res) => {
    const employeeId = req.params.employeeId;
    // Default to 'stop' if not found
    const key = `monitor:status:${employeeId}`;
    const status = await client.get(key);
    // const status = monitoringStatus[employeeId] || "stop";
    res.json({ status: status || "inactive"});
});

// Called by the Python Desktop Agent to upload metrics when a session ends
router.post('/upload', async (req, res) => {
    try {
        const data = req.body;
        const email = data.employeeId || data.email;

        if (!email) {
            return res.status(400).json({ error: "employeeId/email is required in payload" });
        }

        // We use the same sanitized collection approach as in server.js
        const sanitizedEmail = email.toLowerCase().replace(/@/g, '_at_').replace(/\./g, '_dot_');

        const mainConn = req.app.locals.mainConn;
        if (!mainConn || mainConn.readyState !== 1) {
            return res.status(503).json({ error: "Database not connected" });
        }

        // Check if the collection already exists
        const collections = await mainConn.db.listCollections({ name: sanitizedEmail }).toArray();
        if (collections.length === 0) {
            await mainConn.db.createCollection(sanitizedEmail);
            console.log(`[Agent] Created new collection for missing user: ${sanitizedEmail}`);
        }

        const collection = mainConn.db.collection(sanitizedEmail);

        // Build local YYYY-MM-DD date representation
        const today = new Date();
        const formattedDate = today.getFullYear() + "-" + 
            String(today.getMonth() + 1).padStart(2, '0') + "-" + 
             String(today.getDate()).padStart(2, '0');

        // Required mapping for frontend compatibility
        const record = {
            date: data.date || formattedDate,
            start_time: data.sessionStart || today.toISOString(),
            end_time: data.sessionEnd || today.toISOString(),
            elapsed_time: data.elapsedTime || "00:00:00",
            active_duration: data.activeTime || "00:00:00",
            inactive_duration: data.inactiveTime || "00:00:00",
            total_break: data.breakTime || "00:00:00",
            break_count: data.breakCount || 0,
            tab_switches: data.tabSwitches || 0
        };

        const result = await collection.insertOne(record);
        console.log(`[Agent] Successfully saved session for ${sanitizedEmail}`);

        res.status(200).json({ 
            status: "success", 
            message: "Data uploaded successfully",
            id: result.insertedId
        });
    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({ error: "Failed to upload data", details: error.message });
    }
});

module.exports = router;

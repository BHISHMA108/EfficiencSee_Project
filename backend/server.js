const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const sanitize = require("mongo-sanitize");
const employeeRoutes = require("./routes/employeeRoutes");
const monitoringRoutes = require("./routes/monitoring");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Add at the top with other middleware
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use(cors({
  // origin: 'http://localhost:5173',
  origin: ["https://efficiensee-p80v.onrender.com","https://efficiencsee-backend.onrender.com",'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// Database Connection
const mainConn = mongoose.createConnection(process.env.MONGO_URI, {
  dbName: 'newEfficienSee_DB',
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Verify Connection
mainConn.on('connected', async () => {
  console.log('✅ Connected to newEfficienSee_DB');
  const collections = await mainConn.db.listCollections().toArray();
  console.log('Initial collections:', collections.map(col => col.name));
});

mainConn.on('error', (err) => {
  console.error('❌ MongoDB Connection Error:', err);
});

// Temporary Storage for Sanitized Email
let sanitizedEmailStorage = null;

// Email Sanitization Function
const sanitizeEmail = (email) => {
  return sanitize(email)
    .toLowerCase()
    .replace(/@/g, '_at_')
    .replace(/\./g, '_dot_');
};

// Create Collection for Employee
app.post('/api/employees/create-collection', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !/^[\w.-]+@[\w.-]+\.\w{2,3}$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const sanitizedEmail = sanitizeEmail(email);
    sanitizedEmailStorage = sanitizedEmail;  // Store sanitized email temporarily

    if (mainConn.readyState !== 1) {
      return res.status(503).json({ error: "Database not connected" });
    }

    const collections = await mainConn.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === sanitizedEmail);

    res.status(200).json({ message: collectionExists ? 'Collection already exists' : 'New collection created', collection: sanitizedEmail });

  } catch (error) {
    console.error('❌ Collection Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch Stored Sanitized Email
app.get('/api/get-sanitized-email', (req, res) => {
  if (!sanitizedEmailStorage) {
    return res.status(404).json({ error: "No sanitized email stored" });
  }
  res.json({ sanitized_email: sanitizedEmailStorage });
});

// Fetch Employee Data Route
app.get("/api/employees/fetch-data", async (req, res) => {
  try {
    const email = req.query.employee?.trim();
    const range = req.query.range || "week"; // Default to "week"
    
    if (!email) return res.status(400).json({ error: "Employee email is required" });

    const sanitizedEmail = sanitizeEmail(email);

    if (mainConn.readyState !== 1) {
      return res.status(503).json({ error: "Database not connected" });
    }

    const today = new Date();
    let startDate;

    if (range === "day") {
      startDate = new Date(today.setHours(0, 0, 0, 0)); // Start of today
    } else if (range === "week") {
      startDate = new Date(today.setDate(today.getDate() - 7));
    } else if (range === "month") {
      startDate = new Date(today.setMonth(today.getMonth() - 1));
    } else {
      return res.status(400).json({ error: "Invalid range" });
    }

    // Fetch records from MongoDB within the date range using `collection().find().toArray()`
    const EmployeeCollection = mainConn.db.collection(sanitizedEmail);
    const records = await EmployeeCollection.find({ 
      date: { $gte: startDate.toISOString().split("T")[0] }
    }).toArray();

    if (!records.length) return res.json([]); // Return empty array if no data

    res.json(records);
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Middleware for error handling
app.use((err, req, res, next) => {
  console.error("❌ Unexpected Error:", err.stack);
  res.status(500).send('Something broke!');
});

// Existing routes
app.use("/api/employees", employeeRoutes);
app.use('/api', monitoringRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 EfficienSee Backend is running!");
});
///////////////////////////////////////////////////////////////////////////////////////

app.get("/api/employees", async (req, res) => {
  try {
    const collections = await mainConn.db.listCollections().toArray();
    // Filter out old "EmployeeX" collections
    const collectionNames = collections
      .map(col => col.name)
      .filter(name => !name.startsWith('Employee'));
    res.json(collectionNames);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});


// Data fetching endpoint
// Update the /api/test endpoint mapping
app.get("/api/test", async (req, res) => {
  try {
    const { employee, startDate, endDate } = req.query;
    
    // Validate inputs
    if (!employee || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Verify collection exists
    const collectionExists = await mainConn.db.listCollections({ 
      name: employee 
    }).hasNext();

    if (!collectionExists) {
      return res.status(404).json({ error: "Employee collection not found" });
    }

    const collection = mainConn.db.collection(employee);

    // Query with proper date filtering
    const data = await collection.find({
      date: { 
        $gte: startDate,
        $lte: endDate 
      }
    }).sort({ date: 1 }).toArray();

    if (data.length === 0) {
      return res.status(404).json({ 
        warning: "No records found for this date range",
        query: { employee, startDate, endDate }
      });
    }

    // Map with fallback values
    const mappedData = data.map(item => ({
      Date: item.date || "N/A",
      Estimate_time: item.elapsed_time || "00:00:00",
      Tab_switched: parseInt(item.tab_switched_count) || 0,
      Active_duration: item.active_duration || "00:00:00",
      Inactive_duration: item.inactive_duration || "00:00:00",
      Total_break_time: item.break_time || "00:00:00",
      Breaks: parseInt(item.break_counter) || 0,
      start_time: item.start_time || "09:00:00",
      stop_time: item.stop_time || "18:00:00"
    }));

    res.json(mappedData);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
});


///////////////////////////////////////////////////////////////////////////////////////
// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = { sanitizeEmail };

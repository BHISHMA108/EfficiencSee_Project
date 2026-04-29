const User = require("../models/User");

const adduser = async(req , res)=>{
    try{
        const {email , name , role , status, sanitizeEmail} = req.body;
        const user = await User.findOne({email:email});
        
        if(user){
            return res.status(400).json({message:"User already exists"});
        }
        const newUser = new User({
            email,
            name,
            role,
            status,
            sanitizedEmail: sanitizeEmail
            });
        console.log("Attempting to save user:", newUser);
        await newUser.save();
        console.log("User saved successfully:", newUser._id);
        return res.status(201).json({message:"User added successfully", userData : newUser});
        
    }
    catch(err){
        console.log("this is the error",err);
        return res.status(500).json({error:"Internal server error"});
    }
}

const getallusers = async(req , res)=>{
    try{
        const users = await User.find();
        return res.status(200).json({users : users});
    }
    catch(err){
        console.log("this is the error",err);
        return res.status(500).json({error:"Internal server error"});
    }
}   

const updateUserRole = async(req , res)=>{
    try{
        const {id , role} = req.body;
        const user = await User.findByIdAndUpdate(id , {role:role});
        return res.status(200).json({message:"Role updated successfully", userData : user});
    }
    catch(err){
        console.log("this is the error",err);
        return res.status(500).json({error:"Internal server error"});
    }
}

module.exports = {adduser, getallusers, updateUserRole};
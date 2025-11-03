const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


router.post("/signup" , async (req,res) =>{
    try{
        const { username,password} = req.body;
        const existingUser = await User.findOne({username});
        if(existingUser) return res.status(400).json({message : "Username already taken"});

        const user = new User({username,password});
        await user.save();

        res.json({status: "success" , user: { username:user.username }});
    
    } catch(err){
        console.error(err);
        res.status(500).json({status:"error" , message: "Something went wrong"});
    }
});

router.post("/login" , async (req,res) =>{
    try{
        const { username,password} = req.body;
        const user = await User.findOne({username});
        if(!user) return res.status(400).json({message : "Username Invalid"});

        const isMatch = await user.comparePassword(password);
        if(!isMatch) return res.status(400).json({message : "Invalid Password"})
    
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username
            }
        });
        
        }catch(err){
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
})

module.exports = router;
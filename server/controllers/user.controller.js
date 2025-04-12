const User = require("../models/User.model");

const getAllUsers = async(req,res) => {
    try{
        const current_user = req.user;

        const users = await User.find({ uid: { $ne: current_user.uid } });
        return res.json(users);

    }catch(error){
        return res.status(500).json({error : "Failed to get users"});
    }
}

const addUser = async(req,res) => {
    try{
        const {uid, email, displayName} = req.body;

        const existUser = await User.findOne({uid});
        if(existUser) return res.status(200).json({message : "User already exist"});

        const user = await new User({uid, email, displayName});
        await user.save();
        res.status(201).json({ message: "User created in MongoDB." });

    }catch(error){
        return res.status(500).json({error : "Failed to add new user"});

    }
}

module.exports = {getAllUsers, addUser};
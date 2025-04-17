const Group = require("../models/Group.model");
const User = require("../models/User.model");
const Message = require("../models/Message.model");

const createGroup = async(req,res) => {
    const {name, members} = req.body;

    if (!name || !members?.length) {
        return res.status(400).json({ error: "Missing name or members" });
    }

    try{
        const newGroup = await Group.create({name,members});
        return res.status(201).json(newGroup);
    }catch(error){
        return res.status(500).json({ error: "Group creation failed" });
    }
}

const getAllGroups = async(req,res) => {
    try{
        const userId = req.user.uid;

        const allGroup = await Group.find({members : userId});

        const grpWithUser = await Promise.all(
            allGroup.map(async(group)=>{
                const users = await User.find({uid : {$in : group.members}});
                return {
                    ...group.toObject(),
                    members : users
                }
            })
        )
        return res.status(200).json(grpWithUser);
    }catch(error){
        return res.status(500).json({ error: "Group fetching failed" });
    }
}

module.exports = {createGroup, getAllGroups}
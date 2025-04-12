const express = require("express");
const {verifyFirebaseToken} = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get("/protected",verifyFirebaseToken,(req,res)=>{
    res.json({ message: `Hello, ${req.user.email}` });
});

module.exports = router;

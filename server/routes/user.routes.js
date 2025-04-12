const express = require("express");
const router = express.Router();
const {verifyFirebaseToken} = require("../middlewares/authMiddleware");
const userCtrl = require("../controllers/user.controller");

router.get("/",verifyFirebaseToken,userCtrl.getAllUsers);
router.post("/",userCtrl.addUser);

module.exports = router;
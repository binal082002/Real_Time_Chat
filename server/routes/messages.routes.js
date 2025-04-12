const express = require("express");
const router = express.Router();
const {verifyFirebaseToken} = require("../middlewares/authMiddleware");
const messageCtrl = require("../controllers/message.controller");

router.get("/",verifyFirebaseToken,messageCtrl.getMessages);
// router.post("/", verifyFirebaseToken, messageCtrl.upload.single("audio"), messageCtrl.postMessages);
router.post("/", messageCtrl.upload.single("audio"), messageCtrl.postMessages);

module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {verifyFirebaseToken} = require("../middlewares/authMiddleware");
const messageCtrl = require("../controllers/message.controller");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/",verifyFirebaseToken,messageCtrl.getMessages);
// router.post("/", verifyFirebaseToken, messageCtrl.upload.single("audio"), messageCtrl.postMessages);
router.post("/", upload.single("audio"), messageCtrl.postMessages);

module.exports = router;
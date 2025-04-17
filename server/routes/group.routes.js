const express = require("express");
const router = express.Router();
const {verifyFirebaseToken} = require("../middlewares/authMiddleware");
const groupCtrl = require("../controllers/group.controller");

router.post("/", verifyFirebaseToken, groupCtrl.createGroup);
router.get("/", verifyFirebaseToken, groupCtrl.getAllGroups);
module.exports = router;
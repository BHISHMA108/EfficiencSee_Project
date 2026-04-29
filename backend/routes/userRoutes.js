const express = require("express");
const router = express.Router();
const {adduser , getallusers ,updateUserRole} = require("../controllers/userController");


router.post("/add-user", adduser);
router.get("/get-all-users", getallusers);
router.put("/update-user-role", updateUserRole);    

module.exports = router;
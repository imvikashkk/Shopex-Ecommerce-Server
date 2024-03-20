import express from "express";
import {fetchUserDetail, updateUser, changePassword} from "../controller/User.js"

const router = express.Router();
router.get("/own", fetchUserDetail).patch("/updateuser", updateUser).patch("/changepassword", changePassword)
export default router
import express from 'express';
import {addAddress, removeAddress, updateAddress } from "../controller/Address.js";

const router = express.Router();
router.post("/", addAddress).delete("/", removeAddress).patch("/", updateAddress)

export default router
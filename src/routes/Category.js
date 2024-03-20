import express from "express";
import { fetchCategories } from "../controller/Category.js";

const router = express.Router();
router.get("/", fetchCategories)

export default router
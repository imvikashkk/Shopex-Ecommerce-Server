import express from "express";
import { createProduct, fetchAllProducts, fetchProductById, updateProduct } from "../controller/Product.js";

const router = express.Router();
router.post("/", createProduct).get("/", fetchAllProducts).get("/one/:id", fetchProductById).patch("/:id", updateProduct)

export default router
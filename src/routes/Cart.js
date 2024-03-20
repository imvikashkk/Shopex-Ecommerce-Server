import express from "express";
import {addToCart, deleteFromCart, fetchCartByUser, updateCart, fetchCartItemsByUser, clearCart} from "../controller/Cart.js"

const router = express.Router();
router.post("/", addToCart)
     .get("/", fetchCartByUser)
     .get("/items", fetchCartItemsByUser)
     .delete("/clear", clearCart)
     .delete("/:cartItemID", deleteFromCart)
     .patch("/:cartItemID", updateCart)
export default router
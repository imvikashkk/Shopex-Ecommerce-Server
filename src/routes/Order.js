import express from "express";
import {createOrder, fetchAllOrders
, fetchOrderByUser, updateOrder} from "../controller/Order.js"

const router = express.Router();
router.post("/", createOrder)
    .get('/own/', fetchOrderByUser)
    .get('/all/', fetchAllOrders)
    .patch('/:orderId', updateOrder)

export default router
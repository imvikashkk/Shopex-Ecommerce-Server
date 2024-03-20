import { Order } from "../model/Order.js";
import { Product } from "../model/Product.js";
import { User } from "../model/User.js";
import { sendMail, invoiceTemplate } from "../services/common.js";

export const fetchOrderByUser = async (req, res) => {
  try {
    const { id } = req.user;
    const orders = await Order.find({user:id});
    res.status(200).json(orders);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const createOrder = async (req, res) => {
  try {
    const {id} = req.user
    const order = new Order({...req.body, user:id});
    for (let item of order.items) {
      let product = await Product.findOne({ _id: item.product.id });
      product.$inc("stock", (-1)*item.quantity);
      const saveProduct = await product.save();
    }
    const doc = await order.save();
    const user = await User.findById(id);
    const email = user.email;
    if (email) {
      const html = invoiceTemplate(order)
      sendMail({to: email, subject:"Your Order is successfully received !", html})
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({message:err.message, error:err});
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { id, role } = req.user
    if(role === "admin"){
      const order = await Order.findOneAndUpdate({_id: orderId}, {
        status: req.body.status,
        paymentStatus : req.body?.paymentStatus || "pending"
      }, {
        new: true,
      });
      res.status(200).json(order);
    }else{
      const order = await Order.findOneAndUpdate({_id:orderId, user:id}, {
        status: req.body.status
      }, {
        new: true,
      });
      res.status(200).json(order);
    }
  } catch (err) {
    res.status(400).json(err);
  }
};

export const fetchAllOrders = async (req, res) => {
  try {
    const {role} = req.user;
    if(role !== "admin"){
          return res.status(400).json({message:"You are not an admin"})
    }


    let query = Order.find({ deleted: { $ne: true } });
    let totalOrdersQuery = Order.find({ deleted: { $ne: true } });
    if (req.query._sort && req.query._order) {
      query = query.sort({ [req.query._sort]: req.query._order });
    }
    const totalDocs = await totalOrdersQuery.count().exec();
    if (req.query._page && req.query._limit) {
      const pageSize = req.query._limit;
      const page = req.query._page;
      query = query.skip(pageSize * (page - 1)).limit(pageSize);
    }
    const docs = await query.exec();
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
  }
};

import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../model/Order.js";
import { User } from "../model/User.js";
import { Product } from "../model/Product.js";
import {invoiceTemplate, sendMail } from "../services/common.js";

const razorpayOrder = async (req, res) => {
  try {
    // Creating a new order
    const { id } = req.user;
    const neworder = new Order({
      ...req.body,
      user: id,
      paymentStatus: "failed",
    });
    for (let item of neworder.items) {
      let product = await Product.findOne({ _id: item.product.id });
      product.$inc("stock", -1 * item.quantity);
      const saveProduct = await product.save();
    }
    const doc = await neworder.save();
    
    // creating razorpay order
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = { amount: req.body.totalAmount * 100, currency: "INR" }; // expect amount in paisa
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).send("Error");
    }
    res.status(201).json({ order, doc });
  } catch (err) {
    res.status(500).send("Error");
  }
};

const razorpayOrderValidate = async (req, res) => {
  try{
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, doc } =
    req.body;
  const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  //order_id + "|" + razorpay_payment_id
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest("hex");
  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: "Transaction is not legit!" });
  }
 
  const order = await Order.findOneAndUpdate(
    { _id: doc.id },
    {
      status: "pending",
      paymentStatus: "received",
    },
    {
      new: true,
    }
  );

  const user = await User.findById(doc.user);
  const email = user.email;
  if (email) {
    const html = invoiceTemplate(order);
    sendMail({
      to: email,
      subject: "Your Order is successfully received !",
      html,
    });
  }

  res.json({
    msg: "success",
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    order: order
  });
  }catch(error){
    return res.status(400).json({message:error.message, error});
  }
};

export { razorpayOrder, razorpayOrderValidate };

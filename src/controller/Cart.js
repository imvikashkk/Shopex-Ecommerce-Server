import { Cart } from "../model/Cart.js";

export const fetchCartByUser = async (req, res) => {
  const { id } = req.user;
  try {
    const cartItems = await Cart.find({ user: id });
    let items = [];
    for (let i = 0; i < cartItems.length; i++) {
      items.push(cartItems[i].product);
    }
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const fetchCartItemsByUser = async (req, res) => {
  const { id } = req.user;
  try {
    const cartItems = await Cart.find({ user: id }).populate("product");
    res.status(200).json(cartItems);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const addToCart = async (req, res) => {
  try {
    const { id } = req.user;
    const cart = new Cart({ product: req.body.itemId, user: id });
    await cart.save();
    res.status(201).json(cart.product);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const deleteFromCart = async (req, res) => {
  try {
    const { id } = req.user;
    const { cartItemID } = req.params;
    const doc = await Cart.findOneAndDelete({ _id: cartItemID, user: id });
    const data = await doc.populate("product");
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const updateCart = async (req, res) => {
  try {
    const { cartItemID } = req.params;
    const { id } = req.user;
    const cart = await Cart.findOneAndUpdate(
      { _id: cartItemID, user: id },
      {quantity:req.body.quantity},
      {
        new: true,
      }
    );
    const result = await cart.populate("product");
    res.status(200).json(result);
  } catch (error) {}
};

export const clearCart = async (req, res) => {
  try{
    const { id } = req.user;
    const doc = await Cart.deleteMany({user:id});
    res.status(200).json({message:"cart cleared successfully !"});
  }catch (error) {
    res.status(400).json(error);
  }
}
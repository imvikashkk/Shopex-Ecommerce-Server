import { Category } from "../model/Category.js";

export const fetchCategories = async (req, res) => {
  try {
    const categories = await Category.find().exec();
    res.status(200).json(categories);
  } catch (error) {
    res.status(400).json(error);
  }
};

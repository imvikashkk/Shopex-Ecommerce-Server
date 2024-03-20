import {Brand} from "../model/Brand.js"

export const fetchBrands = async (req, res) => {
  try {
      const brands = await Brand.find().exec();
      res.status(200).json(brands)
  } catch (error) {
      res.status(400).json(error)
    }
};

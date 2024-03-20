import { Product } from "../model/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res
        .status(400)
        .json({ message: "only for admin !", error: "unauthorized" });
    }
    const product = new Product({
      title: req.body.title ,
      description: req.body.description,
      price: req.body.price ,
      discountPercentage: req.body.discountPercentage,
      stock: req.body.stock,
      brand: req.body.brand,
      category: req.body.category,
      thumbnail: req.body.thumbnail ,
      images: req.body.images ,
    });
    const saveProduct = await product.save();
    res.status(201).json({message:"Your product has been saved", product});
  } catch (error) {
    res.status(401).json({ error: error.message, error });
  }
};

export const fetchAllProducts = async (req, res) => {
  // filter = {"category":["smartphone","laptops"]}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  try {
    let condition = {};
    if (!req.query.admin) {
      condition.deleted = { $ne: true };
    }

    let query = Product.find(condition);
    let totalProductsQuery = Product.find(condition);

    if (req.query.category) {
      query = query.find({ category: { $in: req.query.category.split(",") } });
      totalProductsQuery = totalProductsQuery.find({
        category: { $in: req.query.category.split(",") },
      });
    }
    if (req.query.brand) {
      query = query.find({ brand: { $in: req.query.brand.split(",") } });
      totalProductsQuery = totalProductsQuery.find({
        brand: { $in: req.query.brand.split(",") },
      });
    }
    if (req.query._sort && req.query._order) {
      query = query.sort({ [req.query._sort]: req.query._order });
    }

    const totalDocs = await totalProductsQuery.count().exec();

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

export const fetchProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById({ _id: id });
    res.status(200).json(product);
  } catch (error) {
    res.status(401).json({ error: error, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== "admin") {
      return res
        .status(400)
        .json({ message: "only for admin !", error: "unauthorized" });
    }
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json(error);
  }
};

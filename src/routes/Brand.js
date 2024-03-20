import express from 'express';
import {fetchBrands} from "../controller/Brand.js";

const router = express.Router();
router.get("/", fetchBrands)
export default router
import mongoose from "mongoose";
import {
    Schema, model, models
} from "mongoose";
import { unique } from "next/dist/build/utils";
import { required } from "zod/mini";

const productSchema = new Schema(
    {
        name: {type: String, required: true},
        slug: {type: String, required: true, unique: true, index: true},
        description: {type: String},
        price: {type: Number, required: true},
        stock: {type: Number, default: 0},
        imageUrl: {type: String},
        category: {type: String},
        isActive: {type: Boolean, default: true}
    },
    {timestamps: true}
);

const Product = models.Product || model("Product", productSchema);
export default Product;
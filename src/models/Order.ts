import { Schema, model, models } from "mongoose";
import Product from "./product";
import { required } from "zod/mini";

const OrderItemSchema = new Schema ({
    productId: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    imageUrl: {type: String},
    quantity: {type: Number, required: true, min: 1},
});

const ShippingSchema = new Schema ({
    fullname: {type: String, required: true},
    phone: {type: String, required: true},
    line1: {type: String, required: true},
    city: {type: String, required: true},
    province: {type: String, required: true},
    postal: {type: String, required: true},
});

const OrdeSchema = new Schema (
    {
        userId: {type: Schema.Types.ObjectId, ref: "User", required: true},
        items: [OrderItemSchema],
        shippingAddress: {type: ShippingSchema, required: true},

        subtotal: {type: Number, required: true},
        shippingCost: {type: Number, required: true, default: 0},
        total: {type: Number, required: true},

        status: {
            type: String,
            enum: ["pending", "paid", "processing", "shipped", "completed", "cancelled"],
            default: "pending",
        },
        paymentMethod: {type: String, default: "manual"},
    },
    {timestamps: true},
);

const Order = models.Order || model("Order", OrdeSchema);
export default Order;
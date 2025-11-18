import { Schema, model, models } from "mongoose";
import { unique } from "next/dist/build/utils";
import { required } from "zod/mini";

const CartItemSchema = new Schema({
    productId : {
        type: Schema.Types.ObjectId, ref: "Product", required: true
    },
    quantity: {
        type: Number, required: true, min: 1
    },
});

const cartSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId, ref: "User", required: true, unique: true
        },
        items: [CartItemSchema],
    },
    {timestamps: true}
);

const Cart = models.Cart || model("Cart", cartSchema);
export default Cart;
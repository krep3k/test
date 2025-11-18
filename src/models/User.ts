import {
    Schema,
    models,
    model
} from "mongoose";

const UserSchema = new Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
    },
    {
        timestamps: true
    }
);

const User = models.User || model("User", UserSchema)

export default User;
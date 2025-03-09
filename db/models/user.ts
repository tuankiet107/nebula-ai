import { model, Schema } from "mongoose";

export type IUser = {
  username: string;
  walletAddress: string;
  privateKey: string;
};

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    walletAddress: { type: String, unique: true },
    privateKey: { type: String, unique: true },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);

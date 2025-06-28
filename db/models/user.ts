import { model, Schema } from "mongoose";

export enum PendingType {
  confirm = "CONFIRM",
}

type PendingAction = {
  type: PendingType;
  message: string;
  sessionId: string;
};

export type IUser = {
  username: string;
  walletAddress: string;
  privateKey: string;
  sessionId: string;
  pendingAction: PendingAction;
};

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    walletAddress: { type: String, unique: true },
    privateKey: { type: String, unique: true },
    pendingAction: { type: Object },
  },
  { timestamps: true }
);

export const User = model("User", userSchema);

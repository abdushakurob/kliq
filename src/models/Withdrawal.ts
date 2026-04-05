import mongoose, { Schema, Document, Model } from "mongoose";

export type WithdrawalStatus = "pending" | "success" | "failed";

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: WithdrawalStatus;
  transactionReference: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    bankCode: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["pending", "success", "failed"], 
      default: "pending" 
    },
    transactionReference: { type: String, required: true, unique: true },
    failureReason: { type: String },
  },
  { timestamps: true }
);

const Withdrawal: Model<IWithdrawal> = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);
export default Withdrawal;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  invoiceId: mongoose.Types.ObjectId;
  paymentProvider: string;
  providerTransactionId: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice", required: true },
    paymentProvider: { type: String, required: true },
    providerTransactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "NGN" },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
export default Transaction;

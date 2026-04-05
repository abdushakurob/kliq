import mongoose, { Schema, Document, Model } from "mongoose";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface IInvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface IInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  clientId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  items: IInvoiceItem[];
  serviceDescription: string; // Summary description
  amount: number; // Total amount
  currency: string;
  dueDate: Date;
  status: InvoiceStatus;
  notesTerms?: string;
  paymentLinkId?: string;
  paymentLinkUrl?: string;
  paymentProvider?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    invoiceNumber: { type: String, required: true },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
      },
    ],
    serviceDescription: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NGN" },
    dueDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["draft", "sent", "paid", "overdue"], 
      default: "draft" 
    },
    notesTerms: { type: String },
    paymentLinkId: { type: String },
    paymentLinkUrl: { type: String },
    paymentProvider: { type: String },
  },
  { timestamps: true }
);

InvoiceSchema.index({ userId: 1, invoiceNumber: 1 }, { unique: true });

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema);
export default Invoice;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClient extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    company: { type: String },
  },
  { timestamps: true }
);

ClientSchema.index({ userId: 1, email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string" } } });

const Client: Model<IClient> = mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema);
export default Client;

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  businessName?: string;
  image?: string;
  phone?: string;
  telegramId?: string;
  telegramHandle?: string;
  telegramConnectedAt?: Date;
  telegramVerificationCode?: string;
  telegramVerificationExpires?: Date;
  whatsappId?: string;
  whatsappConnectedAt?: Date;
  payoutBankCode?: string;
  payoutAccountNumber?: string;
  payoutAccountName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    businessName: { type: String },
    image: { type: String },
    phone: { type: String },
    telegramId: { type: String, unique: true, sparse: true },
    telegramHandle: { type: String },
    telegramConnectedAt: { type: Date },
    telegramVerificationCode: { type: String },
    telegramVerificationExpires: { type: Date },
    whatsappId: { type: String, unique: true, sparse: true },
    whatsappConnectedAt: { type: Date },
    payoutBankCode: { type: String },
    payoutAccountNumber: { type: String },
    payoutAccountName: { type: String },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;

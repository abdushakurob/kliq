import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  businessName?: string;
  image?: string;
  telegramId?: string;
  telegramConnectedAt?: Date;
  whatsappId?: string;
  whatsappConnectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    businessName: { type: String },
    image: { type: String },
    telegramId: { type: String, unique: true, sparse: true },
    telegramConnectedAt: { type: Date },
    whatsappId: { type: String, unique: true, sparse: true },
    whatsappConnectedAt: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;

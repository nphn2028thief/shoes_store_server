import mongoose from 'mongoose';
import { EROLE, IAccount } from '../types';

const Schema = mongoose.Schema;

const AccountSchema = new Schema<IAccount>(
  {
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, default: EROLE.USER },
    shippingAddresses: [{ type: Schema.Types.ObjectId, ref: 'ShippingAddress' }],
    otp: { type: Number, defailt: null },
    expiresIn: { type: Number, default: null },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IAccount>('Account', AccountSchema);

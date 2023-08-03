import mongoose from 'mongoose';
import { EROLE, ITest } from '../types';

const Schema = mongoose.Schema;

const TestSchema = new Schema<ITest>(
  {
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: { type: String, default: EROLE.USER },
    shippingAddresses: [{ phone: String, address: String }],
    otp: { type: Number, defailt: null },
    expiresIn: { type: Number, default: null },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ITest>('Test', TestSchema);

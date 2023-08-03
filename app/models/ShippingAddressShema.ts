import mongoose from 'mongoose';
import { IShippingAddress } from '../types/address';

const Schema = mongoose.Schema;

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IShippingAddress>('ShippingAddress', ShippingAddressSchema);

import mongoose from 'mongoose';
import { ICart } from '../types/cart';

const Schema = mongoose.Schema;

const CartSchema = new Schema<ICart>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, unique: true },
    products: [
      { _id: Schema.Types.ObjectId, name: String, size: String, image: String, price: Number, buyAmount: Number },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ICart>('Cart', CartSchema);

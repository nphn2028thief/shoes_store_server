import mongoose from 'mongoose';
import { IOrder } from '../types/order';

const Schema = mongoose.Schema;

const OrderSchema = new Schema<IOrder>({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', require: true },
  carts: [],
  // {
  //   _id: Schema.Types.ObjectId,
  //   products: {
  //     _id: Schema.Types.ObjectId,
  //     name: String,
  //     size: String,
  //     image: String,
  //     price: Number,
  //     buyAmount: Number,
  //   },
  // },
  total: { type: Number },
});

export default mongoose.model<IOrder>('Order', OrderSchema);

import mongoose from 'mongoose';
import { ICategory } from '../types/product';

const Schema = mongoose.Schema;

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product', default: [] }],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ICategory>('Category', CategorySchema);

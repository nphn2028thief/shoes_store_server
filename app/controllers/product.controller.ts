import { Request, Response } from 'express';
import { createProductValidate } from '../validations/product';
import { IProduct } from '../types/product';
import handlers from '../utils/handlers';
import ProductSchema from '../models/ProductSchema';
import mongoose from 'mongoose';
import CategorySchema from '../models/CategorySchema';
import slugify from 'slugify';

class ProductController {
  public createProduct = async (req: Request, res: Response) => {
    const url = req.protocol + '://' + req.get('host');
    const { error, value } = createProductValidate(req.body as IProduct);

    if (error) {
      return handlers.response.badRequest(res, error.details[0].message);
    }

    try {
      const productExist = await ProductSchema.findOne({ name: value.name });

      if (productExist) {
        return handlers.response.conflict(res, 'Product already exist!');
      }

      const newProduct = await ProductSchema.create({
        name: value.name,
        subTitle: value.subTitle,
        description: value.description,
        sizes: value.sizes,
        image: url + '/public/' + req.file?.filename,
        thumbnail: url + '/public/' + req.files,
        price: value.price,
        originalPrice: value.originalPrice,
        slug: slugify(value.name.toLowerCase()),
        categories: value.categories,
      });

      await CategorySchema.updateMany(
        {
          _id: value.categories,
        },
        {
          $push: {
            products: newProduct._id,
          },
        },
      );

      return handlers.response.success(res, 'Create new product successfully!', 'data', newProduct);
    } catch (error) {
      return handlers.response.error(res, 'Create new product failure!');
    }
  };

  public getProducts = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    // const keyword = req.query.q ?

    try {
      const products = await ProductSchema.find()
        .limit(limit)
        .skip((page - 1) * limit);
      return handlers.response.success(res, undefined, 'data', products);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public getProductById = async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return handlers.response.badRequest(res, 'Product Id is not valid!');
    }

    try {
      const productExist = await ProductSchema.findById(productId);

      if (!productExist) {
        return handlers.response.notFound(res, 'Product is not found!');
      }

      return handlers.response.success(res, undefined, 'data', productExist);
    } catch (error) {}
  };

  public getProductByCategory = async (req: Request, res: Response) => {
    const { categorySlug } = req.params as { categorySlug: string };

    if (!categorySlug) {
      return handlers.response.badRequest(res);
    }

    try {
      const categoryExist = await CategorySchema.findOne({ slug: categorySlug });

      if (!categoryExist) {
        return handlers.response.notFound(res, 'Category does not exist!');
      }

      const products = await CategorySchema.findById(categoryExist._id).populate('products');

      return handlers.response.success(res, undefined, 'data', products?.products);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public updateProduct = async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const { error, value } = createProductValidate(req.body as IProduct);

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return handlers.response.badRequest(res, 'Product id is not valid!');
    }

    if (error) {
      return handlers.response.badRequest(res, error.details[0].message);
    }

    try {
      const productFound = await ProductSchema.findByIdAndUpdate(
        {
          _id: productId,
        },
        {
          $set: {
            name: value.name,
            subTitle: value.subTitle,
            description: value.description,
            sizes: value.sizes,
            image: value.image,
            thumbnail: value.thumbnail,
            price: value.price,
            originalPrice: value.originalPrice,
            slug: slugify(value.name.toLowerCase()),
            categories: value.categories,
          },
        },
        {
          new: true,
        },
      );

      if (!productFound) {
        return handlers.response.notFound(res, 'Product is not found!');
      }

      await CategorySchema.updateMany(
        {
          _id: productFound.categories,
        },
        {
          $push: {
            products: productId,
          },
        },
      );

      return handlers.response.success(res, 'Update product successfully!', 'data', productFound);
    } catch (error) {
      return handlers.response.error(res, 'Update product failure!');
    }
  };

  public deleteProduct = async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return handlers.response.badRequest(res, 'Product id is not valid!');
    }

    try {
      const productFound = await ProductSchema.findOneAndDelete({
        _id: productId,
      });

      if (!productFound) {
        return handlers.response.notFound(res, 'Product is not found!');
      }

      await CategorySchema.updateMany(
        {
          _id: productFound.categories,
        },
        {
          $pull: {
            products: productId,
          },
        },
      );

      return handlers.response.success(res, 'Delete product successfully!', 'data', productId);
    } catch (error) {
      return handlers.response.error(res, 'Delete product failure!');
    }
  };
}

export default new ProductController();

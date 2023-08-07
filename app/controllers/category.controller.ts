import { Request, Response } from 'express';
import mongoose from 'mongoose';
import slugify from 'slugify';
import CategorySchema from '../models/CategorySchema';
import handlers from '../utils/handlers';
import ProductSchema from '../models/ProductSchema';

class CategoryController {
  public createCategory = async (req: Request, res: Response) => {
    const { name } = req.body as { name: string };

    if (!name) {
      return handlers.response.badRequest(res);
    }

    try {
      const categoryExist = await CategorySchema.findOne({ name });

      if (categoryExist) {
        return handlers.response.conflict(res, 'Category already exist!');
      }

      await CategorySchema.create({
        name,
        slug: slugify(name.toLowerCase()),
      });

      return handlers.response.success(res, 'Create category successfully!');
    } catch (error) {
      return handlers.response.error(res, 'Create category failure!');
    }
  };

  public getCategories = async (req: Request, res: Response) => {
    try {
      const categories = await CategorySchema.find();

      return handlers.response.success(res, undefined, 'data', categories);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public updateCategory = async (req: Request, res: Response) => {
    const { categoryId } = req.params as { categoryId: string };
    const { name } = req.body as { name: string };

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return handlers.response.badRequest(res, 'Category Id is not valid!');
    }

    if (!name) {
      return handlers.response.badRequest(res, 'Category name is not valid!');
    }

    try {
      const categoryFound = await CategorySchema.findByIdAndUpdate(
        {
          _id: categoryId,
        },
        {
          $set: {
            name,
            slug: slugify(name.toLowerCase()),
          },
        },
        { new: true },
      );

      if (!categoryFound) {
        return handlers.response.notFound(res, 'Category is not found!');
      }

      return handlers.response.success(res, 'Update category successfully!', 'data', categoryFound);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public deleteCategory = async (req: Request, res: Response) => {
    const { categoryId } = req.params as { categoryId: string };

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return handlers.response.badRequest(res, 'Category id is not valid!');
    }

    try {
      const categoryFound = await CategorySchema.findByIdAndDelete({
        _id: categoryId,
      });

      if (!categoryFound) {
        return handlers.response.notFound(res, 'Category is not found!');
      }

      await ProductSchema.updateMany(
        {
          _id: categoryFound.products,
        },
        {
          $pull: {
            categories: categoryId,
          },
        },
      );

      await ProductSchema.deleteMany({
        categories: [],
      });

      return handlers.response.success(res, 'Delete category successfully!', 'categoryId', categoryId);
    } catch (error) {
      return handlers.response.error(res, 'Delete product failure!');
    }
  };
}

export default new CategoryController();

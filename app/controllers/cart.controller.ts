import { Request, Response } from 'express';
import mongoose from 'mongoose';
import CartSchema from '../models/CartSchema';
import { ICart } from '../types/cart';
import handlers from '../utils/handlers';
import { addToCartValidator } from '../validations/cart';

class CartController {
  public addToCart = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const { error, value } = addToCartValidator(req.body as Pick<ICart, 'products'>);

    if (error) {
      return handlers.response.badRequest(res);
    }

    try {
      const productItem = {
        _id: value._id,
        name: value.name,
        size: value.size,
        image: value.image,
        price: value.price,
        buyAmount: value.buyAmount,
      };

      const cartItemExist = await CartSchema.findOne({
        accountId,
      });

      if (!cartItemExist) {
        const newCartItem = await CartSchema.create({
          accountId,
          products: [productItem],
        });

        return handlers.response.success(res, 'Add product to cart successfully!', 'data', newCartItem);
      }

      const isNewProduct = await CartSchema.findOneAndUpdate(
        {
          accountId,
          products: {
            $elemMatch: {
              _id: value._id,
            },
          },
        },
        {
          $inc: {
            'products.$.buyAmount': value.buyAmount,
          },
        },
        {
          new: true,
        },
      );

      if (!isNewProduct) {
        const cartItem = await CartSchema.findByIdAndUpdate(
          {
            _id: cartItemExist._id,
          },
          {
            $push: {
              products: productItem,
            },
          },
          {
            new: true,
          },
        );

        return handlers.response.success(res, 'Add product to cart successfully!', 'data', cartItem);
      }

      const newCart = await CartSchema.findOne({
        accountId,
      });

      return handlers.response.success(res, 'Add product to cart successfully!', 'data', newCart);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public getCarts = async (req: Request, res: Response) => {
    const accountId = req.accountId;

    try {
      const myCart = await CartSchema.findOne({ accountId });
      return handlers.response.success(res, undefined, 'data', myCart?.products);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public deleteFromCart = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const { productId } = req.params as { productId: string };

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return handlers.response.badRequest(res);
    }

    try {
      await CartSchema.updateOne(
        {
          accountId,
        },
        {
          $pull: {
            products: {
              _id: productId,
            },
          },
        },
      );

      return handlers.response.success(res, 'Delete product from cart successfully!', 'productId', productId);
    } catch (error) {
      return handlers.response.error(res);
    }
  };
}

export default new CartController();

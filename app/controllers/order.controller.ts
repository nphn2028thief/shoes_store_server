import { Request, Response } from 'express';
import CartSchema from '../models/CartSchema';
import OrderSchema from '../models/OrderSchema';
import handlers from '../utils/handlers';

class OrderController {
  public createMyOrder = async (req: Request, res: Response) => {
    const accountId = req.accountId;
    const { carts, total } = req.body;

    try {
      const newOrder = await OrderSchema.create({
        accountId,
        carts,
        total,
      });

      await CartSchema.deleteOne({ accountId });

      return handlers.response.success(res, undefined, 'data', newOrder);
    } catch (error) {
      return handlers.response.error(res);
    }
  };

  public getMyOrders = async (req: Request, res: Response) => {
    const accountId = req.accountId;

    try {
      const myOrders = await OrderSchema.find({ accountId });
      return handlers.response.success(res, undefined, 'data', myOrders);
    } catch (error) {
      return handlers.response.error(res);
    }
  };
}

export default new OrderController();

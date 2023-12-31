import { Router } from 'express';
import OrderController from '../controllers/order.controller';
import { verifyToken } from '../middlewares/auth';

const orderRoute = (route: Router) => {
  route.post('/order', verifyToken, OrderController.createMyOrder);
  route.get('/order', verifyToken, OrderController.getMyOrders);
};

export default orderRoute;

import { Router } from 'express';
import CartController from '../controllers/cart.controller';
import { verifyToken } from '../middlewares/auth';

const cartRoute = (route: Router) => {
  route.post('/cart', verifyToken, CartController.addToCart);
  route.get('/cart', verifyToken, CartController.getCarts);
  route.delete('/cart/:productId', verifyToken, CartController.deleteFromCart);
};

export default cartRoute;

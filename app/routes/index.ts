import express from 'express';
import authRoute from './auth.routes';
import cartRoute from './cart.routes';
import categoryRoute from './category.routes';
import orderRoute from './order.routes';
import productRoute from './product.routes';
import shippingAddressRoute from './shippingAddress.routes';

const router = express.Router();

const routes = () => {
  authRoute(router);
  cartRoute(router);
  categoryRoute(router);
  orderRoute(router);
  productRoute(router);
  shippingAddressRoute(router);
  return router;
};

export default routes;

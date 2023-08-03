import express from 'express';
import authRoute from './authRoute';
import cartRoute from './cartRoute';
import categoryRoute from './categoryRoute';
import orderRoute from './orderRoute';
import productRoute from './productRoute';
import shippingAddressRoute from './shippingAddressRoute';
import testRoute from './testRoute';

const router = express.Router();

const routes = () => {
  authRoute(router);
  cartRoute(router);
  categoryRoute(router);
  orderRoute(router);
  productRoute(router);
  shippingAddressRoute(router);
  testRoute(router);
  return router;
};

export default routes;

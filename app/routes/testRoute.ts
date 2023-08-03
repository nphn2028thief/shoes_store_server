import { Router } from 'express';
import TestController from '../controllers/TestController';
import { verifyToken } from '../middlewares/auth';

const testRoute = (route: Router) => {
  route.post('/test-1', TestController.signUp);
  route.post('/test-2', TestController.signIn);
  route.get('/test-3', verifyToken, TestController.getMe);
  route.patch('/test-4/:shippingAddressId', verifyToken, TestController.updateMe);
  route.get('/test-5/:shippingAddressId', verifyToken, TestController.getShippingAddressById);
};

export default testRoute;

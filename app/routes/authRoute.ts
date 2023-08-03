import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { verifyToken } from '../middlewares/auth';

const authRoute = (route: Router) => {
  route.post('/auth/signUp', AuthController.signUp);
  route.post('/auth/signIn', AuthController.signIn);
  route.get('/auth/getMe', verifyToken, AuthController.getMe);
  route.patch('/auth/updateMe', verifyToken, AuthController.updateMe);
  route.post('/auth/verifyOtp', AuthController.verifyOtp);
  route.post('/auth/forgotPassword', AuthController.forgorPassword);
  route.put('/auth/resetPassword', AuthController.resetPassword);
};

export default authRoute;

import { Router } from 'express';
import categoryController from '../controllers/CategoryController';
import { verifyAdmin, verifyToken } from '../middlewares/auth';

const categoryRoute = (route: Router) => {
  route.post('/category', verifyToken, verifyAdmin, categoryController.createCategory);
  route.get('/category', categoryController.getCategories);
  route.patch('/category/:categoryId', verifyToken, verifyAdmin, categoryController.updateCategory);
  route.delete('/category/:categoryId', verifyToken, verifyAdmin, categoryController.deleteCategory);
};

export default categoryRoute;

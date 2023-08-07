import { Router } from 'express';
import CategoryController from '../controllers/category.controller';
import { verifyAdmin, verifyToken } from '../middlewares/auth';

const categoryRoute = (route: Router) => {
  route.post('/category', verifyToken, verifyAdmin, CategoryController.createCategory);
  route.get('/category', CategoryController.getCategories);
  route.patch('/category/:categoryId', verifyToken, verifyAdmin, CategoryController.updateCategory);
  route.delete('/category/:categoryId', verifyToken, verifyAdmin, CategoryController.deleteCategory);
};

export default categoryRoute;

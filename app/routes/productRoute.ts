import { Router } from 'express';
import ProductController from '../controllers/ProductController';
import { verifyAdmin, verifyToken } from '../middlewares/auth';

const productRoute = (route: Router) => {
  route.post('/product', verifyToken, verifyAdmin, ProductController.createProduct);
  route.get('/product', ProductController.getProducts);
  route.get('/product/:productId/detail', ProductController.getProductById);
  route.patch('/product/:productId', verifyToken, verifyAdmin, ProductController.updateProduct);
  route.delete('/product/:productId', verifyToken, verifyAdmin, ProductController.deleteProduct);
  route.get('/product/:categorySlug', ProductController.getProductByCategory);
};

export default productRoute;

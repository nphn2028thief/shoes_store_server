import { Router } from 'express';
import ShippingAddressController from '../controllers/shippingAddress.controller';
import { verifyToken } from '../middlewares/auth';

const shippingAddressRoute = (route: Router) => {
  route.post('/shippingAddress', verifyToken, ShippingAddressController.createShippingAddress);
  route.get('/shippingAddress', verifyToken, ShippingAddressController.getShippingAddresses);
  route.get('/shippingAddress/:shippingAddressId', verifyToken, ShippingAddressController.getShippingAddressById);
  route.patch('/shippingAddress/:shippingAddressId', verifyToken, ShippingAddressController.updateShippingAddress);
  route.delete('/shippingAddress/:shippingAddressId', verifyToken, ShippingAddressController.deleteShippingAddress);
};

export default shippingAddressRoute;

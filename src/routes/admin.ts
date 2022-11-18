import { Router } from 'express';
import {
	createProduct,
	dashboardInfo,
	getOrders,
	getProducts,
	getUsers,
	updateProduct,
	updateUsers,
	uploadFile,
} from '../controllers/admin';

const router = Router();

router.get('/dashboard', dashboardInfo);
router.get('/orders', getOrders);
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products', updateProduct);
router.post('/upload', uploadFile);
router.get('/users', getUsers);
router.put('/users', updateUsers);

export default router;

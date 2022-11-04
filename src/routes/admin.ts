import { Router } from 'express';
import {
	createProduct,
	dashboardInfo,
	getOrders,
	getProducts,
	updateProduct,
} from '../controllers/admin';

import { checkJWT, isAdminRole } from '../middlewares';

const router = Router();

router.get('/dashboard', [checkJWT, isAdminRole], dashboardInfo);
router.get('/orders', [checkJWT, isAdminRole], getOrders);
router.get('/products', [checkJWT, isAdminRole], getProducts);
router.post('/products', [checkJWT, isAdminRole], createProduct);
router.put('/products', [checkJWT, isAdminRole], updateProduct);

export default router;

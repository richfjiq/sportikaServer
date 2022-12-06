import { Router } from 'express';

import { checkJWT } from '../middlewares';
import { createOrder, getOrderById, getOrdersByUser, updateOrder } from '../controllers/orders';

const router = Router();

router.post('/', [checkJWT], createOrder);
router.get('/:orderId', [checkJWT], getOrderById);
router.get('/user/:userId', [checkJWT], getOrdersByUser);
router.put('/:orderId', [checkJWT], updateOrder);

export default router;

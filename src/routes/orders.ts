import { Router } from 'express';
import { checkJWT } from '../middlewares';

import { createOrder, getOrderById, getOrdersByUser } from '../controllers/orders';

const router = Router();

router.post('/', [checkJWT], createOrder);
router.get('/:orderId', [checkJWT], getOrderById);
router.get('/user/:userId', [checkJWT], getOrdersByUser);

export default router;

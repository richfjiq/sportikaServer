import { Router } from 'express';
import { createOrder } from '../controllers/orders';
import { checkJWT } from '../middlewares';

const router = Router();

router.post('/', [checkJWT], createOrder);
// router.post('/pay');

export default router;

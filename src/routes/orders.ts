import { Router } from 'express';
import { checkJWT } from '../middlewares';

import { createOrder } from '../controllers/orders';

const router = Router();

router.post('/', [checkJWT], createOrder);
// router.post('/pay');

export default router;

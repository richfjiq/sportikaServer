import { Router } from 'express';

import { getConfig, paymentSheet } from '../controllers/payment';
import { checkJWT } from '../middlewares';

const router = Router();

router.get('/config', getConfig);
router.post('/payment-sheet/:orderId', [checkJWT], paymentSheet);

export default router;

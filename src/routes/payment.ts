import { Router } from 'express';

import { getConfig } from '../controllers/payment';

const router = Router();

router.get('/config', getConfig);

export default router;

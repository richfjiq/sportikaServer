import { Router } from 'express';
import { dashboardInfo } from '../controllers/admin';

import { checkJWT } from '../middlewares';

const router = Router();

router.get('/dashboard', [checkJWT], dashboardInfo);

export default router;

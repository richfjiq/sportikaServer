import { Router } from 'express';

import { getWelcomeMsg } from '../controllers/welcome';

const router = Router();

router.get('/', getWelcomeMsg);

export default router;

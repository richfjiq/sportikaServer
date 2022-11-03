import { Router } from 'express';

import { checkJWT, loginUser, registerUser } from '../controllers/user';

const router = Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/validate-token', checkJWT);

export default router;

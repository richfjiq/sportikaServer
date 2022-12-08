import { Router } from 'express';

import { checkJWT, loginUser, registerUser, updateUser } from '../controllers/user';
import { checkJWT as checkJWTMiddleware } from '../middlewares';

const router = Router();

router.put('/:userId', [checkJWTMiddleware], updateUser);
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/validate-token', checkJWT);

export default router;

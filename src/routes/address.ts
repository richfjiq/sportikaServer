import { Router } from 'express';
import { createAddress, getAddressByUser, updateAddress } from '../controllers/address';
import { checkJWT } from '../middlewares';

const router = Router();

router.post('/', [checkJWT], createAddress);
router.put('/', [checkJWT], updateAddress);
router.get('/:id', [checkJWT], getAddressByUser);

export default router;

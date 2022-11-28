"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_1 = require("../controllers/address");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.post('/', [middlewares_1.checkJWT], address_1.createAddress);
router.put('/', [middlewares_1.checkJWT], address_1.updateAddress);
router.get('/:id', [middlewares_1.checkJWT], address_1.getAddressByUser);
exports.default = router;
//# sourceMappingURL=address.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.put('/:userId', [middlewares_1.checkJWT], user_1.updateUser);
router.post('/login', user_1.loginUser);
router.post('/register', user_1.registerUser);
router.get('/validate-token', user_1.checkJWT);
exports.default = router;
//# sourceMappingURL=user.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkJWT = void 0;
const database_1 = require("../database");
const models_1 = require("../models");
const utils_1 = require("../utils");
const checkJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers['x-token']) !== null && _a !== void 0 ? _a : undefined;
    if (token === undefined) {
        res.status(401).json({
            msg: 'There is no token in the request.',
        });
        return;
    }
    try {
        const userId = yield utils_1.jwt.isValidToken(token);
        yield database_1.db.connect();
        const user = yield models_1.User.findById(userId);
        if (user === null) {
            res.status(401).json({
                msg: 'Invalid',
            });
            return;
        }
        req.user = user;
        yield database_1.db.disconnect();
        next();
    }
    catch (error) {
        res.status(401).json({
            msg: 'Invalid token.',
        });
        yield database_1.db.disconnect();
    }
});
exports.checkJWT = checkJWT;
//# sourceMappingURL=checkJwt.js.map
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkJWT = exports.registerUser = exports.loginUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../database");
const models_1 = require("../models");
const utils_1 = require("../utils");
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email = '', password = '' } = req.body;
    yield database_1.db.connect();
    const user = yield models_1.User.findOne({ email });
    yield database_1.db.disconnect();
    if (user === null) {
        res.status(400).json({ message: 'Email / Password not valid - Email' });
        return;
    }
    if (!bcryptjs_1.default.compareSync(password, String(user.password))) {
        res.status(400).json({ message: 'Email / Password not valid - Password' });
        return;
    }
    const { role, name, _id } = user;
    const token = utils_1.jwt.signToken(_id, email);
    res.status(200).json({
        token,
        user: {
            _id,
            email,
            role,
            name,
        },
    });
});
exports.loginUser = loginUser;
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email = '', password = '', name = '', } = req.body;
    if (password.length < 6) {
        res.status(400).json({
            message: 'Password must have at least 6 characters',
        });
        return;
    }
    if (name.length < 2) {
        res.status(400).json({
            message: 'Name must have at least 2 characters',
        });
        return;
    }
    if (!utils_1.validations.isValidEmail(email)) {
        res.status(400).json({
            message: 'Email is not valid',
        });
        return;
    }
    yield database_1.db.connect();
    const user = yield models_1.User.findOne({ email });
    if (user !== null) {
        res.status(400).json({
            message: 'Email already exists.',
        });
        return;
    }
    const newUser = new models_1.User({
        email: email.toLocaleLowerCase(),
        password: bcryptjs_1.default.hashSync(password),
        role: 'client',
        name,
    });
    try {
        yield newUser.save({ validateBeforeSave: true });
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        res.status(500).json({
            message: 'Server error',
        });
        return;
    }
    const { _id, role } = newUser;
    const token = utils_1.jwt.signToken(_id, email);
    res.status(200).json({
        token,
        user: {
            _id,
            email,
            role,
            name,
        },
    });
});
exports.registerUser = registerUser;
const checkJWT = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header('x-token')) !== null && _a !== void 0 ? _a : '';
    let userId = '';
    try {
        userId = yield utils_1.jwt.isValidToken(token);
    }
    catch (error) {
        res.status(401).json({
            message: 'Auth token is not valid.',
        });
        return;
    }
    yield database_1.db.connect();
    const user = yield models_1.User.findById(userId).lean();
    yield database_1.db.disconnect();
    if (user === null) {
        res.status(400).json({ message: 'There is no user with this id.' });
        return;
    }
    const { _id, email, role, name } = user;
    res.status(200).json({
        token: utils_1.jwt.signToken(_id, email),
        user: {
            _id,
            email,
            role,
            name,
        },
    });
});
exports.checkJWT = checkJWT;
//# sourceMappingURL=user.js.map
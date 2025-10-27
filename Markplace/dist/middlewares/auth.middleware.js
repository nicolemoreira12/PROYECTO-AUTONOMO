"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Misma clave secreta que en auth.service.ts
const JWT_SECRET = "mi_clave_secreta_2024";
const authMiddleware = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token requerido" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Token inválido o expirado" });
    }
};
exports.authMiddleware = authMiddleware;

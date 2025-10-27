"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email y contraseña son requeridos" });
        }
        const result = await authService.login(email, password);
        res.json(result);
    }
    catch (error) {
        res.status(401).json({
            message: error instanceof Error ? error.message : "Error al iniciar sesión"
        });
    }
};
exports.login = login;
// Registro
const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        res.status(400).json({
            message: error instanceof Error ? error.message : "Error al registrar usuario"
        });
    }
};
exports.register = register;

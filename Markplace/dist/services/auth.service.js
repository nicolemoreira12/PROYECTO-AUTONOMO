"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const data_source_1 = require("../config/data-source");
const Usuario_1 = require("../entities/Usuario");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usuarioRepo = data_source_1.AppDataSource.getRepository(Usuario_1.Usuario);
// Clave secreta para JWT (en producción debería estar en .env)
const JWT_SECRET = "mi_clave_secreta_2024";
class AuthService {
    // Login
    async login(email, password) {
        // Buscar usuario por email
        const usuario = await usuarioRepo.findOne({ where: { email } });
        if (!usuario) {
            throw new Error("Usuario no encontrado");
        }
        // Verificar contraseña
        const passwordValida = await bcrypt_1.default.compare(password, usuario.contrasena);
        if (!passwordValida) {
            throw new Error("Contraseña incorrecta");
        }
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({
            idUsuario: usuario.idUsuario,
            email: usuario.email,
            rol: usuario.rol
        }, JWT_SECRET, { expiresIn: "24h" });
        return {
            token,
            usuario: {
                idUsuario: usuario.idUsuario,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol
            }
        };
    }
    // Registro
    async register(data) {
        // Verificar si el email ya existe
        const existeUsuario = await usuarioRepo.findOne({ where: { email: data.email } });
        if (existeUsuario) {
            throw new Error("El email ya está registrado");
        }
        // Hashear la contraseña
        if (data.contrasena) {
            data.contrasena = await bcrypt_1.default.hash(data.contrasena, 10);
        }
        // Establecer fecha de registro
        data.fechaRegistro = new Date();
        // Crear usuario
        const nuevoUsuario = usuarioRepo.create(data);
        const usuarioGuardado = await usuarioRepo.save(nuevoUsuario);
        // Generar token JWT
        const token = jsonwebtoken_1.default.sign({
            idUsuario: usuarioGuardado.idUsuario,
            email: usuarioGuardado.email,
            rol: usuarioGuardado.rol
        }, JWT_SECRET, { expiresIn: "24h" });
        return {
            token,
            usuario: {
                idUsuario: usuarioGuardado.idUsuario,
                nombre: usuarioGuardado.nombre,
                apellido: usuarioGuardado.apellido,
                email: usuarioGuardado.email,
                rol: usuarioGuardado.rol
            }
        };
    }
}
exports.AuthService = AuthService;

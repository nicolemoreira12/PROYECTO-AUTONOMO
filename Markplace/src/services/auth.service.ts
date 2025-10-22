import { AppDataSource } from "../config/data-source";
import { Usuario } from "../entities/Usuario";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const usuarioRepo = AppDataSource.getRepository(Usuario);

// Clave secreta para JWT (en producción debería estar en .env)
const JWT_SECRET = "mi_clave_secreta_2024";

export class AuthService {
  // Login
  async login(email: string, password: string) {
    // Buscar usuario por email
    const usuario = await usuarioRepo.findOne({ where: { email } });

    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.contrasena);

    if (!passwordValida) {
      throw new Error("Contraseña incorrecta");
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        idUsuario: usuario.idUsuario, 
        email: usuario.email,
        rol: usuario.rol 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

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
  async register(data: Partial<Usuario>) {
    // Verificar si el email ya existe
    const existeUsuario = await usuarioRepo.findOne({ where: { email: data.email } });

    if (existeUsuario) {
      throw new Error("El email ya está registrado");
    }

    // Hashear la contraseña
    if (data.contrasena) {
      data.contrasena = await bcrypt.hash(data.contrasena, 10);
    }

    // Establecer fecha de registro
    data.fechaRegistro = new Date();

    // Crear usuario
    const nuevoUsuario = usuarioRepo.create(data);
    const usuarioGuardado = await usuarioRepo.save(nuevoUsuario);

    // Generar token JWT
    const token = jwt.sign(
      { 
        idUsuario: usuarioGuardado.idUsuario, 
        email: usuarioGuardado.email,
        rol: usuarioGuardado.rol 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

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

import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller';
import {
  loginRateLimiter,
  registerRateLimiter,
  refreshRateLimiter,
  authMiddleware,
} from '../middlewares';

const router = Router();

// Validaciones para registro
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('El apellido es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isMobilePhone('any').withMessage('El teléfono no es válido'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'emprendedor']).withMessage('Rol no válido'),
];

// Validaciones para login
const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
];

// Validaciones para refresh
const refreshValidation = [
  body('refreshToken')
    .notEmpty().withMessage('El refresh token es requerido'),
];

// ==================== RUTAS ====================

/**
 * @route   POST /auth/register
 * @desc    Registrar un nuevo usuario
 * @access  Público
 */
router.post(
  '/register',
  registerRateLimiter,
  registerValidation,
  authController.register.bind(authController)
);

/**
 * @route   POST /auth/login
 * @desc    Iniciar sesión
 * @access  Público
 */
router.post(
  '/login',
  loginRateLimiter,
  loginValidation,
  authController.login.bind(authController)
);

/**
 * @route   POST /auth/logout
 * @desc    Cerrar sesión (revocar tokens)
 * @access  Público (con token)
 */
router.post(
  '/logout',
  authController.logout.bind(authController)
);

/**
 * @route   POST /auth/refresh
 * @desc    Renovar tokens usando refresh token
 * @access  Público
 */
router.post(
  '/refresh',
  refreshRateLimiter,
  refreshValidation,
  authController.refresh.bind(authController)
);

/**
 * @route   GET /auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Privado (requiere autenticación)
 */
router.get(
  '/me',
  authMiddleware,
  authController.getMe.bind(authController)
);

/**
 * @route   GET /auth/validate
 * @desc    Validar token (endpoint interno para otros servicios)
 * @access  Interno
 */
router.get(
  '/validate',
  authController.validate.bind(authController)
);

/**
 * @route   POST /auth/revoke-all
 * @desc    Revocar todas las sesiones del usuario
 * @access  Privado (requiere autenticación)
 */
router.post(
  '/revoke-all',
  authMiddleware,
  authController.revokeAllSessions.bind(authController)
);

export default router;

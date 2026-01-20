export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',

    // Productos
    PRODUCTOS: '/productos',
    PRODUCTO_BY_ID: (id: number) => `/productos/${id}`,
    SEARCH_PRODUCTOS: '/productos/search',

    // Categorias
    CATEGORIAS: '/categorias',
    CATEGORIA_BY_ID: (id: number) => `/categorias/${id}`,

    // Carrito
    CARRITO: '/carrito',
    CARRITO_ADD: '/carrito/items',
    CARRITO_UPDATE: (itemId: number) => `/carrito/items/${itemId}`,
    CARRITO_REMOVE: (itemId: number) => `/carrito/items/${itemId}`,

    // Ordenes
    ORDENES: '/ordenes',
    ORDEN_BY_ID: (id: number) => `/ordenes/${id}`,
    ORDENES_USUARIO: '/ordenes/usuario',

    // Reportes
    REPORTES_DIARIO: '/reportes/diario',
    REPORTES_SEMANAL: '/reportes/semanal',
    REPORTES_MENSUAL: '/reportes/mensual',
} as const;

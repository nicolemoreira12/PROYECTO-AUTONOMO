import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

// Proxy para redirigir las solicitudes al microservicio de IA
const aiServiceProxy = createProxyMiddleware({
    timeout: 120000, // 2 minutos de tiempo de espera
    proxyTimeout: 120000,
    target: 'http://localhost:6000', // URL base del AI Orchestrator
    changeOrigin: true,
    pathRewrite: {
        '^/api/ai': '/api/ai', // Reescribe la ruta para que coincida con el endpoint del microservicio
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log(`[API Gateway] Proxying request to AI Orchestrator: ${req.method} ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
        console.error('[API Gateway] Proxy error:', err);
        res.status(500).send('Proxy error');
    },
});

// Todas las solicitudes a /ai se redirigen al servicio de IA
router.use('/', aiServiceProxy);

export default router;

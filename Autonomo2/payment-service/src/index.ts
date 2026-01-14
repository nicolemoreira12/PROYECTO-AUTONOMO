import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar servicios y creadores de rutas
import { PartnerService } from './core/services/partner.service';
import { WebhookService } from './core/services/webhook.service';
import { PaymentService } from './core/services/payment.service';
import { createPaymentRoutes } from './routes/payment.routes';
import { createPartnerRoutes } from './routes/partner.routes';
import { createIncomingWebhookRoutes } from './routes/incoming-webhook.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Inicializar servicios (inyección de dependencias manual)
const partnerService = new PartnerService();
const webhookService = new WebhookService(partnerService);
const paymentService = new PaymentService(webhookService);

// Middlewares
app.use(cors());

// Middleware para parsear JSON, guardando el cuerpo crudo para la verificación de webhooks
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Rutas de la API
app.use('/api/payments', createPaymentRoutes(paymentService));
app.use('/api/partners', createPartnerRoutes(partnerService));
app.use('/api/webhooks', createIncomingWebhookRoutes(partnerService));

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'payment-service',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log('================================================');
  console.log(`💳 Payment Service iniciado en el puerto ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📞 Endpoints de Pagos: /api/payments`);
  console.log(`🤝 Endpoints de Partners: /api/partners`);
  console.log(`↧️ Endpoints de Webhooks Entrantes: /api/webhooks`);
  console.log('================================================');
});

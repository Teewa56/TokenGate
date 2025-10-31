import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PORT, RPC_URL, PROGRAM_ID, CORS_ORIGIN } from './config';
import { parseAuthHeaders } from './middleware/auth';
import routes from './routes';

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Wallet', 'X-Signature', 'X-Message'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(parseAuthHeaders);
app.use(routes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof Error) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error', message: err.message });
  } else {
    console.error('Unknown error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT_NUM = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
app.listen(PORT_NUM, '0.0.0.0', () => {
  console.log(`\n🚀 TokenGate Gateway started`);
  console.log(`📡 Listening on http://0.0.0.0:${PORT_NUM}`);
  console.log(`🔗 Solana RPC: ${RPC_URL}`);
  console.log(`📝 Program ID: ${PROGRAM_ID.toString()}`);
  console.log(`🌍 CORS Origin: ${CORS_ORIGIN}\n`);
});
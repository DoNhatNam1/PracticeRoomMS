import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  
  // Enable CORS for both HTTP and WebSocket
  app.enableCors({
    origin: true, // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  
// Cấu hình Socket.io
app.useWebSocketAdapter(
  new IoAdapter(app)
);

  // Rest of your bootstrap code
  await app.listen(3000);
}
bootstrap();

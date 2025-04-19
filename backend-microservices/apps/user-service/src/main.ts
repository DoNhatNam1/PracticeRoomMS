import { NestFactory } from '@nestjs/core';
import { UsersServiceAppModule } from './user-service-app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('UserService');
  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    UsersServiceAppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_URL || 'nats://localhost:4222'],
        queue: 'user_service_queue', // Cho phép load balancing
      },
    },
  );

  // Thêm graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach(signal => {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, gracefully shutting down...`);
      await app.close();
      process.exit(0);
    });
  });

  await app.listen();
  logger.log('User Service Microservice is running with NATS transport');
}
bootstrap();

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { INestApplication } from '@nestjs/common';

interface QueryEvent {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private retryAttempts = 5;
  private retryDelay = 2000;
  private healthCheckInterval: NodeJS.Timeout;

  constructor() {
    // Thêm URL params vào DATABASE_URL hoặc sử dụng trực tiếp trong code
    const connectionUrl = process.env.DATABASE_URL 
      ? `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes('?') ? '&' : '?'}connection_limit=3&pool_timeout=5`
      : null;
    
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
      datasources: {
        db: {
          url: connectionUrl || process.env.DATABASE_URL,
        },
      },
    });

    // Log queries in development
    if (process.env.NODE_ENV !== 'production') {
      (this as any).$on('query', (e: QueryEvent) => {
        this.logger.debug(`Query: ${e.query}`);
        this.logger.debug(`Duration: ${e.duration}ms`);
      });
    }
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await this.connectWithRetry();
    
    // Setup định kỳ health check mỗi 30 giây
    this.healthCheckInterval = setInterval(() => this.checkConnection(), 30000);
  }

  private async connectWithRetry(attempt = 1): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error) {
      if (attempt > this.retryAttempts) {
        this.logger.error(`Failed to connect to database after ${this.retryAttempts} attempts`);
        throw error;
      }
      
      // Exponential backoff với jitter để tránh nhiều service retry cùng lúc
      const jitter = Math.floor(Math.random() * 1000);
      const delay = Math.min(this.retryDelay * Math.pow(1.5, attempt-1), 15000) + jitter;
      
      this.logger.warn(`Failed to connect to database. Retrying (${attempt}/${this.retryAttempts}) in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      await this.connectWithRetry(attempt + 1);
    }
  }

  // Kiểm tra kết nối định kỳ
  private async checkConnection() {
    try {
      // Sử dụng query đơn giản để kiểm tra kết nối
      await this.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.warn(`Connection check failed: ${error.message}`);
      try {
        // Đóng kết nối hiện tại và thử kết nối lại
        await this.$disconnect();
        await this.connectWithRetry();
      } catch (reconnectError) {
        this.logger.error(`Failed to reconnect: ${reconnectError.message}`);
      }
    }
  }

  // Dọn dẹp các kết nối không sử dụng
  async cleanupIdleConnections(): Promise<void> {
    try {
      await this.$executeRaw`SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE datname = current_database() 
        AND pid <> pg_backend_pid() 
        AND state = 'idle' 
        AND state_change < current_timestamp - INTERVAL '20 minutes'`;
      this.logger.log('Cleaned up idle connections');
    } catch (error) {
      this.logger.warn(`Failed to clean idle connections: ${error.message}`);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    (this as any).$on('beforeExit', async () => {
      await app.close();
    });
  }

  async onModuleDestroy() {
    // Clear health check interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }

  // Cải tiến method xử lý transaction
  async executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    try {
      return await this.$transaction(fn, {
        maxWait: 5000,  // Giảm thời gian chờ xuống 5s
        timeout: 20000, // Giảm timeout xuống 20s
        isolationLevel: 'ReadCommitted',
      });
    } catch (error) {
      this.logger.error(`Transaction error: ${error.message}`);
      
      // Kiểm tra cụ thể hơn về các lỗi kết nối
      if (
        error.message.includes('Unable to start a transaction') ||
        error.message.includes('Connection pool') ||
        error.message.includes('Can\'t reach database server')
      ) {
        this.logger.warn('Database connection issue detected, cleaning up and reconnecting...');
        try {
          await this.$disconnect();
          // Đợi thêm một chút trước khi reconnect để tránh quá nhiều requests
          await new Promise(resolve => setTimeout(resolve, 1000));
          await this.cleanupIdleConnections();
          await this.$connect();
          this.logger.log('Successfully reconnected to database');
        } catch (reconnectError) {
          this.logger.error(`Failed to reconnect: ${reconnectError.message}`);
        }
      }
      throw error;
    }
  }
}
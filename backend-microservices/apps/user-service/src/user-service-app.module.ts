import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import * as Joi from 'joi';
import { ActivityLogUserModule } from './activity-log-user/activity-log-user.module';
import { ProfileModule } from './profile/profile.module';
import { NatsClientModule } from './nats-client/nats-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
    PrismaModule,
    AuthModule,
    NatsClientModule,
    UsersModule,
    ProfileModule,
    ActivityLogUserModule,
  ],
  controllers: [],
  providers: [],
})
export class UsersServiceAppModule {}

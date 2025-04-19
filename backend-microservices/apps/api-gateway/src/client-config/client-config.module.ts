import { Module } from "@nestjs/common";
import { ClientConfigService } from "./client-config.service";
import { ConfigModule } from "@nestjs/config";
import * as joi from "joi";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: joi.object({
        // Port configuration
        USER_CLIENT_PORT: joi.number().default(3001),
        COMPUTERS_CLIENT_PORT: joi.number().default(3003),
        ROOMS_CLIENT_PORT: joi.number().default(3002),
        
        // Host configuration
        USERS_CLIENT_HOST: joi.string().default('localhost'),
        COMPUTERS_CLIENT_HOST: joi.string().default('localhost'),
        ROOMS_CLIENT_HOST: joi.string().default('localhost'),
      }),
    }),
  ],
  providers: [ClientConfigService],
  exports: [ClientConfigService],
})
export class ClientConfigModule {}
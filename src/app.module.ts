import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { CatalogsModule } from './catalogs/catalogs.module';
import { CondominiumModule } from './condominium/condominium.module';
import { ApartmentModule } from './apartment/apartment.module';
import { PaymentsModule } from './payments/payments.module';
import { EventsModule } from './events/events.module';
import { MaintenanceFeesModule } from './maintenance_fees/maintenance_fees.module';
import { UsersModule } from './users/users.module';
import { AccountStatementModule } from './account-statement/account-statement.module';
import { ReportsModule } from './reports/reports.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        // Database
        MONGODB: Joi.string().required(),
        
        // Application
        PORT: Joi.number().default(3000),
        BCRYPT_SALT: Joi.number().default(10),
        HOST_FRONT: Joi.string().default('http://localhost:4200'),
        
        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
        
        // Email Verification
        IS_EMAIL_VERIFICATION_ENABLED: Joi.boolean().default(false),
        EMAIL_VERIFICATION_SECRET: Joi.string().required(),
        EMAIL_VERIFICATION_EXPIRES_IN: Joi.string().required(),
        EMAIL_VERIFICATION_URL: Joi.string().required(),
        EMAIL_VERIFICATION_SUBJECT: Joi.string().required(),
        EMAIL_VERIFICATION_SENDER: Joi.string().required(),
        EMAIL_VERIFICATION_TEST_ENABLED: Joi.boolean().default(false),
        EMAIL_VERIFICATION_TEST_EMAIL: Joi.string().when('EMAIL_VERIFICATION_TEST_ENABLED', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        EMAIL_VERIFICATION_TEST_NAME: Joi.string().when('EMAIL_VERIFICATION_TEST_ENABLED', {
          is: true,
          then: Joi.required(),
          otherwise: Joi.optional()
        }),
        
        // Password Reset
        RESET_PASSWORD_SECRET: Joi.string().required(),
        RESET_PASSWORD_URL: Joi.string().required(),
        
        // External Services
        MAILERSEND_API_KEY: Joi.string().required(),
      }),
    }),
    MongooseModule.forRoot(process.env.MONGODB),
    AuthModule, 
    CatalogsModule, 
    CondominiumModule, 
    ApartmentModule, 
    PaymentsModule, 
    EventsModule, 
    MaintenanceFeesModule, UsersModule,  AccountStatementModule, ReportsModule,    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

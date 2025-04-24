import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsuarioSchema } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,],
  imports:[
    ConfigModule,
    MongooseModule.forFeature([{
      name:User.name,
      schema: UsuarioSchema
    }]),

    PassportModule.register({
      defaultStrategy: 'jwt'
    }),

    JwtModule.registerAsync({
      imports:[ConfigModule],
      inject:[ConfigService],
      useFactory: (configService: ConfigService)=> {
        return {
          secret : configService.get('JWT_SECRET') ,
          signOptions:{            
            expiresIn: configService.get('JWT_EXPIRES_IN') //'2h'
          }
        }
      }
    })
  ],
  exports:[
    MongooseModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
  ]
})
export class AuthModule {}

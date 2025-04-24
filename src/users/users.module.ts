import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { ConfigModule } from '@nestjs/config';

import { PassportModule } from '@nestjs/passport';
import { User, UsuarioSchema } from 'src/auth/entities/user.entity';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
     MongooseModule.forFeature([
       { name: User.name, schema: UsuarioSchema },
     ]),
     ConfigModule,
     
     PassportModule.register({
       defaultStrategy: 'jwt',
     }),
    // AuthModule,
  ],
  exports: [UsersService]
})
export class UsersModule {}

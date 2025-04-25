import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { EventSchema } from './entities/event.entity';
import { CondominiumModule } from 'src/condominium/condominium.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  controllers: [EventsController],
  providers: [EventsService],
  imports: [
     MongooseModule.forFeature([
       {
         name: Event.name,
         schema: EventSchema
       }
     ]),
    CondominiumModule,
    PassportModule.register({
                  defaultStrategy: 'jwt'
                }),
     
  ],
})
export class EventsModule {}

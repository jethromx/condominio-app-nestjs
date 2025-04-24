import { Module } from '@nestjs/common';
import { MaintenanceFeesService } from './maintenance_fees.service';
import { MaintenanceFeesController } from './maintenance_fees.controller';

import { PassportModule } from '@nestjs/passport';
import { MaintenanceFee, MaintenanceFeeSchema } from './entities/maintenance_fee.entity';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { CondominiumModule } from 'src/condominium/condominium.module';
import { CommonService, CommonServiceSchema } from './entities/common_service.entity';
import { CommonServiceService } from './common_service.service';
import { CommonServiceController } from './common_service.controller';

@Module({
  controllers: [MaintenanceFeesController,CommonServiceController],
  providers: [MaintenanceFeesService,CommonServiceService],
  imports: [
    CondominiumModule,
     MongooseModule.forFeature([
       {
         name: MaintenanceFee.name,
         schema: MaintenanceFeeSchema
       },
       {
         name: CommonService.name,
         schema: CommonServiceSchema
       }
     ]),
     PassportModule.register({
       defaultStrategy: 'jwt'
     }),
  ],
  exports: [MaintenanceFeesService,CommonServiceService], // Exportar el servicio si se necesita en otros módulos
})
export class MaintenanceFeesModule {}

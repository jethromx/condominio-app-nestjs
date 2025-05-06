import { IsString, IsDateString, IsMongoId, IsOptional } from "class-validator";

export class CreatePaymentDto {

     @IsOptional()
     @IsString()
     idempotencyKey?: string;

     @IsOptional()
     @IsString()
     @IsMongoId()
     maintenanceFeeId?: string; // ID de la cuota de mantenimiento a la que se aplica el pago

     @IsOptional()
     @IsString()
     @IsMongoId()
     commonServiceId?: string; // ID de la cuota de mantenimiento a la que se aplica el pago
     
   
     
     @IsDateString()
     paymentDate: string; // Fecha en la que se realiza el pago
     
   
     
     @IsString()
     transactionId: string; // ID de la transacción asociada al pago

    
     @IsString()
     paymentMethod: string; // Método de pago utilizado (efectivo, transferencia, etc.)
     @IsString()
     paymentReference: string; // Referencia del pago (número de recibo, etc.)
     @IsString()
     status: string; // Estado del pago (ACTIVE, DELETED, cancelado)
     @IsString()
     currency: string; // Moneda del pago
     @IsString()
     amount: string; // Monto del pago
     //@IsString()
     //paymentType: string; // Tipo de pago (mantenimiento, extraordinaria, etc.)
     @IsString()
     paymentStatus: string; // Estado del pago (pendiente, confirmado, cancelado)
     //@IsString()
     //paymentMethodId: string; // ID del método de pago utilizado

}

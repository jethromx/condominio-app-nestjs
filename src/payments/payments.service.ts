import {  BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './entities/payment.entity';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { v4 as uuidv4 } from 'uuid';
import { ApartmentService } from 'src/apartment/apartment.service';
import { MaintenanceFeesService } from 'src/maintenance_fees/maintenance_fees.service';
import { DELETED, ID_NOT_VALID } from 'src/common/messages.const';
import { isValidUUIDv4 } from 'src/common/helpers/validateUUID';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private readonly CREATE_PAYMENT = 'CREATE_PAYMENT';
  private readonly UPDATE_PAYMENT = 'UPDATE_PAYMENT';
  private readonly DELETE_PAYMENT = 'DELETE_PAYMENT';
  private readonly FIND_ALL_PAYMENT = 'FIND_ALL_PAYMENT';
  private readonly FIND_PAYMENT_BY_ID = 'FIND_PAYMENT_BY_ID';

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,
    private readonly apartmentService: ApartmentService,
    private readonly maintenanceFeeService: MaintenanceFeesService,
  ){}


  async create(createPaymentDto: CreatePaymentDto,userId: string,idApartment: string,condominiumId: string) {
    this.logger.log(`${this.CREATE_PAYMENT} - IN`);

    this.validateId(userId);
    this.validateId(idApartment);
    this.validateId(condominiumId);

    // Verificar si el apartamento existe, si existe el condominio
    // y si el apartamento pertenece al condominio
    this.logger.debug(`${this.CREATE_PAYMENT} - Verificando si el condominio existe ${idApartment} - ${condominiumId}`);
   // await this.apartmentService.findOneByIdandIdCondominium(idApartment, condominiumId);
    await this.apartmentService.findOne(idApartment, condominiumId);
    
    await this.maintenanceFeeService.findOne(condominiumId,createPaymentDto.maintenanceFeeId);
    
    this.logger.debug(`${this.CREATE_PAYMENT} - Creando Pago ${idApartment} - ${condominiumId}`);
    // Crear el pago
    const payment = await this.paymentModel.create({
       _id: uuidv4(),
      ...createPaymentDto,
      apartmentId: idApartment, // Pasar el idApartment al documento
      userId, // Pasar el userId al documento
      createdBy: userId,
      updatedBy: userId,
    });
    payment.save();
    this.logger.log(`${this.CREATE_PAYMENT} - OUT`);
    return payment;
  }


  

  async findAll(paginationDto: PaginationDTO,idApartment: string,condominiumId: string) {
    this.logger.log(`${this.FIND_ALL_PAYMENT} - IN`);

    this.validateId(idApartment);
    this.validateId(condominiumId);

    const { page = 1, limit = 10 } = paginationDto;
    // Calcular el número de documentos a omitir
    const skip = (page - 1) * limit;

    const rootFilter = {
      apartmentId: idApartment,
      condominiumId: condominiumId,
      status: { $ne: DELETED }, // Filtrar por estado diferente a DELETED
    };

    // Obtener los pagos con paginación
    const payments = await this.paymentModel
      .find(rootFilter)
      .skip(skip)
      .limit(limit)
      .exec();

    // Contar el total de documentos
    const total = await this.paymentModel.countDocuments(rootFilter).exec();

    this.logger.log(`${this.FIND_ALL_PAYMENT} - OUT`);
    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

//9ea1c57d-403b-43e5-b810-448f1afbeb16

  async findOne(id: string,idApartment: string,condominiumId: string) {
    this.logger.log(`${this.FIND_PAYMENT_BY_ID} - IN`);

    this.validateId(id);
    this.validateId(idApartment);
    this.validateId(condominiumId);

    await this.apartmentService.findOneByIdandIdCondominium(idApartment, condominiumId);

    const payment = await this.paymentModel.findById(id).exec();

    if (!payment) {
      this.logger.error(`${this.FIND_PAYMENT_BY_ID} - Payment with ID "${id}" not found`);
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    this.logger.debug(`${this.FIND_PAYMENT_BY_ID} - OUT`);
    return payment;
  }



  async update(id: string, updatePaymentDto: UpdatePaymentDto,userId:string,idApartment: string,condominiumId: string) {
    this.logger.log(`${this.UPDATE_PAYMENT} - IN`);

    this.validateId(id);
    this.validateId(idApartment);
    this.validateId(condominiumId);
    this.validateId(userId);

    await this.apartmentService.findOneByIdandIdCondominium(idApartment, condominiumId);

    await this.findOne(id,idApartment,condominiumId);

    const payment = await this.paymentModel.findByIdAndUpdate(
      id,
      {
        ...updatePaymentDto,
        updatedBy: userId,
      },
      { new: true },
    ).exec();

    if (!payment) {
      this.logger.error(`${this.UPDATE_PAYMENT} - Payment with ID "${id}" not found`);  
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    this.logger.log(`${this.UPDATE_PAYMENT} - OUT`);
    return payment;
 
    
  }

  async remove(id: string,idApartment: string,condominiumId: string) {
    this.logger.log(`${this.DELETE_PAYMENT} - IN`);

    this.validateId(id);
    this.validateId(idApartment);
    this.validateId(condominiumId);

    await this.apartmentService.findOneByIdandIdCondominium(idApartment, condominiumId);

    // Verificar si el pago existe
   await this.findOne(id,idApartment,condominiumId);
   
  const payment = await this.paymentModel.findByIdAndUpdate(id, { status: DELETED });
      this.logger.debug(`${this.DELETE_PAYMENT} - OUT`);
      return payment;
  }


  private validateId(id: string) {
      if (!isValidUUIDv4(id)) {
        this.logger.error(ID_NOT_VALID(id));
        throw new BadRequestException(ID_NOT_VALID(id));
      }
    }
}

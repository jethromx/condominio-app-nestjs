import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Payment } from './entities/payment.entity';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { v4 as uuidv4 } from 'uuid';
import { ApartmentService } from 'src/apartment/apartment.service';
import { MaintenanceFeesService } from 'src/maintenance_fees/maintenance_fees.service';
import { ACTIVE, DELETED, ID_NOT_VALID } from 'src/common/messages.const';
import { isValidUUIDv4 } from 'src/common/helpers/validateUUID';
import { string } from 'joi';
import { Condominium } from 'src/condominium/entities/condominium.entity';
import { CondominiumService } from 'src/condominium/condominium.service';

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
    private readonly maintenanceFeeService: MaintenanceFeesService
  ) { }


  async create(createPaymentDto: CreatePaymentDto, userId: string, idApartment: string, condominiumId: string) {
    this.logger.log(`${this.CREATE_PAYMENT} - IN`);

    // this.validateId(userId);
    this.validateId(idApartment);
    this.validateId(condominiumId);

    // Verificar si el apartamento existe, si existe el condominio
    // y si el apartamento pertenece al condominio
    this.logger.debug(`${this.CREATE_PAYMENT} - Verificando si el condominio existe ${idApartment} - ${condominiumId}`);
    // await this.apartmentService.findOneByIdandIdCondominium(idApartment, condominiumId);
    await this.apartmentService.findOne(idApartment, condominiumId);

    await this.maintenanceFeeService.findOne(condominiumId, createPaymentDto.maintenanceFeeId);

    // Verificar idempotencia
    if (createPaymentDto.idempotencyKey) {
      const existingPayment = await this.paymentModel.findOne({ idempotencyKey: createPaymentDto.idempotencyKey }).exec();
      if (existingPayment) {
        this.logger.log(`${this.CREATE_PAYMENT} - Idempotent request, returning existing payment`);
        return existingPayment;
      }
    }


    this.logger.debug(`${this.CREATE_PAYMENT} - Creando Pago ${idApartment} - ${condominiumId}`);
    // Crear el pago
    const payment = await this.paymentModel.create({
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


  async findAllbyCondominiumMantenanceFee(condominiumId: string, maintenanceFeeId: string) {
    this.logger.log(`${this.FIND_ALL_PAYMENT} - IN`);
    this.validateId(condominiumId);
    this.validateId(maintenanceFeeId);

    const rootFilter = {
      maintenanceFeeId: maintenanceFeeId,
      status: { $eq: ACTIVE }, 
    };

    this.logger.debug(`${this.FIND_ALL_PAYMENT} -  ${JSON.stringify(rootFilter)}`);

    // Obtener los pagos con paginación
    const payments = await this.paymentModel
      .find(rootFilter)
      .populate({
        path: 'apartmentId', // Campo que referencia al modelo Apartment
        select: 'name description', // Campos que deseas incluir del modelo Apartment
      })
      .exec();

    this.logger.log(`${this.FIND_ALL_PAYMENT} - OUT`);
    return payments;
  }


  async findAll(paginationDto: PaginationDTO, idApartment: string, condominiumId: string) {
    this.logger.log(`${this.FIND_ALL_PAYMENT} - IN`);

    await this.apartmentService.findOneByIdandIdCondominium(idApartment, condominiumId);

    const { page = 1, limit = 10 } = paginationDto;
    // Calcular el número de documentos a omitir
    const skip = (page - 1) * limit;

    const rootFilter = {
      apartmentId: idApartment,
      status: { $ne: DELETED }, // Filtrar por estado diferente a DELETED
    };

    this.logger.debug(`${this.FIND_ALL_PAYMENT} -  ${JSON.stringify(rootFilter)}`);
    // Obtener los pagos con paginación
    const payments = await this.paymentModel
      .find(rootFilter)
      .populate({
        path: 'apartmentId', // Campo que referencia al modelo Apartment
        select: 'name description', // Campos que deseas incluir del modelo Apartment
      })
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



  async findOne(id: string, idApartment: string, condominiumId: string) {
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



  async update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string, idApartment: string, condominiumId: string) {
    this.logger.log(`${this.UPDATE_PAYMENT} - IN`);

    this.validateId(id);
    this.validateId(idApartment);
    this.validateId(condominiumId);
    this.validateId(userId);

    await this.apartmentService.findOneByIdandIdCondominium(idApartment, condominiumId);

    await this.findOne(id, idApartment, condominiumId);

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

  async remove(id: string, idApartment: string, condominiumId: string) {
    this.logger.log(`${this.DELETE_PAYMENT} - IN`);

    this.validateId(id);
    this.validateId(idApartment);
    this.validateId(condominiumId);

    await this.apartmentService.findOneByIdandIdCondominium(idApartment, condominiumId);

    // Verificar si el pago existe
    await this.findOne(id, idApartment, condominiumId);

    const payment = await this.paymentModel.findByIdAndUpdate(id, { status: DELETED });
    this.logger.debug(`${this.DELETE_PAYMENT} - OUT`);
    return payment;
  }


  private validateId(id: string) {
    if (!isValidObjectId(id)) {
      this.logger.error(ID_NOT_VALID(id));
      throw new BadRequestException(ID_NOT_VALID(id));
    }
  }
}

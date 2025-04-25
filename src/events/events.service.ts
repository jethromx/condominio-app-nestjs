import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CondominiumService } from 'src/condominium/condominium.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly CREATE_EVENT = 'CREATE_EVENT';
  private readonly UPDATE_EVENT = 'UPDATE_EVENT';
  private readonly DELETE_EVENT = 'DELETE_EVENT';
  private readonly FIND_ALL_EVENT = 'FIND_ALL_EVENT';
  private readonly FIND_EVENT_BY_ID = 'FIND_EVENT_BY_ID';


 constructor(
    @InjectModel(Event.name)
    private readonly eventModel: Model<Event>,
    private readonly condominiumService: CondominiumService,){}

  async create(createEventDto: CreateEventDto, userId: string) {
    this.logger.debug(`${this.CREATE_EVENT} - IN`);
    // Verificar si el condominio existe
    const condominium = this.condominiumService.findOne(createEventDto.condominiumId);
    if (!condominium) {
      this.logger.error(`${this.CREATE_EVENT} - Condominium with ID "${createEventDto.condominiumId}" does not exist`);
      throw new BadRequestException(`Condominium with ID ${createEventDto.condominiumId} does not exist`);
    }
    // Crear el evento
    const event = await this.eventModel.create({
      ...createEventDto,
      userId, // Pasar el userId al documento
      createdBy: userId,
      updatedBy: userId,
    });
    event.save();
    this.logger.debug(`${this.CREATE_EVENT} - OUT`);
    return event;
    
  }

  async findAll(page: number = 1, limit: number = 10) {
    this.logger.debug(`${this.FIND_ALL_EVENT} - IN`);

    // Calcular el número de documentos a omitir
    const skip = (page - 1) * limit;

    // Obtener los eventos con paginación
    const events = await this.eventModel
      .find()
      .skip(skip)
      .limit(limit)
      .exec();

    // Contar el total de documentos
    const total = await this.eventModel.countDocuments().exec();

    this.logger.debug(`${this.FIND_ALL_EVENT} - OUT`);
    return {
      data: events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
    
  }

  async findOne(id: string) {
    this.logger.debug(`${this.FIND_EVENT_BY_ID} - IN`);
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      this.logger.error(`${this.FIND_EVENT_BY_ID} - Event with ID "${id}" not found`);
      throw new BadRequestException(`Event with ID ${id} not found`);
    }
    this.logger.debug(`${this.FIND_EVENT_BY_ID} - OUT`);
    return event;

  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string) {
    this.logger.debug(`${this.UPDATE_EVENT} - IN`);
    // Verificar si el evento existe
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      this.logger.error(`${this.UPDATE_EVENT} - Event with ID "${id}" not found`);
      throw new BadRequestException(`Event with ID ${id} not found`);
    }
    // Actualizar el evento
    const updatedEvent = await this.eventModel.findByIdAndUpdate(id, {
      ...updateEventDto,
      userId, // Pasar el userId al documento
      updatedBy: userId,
    }, { new: true }).exec();
    this.logger.debug(`${this.UPDATE_EVENT} - OUT`);
    return updatedEvent;
  }

  async remove(id: string) {
    this.logger.debug(`${this.DELETE_EVENT} - IN`);
    // Verificar si el evento existe
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      this.logger.error(`${this.DELETE_EVENT} - Event with ID "${id}" not found`);
      throw new BadRequestException(`Event with ID ${id} not found`);
    }
    // Eliminar el evento
    await this.eventModel.findByIdAndDelete(id).exec();
    this.logger.debug(`${this.DELETE_EVENT} - OUT`);
    return { message: `Event with ID ${id} deleted successfully` };
  }
}

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserC } from './entities/user.entity';
import { Model } from 'mongoose';
import {  ERROR, ID_NOT_VALID, IN, OUT } from 'src/common/messages.const';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { handleQuery } from 'src/common/helpers/handleQuery.helper';
import { User } from 'src/auth/entities/user.entity';
import { isValidUUIDv4 } from 'src/common/helpers/validateUUID';


@Injectable()
export class UsersService {

  private readonly logger = new Logger(UsersService.name)
  private readonly CREATE_USER ='CREATE_USER'
  private readonly UPDATE_USER ='UPDATE_USER'
  private readonly DELETE_USER ='DELETE_USER'
  private readonly FIND_ALL_USER ='FIND_ALL_USER'
  private readonly FIND_USER_BY_ID ='FIND_USER_BY_ID'


   constructor(
      @InjectModel(User.name)
      private readonly userModel: Model<User>,
      private readonly configService: ConfigService,
   ){}



  async create(createUserDto: CreateUserDto, userId: string) {
    this.logger.log(`${this.CREATE_USER} - ${IN}`);

    this.validateId(userId);
    // Verificar duplicados por nombre y que se encuentre en estado activo
     const { password, email } = createUserDto;
    
      // Verificar si el usuario ya existe por email
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        this.logger.debug(`${this.CREATE_USER} - ${ERROR} - User already exists`);
        throw new BadRequestException(`User with email ${email} already exists`);
      }
      // Generar el hash de la contraseña
      const hashedPassword = this.generatePassword(password);

      const user = await this.userModel.create({
        _id: uuidv4(),
        ...createUserDto,
        password: hashedPassword,
        createdBy: userId,
        updatedBy: userId,
        isActive: true,
      });

      user.save();
      this.logger.log(`${this.CREATE_USER} - ${OUT}`);
      // Eliminar la contraseña del objeto de usuario
      const userWithoutPassword = this.userWithoutPassword(user);
      return { ...userWithoutPassword };
    
  } 
 
  async findAll(_query: any) {
    this.logger.log(`${this.FIND_ALL_USER} - ${IN}`);
    const { paginationDto, q } = handleQuery(_query);
    const { limit = 10, page = 0 } = paginationDto;
    
    // Calcular el número de documentos a omitir
    // para la paginación
    const skip = (page - 1) * limit;

    const rootFilter = {
      isActive: true,
    };

    try{

    const query = this.userModel.find(rootFilter);

      // Agregar la cláusula where si `q` existe
      if (q) {
        query.where(q);
      }

      // Ejecutar la consulta con paginación y orden
      const condominiums = await query
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() // Mejor rendimiento al devolver objetos planos
        .exec();

      const total = await this.userModel.countDocuments(rootFilter).exec();

      this.logger.log(`${this.FIND_ALL_USER} - ${OUT}`);
      return {
        data: condominiums,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`${this.FIND_ALL_USER} - Error: ${error.message}`);
      throw new BadRequestException('Error fetching condominiums');
    }
  }


  

  async findOne(id: string) {
    this.logger.log(`${this.FIND_USER_BY_ID} - ${IN}`);
    const user = await this.userModel.findById(id);
    if (!user) {
      this.logger.debug(`${this.FIND_USER_BY_ID} - ${ERROR} - User not found`);
      throw new BadRequestException(`User with id ${id} not found`);
    }
    this.logger.log(`${this.FIND_USER_BY_ID} - ${OUT}`);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, userId: string) {
    this.logger.log(`${this.UPDATE_USER} - ${IN}`);
    const { password, email } = updateUserDto;
    // Verificar si el usuario ya existe por email
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      this.logger.debug(`${this.UPDATE_USER} - ${ERROR} - User already exists`);
      throw new BadRequestException(`User with email ${email} already exists`);
    }
    // Generar el hash de la contraseña
    const hashedPassword = this.generatePassword(password);

    const user = await this.userModel.findByIdAndUpdate(
      id, {
      ...updateUserDto,
      updatedBy: userId,
      password: hashedPassword,
    }, { new: true });
    
    if (!user) {
      this.logger.debug(`${this.UPDATE_USER} - ${ERROR} - User not found`);
      throw new BadRequestException(`User with id ${id} not found`);
    }
    this.logger.log(`${this.UPDATE_USER} - ${OUT}`);
    return user;
  }

  async remove(id: string) {
    this.logger.log(`${this.DELETE_USER} - ${IN}`);
    const user = await this.userModel.findByIdAndUpdate(id, { status: false });
    if (!user) {
      this.logger.debug(`${this.DELETE_USER} - ${ERROR} - User not found`);
      throw new BadRequestException(`User with id ${id} not found`);
    }
    this.logger.log(`${this.DELETE_USER} - ${OUT}`);
    return user;
    
  }

  private generatePassword(password: string) {
      this.logger.log('generatePassword - IN');
      let bcryptSalt: number = parseInt(this.configService.get('BCRYPT_SALT'));
      this.logger.log('generatePassword - OUT');
      return bcrypt.hashSync(password, bcryptSalt);
  }

  private userWithoutPassword(user: any) {
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  private validateId(id: string) {
      if (!isValidUUIDv4(id)) {
        this.logger.error(ID_NOT_VALID(id));
        throw new BadRequestException(ID_NOT_VALID(id));
      }
    }
}

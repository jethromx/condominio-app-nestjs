import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ERROR, ID_NOT_VALID, IN, OUT } from 'src/common/messages.const';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { handleQuery } from 'src/common/helpers/handleQuery.helper';
import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class UsersService {

  private readonly logger = new Logger(UsersService.name)
  private readonly CREATE_USER = 'CREATE_USER'
  private readonly UPDATE_USER = 'UPDATE_USER'
  private readonly DELETE_USER = 'DELETE_USER'
  private readonly FIND_ALL_USER = 'FIND_ALL_USER'
  private readonly FIND_USER_BY_ID = 'FIND_USER_BY_ID'


  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
  ) { }



  async create(createUserDto: CreateUserDto, userId: string) {
    this.logger.log(`${this.CREATE_USER} - ${IN}`);

    this.validateId(userId);
    
    const { password, email } = createUserDto;

    // Verificar si el usuario ya existe por email
    const existingUser = await this.userModel.findOne({ email, isActive: true }).lean();
    if (existingUser) {
      this.logger.debug(`${this.CREATE_USER} - ${ERROR} - User already exists`);
      throw new BadRequestException(`User with email ${email} already exists`);
    }

    try {
      // Generar el hash de la contraseña
      const hashedPassword = await this.generatePassword(password);

      const user = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
        createdBy: userId,
        updatedBy: userId,
        isActive: true,
      });

      this.logger.log(`${this.CREATE_USER} - ${OUT}`);
      // Eliminar la contraseña del objeto de usuario
      return this.userWithoutPassword(user);

    } catch (error) {
      this.logger.error(`${this.CREATE_USER} - ${ERROR}: ${error.message}`);
      throw new BadRequestException('Error creating user');
    }
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

    try {

      const query = this.userModel.find(rootFilter);

      // Agregar la cláusula where si `q` existe
      if (q) {
        query.where(q);
      }

      // Ejecutar la consulta con paginación y orden
      const users = await query
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password -refreshToken') // Excluir campos sensibles
        .lean()
        .exec();

      const total = await this.userModel.countDocuments(rootFilter).exec();

      this.logger.log(`${this.FIND_ALL_USER} - ${OUT}`);
      return {
        data: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`${this.FIND_ALL_USER} - Error: ${error.message}`);
      throw new BadRequestException('Error fetching users');
    }
  }

  async findOne(id: string) {
    this.logger.log(`${this.FIND_USER_BY_ID} - ${IN}`);
    
    this.validateId(id);
    
    const user = await this.userModel
      .findOne({ _id: id, isActive: true })
      .select('-password -refreshToken')
      .lean();
      
    if (!user) {
      this.logger.debug(`${this.FIND_USER_BY_ID} - ${ERROR} - User not found`);
      throw new NotFoundException(`User with id ${id} not found`);
    }
    
    this.logger.log(`${this.FIND_USER_BY_ID} - ${OUT}`);
    return user;
  }



  async update(id: string, updateUserDto: UpdateUserDto, userId: string) {
    this.logger.log(`${this.UPDATE_USER} - ${IN}`);
    
    this.validateId(id);
    this.validateId(userId);

    // Verificar que el usuario existe
    const existingUser = await this.userModel.findOne({ _id: id, isActive: true });
    if (!existingUser) {
      this.logger.debug(`${this.UPDATE_USER} - ${ERROR} - User not found`);
      throw new NotFoundException(`User with id ${id} not found`);
    }

    // Si se está actualizando el email, verificar que no esté en uso por otro usuario
    if ('email' in updateUserDto && updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userModel.findOne({ 
        email: updateUserDto.email, 
        _id: { $ne: id },
        isActive: true 
      });
      
      if (emailExists) {
        this.logger.debug(`${this.UPDATE_USER} - ${ERROR} - Email already in use`);
        throw new BadRequestException(`Email ${updateUserDto.email} is already in use`);
      }
    }

    const updateData: any = {
      ...updateUserDto,
      updatedBy: userId,
    };

    // Solo hashear password si se está actualizando
    if ('password' in updateUserDto && updateUserDto.password) {
      updateData.password = await this.generatePassword(updateUserDto.password as string);
    }

    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, select: '-password -refreshToken' }
      );

      this.logger.log(`${this.UPDATE_USER} - ${OUT}`);
      return updatedUser;
    } catch (error) {
      this.logger.error(`${this.UPDATE_USER} - ${ERROR}: ${error.message}`);
      throw new BadRequestException('Error updating user');
    }
  }



  async remove(id: string) {
    this.logger.log(`${this.DELETE_USER} - ${IN}`);
    
    this.validateId(id);
    
    const user = await this.userModel.findByIdAndUpdate(
      id, 
      { isActive: false },
      { new: true, select: '-password -refreshToken' }
    );
    
    if (!user) {
      this.logger.debug(`${this.DELETE_USER} - ${ERROR} - User not found`);
      throw new NotFoundException(`User with id ${id} not found`);
    }
    
    this.logger.log(`${this.DELETE_USER} - ${OUT}`);
    return user;
  }



  private async generatePassword(password: string): Promise<string> {
    this.logger.log('generatePassword - IN');
    
    const bcryptSalt: number = parseInt(this.configService.get('BCRYPT_SALT')) || 10;
    
    try {
      const hashedPassword = await bcrypt.hash(password, bcryptSalt);
      this.logger.log('generatePassword - OUT');
      return hashedPassword;
    } catch (error) {
      this.logger.error(`generatePassword - Error: ${error.message}`);
      throw new BadRequestException('Error generating password hash');
    }
  }



  private userWithoutPassword(user: any) {
    if (!user) return null;
    
    // Si ya es un objeto JSON (lean query), usar destructuring
    if (typeof user.toJSON !== 'function') {
      const { password, refreshToken, ...userWithoutSensitiveData } = user;
      return userWithoutSensitiveData;
    }
    
    // Si es un documento de Mongoose, usar toJSON
    const { password, refreshToken, ...userWithoutSensitiveData } = user.toJSON();
    return userWithoutSensitiveData;
  }

  // Métodos de utilidad adicionales
  async findByEmail(email: string): Promise<User | null> {
    this.logger.log('findByEmail - IN');
    try {
      const user = await this.userModel
        .findOne({ email, isActive: true })
        .select('-password -refreshToken')
        .lean();
      this.logger.log('findByEmail - OUT');
      return user;
    } catch (error) {
      this.logger.error(`findByEmail - Error: ${error.message}`);
      return null;
    }
  }

  async exists(id: string): Promise<boolean> {
    this.logger.log('exists - IN');
    this.validateId(id);
    try {
      const exists = await this.userModel.exists({ _id: id, isActive: true });
      this.logger.log('exists - OUT');
      return !!exists;
    } catch (error) {
      this.logger.error(`exists - Error: ${error.message}`);
      return false;
    }
  }

  async countActiveUsers(): Promise<number> {
    this.logger.log('countActiveUsers - IN');
    try {
      const count = await this.userModel.countDocuments({ isActive: true });
      this.logger.log('countActiveUsers - OUT');
      return count;
    } catch (error) {
      this.logger.error(`countActiveUsers - Error: ${error.message}`);
      return 0;
    }
  }

  async bulkDeactivate(ids: string[]): Promise<{ modifiedCount: number }> {
    this.logger.log('bulkDeactivate - IN');
    
    // Validar todos los IDs
    ids.forEach(id => this.validateId(id));
    
    try {
      const result = await this.userModel.updateMany(
        { _id: { $in: ids }, isActive: true },
        { isActive: false }
      );
      
      this.logger.log('bulkDeactivate - OUT');
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      this.logger.error(`bulkDeactivate - Error: ${error.message}`);
      throw new BadRequestException('Error deactivating users');
    }
  }

  private validateId(id: string) {
    if (!isValidObjectId(id)) {
      this.logger.error(ID_NOT_VALID(id));
      throw new BadRequestException(ID_NOT_VALID(id));
    }
  }
}
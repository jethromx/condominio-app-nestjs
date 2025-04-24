import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { CREDENTIAL_NOT_VALID, EMAIL_NOT_VERIFIED, USER_INACTIVE, USER_NOT_EXIST } from 'src/common/messages.const';
import { handleExceptions } from 'src/common/helpers/handleError.helper';
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private isEmailVerificationEnabled: boolean = false;

 

  private readonly IN = 'IN';
  private readonly OUT = 'OUT';
  private readonly ERROR = 'ERROR';
  private readonly CREATE_USER = 'CREATE_USER';
  private readonly LOGIN_USER = 'LOGIN_USER';
  private readonly VALIDATE_USER = 'VALIDATE_USER';
  private readonly IS_EMAIL_VERIFICATION_ENABLED = 'IS_EMAIL_VERIFICATION_ENABLED';

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) { }


  async createUser(createUserDto: CreateUserDto) {

    this.logger.debug(`${this.CREATE_USER} - ${this.IN}`);
    try {

      const { password, email } = createUserDto;

      // Verificar si el usuario ya existe por email
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        this.logger.debug(`${this.CREATE_USER} - ${this.ERROR} - User already exists`);
        throw new BadRequestException(`User with email ${email} already exists`);
      }

      // Si la validación de email está habilitada, se establece isActive en false     
      this.isEmailVerificationEnabled = this.configService.get<string>(this.IS_EMAIL_VERIFICATION_ENABLED, { infer: true }) === 'true';

      // Generar el hash de la contraseña
      const hashedPassword = this.generatePassword(password);

      const user = await this.userModel.create({
        _id: uuidv4(),
        ...createUserDto,
        password: hashedPassword,
        isActive: !this.isEmailVerificationEnabled,
      });

      // Eliminar la contraseña del objeto de usuario
      const userWithoutPassword = this.userWithoutPassword(user);

      if (this.isEmailVerificationEnabled) {
        // Enviar el correo de verificación
        await this.sendEmailVerification(user);
      } else {
        // Generar el token de acceso y refresh      
        const { accessToken, refreshToken } = this.generateTokens(user);
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        await user.save();

        this.logger.debug(`${this.CREATE_USER} - ${this.OUT}`);
        // Retornar el usuario sin la contraseña y los tokens (caso de que no se requiera verificación de email)
        return { ...userWithoutPassword, accessToken, refreshToken };
      }
      // Retornar el usuario sin la contraseña
      this.logger.debug(`${this.CREATE_USER} - ${this.OUT}`);
      return { ...userWithoutPassword };

    } catch (error) {
      this.logger.debug(`${this.CREATE_USER} - ${this.ERROR}`, { error: error });
      handleExceptions(error);
    }

  }


  async login(loginUserDto: LoginUserDto) {
    this.logger.debug(`${this.LOGIN_USER} - ${this.IN}`);

    try {
     
      const { password, email } = loginUserDto;
      const user = await this.userModel.findOne().where({ email }).select('+password');

      // Validaciones de usuario
      this.validateUser(user, password);

      const userWithoutPassword = this.userWithoutPassword(user);

      // Generar el token de acceso y refresh      
      const { accessToken, refreshToken } = this.generateTokens(user);
      user.accessToken = accessToken;
      user.refreshToken = refreshToken;
      // Guardar el refresh token en la base de datos
      await user.save();

      this.logger.debug(`${this.LOGIN_USER} - ${this.OUT}`);
      // Retornar el usuario sin la contraseña y los tokens
      return { ...userWithoutPassword, accessToken, refreshToken };
    } catch (error) {
      this.logger.debug(`${this.LOGIN_USER} - ${this.ERROR}`, { error: error });
      handleExceptions(error);
    }


  }





  async verifyEmailFromToken(token: string) {
    this.logger.debug('Verifying email token - IN');

    const payload = this.jwtService.verify(token, {
      secret: this.configService.get('EMAIL_VERIFICATION_SECRET'),
    });


    // Verificar si el token es válido
    const user = await this.userModel.findOne({ email: payload.email });

    if (!user) {
      throw new BadRequestException('Invalid token');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    user.isEmailVerified = true;
    user.isActive = true; // Activar el usuario
    await user.save();
    this.logger.debug('Verifying email token - OUT');

    return { message: 'Email verified successfully', statusCode: 200 };


  }

  async sendEmailVerification(user: User) {
    this.logger.debug('sendEmailVerification - IN');
    const mailerSend = new MailerSend({
      apiKey: this.configService.get('MAILERSEND_API_KEY'),
    });
    const isEmailVerificationEnabled = this.configService.get<string>('EMAIL_VERIFICATION_TEST_ENABLED', { infer: true }) === 'true';

    const sender = this.configService.get('EMAIL_VERIFICATION_SENDER');
    const subject = this.configService.get('EMAIL_VERIFICATION_SUBJECT');
    const sentFrom = new Sender(sender, subject);


    const recipients = [
      isEmailVerificationEnabled ? new Recipient(this.configService.get('EMAIL_VERIFICATION_TEST_EMAIL'), this.configService.get('EMAIL_VERIFICATION_TEST_NAME'))
        : new Recipient(user.email, user.fullName),
    ];

    // Generar el token de validación
    const token = this.generateTokenToEmailVerification(user);

    // URL de verificación
    const verificationUrl = `${this.configService.get('EMAIL_VERIFICATION_URL')}?token=${token}`;

    // Plantilla HTML mejorada
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Welcome to Our Service, ${user.fullName}!</h2>
        <p>Thank you for signing up. Please verify your email address to activate your account.</p>
        <p>
          <a href="${verificationUrl}" 
            style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </p>
        <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
        <p style="word-break: break-word;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #777;">If you did not sign up for this account, you can safely ignore this email.</p>
      </div>
    `;

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Verify your email address')
      .setHtml(htmlTemplate)
      // .setText(`Click the following link to verify your email: ${verificationUrl}`);      
      .setText(`Welcome to Our Service, ${user.fullName}!\n\nPlease verify your email address by clicking the link below:\n\n${verificationUrl}\n\nIf you did not sign up for this account, you can safely ignore this email.`);

    try {
      await mailerSend.email.send(emailParams);
      this.logger.debug('Verification email sent successfully');
    } catch (error) {
      this.logger.error('Error sending email', error);
    }
    this.logger.debug('Email sent successfully');

  }

  async resendVerificationEmail(email: string) {
    this.logger.debug('Resending verification email - IN');

    // Verificar si el usuario existe
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException(`User with email ${email} does not exist`);
    }

    // Verificar si el usuario ya ha verificado su correo
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Enviar el correo de verificación
    await this.sendEmailVerification(user);

    this.logger.debug('Resending verification email - OUT');
    return { message: 'Verification email resent successfully' };
  }

  async forgotPassword(email: string) {
    this.logger.debug('Forgot password - IN');

    // Verificar si el usuario existe
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException(`User with email ${email} does not exist`);
    }

    // Generar un token de restablecimiento de contraseña
    const resetToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        secret: this.configService.get('RESET_PASSWORD_SECRET'),
        expiresIn: '1h', // El token expira en 1 hora
      },
    );

    // URL de restablecimiento
    const resetUrl = `${this.configService.get('RESET_PASSWORD_URL')}?token=${resetToken}`;

    // Enviar correo con el enlace de restablecimiento
    const htmlTemplate = `
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    const isEmailVerificationEnabled = this.configService.get<string>('EMAIL_VERIFICATION_TEST_ENABLED', { infer: true }) === 'true';

    const sender = this.configService.get('EMAIL_VERIFICATION_SENDER');
    const subject = this.configService.get('EMAIL_VERIFICATION_SUBJECT');
    const sentFrom = new Sender(sender, subject);
    const recipients = [
      isEmailVerificationEnabled ? new Recipient(this.configService.get('EMAIL_VERIFICATION_TEST_EMAIL'), this.configService.get('EMAIL_VERIFICATION_TEST_NAME'))
        : new Recipient(user.email, user.fullName),
    ];


    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject('Reset your password')
      .setHtml(htmlTemplate);

    try {
      const mailerSend = new MailerSend({
        apiKey: this.configService.get('MAILERSEND_API_KEY'),
      });
      await mailerSend.email.send(emailParams);
      this.logger.debug('Reset password email sent successfully');
    } catch (error) {
      this.logger.error('Error sending reset password email', error);
      throw new InternalServerErrorException('Failed to send reset password email');
    }

    this.logger.debug('Forgot password - OUT');
    return { message: 'Reset password email sent successfully' };
  }

  async resetPassword(token: string, newPassword: string) {
    this.logger.debug('Reset password - IN');

    try {
      // Verificar el token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('RESET_PASSWORD_SECRET'),
      });

      // Buscar al usuario por ID
      const user = await this.userModel.findById(payload.id);
      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      // Actualizar la contraseña
      user.password = this.generatePassword(newPassword);
      await user.save();

      this.logger.debug('Reset password - OUT');
      return { message: 'Password reset successfully' };
    } catch (error) {
      this.logger.error('Error resetting password', error);
      throw new BadRequestException('Invalid or expired token');
    }
  }


  async changePassword(userId: string, currentPassword: string, newPassword: string) {

    this.logger.debug('changePassword - IN');

    const user = await this.userModel.findById(userId).select('+password');
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!this.comparePassword(currentPassword, user.password)) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = this.generatePassword(newPassword);
    await user.save();

    this.logger.debug('changePassword - OUT');
    return { message: 'Password updated successfully' };
  }


  async refreshTokens(refreshToken: string) {
    this.logger.debug('refreshTokens - IN');
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userModel.findById(payload.id).select('+refreshToken');

      if (!user && user.refreshToken !== refreshToken) {
        this.logger.error('Invalid refresh token');
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = this.generateTokens(user);
      user.refreshToken = tokens.refreshToken;
      user.accessToken = tokens.accessToken;
      await user.save();

      this.logger.debug('refreshTokens - OUT');
      return tokens;
    } catch (error) {
      this.logger.error('refreshTokens - Error' + error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async changePasswordAsSuperUser(userId: string, newPassword: string): Promise<any> {
    this.logger.debug('changePasswordAsSuperUser - IN');
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.password = await this.generatePassword(newPassword);
    delete user.refreshToken;// = null; // Limpiar el refresh token
    delete user.accessToken;// = null; // Limpiar el access token
    await user.save();


    this.logger.debug('changePasswordAsSuperUser - OUT');
    return { message: 'Password updated successfully' };
  }

  private generateTokenToEmailVerification(user: User): string {
    this.logger.debug('generateTokenToEmailVerification - IN');

    const payload = { id: user._id, email: user.email };

    this.logger.debug('generateTokenToEmailVerification - OUT');
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('EMAIL_VERIFICATION_EXPIRES_IN'), // El token expira en 1 hora
      secret: this.configService.get('EMAIL_VERIFICATION_SECRET'), // Usa una clave secreta específica para validación de correo
    });
  }


  private generateTokens(user: User) {
    this.logger.debug('generateTokens - IN');
    const payload: JwtPayload = { id: user._id, fullName: user.fullName, email: user.email };

    const expiresIn = this.configService.get('JWT_EXPIRES_IN');
    const expiresRefreshIn = this.configService.get('JWT_REFRESH_EXPIRES_IN');

    const accessToken = this.jwtService.sign(payload, { expiresIn: expiresIn });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: expiresRefreshIn });

    this.logger.debug('generateTokens - OUT');
    return { accessToken, refreshToken };
  }

  private userWithoutPassword(user: any) {
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  private generatePassword(password: string) {
    this.logger.debug('generatePassword - IN');
    let bcryptSalt: number = parseInt(this.configService.get('BCRYPT_SALT'));
    this.logger.debug('generatePassword - OUT');
    return bcrypt.hashSync(password, bcryptSalt);
  }

  private comparePassword(password: string, hashedPassword: string) {
    return bcrypt.compareSync(password, hashedPassword);
  }

  private validateUser(user: User, password: string) {
    this.logger.debug(`${this.VALIDATE_USER} - ${this.IN}`);

    // Valida si el usuario existe
    if (!user) throw new UnauthorizedException(USER_NOT_EXIST());

    // Valida si el usuario está activo
    if (!user.isActive) throw new UnauthorizedException(USER_INACTIVE());

    // Si la validación de email está habilitada, se establece isActive en false     
    this.isEmailVerificationEnabled = this.configService.get<string>('IS_EMAIL_VERIFICATION_ENABLED', { infer: true }) === 'true';

    if (this.isEmailVerificationEnabled && !user.isEmailVerified) {
      this.logger.debug(`${this.VALIDATE_USER} - Email verification is enabled`);
      throw new UnauthorizedException(EMAIL_NOT_VERIFIED());
    }

    // Valida si la contraseña es correcta
    if (!this.comparePassword(password, user.password)) throw new UnauthorizedException(CREDENTIAL_NOT_VALID())

    this.logger.debug(`${this.VALIDATE_USER} - ${this.OUT}`);

  }


}

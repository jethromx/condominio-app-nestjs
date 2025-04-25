import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { TOKEN_NOT_VALID, USER_INACTIVE } from 'src/common/messages.const';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
   
    const { id } = payload;

    const user = await this.userModel.findById({ _id: id });
    if(!user ) throw new UnauthorizedException(TOKEN_NOT_VALID());   

    if(!user.isActive ) throw new UnauthorizedException(USER_INACTIVE());        

    return user;
    
  }
}

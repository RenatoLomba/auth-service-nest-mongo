import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { EncryptorProvider } from '../../providers/encryptor.provider';
import { HashProvider } from '../../providers/hash.provider';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { GenerateJwtHandler } from './handlers/generate-jwt.handler';
import { RefreshHandler } from './handlers/refresh.handler';
import { SignInHandler } from './handlers/signin.handler';
import { SignUpHandler } from './handlers/signup.handler';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    RefreshTokenModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        return {
          secret: jwtSecret,
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    HashProvider,
    SignUpHandler,
    SignInHandler,
    RefreshHandler,
    EncryptorProvider,
    GenerateJwtHandler,
  ],
})
export class AuthModule {}

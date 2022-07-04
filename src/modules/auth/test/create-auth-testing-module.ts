import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { IMongoDbMock } from '../../../../test/utils/mongodb.mock';
import { EncryptorProvider } from '../../../providers/encryptor.provider';
import { HashProvider } from '../../../providers/hash.provider';
import { CreateRefreshTokenHandler } from '../../refresh-token/handlers/create-refresh-token.handler';
import { DeleteUserRefreshTokensHandler } from '../../refresh-token/handlers/delete-user-refresh-tokens.handler';
import { FindTokenHandler } from '../../refresh-token/handlers/find-token.handler';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../../refresh-token/schemas/refresh-token.schema';
import { CreateUserHandler } from '../../user/handlers/create-user.handler';
import { FindUserByEmailHandler } from '../../user/handlers/find-user-by-email.handler';
import { User, UserSchema } from '../../user/schemas/user.schema';
import { GenerateJwtHandler } from '../handlers/generate-jwt.handler';
import { RefreshHandler } from '../handlers/refresh.handler';
import { SignInHandler } from '../handlers/signin.handler';
import { SignUpHandler } from '../handlers/signup.handler';

export const createAuthTestingModule = async (
  mongoDbMock: IMongoDbMock,
): Promise<TestingModule> => {
  const userModel = mongoDbMock.mongoConnection.model(User.name, UserSchema);
  const refreshTokenModel = mongoDbMock.mongoConnection.model(
    RefreshToken.name,
    RefreshTokenSchema,
  );

  const app = await Test.createTestingModule({
    providers: [
      SignInHandler,
      SignUpHandler,
      FindUserByEmailHandler,
      GenerateJwtHandler,
      CreateUserHandler,
      CreateRefreshTokenHandler,
      DeleteUserRefreshTokensHandler,
      FindTokenHandler,
      RefreshHandler,
      HashProvider,
      EncryptorProvider,
      {
        provide: JwtService,
        useValue: new JwtService({
          secret: faker.random.alphaNumeric(10),
        }),
      },
      {
        provide: getModelToken(User.name),
        useValue: userModel,
      },
      {
        provide: getModelToken(RefreshToken.name),
        useValue: refreshTokenModel,
      },
    ],
  }).compile();

  return app;
};

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { EncryptorProvider } from '../../providers/encryptor.provider';
import { CreateRefreshTokenHandler } from './handlers/create-refresh-token.handler';
import { DeleteUserRefreshTokensHandler } from './handlers/delete-user-refresh-tokens.handler';
import { FindTokenHandler } from './handlers/find-token.handler';
import {
  RefreshToken,
  RefreshTokenSchema,
} from './schemas/refresh-token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  providers: [
    FindTokenHandler,
    EncryptorProvider,
    CreateRefreshTokenHandler,
    DeleteUserRefreshTokensHandler,
  ],
  exports: [
    FindTokenHandler,
    CreateRefreshTokenHandler,
    DeleteUserRefreshTokensHandler,
  ],
})
export class RefreshTokenModule {}

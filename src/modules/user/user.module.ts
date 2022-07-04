import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HashProvider } from '../../providers/hash.provider';
import { CreateUserHandler } from './handlers/create-user.handler';
import { FindUserByEmailHandler } from './handlers/find-user-by-email.handler';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  exports: [CreateUserHandler, FindUserByEmailHandler],
  providers: [HashProvider, CreateUserHandler, FindUserByEmailHandler],
})
export class UserModule {}

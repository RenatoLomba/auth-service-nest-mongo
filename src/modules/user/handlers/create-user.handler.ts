import { Model } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Result } from '../../../core/common/application-result/result';
import { ResultError } from '../../../core/common/application-result/result-error';
import { ResultErrorTypes } from '../../../core/common/application-result/result-error-types';
import { ResultStatus } from '../../../core/common/application-result/result-status';
import { ResultSuccess } from '../../../core/common/application-result/result-success';
import { HashProvider } from '../../../providers/hash.provider';
import { ICreateUserDto } from '../dtos/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import { User, UserDocument } from '../schemas/user.schema';
import { FindUserByEmailHandler } from './find-user-by-email.handler';

@Injectable()
export class CreateUserHandler {
  private readonly logger = new Logger();

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly findUserByEmailHandler: FindUserByEmailHandler,
    private readonly hashProvider: HashProvider,
  ) {}

  /**
   * Possible ReturnError errorTypes:
   * - UNIQUE_DUPLICATE_ENTRY
   * - DATABASE_ERROR
   */
  async execute(createUserDto: ICreateUserDto): Promise<Result<UserEntity>> {
    this.logger.log('CreateUserHandler: Init', { createUserDto });

    try {
      const findUserByEmailResult = await this.findUserByEmailHandler.execute(
        createUserDto.email,
      );

      if (findUserByEmailResult.status === ResultStatus.SUCCESS) {
        return new ResultError(
          ResultErrorTypes.UNIQUE_DUPLICATE_ENTRY,
          `User with ${createUserDto.email} email already exists`,
        );
      }

      if (findUserByEmailResult.errorType === ResultErrorTypes.DATABASE_ERROR) {
        return findUserByEmailResult;
      }

      const hashedPassword = await this.hashProvider.toHash(
        createUserDto.password,
      );

      const user = await this.userModel.create({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      });
      await user.save();

      this.logger.log('CreateUserHandler: User saved', { user });

      const userEntity = new UserEntity(user);

      return new ResultSuccess(userEntity);
    } catch (err) {
      this.logger.error('CreateUserHandler: Database error', err);

      return new ResultError(ResultErrorTypes.DATABASE_ERROR, err.message);
    }
  }
}

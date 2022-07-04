import { Model } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Result } from '../../../core/common/application-result/result';
import { ResultError } from '../../../core/common/application-result/result-error';
import { ResultErrorTypes } from '../../../core/common/application-result/result-error-types';
import { ResultSuccess } from '../../../core/common/application-result/result-success';
import { UserEntity } from '../entities/user.entity';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class FindUserByEmailHandler {
  private readonly logger = new Logger();

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * Possible ReturnError errorTypes:
   * - ENTRY_NOT_FOUND
   * - DATABASE_ERROR
   */
  async execute(email: string): Promise<Result<UserEntity>> {
    this.logger.log('FindUserByEmailHandler: Init', { email });

    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        return new ResultError(
          ResultErrorTypes.ENTRY_NOT_FOUND,
          `User with ${email} email not found`,
        );
      }

      const userEntity = new UserEntity(user);

      return new ResultSuccess(userEntity);
    } catch (err) {
      this.logger.error('FindUserByEmailHandler: Database error', err);

      return new ResultError(ResultErrorTypes.DATABASE_ERROR, err.message);
    }
  }
}

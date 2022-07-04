import { Model } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Result } from '../../../core/common/application-result/result';
import { ResultError } from '../../../core/common/application-result/result-error';
import { ResultErrorTypes } from '../../../core/common/application-result/result-error-types';
import { ResultSuccess } from '../../../core/common/application-result/result-success';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';

@Injectable()
export class DeleteUserRefreshTokensHandler {
  private readonly logger = new Logger();

  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  /**
   * Possible ReturnError errorTypes:
   * - DATABASE_ERROR
   */
  async execute(user_id: string): Promise<Result> {
    this.logger.log('DeleteUserRefreshTokens: Init', { user_id });

    try {
      await this.refreshTokenModel.deleteMany({ user_id });

      return new ResultSuccess();
    } catch (err) {
      this.logger.error('DeleteUserRefreshTokens: Database error', err);

      return new ResultError(ResultErrorTypes.DATABASE_ERROR, err.message);
    }
  }
}

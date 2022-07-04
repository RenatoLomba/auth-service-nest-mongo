import { Model } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Result } from '../../../core/common/application-result/result';
import { ResultError } from '../../../core/common/application-result/result-error';
import { ResultErrorTypes } from '../../../core/common/application-result/result-error-types';
import { ResultSuccess } from '../../../core/common/application-result/result-success';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';

@Injectable()
export class FindTokenHandler {
  private readonly logger = new Logger();

  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  /**
   * Possible ReturnError errorTypes:
   * - DATABASE_ERROR
   * - ENTRY_NOT_FOUND
   */
  async execute(token: string): Promise<Result<RefreshTokenEntity>> {
    this.logger.log('FindTokenHandler: init', { token });

    try {
      const refreshToken = await this.refreshTokenModel.findOne({ token });

      if (!refreshToken) {
        return new ResultError(
          ResultErrorTypes.ENTRY_NOT_FOUND,
          `Invalid token`,
        );
      }

      const refreshTokenEntity = new RefreshTokenEntity(refreshToken);

      return new ResultSuccess(refreshTokenEntity);
    } catch (err) {
      this.logger.error('FindTokenHandler: Database error', err);

      return new ResultError(ResultErrorTypes.DATABASE_ERROR, err.message);
    }
  }
}

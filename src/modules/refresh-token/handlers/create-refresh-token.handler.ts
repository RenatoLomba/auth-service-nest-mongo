import { addHours } from 'date-fns';
import { Model } from 'mongoose';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Result } from '../../../core/common/application-result/result';
import { ResultError } from '../../../core/common/application-result/result-error';
import { ResultErrorTypes } from '../../../core/common/application-result/result-error-types';
import { ResultSuccess } from '../../../core/common/application-result/result-success';
import { EncryptorProvider } from '../../../providers/encryptor.provider';
import { ICreateRefreshTokenDto } from '../dtos/create-refresh-token.dto';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import {
  RefreshToken,
  RefreshTokenDocument,
} from '../schemas/refresh-token.schema';

@Injectable()
export class CreateRefreshTokenHandler {
  private readonly logger = new Logger();

  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly encryptorProvider: EncryptorProvider,
  ) {}

  /**
   * Possible ReturnError errorTypes:
   * - DATABASE_ERROR
   */
  async execute(
    dto: ICreateRefreshTokenDto,
  ): Promise<Result<RefreshTokenEntity>> {
    this.logger.log('CreateRefreshTokenHandler: Init', {
      createRefreshTokenDto: dto,
    });

    const token = this.encryptorProvider.crypt(dto.user_email);

    const expires_at = addHours(new Date(), 24);

    try {
      const refreshToken = await this.refreshTokenModel.create({
        token,
        user_id: dto.user_id,
        expires_at,
      });
      await refreshToken.save();

      this.logger.log('CreateRefreshTokenHandler: Refresh token saved', {
        refreshToken,
      });

      const refreshTokenEntity = new RefreshTokenEntity(refreshToken);

      return new ResultSuccess(refreshTokenEntity);
    } catch (err) {
      this.logger.error('CreateRefreshTokenHandler: Database error', err);

      return new ResultError(ResultErrorTypes.DATABASE_ERROR, err.message);
    }
  }
}

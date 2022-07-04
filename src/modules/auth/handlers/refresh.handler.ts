import { isAfter } from 'date-fns';

import { Injectable, Logger } from '@nestjs/common';

import { Result } from '../../../core/common/application-result/result';
import { ResultError } from '../../../core/common/application-result/result-error';
import { ResultErrorTypes } from '../../../core/common/application-result/result-error-types';
import { ResultStatus } from '../../../core/common/application-result/result-status';
import { ResultSuccess } from '../../../core/common/application-result/result-success';
import { EncryptorProvider } from '../../../providers/encryptor.provider';
import { CreateRefreshTokenHandler } from '../../refresh-token/handlers/create-refresh-token.handler';
import { DeleteUserRefreshTokensHandler } from '../../refresh-token/handlers/delete-user-refresh-tokens.handler';
import { FindTokenHandler } from '../../refresh-token/handlers/find-token.handler';
import { FindUserByEmailHandler } from '../../user/handlers/find-user-by-email.handler';
import { AuthRefreshEntity } from '../entities/auth-refresh.entity';
import { GenerateJwtHandler } from './generate-jwt.handler';

@Injectable()
export class RefreshHandler {
  private readonly logger = new Logger();

  constructor(
    private readonly findTokenHandler: FindTokenHandler,
    private readonly encryptorProvider: EncryptorProvider,
    private readonly findUserByEmailHandler: FindUserByEmailHandler,
    private readonly generateJwt: GenerateJwtHandler,
    private readonly deleteUserRefreshTokensHandler: DeleteUserRefreshTokensHandler,
    private readonly createRefreshTokenHandler: CreateRefreshTokenHandler,
  ) {}

  async execute(refresh_token: string): Promise<Result<AuthRefreshEntity>> {
    this.logger.log('RefreshHandler: Init', { refresh_token });

    const findTokenResult = await this.findTokenHandler.execute(refresh_token);

    if (findTokenResult.status === ResultStatus.ERROR) {
      return findTokenResult;
    }

    const refreshTokenEntity = findTokenResult.data;

    const dateNow = new Date();
    const refreshTokenExpirationDate = new Date(refreshTokenEntity.expires_at);

    const tokenHasExpired = isAfter(dateNow, refreshTokenExpirationDate);

    if (tokenHasExpired) {
      return new ResultError(
        ResultErrorTypes.TOKEN_EXPIRED,
        'Refresh token expired, sign in to application',
      );
    }

    const decryptedEmail = this.encryptorProvider.decrypt(
      refreshTokenEntity.token,
    );

    const findUserByEmailResult = await this.findUserByEmailHandler.execute(
      decryptedEmail,
    );

    if (findUserByEmailResult.status === ResultStatus.ERROR) {
      return findUserByEmailResult;
    }

    const user = findUserByEmailResult.data;

    const access_token = await this.generateJwt.execute(user);

    const deleteUserRefreshTokensResult =
      await this.deleteUserRefreshTokensHandler.execute(user.id);

    if (deleteUserRefreshTokensResult.status === ResultStatus.ERROR) {
      return deleteUserRefreshTokensResult;
    }

    const createRefreshTokenResult =
      await this.createRefreshTokenHandler.execute({
        user_email: user.email,
        user_id: user.id,
      });

    if (createRefreshTokenResult.status === ResultStatus.ERROR) {
      return createRefreshTokenResult;
    }

    const refreshToken = createRefreshTokenResult.data;

    const authEntity = new AuthRefreshEntity({
      access_token,
      refresh_token: refreshToken.token,
    });

    return new ResultSuccess(authEntity);
  }
}

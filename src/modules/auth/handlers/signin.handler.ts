import { Injectable, Logger } from '@nestjs/common';

import { ResultError } from '../../../core/common/application-result/result-error';
import { ResultErrorTypes } from '../../../core/common/application-result/result-error-types';
import { ResultStatus } from '../../../core/common/application-result/result-status';
import { ResultSuccess } from '../../../core/common/application-result/result-success';
import { HashProvider } from '../../../providers/hash.provider';
import { CreateRefreshTokenHandler } from '../../refresh-token/handlers/create-refresh-token.handler';
import { DeleteUserRefreshTokensHandler } from '../../refresh-token/handlers/delete-user-refresh-tokens.handler';
import { FindUserByEmailHandler } from '../../user/handlers/find-user-by-email.handler';
import { SignInDto } from '../dtos/sign-in.dto';
import { AuthEntity } from '../entities/auth.entity';
import { GenerateJwtHandler } from './generate-jwt.handler';

@Injectable()
export class SignInHandler {
  private readonly logger = new Logger();

  constructor(
    private readonly findUserByEmailHandler: FindUserByEmailHandler,
    private readonly generateJwt: GenerateJwtHandler,
    private readonly createRefreshTokenHandler: CreateRefreshTokenHandler,
    private readonly deleteUserRefreshTokensHandler: DeleteUserRefreshTokensHandler,
    private readonly hashProvider: HashProvider,
  ) {}

  async execute(signInDto: SignInDto) {
    this.logger.log('SignInHandler: Init', { signInDto });

    const findUserByEmailResult = await this.findUserByEmailHandler.execute(
      signInDto.email,
    );

    if (findUserByEmailResult.status === ResultStatus.ERROR) {
      if (
        findUserByEmailResult.errorType === ResultErrorTypes.ENTRY_NOT_FOUND
      ) {
        return new ResultError(
          ResultErrorTypes.INVALID_CREDENTIALS,
          'Invalid email or password',
        );
      }

      return findUserByEmailResult;
    }

    const user = findUserByEmailResult.data;

    const passwordsMatch = await this.hashProvider.compare(
      signInDto.password,
      user.password,
    );

    if (!passwordsMatch) {
      return new ResultError(
        ResultErrorTypes.INVALID_CREDENTIALS,
        'Invalid email or password',
      );
    }

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

    const authEntity = new AuthEntity({
      user,
      access_token,
      refresh_token: refreshToken.token,
    });

    return new ResultSuccess(authEntity);
  }
}

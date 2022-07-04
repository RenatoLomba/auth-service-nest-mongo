import { Injectable, Logger } from '@nestjs/common';

import { Result } from '../../../core/common/application-result/result';
import { ResultStatus } from '../../../core/common/application-result/result-status';
import { ResultSuccess } from '../../../core/common/application-result/result-success';
import { CreateRefreshTokenHandler } from '../../refresh-token/handlers/create-refresh-token.handler';
import { CreateUserHandler } from '../../user/handlers/create-user.handler';
import { SignUpDto } from '../dtos/sign-up.dto';
import { AuthEntity } from '../entities/auth.entity';
import { GenerateJwtHandler } from './generate-jwt.handler';

@Injectable()
export class SignUpHandler {
  private readonly logger = new Logger();

  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly generateJwt: GenerateJwtHandler,
    private readonly createRefreshTokenHandler: CreateRefreshTokenHandler,
  ) {}

  /**
   * Possible ReturnError errorTypes:
   * - UNIQUE_DUPLICATE_ENTRY
   * - DATABASE_ERROR
   */
  async execute(signUpDto: SignUpDto): Promise<Result<AuthEntity>> {
    this.logger.log('SignUpHandler: Init', { signUpDto });

    const createUserResult = await this.createUserHandler.execute(signUpDto);

    if (createUserResult.status === ResultStatus.ERROR) {
      return createUserResult;
    }

    const user = createUserResult.data;

    const access_token = await this.generateJwt.execute(user);

    this.logger.log('SignUpHandler: Jwt Generated', { access_token });

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

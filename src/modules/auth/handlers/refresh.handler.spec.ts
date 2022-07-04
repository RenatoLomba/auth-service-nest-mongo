import { faker } from '@faker-js/faker';
import { TestingModule } from '@nestjs/testing';

import {
  cleanMongoDbMockCollections,
  closeMongoDbMock,
  createMongoDbMock,
  IMongoDbMock,
} from '../../../../test/utils/mongodb.mock';
import { ResultError } from '../../../core/common/application-result/result-error';
import { ResultErrorTypes } from '../../../core/common/application-result/result-error-types';
import { ResultStatus } from '../../../core/common/application-result/result-status';
import { ResultSuccess } from '../../../core/common/application-result/result-success';
import { RefreshTokenEntity } from '../../refresh-token/entities/refresh-token.entity';
import { CreateRefreshTokenHandler } from '../../refresh-token/handlers/create-refresh-token.handler';
import { FindTokenHandler } from '../../refresh-token/handlers/find-token.handler';
import { AuthEntity } from '../entities/auth.entity';
import { createAuthTestingModule } from '../test/create-auth-testing-module';
import { CreateExpiredRefreshTokenStub } from '../test/create-expired-refresh-token.stub';
import { CreateSignupDtoStub } from '../test/create-signup-dto.stub';
import { RefreshHandler } from './refresh.handler';
import { SignUpHandler } from './signup.handler';

describe('RefreshHandler', () => {
  let refreshHandler: RefreshHandler;
  let signUpHandler: SignUpHandler;
  let findTokenHandler: FindTokenHandler;
  let createRefreshTokenHandler: CreateRefreshTokenHandler;
  let mongoDbMock: IMongoDbMock;

  beforeAll(async () => {
    mongoDbMock = await createMongoDbMock();

    const app: TestingModule = await createAuthTestingModule(mongoDbMock);

    refreshHandler = app.get<RefreshHandler>(RefreshHandler);
    signUpHandler = app.get<SignUpHandler>(SignUpHandler);
    findTokenHandler = app.get<FindTokenHandler>(FindTokenHandler);
    createRefreshTokenHandler = app.get<CreateRefreshTokenHandler>(
      CreateRefreshTokenHandler,
    );
  });

  afterAll(async () => {
    await closeMongoDbMock(mongoDbMock);
  });

  afterEach(async () => {
    await cleanMongoDbMockCollections(mongoDbMock);
  });

  it('should return success when trying to refresh valid user token', async () => {
    // Given
    const signUpDto = CreateSignupDtoStub();
    const signUpHandlerResult = await signUpHandler.execute(signUpDto);
    const authEntity = (signUpHandlerResult as ResultSuccess<AuthEntity>).data;
    const expectedResult = ResultStatus.SUCCESS;

    // When
    const result = await refreshHandler.execute(authEntity.refresh_token);

    // Then
    expect(result.status).toBe(expectedResult);
  });

  it('should return error when trying to refresh a inexistent token', async () => {
    // Given
    const signUpDto = CreateSignupDtoStub();
    await signUpHandler.execute(signUpDto);
    const expectedResult = ResultStatus.ERROR;
    const expectedResultType = ResultErrorTypes.ENTRY_NOT_FOUND;

    // When
    const result = await refreshHandler.execute('invalid-token');

    // Then
    expect(result.status).toBe(expectedResult);
    expect((result as ResultError).errorType).toBe(expectedResultType);
  });

  it('should return error when trying to refresh a token that had already expired', async () => {
    // Given
    const signUpDto = CreateSignupDtoStub();
    const signUpHandlerResult = await signUpHandler.execute(signUpDto);
    const authEntity = (signUpHandlerResult as ResultSuccess<AuthEntity>).data;
    const expiredRefreshToken = CreateExpiredRefreshTokenStub({
      token: authEntity.refresh_token,
      user_id: authEntity.user.id,
    });
    jest
      .spyOn(findTokenHandler, 'execute')
      .mockResolvedValue(new ResultSuccess(expiredRefreshToken));
    const expectedResult = ResultStatus.ERROR;
    const expectedResultType = ResultErrorTypes.TOKEN_EXPIRED;

    // When
    const result = await refreshHandler.execute(authEntity.refresh_token);

    // Then
    expect(result.status).toBe(expectedResult);
    expect((result as ResultError).errorType).toBe(expectedResultType);
  });

  it('should return error when trying to refresh a token of a inexistent user', async () => {
    // Given
    const user_id = faker.datatype.uuid();
    const user_email = faker.internet.email();
    const createRefreshTokenResult = await createRefreshTokenHandler.execute({
      user_email,
      user_id,
    });
    const refreshToken = (
      createRefreshTokenResult as ResultSuccess<RefreshTokenEntity>
    ).data;
    jest
      .spyOn(findTokenHandler, 'execute')
      .mockResolvedValue(new ResultSuccess(refreshToken));
    const expectedResult = ResultStatus.ERROR;
    const expectedResultType = ResultErrorTypes.ENTRY_NOT_FOUND;

    // When
    const result = await refreshHandler.execute(refreshToken.token);

    // Then
    expect(result.status).toBe(expectedResult);
    expect((result as ResultError).errorType).toBe(expectedResultType);
  });
});

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
import { CreateRefreshTokenHandler } from '../../refresh-token/handlers/create-refresh-token.handler';
import { DeleteUserRefreshTokensHandler } from '../../refresh-token/handlers/delete-user-refresh-tokens.handler';
import { UserEntity } from '../../user/entities/user.entity';
import { CreateUserHandler } from '../../user/handlers/create-user.handler';
import { CreateUserDtoStub } from '../../user/test/create-user-dto.stub';
import { createAuthTestingModule } from '../test/create-auth-testing-module';
import { GenerateJwtHandler } from './generate-jwt.handler';
import { SignInHandler } from './signin.handler';

describe('SignInHandler', () => {
  let signInHandler: SignInHandler;
  let createUserHandler: CreateUserHandler;
  let deleteUserRefreshTokensHandler: DeleteUserRefreshTokensHandler;
  let createRefreshTokenHandler: CreateRefreshTokenHandler;
  let generateJwtHandler: GenerateJwtHandler;
  let mongoDbMock: IMongoDbMock;

  beforeAll(async () => {
    mongoDbMock = await createMongoDbMock();

    const app: TestingModule = await createAuthTestingModule(mongoDbMock);

    signInHandler = app.get<SignInHandler>(SignInHandler);
    createUserHandler = app.get<CreateUserHandler>(CreateUserHandler);
    deleteUserRefreshTokensHandler = app.get<DeleteUserRefreshTokensHandler>(
      DeleteUserRefreshTokensHandler,
    );
    createRefreshTokenHandler = app.get<CreateRefreshTokenHandler>(
      CreateRefreshTokenHandler,
    );
    generateJwtHandler = app.get<GenerateJwtHandler>(GenerateJwtHandler);
  });

  afterAll(async () => {
    await closeMongoDbMock(mongoDbMock);
  });

  afterEach(async () => {
    await cleanMongoDbMockCollections(mongoDbMock);
  });

  it('should return success when trying to sign in an user', async () => {
    // Given
    const createUserDto = CreateUserDtoStub();
    await createUserHandler.execute(createUserDto);
    const signInDto = {
      email: createUserDto.email,
      password: createUserDto.password,
    };
    const expectedResult = ResultStatus.SUCCESS;

    // When
    const result = await signInHandler.execute(signInDto);

    // Then
    expect(result.status).toBe(expectedResult);
  });

  it('should call all the necessary handlers to complete a user sign in', async () => {
    // Given
    const createUserDto = CreateUserDtoStub();
    const createUserHandlerResult = await createUserHandler.execute(
      createUserDto,
    );
    const userEntity = (createUserHandlerResult as ResultSuccess<UserEntity>)
      .data;
    const signInDto = {
      email: createUserDto.email,
      password: createUserDto.password,
    };
    const generateJwtHandlerSpy = jest.spyOn(generateJwtHandler, 'execute');
    const deleteUserRTsHandlerSpy = jest.spyOn(
      deleteUserRefreshTokensHandler,
      'execute',
    );
    const createRTHandlerSpy = jest.spyOn(createRefreshTokenHandler, 'execute');

    // When
    await signInHandler.execute(signInDto);

    // Then
    expect(generateJwtHandlerSpy).toBeCalledWith(userEntity);
    expect(deleteUserRTsHandlerSpy).toBeCalledWith(userEntity.id);
    expect(createRTHandlerSpy).toBeCalledWith({
      user_email: userEntity.email,
      user_id: userEntity.id,
    });
  });

  it('should return error when trying to sign in an inexistent user', async () => {
    // Given
    const signInDto = {
      email: 'invalid-email',
      password: 'invalid-password',
    };
    const expectedResult = ResultStatus.ERROR;
    const expectedResultType = ResultErrorTypes.INVALID_CREDENTIALS;

    // When
    const result = await signInHandler.execute(signInDto);

    // Then
    expect(result.status).toBe(expectedResult);
    expect((result as ResultError).errorType).toBe(expectedResultType);
  });

  it('should return error when trying to sign in an user with invalid password', async () => {
    // Given
    const createUserDto = CreateUserDtoStub();
    await createUserHandler.execute(createUserDto);
    const signInDto = {
      email: createUserDto.email,
      password: 'invalid-password',
    };
    const expectedResult = ResultStatus.ERROR;
    const expectedResultType = ResultErrorTypes.INVALID_CREDENTIALS;

    // When
    const result = await signInHandler.execute(signInDto);

    // Then
    expect(result.status).toBe(expectedResult);
    expect((result as ResultError).errorType).toBe(expectedResultType);
  });
});

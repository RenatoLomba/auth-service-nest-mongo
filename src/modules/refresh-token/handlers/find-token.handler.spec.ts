import { Model } from 'mongoose';

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

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
import { EncryptorProvider } from '../../../providers/encryptor.provider';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../schemas/refresh-token.schema';
import { CreateRefreshTokenDtoStub } from '../test/create-refresh-token-dto.stub';
import { CreateRefreshTokenHandler } from './create-refresh-token.handler';
import { FindTokenHandler } from './find-token.handler';

describe('FindTokenHandler', () => {
  let createRefreshTokenHandler: CreateRefreshTokenHandler;
  let findTokenHandler: FindTokenHandler;
  let mongoDbMock: IMongoDbMock;
  let refreshTokenModel: Model<RefreshToken>;

  beforeAll(async () => {
    mongoDbMock = await createMongoDbMock();
    refreshTokenModel = mongoDbMock.mongoConnection.model(
      RefreshToken.name,
      RefreshTokenSchema,
    );

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRefreshTokenHandler,
        FindTokenHandler,
        EncryptorProvider,
        {
          provide: getModelToken(RefreshToken.name),
          useValue: refreshTokenModel,
        },
      ],
    }).compile();

    createRefreshTokenHandler = app.get<CreateRefreshTokenHandler>(
      CreateRefreshTokenHandler,
    );
    findTokenHandler = app.get<FindTokenHandler>(FindTokenHandler);
  });

  afterAll(async () => {
    await closeMongoDbMock(mongoDbMock);
  });

  afterEach(async () => {
    await cleanMongoDbMockCollections(mongoDbMock);
  });

  it('should return success when searching for a existing valid token', async () => {
    // Given
    const createRefreshTokenDto = CreateRefreshTokenDtoStub();
    const refreshTokenResult = (await createRefreshTokenHandler.execute(
      createRefreshTokenDto,
    )) as ResultSuccess<RefreshTokenEntity>;
    const refreshTokenResultData = refreshTokenResult.data;
    const expectedResult = ResultStatus.SUCCESS;

    // When
    const result = await findTokenHandler.execute(refreshTokenResultData.token);

    // Then
    expect(result.status).toBe(expectedResult);
  });

  it('should return error when searching for a inexistent token', async () => {
    // Given
    const token = 'invalid token';
    const expectedResult = ResultStatus.ERROR;
    const expectedResultType = ResultErrorTypes.ENTRY_NOT_FOUND;

    // When
    const result = await findTokenHandler.execute(token);

    // Then
    expect(result.status).toBe(expectedResult);
    expect((result as ResultError).errorType).toBe(expectedResultType);
  });
});

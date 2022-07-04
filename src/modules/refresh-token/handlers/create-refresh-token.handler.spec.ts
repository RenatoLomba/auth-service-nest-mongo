import { Model } from 'mongoose';

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import {
  cleanMongoDbMockCollections,
  closeMongoDbMock,
  createMongoDbMock,
  IMongoDbMock,
} from '../../../../test/utils/mongodb.mock';
import { ResultStatus } from '../../../core/common/application-result/result-status';
import { EncryptorProvider } from '../../../providers/encryptor.provider';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../schemas/refresh-token.schema';
import { CreateRefreshTokenDtoStub } from '../test/create-refresh-token-dto.stub';
import { CreateRefreshTokenHandler } from './create-refresh-token.handler';

describe('CreateRefreshTokenHandler', () => {
  let createRefreshTokenHandler: CreateRefreshTokenHandler;
  let encryptorProvider: EncryptorProvider;
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
    encryptorProvider = app.get<EncryptorProvider>(EncryptorProvider);
  });

  afterAll(async () => {
    await closeMongoDbMock(mongoDbMock);
  });

  afterEach(async () => {
    await cleanMongoDbMockCollections(mongoDbMock);
  });

  it('should return success when trying to create a refresh token', async () => {
    // Given
    const createRefreshTokenDto = CreateRefreshTokenDtoStub();
    const expectedResult = ResultStatus.SUCCESS;
    const cryptSpy = jest.spyOn(encryptorProvider, 'crypt');

    // When
    const result = await createRefreshTokenHandler.execute(
      createRefreshTokenDto,
    );

    // Then
    expect(result.status).toBe(expectedResult);
    expect(cryptSpy).toBeCalledTimes(1);
  });
});

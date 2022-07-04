import { Model } from 'mongoose';

import { faker } from '@faker-js/faker';
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
import { DeleteUserRefreshTokensHandler } from './delete-user-refresh-tokens.handler';
import { FindTokenHandler } from './find-token.handler';

describe('DeleteUserRefreshTokens', () => {
  let createRefreshTokenHandler: CreateRefreshTokenHandler;
  let deleteUserRefreshTokensHandler: DeleteUserRefreshTokensHandler;
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
        DeleteUserRefreshTokensHandler,
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
    deleteUserRefreshTokensHandler = app.get<DeleteUserRefreshTokensHandler>(
      DeleteUserRefreshTokensHandler,
    );
  });

  afterAll(async () => {
    await closeMongoDbMock(mongoDbMock);
  });

  afterEach(async () => {
    await cleanMongoDbMockCollections(mongoDbMock);
  });

  it('should return success when trying to delete all user tokens', async () => {
    // Given
    const userId = faker.datatype.uuid();
    const expectedResult = ResultStatus.SUCCESS;

    // When
    const result = await deleteUserRefreshTokensHandler.execute(userId);

    // Then
    expect(result.status).toBe(expectedResult);
  });

  it('should return count 0 after deleting all user tokens', async () => {
    // Given
    const createRefreshTokenDto = CreateRefreshTokenDtoStub();
    await createRefreshTokenHandler.execute(createRefreshTokenDto);
    const modelCountBeforeDelete = (await refreshTokenModel.count()).toFixed();

    // When
    await deleteUserRefreshTokensHandler.execute(createRefreshTokenDto.user_id);
    const modelCountAfterDelete = (await refreshTokenModel.count()).toFixed();

    // Then
    expect(modelCountBeforeDelete).toBe('1');
    expect(modelCountAfterDelete).toBe('0');
  });

  it('should return count 1 when trying to delete tokens of invalid user', async () => {
    // Given
    const createRefreshTokenDto = CreateRefreshTokenDtoStub();
    await createRefreshTokenHandler.execute(createRefreshTokenDto);

    // When
    await deleteUserRefreshTokensHandler.execute('invalid-user-id');
    const modelCountAfterDelete = (await refreshTokenModel.count()).toFixed();

    // Then
    expect(modelCountAfterDelete).toBe('1');
  });
});

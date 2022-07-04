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
import { HashProvider } from '../../../providers/hash.provider';
import { User, UserSchema } from '../schemas/user.schema';
import { CreateUserDtoStub } from '../test/create-user-dto.stub';
import { CreateUserHandler } from './create-user.handler';
import { FindUserByEmailHandler } from './find-user-by-email.handler';

describe('FindUserByEmailHandler', () => {
  let createUserHandler: CreateUserHandler;
  let findUserByEmailHandler: FindUserByEmailHandler;
  let mongoDbMock: IMongoDbMock;
  let userModel: Model<User>;

  beforeAll(async () => {
    mongoDbMock = await createMongoDbMock();
    userModel = mongoDbMock.mongoConnection.model(User.name, UserSchema);

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        FindUserByEmailHandler,
        HashProvider,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
      ],
    }).compile();

    createUserHandler = app.get<CreateUserHandler>(CreateUserHandler);
    findUserByEmailHandler = app.get<FindUserByEmailHandler>(
      FindUserByEmailHandler,
    );
  });

  afterAll(async () => {
    await closeMongoDbMock(mongoDbMock);
  });

  afterEach(async () => {
    await cleanMongoDbMockCollections(mongoDbMock);
  });

  it('should return success when searching user with email that exists', async () => {
    // Given
    const createUserDto = CreateUserDtoStub();
    await createUserHandler.execute(createUserDto);
    const expectedResult = ResultStatus.SUCCESS;

    // When
    const result = await findUserByEmailHandler.execute(createUserDto.email);

    // Then
    expect(result.status).toBe(expectedResult);
  });

  it('should return error when searching user with email that does not exists', async () => {
    // Given
    const email = 'test@test.com';
    const expectedResult = ResultStatus.ERROR;
    const expectedResultMessage = ResultErrorTypes.ENTRY_NOT_FOUND;

    // When
    const result = await findUserByEmailHandler.execute(email);

    // Then
    expect(result.status).toBe(expectedResult);
    expect((result as ResultError).errorType).toBe(expectedResultMessage);
  });
});

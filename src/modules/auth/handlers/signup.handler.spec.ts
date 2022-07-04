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
import { createAuthTestingModule } from '../test/create-auth-testing-module';
import { CreateSignupDtoStub } from '../test/create-signup-dto.stub';
import { SignUpHandler } from './signup.handler';

describe('SignUpHandler', () => {
  let signUpHandler: SignUpHandler;
  let mongoDbMock: IMongoDbMock;

  beforeAll(async () => {
    mongoDbMock = await createMongoDbMock();

    const app: TestingModule = await createAuthTestingModule(mongoDbMock);

    signUpHandler = app.get<SignUpHandler>(SignUpHandler);
  });

  afterAll(async () => {
    await closeMongoDbMock(mongoDbMock);
  });

  afterEach(async () => {
    await cleanMongoDbMockCollections(mongoDbMock);
  });

  it('should return success when trying to sign up a user', async () => {
    // Given
    const signUpDto = CreateSignupDtoStub();
    const expectedResult = ResultStatus.SUCCESS;

    // When
    const result = await signUpHandler.execute(signUpDto);

    // Then
    expect(result.status).toBe(expectedResult);
  });

  it('should return error when trying to sign up a user with already existing email', async () => {
    // Given
    const signUpDto = CreateSignupDtoStub();
    await signUpHandler.execute(signUpDto);
    const expectedResult = ResultStatus.ERROR;
    const expectedResultType = ResultErrorTypes.UNIQUE_DUPLICATE_ENTRY;

    // When
    const result = await signUpHandler.execute(signUpDto);

    // Then
    expect(result.status).toBe(expectedResult);
    expect((result as ResultError).errorType).toBe(expectedResultType);
  });
});

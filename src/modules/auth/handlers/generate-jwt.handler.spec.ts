import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';

import { CreateUserEntityStub } from '../test/create-user-entity.stub';
import { GenerateJwtHandler } from './generate-jwt.handler';

describe('GenerateJwtHandler', () => {
  let generateJwtHandler: GenerateJwtHandler;
  let jwtService: JwtService;

  beforeAll(async () => {
    jwtService = new JwtService({
      secret: faker.random.alphaNumeric(10),
    });

    generateJwtHandler = new GenerateJwtHandler(jwtService);
  });

  it('should sign a user and return a token', async () => {
    // Given
    const userEntity = CreateUserEntityStub();
    const signSpy = jest.spyOn(jwtService, 'sign');

    // When
    const token = await generateJwtHandler.execute(userEntity);

    // Then
    expect(token).toBeTruthy();
    expect(signSpy).toBeCalledTimes(1);
  });

  it('should sign a user and verify the token is valid and have valid payload', async () => {
    // Given
    const userEntity = CreateUserEntityStub();

    // When
    const token = await generateJwtHandler.execute(userEntity);
    const payload = jwtService.verify(token);

    // Then
    expect(payload.sub).toBe(userEntity.id);
    expect(payload.email).toBe(userEntity.email);
  });
});

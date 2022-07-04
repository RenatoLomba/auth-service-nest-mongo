import { faker } from '@faker-js/faker';

import { ICreateUserDto } from '../dtos/create-user.dto';

export const CreateUserDtoStub = (): ICreateUserDto => {
  return {
    email: faker.internet.email(),
    name: faker.internet.userName(),
    password: faker.random.alphaNumeric(6),
  };
};

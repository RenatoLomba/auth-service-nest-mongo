import { faker } from '@faker-js/faker';

import { SignUpDto } from '../dtos/sign-up.dto';

export const CreateSignupDtoStub = (): SignUpDto => {
  return {
    email: faker.internet.email(),
    name: faker.internet.userName(),
    password: faker.random.alphaNumeric(6),
  };
};

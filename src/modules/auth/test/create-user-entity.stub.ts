import { faker } from '@faker-js/faker';

import { UserEntity } from '../../user/entities/user.entity';

export const CreateUserEntityStub = (): UserEntity => {
  return {
    email: faker.internet.email(),
    id: faker.datatype.uuid(),
    name: faker.internet.userName(),
    password: faker.random.alphaNumeric(6),
  };
};

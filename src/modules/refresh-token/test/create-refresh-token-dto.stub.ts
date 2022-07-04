import { faker } from '@faker-js/faker';

import { ICreateRefreshTokenDto } from '../dtos/create-refresh-token.dto';

export const CreateRefreshTokenDtoStub = (): ICreateRefreshTokenDto => {
  return {
    user_email: faker.internet.email(),
    user_id: faker.datatype.uuid(),
  };
};

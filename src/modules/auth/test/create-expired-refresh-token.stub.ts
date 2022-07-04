import { previousDay } from 'date-fns';

import { faker } from '@faker-js/faker';

import { RefreshTokenEntity } from '../../refresh-token/entities/refresh-token.entity';

interface ICreateExpiredRefreshTokenStubParams {
  token: string;
  user_id: string;
}

export const CreateExpiredRefreshTokenStub = ({
  token,
  user_id,
}: ICreateExpiredRefreshTokenStubParams): RefreshTokenEntity => {
  return new RefreshTokenEntity({
    id: faker.datatype.uuid(),
    created_at: new Date(),
    expires_at: previousDay(new Date(), 1),
    user_id,
    token,
  });
};

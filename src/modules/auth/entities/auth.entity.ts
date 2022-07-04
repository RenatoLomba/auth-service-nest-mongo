import { UserEntity } from '../../user/entities/user.entity';

export class AuthEntity {
  access_token: string;
  refresh_token: string;
  user: UserEntity;

  constructor({ access_token, user, refresh_token }: Partial<AuthEntity>) {
    Object.assign(this, { access_token, user, refresh_token });
  }
}

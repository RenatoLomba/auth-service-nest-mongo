import { Exclude } from 'class-transformer';

export class UserEntity {
  id: string;
  name: string;
  email: string;

  @Exclude()
  password: string;

  constructor({ email, id, name, password }: Partial<UserEntity>) {
    Object.assign(this, { email, id, name, password });
  }
}

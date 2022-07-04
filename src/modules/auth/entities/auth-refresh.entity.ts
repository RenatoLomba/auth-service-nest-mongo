export class AuthRefreshEntity {
  access_token: string;
  refresh_token: string;

  constructor({ access_token, refresh_token }: Partial<AuthRefreshEntity>) {
    Object.assign(this, { access_token, refresh_token });
  }
}

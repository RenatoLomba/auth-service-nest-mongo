export class RefreshTokenEntity {
  id: string;
  token: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;

  constructor({
    id,
    token,
    user_id,
    created_at,
    expires_at,
  }: Partial<RefreshTokenEntity>) {
    Object.assign(this, { id, token, user_id, created_at, expires_at });
  }
}

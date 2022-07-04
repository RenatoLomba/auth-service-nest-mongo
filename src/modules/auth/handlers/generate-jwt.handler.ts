import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserEntity } from '../../user/entities/user.entity';

@Injectable()
export class GenerateJwtHandler {
  constructor(private readonly jwtService: JwtService) {}

  async execute(user: UserEntity): Promise<string> {
    const payload = { name: user.name, email: user.email };

    return this.jwtService.sign(payload, {
      subject: user.id,
      expiresIn: 60 * 30,
    });
  }
}

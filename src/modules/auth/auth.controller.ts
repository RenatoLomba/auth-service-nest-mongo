import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  CurrentUser,
  IUser,
} from '../../core/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { RefreshDto } from './dtos/refresh.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { RefreshHandler } from './handlers/refresh.handler';
import { SignInHandler } from './handlers/signin.handler';
import { SignUpHandler } from './handlers/signup.handler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpHandler: SignUpHandler,
    private readonly signInHandler: SignInHandler,
    private readonly refreshHandler: RefreshHandler,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.signUpHandler.execute(signUpDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('/signin')
  @HttpCode(200)
  async signIn(@Body() signInDto: SignInDto) {
    return this.signInHandler.execute(signInDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@CurrentUser() user: IUser) {
    return user;
  }

  @Post('/refresh')
  @HttpCode(200)
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.refreshHandler.execute(refreshDto.refresh_token);
  }
}

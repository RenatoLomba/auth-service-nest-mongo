import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { ResultErrorTypes } from './result-error-types';

const httpResultErrorExceptions = {
  [ResultErrorTypes.DATABASE_ERROR]: InternalServerErrorException,
  [ResultErrorTypes.ENTRY_NOT_FOUND]: NotFoundException,
  [ResultErrorTypes.UNIQUE_DUPLICATE_ENTRY]: BadRequestException,
  [ResultErrorTypes.INVALID_CREDENTIALS]: BadRequestException,
  [ResultErrorTypes.TOKEN_EXPIRED]: UnauthorizedException,
};

export const handleHttpResultError = (
  errorType: ResultErrorTypes,
  errorMessage: string,
) => {
  throw new httpResultErrorExceptions[errorType](errorMessage);
};

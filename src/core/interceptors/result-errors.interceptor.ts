import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { handleHttpResultError } from '../common/application-result/handle-http-result-error';
import { Result } from '../common/application-result/result';
import { ResultStatus } from '../common/application-result/result-status';

export interface IResponse<T> {
  data: Result<T>;
}

@Injectable()
export class ResultErrorsInterceptor<T>
  implements NestInterceptor<T, IResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        if (response.status === ResultStatus.SUCCESS) {
          return response.data;
        }

        if (response.status === ResultStatus.ERROR) {
          return handleHttpResultError(
            response.errorType,
            response.errorMessage,
          );
        }

        return response;
      }),
    );
  }
}

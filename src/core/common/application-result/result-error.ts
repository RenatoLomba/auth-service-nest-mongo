import { ResultErrorTypes } from './result-error-types';
import { ResultStatus } from './result-status';

export class ResultError {
  public readonly errorType: ResultErrorTypes;
  public readonly errorMessage: string;
  public readonly status: ResultStatus.ERROR = ResultStatus.ERROR;

  public constructor(errorType: ResultErrorTypes, errorMessage: string) {
    this.errorType = errorType;
    this.errorMessage = errorMessage;
  }
}

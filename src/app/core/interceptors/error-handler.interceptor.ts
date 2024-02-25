import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from 'src/app/interfaces/errorResponse';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred.
        errorMessage = JSON.parse(error.error.message);
      } else {
        // The backend returned an unsuccessful response code.
        const err = error.error as ErrorResponse;
        errorMessage = err.name;
      }

      // Use throwError(() => new Error()) to create the error at the moment it should be created and capture a more appropriate stack trace.
      return throwError(
        () =>
          new Error(
            JSON.stringify({ name: errorMessage, status: error.status })
          )
      );
    })
  );
};

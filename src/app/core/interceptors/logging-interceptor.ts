import { HttpErrorResponse, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  // फक्त आपल्या backend API साठी token जोडायचा
  const isBackendApi = req.url.startsWith('/api/');
  const token = localStorage.getItem('access_token');

  // setting request header to http request here. Please note, below we modify the actual http request to
  // set the request header i.e. 'Authorization' if isBackendApi and token is true. Remember to pass the header we
  // use request.clone And if one of them is false then we are not modifying the actual request means
  // not passing/setting the header with request.
  const authReq =
    isBackendApi && token
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;

  /*** in above code, we are passing Request Header 'Authorization' when isBackendApi and token is true. We can pass
   * request header with any name like in below commented code we are passing 'Authorization-Amol' header
   *  */

  //   const authReq = true
  // ? req.clone({
  //     setHeaders: {
  //       'Authorization-Amol': `Bearer ${token}`,
  //     },
  //   })
  // : req;

  // Request Logging
  console.log('HTTP Request:', authReq.method, authReq.url);

  return next(authReq).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          console.log('HTTP Response:', {
            status: event.status,
            url: event.url,
            body: event.body,
          });
        }
      },

      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          console.error('HTTP Error:', {
            status: error.status,
            url: error.url,
            message: error.message,
          });

          if (error.status === 401) {
            console.warn('401 Unauthorized');
          } else if (error.status === 403) {
            console.warn('403 Forbidden');
          }
        }
      },
    }),
  );
};

import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SpinnerService } from './spinner.service';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TokenInterceptorService {
  constructor(private spinner: SpinnerService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.spinner.showSpinner();
    if (request.url === environment.baseurl + '/login') {
      return next
        .handle(request)
        .pipe((response: Observable<HttpEvent<any>>) => {
          response
            .toPromise()
            .then((resp) => {
              this.spinner.hideSpinner();
            })
            .catch((error) => {
              this.spinner.hideSpinner();
            });

          return response;
        });
    } else {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return next
        .handle(request)
        .pipe(
          catchError((err) => {
            this.spinner.hideSpinner();

            return err;
          })
        )
        .pipe(
          map<HttpEvent<any>, any>((evt: HttpEvent<any>) => {
            if (evt instanceof HttpResponse) {
              this.spinner.hideSpinner();
            }
            return evt;
          })
        );
    }
  }
}
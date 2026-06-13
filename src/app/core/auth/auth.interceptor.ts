import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Oidc } from './oidc.service';

export const bearerInterceptor: HttpInterceptorFn = Oidc.createBearerInterceptor({
  shouldInjectAccessToken: (request) =>
    new URL(request.url, window.location.origin).origin === new URL(environment.apiUrl).origin,
});

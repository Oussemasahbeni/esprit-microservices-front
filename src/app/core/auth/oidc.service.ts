import { EnvironmentProviders, Injectable, isDevMode } from '@angular/core';
import { AbstractOidcService } from 'oidc-spa/angular';
import { z } from 'zod';
import { environment } from '../../../environments/environment';

export const decodedIdTokenSchema = z.object({
  iat: z.number(),
  name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  email: z.string(),
  realm_access: z
    .object({
      roles: z.array(z.string()),
    })
    .optional(),
});

export type DecodedIdToken = z.infer<typeof decodedIdTokenSchema>;
export type AuthUser = Readonly<DecodedIdToken>;

@Injectable({ providedIn: 'root' })
export class Oidc extends AbstractOidcService<DecodedIdToken> {}

export const provideOidc = (): EnvironmentProviders =>
  Oidc.provide(async () => {
    return {
      issuerUri: environment.issuerUri,
      clientId: environment.clientId,
      debugLogs: isDevMode(),
      autoLogin: true,
      decodedIdTokenSchema,
    };
  });

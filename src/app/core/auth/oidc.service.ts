import { HttpContextToken } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractOidcService } from 'oidc-spa/angular';
import { z } from 'zod';

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

export const REQUIRE_ACCESS_TOKEN = new HttpContextToken<boolean>(() => false);
export const INCLUDE_ACCESS_TOKEN_IF_LOGGED_IN = new HttpContextToken<boolean>(() => false);

@Injectable({ providedIn: 'root' })
export class Oidc extends AbstractOidcService<DecodedIdToken> {
  protected override decodedIdTokenSchema = decodedIdTokenSchema;
  // See: https://docs.oidc-spa.dev/v/v10/features/auto-login#angular
  protected override autoLogin = true;
  // See: https://docs.oidc-spa.dev/v/v10/features/non-blocking-rendering#react-spas
  protected override providerAwaitsInitialization = true;
}

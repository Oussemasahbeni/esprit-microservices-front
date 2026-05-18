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

@Injectable({ providedIn: 'root' })
export class Oidc extends AbstractOidcService<DecodedIdToken> {}

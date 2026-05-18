import { browserRuntimeFreeze } from 'oidc-spa/browser-runtime-freeze';
import { DPoP } from 'oidc-spa/DPoP';
import { oidcEarlyInit } from 'oidc-spa/entrypoint';

const { shouldLoadApp } = oidcEarlyInit({
  securityDefenses: {
    ...browserRuntimeFreeze(),
    ...DPoP({ mode: 'auto' }),
  },
});

if (shouldLoadApp) {
  import('./main.lazy');
}

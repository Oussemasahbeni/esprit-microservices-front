import { browserRuntimeFreeze } from 'oidc-spa/browser-runtime-freeze';
import { oidcEarlyInit } from 'oidc-spa/entrypoint';

const { shouldLoadApp } = oidcEarlyInit({
  securityDefenses: {
    ...browserRuntimeFreeze(),
  },
});

if (shouldLoadApp) {
  import('./main.lazy');
}

import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthUser, Oidc } from './oidc.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _oidc = inject(Oidc);

  private readonly _currentUser = signal<AuthUser>(this._oidc.$decodedIdToken());
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isAuthenticated = computed(() => this._oidc.isUserLoggedIn);

  logout() {
    this._oidc.logout({ redirectTo: 'home' });
  }
}

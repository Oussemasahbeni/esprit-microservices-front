import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Oidc } from '@core/auth/oidc.service';
import { DirectionalityService } from '@core/config/directionality.service';
import { ToasterProps } from '@spartan-ng/brain/sonner';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';

@Component({
  selector: 'adm-root',
  imports: [RouterOutlet, HlmToasterImports],
  template: `
    <hlm-toaster [position]="position()" />
    <router-outlet />

    @if (secondsLeftBeforeAutoLogout()) {
      <div class="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 backdrop-blur-md">
        <div class="mx-4 max-w-sm rounded-lg bg-white p-6 shadow-xl">
          <p class="mb-2 text-lg text-gray-800">Are you still there?</p>
          <p class="text-gray-600">You will be logged out in {{ secondsLeftBeforeAutoLogout() }}</p>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly _dir = inject(DirectionalityService);
  private readonly _oidc = inject(Oidc);

  protected readonly position = computed<ToasterProps['position']>(() => (this._dir.isRtl() ? 'top-left' : 'top-right'));
  protected readonly secondsLeftBeforeAutoLogout = computed(() => this._oidc.$secondsLeftBeforeAutoLogout());
}

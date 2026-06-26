import { CurrencyPipe, DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideCircleCheck,
  lucideCircleX,
  lucideImage,
  lucideLeaf,
  lucidePencil,
  lucidePercent,
  lucidePlus,
  lucideRefreshCcw,
  lucideSearch,
  lucideSparkles,
  lucideTag,
  lucideTrash2,
  lucideUtensils,
  lucideX,
} from '@ng-icons/lucide';
import { toast } from '@spartan-ng/brain/sonner';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { environment } from '../../../../environments/environment';
import { Dish, DishRequest, MenuCategory, MenuResponse, PromotionRequest } from '../../../shared/models/menu';
import { MenuService } from '../service/menu.service';

type AvailabilityFilter = 'all' | 'available' | 'unavailable';
type EditorMode = 'dish' | 'category' | 'promotion' | null;

@Component({
  selector: 'adm-menu-management',
  imports: [
    CurrencyPipe,
    DatePipe,
    ReactiveFormsModule,
    TranslocoModule,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmFieldImports,
    HlmIconImports,
    HlmInputImports,
    HlmInputGroupImports,
    HlmTextareaImports,
  ],
  providers: [
    provideIcons({
      lucideAlertTriangle,
      lucideCircleCheck,
      lucideCircleX,
      lucideImage,
      lucideLeaf,
      lucidePencil,
      lucidePercent,
      lucidePlus,
      lucideRefreshCcw,
      lucideSearch,
      lucideSparkles,
      lucideTag,
      lucideTrash2,
      lucideUtensils,
      lucideX,
    }),
  ],
  templateUrl: './menu-management.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuManagement {
  private readonly _menuService = inject(MenuService);
  private readonly _transloco = inject(TranslocoService);

  protected readonly menuResource = httpResource<MenuResponse>(() => `${environment.apiUrl}/api/menus`);
  protected readonly search = signal('');
  protected readonly selectedCategoryId = signal<number | 'all'>('all');
  protected readonly availability = signal<AvailabilityFilter>('all');
  protected readonly editorMode = signal<EditorMode>(null);
  protected readonly editingDish = signal<Dish | null>(null);
  protected readonly isSubmitting = signal(false);

  protected readonly menu = computed(() => this.menuResource.value());
  protected readonly categories = computed(() => this.menu()?.categories ?? []);
  protected readonly dishes = computed(() => this.menu()?.dishes ?? []);
  protected readonly promotions = computed(() => this.menu()?.promotions ?? []);
  protected readonly summary = computed(() => this.menu()?.summary);

  protected readonly filteredDishes = computed(() => {
    const dishes = this.dishes();
    const query = this.search().trim().toLowerCase();
    const categoryId = this.selectedCategoryId();
    const availability = this.availability();

    return dishes.filter((dish) => {
      if (categoryId !== 'all' && dish.category.id !== categoryId) {
        return false;
      }
      if (availability === 'available' && !dish.available) {
        return false;
      }
      if (availability === 'unavailable' && dish.available) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [dish.name, dish.description, dish.category.name, ...dish.ingredients, ...dish.allergens]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  });

  protected readonly dishForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(140)] }),
    description: new FormControl('', { nonNullable: true }),
    price: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    photoUrl: new FormControl('', { nonNullable: true }),
    available: new FormControl(true, { nonNullable: true }),
    categoryId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ingredients: new FormControl('', { nonNullable: true }),
    allergens: new FormControl('', { nonNullable: true }),
    variants: new FormControl('', { nonNullable: true }),
  });

  protected readonly categoryForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    description: new FormControl('', { nonNullable: true }),
    displayOrder: new FormControl(0, { nonNullable: true }),
    active: new FormControl(true, { nonNullable: true }),
  });

  protected readonly promotionForm = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(140)] }),
    description: new FormControl('', { nonNullable: true }),
    discountPercent: new FormControl(10, { nonNullable: true, validators: [Validators.required, Validators.min(0.01), Validators.max(100)] }),
    startsAt: new FormControl(this.toDatetimeLocal(new Date()), { nonNullable: true, validators: [Validators.required] }),
    endsAt: new FormControl(this.toDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    active: new FormControl(true, { nonNullable: true }),
    targetType: new FormControl<'category' | 'dish'>('category', { nonNullable: true }),
    targetId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected setSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected setCategory(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedCategoryId.set(value === 'all' ? 'all' : Number(value));
  }

  protected setAvailability(event: Event): void {
    this.availability.set((event.target as HTMLSelectElement).value as AvailabilityFilter);
  }

  protected openDishForm(dish?: Dish): void {
    this.editorMode.set('dish');
    this.editingDish.set(dish ?? null);
    if (!dish) {
      this.dishForm.reset({
        name: '',
        description: '',
        price: 0,
        photoUrl: '',
        available: true,
        categoryId: this.categories()[0]?.id.toString() ?? '',
        ingredients: '',
        allergens: '',
        variants: '',
      });
      return;
    }
    this.dishForm.reset({
      name: dish.name,
      description: dish.description ?? '',
      price: dish.price,
      photoUrl: dish.photoUrl ?? '',
      available: dish.available,
      categoryId: dish.category.id.toString(),
      ingredients: dish.ingredients.join(', '),
      allergens: dish.allergens.join(', '),
      variants: dish.variants.map((variant) => `${variant.name}:${variant.priceDelta}`).join(', '),
    });
  }

  protected openCategoryForm(): void {
    this.editorMode.set('category');
    this.categoryForm.reset({
      name: '',
      description: '',
      displayOrder: this.categories().length + 1,
      active: true,
    });
  }

  protected openPromotionForm(): void {
    this.editorMode.set('promotion');
    this.promotionForm.reset({
      name: '',
      description: '',
      discountPercent: 10,
      startsAt: this.toDatetimeLocal(new Date()),
      endsAt: this.toDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      active: true,
      targetType: 'category',
      targetId: this.categories()[0]?.id.toString() ?? '',
    });
  }

  protected closeEditor(): void {
    this.editorMode.set(null);
    this.editingDish.set(null);
  }

  protected refresh(): void {
    this.menuResource.reload();
  }

  protected saveDish(): void {
    if (this.dishForm.invalid) {
      this.dishForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const editingDish = this.editingDish();
    const request = this.toDishRequest();
    const request$ = editingDish
      ? this._menuService.updateDish(editingDish.id, request)
      : this._menuService.createDish(request);

    request$.subscribe({
      next: () => this.afterSave(editingDish ? 'menu.toast.dishUpdated' : 'menu.toast.dishCreated'),
      error: () => this.handleSaveError(),
    });
  }

  protected saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const raw = this.categoryForm.getRawValue();
    this._menuService
      .createCategory({
        name: raw.name,
        description: raw.description || null,
        displayOrder: raw.displayOrder,
        active: raw.active,
      })
      .subscribe({
        next: () => this.afterSave('menu.toast.categoryCreated'),
        error: () => this.handleSaveError(),
      });
  }

  protected savePromotion(): void {
    if (this.promotionForm.invalid) {
      this.promotionForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    const request = this.toPromotionRequest();
    this._menuService.createPromotion(request).subscribe({
      next: () => this.afterSave('menu.toast.promotionCreated'),
      error: () => this.handleSaveError(),
    });
  }

  protected toggleAvailability(dish: Dish): void {
    this._menuService.updateDishAvailability(dish.id, !dish.available).subscribe({
      next: () => {
        toast.success(this._transloco.translate('menu.toast.availabilityUpdated'));
        this.refresh();
      },
      error: () => toast.error(this._transloco.translate('common.error')),
    });
  }

  protected deleteDish(dish: Dish): void {
    if (!confirm(this._transloco.translate('menu.confirmDelete', { name: dish.name }))) {
      return;
    }
    this._menuService.deleteDish(dish.id).subscribe({
      next: () => {
        toast.success(this._transloco.translate('menu.toast.dishDeleted'));
        this.refresh();
      },
      error: () => toast.error(this._transloco.translate('common.error')),
    });
  }

  protected categoryTrack(_: number, category: MenuCategory): number {
    return category.id;
  }

  protected dishTrack(_: number, dish: Dish): number {
    return dish.id;
  }

  private toDishRequest(): DishRequest {
    const raw = this.dishForm.getRawValue();
    return {
      name: raw.name,
      description: raw.description || null,
      price: Number(raw.price),
      photoUrl: raw.photoUrl || null,
      available: raw.available,
      categoryId: Number(raw.categoryId),
      ingredients: this.splitCsv(raw.ingredients),
      allergens: this.splitCsv(raw.allergens),
      variants: this.parseVariants(raw.variants),
    };
  }

  private toPromotionRequest(): PromotionRequest {
    const raw = this.promotionForm.getRawValue();
    const targetId = Number(raw.targetId);
    return {
      name: raw.name,
      description: raw.description || null,
      discountPercent: Number(raw.discountPercent),
      startsAt: new Date(raw.startsAt).toISOString().slice(0, 19),
      endsAt: new Date(raw.endsAt).toISOString().slice(0, 19),
      active: raw.active,
      categoryId: raw.targetType === 'category' ? targetId : null,
      dishId: raw.targetType === 'dish' ? targetId : null,
    };
  }

  private splitCsv(value: string): string[] {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private parseVariants(value: string): DishRequest['variants'] {
    return this.splitCsv(value).map((entry) => {
      const [name, priceDelta] = entry.split(':').map((part) => part.trim());
      return {
        name,
        priceDelta: Number(priceDelta ?? 0),
        available: true,
      };
    });
  }

  private afterSave(messageKey: string): void {
    toast.success(this._transloco.translate(messageKey));
    this.isSubmitting.set(false);
    this.closeEditor();
    this.refresh();
  }

  private handleSaveError(): void {
    toast.error(this._transloco.translate('common.error'));
    this.isSubmitting.set(false);
  }

  private toDatetimeLocal(date: Date): string {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
  }
}

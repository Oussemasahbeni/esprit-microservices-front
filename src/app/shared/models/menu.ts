export interface MenuCategory {
  id: number;
  name: string;
  description?: string | null;
  displayOrder: number;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DishVariant {
  id?: number;
  name: string;
  priceDelta: number;
  available: boolean;
}

export interface Dish {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  photoUrl?: string | null;
  available: boolean;
  category: MenuCategory;
  ingredients: string[];
  allergens: string[];
  variants: DishVariant[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Promotion {
  id: number;
  name: string;
  description?: string | null;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  dishId?: number | null;
  dishName?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface MenuSummary {
  totalDishes: number;
  availableDishes: number;
  unavailableDishes: number;
  categories: number;
  activePromotions: number;
}

export interface MenuResponse {
  summary: MenuSummary;
  categories: MenuCategory[];
  dishes: Dish[];
  promotions: Promotion[];
}

export interface DishRequest {
  name: string;
  description?: string | null;
  price: number;
  photoUrl?: string | null;
  available: boolean;
  categoryId: number;
  ingredients: string[];
  allergens: string[];
  variants: Omit<DishVariant, 'id'>[];
}

export interface CategoryRequest {
  name: string;
  description?: string | null;
  displayOrder: number;
  active: boolean;
}

export interface PromotionRequest {
  name: string;
  description?: string | null;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  dishId?: number | null;
  categoryId?: number | null;
}

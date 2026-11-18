import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

/** FLOW resets every month; CUMULATIVE carries what is left over to the next month. */
export type CategoryKind = 'FLOW' | 'CUMULATIVE';

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
}

/** The logged-in account's categories (`/api/categories`, owner-scoped on the server). */
@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);

  list(): Promise<Category[]> {
    return firstValueFrom(this.http.get<Category[]>('/api/categories'));
  }

  create(name: string, kind: CategoryKind): Promise<Category> {
    return firstValueFrom(this.http.post<Category>('/api/categories', { name, kind }));
  }
}

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Account {
  id: string;
  email: string;
}

/** Single source of auth state for guards, the shell and the login/sign-up screens. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly user = signal<Account | null>(null);
  private readonly isLoaded = signal(false);
  private inFlight: Promise<Account | null> | null = null;

  /** The logged-in account, or `null` when anonymous (or not yet known — see `loaded`). */
  readonly currentUser = this.user.asReadonly();
  /** `false` until `GET /api/me` has answered (and again after `clear()`). */
  readonly loaded = this.isLoaded.asReadonly();

  /**
   * Resolves the current account, asking `GET /api/me` only when the state is unknown.
   * Concurrent callers share one request. A 401 means "anonymous" and resolves to `null`;
   * the response also sets the `XSRF-TOKEN` cookie needed by the first login/register POST.
   */
  ensureLoaded(): Promise<Account | null> {
    if (this.isLoaded()) {
      return Promise.resolve(this.user());
    }
    this.inFlight ??= firstValueFrom(this.http.get<Account>('/api/me'))
      .then(
        (account) => {
          this.setUser(account);
          return account;
        },
        (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.setUser(null);
            return null;
          }
          throw error;
        },
      )
      .finally(() => {
        this.inFlight = null;
      });
    return this.inFlight;
  }

  async login(email: string, password: string): Promise<Account> {
    const account = await firstValueFrom(
      this.http.post<Account>('/api/auth/login', { email, password }),
    );
    this.setUser(account);
    return account;
  }

  async register(email: string, password: string): Promise<Account> {
    const account = await firstValueFrom(
      this.http.post<Account>('/api/auth/register', { email, password }),
    );
    this.setUser(account);
    return account;
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post<void>('/api/auth/logout', null));
    } finally {
      this.clear();
    }
  }

  /**
   * Forgets the account. The state goes back to "unknown" so the next guard asks
   * `GET /api/me` again, which also re-issues the `XSRF-TOKEN` cookie (logout removes it).
   */
  clear(): void {
    this.user.set(null);
    this.isLoaded.set(false);
  }

  private setUser(account: Account | null): void {
    this.user.set(account);
    this.isLoaded.set(true);
  }
}

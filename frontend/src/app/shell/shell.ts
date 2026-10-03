import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../auth/auth.service';

/** Logged-in layout: header with the account e-mail and logout, child routes below. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.currentUser;
  protected readonly loggingOut = signal(false);

  protected async logout(): Promise<void> {
    if (this.loggingOut()) {
      return;
    }
    this.loggingOut.set(true);
    try {
      await this.auth.logout();
    } catch {
      // State is cleared either way; the guards re-check the session with the server.
    } finally {
      this.loggingOut.set(false);
    }
    // Replace the shell's history entry so "back" does not return to it.
    await this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}

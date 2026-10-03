import { Component } from '@angular/core';

/** Placeholder start page; S-02 replaces it with the category empty state. */
@Component({
  selector: 'app-home',
  template: `
    <section class="home">
      <h1>Witaj w PennyPlan</h1>
      <p>Tu wkrótce pojawi się Twój budżet.</p>
    </section>
  `,
})
export class Home {}

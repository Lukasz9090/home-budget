import { Component } from '@angular/core';

/** Placeholder start page; the budget view replaces it later (categories live at /categories). */
@Component({
  selector: 'app-home',
  host: { class: 'block' },
  template: `
    <section class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold md:text-3xl">Witaj w PennyPlan</h1>
      <p class="text-base text-muted-foreground">Tu wkrótce pojawi się Twój budżet.</p>
    </section>
  `,
})
export class Home {}

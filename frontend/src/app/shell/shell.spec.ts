import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Shell } from './shell';

@Component({ template: '' })
class Blank {}

describe('Shell', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          {
            path: '',
            component: Shell,
            children: [
              { path: '', component: Blank },
              { path: 'categories', component: Blank },
            ],
          },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
  });

  function navLinks(): HTMLAnchorElement[] {
    return Array.from(
      harness.fixture.nativeElement.querySelectorAll('a[href="/categories"]'),
    ) as HTMLAnchorElement[];
  }

  it('renders the Kategorie link in the header nav and in the mobile footer', async () => {
    await harness.navigateByUrl('/');
    const links = navLinks();
    expect(links).toHaveLength(2);
    expect(links[0].closest('header')).not.toBeNull();
    expect(links[1].closest('footer')).not.toBeNull();
    links.forEach((link) => expect(link.textContent?.trim()).toBe('Kategorie'));
  });

  it('marks the link active only on /categories', async () => {
    await harness.navigateByUrl('/');
    await harness.fixture.whenStable();
    for (const link of navLinks()) {
      expect(link.classList.contains('bg-accent!')).toBe(false);
      expect(link.getAttribute('aria-current')).toBeNull();
    }

    await harness.navigateByUrl('/categories');
    await vi.waitFor(async () => {
      await harness.fixture.whenStable();
      for (const link of navLinks()) {
        expect(link.classList.contains('bg-accent!')).toBe(true);
        expect(link.getAttribute('aria-current')).toBe('page');
      }
    });
  });
});

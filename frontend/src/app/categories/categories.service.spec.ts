import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoriesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list gets /api/categories', async () => {
    const result = service.list();
    http
      .expectOne({ method: 'GET', url: '/api/categories' })
      .flush([{ id: '1', name: 'Wakacje', kind: 'CUMULATIVE' }]);

    await expect(result).resolves.toEqual([{ id: '1', name: 'Wakacje', kind: 'CUMULATIVE' }]);
  });

  it('create posts the name and kind to /api/categories', async () => {
    const result = service.create('Wakacje', 'CUMULATIVE');
    const req = http.expectOne({ method: 'POST', url: '/api/categories' });
    expect(req.request.body).toEqual({ name: 'Wakacje', kind: 'CUMULATIVE' });
    req.flush(
      { id: '1', name: 'Wakacje', kind: 'CUMULATIVE' },
      { status: 201, statusText: 'Created' },
    );

    await expect(result).resolves.toEqual({ id: '1', name: 'Wakacje', kind: 'CUMULATIVE' });
  });
});

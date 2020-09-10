import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, map, shareReplay, startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public marketsFormControl: FormControl;

  marketOptions = [
    { id: 109231945769370, name: 'Albany, Georgia' },
    { id: 104088049626788, name: 'Scranton, PA' },
    { id: 113848465291957, name: 'Peoria, Illinois' },
    { id: 106020769428178, name: 'Lawton, Oklahoma' },
    { id: 109251899093010, name: 'Eureka, Nevada' },
    { id: 'spokane', name: 'Spokane, Washington' },
    { id: 112051028807535, name: 'Mitchell, Nebraska' }
  ];

  private finished$ = new Subject();

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.marketsFormControl = new FormControl();
    this.marketsFormControl.patchValue(this.marketOptions.map(m => m.id));

    this.form = this.fb.group({
      search: ['{YEAR} BMW M3', [Validators.required]],
      markets: this.marketsFormControl,
      minYear: [2009, [Validators.required]],
      maxYear: [2013, [Validators.required]],
      minPrice: [null],
      maxPrice: [null]
    });

    this.form.controls.search.valueChanges.pipe(
      takeUntil(this.finished$),
      startWith(this.form.controls.search.value),
      map(search => search.search(/\{year\}/ig) === -1),
      distinctUntilChanged(),
      shareReplay({ refCount: true, bufferSize: 1 })
    )
      .subscribe((disabled) => {
        if (disabled) {
          this.form.controls.minYear.disable();
          this.form.controls.maxYear.disable();
        } else {
          this.form.controls.minYear.enable();
          this.form.controls.maxYear.enable();
        }
      });
  }

  ngOnDestroy() {
    this.finished$.next();
  }

  getTabCount() {
    const { markets, minYear, maxYear, search } = this.form.getRawValue();
    let years = Math.max(maxYear - minYear + 1, 0);
    if (search.search(/\{year\}/ig) === -1) {
      years = 1;
    }

    return years * markets.length;
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    const { search, markets, minYear, maxYear, minPrice, maxPrice } = this.form.getRawValue();

    markets.forEach((market) => {
      if (search.search(/\{year\}/ig) === -1) {
        const url = this.createLink(search, market, 0, minPrice, maxPrice);
        window.open(url, '_blank');
      } else {
        for (let year = minYear; year <= maxYear; year++) {
          const url = this.createLink(search, market, year, minPrice, maxPrice);
          window.open(url, '_blank');
        }
      }
    });
  }

  createLink(search: string, market: string, year: number, minPrice: number, maxPrice: number) {
    const query = search.replace(/\{year\}/ig, `${year}`);

    let params = new HttpParams({});
    params = params.set('query', query);

    if (minPrice) {
      params = params.set('minPrice', `${minPrice}`);
    }

    if (maxPrice) {
      params = params.set('maxPrice', `${maxPrice}`);
    }

    return `https://www.facebook.com/marketplace/${market}/search/?${params.toString()}`;
  }
}

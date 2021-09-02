import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { concatMap, delay, distinctUntilChanged, map, shareReplay, startWith, takeUntil } from 'rxjs/operators';
import { from, of, Subject } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.marketsFormControl = new FormControl();
    this.marketsFormControl.patchValue(this.marketOptions.map(m => m.id));

    this.form = this.fb.group({
      search: ['{YEAR} BMW M3', [Validators.required]],
      markets: this.marketsFormControl,
      minYear: [2001, [Validators.required]],
      maxYear: [2006, [Validators.required]],
      minPrice: [null],
      maxPrice: [null],
      daysSinceListed: [0]
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

    const { search, markets, minYear, maxYear, minPrice, maxPrice, daysSinceListed } = this.form.getRawValue();

    const delayBetweenTabs = 0;
    const urls = [];

    markets.forEach((market) => {
      let redirectDelay = 0;
      if (search.search(/\{year\}/ig) === -1) {
        urls.push(this.createLink(search, market, 0, minPrice, maxPrice, daysSinceListed, (redirectDelay++ * delayBetweenTabs)));
      } else {
        for (let year = minYear; year <= maxYear; year++) {
          urls.push(this.createLink(search, market, year, minPrice, maxPrice, daysSinceListed, (redirectDelay++ * delayBetweenTabs)));
        }
      }
    });

    const groupsOf = 2;
    const urlGroups: string[][] = [];
    while (urls.length > 0) {
      urlGroups.push(urls.splice(0, groupsOf));
    }

    from(urlGroups).pipe(
      concatMap((urlGroup) =>
        of(urlGroup).pipe(delay(2000))
      ),
      takeUntil(this.finished$)
    )
      .subscribe((urlGroup: string[]) => {
        urlGroup.forEach((urlPath) => {
          const parts = urlPath.split('?');
          console.log([parts[0]]);
          console.log([parts[1]]);
          const url = this.router.createUrlTree([parts[0]]);
          console.log(url.toString() + '?' + parts[1]);
          window.open(url.toString() + '?' + parts[1], '_blank');
        });
      });
  }

  createLink(search: string,
             market: string,
             year: number,
             minPrice: number,
             maxPrice: number,
             daysSinceListed: number,
             redirectDelay: number) {
    const query = search.replace(/\{year\}/ig, `${year}`);

    const queryParams: any = {
      query
    };

    if (minPrice) {
      queryParams.minPrice = `${minPrice}`;
    }

    if (maxPrice) {
      queryParams.maxPrice = `${maxPrice}`;
    }

    if (daysSinceListed) {
      queryParams.daysSinceListed = `${daysSinceListed}`;
    }

    let params = new HttpParams({});
    params = params.set('redirectDelay', `${redirectDelay}`);
    params = params.set('site', 'facebook');
    params = params.set('market', market);
    params = params.set('queryParams', JSON.stringify(queryParams));

    return `/FacebookMarketPlaceNationalSearch/redirect?${params.toString()}`;
  }
}

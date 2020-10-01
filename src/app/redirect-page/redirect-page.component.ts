import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { delay, filter, map, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-redirect-page',
  templateUrl: './redirect-page.component.html',
  styleUrls: ['./redirect-page.component.scss']
})
export class RedirectPageComponent implements OnDestroy {
  link$: Observable<string>;
  text$: Observable<string>;

  private finished$ = new Subject();

  constructor(private activatedRoute: ActivatedRoute) {
    this.link$ = this.activatedRoute.queryParams.pipe(
      map((params: Params) => {

        const site = params.site;
        const market = params.market;
        const queryParams = JSON.parse(params.queryParams);

        if (site === 'facebook') {
          let query = new HttpParams({});
          Object.keys(queryParams).forEach((key) => {
            query = query.set(key, queryParams[key]);
          });
          return `https://www.facebook.com/marketplace/${market}/search/?${query.toString()}`;
        }

        return '/';
      })
    );

    this.activatedRoute.queryParams.pipe(
      map((params: Params) => parseInt(params.redirectDelay, 10)),
      filter(redirectDelay => !isNaN(redirectDelay)),
      withLatestFrom(this.link$),
      switchMap(([redirectDelay, url]) => {
        return of(url).pipe(
          delay(redirectDelay)
        );
      }),
      takeUntil(this.finished$)
    ).subscribe((url) => {
      (window.location as any) = url;
    });

    this.text$ = this.activatedRoute.queryParams.pipe(
      map((params: Params) => {
        let text = '';

        const site = params.site;
        const market = params.market;
        const queryParams = JSON.parse(params.queryParams);

        if (site === 'facebook') {
          text = 'Facebook';
          Object.keys(queryParams).forEach((key) => {
            text = `${text}, ${queryParams[key]}`;
          });
          return text;
        }

        return '';
      })
    );
  }

  ngOnDestroy(): void {
    this.finished$.next();
    this.finished$.complete();
  }
}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent implements OnInit {
  public form: FormGroup;
  public marketsFormControl: FormControl;

  marketOptions = [
    'portland_maine',
    'baltimore',
    'chicago',
    '103975982970946', // Southern Georgia
    'littlerock',
    'elpaso',
    'sanfrancisco',
    'denver',
    '105955309435883', // Easter Oregon
    '107920112563829', // Western Wyoming
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.marketsFormControl = new FormControl();
    this.marketsFormControl.patchValue(this.marketOptions);

    this.form = this.fb.group({
      search: ['{YEAR} BMW M3', [Validators.required]],
      markets: this.marketsFormControl,
      minYear: [2009, [Validators.required]],
      maxYear: [2013, [Validators.required]]
    });
  }

  getTabCount() {
    const { markets, minYear, maxYear } = this.form.getRawValue();
    return Math.max(maxYear - minYear + 1, 0) * markets.length;
  }

  submit() {
    if (!this.form.valid) {
      return;
    }

    const { search, markets, minYear, maxYear } = this.form.getRawValue();

    markets.forEach((market) => {
      for (let year = minYear; year <= maxYear; year++) {
        const url = this.createLink(search, market, year);
        window.open(url, '_blank');
      }
    });
  }

  createLink(search: string, market: string, year: number) {
    const query = encodeURI(search.replace(/\{year\}/ig, `${year}`));
    return `https://www.facebook.com/marketplace/${market}/search/?query=${query}`;
  }
}

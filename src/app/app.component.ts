import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
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
      search: ['{YEAR} BMW M3'],
      markets: this.marketsFormControl,
      minYear: [2008],
      maxYear: [2013]
    });
  }

  submit() {
    const raw = this.form.getRawValue();
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
    return `https://www.facebook.com/marketplace/${market}/search?query=${query}`;
  }
}

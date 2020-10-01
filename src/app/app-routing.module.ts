import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchPageComponent } from './search-page/search-page.component';
import { RedirectPageComponent } from './redirect-page/redirect-page.component';


const routes: Routes = [
  {
    path: '',
    component: SearchPageComponent
  },
  {
    path: 'redirect',
    component: RedirectPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

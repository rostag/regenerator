import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'generator',
    pathMatch: 'full',
  }, {
  path: 'generator',
  loadChildren: () => import('../modules/generator/generator.module').then(m => m.GeneratorModule)
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { BrowserModule } from '@angular/platform-browser';
import {NgModule, SystemJsNgModuleLoader} from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsersModule } from './users/users.module';
import {HttpClientModule} from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    UsersModule,
    HttpClientModule,
  ],
  providers: [SystemJsNgModuleLoader],
  bootstrap: [AppComponent]
})
export class AppModule { }

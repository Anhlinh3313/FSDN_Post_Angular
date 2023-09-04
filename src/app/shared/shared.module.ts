import { AgmCoreConfig } from './../infrastructure/agmCore.config';
import { AgmCoreModule } from '@agm/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleplaceDirective } from './directives/google-place.directive';
import { OnlyNumberDirective } from "./directives/only-number.directive";
import { PhoneNumberDirective } from './directives/phone-number.directive';
import { EventListenerComponent } from './components/eventListenerComponent';
import { EventListenerServiceInstance } from '../services/eventListener.serviceInstance';
import { CurrencyFormatterDirective } from './directives/currencyFormat.directive';
import { CurrencyFormatPipe } from '../pipes/currencyFormat.pipe';

@NgModule({
  imports: [
    AgmCoreModule.forRoot(AgmCoreConfig),
    CommonModule,
    FormsModule,
  ],
  declarations: [GoogleplaceDirective, OnlyNumberDirective, CurrencyFormatterDirective, PhoneNumberDirective, EventListenerComponent, CurrencyFormatPipe],
  exports: [GoogleplaceDirective, OnlyNumberDirective,CurrencyFormatterDirective, PhoneNumberDirective, EventListenerComponent, CurrencyFormatPipe],
  providers: [
    EventListenerServiceInstance,
    CurrencyFormatPipe
  ]
})
export class SharedModule { }

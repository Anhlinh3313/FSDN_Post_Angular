import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { CustomerPaymentTotalPriceComponent } from './customer-payment-totalprice/customer-payment-totalprice.component';
import { CustomerPaymentCODComponent } from './customer-payment-cod/customer-payment-cod.component';


const routes: Routes =  [
  { path: Constant.pages.customerPayment.children.customerPaymentTotalPrice.alias, component: CustomerPaymentTotalPriceComponent },
  { path: Constant.pages.customerPayment.children.customerPaymentCOD.alias, component: CustomerPaymentCODComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class CustomerPaymentManagementRoutingModule { }

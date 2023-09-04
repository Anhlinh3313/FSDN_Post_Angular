import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { BillOfLadingNewComponent } from './bill-of-lading-new/bill-of-lading-new.component';
import { BillOfLadingGrantedComponent } from './bill-of-lading-granted/bill-of-lading-granted.component';
import { BillOfLadingWithdrawalComponent } from './bill-of-lading-withdrawal/bill-of-lading-withdrawal.component';

const routes: Routes = [
  { path: Constant.pages.billOfLading.children.billOfLadingNew.alias, component: BillOfLadingNewComponent },
  { path: Constant.pages.billOfLading.children.billOfLadingGranted.alias, component: BillOfLadingGrantedComponent },
  { path: Constant.pages.billOfLading.children.billOfLadingWithdrawal.alias, component: BillOfLadingWithdrawalComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillOfLadingRoutingModule { }

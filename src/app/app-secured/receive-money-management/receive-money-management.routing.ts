import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { ReceiveMoneyFromRiderComponent } from "./receive-money-from-rider/receive-money-from-rider.component";
import { ReceiveMoneyFromHubComponent } from "./receive-money-from-hub/receive-money-from-hub.component";
import { ReceiveMoneyFromAccountantComponent } from "./receive-money-from-accountant/receive-money-from-accountant.component";
import { ConfirmMoneyFromHubComponent } from "./confirm-money-from-hub/confirm-money-from-hub.component";
import { ConfirmMoneyFromEmpComponent } from "./confirm-money-from-emp/confirm-money-from-emp.component";
import { ConfirmMoneyFromAccountantComponent } from "./confirm-money-from-accountant/confirm-money-from-accountant.component";
import { ConfirmMoneyFromHubOtherComponent } from './confirm-money-from-hub-other/confirm-money-from-hub-other.component';
import { ReceiveMoneyFromHubOtherComponent } from './receive-money-from-hub-other/receive-money-from-hub-other.component';
import { ConfirmTransferComponent } from './confirm-transfer/confirm-transfer.component';
const routes: Routes = [
  { path: Constant.pages.receiptMoney.children.comfirmTransfer.alias, component: ConfirmTransferComponent },
  { path: Constant.pages.receiptMoney.children.receiveMoneyFromRider.alias, component: ReceiveMoneyFromRiderComponent },
  { path: Constant.pages.receiptMoney.children.receiveMoneyFromHub.alias, component: ReceiveMoneyFromHubComponent },
  { path: Constant.pages.receiptMoney.children.receiveMoneyFromAccountant.alias, component: ReceiveMoneyFromAccountantComponent },
  { path: Constant.pages.receiptMoney.children.receiveMoneyFromHubOther.alias, component: ReceiveMoneyFromHubOtherComponent },
  { path: Constant.pages.receiptMoney.children.comfirmMoneyFromHub.alias, component: ConfirmMoneyFromHubComponent },
  { path: Constant.pages.receiptMoney.children.comfirmMoneyFromAccountant.alias, component: ConfirmMoneyFromAccountantComponent },
  { path: Constant.pages.receiptMoney.children.comfirmMoneyFromHubOther.alias, component: ConfirmMoneyFromHubOtherComponent },
  { path: Constant.pages.receiptMoney.children.comfirmMoneyFromEmp.alias, component: ConfirmMoneyFromEmpComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class ReceiptMoneyManagementRoutingModule { }

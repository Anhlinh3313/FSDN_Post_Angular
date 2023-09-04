import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { TransferIssueComponent } from './transfer-issue/transfer-issue.component';
import { TransferComponent } from './transfer/transfer.component';
import { TransferListComponent } from "./transfer-list/transfer-list.component";
import { TransferReceiveComponent } from "./transfer-receive/transfer-receive.component";
import { TransferReshipComponent } from "./transfer-reship/transfer-reship.component";
import { TransferHistoryComponent } from "./transfer-history/transfer-history.component";
import { ListProcessErrorComponent } from './list-process-error/list-process-error.component';
import { ListReceivedErrorComponent } from './list-received-error/list-received-error.component';


const routes: Routes = [
  { path: Constant.pages.transfer.children.transferIssue.alias, component: TransferIssueComponent },
  { path: Constant.pages.transfer.children.transfer.alias, component: TransferComponent },
  { path: Constant.pages.transfer.children.transferList.alias, component: TransferListComponent },
  { path: Constant.pages.transfer.children.transferReceive.alias, component: TransferReceiveComponent },
  { path: Constant.pages.transfer.children.transferReship.alias, component: TransferReshipComponent },
  { path: Constant.pages.transfer.children.transferHistory.alias, component: TransferHistoryComponent },
  { path: Constant.pages.transfer.children.listProcessError.alias, component: ListProcessErrorComponent },
  { path: Constant.pages.transfer.children.listReceivedError.alias, component: ListReceivedErrorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class TransferManagementRoutingModule { }

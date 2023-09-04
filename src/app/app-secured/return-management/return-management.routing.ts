import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { ReturnComponent } from './return-new/return-new.component';
import { UpdateReturnStatusComponent } from './update-return-status/update-return-status.component';
import { ReturnHistoryComponent } from './return-history/return-history.component';
import { AcceptReturnComponent } from './accept-return/accept-return.component';
import { CancelReturnComponent } from './cancel-return/cancel-return.component';
import { WaitReturnComponent } from './wait-return/wait-return.component';

const routes: Routes = [
  { path: Constant.pages.return.children.return.alias, component: ReturnComponent },
  { path: Constant.pages.return.children.updateReturnStatus.alias, component: UpdateReturnStatusComponent },
  { path: Constant.pages.return.children.returnhistory.alias, component: ReturnHistoryComponent },
  { path: Constant.pages.return.children.cancelreturn.alias, component: CancelReturnComponent },
  { path: Constant.pages.return.children.acceptReturn.alias, component: AcceptReturnComponent },
  { path: Constant.pages.return.children.waitReturn.alias, component: WaitReturnComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class ReturnManagementRoutingModule { }

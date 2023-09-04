import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { InventoryComponent } from './inventory/inventory.component';
import { WarehousingComponent } from './warehousing/warehousing.component';
import { WarehousingRequestComponent } from './warehousingRequest/warehousingRequest.component';
import { WareHousingCheckComponent } from './wareHousingCheck/wareHousingCheck.component';
import { IssueHistoryComponent } from './issue-history/issue-history.component';
import { WareHousingHistoryComponent } from './ware-housing-history/ware-housing-history.component';

//

const routes: Routes = [
  { path: Constant.pages.warehouse.children.inventory.alias, component: InventoryComponent },
  { path: Constant.pages.warehouse.children.warehousing.alias, component: WarehousingComponent },
  { path: Constant.pages.warehouse.children.warehousingRequest.alias, component: WarehousingRequestComponent },
  { path: Constant.pages.warehouse.children.wareHousingCheck.alias, component: WareHousingCheckComponent },
  { path: Constant.pages.warehouse.children.issueHistory.alias, component: IssueHistoryComponent },
  { path: Constant.pages.warehouse.children.wareHousingHistory.alias, component: WareHousingHistoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class WarehouseManagementRoutingModule { }

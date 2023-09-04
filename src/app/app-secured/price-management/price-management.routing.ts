import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { AreaGroupComponent } from './area-group/area-group.component';
import { AreaComponent } from './area/area.component';
import { WeightGroupComponent } from './weight-group/weight-group.component';
import { WeightComponent } from './weight/weight.component';
import { FormulaComponent } from './formula/formula.component';
import { PriceListComponent } from './price-list/price-list.component';
import { PriceServiceComponent } from './price-service/price-service.component';
import { ServiceDVGTPriceComponent } from './service-dvgt-price/service-dvgt-price.component';
import { PriceServiceDetailComponent } from './price-service-detail/price-service-detail.component';
import { PriceServiceDetailExcelComponent } from './price-service-detail-excel/price-service-detail-excel.component';
import { ChargedCODComponent } from './charged-cod/charged-cod.component';
import { ChargedRemoteComponent } from './charged-remote/charged-remote.component';
import { ServiceDVGTPriceDetailComponent } from './service-dvgt-price-detail/service-dvgt-price-detail.component';
import { PackagePriceListComponent } from './package-price-list/package-price-list.component';
import { CheckPriceComponent } from './check-price/check-price.component';

const routes: Routes =  [
    { path: Constant.pages.price.children.areaGroup.alias, component: AreaGroupComponent },
    { path: Constant.pages.price.children.area.alias, component: AreaComponent },
    { path: Constant.pages.price.children.weightGroup.alias, component: WeightGroupComponent },
    { path: Constant.pages.price.children.weight.alias, component: WeightComponent },
    { path: Constant.pages.price.children.formula.alias, component: FormulaComponent },
    { path: Constant.pages.price.children.priceList.alias, component: PriceListComponent },
    { path: Constant.pages.price.children.priceService.alias, component: PriceServiceComponent },
    { path: Constant.pages.price.children.serviceDVGTPrice.alias, component: ServiceDVGTPriceComponent },
    { path: Constant.pages.price.children.serviceDVGTPriceDetail.alias, component: ServiceDVGTPriceDetailComponent },
    { path: Constant.pages.price.children.packagePrice.alias, component: PackagePriceListComponent },
    { path: Constant.pages.price.children.priceServiceDetail.alias, component: PriceServiceDetailComponent },
    { path: Constant.pages.price.children.priceServiceDetailExcel.alias, component: PriceServiceDetailExcelComponent },
    { path: Constant.pages.price.children.chargedCOD.alias, component: ChargedCODComponent },
    { path: Constant.pages.price.children.chargedRemote.alias, component: ChargedRemoteComponent },
    { path: Constant.pages.price.children.checkPrice.alias, component: CheckPriceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class PriceManagementRoutingModule { }

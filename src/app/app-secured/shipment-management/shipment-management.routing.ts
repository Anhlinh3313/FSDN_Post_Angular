import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { CreateShipmentComponent } from './create-shipment/create-shipment.component';
import { CreateShipmentExcelComponent } from './create-shipment-excel/create-shipment-excel.component';
import { IncidentManagementComponent } from './incident-management/incident-management.component';
import { ShipmentAwaitingComponent } from './shipment-awaiting/shipment-awaiting.component';
import { ListShipmentComponent } from './list-shipment/list-shipment.component';
import { ShipmentComplainComponent } from './shipment-complain/shipment-complain.component';
import { ShipmentPrioritizeComponent } from './shipment-prioritize/shipment-prioritize.component';
import { ManagementCompensationComponent } from './management-compensation/management-compensation.component';
import { ManagementDelayComponent } from './management-delay/management-delay.component';
import { CreateShipmentExcelBetaComponent } from './create-shipment-excel-beta/create-shipment-excel-beta.component';
import { ManagementEditCODComponent } from './management-edit-cod/management-edit-cod.component';
import { EditCodComponent } from '../cod-management/edit-cod/edit-cod.component';

const routes: Routes =  [
    { path: Constant.pages.shipment.children.createShipment.alias, component: CreateShipmentComponent },
    { path: Constant.pages.shipment.children.createShipmentExcel.alias, component: CreateShipmentExcelComponent },
    { path: Constant.pages.shipment.children.createShipmentExcelBeta.alias, component: CreateShipmentExcelBetaComponent },
    { path: Constant.pages.shipment.children.shipmentAwaiting.alias, component: ShipmentAwaitingComponent },
    { path: Constant.pages.shipment.children.incidentManagement.alias, component: IncidentManagementComponent },
    { path: Constant.pages.shipment.children.listShipment.alias, component: ListShipmentComponent },
    { path: Constant.pages.shipment.children.shipmentComplain.alias, component: ShipmentComplainComponent },
    { path: Constant.pages.shipment.children.shipmentPrioritize.alias, component: ShipmentPrioritizeComponent },
    { path: Constant.pages.shipment.children.managementCompensation.alias, component: ManagementCompensationComponent },
    { path: Constant.pages.shipment.children.managementDelay.alias, component: ManagementDelayComponent },
    { path: Constant.pages.shipment.children.managementEditCOD.alias, component: EditCodComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class ShipmentManagementRoutingModule { }

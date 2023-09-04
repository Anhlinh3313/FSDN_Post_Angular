import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { DeadlinePickupDeliveryComponent } from './deadline-pickup-delivery/deadline-pickup-delivery.component';
import { DeadlinePickupDeliveryDetailExcelComponent } from './deadline-pickup-delivery-detail-excel/deadline-pickup-delivery-detail-excel.component';
import { CreateDeadlinePickupDeliveryDetailExcelComponent } from './create-deadline-pickup-delivery-detail-excel/create-deadline-pickup-delivery-detail-excel.component';
import { EditDeadlinePickupDeliveryDetailExcelComponent } from './edit-deadline-pickup-delivery-detail-excel/edit-deadline-pickup-delivery-detail-excel.component';

const routes: Routes =  [
    { path: Constant.pages.deadline.children.deadlineManagement.alias, component: DeadlinePickupDeliveryComponent },
    { path: Constant.pages.deadline.children.deadlineUploadExcelManagement.alias, component: DeadlinePickupDeliveryDetailExcelComponent },
    { path: Constant.pages.deadline.children.createDeadlineUploadExcelManagement.alias, component: CreateDeadlinePickupDeliveryDetailExcelComponent },
    { path: Constant.pages.deadline.children.editDeadlineUploadExcelManagement.alias, component: EditDeadlinePickupDeliveryDetailExcelComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class DeadlineManagementRouting { }

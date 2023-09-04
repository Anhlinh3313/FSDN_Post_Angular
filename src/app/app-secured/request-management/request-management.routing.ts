import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { RequestManagementComponent } from "./request-management/request-management.component";

const routes: Routes =  [
    { path: Constant.pages.request.children.listRequest.alias, component: RequestManagementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class RequestManagementRoutingModule { }

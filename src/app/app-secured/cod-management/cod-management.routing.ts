import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { EditCodComponent } from './edit-cod/edit-cod.component';
// 

const routes: Routes =  [
    { path: Constant.pages.codManagement.children.editCOD.alias, component: EditCodComponent }, 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class CodManagementRouting { }

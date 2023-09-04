import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { PackComponent } from './pack/pack.component';
import { OpenPackComponent } from "./open-pack/openPack.component";
import { ListPackageComponent } from './list-package/list-package.component';

const routes: Routes =  [
    { path: Constant.pages.pack.children.package.alias, component: PackComponent },
    { path: Constant.pages.pack.children.openPack.alias, component: OpenPackComponent },
    { path: Constant.pages.pack.children.listPackage.alias, component: ListPackageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class PackManagementRoutingModule { }

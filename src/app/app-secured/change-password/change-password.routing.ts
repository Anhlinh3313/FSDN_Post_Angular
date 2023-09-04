import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { ChangePassWordComponent } from './change-password.component';

//

const routes: Routes = [
    { path: Constant.pages.changePassWord.children.changePassWord.alias, component: ChangePassWordComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: []
})
export class ChangePasswordRoutingModule { }

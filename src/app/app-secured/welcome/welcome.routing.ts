import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { WelcomeComponent } from './welcome.component';

//

const routes: Routes = [
    { path: Constant.pages.dashBoard.children.dashBoard.alias, component: WelcomeComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: []
})
export class WelcomeRoutingModule { }

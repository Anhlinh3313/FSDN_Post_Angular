import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
import { GPSLocationComponent } from './gps-location.component';

//

const routes: Routes = [
    { path: Constant.pages.gpsLocation.children.gpsLocation.alias, component: GPSLocationComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    declarations: []
})
export class GpsLocationRoutingModule { }

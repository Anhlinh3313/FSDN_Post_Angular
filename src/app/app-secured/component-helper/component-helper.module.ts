import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedSecuredModule } from '../shared/shared-secured.module';

import { PopoverModule } from 'ngx-bootstrap/popover';
import { DropdownModule, InputSwitchModule, DataTableModule, CheckboxModule, AutoCompleteModule, PanelModule } from 'primeng/primeng';
import { BoxServiceInstance } from '../../services/box.serviceInstance';
import { BoxComponent } from './shipment/box-helper.component';
import { ImagePickUpComponent } from './image-pick-up/image-pick-up.component';
import { ImagePickupServiceInstance } from '../../services/imagePickup.serviceInstance';
import { UpdateBillOfRequestComponent } from './shipment/update-bill-of-request/update-bill-of-request.component';
import { PrintModule } from '../print-form/print.module';
import { UploadService } from '../../services';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedSecuredModule,
    PopoverModule.forRoot(),
    DropdownModule,
    InputSwitchModule,
    DataTableModule,
    PrintModule,
    CheckboxModule,
    AutoCompleteModule,
    PanelModule,
  ],
  declarations: [
    BoxComponent,
    ImagePickUpComponent,
    UpdateBillOfRequestComponent,
  ],
  exports:  [
    BoxComponent,
    ImagePickUpComponent,
    UpdateBillOfRequestComponent,
  ],
  providers: [
    BoxServiceInstance,
    ImagePickupServiceInstance,
    UploadService
  ],
})

export class ComponentHelperModule { }
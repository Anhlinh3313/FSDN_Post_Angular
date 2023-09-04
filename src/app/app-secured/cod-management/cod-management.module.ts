import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditCodComponent } from './edit-cod/edit-cod.component';
import {  CodManagementRouting } from './cod-management.routing'; 
import { PrintModule } from '../print-form/print.module';
import { FormsModule } from '@angular/forms';
import { ModalModule, TooltipModule, BsModalService } from 'ngx-bootstrap'; 
import { TreeTableModule, DataTableModule, DropdownModule, CheckboxModule, MultiSelectModule,   CalendarModule, AutoCompleteModule, InputMaskModule } from 'primeng/primeng';
import { TableModule } from 'primeng/table';
import { ChangeCODTypeService } from '../../services/changeCODType.service';
import { ChangeCODService } from '../../services/changeCOD.service';
import { UserService, ServiceDVGTService, ShipmentService, AuthService, FormPrintService } from '../../services';
import { PermissionService } from '../../services/permission.service';
import { GeneralInfoService } from '../../services/generalInfo.service';
import { PrintFrormServiceInstance } from '../../services/printTest.serviceInstace';
import { SharedModule } from '../../shared/shared.module'; 
import { CurrencyFormatPipe } from '../../pipes/currencyFormat.pipe';

@NgModule({
  declarations: [EditCodComponent],
  imports: [
    CommonModule,
    CodManagementRouting,
    PrintModule, 
    FormsModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(), 
    TreeTableModule,
    DataTableModule,
    DropdownModule,
    MultiSelectModule,
    CheckboxModule,
    TableModule,
    CalendarModule,
    AutoCompleteModule,
    InputMaskModule,
    SharedModule, 
  ],
  providers: [
    ChangeCODTypeService,
    ChangeCODService,  
    UserService,
    PermissionService,
    BsModalService,
    ServiceDVGTService,
    ShipmentService,
    AuthService,
    GeneralInfoService,
    PrintFrormServiceInstance,
    FormPrintService,
    CurrencyFormatPipe
  ], 
})
export class CodManagementModule { }

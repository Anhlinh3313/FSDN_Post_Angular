import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabsModule } from 'ngx-bootstrap';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';

import { BillOfLadingRoutingModule } from './bill-of-lading-routing.module';
import { BillOfLadingNewComponent } from './bill-of-lading-new/bill-of-lading-new.component';
import { BillOfLadingGrantedComponent } from './bill-of-lading-granted/bill-of-lading-granted.component';
import { BillOfLadingWithdrawalComponent } from './bill-of-lading-withdrawal/bill-of-lading-withdrawal.component';
import { HubService, UserService, CustomerService } from '../../services';
import { MessageService } from '../../../../node_modules/primeng/components/common/messageservice';
import { PermissionService } from '../../services/permission.service';
import { OnlyNumberDirective } from '../../shared/directives/only-number.directive';
import { SharedModule } from '../../shared/shared.module';
import { ProvideCodeService } from '../../services/provideCode.service';
import { PrintFrormServiceInstance } from '../../services/printTest.serviceInstace';
import { PrintModule } from '../print-form/print.module';
import { ProvinceCodeStatusService } from '../../services/provideCodeStatus.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TabsModule.forRoot(),
    BillOfLadingRoutingModule,
    TableModule,
    DropdownModule,
    SharedModule,
    PrintModule
  ],
  declarations: [BillOfLadingNewComponent, BillOfLadingGrantedComponent, BillOfLadingWithdrawalComponent],
  providers: [
    HubService,
    UserService,
    CustomerService,
    PermissionService,
    ProvideCodeService,
    PrintFrormServiceInstance,
    ProvinceCodeStatusService
  ]
})
export class BillOfLadingModule { }

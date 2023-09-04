import { NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { Constant } from '../../infrastructure/constant';
//
import { ServiceComponent } from './service/service.component';
import { PaymentTypeComponent } from './paymentType/paymentType.component';
import { StructureComponent } from './structure/structure.component';
import { PackTypeComponent } from './packType/packType.component';
import { ServiceDVGTComponent } from "./serviceDVGT/serviceDVGT.component";
import { ReasonComponent } from "./reason/reason.component";
import { SizeComponent } from './size/size.component';
import { TransportTypeComponent } from './transPortType/transPortType.component';
import { PrintBillManagementComponent } from './print-bill-management/print-bill-management.component';
import { HolidayComponent } from './holiday/holiday.component';
import { ReasonComplainComponent } from './reason-complain/reason-complain.component';
import { AccountBankComponent } from './account-bank/account-bank.component';
import { AccountingAccountComponent } from './accountingAccount/accountingAccount.component';
import { ChangeCODTypeComponent } from './change-cod-type/change-cod-type.component';
import { CashFlowComponent } from './cash-flow/cash-flow.component';

const routes: Routes =  [
    { path: Constant.pages.general.children.service.alias, component: ServiceComponent },
    { path: Constant.pages.general.children.paymentType.alias, component: PaymentTypeComponent },
    { path: Constant.pages.general.children.structure.alias, component: StructureComponent },
    { path: Constant.pages.general.children.packType.alias, component: PackTypeComponent },
    { path: Constant.pages.general.children.serviceDVGT.alias, component: ServiceDVGTComponent},
    { path: Constant.pages.general.children.reason.alias, component: ReasonComponent},
    { path: Constant.pages.general.children.reasonComplain.alias, component: ReasonComplainComponent},
    { path: Constant.pages.general.children.size.alias, component: SizeComponent},
    { path: Constant.pages.general.children.transportType.alias, component: TransportTypeComponent},
    { path: Constant.pages.general.children.PrintBillManagement.alias, component: PrintBillManagementComponent},
    { path: Constant.pages.general.children.Holiday.alias, component: HolidayComponent},
    { path: Constant.pages.general.children.AccountBank.alias, component: AccountBankComponent},
    { path: Constant.pages.general.children.AccountingAccount.alias, component: AccountingAccountComponent},
    { path: Constant.pages.general.children.changeCodType.alias, component: ChangeCODTypeComponent},
    { path: Constant.pages.general.children.cashFlow.alias, component: CashFlowComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports:[RouterModule],
  declarations: []
})
export class GeneralManagementRoutingModule { }

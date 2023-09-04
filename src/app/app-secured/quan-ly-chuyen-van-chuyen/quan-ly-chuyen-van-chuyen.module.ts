import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuanLyChuyenVanChuyenRoutingModule } from './quan-ly-chuyen-van-chuyen-routing.module';
import { QuanLyChuyenXeComponent } from './quan-ly-chuyen-xe/quan-ly-chuyen-xe.component';
import { TableModule } from '../../../../node_modules/primeng/table';
import { DropdownModule } from '../../../../node_modules/primeng/primeng';
import { FormsModule } from '../../../../node_modules/@angular/forms';
import { TruckScheduleService } from '../../services/truckSchedule.service';
import { TruckScheduleStatusService } from '../../services/truckScheduleStatus.service';
import { TruckService } from '../../services/truck.service';
import { TabsModule } from '../../../../node_modules/ngx-bootstrap';
import { UserService, HubService, ListGoodsService } from '../../services';
import { Daterangepicker } from 'ng2-daterangepicker';
import { PrintModule } from '../print-form/print.module';
import { MultiSelectModule } from 'primeng/multiselect';
import { DongSealComponent } from './dong-seal/dong-seal.component';
import { MoSealComponent } from './mo-seal/mo-seal.component';
import { PrintFrormServiceInstance } from '../../services/printTest.serviceInstace';
import { TraCuuXeComponent } from './tra-cuu-xe/tra-cuu-xe.component';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  imports: [
    CommonModule,
    TabsModule.forRoot(),
    QuanLyChuyenVanChuyenRoutingModule,
    TableModule,
    DropdownModule,
    FormsModule,
    Daterangepicker,
    PrintModule,
    MultiSelectModule,
    CalendarModule
  ],
  declarations: [QuanLyChuyenXeComponent, DongSealComponent, MoSealComponent, TraCuuXeComponent],
  providers: [
    TruckScheduleService,
    TruckScheduleStatusService,
    TruckService,
    UserService,
    PrintFrormServiceInstance,
    HubService,
    ListGoodsService
  ]
})
export class QuanLyChuyenVanChuyenModule { }

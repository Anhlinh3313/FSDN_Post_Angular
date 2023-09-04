import { Component, OnInit } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService } from '../../../../../node_modules/primeng/components/common/messageservice';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '../../../../../node_modules/@angular/router';
import { TruckScheduleService } from '../../../services/truckSchedule.service';
import { TruckSchedule } from '../../../models/truckSchedule.model';
import { User } from '../../../models';

@Component({
  selector: 'app-dong-seal',
  templateUrl: './dong-seal.component.html',
  styles: []
})
export class DongSealComponent extends BaseComponent implements OnInit {

  constructor(protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
    private truckScheduleService: TruckScheduleService) {
    super(messageService, permissionService, router)
  }

  //Page name
  parentPage: string = Constant.pages.quanLyChuyen_VanChuyen.name;
  currentPage: string = Constant.pages.quanLyChuyen_VanChuyen.children.dongSeal.name;
  //

  //Data
  data: TruckSchedule = new TruckSchedule();
  truckScheduleCode: string;
  sealNumber: string;
  //

  ngOnInit() {
  }

  //#region Data
  showRiders(riders: User[]) {
    var ridersName = "";
    if (riders && riders.length > 0) {
      ridersName = riders.map(x => x.fullName).join(", ");
    }
    return ridersName;
  }
  //#endregion

  //#region Nút xủ lý
  refresh() {
    this.data = new TruckSchedule();
    this.truckScheduleCode = "";
    this.sealNumber = "";
  }

  async scanTruckScheduleCode() {
    if (!this.truckScheduleCode) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã chuyến"
      });
      return;
    }

    let cols = [
      Constant.classes.includes.truckSchedule.fromHub,
      Constant.classes.includes.truckSchedule.toHub,
      Constant.classes.includes.truckSchedule.truckScheduleStatus,
      Constant.classes.includes.truckSchedule.truck
    ];

    let res = await this.truckScheduleService.GetByCode(this.truckScheduleCode, cols);
    if (!res.isSuccess) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: res.message
      });
      this.refresh();
    }
    else {
      this.data = res.data;
    }
  }

  async scanSealNumber() {
    if (!this.sealNumber) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập số seal"
      });
      return;
    }

    let model = {
      truckScheudleNumber: this.data.code,
      sealNumber: this.sealNumber
    };

    let res = await this.truckScheduleService.CloseSeal(model);
    if (res.isSuccess) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Đóng seal thành công"
      });
      this.refresh();
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: res.message
      });
    }
  }
  //#endregion
}

import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService } from '../../../../../node_modules/primeng/components/common/messageservice';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '../../../../../node_modules/@angular/router';
import { Constant } from '../../../infrastructure/constant';
import { TruckSchedule } from '../../../models/truckSchedule.model';
import { TruckScheduleService } from '../../../services/truckSchedule.service';
import { User } from '../../../models';

@Component({
  selector: 'app-mo-seal',
  templateUrl: './mo-seal.component.html',
  styles: []
})
export class MoSealComponent extends BaseComponent implements OnInit {

  constructor(protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
    private truckScheduleService: TruckScheduleService) {
    super(messageService, permissionService, router)
  }

  //Page name
  parentPage: string = Constant.pages.quanLyChuyen_VanChuyen.name;
  currentPage: string = Constant.pages.quanLyChuyen_VanChuyen.children.moSeal.name;
  //

  //Data
  data: TruckSchedule = new TruckSchedule();
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
    this.sealNumber = "";
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
      sealNumber: this.sealNumber
    };

    let res = await this.truckScheduleService.OpenSeal(model);
    if (res.isSuccess) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Mở seal thành công"
      });

      let cols = [
        Constant.classes.includes.truckSchedule.fromHub,
        Constant.classes.includes.truckSchedule.toHub,
        Constant.classes.includes.truckSchedule.truckScheduleStatus,
        Constant.classes.includes.truckSchedule.truck
      ];

      let truckSchedule = await this.truckScheduleService.GetByCode(res.data.code, cols);
      this.data = truckSchedule.data;
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: res.message
      });
      this.refresh();
    }
  }
  //#endregion
}


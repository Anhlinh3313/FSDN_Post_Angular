import { Component, OnInit, TemplateRef } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ShipmentDetailComponent } from '../../shipment-detail/shipment-detail.component';
import { MessageService } from 'primeng/components/common/messageservice';
import { ShipmentService, RequestShipmentService, HubService, UserService } from '../../../services/index';
import { Shipment } from '../../../models/shipment.model';
import { Constant } from '../../../infrastructure/constant';
import { User, Hub } from '../../../models';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
// import { ShipmentDetailComponent } from '../../shipment-detail/shipment-detail.component';


@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styles: []
})

export class HeaderComponent implements OnInit {
  //#region params báic
  shipmentName: string = "Vận đơn";
  requesrShipmentName: string = "Yêu cầu";
  //#endregion
  phoneModal: BsModalRef;
  gbModelRef: BsModalRef;
  searchShipmentNumberGB: string;
  userFullName: string = "";
  hubName: string = "";
  selectedShipmentType: boolean = true;
  account: User;
  list_unit_hub: SelectModel[] = [];
  selected_hub: number;
  checkUpdate: boolean;
  selected_data: Hub;
  constructor(private authService: AuthService, private modalService: BsModalService, protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private authServica: AuthService,
    private requestShipmentService: RequestShipmentService,
    public permissionService: PermissionService,
    public router: Router,
    public hubService: HubService,
    public userService: UserService
  ) {
  }

  async ngOnInit() {
    this.userFullName = this.authService.getFullName();
    this.load_hub();
    this.loadAccount();
  }
  //
  modalTitle: string;
  bsModalRef: BsModalRef;
  seriNumber: any;
  //
  public phoneNumber: string;

  public logOut() {
    this.authService.logout();
  }
  loadAccount() {
    this.selected_hub = null;
    this.authService.getAccountInfoAsync().then(x => {
      this.account = x;
      if (this.account) {
        if (this.account.hub) {
          this.hubName = this.account.hub.name;
          this.selected_hub = this.account.hubId;
        }
        if (this.account.role) {
          if (this.account.roles.length > 0) {
            this.account.roleName = this.account.roles.map(x => x.name).join(", ");
          }
        }
      }
    });
  }
  async updateCurrenthub(data: Hub) {
    if (data != null) {
      this.account.hubId = data.id;
      let res = await this.authServica.updateHubIdUser(this.account).toPromise();
      if (res.isSuccess == true) {
        this.messageService.add({
          severity: Constant.messageStatus.success, detail: "Chuyển đơn vị làm việc thành công!",
        });
        this.bsModalRef.hide();
        window.location.reload();
      }
      else {
        this.messageService.add({
          severity: Constant.messageStatus.warn, detail: "Chuyển đơn vị làm việc không thành công!",
        });
      }
    }
  }
  async load_hub() {
    this.list_unit_hub = [];
    let res = await this.hubService.getHubManage().toPromise();
    if (res.data != null) {
      res.data.forEach(x => {
        this.list_unit_hub.push({ value: x.id, label: `${x.name}`, data: x });
      });
    }
    return this.list_unit_hub;
  }

  async openModelConfim(template: TemplateRef<any>, id: number) {
    let res = await this.list_unit_hub.find(x => (x.value && x.value == id));
    console.log(this.list_unit_hub);
    if (res != null)
      this.selected_data = res.data;
    this.checkUpdate = null;
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });

  }
  async onEnterSearchGB(template) {
    this.gbModelRef = this.modalService.show(ShipmentDetailComponent, { class: 'inmodal animated bounceInRight modal-1000' });
    let includes = [
      Constant.classes.includes.shipment.fromHub,
      Constant.classes.includes.shipment.toHub,
      Constant.classes.includes.shipment.fromWard,
      Constant.classes.includes.shipment.fromDistrict,
      Constant.classes.includes.shipment.fromProvince,
      Constant.classes.includes.shipment.fromHub,
      Constant.classes.includes.shipment.toWard,
      Constant.classes.includes.shipment.toDistrict,
      Constant.classes.includes.shipment.toProvince,
      Constant.classes.includes.shipment.shipmentStatus,
      Constant.classes.includes.shipment.paymentType,
      Constant.classes.includes.shipment.service,
      Constant.classes.includes.shipment.serviceDVGT,
      Constant.classes.includes.shipment.listGoods,
      Constant.classes.includes.shipment.fromHubRouting,
      Constant.classes.includes.shipment.toHubRouting,
    ];

    if (this.selectedShipmentType) {
      const data = await this.shipmentService.getByShipmentNumberAsync(this.searchShipmentNumberGB.trim());
      if (data) {
        const ladingSchedule = await this.shipmentService.getGetLadingScheduleAsync(data.id);
        if (ladingSchedule) {
          data.ladingSchedules = ladingSchedule;
        }
        this.gbModelRef.content.loadData(data, this.selectedShipmentType, true);
        this.searchShipmentNumberGB = null;
      }
    } else if (!this.selectedShipmentType) {
      this.requestShipmentService.trackingShort(this.searchShipmentNumberGB.trim(), includes).subscribe(
        x => {
          if (x.isSuccess == false) return;
          this.gbModelRef.content.loadData(x.data as Shipment, this.selectedShipmentType);;
          this.searchShipmentNumberGB = null;
        }
      );
    }
  }
  openModel(template: TemplateRef<any>) {
    this.seriNumber = this.account.seriNumber;
    this.modalTitle = "Kết nối port";
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });

  }
  save() {
    // localStorage.setItem('portName', this.seriNumber);
    this.authServica.UpdateSeriNumber(this.seriNumber).subscribe(x => {
      if (x.isSuccess == false) return;
      this.messageService.add({
        severity: Constant.messageStatus.success, detail: "Kết nối port thành công!",
      });
      this.seriNumber = null;
      this.loadAccount();
      this.bsModalRef.hide();
    })
  }
  clickClearMessage() {
    this.messageService.clear();
  }
  async closeModel() {
    this.selected_hub = this.account.hubId;
    this.bsModalRef.hide();
  }
}


import { Component, OnInit } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { BsModalRef } from '../../../../../node_modules/ngx-bootstrap/modal';
import { SelectModel } from '../../../models/select.model';
import { CustomerService, HubService, UserService } from '../../../services';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '../../../../../node_modules/@angular/router';
import { Message } from '../../../../../node_modules/primeng/primeng';
import { environment } from '../../../../environments/environment';
import { MessageService } from '../../../../../node_modules/primeng/components/common/messageservice';
import { ProvinceCode } from '../../../models/provinceCode.model';
import { ProvideCodeService } from '../../../services/provideCode.service';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { ProvinceCodeStatusService } from '../../../services/provideCodeStatus.service';

@Component({
  selector: 'app-bill-of-lading-new',
  templateUrl: './bill-of-lading-new.component.html',
  styles: []
})
export class BillOfLadingNewComponent extends BaseComponent implements OnInit {

  constructor(private hubService: HubService,
    private userService: UserService,
    private customerService: CustomerService,
    protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
    private provideCodeService: ProvideCodeService,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    private provinceCodeStatusService: ProvinceCodeStatusService) {
    super(messageService, permissionService, router)
  }

  //Page name
  parentPage: string = Constant.pages.billOfLading.name;
  currentPage: string = Constant.pages.billOfLading.children.billOfLadingNew.name;
  //

  //Enviroment
  envir = environment;
  shortName = environment.centerHubSortName + "/" + environment.poHubSortName + "/" + environment.stationHubSortName;
  //

  //Dropdown
  hubs: SelectModel[] = [];

  users_tab1: SelectModel[] = [];
  users_tab2: SelectModel[] = [];

  customers: SelectModel[] = [];
  //

  //Data
  cloneSelectCode: any[];
  idPrint: string;

  lstData_tab1: ProvinceCode[] = [];
  lstData_tab2: ProvinceCode[] = [];
  lstData_tab3: ProvinceCode[] = [];

  data_tab1 = {
    selectedHub: null,
    selectedUser: null,
    selectedCustomer: null,
    preFix: null,
    length: 7,
    count: null,
    provideCodeStatusId: 1
  }

  data_tab2 = {
    selectedHub: null,
    selectedUser: null,
    selectedCustomer: null,
    preFix: null,
    length: 7,
    numberStart: null,
    numberEnd: null,
    provideCodeStatusId: 1
  }

  data_tab3 = {
    count: null
  }
  //

  ngOnInit() {
    this.loadHub();
    this.loadCustomer();
  }

  //#region Dropdown
  async loadHub() {
    this.hubs = await this.hubService.getAllHubSelectModelAsync();
  }

  async loadCustomer() {
    this.customers = await this.customerService.getAllSelectModelAsync();
  }

  async loadUserByHubID_tab1() {
    this.users_tab1 = await this.userService.getSelectModelEmpByHubIdAsync(this.data_tab1.selectedHub);
  }

  async loadUserByHubID_tab2() {
    this.users_tab2 = await this.userService.getSelectModelEmpByHubIdAsync(this.data_tab2.selectedHub);
  }
  //#endregion

  //#region Nút xử lý
  async confirm(data: any, tabNumber: number) {
    if (!this.isValidData(data)) return;

    let res = await this.saveData(data);

    if (tabNumber == 1)
      this.lstData_tab1 = res;
    else if (tabNumber == 2)
      this.lstData_tab2 = res;
    else
      this.lstData_tab3 = res;
  }

  async saveData(data: any) {
    var model = new ProvinceCode();
    model.provideHubId = data.selectedHub ? data.selectedHub : null;
    model.provideUserId = data.selectedUser ? data.selectedUser : null;
    model.provideCustomerId = data.selectedCustomer ? data.selectedCustomer : null;
    model.preFix = data.preFix ? data.preFix : "";
    model.count = data.count ? data.count : 0;
    model.length = data.length ? data.length : 7;
    model.numberStart = data.numberStart ? data.numberStart : 0;
    model.numberEnd = data.numberEnd ? data.numberEnd : 0;
    model.provideCodeStatusId = 1;

    let res = await this.provideCodeService.provideAsync(model);
    return res;
  }

  async print(data: ProvinceCode[]) {
    if (data.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Danh sách trống"
      });
      return;
    }

    this.cloneSelectCode = await this.sendSelectDataPrintMultiCode(data);
    if (this.cloneSelectCode) {
      this.idPrint = PrintHelper.printCodeStickerDetailShipment;
      setTimeout(() => {
        this.printFrormServiceInstance.sendCustomEvent(this.cloneSelectCode);
      }, 0);
    }
  }

  async sendSelectDataPrintMultiCode(data: ProvinceCode[]): Promise<any> {
    const cloneSelectCode: any = data;
    cloneSelectCode.forEach(item => {
      item.fakeId = "id" + item.id;
      item.shipmentNumber = item.code;
    });
    return cloneSelectCode;
  }

  isValidData(data: any) {
    let result: boolean = true;
    let messages: Message[] = [];

    if ('selectedHub' in data && !data.selectedHub) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa cấp cho " + this.shortName
      });
      result = false;
    }

    if ('selectedUser' in data && !data.selectedUser) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa cấp cho nhân viên"
      });
      result = false;
    }

    // if ('selectedCustomer' in data && !data.selectedCustomer) {
    //   messages.push({
    //     severity: Constant.messageStatus.warn,
    //     detail: "Chưa cấp cho khách hàng"
    //   });
    //   result = false;
    // }

    if ('preFix' in data && !data.preFix) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập ký tự đầu"
      });
      result = false;
    }

    if ('count' in data && !data.count) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập số lượng vận đơn cấp"
      });
      result = false;
    }

    if ('length' in data && !data.length) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập chiều dài mã"
      });
      result = false;
    }

    if ('numberStart' in data && !data.numberStart) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập số bắt đầu"
      });
      result = false;
    }

    if ('numberEnd' in data && !data.numberEnd) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập số kết thúc"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.clear();
      this.messageService.addAll(messages);
    }

    return result;
  }

  reset() {
    this.lstData_tab3 = [];
  }
  //#endregion
}

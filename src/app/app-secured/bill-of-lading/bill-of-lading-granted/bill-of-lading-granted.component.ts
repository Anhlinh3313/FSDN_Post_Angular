import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { HubService, UserService, CustomerService } from '../../../services';
import { MessageService } from '../../../../../node_modules/primeng/components/common/messageservice';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '../../../../../node_modules/@angular/router';
import { ProvideCodeService } from '../../../services/provideCode.service';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { ProvinceCodeStatusService } from '../../../services/provideCodeStatus.service';
import { Constant } from '../../../infrastructure/constant';
import { environment } from '../../../../environments/environment';
import { SelectModel } from '../../../models/select.model';
import { ProvinceCode } from '../../../models/provinceCode.model';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { Table } from '../../../../../node_modules/primeng/table';

@Component({
  selector: 'app-bill-of-lading-granted',
  templateUrl: './bill-of-lading-granted.component.html',
  styles: []
})
export class BillOfLadingGrantedComponent extends BaseComponent implements OnInit {

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
  selectedHub: number;

  users: SelectModel[] = [];
  selectedUser: number;

  customers: SelectModel[] = [];
  selectedCustomer: number;

  provinceCodeStatus: any[] = [];
  selectedProvinceCodeStatus: number;

  code: string;
  //

  //Data
  selectedData: ProvinceCode[];
  cloneSelectCode: any[];
  idPrint: string;

  lstData: ProvinceCode[] = [];
  //

  ngOnInit() {
    this.loadData();
    this.loadFilter();
  }

  //#region 
  loadFilter() {
    this.selectedHub = null;
    this.selectedUser = null;
    this.selectedCustomer = null;
    this.code = null;

    this.loadHub();
    this.loadCustomer();
    this.loadFilterProvinceStatusCode();
  }

  async loadData() {
    let cols = [
      Constant.classes.includes.provinceCode.hub,
      Constant.classes.includes.provinceCode.user,
      Constant.classes.includes.provinceCode.customer
    ]

    let res = await this.provideCodeService.getAllAsync(cols);
    if (res.isSuccess) {
      this.lstData = res.data;
    }

  }
  //#endregion

  //#region Dropdown
  async loadHub() {
    this.hubs = await this.hubService.getAllHubSelectModelAsync();
  }

  async loadCustomer() {
    this.customers = await this.customerService.getAllSelectModelAsync();
  }

  async loadFilterProvinceStatusCode() {
    this.provinceCodeStatus = await this.provinceCodeStatusService.getAllSelectModelAsync();
  }

  async loadUserByHubID() {
    this.users = await this.userService.getSelectModelEmpByHubIdAsync(this.selectedHub);
  }
  //#endregion


  //#region Nút xử lý
  refresh(dt: Table) {
    dt.reset();
    this.loadData();
    this.loadFilter();
  }

  async print() {
    if (this.selectedData.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Danh sách trống"
      });
      return;
    }

    this.cloneSelectCode = await this.sendSelectDataPrintMultiCode(this.selectedData);
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
  //#endregion
}

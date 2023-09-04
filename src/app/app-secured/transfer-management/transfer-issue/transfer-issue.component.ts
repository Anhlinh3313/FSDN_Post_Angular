import { Component, OnInit, TemplateRef, ElementRef, ViewChild } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as XLSX from 'xlsx';
type AOA = Array<Array<any>>;

//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { AuthService, TransportTypeService, HubService, UserService, ListGoodsService, ShipmentService, DepartmentService, ServiceService, ProvinceService, PackageService } from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { GeneralInfoService } from "../../../services/generalInfo.service";
// daterangepicker
import { InformationComponent } from "../../../infrastructure/information.helper";
import { environment } from "../../../../environments/environment";

import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { ListGoods } from "../../../models/listGoods.model";
import { Shipment, User } from "../../../models";
import { SelectModel } from "../../../models/select.model";
import { TransportTypeHelper } from "../../../infrastructure/transportType.helper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { SortUtil } from "../../../infrastructure/sort.util";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { ListGoodsStatusHelper } from "../../../infrastructure/listGoodsStatusHelper";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { AssignShipmentWarehousing } from "../../../models/assignShipmentWarehousing.model";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import * as cloneDeep from 'lodash/cloneDeep';
import { IdModel } from "../../../view-model/id.model";
import { TruckService } from "../../../services/truck.service";
import { Truck } from "../../../models/truck.model";
import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { StringHelper } from "../../../infrastructure/string.helper";
import { ArrayHelper } from "../../../infrastructure/array.helper";

@Component({
  selector: "app-transfer",
  templateUrl: "transfer-issue.component.html",
  styles: []
})
export class TransferIssueComponent extends InformationComponent implements OnInit {
  // scan gói
  listError: string;
  totalScanShipOfPackageFail: number = 0;
  totalScanShipOfPackageSuccess: number = 0;
  isSuccessScanPackge: boolean = false;
  percentScanPackage: number = 0;
  isCheckScanPackage: boolean = false;
  txtPackageCode: string;
  listShipmentByScanPackage: any;
  totalCountLSByScanPackage: number = 0;
  //
  @ViewChild("txtUnAssignShipment") txtShipmentRefRight: ElementRef;
  @ViewChild("txtShipmentNumberIssue") txtShipmentNumberIssueRef: ElementRef;

  //#region  param
  bsModalRef: BsModalRef;
  parentPage: string;
  currentPage: string;
  isActiveTabOne: boolean = true;
  unit = environment.unit;
  hub = environment;
  envir = environment;
  //
  datasource: Shipment[] = [];
  selectedData: Shipment[] = [];
  pageSizeLeft: number = this.envir.pageSize;
  pageNumberLeft: number = 1;
  totalRecordLeft: number = 0;
  totalBoxsLeft: number = 0;
  totalShipmentInPackageLeft: number = 0;
  totalPackageLeft: number = 0;
  firstLeft: number = 0;
  shipmentFilterViewModelLeft: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  //
  datasourceIssue: Shipment[] = [];
  pageSizeIssue: number = this.envir.pageSize;
  pageNumberIssue: number = 1;
  totalRecordIssue: number = 0;
  totalPackageRight: number = 0;
  totalShipmentInPackageRight: number = 0;
  totalBoxsRight: number = 0;
  firstIssue: number = 0;
  shipmentFilterViewModelRight: any = new Object();
  //
  transportTypes: SelectModel[] = [];
  listGoodsIssue: ListGoods = new ListGoods();
  listGoodsIssues: SelectModel[] = [];
  isTruck: boolean = false;
  isPlane: boolean = false;
  allHubs: SelectModel[] = [];
  //
  receiverHubFilters: any[] = [];
  receiverHubSelected: any;
  //
  receiverHubFilters_2: any[] = [];
  receiverHubSelected_2: any;
  //
  placeHolderHub: string;
  checkSchedule: SelectItem[] = [
    { label: 'Cảnh báo sai tuyến', value: true },
    { label: 'Không cảnh báo', value: false },
  ]
  //
  users: SelectModel[] = [];
  userFilters: string[] = [];
  userSelected: string;
  //
  filterTrucks: any;
  listTruck: SelectModel[] = [];
  selectedTruck: any;
  selectedTrucks: Truck;
  //
  isFeeRent: boolean;
  //
  fromDatetime: Date = new Date();
  toDatetime: Date = null;
  //
  services: SelectModel[] = [];
  provinces: SelectModel[] = [];
  deliveryUsers: SelectModel[] = [];
  //
  itemShipment: any = [];
  idPrint: string;
  generalInfo: GeneralInfoModel;
  currentUser: User;
  dateCreate: any;
  totalCalWeight: number;
  totalWeight: number;
  totalSumPrice: any;
  totalBox: number;
  stt: number;
  //
  showDialogIssue: boolean = false;
  messageDialogIssue: string;
  isCheckSchedule: boolean = false;
  typeIssues: SelectItem[] = [{ value: 3050, label: '-- Tất cả --' },
  { value: 3, label: 'Hàng trung chuyển' },
  { value: 5, label: 'Hàng hỗ trợ' }
  ]
  //#endregion

  constructor(
    private packageService: PackageService,
    protected shipmentService: ShipmentService,
    protected bsModalService: BsModalService,
    protected listGoodsService: ListGoodsService,
    protected userService: UserService,
    protected hubService: HubService,
    protected transportTypeService: TransportTypeService,
    protected messageService: MessageService,
    protected generalInfoService: GeneralInfoService,
    protected authService: AuthService,
    public permissionService: PermissionService,
    public router: Router,
    public truckService: TruckService,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    private departmentService: DepartmentService,
    private serviceService: ServiceService,
    private provinceService: ProvinceService
  ) {
    super(generalInfoService, authService, messageService, permissionService, router);
    // dateRangePicker
  }

  async ngOnInit() {
    this.parentPage = Constant.pages.transfer.name;
    this.currentPage = Constant.pages.transfer.children.transferIssue.name;
    this.placeHolderHub = `Chọn ${this.hub.centerHubSortName}/${this.hub.poHubSortName}/${this.hub.stationHubSortName} nhận`;
    //
    let includes: string = "";
    includes = Constant.classes.includes.shipment.toHub + "," +
      Constant.classes.includes.shipment.package + "," +
      Constant.classes.includes.shipment.service;
    this.shipmentFilterViewModelLeft.Cols = includes;
    var currentUser = await this.authService.getAccountInfoAsync();
    this.shipmentFilterViewModelLeft.CurrentHubId = currentUser.hubId;
    this.shipmentFilterViewModelLeft.groupStatusId = 3;
    this.shipmentFilterViewModelLeft.PageNumber = this.pageNumberLeft;
    this.shipmentFilterViewModelLeft.PageSize = this.pageSizeLeft;
    //
    // this.shipmentFilterViewModelRight.cols = includes;
    this.shipmentFilterViewModelRight.pageSize = this.pageSizeIssue;
    this.shipmentFilterViewModelRight.pageNumber = this.pageNumberIssue;
    this.initData();
  }

  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }


  async initData() {
    this.loadTransportType();
    this.loadService();
    this.loadProvince();
    this.loadDatasourceLeft();
    this.loadCurrentUser();
    this.loadGeneralInfo();
    this.loadDeliveryUser();
  }

  //#region Load data
  loadDateTime() {
    this.fromDatetime = new Date();
    this.toDatetime = null;
    if (!this.listGoodsIssue || !this.listGoodsIssue.id || this.listGoodsIssue.id == 0) {
      if (this.fromDatetime) this.listGoodsIssue.startExpectedTime = SearchDate.formatToISODate(this.fromDatetime);
      if (this.toDatetime) this.listGoodsIssue.endExpectedTime = SearchDate.formatToISODate(this.toDatetime);
    } else {

    }
  }

  async loadService() {
    this.services = await this.serviceService.getAllSelectModelAsync();
  }

  async loadProvince() {
    this.provinces = await this.provinceService.getAllSelectModelAsync();
  }

  loadTransportType() {
    this.transportTypeService.getAllSelectModelAsync().then(x => this.transportTypes = x);
  }

  async loadSelectHub() {
    let fintLG = this.listGoodsIssues.find(f => f.value == this.listGoodsIssue.id);
    if (fintLG) {
      this.listGoodsIssue = cloneDeep(fintLG.data);
      await this.loadFilterSearch(null);
      let user = this.users.find(f => f.value == this.listGoodsIssue.empId);
      if (user) this.userSelected = user.label;
      else this.userSelected = null;
      this.eventOnSelectedTranportType();
    }
  }

  // allSelect(event) {
  //   if (event.checked) {
  //     if (this.filterRows) {
  //       this.selectedData = this.filterRows;
  //     } else {
  //       this.selectedData = this.datasource;
  //     }
  //   }
  // }

  loadDeliveryUser() {
    this.shipmentFilterViewModelLeft.DeliveryUserId = null;
    this.deliveryUsers = [];
    this.deliveryUsers.push({ label: "-- Chọn nhân viên --", value: null });
    if (!this.shipmentFilterViewModelLeft.ToHubId) return;
    this.userService.getEmpByHubId(this.shipmentFilterViewModelLeft.ToHubId).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let users = x.data as User[];
        users.forEach(element => {
          this.deliveryUsers.push({ label: `${element.code} - ${element.fullName}`, value: element.id });
        });
      }
    );
  }

  async loadListGoodsTransferNew() {
    await this.listGoodsService.getListGoodsTransferNewAsync(this.listGoodsIssue.toHubId).then(
      x => {
        this.listGoodsIssues = [];
        if (x.isSuccess == true) {
          let datas = x.data as ListGoods[];
          if (datas.length > 0) {
            let dataSort = SortUtil.sortAlphanumerical(datas, -1, 'id');
            dataSort.map(m => this.listGoodsIssues.push({ value: m.id, label: `${m.code} ${m.toHub ? m.toHub.name : ''}`, data: m }));
            this.listGoodsIssue = dataSort[0];
            this.listGoodsIssue.id = dataSort[0].id;
            this.loadSelectHub();
            this.totalRecordIssue = 0;
            this.datasourceIssue = [];
            setTimeout(() => {
              if (environment.namePrint == 'Vietstar Express' || environment.namePrint == 'dlex') {
                this.listGoodsIssues.push({ value: 0, label: 'Tạo mã xuất kho mới' });
              }
            }, 0);
          } else {
            this.listGoodsIssues.push({ value: 0, label: 'Tạo mã xuất kho mới' });
          }
        }
      }
    )
  }

  async loadDatasourceLeft() {
    this.shipmentFilterViewModelLeft.Type = 3;
    this.shipmentFilterViewModelLeft.isGroupEmp = true;
    const res = await this.shipmentService.getListShipment(this.shipmentFilterViewModelLeft);
    if (res) {
      const data = res.data as Shipment[] || [];
      this.datasource = data;
      this.totalRecordLeft = data.length > 0 ? data[0].totalCount : 0;
      this.totalShipmentInPackageLeft = data.length > 0 ? data[0].totalShipmentInPackage : 0;
      this.totalPackageLeft = data.length > 0 ? data[0].totalPackage : 0;
      this.totalBoxsLeft = data.length > 0 ? data[0].totalBoxs : 0;
    }
  }

  async loadDatasourceRight() {
    this.messageService.clear();
    if (!this.listGoodsIssue.id || this.listGoodsIssue.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn mã xuất kho' });
      return;
    }
    this.shipmentFilterViewModelRight.listGoodsId = this.listGoodsIssue.id;
    const res = await this.shipmentService.getListShipment(this.shipmentFilterViewModelRight).then(
      x => {
        if (!this.isValidResponse(x)) return;
        const data = x.data as Shipment[] || [];
        this.datasourceIssue = data;
        this.totalRecordIssue = data.length > 0 ? data[0].totalCount : 0;

        this.totalShipmentInPackageRight = data.length > 0 ? data[0].totalShipmentInPackage : 0;
        this.totalPackageRight = data.length > 0 ? data[0].totalPackage : 0;
        this.totalBoxsRight = data.length > 0 ? data[0].totalBoxs : 0;

        if (this.datasourceIssue.length == 0) this.messageService.add({ severity: Constant.messageStatus.success, detail: `Danh sách xuất kho '0' vận đơn.` });
      }
    );
  }

  async loadFilterSearch(value: string) {
    await this.userService.getSearchByValueAsync(value, this.listGoodsIssue.empId).then(
      async x => {
        this.users = [];
        this.userFilters = [];
        x.map(m => this.users.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
        this.users.map(m => this.userFilters.push(m.label));
      }
    );
  }
  //#endregion

  //#region Event
  eventOnSelectedTranportType() {
    let fintTPT = this.transportTypes.find(f => f.value == this.listGoodsIssue.transportTypeId && this.listGoodsIssue.transportTypeId != null);
    if (fintTPT) {
      if (fintTPT.data.code == TransportTypeHelper.truckCode) {
        this.isTruck = true; this.isPlane = false;
      } else if (fintTPT.data.code == TransportTypeHelper.planeCode) {
        this.isTruck = false; this.isPlane = true;
        this.loadDateTime();
      } else {
        this.isTruck = false; this.isPlane = false;
      }
    } else {
      this.isTruck = false; this.isPlane = false;
    }
  }

  eventOnSelectedDateFrom() {
    if (this.fromDatetime) this.listGoodsIssue.startExpectedTime = SearchDate.formatToISODate(this.fromDatetime);
    else this.listGoodsIssue.startExpectedTime = null;
  }

  eventOnSelectedDateTo() {
    if (this.toDatetime) this.listGoodsIssue.endExpectedTime = SearchDate.formatToISODate(this.toDatetime);
    else this.listGoodsIssue.endExpectedTime = null;
  }

  eventOnSelectedHub() {
    let findH = this.allHubs.find(f => f.label == this.receiverHubSelected)
    if (findH) {
      this.listGoodsIssue.toHubId = findH.value;
      this.loadListGoodsTransferNew();
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy ${this.hub.centerHubSortName}/${this.hub.poHubSortName}/${this.hub.stationHubSortName}.` });
    }
  }

  async eventFilterHubs(event) {
    let value = event.query;
    if (value.length >= 1) {
      await this.hubService.getHubSearchByValueAsync(value, null).then(
        x => {
          this.allHubs = [];
          this.receiverHubFilters = [];
          x.map(m => this.allHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.allHubs.map(m => this.receiverHubFilters.push(m.label));
        }
      );
    }
  }

  eventOnSelectedHub_2() {
    let findH = this.allHubs.find(f => f.label == this.receiverHubSelected_2)
    if (findH) {
      this.shipmentFilterViewModelLeft.ToHubId = findH.value;
      this.loadDeliveryUser();
      this.loadDatasourceLeft();
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy ${this.hub.centerHubSortName}/${this.hub.poHubSortName}/${this.hub.stationHubSortName}.` });
    }
  }

  async eventFilterHubs_2(event) {
    let value = event.query;
    if (value.length >= 1) {
      await this.hubService.getHubSearchByValueAsync(value, null).then(
        x => {
          this.allHubs = [];
          this.receiverHubFilters_2 = [];
          this.allHubs.push({ value: null, label: `-- chọn tất cả --` });
          x.map(m => this.allHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.allHubs.map(m => this.receiverHubFilters_2.push(m.label));
        }
      );
    }
  }

  eventFilterUsers(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.loadFilterSearch(value);
    }
  }

  eventOnSelectedUser() {
    let findU = this.users.find(f => f.label == this.userSelected)
    if (findU) {
      this.listGoodsIssue.transferUserId = findU.value;
      this.listGoodsIssue.empId = findU.value;
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy nhân viên.` });
    }
  }

  async eventOnSelectedListGoods(template: TemplateRef<any>) {
    if (this.listGoodsIssue.id == 0) {
      this.bsModalRef = this.bsModalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
    } else {
      this.loadSelectHub();
    }
    this.totalRecordIssue = 0;
    this.totalPackageRight = 0;
    this.totalShipmentInPackageRight = 0;
    this.totalBoxsRight = 0;
    this.datasourceIssue = [];
  }

  noneCreateListGoods() {
    this.bsModalRef.hide();
    this.listGoodsIssue.id = null;
  }

  onPageChangeLeft(event: LazyLoadEvent) {
    this.shipmentFilterViewModelLeft.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModelLeft.PageSize = event.rows;
    this.loadDatasourceLeft();
  }

  onPageChangeIssue(event: LazyLoadEvent) {
    this.shipmentFilterViewModelRight.pageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModelRight.pageSize = event.rows;
    this.loadDatasourceRight();
  }

  evenScaneShipmentNumberIssue(txtShipmentNumberIssue) {
    this.messageService.clear();
    this.txtShipmentNumberIssueRef.nativeElement.focus();
    this.txtShipmentNumberIssueRef.nativeElement.select();
    if (!this.listGoodsIssue.id || this.listGoodsIssue.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Mã xuất kho trống, vui lòng tạo mã xuất kho trước.' });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    txtShipmentNumberIssue.value.trim().split(" ").forEach(x => {

      let shipmentWHIssue = new AssignShipmentWarehousing();
      if (this.listGoodsIssue.note) shipmentWHIssue.note = this.listGoodsIssue.note;
      shipmentWHIssue.ShipmentNumber = x;
      shipmentWHIssue.listGoodsId = this.listGoodsIssue.id;
      shipmentWHIssue.toHubId = this.listGoodsIssue.toHubId;
      shipmentWHIssue.isCheckSchedule = this.isCheckSchedule;

      this.shipmentService.issueWarehousingAsync(shipmentWHIssue).then(
        x => {
          if (!this.isValidResponse(x)) {
            SoundHelper.getSoundMessage(Constant.messageStatus.warn);
            return;
          }
          txtShipmentNumberIssue.value = '';
          this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Xuất kho thành công.' });
          SoundHelper.getSoundMessage(Constant.messageStatus.success);
          let shipment = x.data as Shipment;
          //Add client
          this.datasourceIssue.unshift(shipment);
          this.totalRecordIssue++;
          this.totalBoxsRight = this.totalBoxsRight + shipment.totalBox;
          if (this.datasourceIssue.length > 12) {
            this.datasourceIssue.splice(0, 1);
          }
          //Remove client
          this.totalRecordLeft--;
          this.totalBoxsLeft = this.totalBoxsLeft - shipment.totalBox;
          let findLeft = this.datasource.findIndex(f => f.id == shipment.id);
          if (findLeft || findLeft == 0) {
            this.datasource.splice(findLeft, 1);
          }
        });
    });
  }

  issueFast() {
    this.messageService.clear();
    if (!this.listGoodsIssue.id || this.listGoodsIssue.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Mã xuất kho trống, vui lòng tạo mã xuất kho trước.' });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    if (!this.selectedData || !this.selectedData.length) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn vận đơn xuất kho nhanh' });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    this.selectedData.map(map => {
      let shipmentWHIssue = new AssignShipmentWarehousing();
      if (this.listGoodsIssue.note) shipmentWHIssue.note = this.listGoodsIssue.note;
      shipmentWHIssue.ShipmentNumber = map.shipmentNumber;
      shipmentWHIssue.listGoodsId = this.listGoodsIssue.id;
      shipmentWHIssue.toHubId = this.listGoodsIssue.toHubId;
      shipmentWHIssue.isCheckSchedule = this.isCheckSchedule;
      this.shipmentService.issueWarehousingAsync(shipmentWHIssue).then(
        x => {
          if (!this.isValidResponse(x)) {
            SoundHelper.getSoundMessage(Constant.messageStatus.warn);
            return;
          }
          this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Xuất kho thành công.' });
          SoundHelper.getSoundMessage(Constant.messageStatus.success);
          let shipment = x.data as Shipment;
          //Add client
          this.datasourceIssue.unshift(shipment);
          this.totalRecordIssue++;
          this.totalBoxsRight = this.totalBoxsRight + shipment.totalBox;
          if (this.datasourceIssue.length > 12) {
            this.datasourceIssue.splice(0, 1);
          }
          //Remove client
          let findLeft = this.datasource.findIndex(f => f.id == shipment.id);
          if (findLeft || findLeft == 0) {
            this.datasource.splice(findLeft, 1);
            this.totalRecordLeft--;
            this.totalBoxsLeft = this.totalBoxsLeft - shipment.totalBox;
          }
          //remove select data
          let findSelectLeft = this.selectedData.findIndex(f => f.id == shipment.id);
          if (findSelectLeft || findSelectLeft == 0) {
            this.selectedData.splice(findSelectLeft, 1);
          }
        });
    });
  }

  onClickScanPackage(template: TemplateRef<any>) {
    this.isSuccessScanPackge = false;
    this.totalCountLSByScanPackage = 0;
    this.percentScanPackage = 0;
    this.isCheckScanPackage = false;
    this.listError = null;
    this.listShipmentByScanPackage = null;
    this.totalScanShipOfPackageFail = 0;
    this.totalScanShipOfPackageSuccess = 0;

    setTimeout(() => {
      var atcScanPackageCode = $("#atcScanPackageCode");
      atcScanPackageCode.focus();
      atcScanPackageCode.select();
    }, 0);

    this.bsModalRef = this.bsModalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
  }

  async evenScanePackageCode() {
    this.messageService.clear();
    this.isSuccessScanPackge = false;

    if (!this.listGoodsIssue.id || this.listGoodsIssue.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Mã xuất kho trống, vui lòng tạo mã xuất kho trước.' });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.txtPackageCode = null;
      return;
    }

    if (StringHelper.isNullOrEmpty(this.txtPackageCode)) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Mã ${this.envir.pack} trống. Vui lòng Scan Mã ${this.envir.pack}` });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.txtPackageCode = null;
      return;
    }

    //
    let packageCode = this.txtPackageCode.trim();

    // api scan mã gói hoặc số Seal => check gói đã đóng và lấy ra ds vận đơn
    const res = await this.packageService.getShipmentByPackageCodeOrSealAsync(packageCode, 1, 1, 1000);
    if (res) {
      if (res.isSuccess) {
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Quét thành công!` });
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
        this.isSuccessScanPackge = true;
        if (!ArrayHelper.isNullOrZero(res.data as any[])) {
          const ships = res.data;
          this.listShipmentByScanPackage = ships;
          this.totalCountLSByScanPackage = ships[0].totalCount;
        }
      }
    }

    this.txtPackageCode = null;
  }

  comfirmScanPackage() {
    this.isCheckScanPackage = true;
    this.listError = null;
    this.totalScanShipOfPackageSuccess = 0;
    this.totalScanShipOfPackageFail = 0;
    this.percentScanPackage = 0;
    let cloneCountShipmentByScanPackage: number = 0;

    // scan từng mã vận đơn của gói
    if (this.isSuccessScanPackge) {
      if (!ArrayHelper.isNullOrZero(this.listShipmentByScanPackage)) {
        cloneCountShipmentByScanPackage = Object.assign({}, this.listShipmentByScanPackage).length;
        this.listShipmentByScanPackage.forEach(async e => {
          let shipmentWHIssue = new AssignShipmentWarehousing();
          if (this.listGoodsIssue.note) shipmentWHIssue.note = this.listGoodsIssue.note;
          shipmentWHIssue.isPackage = true;
          shipmentWHIssue.ShipmentNumber = e.shipmentNumber;
          shipmentWHIssue.listGoodsId = this.listGoodsIssue.id;
          shipmentWHIssue.toHubId = this.listGoodsIssue.toHubId;
          shipmentWHIssue.isCheckSchedule = this.isCheckSchedule;

          await this.shipmentService.issueWarehousingAsync(shipmentWHIssue).then(
            async u => {
              if (u.isSuccess == true) {
                this.totalScanShipOfPackageSuccess++;
                this.percentScanPackage = Math.ceil(this.totalScanShipOfPackageSuccess * 100 / this.totalCountLSByScanPackage);

                // cập nhật lại số lượng vận đơn trong gói của table bên trái và phải
                this.totalBoxsLeft = this.totalBoxsLeft - e.totalBox;
                this.totalShipmentInPackageLeft--;
                this.totalBoxsRight = this.totalBoxsRight + e.totalBox;
                this.totalShipmentInPackageRight++;

                // add client
                this.datasourceIssue.unshift(e);
                this.totalRecordIssue++;
                if (this.datasourceIssue.length > 12) {
                  this.datasourceIssue.splice(0, 1);
                }
                // remove client
                let findLeft = this.datasource.findIndex(f => f.id == e.id);
                if (findLeft || findLeft == 0) {
                  this.datasource.splice(findLeft, 1);
                  this.totalRecordLeft--;
                }
              } else {
                this.totalScanShipOfPackageFail++;
                if (this.listError) this.listError += `, ${e.shipmentNumber}`;
                else this.listError = e.shipmentNumber;
              }
            }
          );

          // cập nhật lại số lượng gói của table bên trái và bên phải
          if (this.percentScanPackage === 100) {
            this.totalPackageLeft--;
            this.totalPackageRight++;
          }
        });
      }

    }

    this.listShipmentByScanPackage = null;
  }

  onClickBlockListGood(template: TemplateRef<any>) {
    this.messageService.clear();
    if (!this.listGoodsIssue.id || this.listGoodsIssue.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn mã xuất kho!' });
      return;
    }
    if (!this.listGoodsIssue.empId || !this.userSelected) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn nhận viên vận chuyển.' });
      return;
    }
    if (!this.listGoodsIssue.transportTypeId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn HÌNH THỨC vận chuyển.' });
      return;
    }
    if (this.isTruck && !this.selectedTrucks) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập biển số xe!' });
      return;
    }

    this.bsModalRef = this.bsModalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
  }

  onCickRefresh() {
    this.listGoodsIssue = new ListGoods();
    this.listGoodsIssues = []
    this.datasource = [];;
    this.totalRecordLeft = 0;
    this.totalShipmentInPackageLeft = 0;
    this.totalPackageLeft = 0;
    this.totalRecordLeft = 0;
    this.totalBoxsLeft = 0;
    this.datasourceIssue = [];
    this.totalRecordIssue = 0;
    this.totalShipmentInPackageRight = 0;
    this.totalPackageRight = 0;
    this.totalBoxsRight = 0;
    this.isTruck = false; this.isPlane = false;
    this.receiverHubSelected = null;
    this.receiverHubSelected_2 = null;
    this.userFilters = [];
    this.userSelected = null;
    this.bsModalRef.hide();
  }
  //#endregion

  //#region Function excute
  createNewListGoods() {
    this.listGoodsIssue.code = null;
    this.listGoodsIssue.name = null;
    this.listGoodsIssue.listGoodsTypeId = ListGoodsTypeHelper.detailTranfer;
    this.listGoodsIssue.listGoodsStatusId = ListGoodsStatusHelper.READY_TO_TRANSFER;
    this.listGoodsService.createAsync(this.listGoodsIssue).then(
      x => {
        if (x.isSuccess == true) {
          this.listGoodsIssue = x.data as ListGoods;
          let finH = this.allHubs.find(f => f.value == this.listGoodsIssue.toHubId);
          if (finH) this.listGoodsIssue.toHub = finH.data;
          this.listGoodsIssues.unshift({ value: this.listGoodsIssue.id, label: `${this.listGoodsIssue.code} ${this.listGoodsIssue.toHub ? this.listGoodsIssue.toHub.name : ''}` });
          this.messageService.add({ severity: Constant.messageStatus.success, detail: `Đã tạo mã xuất kho mới thành công` });
          this.bsModalRef.hide();
        } else {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Tạo mã xuất kho mới không thành công, vui lòng kiểm tra lại` });
        }
      }
    )
  }

  checkInfoInListGoods() {
    this.messageService.clear();
    if (!this.listGoodsIssue.id) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn mã xuất kho!' });
      return;
    }
    this.listGoodsService.GetInfoInListGoodsAsync(this.listGoodsIssue.id).then(
      x => {
        this.listGoodsIssue.realWeight = this.route(x.sumWeight);
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Kiểm soát thành công, cập nhật trọng lượng = '${this.listGoodsIssue.realWeight}'` });
      }
    )
  }

  async comfirmBlockListGood() {
    if (!this.listGoodsIssue.totalBox) {
      this.listGoodsIssue.totalBox = 0;
    }
    await this.listGoodsService.BlockListGoodsAsync(this.listGoodsIssue).then(async x => {
      if (x.isSuccess == true) {
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Chốt xuất kho thành công` });
        this.onCickRefresh();
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Chốt xuất kho thất bại` });
      }
    });
  }
  //#endregion

  filterTruck(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.truckService.searchByTruckNumber(value).then(x => {
        if (x.isSuccess == true) {
          this.listTruck = [];
          this.filterTrucks = [];
          let data = (x.data as Truck[]);
          data.map(m => {
            this.listTruck.push({ value: m.id, label: `${m.truckNumber}`, data: m });
            this.filterTrucks.push(`${m.truckNumber}`);
          });
        }
      }
      );
    }
  }

  async onSelectedTruck() {
    let cloneSelectedTruck = this.selectedTruck;
    this.selectedTrucks = null;
    await Promise.all(
      this.listTruck.map(x => {
        if (x) {
          if (cloneSelectedTruck === x.label) {
            this.selectedTrucks = x.data;
          }
        }
      }));
    this.changeTruck();
  }

  changeTruck() {
    if (this.selectedTrucks) this.listGoodsIssue.truckId = this.selectedTrucks.id;
    if (this.selectedTrucks && this.selectedTrucks.truckOwnershipId == 2) {
      this.isFeeRent = true;
      this.listGoodsIssue.feeRent = 0;
    }
    else {
      this.isFeeRent = false;
      this.listGoodsIssue.feeRent = 0;
    }
  }

  removeIssueWarehousing(shipmentId: any) {
    if (!this.listGoodsIssue || !this.listGoodsIssue.id) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Chưa có mã xuất kho!` });
      return;
    }
    let model: any = new Object();
    model.listGoodsId = this.listGoodsIssue.id;
    model.shipmentId = shipmentId;
    this.shipmentService.unAssign(model).subscribe(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Gỡ vận đơn thành công' });
        this.loadDatasourceLeft();
        this.loadDatasourceRight();
      }
    );
  }

  // Print
  async loadGeneralInfo() {
    this.generalInfo = await this.generalInfoService.getAsync();
  }

  async loadCurrentUser() {
    let cols = [
      Constant.classes.includes.user.hub,
      Constant.classes.includes.user.department
    ];

    await this.userService.getAsync(this.authService.getUserId(), cols).then(x => {
      if (!x) return;
      this.currentUser = x as User;
    });
  }

  async comfirmBlockAndPrintListGood(isPrintDetail: boolean) {
    let listGoodsIssue = Object.assign({}, this.listGoodsIssue);
    await this.comfirmBlockListGood();
    this.itemShipment = await this.onGetListGoodsId(listGoodsIssue, isPrintDetail);
    //pack
    let filterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
    filterViewModel.listGoodsId = listGoodsIssue.id;
    filterViewModel.PageNumber = 1;
    filterViewModel.PageSize = 100;
    this.itemShipment.selectedPackage = await this.loadListPackage(filterViewModel);
    await Promise.all(this.itemShipment.selectedPackage.map(async (item, index) => {
      this.itemShipment.selectedPackage[index].fakeId = "pack" + item.id;
    }));
    //
    if (this.itemShipment) {
      setTimeout(() => {
        this.idPrint = ListGoodsTypeHelper.printDetailTranfer;
        this.itemShipment.isPrintBareCode = true;
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
      }, 0);
    }
  }

  //
  async loadListPackage(filterViewModel?: ShipmentFilterViewModel) {
    let datas = await this.packageService.getListPackageByAsync(filterViewModel);
    return datas;
  }

  async onGetListGoodsId(data: ListGoods, isPrintDetail: boolean): Promise<Shipment[]> {
    const shipments = await this.getShipmentByListGoodsId(data);
    if (shipments) {
      this.itemShipment = [...shipments];
      if (isPrintDetail) {
        const deliveryAndHubRouting = await this.shipmentService.getDeliveryAndHubRoutingAsync(data.id);
        if (deliveryAndHubRouting) {
          this.itemShipment.printDetail = [...deliveryAndHubRouting];
        }
      }
      let cols = ["ToHub", "FromHub", "Emp", "Emp.Department", "CreatedByUser", "CreatedByUser.Department"];
      let listgood = await this.listGoodsService.getAsync(data.id, cols);

      this.itemShipment.logoUrl = this.generalInfo.logoUrl;
      this.itemShipment.companyName = this.generalInfo.companyName;
      this.itemShipment.hotLine = this.generalInfo.hotLine;
      this.itemShipment.centerHubAddress = this.generalInfo.addressMain;
      this.itemShipment.isPrintDetail = isPrintDetail;

      if (listgood.data.toHub) {
        this.itemShipment.toHubName = listgood.data.toHub.name;
      }

      if (listgood.data.emp) {
        this.itemShipment.emp = listgood.data.emp;
        this.itemShipment.currentEmp = listgood.data.emp.fullName;
        if (listgood.data.emp.hub) this.itemShipment.empHubName = listgood.data.emp.hub.name;
        if (listgood.data.emp.department) this.itemShipment.empDepartmentName = listgood.data.emp.department.name;
      }

      if (listgood.data.createdByUser) {
        this.itemShipment.createdBy = listgood.data.createdByUser.fullName;
        if (listgood.data.createdByUser.hub) this.itemShipment.userHubName = listgood.data.createdByUser.hub.name;
        if (listgood.data.createdByUser.department) this.itemShipment.userDepartmentName = listgood.data.createdByUser.department.name;
      }

      if (data.listGoodsType)
        this.itemShipment.type = data.listGoodsType.name;

      this.itemShipment.listGoods = data.code;
      this.dateCreate = SearchDate.formatToISODate(new Date());
      this.itemShipment.dateCreate = SearchDate.formatToISODate(new Date());

      this.totalSumPrice = 0;
      this.totalWeight = 0;
      this.totalCalWeight = 0;
      this.totalBox = 0;
      await Promise.all(this.itemShipment.map(async (item, index) => {
        if (item.transferUser) {
          this.itemShipment.transferUserFullName = item.transferUser.fullName;
        }

        this.stt = index + 1;
        this.itemShipment[index].stt = this.stt;
        this.totalWeight += this.itemShipment[index].weight;
        this.itemShipment.totalWeight = this.totalWeight;
        if (this.itemShipment[index].calWeight) {
          this.totalCalWeight += this.itemShipment[index].calWeight;
          this.itemShipment.totalCalWeight = this.totalCalWeight;
        }
        if (
          !this.itemShipment[index].totalBox ||
          this.itemShipment[index].totalBox === 0
        ) {
          this.itemShipment[index].totalBox = 1;
        }
        this.totalBox += this.itemShipment[index].totalBox;
        this.itemShipment.totalBox = this.totalBox;
        if (item.paymentTypeId !== PaymentTypeHelper.NNTTN) {
          item.cod = item.cod ? item.cod : 0;
          this.itemShipment[index].sumPrice = item.cod;
        } else {
          item.cod = item.cod ? item.cod : 0;
          item.totalPrice = item.totalPrice ? item.totalPrice : 0;
          this.itemShipment[index].sumPrice = item.cod + item.totalPrice;
        }
        this.itemShipment[index].sumPrice = this.itemShipment[index].sumPrice ? this.itemShipment[index].sumPrice : 0;
        this.totalSumPrice += this.itemShipment[index].sumPrice;
        this.itemShipment.totalSumPrice = this.totalSumPrice;

        this.itemShipment[index].fakeId =
          "id" + shipments[index].id;
        const time = new Date();
        this.itemShipment.getFullYear = time.getFullYear();
        if (isPrintDetail && item.toHubRoutingId && this.itemShipment.printDetail) {
          let fintPrintDetail = this.itemShipment.printDetail.find(f => f.listHubRoutingIds.split(',').findIndex(f => f == item.toHubRoutingId) >= 0);
          if (fintPrintDetail) {
            if (!fintPrintDetail.data) fintPrintDetail.data = [];
            if (!fintPrintDetail.totalBox) fintPrintDetail.totalBox = 0;
            fintPrintDetail.data.push(this.itemShipment[index]);
            if (this.itemShipment[index].totalBox) fintPrintDetail.totalBox += this.itemShipment[index].totalBox;
          }
        }
      }));
      return this.itemShipment;
    }
  }

  async getShipmentByListGoodsId(data: ListGoods): Promise<Shipment[]> {
    const id = data.id;
    let includes: any = [];
    includes.push(Constant.classes.includes.shipment.fromHubRouting);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.service);
    includes.push(Constant.classes.includes.shipment.fromHub);
    includes.push(Constant.classes.includes.shipment.toHub);
    includes.push(Constant.classes.includes.shipment.toHubRouting);
    includes.push(Constant.classes.includes.shipment.pickUser);
    includes.push(Constant.classes.includes.shipment.fromWard);
    includes.push(Constant.classes.includes.shipment.toWard);
    includes.push(Constant.classes.includes.shipment.fromDistrict);
    includes.push(Constant.classes.includes.shipment.fromProvince);
    includes.push(Constant.classes.includes.shipment.toDistrict);
    includes.push(Constant.classes.includes.shipment.toProvince);
    includes.push(Constant.classes.includes.shipment.deliverUser);
    includes.push(Constant.classes.includes.shipment.paymentType);
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.structure);
    includes.push(Constant.classes.includes.shipment.serviceDVGT);
    includes.push(Constant.classes.includes.shipment.boxes);
    includes.push(Constant.classes.includes.shipment.transferUser);
    includes.push(Constant.classes.includes.shipment.receiveHub);

    const shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes, true);
    if (shipments) {
      return shipments;
    }
  }
  //
}
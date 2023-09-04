import { Component, OnInit, TemplateRef, Input, ViewChild, ElementRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as cloneDeep from 'lodash/cloneDeep';
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  ShipmentService,
  PackageService,
  HubService,
  ProvinceService,
  AuthService,
  ServiceService,
  FormPrintService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { Shipment } from "../../../models/shipment.model";
import { User, DataPrint } from "../../../models/index";
import { Package } from "../../../models/package.model";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { Table } from "../../../../../node_modules/primeng/table";
import { ArrayHelper } from "../../../infrastructure/array.helper";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { SelectModel } from "../../../models/select.model";
import { SortUtil } from "../../../infrastructure/sort.util";
import { IdModel } from "../../../view-model/id.model";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { StringHelper } from "../../../infrastructure/string.helper";
import { ScanShipmentInPackage } from "../../../models/scanShipmentInPackage.model";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { FromPrintViewModel } from "../../../view-model";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { InformationComponent } from "../../../infrastructure/information.helper";
import { GeneralInfoService } from "../../../services/generalInfo.service";

declare var jQuery: any;

@Component({
  selector: "app-pack",
  templateUrl: "pack.component.html",
  styles: []
})
export class PackComponent extends InformationComponent implements OnInit {
  @ViewChild("txtShipment") txtShipmentNumberRef: ElementRef;
  currentUser: User = new User();
  receiverHubFilters_2: any[] = [];
  receiverHubSelected_2: any;
  services: SelectModel[] = [];
  provinces: SelectModel[] = [];
  shipmentFilterViewModelLeft: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  shipmentFilterViewModelRight: IdModel = new IdModel();
  pageSizeLeft: number = 10;
  pageNumberLeft: number = 1;
  package: Package = new Package();
  packages: SelectModel[] = [];
  allHubs: SelectModel[] = [];
  placeHolderHub: string;
  receiverHubFilters: any[] = [];
  receiverHubSelected: any;
  idPrint: string;

  pack = environment.pack;

  txtFilterGbRight: any;
  txtFilterGbLeft: any;
  sealNumber: string;
  constructor(
    private modalService: BsModalService,
    public serviceService: ServiceService,
    public authService: AuthService,
    public provinceService: ProvinceService,
    public hubService: HubService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private packageService: PackageService,
    public permissionService: PermissionService,
    public router: Router,
    protected formPrintService: FormPrintService,
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected generalInfoService: GeneralInfoService,
  ) {
    super(generalInfoService, authService, messageService, permissionService, router);
  }

  unit = environment.unit;
  hub = environment;

  parentPage: string = Constant.pages.pack.name;
  currentPage: string = Constant.pages.pack.children.package.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "shipmentNumber",
    "numPick",
    "packAppointmentTime",
    "orderDate",
    "fromHubRouting.name",
    "cusNote",
    "senderName",
    "senderPhone",
    "pickingAddress",
    "packNote",
    "shipmentStatus.name"
  ];

  columnsFilter = [
    { field: 'shipmentNumber', header: 'Mã' },
    { field: 'numPick', header: 'Lấy lại' },
    { field: 'pickupAppointmentTime', header: 'Ngày hẹn lại' },
    { field: 'orderDate', header: 'Ngày vận đơn' },
    { field: 'fromHubRouting.name', header: 'Tuyến' },
    { field: 'cusNote', header: 'Ghi chú khách hàng' },
    { field: 'senderName', header: 'Người gửi' },
    { field: 'senderPhone', header: 'Số đt người gửi' },
    { field: 'pickAddress', header: 'Địa chỉ lấy hàng' },
    { field: 'pickNote', header: 'Ghi chú lấy hàng' },
    { field: 'shipmentStatus.name', header: 'Tình trạng' },
  ]

  datasource: Shipment[];
  totalRecordLeft: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  selectedDataRight: Shipment[];
  listDataRight: Shipment[];
  pageNumberRight: number = 1;
  datasourceRight: Shipment[];
  totalRecordRight: number;
  pageSizeRight: number = 10;
  //
  statuses: SelectItem[];
  selectedStatus: number;
  //
  fromHubRoutings: SelectItem[];
  selectedFromHubRouting: number;

  //
  selectedContent: string;
  selectedWeight: number;
  selectedLength: number;
  selectedWidth: number;
  selectedHeight: number;
  selectedCalWeight: number;

  async ngOnInit() {
    this.placeHolderHub = `Chọn ${this.hub.centerHubSortName}/${this.hub.poHubSortName}/${this.hub.stationHubSortName} nhận`;
    //
    let includes: string = "";
    includes = Constant.classes.includes.shipment.toHub + "," +
      Constant.classes.includes.shipment.service;
    this.shipmentFilterViewModelLeft.Cols = includes;
    this.currentUser = await this.authService.getAccountInfoAsync();
    this.shipmentFilterViewModelLeft.CurrentHubId = this.currentUser.hubId;
    this.shipmentFilterViewModelLeft.groupStatusId = 9;
    this.shipmentFilterViewModelLeft.PageNumber = this.pageNumberLeft;
    this.shipmentFilterViewModelLeft.PageSize = this.pageSizeLeft;
    //
    this.shipmentFilterViewModelRight.cols = includes;
    this.shipmentFilterViewModelRight.pageSize = this.pageSizeRight;
    this.shipmentFilterViewModelRight.pageNumber = this.pageNumberRight;
    this.initData();
  }

  initData() {
    this.loadService();
    this.loadProvince();
    this.loadDatasourceLeft();

    this.selectedData = null;
    this.datasourceRight = [];
  }

  async loadService() {
    this.services = await this.serviceService.getAllSelectModelAsync();
  }

  async loadDatasourceLeft() {
    this.shipmentFilterViewModelLeft.groupStatusId = 11; // lấy ra ds chờ đóng gói
    const res = await this.shipmentService.getListShipment(this.shipmentFilterViewModelLeft);
    if (res) {
      const data = res.data as Shipment[] || [];
      this.datasource = data;
      this.totalRecordLeft = data.length > 0 ? data[0].totalCount : 0;
    }
  }

  ngAfterViewInit() {
    // jQuery(document).ready(function () {
    //   jQuery('.i-checks').iCheck({
    //     checkboxClass: 'icheckbox_square-green',
    //     radioClass: 'iradio_square-green',
    //   });
    //   jQuery('.footable').footable();
    // });
  }

  onPageChangeLeft(event: LazyLoadEvent) {
    this.shipmentFilterViewModelLeft.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModelLeft.PageSize = event.rows;
    this.loadDatasourceLeft();
  }

  onPageChangeRight(event: LazyLoadEvent) {
    this.shipmentFilterViewModelRight.pageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModelRight.pageSize = event.rows;
    this.loadDatasourceRight();
  }

  eventOnSelectedHub_2() {
    let findH = this.allHubs.find(f => f.label == this.receiverHubSelected_2);
    if (findH) {
      this.shipmentFilterViewModelLeft.ToHubId = findH.value;
      this.loadDatasourceLeft();
    } else {
      this.shipmentFilterViewModelLeft.ToHubId = null;
      this.loadDatasourceLeft();
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

  onClickBlockPackage(template: TemplateRef<any>) {
    this.messageService.clear();
    if (!this.package.id || this.package.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng chọn mã gói!" });
      return;
    }
    if (!this.package.toHubId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng chọn tỉnh đến hoặc bưu cục nhận" });
      return;
    }
    if (!this.selectedWeight) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng nhập trọng lượng" });
      return;
    }

    this.package.weight = this.selectedWeight;
    this.package.calWeight = this.selectedCalWeight;
    this.package.content = this.selectedContent;
    if (!StringHelper.isNullOrEmpty(this.sealNumber)) {
      this.package.sealNumber = this.sealNumber.trim();
    } else {
      this.package.sealNumber = null;
    }

    this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
  }

  refresh(dt: Table = null) {
    if (dt) {
      dt.reset();
    }
    this.loadDatasourceLeft();
    if (this.bsModalRef) this.bsModalRef.hide();

    //refresh
    this.selectedData = null;
    this.selectedLength = null;
    this.selectedWidth = null;
    this.selectedHeight = null;
    this.selectedCalWeight = null;
    this.selectedCalWeight = null;
    this.selectedWeight = null;
    this.selectedContent = null;
    this.sealNumber = null;
    this.txtFilterGbRight = null;
  }

  refreshTableRight() {
    this.selectedDataRight = null;
    this.listDataRight = [];
    this.datasourceRight = [];

    //refresh
    this.selectedData = null;
    this.selectedLength = null;
    this.selectedWidth = null;
    this.selectedHeight = null;
    this.selectedCalWeight = null;
    this.selectedCalWeight = null;
    this.selectedWeight = null;
    this.selectedContent = null;
    this.txtFilterGbRight = null;
    this.sealNumber = null;
  }

  loadProvince() {
    this.provinceService.getAllSelectModelAsync().then(x => {
      this.provinces = x;
    });
  }

  // chọn bưu cục nhận
  eventOnSelectedHub() {
    let findH = this.allHubs.find(f => f.label == this.receiverHubSelected);
    if (findH) {
      this.package.toHubId = findH.value;
      this.loadPackageNew();
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

  //
  async loadSelectHub() {
    let fintLG = this.packages.find(f => f.value == this.package.id);
    if (fintLG) {
      this.package = cloneDeep(fintLG.data);
    }
  }

  //
  async loadPackageNew() {
    await this.packageService.getPackageNewAsync(this.package.toHubId).then(
      x => {
        this.packages = [];
        this.packages.push({ value: 0, label: "Tạo mã gói mới" });
        if (x.isSuccess == true) {
          let datas = x.data as Package[];
          if (datas.length > 0) {
            let dataSort = SortUtil.sortAlphanumerical(datas, -1, "id");
            // dataSort.map(m => this.packages.push({ value: m.id, label: `${m.code} ${m.toHub ? m.toHub.name : ""}`, data: m }));
            dataSort.map(m => this.packages.push({ value: m.id, label: `${m.code}`, data: m }));
            this.package = dataSort[0];
            this.package.id = dataSort[0].id;
            this.loadSelectHub();
            this.totalRecordRight = 0;
            this.datasourceRight = [];
          }
        }
      }
    );
  }

  // tạo mã gói
  async eventOnSelectedPackages(template: TemplateRef<any>) {
    if (this.package.id == 0) {
      this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
    } else {
      this.loadSelectHub();
    }
    this.totalRecordRight = 0;
    this.datasourceRight = [];
  }

  //#region Function excute
  async createNewPackages() {
    this.package.sealNumber = null;
    this.package.createdHubId = this.currentUser.hubId;
    this.packageService.createAsync(this.package).then(
      async x => {
        if (x.isSuccess == true) {
          this.package = x.data as Package;
          let finH = this.allHubs.find(f => f.value == this.package.toHubId);
          if (finH) this.package.toHub = finH.data;
          this.packages.push({ value: this.package.id, label: `${this.package.code} ${this.package.toHub ? this.package.toHub.name : ''}` });
          this.messageService.add({ severity: Constant.messageStatus.success, detail: `Đã tạo mã gói mới thành công` });
          this.bsModalRef.hide();
        } else {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Tạo mã gói mới không thành công, vui lòng kiểm tra lại` });
        }
      }
    );
  }

  noneCreatePackages() {
    this.bsModalRef.hide();
    this.package.id = null;
  }

  // quét vận đơn để đóng gói
  evenScaneShipmentNumber(txtShipmentNumber) {
    this.messageService.clear();
    this.txtShipmentNumberRef.nativeElement.focus();
    this.txtShipmentNumberRef.nativeElement.select();
    if (!this.package.id || this.package.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Mã gói trống, vui lòng tạo mã gói trước." });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }

    txtShipmentNumber.value.trim().split(" ").forEach(x => {

      let shipmentInPackage = new ScanShipmentInPackage();
      shipmentInPackage.shipmentNumber = x;
      shipmentInPackage.packageId = this.package.id;

      this.packageService.scanShipmentInPackageAsync(shipmentInPackage).then(
        x => {
          if (!this.isValidResponse(x)) {
            SoundHelper.getSoundMessage(Constant.messageStatus.warn);
            return;
          }
          txtShipmentNumber.value = "";
          this.messageService.add({ severity: Constant.messageStatus.success, detail: "Đóng gói thành công." });
          SoundHelper.getSoundMessage(Constant.messageStatus.success);
          let shipment = x.data as Shipment;
          // add client
          this.datasourceRight.unshift(shipment);
          this.totalRecordRight++;
          if (this.datasourceRight.length > 12) {
            this.datasourceRight.splice(0, 1);
          }
          // remove client
          let findLeft = this.datasource.findIndex(f => f.id == shipment.id);
          if (findLeft || findLeft == 0) {
            this.datasource.splice(findLeft, 1);
            this.totalRecordLeft--;
          }
        });
    });
  }

  changeLength(length: number) {
    this.selectedLength = length;
    this.package.length = length;
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight =
        this.selectedLength *
        this.selectedWidth *
        this.selectedHeight /
        environment.defaultSize;
    } else {
      this.selectedCalWeight = null;
    }
  }

  changeWidth(width: number) {
    this.selectedWidth = width;
    this.package.width = width;
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight =
        this.selectedLength *
        this.selectedWidth *
        this.selectedHeight /
        environment.defaultSize;
    } else {
      this.selectedCalWeight = null;
    }
  }

  changeHeight(height: number) {
    this.selectedHeight = height;
    this.package.height = height;
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight =
        this.selectedLength *
        this.selectedWidth *
        this.selectedHeight /
        environment.defaultSize;
    } else {
      this.selectedCalWeight = null;
    }
  }

  save() {
    if (!this.isValidToCreate()) return;
    if (ArrayHelper.isNullOrZero(this.listDataRight)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa có vận đơn trong danh sách thao tác"
      });
      return;
    }
    if (ArrayHelper.isNullOrZero(this.selectedDataRight)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn!"
      });
      return;
    }
    let shipmentIds = [];
    let model = new Package();

    this.listDataRight.forEach(x => shipmentIds.push(x.id));
    model.shipmentIds = shipmentIds;
    model.weight = this.selectedWeight;
    if (this.selectedContent && this.selectedContent.trim() !== "") {
      model.content = this.selectedContent;
    } else {
      model.content = null;
    }
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      model.length = this.selectedLength;
      model.width = this.selectedWidth;
      model.height = this.selectedHeight;
      model.calWeight = this.selectedCalWeight;
    } else {
      model.length = null;
      model.width = null;
      model.height = null;
      model.calWeight = null;
      this.selectedCalWeight = null;
    }
    if (this.sealNumber && this.sealNumber.trim() !== "") {
      model.sealNumber = this.sealNumber;
    } else {
      model.sealNumber = null;
    }

    this.packageService.create(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshTableRight();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Đóng gói thành công"
      });
    });

  }

  isValidToCreate(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedWeight) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập trọng lượng"
      });
      result = false;
    }

    if (!this.selectedContent) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập nội dung"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  mapSaveData(obj: Shipment) {
    if (obj) {
    }
  }

  saveClient(list: Shipment[]) { }

  assign() {
    if (!this.selectedData) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }

    let listDataClone = Array.from(this.listDataRight);
    this.selectedData.forEach(x => listDataClone.push(x));
    this.listDataRight = listDataClone;
    this.removeDataLeft(this.selectedData);
  }

  unAssign() {
    if (!this.selectedDataRight) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }

    let listDataClone = Array.from(this.listData);
    this.selectedDataRight.forEach(x => {
      listDataClone.push(x);
      this.datasource.push(x);
    });
    this.listData = listDataClone;
    this.removeDataRight(this.selectedDataRight);
  }

  removeDataLeft(listRemove: Shipment[]) {
    let listClone = Array.from(this.listData);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
      this.datasource.splice(this.datasource.indexOf(obj), 1);
    }

    this.listData = listClone;
    this.selectedData = null;
  }

  removeDataRight(listRemove: Shipment[]) {
    let listClone = Array.from(this.listDataRight);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
    }

    this.listDataRight = listClone;
    this.selectedDataRight = null;
  }

  clickRefresh(template: TemplateRef<any>, dt: Table = null) {
    if (this.listDataRight.length > 0) {
      this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
      });
      return;
    }

    this.refresh(dt);
  }

  clone(model: Shipment): Shipment {
    let data = new Shipment();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  async loadDatasourceRight() {
    this.messageService.clear();
    if (!this.package.id || this.package.id == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng chọn mã đóng gói" });
      return;
    }
    //this.shipmentFilterViewModelRight.id = this.package.id;
    const id = this.package.id;
    const res = await this.packageService.getShipmentByPackageIdAsync(id).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.datasourceRight = x.data as Shipment[];
        this.totalRecordRight = x.dataCount ? x.dataCount : 0;
        if (this.datasourceRight.length == 0) this.messageService.add({ severity: Constant.messageStatus.success, detail: `Danh sách đóng gói '0' vận đơn.` });
      }
    );
  }

  async comfirmBlockPackage(isPrint: boolean) {
    if (!this.package.calWeight) this.package.calWeight = 0;
    if (!this.package.weight) this.package.weight = 0;
    if (!this.package.width) this.package.width = 0;
    if (!this.package.length) this.package.length = 0;
    if (!this.package.height) this.package.height = 0;
    await this.packageService.closedPackageAsync(this.package).then(async x => {
      if (x.isSuccess == true) {
        this.messageService.add({ severity: Constant.messageStatus.success, detail: `Chốt đóng gói thành công` });
        if (isPrint) {
          await this.packageService.getPackageToPrintAsync(this.package.id).then(async _dataPrint => {
            if (_dataPrint) {
              let cloneSelectCode = await this.sendSelectDataPrintMultiCode([_dataPrint]);
              this.idPrint = PrintHelper.printCreateMultiShipment;
              let dataPrint: DataPrint = new DataPrint();
              dataPrint.dataPrints = cloneSelectCode;
              await this.formPrintService.getFormPrintPackageAsync().then(
                x => {
                  if (!this.isValidResponse(x)) return;
                  let resultFormPrint = x.data as FromPrintViewModel;
                  dataPrint.formPrint = resultFormPrint.formPrintBody;
                  setTimeout(() => {
                    this.printFrormServiceInstance.sendCustomEvent(dataPrint);
                  }, 0);
                }
              );
              this.onCickRefresh();
            } else {
              this.onCickRefresh();
            }
          });
          this.onCickRefresh();
        } else {
          this.onCickRefresh();
        }
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Chốt đóng gói thất bại` });
      }
    });
  }

  async testPrint() {
    await this.packageService.getPackageToPrintAsync(this.package.id).then(async _dataPrint => {
      if (_dataPrint) {
        let cloneSelectCode = await this.sendSelectDataPrintMultiCode([_dataPrint]);
        this.idPrint = PrintHelper.printCreateMultiShipment;
        let dataPrint: DataPrint = new DataPrint();
        dataPrint.dataPrints = cloneSelectCode;
        await this.formPrintService.getFormPrintPackageAsync().then(
          x => {
            if (!this.isValidResponse(x)) return;
            let resultFormPrint = x.data as FromPrintViewModel;
            dataPrint.formPrint = resultFormPrint.formPrintBody;
            setTimeout(() => {
              this.printFrormServiceInstance.sendCustomEvent(dataPrint);
            }, 0);
          }
        );
      } else {
        // this.messageService.add({severity:Constant.messageStatus.warn,detail:'Kk'});
      }
    });
  }

  onCickRefresh() {
    this.package = new Package();
    this.package.id = 0;
    this.datasource = [];
    this.totalRecordLeft = 0;
    this.datasourceRight = [];
    this.totalRecordRight = 0;
    this.receiverHubSelected = null;
    this.receiverHubSelected_2 = null;
    this.bsModalRef.hide();
    this.refresh();
  }
}
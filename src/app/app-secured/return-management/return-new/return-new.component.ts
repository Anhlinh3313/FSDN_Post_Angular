import { Component, OnInit, TemplateRef, ViewChild, ElementRef, Input } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
import * as JsBarcode from "jsbarcode";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import { ShipmentService, UserService, ListGoodsService, DepartmentService, AuthService } from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { User } from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { ListGoods } from "../../../models/listGoods.model";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { FormDetailDeliveryComponent } from "../../print-form/form-detail-delivery/form-detail-delivery.component";
import { Table } from "primeng/table";

import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { Element } from "@angular/compiler";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { ArrayHelper } from "../../../infrastructure/array.helper";
declare var jQuery: any;
declare var $: any;

@Component({
  selector: "app-return-new",
  templateUrl: "return-new.component.html",
  styles: []
})
export class ReturnComponent extends BaseComponent implements OnInit {
  hub = environment;

  dateTo: any;
  dateFrom: any;
  shipmentNumber: string = "";
  listDataLATExportExcel: any;

  txtFilterGbRight: any;
  txtFilterGbLeft: any;
  sumWeight: number = 0;
  sumTotalBox: number = 0;
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;
  isActiveTabOne: boolean = true;
  listGoods: any;
  dateCreate: Date;

  unit = environment.unit;

  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private generalInfoService: GeneralInfoService,
    private userService: UserService,
    private listGoodsService: ListGoodsService,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    private departmentService: DepartmentService,
    private authService: AuthService, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.return.name;
  currentPage: string = Constant.pages.return.children.return.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  //
  idPrint: string;
  generalInfo: GeneralInfoModel;
  currentUser: User;
  dateCreateWhen: any;
  totalSumPrice: any;
  totalWeight: number;
  totalCalWeight: number;
  totalBox: number;
  paymentTypeHelper: PaymentTypeHelper = PaymentTypeHelper;

  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "shipmentNumber",
    "numPick",
    "numReturn",
    "returnAppointmentTime",
    "orderDate",
    "toHubRouting.name",
    "cusNote",
    "senderName",
    "senderPhone",
    "receiverName",
    "receiverPhone",
    "shippingAddress",
    "returnNote",
    "shipmentStatus.name"
  ];

  columnsLAD: string[] = [
    "code",
    "createdWhen",
    "transferUser.fullName",
    "transportTypeId",
    "transportTypeId",
    "totalShipment",
    "realWeight",
    "toHub.name",
    "fromHubName",
    "toHub.name",
    "listGoodsStatus.name"
  ];

  columnsLADExcel: any[] = [
    { field: "code", header: 'Mã vận đơn' },
    { field: "createdWhen", header: 'TG tạo' },
    { field: "fromHubName", header: 'TT/CN/T đến' },
    { field: "fullName", header: 'Nhân viên' },
    { field: "totalShipment", header: 'Tổng vận đơn' },
    { field: "realWeight", header: 'Tổng TL ' + environment.unit },
  ];

  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  selectedDataRight: Shipment[];
  listDataRight: Shipment[];
  //
  statuses: SelectItem[];
  selectedStatus: string;
  //
  hubRoutings: SelectItem[];
  selectedHubRouting: string;
  //
  riders: SelectItem[];
  selectedRider: User;
  //
  listDataLAD: ListGoods[];
  selectedDataLAD: ListGoods[];
  totalRecordsLAD: number;
  datasourceLAD: ListGoods[];
  fromHub: string;
  eventListAssigned: LazyLoadEvent;
  txtFilterGbLAD: any;
  //
  selectedDateFrom: Date = moment(new Date()).hour(0).minute(0).second(0).toDate();
  selectedDateTo: Date = moment(new Date()).hour(23).minute(59).second(0).toDate();
  //
  employees: SelectItem[];
  selectedEmployee: number;
  //
  currentDate = new Date();
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  //Save Print
  checkSubmitAndPrint: boolean;
  //
  ngOnInit() {
    this.initData();
    $("#print-section").hide();
    this.loadGeneralInfo();
    this.loadCurrentUser();
    
    // delare parrams getListGoods
    const currentDate = moment(new Date()).format(environment.formatDate);
    this.dateFrom  = currentDate + "T00:00:00";
    this.dateTo = currentDate + "T23:59:59";
    this.loadListAssignedReturn();
  }

  initData() {
    this.loadShipment();

    this.userService.getEmpByCurrentHub().subscribe(x => {
      this.riders = [];
      let users = x.data as User[];

      users.forEach(element => {
        this.riders.push({ label: element.fullName, value: element });
      });

      this.selectedRider = null;
    });

    this.selectedData = null;
    this.listDataRight = [];
  }

  loadShipment() {
    this.refreshTableRight();

    let includes: string =
    Constant.classes.includes.shipment.toHubRouting + "," +
    Constant.classes.includes.shipment.shipmentStatus;

    let shipmentFilterViewModel = new ShipmentFilterViewModel();
    shipmentFilterViewModel.Type = ShipmentTypeHelper.return;
    shipmentFilterViewModel.Cols = includes;

    this.datasource = [];
    this.listData = [];
    this.shipmentService
      .postByType(shipmentFilterViewModel)
      .subscribe(x => {
        let shipments = x.data as Shipment[];
        this.datasource = shipments;
        if (!ArrayHelper.isNullOrZero(this.datasource)) {
          this.totalRecords = this.datasource.length;
          this.listData = this.datasource.slice(0, this.rowPerPage);
          this.loadFilterLeft();
        }
      });
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

  loadLazy(event: LazyLoadEvent) {
    //in a real application, make a remote request to load data using state metadata from event
    //event.first = First row offset
    //event.rows = Number of rows per page
    //event.sortField = Field name to sort with
    //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
    //filters: FilterMetadata object having field as key and filter value, filter matchMode as value
    this.event = event;

    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasource.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );

        //Begin Custom filter
        if (this.selectedStatus) {
          filterRows = filterRows.filter(
            x => x.shipmentStatus.name === this.selectedStatus
          );
        }
        if (this.selectedHubRouting) {
          filterRows = filterRows.filter(
            x => {
              return x.toHubRouting ? x.toHubRouting.name === this.selectedHubRouting : false
            }
          );
        }

        // search datetime
        if (this.txtFilterGbLeft) {
          let result = SearchDate.searchFullDate(this.txtFilterGbLeft);
          if (result) {
            filterRows = this.datasource.filter(x =>
              FilterUtil.gbFilterFiled(x, result, this.columns)
            );
          }
          //
          let res = SearchDate.searchDayMonth(this.txtFilterGbLeft);
          if (res) {
            filterRows = this.datasource.filter(x =>
              FilterUtil.gbFilterFiled(x, res, this.columns)
            );
          }
        }

        //End Custom filter

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listDataLATExportExcel = filterRows;
        this.listData = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords = filterRows.length;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  changeFilterLeft() {
    this.selectedData = [];
    this.loadLazy(this.event);
  }

  loadFilterLeft() {
    //
    this.selectedStatus = null;
    let uniqueStatus = [];
    this.statuses = [];
    //
    this.selectedHubRouting = null;
    let uniqueHubRouting = [];
    this.hubRoutings = [];

    this.datasource.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuses.push({ label: "Chọn tất cả", value: null });
        this.hubRoutings.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueStatus.indexOf(x.shipmentStatusId) === -1 &&
        x.shipmentStatusId
      ) {
        uniqueStatus.push(x.shipmentStatusId);
        this.statuses.push({
          label: x.shipmentStatus.name,
          value: x.shipmentStatus.name
        });
      }
      //
      if (
        uniqueHubRouting.indexOf(x.toHubRoutingId) === -1 &&
        x.toHubRoutingId
      ) {
        uniqueHubRouting.push(x.toHubRoutingId);
        this.hubRoutings.push({
          label: x.toHubRouting.name,
          value: x.toHubRouting.name
        });
      }
    });
  }

  refresh() {
    this.loadShipment();
    this.loadFilterLeft();
    if (this.bsModalRef) this.bsModalRef.hide();

    //refresh
    this.selectedData = null;
    this.txtFilterGbLeft = null;
    this.txtFilterGbRight = null;
  }

  refreshTableRight() {
    this.removeStorage(this.localStorageRightData);
    this.selectedDataRight = null;
    this.listDataRight = [];
  }

  save() {
    if (!this.selectedDataRight) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }
    if (!this.selectedRider) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    } else if (!this.selectedRider.id) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    }

    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    this.selectedDataRight.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedRider.id;
    model.shipmentStatusId = StatusHelper.assignEmployeeReturn;
    model.shipmentIds = shipmentIds;

    let popUpWin = this.createPopupWin();

    //setup print
    this.itemShipment = this.selectedDataRight;
    this.generalInfoService.get().subscribe(x => {
      let general = x.data as GeneralInfoModel;
      this.itemShipment.companyName = general.companyName.toLocaleUpperCase();
      this.itemShipment.logoUrl = general.logoUrl;
      this.itemShipment.hotline = general.hotLine;
      this.itemShipment.centerHubAddress = general.addressMain;
    });
    this.itemShipment.type = "XUẤT KHO";
    this.itemShipment.createdBy = this.selectedRider.fullName;
    this.itemShipment.createdPhone = this.selectedRider.phoneNumber;

    this.shipmentService.assignReturnList(model).subscribe(x => {
      this.listGoods = x.data as ListGoods;

      if (this.listGoods) {
        //
        this.itemShipment.listGoods = this.listGoods.code;
        this.dateCreate = new Date();

        JsBarcode("#listGoods", this.itemShipment.listGoods, {
          format: "CODE128",
          height: 40,
          width: 2,
          displayValue: false
        });

        this.selectedDataRight.forEach((item, index) => {
          this.stt = index + 1;
          this.itemShipment[index].stt = this.stt;
          this.sumTotalBox += +this.selectedDataRight[index].totalBox;
          this.sumWeight += +this.selectedDataRight[index].weight;

          JsBarcode(
            "#" + this.selectedDataRight[index].shipmentNumber,
            this.selectedDataRight[index].shipmentNumber,
            {
              format: "CODE128",
              height: 30,
              width: 1,
              displayValue: false
            }
          );
        });

        this.print(popUpWin);
      }

      if (!super.isValidResponse(x)) return;
      this.refreshTableRight();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công"
      });
    });
  }
  //////////////////
  assignRiderAndPrint(isPrintBareCode: boolean) {
    this.messageService.clear();
    if (!this.listDataRight || this.listDataRight.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "BK chưa có vận đơn"
      });
      return;
    }
    if (!this.selectedRider) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    } else if (!this.selectedRider.id) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    }

    this.choiceSaveAndPrint(isPrintBareCode);
  }
  async choiceSaveAndPrint(isPrintBareCode: boolean) {
    const listGood = await this.onAssignReturn(this.listDataRight);
    if (listGood) {
      this.itemShipment = await this.onGetListGoodsId(listGood);
    }
    if (this.itemShipment) {
      setTimeout(() => {
        this.idPrint = ListGoodsTypeHelper.printDetailReturn;
        this.itemShipment.isPrintBareCode = isPrintBareCode;
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
        this.removeSelectedData(this.listDataRight);
        this.loadListAssignedReturn();
        this.listGoods = null;
      }, 0);
    }
  }
  removeSelectedData(listRemove: Shipment[]) {
    listRemove = [];
    this.listDataRight = [];
    this.selectedRider = null;
  }

  async onAssignReturn(selectedData: Shipment[]): Promise<ListGoods> {
    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    this.listDataRight.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedRider.id;
    model.shipmentStatusId = StatusHelper.assignEmployeeReturn;
    model.shipmentIds = shipmentIds;
    this.checkSubmitAndPrint = true;
    this.listGoods = await this.shipmentService.assignReturnListAsync(model);
    this.checkSubmitAndPrint = false;
    if (this.listGoods) {
      return this.listGoods;
    }
  }
  //////////////////
  mapSaveData(obj: Shipment) {
    if (obj) {
    }
  }

  saveClient(list: Shipment[]) { }

  scanShipmentNumber() {
    this.messageService.clear();
    let messageWarn: string = "";
    let messageErr: string = "";
    let messageSuccess: string = "";
    let finalTypeMessage: string = "";
    let value: string = this.shipmentNumber;
    const input = InputValue.trimInput(value);
    if (input == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    let lstShipmentNumber: string[] = input.split(" ");
    let arr: Shipment[] = [];
    
    let arrSelectedShipmentNumber = this.listDataRight.map(x => x.shipmentNumber);
    const duplicateSN = arrSelectedShipmentNumber.filter(x => lstShipmentNumber.includes(x));
    if (duplicateSN) {
      if (duplicateSN.length > 0) {
        const duplicateSNString = duplicateSN.join(" ");
        messageWarn = "Đã quét mã vận đơn " + duplicateSNString + " trước đó!" + `<br>`;
      }
    }
    lstShipmentNumber = lstShipmentNumber.filter(x => !duplicateSN.includes(x));
    arrSelectedShipmentNumber = Array.from(new Set(arrSelectedShipmentNumber.concat(lstShipmentNumber)));

    if (lstShipmentNumber.length !== 0) {
      for (let i = 0; i < lstShipmentNumber.length; i++) {
        const num = lstShipmentNumber[i];
        const num_after = lstShipmentNumber[i + 1];
  
        if (i < lstShipmentNumber.length - 1) {
          if (num == num_after) {
            lstShipmentNumber.splice(i, 1);
          }
        }
      }
  
      // Convert array shipment number to array shipment
      for (let i = 0; i < lstShipmentNumber.length; i++) {
        const num = lstShipmentNumber[i];
        for (let j = 0; j < this.datasource.length; j++) {
          const shipment = this.datasource[j];
          if (num == shipment.shipmentNumber) {
            arr.push(shipment);
            break;
          }
        }
      }
      if (arr.length > 0) {
        this.selectedData = arr;
        this.assign();
      }

      const listAssignSN = this.listDataRight.map(x => x.shipmentNumber);
      const noExistSN = arrSelectedShipmentNumber.filter(x => !listAssignSN.includes(x));
      if (noExistSN) {
        if (noExistSN.length > 0) {
          const noExistSNString = noExistSN.join(" ");
          messageErr = "Không tìm thấy vận đơn " + noExistSNString + `<br>`;
        }
      }
      const scanSuccesSN = lstShipmentNumber.length - noExistSN.length;
      if (scanSuccesSN > 0) {
        messageSuccess = "Quét thành công " + scanSuccesSN + " vận đơn" + `<br>`;
      }
      arrSelectedShipmentNumber = listAssignSN;

      if (noExistSN.length === 0 && duplicateSN.length === 0) {
        finalTypeMessage = Constant.messageStatus.success;
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
      }
      if (noExistSN.length > 0) {
        finalTypeMessage = Constant.messageStatus.error;
        SoundHelper.getSoundMessage(Constant.messageStatus.error);
      } else {
        if (duplicateSN) {
          if (duplicateSN.length > 0 ) {
          finalTypeMessage = Constant.messageStatus.warn;
            SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          }
        }
      }
    } else {
      if (duplicateSN.length > 0) {
        finalTypeMessage = Constant.messageStatus.warn;
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      }
    }
    this.messageService.add({
      severity: finalTypeMessage,
      detail: messageErr + messageWarn + messageSuccess
    });
    this.shipmentNumber = "";
  }

  choiceRowData(rowData: Shipment) {
    this.messageService.clear();
    let arr: Shipment[] = [];
    arr.push(rowData);
    this.selectedData = arr;
    this.messageService.add({
      severity: Constant.messageStatus.success,
      detail: "Đã quét thành công 1 vđ"
    });
    SoundHelper.getSoundMessage(Constant.messageStatus.success);
    this.assign();
  }

  assign() {
    let listDataClone = Array.from(this.listDataRight);
    // this.selectedData.forEach(x => listDataClone.push(x));
    this.listDataRight = this.selectedData.concat(listDataClone);
    // this.listDataRight = listDataClone;
    this.removeDataLeft(this.selectedData);
  }

  unAssign(rowData: Shipment) {
    this.messageService.clear();
    this.messageService.add({
      severity: Constant.messageStatus.success,
      detail: "Đã hủy thành công 1 vđ"
    });
    SoundHelper.getSoundMessage(Constant.messageStatus.success);
    let arr: Shipment[] = [];
    arr.push(rowData);
    let listDataClone = Array.from(this.listData);
    listDataClone.push(rowData);
    this.datasource.push(rowData);
    this.listData = listDataClone;
    this.removeDataRight(arr);
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
    this.setObjectDataRight();
  }

  removeDataRight(listRemove: Shipment[]) {
    let listClone = Array.from(this.listDataRight);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
    }

    this.listDataRight = listClone;
    this.selectedDataRight = null;
    this.setObjectDataRight();
  }

  clickRefresh(template: TemplateRef<any>) {
    if (this.listDataRight.length > 0) {
      this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
      });
      return;
    }

    this.refresh();
  }

  changeRider() {
    // this.selectedDataRight = null;
    // this.listDataRight = this.getSelectedObjectDataRight();
  }

  getSelectedObjectDataRight(): Shipment[] {
    let arr = [];
    let objectDataRight = this.getObjectDataRight();

    if (objectDataRight)
      objectDataRight.filter(x => {
        if (x.key === this.selectedRider.id) arr = x.values;
      });
    return arr;
  }

  getObjectDataRight(): KeyValuesViewModel[] {
    return this.getStorage(this.localStorageRightData) as KeyValuesViewModel[];
  }

  setObjectDataRight() {
    let objectDataRight = this.getObjectDataRight();
    let arrStorage = [];

    if (objectDataRight) {
      arrStorage = objectDataRight;
    }

    let index = this.findObjectDataRight(arrStorage);

    if (index === -1) {
      let obj = new KeyValuesViewModel();
      if (this.selectedRider) {
        if (this.selectedRider.id) {
          obj.key = this.selectedRider.id;
        }
      }
      obj.values = this.listDataRight;
      arrStorage.push(obj);
    } else {
      arrStorage[index].values = this.listDataRight;
    }
    // console.log(arrStorage);
    this.setStorage(this.localStorageRightData, arrStorage);
    // console.log(this.getObjectDataRight());
  }

  findObjectDataRight(arrStorage: KeyValuesViewModel[]): number {
    let index = -1;

    arrStorage.forEach((val, i) => {
      if (this.selectedRider) {
        if (this.selectedRider.id) {
          if (val.key === this.selectedRider.id) {
            index = i;
            return;
          }
        }
      }
    });
    return index;
  }

  removeObjectDataRight() {
    let objectDataRight = this.getObjectDataRight();
    let arrStorage = [];

    if (objectDataRight) {
      arrStorage = objectDataRight;
    }

    let index = this.findObjectDataRight(arrStorage);

    if (index !== -1) {
      arrStorage[index].values = null;
    }

    this.setStorage(this.localStorageRightData, arrStorage);
  }

  getStorage(name: string): object {
    return this.persistenceService.get(name, StorageType.LOCAL);
  }

  setStorage(name: string, obj: object) {
    this.persistenceService.set(name, obj, { type: StorageType.LOCAL });
  }

  removeStorage(name: string) {
    this.persistenceService.remove(name, StorageType.LOCAL);
  }

  clone(model: Shipment): Shipment {
    let data = new Shipment();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  createPopupWin(): Window {
    return window.open(
      "",
      "_blank",
      "top=0,left=0,height=100%,width=auto,time=no"
    );
  }

  print(popupWin) {
    setTimeout(() => {
      let printContents;
      printContents = document.getElementById("print-section").innerHTML;
      // popupWin = window.open(
      //   "",
      //   "_blank",
      //   "top=0,left=0,height=100%,width=auto,time=no"
      // );
      popupWin.document.open();
      popupWin.document.write(
        "<!DOCTYPE html><html><head>  " +
        '<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css" ' +
        'media="screen,print">' +
        '<link rel="stylesheet" href="style.css" media="screen,print">' +
        "<style>@page { size: auto;  margin: 0mm; }</style>" +
        '</head><body onload="window.print()"><div class="reward-body">' +
        printContents +
        "</div></html>"
      );
      popupWin.document.close();
    }, 1000);
  }
  ///
  onSelectTabTwo() {
    this.isActiveTabOne = false;
  }
  async loadListAssignedReturn() {
    const typeId = ListGoodsTypeHelper.detailReturn;
    const data = await this.listGoodsService.getListGoodsAsync(typeId, null, null, null, null, null, null, null, this.dateFrom, this.dateTo);
    if (data) {
      this.datasourceLAD = data.reverse();
      this.totalRecordsLAD = this.datasourceLAD.length;
      this.listDataLAD = this.datasourceLAD;
      this.listDataLAD = this.listDataLAD.sort((x, y) => {
        const a = new Date(x.createdWhen);
        const b = new Date(y.createdWhen);
        if (a > b) return -1;
        return 1;
      })
      this.listDataLATExportExcel = this.datasourceLAD;
      this.loadFilterLAD();
      this.loadLazyListAssignedDelivery(this.eventListAssigned);
    }
  }

  loadLazyListAssignedDelivery(event: LazyLoadEvent) {
    this.eventListAssigned = event;
    setTimeout(() => {
      if (this.datasourceLAD) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasourceLAD.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasourceLAD.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLAD)
          );

        //Begin Custom filter
        // if (this.selectedEmployee) {
        //   filterRows = filterRows.filter(x => x.empId == this.selectedEmployee);
        // }
        // //
        // if (this.selectedDateFrom && this.selectedDateTo) {
        //   //
        //   filterRows = filterRows.filter(x => moment(x.createdWhen).isBetween(this.selectedDateFrom, this.selectedDateTo));
        // } else if (this.selectedDateFrom) {
        //   filterRows = filterRows.filter(x => moment(x.createdWhen).isAfter(this.selectedDateFrom));
        // } else if (this.selectedDateTo) {
        //   filterRows = filterRows.filter(x => moment(x.createdWhen).isBefore(this.selectedDateTo));
        // }

        //End Custom filter

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listDataLAD = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecordsLAD = filterRows.length;
      }
    }, 250);
  }
  loadFilterLAD() {
    this.selectedEmployee = null;
    this.employees = [];

    let arrCols: string[] = [];
    arrCols = [
      FilterUtil.Column.listGood.emp,
    ];
    let result = FilterUtil.loadArrayFilter(this.datasourceLAD, arrCols);
    result.forEach(x => {
      x.forEach(e => {
        if (e.title === FilterUtil.Column.listGood.emp) {
          this.employees = x;
        }
      });
    });
  }
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };
  public eventLog = "";
  public selectedDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
    //
    this.requestGetPickupHistory.fromDate = moment(value.start).toDate();
    this.requestGetPickupHistory.toDate = moment(value.end).toDate();
    // this.selectedDateFrom = this.requestGetPickupHistory.fromDate;
    // this.selectedDateTo = this.requestGetPickupHistory.toDate;
    // this.loadLazyListAssignedDelivery(this.eventListAssigned);
    this.dateFrom = value.start.toISOString();
    this.dateTo = value.end.toISOString();
    this.loadListAssignedReturn();
  }
  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }
  changeFilterLAD() {
    this.loadLazyListAssignedDelivery(this.eventListAssigned);
  }
  async printLAD(data: ListGoods, isPrintBareCode: boolean) {
    this.itemShipment = await this.onGetListGoodsId(data);
    if (this.itemShipment) {
      setTimeout(() => {
        this.idPrint = ListGoodsTypeHelper.printDetailReturn;
        this.itemShipment.isPrintBareCode = isPrintBareCode;
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
      }, 0);
    }
  }

  async onGetListGoodsId(data: ListGoods): Promise<Shipment[]> {
    const id = data.id;
    const includes: any = [];
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

    const shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes);
    if (shipments) {
      this.itemShipment = [...shipments];

      this.itemShipment.logoUrl = this.generalInfo.logoUrl;
      this.itemShipment.companyName = this.generalInfo.companyName
      this.itemShipment.hotLine = this.generalInfo.hotLine;
      this.itemShipment.centerHubAddress = this.generalInfo.addressMain;

      if (data.toHub) {
        this.itemShipment.toHubName = data.toHub.name;
      }

      if (data.listGoodsType) {
        this.itemShipment.type = data.listGoodsType.name;
      } else {
        this.itemShipment.type = "BK chi tiết trả hàng";
      }
      this.itemShipment.createdBy = this.currentUser.fullName;
      if (this.currentUser.hub) {
        this.itemShipment.userHubName = this.currentUser.hub.name;
      }
      if (this.currentUser.department) {
        this.itemShipment.userDepartmentName = this.currentUser.department.name;
      }

      this.itemShipment.listGoods = data.code;
      this.dateCreateWhen = SearchDate.formatToISODate(new Date());
      this.itemShipment.dateCreateWhen = SearchDate.formatToISODate(new Date());

      this.totalSumPrice = 0;
      this.totalWeight = 0;
      this.totalCalWeight = 0;
      this.totalBox = 0;
      await Promise.all(this.itemShipment.map(async (item, index) => {
        if (item.currentEmp) {
          this.itemShipment.currentEmp = item.currentEmp.fullName;
          if (item.currentEmp.hub) {
            this.itemShipment.empHubName = item.currentEmp.hub.name;
          }
          if (item.currentEmp.departmentId) {
            const id = item.currentEmp.departmentId;
            const data = await this.departmentService.getDepartmentAsync(id);
            this.itemShipment.empDepartmentName = data.name;
          }
        }

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
      }));
      return this.itemShipment;
    }
  }
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
      this.fromHub = this.currentUser.hub.name;
    });
  }
  refreshLAD() {
    this.txtFilterGbLAD = null;
    this.listDataLAD = [];
    this.datasourceLAD = [];
    this.selectedEmployee = null;
    this.selectedDataLAD = [];
    this.loadListAssignedReturn();
  }
  exportCSV(dt: Table) {
    if (this.listDataLATExportExcel) {
      if (this.listDataLATExportExcel.length > 0) {
        dt._value = this.listDataLATExportExcel;
      }
    } else {
      dt._value = [];
    }
    dt.exportCSV();
  }
}

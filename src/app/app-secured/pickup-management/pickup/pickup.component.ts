import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
import * as JsBarcode from "jsbarcode";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import { RequestShipmentService, UserService } from "../../../services";
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
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";

declare var jQuery: any;
declare var $: any;

@Component({
  selector: "app-pickup",
  templateUrl: "pickup.component.html",
  styles: []
})
export class PickupComponent extends BaseComponent implements OnInit {
  txtFilterGbRight: any;
  txtFilterGbLeft: any;
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;

  listGoods: any;
  dateCreate: Date;

  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private requestShipmentService: RequestShipmentService,
    private userService: UserService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }

  unit = environment.unit;

  parentPage: string = Constant.pages.pickup.name;
  currentPage: string = Constant.pages.pickup.children.pickup.name;
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
    "pickupAppointmentTime",
    "orderDate",
    "fromHubRouting.name",
    "cusNote",
    "senderName",
    "senderPhone",
    "pickingAddress",
    "pickupNote",
    "shipmentStatus.name",
    "currentEmp.fullName"
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
  selectedStatus: number;
  //
  ridersLeft: SelectItem[];
  selectedRiderLeft: number;
  //
  dateAppointments: SelectItem[];
  selectedDateAppointment: Date;
  //
  ridersRight: SelectItem[];
  selectedRiderRight: User;

  ngOnInit() {
    this.initData();
    $("#print-section").hide();
  }

  initData() {
    this.loadShipment();

    this.userService.getEmpByCurrentHub().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.ridersRight = [];
      let users = x.data as User[];

      users.forEach(element => {
        this.ridersRight.push({ label: element.fullName, value: element });
      });

      this.selectedRiderRight = null;
    });

    this.selectedData = null;
    this.listDataRight = [];
  }

  loadShipment() {
    this.refreshTableRight();

    let includes = [];
    includes.push(Constant.classes.includes.shipment.fromHubRouting);
    includes.push(Constant.classes.includes.shipment.currentEmp);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.pickUser);
    includes.push(Constant.classes.includes.shipment.fromProvince);
    includes.push(Constant.classes.includes.shipment.toProvince);
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.listGoods.createdByHub);

    this.requestShipmentService
      .getByType(ShipmentTypeHelper.pickup, includes)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let shipments = x.data as Shipment[];
        this.datasource = shipments;
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadFilterLeft();
      });
  }

  ngAfterViewInit() {
    jQuery(document).ready(function() {
      jQuery(".i-checks").iCheck({
        checkboxClass: "icheckbox_square-green",
        radioClass: "iradio_square-green"
      });
      jQuery(".footable").footable();
    });
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
            x => x.shipmentStatusId === this.selectedStatus
          );
        }
        if (this.selectedRiderLeft) {
          filterRows = filterRows.filter(
            x => x.currentEmpId === this.selectedRiderLeft
          );
        }
        if (this.selectedDateAppointment) {
          filterRows = filterRows.filter(
            x => x.pickupAppointmentTime === this.selectedDateAppointment
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
    this.selectedRiderLeft = null;
    let uniqueHubLeft = [];
    this.ridersLeft = [];
    //
    this.selectedDateAppointment = null;
    let uniqueDateAppointment = [];
    this.dateAppointments = [];

    this.datasource.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuses.push({ label: "Chọn tất cả", value: null });
        this.ridersLeft.push({ label: "Chọn tất cả", value: null });
        this.dateAppointments.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueStatus.indexOf(x.shipmentStatusId) === -1 &&
        x.shipmentStatusId
      ) {
        uniqueStatus.push(x.shipmentStatusId);
        this.statuses.push({
          label: x.shipmentStatus.name,
          value: x.shipmentStatusId
        });
      }
      //
      if (uniqueHubLeft.indexOf(x.currentEmpId) === -1 && x.currentEmpId) {
        uniqueHubLeft.push(x.currentEmpId);
        this.ridersLeft.push({
          label: x.currentEmp.fullName,
          value: x.currentEmpId
        });
      }
      //
      if (
        uniqueDateAppointment.indexOf(x.pickupAppointmentTime) === -1 &&
        x.pickupAppointmentTime
      ) {
        uniqueDateAppointment.push(x.pickupAppointmentTime);
        this.dateAppointments.push({
          label: moment(x.pickupAppointmentTime).format(environment.formatDateTime),
          value: x.pickupAppointmentTime
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
    if (!this.selectedRiderRight) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    } else if (!this.selectedRiderRight.id) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    }

    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    this.selectedDataRight.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedRiderRight.id;
    model.shipmentStatusId = StatusHelper.assignEmployeePickup;
    model.shipmentIds = shipmentIds;

    // setup print
    // this.itemShipment = [...this.selectedDataRight];
    // this.itemShipment.type = "NHẬN HÀNG";
    // this.itemShipment.shipmentStatus = this.selectedDataRight[0].shipmentStatus.name;
    // this.itemShipment.createdBy = this.selectedRiderRight.fullName;
    // this.itemShipment.createdPhone = this.selectedRiderRight.phoneNumber;
    // this.itemShipment.companyName = PrintHelper.CompanyName;
    // this.itemShipment.hotline = PrintHelper.Hotline;
    // this.itemShipment.centerHubAddress = PrintHelper.CenterHubAddress;
    // let popUpWin = this.createPopupWin();

    this.requestShipmentService.assignPickupList(model).subscribe(x => {
      // this.listGoods = x.data as ListGoods;

      // if (this.listGoods) {
      //   //
      //   this.itemShipment.listGoods = this.listGoods.code;
      //   // this.itemShipment.createdHub = this.listGoods.createdByHub.name;
      //   console.log(this.listGoods);

      //   this.dateCreate = new Date();

      //   JsBarcode("#listGoods", this.itemShipment.listGoods, {
      //     format: "CODE128",
      //     height: 40,
      //     width: 2,
      //     displayValue: false
      //   });

      //   this.selectedDataRight.forEach((item, index) => {
      //     this.stt = index + 1;
      //     this.itemShipment[index].stt = this.stt;

      //     JsBarcode(
      //       "#" + this.selectedDataRight[index].shipmentNumber,
      //       this.selectedDataRight[index].shipmentNumber,
      //       {
      //         format: "CODE128",
      //         height: 30,
      //         width: 1,
      //         displayValue: false
      //       }
      //     );
      //   });

      //   this.print(popUpWin);
      // }

      if (!super.isValidResponse(x)) return;
      this.refreshTableRight();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công"
      });
    });
  }

  mapSaveData(obj: Shipment) {
    if (obj) {
    }
  }

  saveClient(list: Shipment[]) {}

  assign() {
    if (!this.selectedData) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }
    if (!this.selectedRiderRight) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    } else if (!this.selectedRiderRight.id) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
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
    this.selectedDataRight = null;
    this.listDataRight = this.getSelectedObjectDataRight();
  }

  getSelectedObjectDataRight(): Shipment[] {
    let arr = [];
    let objectDataRight = this.getObjectDataRight();

    if (objectDataRight)
      objectDataRight.filter(x => {
        if (x.key === this.selectedRiderRight.id) arr = x.values;
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
      obj.key = this.selectedRiderRight.id;
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
      if (val.key === this.selectedRiderRight.id) {
        index = i;
        return;
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
}

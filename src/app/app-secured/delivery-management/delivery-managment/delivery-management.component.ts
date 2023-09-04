import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
import * as JsBarcode from "jsbarcode";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import { ShipmentService, UserService } from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { User } from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import { PrintModel } from "../../../models/print.model";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { ListGoods } from "../../../models/listGoods.model";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";

declare var jQuery: any;
declare var $: any;
var count_click = 0;

@Component({
  selector: "app-delivery-management",
  templateUrl: "delivery-management.component.html",
  styles: []
})

export class DeliveryMagementComponent extends BaseComponent implements OnInit {
  unit = environment.unit;
  
  txtFilterGbRight: any;
  txtFilterGbLeft: any;
  sumWeight: number = 0;
  sumTotalBox: number = 0;
  clickedFilter: boolean = false;
  status_dropdown_menu = 0;
  onClickMenuItem = false;
  onClickPDropdown = false;

  isShow = true;
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;

  listGoods: any;
  dateCreate: Date;

  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }

  parentPage: string = Constant.pages.delivery.name;
  currentPage: string = Constant.pages.delivery.children.delivery.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "shipmentNumber",
    "numDelivery",
    "deliveryAppointmentTime",
    "orderDate",
    "toHubRouting.name",
    "cusNote",
    "receiverName",
    "receiverPhone",
    "shippingAddress",
    "deliveryNote",
    "shipmentStatus.name"
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
  dateAppointments: SelectItem[];
  selectedDateAppointment: Date;
  //
  riders: SelectItem[];
  selectedRider: User;
  //
  paymentTypeHelper: any = PaymentTypeHelper;
  totalMoneyRiderHold: number = 0;

  ngOnInit() {
    this.initData();
    $(".new-dropdown-menu").hide();
    $("#print-section").hide();
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

    let includes = [];
    includes.push(Constant.classes.includes.shipment.toHubRouting);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.listGoods.createdByHub);

    this.shipmentService
      .getByType(ShipmentTypeHelper.delivery, includes)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let shipments = x.data as Shipment[];
        this.datasource = shipments;
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadFilterLeft();
      });

    //refresh
    this.txtFilterGbLeft = null;
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
              if (x.toHubRouting) {
                return x.toHubRouting.name === this.selectedHubRouting;
              } else {
                return false;
              }
            }
          );
        }
        if (this.selectedDateAppointment) {
          filterRows = filterRows.filter(
            x => x.deliveryAppointmentTime === this.selectedDateAppointment
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

  calculateTotalMoneyRiderHold() {
    this.totalMoneyRiderHold = 0;

    this.listDataRight.forEach(element => {
      if (element.paymentTypeId === PaymentTypeHelper.NNTTN) {
        this.totalMoneyRiderHold += element.totalPrice ? element.totalPrice : 0;
      }
      this.totalMoneyRiderHold += element.cod ? element.cod : 0;
    });
  }

  changeFilterLeft() {
    this.selectedData = [];
    this.loadLazy(this.event);
    // $(".ui-dropdown-items-wrapper").click(function(event) {
    //   // alert(123);
    //   event.bind();
    // });

    if (this.onClickPDropdown == true) {
      this.onClickPDropdown = false;
    } else {
      this.onClickPDropdown = true;
    }
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
    //
    this.selectedDateAppointment = null;
    let uniqueDateAppointment = [];
    this.dateAppointments = [];

    this.datasource.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuses.push({ label: "Chọn tất cả", value: null });
        this.hubRoutings.push({ label: "Chọn tất cả", value: null });
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
      //
      if (
        uniqueDateAppointment.indexOf(x.deliveryAppointmentTime) === -1 &&
        x.deliveryAppointmentTime
      ) {
        uniqueDateAppointment.push(x.deliveryAppointmentTime);
        this.dateAppointments.push({
          label: moment(x.deliveryAppointmentTime).format(environment.formatDateTime),
          value: x.deliveryAppointmentTime
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
    this.txtFilterGbRight = null;
  }

  refreshTableRight() {
    this.removeStorage(this.localStorageRightData);
    this.selectedDataRight = null;
    this.listDataRight = [];
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

    let listDataClone = Array.from(this.listDataRight);
    this.selectedData.forEach(x => listDataClone.push(x));
    this.listDataRight = listDataClone;
    this.removeDataLeft(this.selectedData);
    this.calculateTotalMoneyRiderHold();

    // console.log("chuyen: " + listDataClone[0]);
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
    this.calculateTotalMoneyRiderHold();
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

  changeAssignShipment(txtAssignShipment) {
    let assignShipment = this.listData.filter(
      x => x.shipmentNumber === txtAssignShipment.value
    );

    if (assignShipment.length === 0) {
      txtAssignShipment.value = null;
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy vận đơn"
      });
      return;
    }

    this.selectedData = [];
    this.selectedData.push(assignShipment[0]);
    this.assign();
    txtAssignShipment.value = null;
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
        if (x.key === this.selectedRider.id) arr = x.values;
        // console.log("arr: " + arr);
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
      obj.key = this.selectedRider.id;
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
      if (val.key === this.selectedRider.id) {
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

  onFilter() {
    count_click++;
    if (this.clickedFilter == false) {
      this.status_dropdown_menu = 1;
      this.clickedFilter = true;
    } else {
      this.status_dropdown_menu = 0;
      this.clickedFilter = false;
    }
    if (count_click % 2 !== 0) {
      $(".new-dropdown-menu").show();
      $(document).mouseup(function(e) {
        var container = $(".new-dropdown-menu");
        var btnfilter = $("#buttton-filter");
        if (
          !container.is(e.target) &&
          container.has(e.target).length === 0 &&
          !btnfilter.is(e.target)
        ) {
          $(".new-dropdown-menu").hide();
          count_click = 0;
        }
      });
    } else {
      $(".new-dropdown-menu").hide();
    }
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
    model.shipmentStatusId = StatusHelper.assignEmployeeDelivery;
    model.shipmentIds = shipmentIds;

    //setup print
    this.itemShipment = [...this.selectedDataRight];
    this.itemShipment.type = "XUẤT KHO";
    this.itemShipment.createdBy = this.selectedRider.fullName;

    let popUpWin = this.createPopupWin();

    this.shipmentService.assignDeliveryList(model).subscribe(x => {
      this.listGoods = x.data as ListGoods;

      if (this.listGoods) {
        //

        this.itemShipment.listGoods = this.listGoods.code;
        this.itemShipment.companyName = PrintHelper.CompanyName;
        this.itemShipment.hotline = PrintHelper.Hotline;
        this.itemShipment.centerHubAddress = PrintHelper.CenterHubAddress;

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
      } else {
        // console.log("Not Print");
      }

      if (!super.isValidResponse(x)) return;
      this.refreshTableRight();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công"
      });
    });
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

import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
import * as JsBarcode from "jsbarcode";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import {
  RequestShipmentService,
  UserService,
  ShipmentStatusService,
  ReasonService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { User, Reason } from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { ReasonHelper } from "../../../infrastructure/reason.helper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { ListGoods } from "../../../models/listGoods.model";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";

declare var jQuery: any;
declare var $: any;

@Component({
  selector: "app-update-pickup-status",
  templateUrl: "update-pickup-status.component.html",
  styles: []
})
export class UpdatePickupStatusComponent extends BaseComponent
  implements OnInit {
  txtFilterGbRight: any;
  txtFilterGbLeft: any;
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
    private requestShipmentService: RequestShipmentService,
    private shipmentStatusService: ShipmentStatusService,
    private userService: UserService,
    private reasonService: ReasonService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }

  unit = environment.unit;

  parentPage: string = Constant.pages.pickup.name;
  currentPage: string = Constant.pages.pickup.children.updatePickupStatus.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  //
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
    "pickNote",
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
  statusesLeft: SelectItem[];
  selectedStatusLeft: number;
  //
  defaultRiders: User[];
  ridersLeft: SelectItem[];
  selectedRiderLeft: number;
  //
  defaultStatusesRight: ShipmentStatus[];
  statusesRight: SelectItem[];
  selectedStatusRight: number;
  //
  reasons: SelectItem[];
  selectedReason: Reason;
  //
  disabledControlLeft: boolean;
  disabledControlRight: boolean = true;
  note: string;
  //

  riders: SelectItem[];
  selectedRider: User;
  //
  paymentTypeHelper: any = PaymentTypeHelper;
  totalMoneyRiderHold: number = 0;

  ngOnInit() {
    this.initData();
    $("#print-section").hide();
  }

  initData() {
    this.userService.getEmpByCurrentHub().subscribe(x => {
      this.defaultRiders = x.data as User[];
      this.loadShipment();
    });

    let statusIds = [];
    statusIds.push(StatusHelper.pickupCancel);
    statusIds.push(StatusHelper.pickupLostPackage);
    statusIds.push(StatusHelper.storeInWarehousePickup);

    this.shipmentStatusService.getByIds(statusIds).subscribe(x => {
      this.defaultStatusesRight = x.data as ShipmentStatus[];
    });

    this.selectedData = null;
    this.listDataRight = [];
  }

  loadStatusesRight() {
    this.statusesRight = [];
    this.statusesRight.push({ label: "Chọn Tình trạng", value: null });
    this.disableControlRight();

    if (this.defaultStatusesRight && this.selectedStatusLeft) {
      this.defaultStatusesRight.forEach(element => {
        if (
          this.selectedStatusLeft === StatusHelper.picking &&
          element.id === StatusHelper.pickupCancel
        ) {
          this.statusesRight.push({ label: element.name, value: element.id });
        }

        if (
          this.selectedStatusLeft === StatusHelper.pickupComplete &&
          (element.id === StatusHelper.pickupLostPackage ||
            element.id === StatusHelper.storeInWarehousePickup)
        ) {
          this.statusesRight.push({ label: element.name, value: element.id });
        }
      });
    }

    this.selectedStatusRight = null;
  }

  loadShipment() {
    this.refreshTableRight();

    let includes = [];
    includes.push(Constant.classes.includes.shipment.fromHubRouting);
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.service);
    includes.push(Constant.classes.includes.shipment.pickUser);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);

    this.requestShipmentService
      .getByType(ShipmentTypeHelper.updatePickup, includes)
      .subscribe(x => {
        let shipments = x.data as Shipment[];
        this.datasource = shipments;
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadFilterLeft();
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
        if (this.selectedStatusLeft) {
          filterRows = filterRows.filter(
            x => x.shipmentStatusId === this.selectedStatusLeft
          );
        }

        if (this.selectedRiderLeft) {
          filterRows = filterRows.filter(
            x => x.pickUserId === this.selectedRiderLeft
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
      if (element.paymentTypeId === PaymentTypeHelper.NGTTN) {
        this.totalMoneyRiderHold += element.totalPrice ? element.totalPrice : 0;
      }
    });
  }

  changeFilterLeft() {
    this.selectedData = [];
    this.loadLazy(this.event);
    this.loadStatusesRight();
  }

  loadFilterLeft() {
    //
    this.selectedStatusLeft = null;
    let uniqueStatus = [];
    this.statusesLeft = [];
    //
    this.selectedRiderLeft = null;
    let uniqueRiderLeft = [];
    this.ridersLeft = [];

    this.datasource.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statusesLeft.push({ label: "Chọn tất cả", value: null });
        this.ridersLeft.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueStatus.indexOf(x.shipmentStatusId) === -1 &&
        x.shipmentStatusId
      ) {
        uniqueStatus.push(x.shipmentStatusId);
        this.statusesLeft.push({
          label: x.shipmentStatus.name,
          value: x.shipmentStatusId
        });
      }
      //
      if (uniqueRiderLeft.indexOf(x.pickUserId) === -1 && x.pickUserId) {
        uniqueRiderLeft.push(x.pickUserId);
        this.ridersLeft.push({
          label: x.pickUser.fullName,
          value: x.pickUserId
        });
      }
    });
  }

  refresh() {
    this.loadShipment();
    this.loadFilterLeft();
    this.totalMoneyRiderHold = 0;
    if (this.bsModalRef) this.bsModalRef.hide();
    //refresh
    this.selectedData = null;
    this.txtFilterGbLeft = null;
    this.txtFilterGbRight = null;
  }

  refreshTableRight() {
    this.selectedDataRight = null;
    this.listDataRight = [];
    this.note = null;
    this.selectedStatusRight = null;
    this.reasons = [];
    this.selectedReason = null;
    this.disableControlLeft();
    this.disableControlRight();
  }

  save() {
    if (!this.selectedDataRight) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }

    if (!this.selectedStatusRight) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn Tình trạng thao tác"
      });
      return;
    }

    if (
      (this.selectedStatusRight === StatusHelper.pickupCancel ||
        this.selectedStatusRight === StatusHelper.pickupLostPackage) &&
      (!this.selectedReason && !this.note)
    ) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn lý do hoặc nhập ghi chú"
      });
      return;
    }

    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();
    let note = "";

    if (this.selectedReason && this.note) {
      note = `${this.selectedReason.name}, ${this.note}`;
    } else if (this.selectedReason) {
      note = `${this.selectedReason.name}`;
    } else if (this.note) {
      note = `${this.note}`;
    }

    this.selectedDataRight.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedRiderLeft;
    model.shipmentStatusId = this.selectedStatusRight;
    model.shipmentIds = shipmentIds;
    model.note = note;
    //setup print
    this.itemShipment = [...this.selectedDataRight];
    this.itemShipment.type = "NHẬN HÀNG";
    this.itemShipment.shipmentStatus = this.selectedDataRight[0].shipmentStatus.name;
    this.itemShipment.createdBy = this.selectedDataRight[0].pickUser.fullName;
    this.itemShipment.createdPhone = this.selectedDataRight[0].pickUser.phoneNumber;

    let popUpWin = this.createPopupWin();

    this.requestShipmentService.assignUpdatePickupList(model).subscribe(x => {
      this.listGoods = x.data as ListGoods;

      if (this.listGoods) {
        //
        this.itemShipment.listGoods = this.listGoods.code;
        // this.itemShipment.createdHub = this.listGoods.createdByHub.name;
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

  // mapSaveData(obj: Shipment) {
  //   if (obj) {

  //   }
  // }

  // saveClient(list: Shipment[]) {

  // }

  isValid() {
    if (!this.selectedStatusLeft) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn Tình trạng"
      });
      return false;
    }
    if (!this.selectedData) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return false;
    }
    if (!this.selectedRiderLeft) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return false;
    } else if (!this.selectedRiderLeft) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return false;
    }

    return true;
  }

  disableControlLeft() {
    if (this.listDataRight && this.listDataRight.length > 0) {
      this.disabledControlLeft = true;
    } else {
      this.disabledControlLeft = false;
    }
  }

  disableControlRight() {
    if (this.selectedStatusRight === StatusHelper.pickupCancel) {
      this.disabledControlRight = false;
    } else {
      this.disabledControlRight = true;
    }
  }

  assign() {
    if (!this.isValid()) return;

    let listDataClone = Array.from(this.listDataRight);
    this.selectedData.forEach(x => listDataClone.push(x));

    // console.log(this.listData);
    this.listDataRight = listDataClone;
    this.removeDataLeft(this.selectedData);
    this.disableControlLeft();
    this.calculateTotalMoneyRiderHold();
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
    this.disableControlLeft();
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

  clickRefresh(template: TemplateRef<any>) {
    if (this.listDataRight.length > 0) {
      this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
      });
      return;
    }

    this.refresh();
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

  changeStatusRight() {
    this.reasons = [];
    this.reasons.push({ label: "Chọn lý do", value: null });

    if (this.selectedStatusRight === StatusHelper.pickupCancel) {
      this.reasonService.getByType(ReasonHelper.PickCancel).subscribe(x => {
        let reason = x.data as Reason[];
        reason.forEach(element => {
          this.reasons.push({ label: element.name, value: element });
        });
      });
    }

    this.disableControlRight();
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

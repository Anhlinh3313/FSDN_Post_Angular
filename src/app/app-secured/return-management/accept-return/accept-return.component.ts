import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  ShipmentService,
  ShipmentStatusService,
  ReasonService,
  AuthService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { Reason, Customer } from "../../../models/index";
import {
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { ReasonHelper } from "../../../infrastructure/reason.helper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { SoundHelper } from "../../../infrastructure/sound.helper";

declare var $: any;

@Component({
  selector: "app-accept-return",
  templateUrl: "accept-return.component.html",
  styles: []
})
export class AcceptReturnComponent extends BaseComponent
  implements OnInit {
  hub = environment;

  txtFilterGbRight: any;
  txtNote: any;
  txtFilterGbLeft: any;
  sumWeight: number = 0;
  sumTotalBox: number = 0;
  isShow = true;
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;

  listGoods: any;
  dateCreate: Date;

  unit = environment.unit;

  constructor(
    private authService: AuthService,
    private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private shipmentStatusService: ShipmentStatusService,
    private reasonService: ReasonService, public permissionService: PermissionService, public router: Router) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.return.name;
  currentPage: string = Constant.pages.return.children.acceptReturn.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  //
  columns: string[] = [
    "shipmentNumber",
    "numDeliver",
    "deliveryAppointmentTime",
    "orderDate",
    "toHubRouting.name",
    "totalPrice",
    "cod",
    "pickupAppointmentTime",
    "cusNote",
    "receiverName",
    "receiverPhone",
    "shippingAddress",
    "deliveryNote",
    "shipmentStatus.name",
    "toHubRouting.name"
  ];
  shipmentFilterViewModelLeft: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  datasourceLeft: Shipment[];
  totalRecordLeft: number = 0;
  event: LazyLoadEvent;
  firstLeft: number = 0;
  pageSizeLeft: number = 10;
  pageNumberLeft: number = 1;
  //
  selectedDataRight: Shipment[];
  listDataRight: Shipment[];
  //
  statusesLeft: SelectItem[];
  selectedStatusLeft: number;
  //
  defaultRiders: Customer[];
  customerLeft: SelectItem[];
  selectedCusomerLeft: number;
  //
  statusesRight: SelectItem[];
  selectedStatusRight: number;
  //
  reasons: SelectItem[];
  selectedReason: Reason;
  note: string;
  //
  paymentTypeHelper: any = PaymentTypeHelper;
  totalMoneyRiderHold: number = 0;
  //
  @ViewChild("txtAssignShipment") txtAssignShipmentRef: ElementRef;

  ngOnInit() {
    this.initData();
    $("#print-section").hide();
    this.loadReasonsRight();
    this.loadStatusesRight();
  }

  initData() {
    // this.userService.getEmpByCurrentHub().subscribe(x => {
    //   this.defaultRiders = x.data as User[];
    // });
    this.selectedData = null;
    this.listDataRight = [];
    //
    let includes: string = "";
    includes = Constant.classes.includes.shipment.toHub + "," +
      Constant.classes.includes.shipment.service + "," +
      Constant.classes.includes.shipment.deliverUser + "," +
      Constant.classes.includes.shipment.toHubRouting + "," +
      Constant.classes.includes.shipment.shipmentStatus + "," +
      Constant.classes.includes.shipment.deliverUser + "," +
      Constant.classes.includes.shipment.sender;
    this.shipmentFilterViewModelLeft.Cols = includes;
    this.shipmentFilterViewModelLeft.Type = ShipmentTypeHelper.inventory;
    this.shipmentFilterViewModelLeft.PageNumber = this.pageNumberLeft;
    this.shipmentFilterViewModelLeft.PageSize = this.pageSizeLeft;
    this.loadShipmentLetf();
    //
  }

  loadStatusesRight() {
    this.statusesRight = [];
    let statusIds = [];
    statusIds.push(StatusHelper.deliveryCancel);

    this.shipmentStatusService.getByIds(statusIds).subscribe(x => {
      let defaultStatusesRight = x.data as ShipmentStatus[];
      if (defaultStatusesRight) {
        defaultStatusesRight.forEach(element => {
          this.statusesRight.push({ label: element.name, value: element.id });
        });
        this.selectedStatusRight = defaultStatusesRight[0].id;
      }
    });
  }

  loadShipmentLetf() {
    this.datasourceLeft = [];
    this.shipmentService
      .postByTypeAsync(this.shipmentFilterViewModelLeft)
      .then(x => {
        if (!this.isValidResponse(x)) return;
        let shipments = x.data as Shipment[];
        this.datasourceLeft = shipments;
        this.totalRecordLeft = x.dataCount;
      });

    //refresh
    this.txtFilterGbLeft = null;
  }

  onPageChangeLeft(event: LazyLoadEvent) {
    this.shipmentFilterViewModelLeft.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModelLeft.PageSize = event.rows;
    this.loadShipmentLetf();
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

  calculateTotalMoneyRiderHold() {
    this.totalMoneyRiderHold = 0;
    this.listDataRight.forEach(element => {
      if (element.paymentTypeId === PaymentTypeHelper.NNTTN) {
        this.totalMoneyRiderHold += element.totalPrice ? element.totalPrice : 0;
      }
      this.totalMoneyRiderHold += element.cod ? element.cod : 0;
    });
  }


  refresh() {
    this.loadShipmentLetf();
    this.refreshTableRight();
    if (this.bsModalRef) this.bsModalRef.hide();
  }

  refreshTableRight() {
    this.selectedDataRight = null;
    this.listDataRight = [];
    this.note = null;
  }

  save() {
    if (!this.listDataRight) {
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
      (this.selectedStatusRight === StatusHelper.deliveryCancel ||
        this.selectedStatusRight === StatusHelper.deliveryLostPackage) &&
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

    this.listDataRight.forEach(x => shipmentIds.push(x.id));
    model.empId = this.authService.getUserId();
    model.shipmentStatusId = this.selectedStatusRight;
    model.shipmentIds = shipmentIds;
    model.note = note;
    this.shipmentService.assignUpdateDeliveryList(model).subscribe(x => {
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

  saveClient(list: Shipment[]) { }

  isValid() {
    if (!this.selectedStatusRight) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return false;
    }
    return true;
  }

  removeDataLeft(listRemove: Shipment[]) {
    let listClone = Array.from(this.datasourceLeft);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
      this.datasourceLeft.splice(this.datasourceLeft.indexOf(obj), 1);
    }

    this.datasourceLeft = listClone;
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
    this.txtAssignShipmentRef.nativeElement.focus();
    this.txtAssignShipmentRef.nativeElement.select();
    this.messageService.clear();
    let fintR = this.listDataRight.find(f=>f.shipmentNumber==txtAssignShipment.value)
    if(fintR){
      this.messageService.add({severity:Constant.messageStatus.warn, detail:`Mẫ vẫn đơn ${txtAssignShipment.value} đã tồn tại trong danh sách thao tác`});
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    let scanFilter: ShipmentFilterViewModel = new ShipmentFilterViewModel();
    scanFilter.PageNumber = 1;
    scanFilter.PageSize = 1;
    scanFilter.ShipmentNumber = txtAssignShipment.value;
    scanFilter.Type = ShipmentTypeHelper.inventory;
    this.shipmentService.postByTypeAsync(scanFilter).then(
      x => {
        if (!this.isValidResponse(x)) return;
        if (x.data && x.data.length > 0) {
          this.assign(x.data[0] as Shipment);
          this.totalRecordLeft--;
          txtAssignShipment.value = null;
          this.messageService.add({ severity: Constant.messageStatus.success, detail: `Quét mã vận đơn thành công.` });
          SoundHelper.getSoundMessage(Constant.messageStatus.success);
        } else {
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Mã vận đơn '${txtAssignShipment.value}' không tìm thấy!!!` });
        }
      }
    );
  }

  loadReasonsRight() {
    this.reasons = [];
    this.reasons.push({ label: "Chọn lý do", value: null });
    this.reasonService.getByType(ReasonHelper.DeliverCancel).subscribe(x => {
      let reason = x.data as Reason[];
      reason.forEach(element => {
        this.reasons.push({ label: element.name, value: element });
      });
    });
    //}
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
      ); popupWin.document.close();
    }, 1000);
  }
  assignLeft(data: Shipment) {
    if (data.shipmentStatusId == StatusHelper.readyToReturn) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vận đơn đã được cập nhật trạng thái vui lòng chọn vận đơn khác!"
      });
      return;
    }


    //add Right 
    this.listDataRight = this.listDataRight.concat([data]);
    //remove Left
    var index = this.datasourceLeft.indexOf(data);
    this.datasourceLeft.splice(this.datasourceLeft.indexOf(data), 1);
    this.datasourceLeft = this.datasourceLeft.filter((val, i) => i != this.datasourceLeft.indexOf(data));
  }
  unAssignRight(data: Shipment) {
    //add Left 
    this.datasourceLeft.push(data);
    this.datasourceLeft = this.datasourceLeft.concat([data]);
    //remove Right
    this.listDataRight = this.listDataRight.filter((val, i) => i != this.listDataRight.indexOf(data));
  }
  assign(data: Shipment) {
    //add Right 
    this.listDataRight.unshift(data);
    //remove Left.
    var fintdL = this.datasourceLeft.findIndex(f => f.id == data.id);
    if (fintdL >= 0) this.datasourceLeft.splice(fintdL, 1);
  }
  unAssign(data: Shipment[]) {
    //add Left 
    this.datasourceLeft = this.datasourceLeft.concat(data);
    //remove Right
    this.datasourceLeft.forEach(x => {
      this.datasourceLeft.splice(0, 1);
      this.listDataRight = this.listDataRight.filter((val, i) => i != 0);
    });

  }
}

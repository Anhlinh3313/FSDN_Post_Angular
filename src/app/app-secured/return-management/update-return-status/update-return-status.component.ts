import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  ShipmentService,
  UserService,
  ShipmentStatusService,
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { User } from "../../../models/index";
import {
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { Table } from "../../../../../node_modules/primeng/table";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { SoundHelper } from "../../../infrastructure/sound.helper";

declare var $: any;

@Component({
  selector: "app-update-return-status",
  templateUrl: "update-return-status.component.html",
  styles: []
})
export class UpdateReturnStatusComponent extends BaseComponent
  implements OnInit {
  @ViewChild("txtAssignShipment") txtAssignShipmentRef: ElementRef;
  txtFilterGbRight: any;
  txtFilterGbLeft: any;
  createdPhone: string;
  createdBy: string;
  shipmentStatus: string;
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;

  unit = environment.unit;

  listGoods: any;
  dateCreate: any;

  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private shipmentStatusService: ShipmentStatusService,
    private userService: UserService,
    private generalInfoService: GeneralInfoService,
    public permissionService: PermissionService, public router: Router) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.return.name;
  currentPage: string = Constant.pages.return.children.updateReturnStatus.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  listData: Shipment[];
  //
  columns: string[] = [
    "shipmentNumber",
    "numReturn",
    "orderDate",
    "fromHubRouting.name",
    "cusNote",
    "senderName",
    "senderPhone",
    "pickingAddress",
    "deliveryNote",
    "returnNote",
    "shipmentStatus.name"
  ];

  columnsFilter = [
    { field: 'shipmentNumber', header: 'Mã' },
    { field: 'numReturn', header: 'Trả lại' },
    { field: 'orderDate', header: 'Ngày vận đơn' },
    { field: 'fromHubRouting.name', header: 'Tuyến' },
    { field: 'cusNote', header: 'Ghi chú khách hàng' },
    { field: 'senderName', header: 'Người nhận' },
    { field: 'senderPhone', header: 'Số đt người nhận' },
    { field: 'pickingAddress', header: 'Địa chỉ trả hàng' },
    { field: 'deliveryNote', header: 'Ghi chú trả hàng' },
    { field: 'shipmentStatus.name', header: 'Tình trạng' }
  ]

  datasourceLeft: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  listDataRight: Shipment[];
  //
  statusesLeft: SelectItem[];
  selectedStatusLeft: number;
  //
  defaultRiders: User[];
  ridersLeft: SelectItem[];
  selectedRiderLeft: number;
  //
  defaultStatusesRight: SelectItem[] = [];
  statusesRight: SelectItem[];
  selectedStatusRight: number=null;
  //
  filterShipmentLeft: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  disabledControlLeft: boolean;
  totalRecordLeft: number = 0;
  rowLeft: number = 10;
  pageNumberLeft: number = 1;
  firstLeft: number = 0;
  note: string;

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
    statusIds.push(StatusHelper.returnComplete);
    statusIds.push(StatusHelper.returnLostPackage);
    statusIds.push(StatusHelper.returnFail);
    this.defaultStatusesRight.push({ value: null, label: `-- Chọn trạng thái --` })
    this.shipmentStatusService.getByIds(statusIds).subscribe(x => {
      let datas = x.data as ShipmentStatus[];
      datas.map(m => { this.defaultStatusesRight.push({ value: m.id, label: m.name }) })
      if (datas.length > 0) this.selectedStatusRight = datas[0].id;
    });

    this.selectedData = null;
    this.listDataRight = [];

    let includes: string =
      Constant.classes.includes.shipment.fromHubRouting + "," +
      Constant.classes.includes.shipment.shipmentStatus + "," +
      Constant.classes.includes.shipment.returnUser;
    this.filterShipmentLeft.PageSize = this.rowLeft;
    this.filterShipmentLeft.PageNumber = this.pageNumberLeft;
    this.filterShipmentLeft.Type = ShipmentTypeHelper.updateReturn;
    this.filterShipmentLeft.Cols = includes;
  }

  loadShipment() {
    this.datasourceLeft = [];
    this.shipmentService.postByTypeAsync(this.filterShipmentLeft).then(
      x => {
        if (!this.isValidResponse(x)) return;
        let shipments = x.data as Shipment[];
        this.datasourceLeft = shipments;
        this.totalRecordLeft = x.dataCount;
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

  refresh(dt: Table = null) {
    this.loadShipment();
    if (this.bsModalRef) this.bsModalRef.hide();

    //refresh
    this.selectedData = null;
    this.listDataRight = [];
    this.txtFilterGbLeft = null;
    this.txtFilterGbRight = null;
  }

  refreshTableRight() {
    this.listDataRight = [];
    this.note = null;
    this.selectedStatusRight = null;
    this.disableControlLeft();
    this.disableControlRight();
  }

  save() {
    this.messageService.clear();
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
      this.selectedStatusRight === StatusHelper.returnLostPackage &&
      !this.note
    ) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn lý do hoặc nhập ghi chú"
      });
      return;
    }

    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    this.listDataRight.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedRiderLeft;
    model.shipmentStatusId = this.selectedStatusRight;
    model.shipmentIds = shipmentIds;
    model.note = this.note;

    this.shipmentService.assignUpdateReturnList(model).subscribe(x => {
      if (!this.isValidResponse(x)) return;
      this.refresh();
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

  onPageChangeLeft(event: LazyLoadEvent) {
    this.filterShipmentLeft.PageNumber = event.first / event.rows + 1;
    this.filterShipmentLeft.PageSize = event.rows;
    this.loadShipment();
  }

  disableControlRight() { }

  assign() {
    if (!this.isValid()) return;

    let listDataClone = Array.from(this.listDataRight);
    this.selectedData.forEach(x => listDataClone.push(x));
    this.listDataRight = listDataClone;
    this.removeDataLeft(this.selectedData);
    this.disableControlLeft();
  }

  removeDataLeft(listRemove: Shipment[]) {
    let listClone = Array.from(this.listData);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
      this.datasourceLeft.splice(this.datasourceLeft.indexOf(obj), 1);
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

  changeAssignShipment(txtAssignShipment) {
    this.txtAssignShipmentRef.nativeElement.focus();
    this.txtAssignShipmentRef.nativeElement.select();
    this.messageService.clear();
    let fintR = this.listDataRight.find(f => f.shipmentNumber == txtAssignShipment.value)
    if (fintR) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Mẫ vẫn đơn ${txtAssignShipment.value} đã tồn tại trong danh sách thao tác` });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    //    
    let scanFilter: ShipmentFilterViewModel = new ShipmentFilterViewModel();
    scanFilter.PageNumber = 1;
    scanFilter.PageSize = 1;
    scanFilter.ShipmentNumber = txtAssignShipment.value;
    scanFilter.Type = ShipmentTypeHelper.updateReturn;
    this.shipmentService.postByTypeAsync(scanFilter).then(
      x => {
        if (!this.isValidResponse(x)) return;
        if (x.data && x.data.length > 0) {
          let shipment = x.data[0] as Shipment;
          this.listDataRight.unshift(shipment);
          //remove Left.
          var fintdL = this.datasourceLeft.findIndex(f => f.id == shipment.id);
          if (fintdL >= 0) this.datasourceLeft.splice(fintdL, 1);
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

  changeStatusRight() {
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

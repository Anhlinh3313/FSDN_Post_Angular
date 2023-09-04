import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  ShipmentStatusService,
  ShipmentService,
  AuthService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { Shipment } from "../../../models/shipment.model";
import {
  DateRangeFromTo, ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { ExportAnglar5CSV } from "../../../infrastructure/exportAngular5CSV.helper";
//////////////
declare var jQuery: any;

@Component({
  selector: "app-inventory",
  templateUrl: "inventory.component.html",
  styles: [
    ``
  ]
})
export class InventoryComponent extends BaseComponent implements OnInit {
  hub = environment;

  checkDeviveryThreeTimes: boolean;
  txtFilterGb: any;
  constructor(
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private authService: AuthService,
    private modalService: BsModalService,
    private shipmentStatusService: ShipmentStatusService,
    public permissionService: PermissionService, public router: Router) {
    super(messageService, permissionService, router);

    this.shipmentFilterViewModel.Cols = this.includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.inventory;
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
  }

  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }

  parentPage: string = Constant.pages.warehouse.name;
  currentPage: string = Constant.pages.warehouse.children.inventory.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[] = [];
  cloneSelectedData: Shipment[] = [];
  listData: Shipment[] = [];
  dataSource: Shipment[] = [];
  acceptReturn: ListUpdateStatusViewModel = new ListUpdateStatusViewModel();

  includes: string =
    Constant.classes.includes.shipment.fromHub + "," +
    Constant.classes.includes.shipment.fromHubRouting + "," +
    Constant.classes.includes.shipment.toHub + "," +
    Constant.classes.includes.shipment.toHubRouting + "," +
    Constant.classes.includes.shipment.currentEmp + "," +
    Constant.classes.includes.shipment.shipmentStatus + "," +
    Constant.classes.includes.shipment.pickUser + "," +
    Constant.classes.includes.shipment.fromProvince + "," +
    Constant.classes.includes.shipment.toProvince + "," +
    Constant.classes.includes.shipment.fromDistrict + "," +
    Constant.classes.includes.shipment.toDistrict + "," +
    Constant.classes.includes.shipment.sender + "," +
    Constant.classes.includes.shipment.paymentType + "," +
    Constant.classes.includes.listGoods.createdByHub

  //
  columns: string[] = [
    "shipmentNumber",
    "shipmentStatusName",
    "ladingScheduleCreatedWhen",
    "shipmentStatusId",
    "orderDate",
    "senderName",
    "senderPhone",
    "pickingAddress",
    "fromHubName",
    "fromHubRoutingName",
    "fromProvinceName",
    "fromDistrictName",
    "fromWardName",
    "receiverName",
    "receiverPhone",
    "shippingAddress",
    "toHubName",
    "toHubRoutingName",
    "toProvinceName",
    "toDistrictName",
    "toWardName",
    "cusNote",
    "totalBox",
    "paymentTypeName",
    "calWeight",
    "weight"
  ];

  columnsExport: any[] = [
    { field: "id", header: 'STT' },
    { field: "shipmentNumber", header: 'Mã vận đơn' },
    { field: "reShipmentNumber", header: 'Mã vận đơn tổng' },
    { field: "orderDate", header: 'Ngày tạo' },
    { field: "senderCode", header: 'Mã KH gửi' },
    { field: "senderName", header: 'Tên KH gửi' },
    { field: "senderPhone", header: 'Điện thoại KH gửi' },
    { field: "addressNoteFrom", header: 'Ghi chú đia chỉ gửi' },
    { field: "pickingAddress", header: 'Địa chỉ gửi' },
    { field: "fromWardName", header: 'Phuongf/xã gửi' },
    { field: "fromDistrictName", header: 'Quận/huyện gửi' },
    { field: "fromProvinceName", header: 'TỈnh/thành gửi' },
    { field: "fromHubName", header: 'Trạm lấy hàng' },
    { field: "fromHubRoutingName", header: 'Tuyến lấy hàng' },
    { field: "receiverCode", header: 'Mã KH nhận' },
    { field: "receiverName", header: 'Tên KH nhận' },
    { field: "receiverPhone", header: 'Điện thoại KH nhận' },
    { field: "addressNoteTo", header: 'Ghi chú địa chỉ nhận' },
    { field: "shippingAddress", header: 'Địa chỉ nhận' },
    { field: "toWardName", header: 'Phường/xã nhận' },
    { field: "toProvinceName", header: 'Quận huyện nhận' },
    { field: "toHubName", header: 'Trạm giao hàng' },
    { field: "toHubRoutingName", header: 'Tuyến giao' },
    { field: "cOD", header: 'Thu hộ' },
    { field: "insured", header: 'Bảo hiểm' },
    { field: "weight", header: 'Trọng lượng' },
    { field: "calWeight", header: 'Trọng lượng QĐ' },
    { field: "cusWeight", header: 'Trong lựng KH' },
    { field: "serviceName", header: 'Dịch vụ' },
    { field: "serviceDVGTCodes", header: 'Dochj vụ gia tăng' },
    { field: "totalBox", header: 'Số kiện' },
    { field: "totalItem", header: 'Số sản phẩm' },
    { field: "structureName", header: 'Cơ cấu' },
    { field: "defaultPrice", header: 'Cước chính' },
    { field: "remoteAreasPrice", header: 'PPVX' },
    { field: "priceReturn", header: 'PPXD' },
    { field: "totalDVGT", header: 'Tông cước DVGT' },
    { field: "totalPrice", header: 'Toổng cước KS' },
    { field: "totalPriceSYS", header: 'Toổng cước' },
    { field: "paymentTypeName", header: 'Hình thức thanh toán' },
    { field: "priceCOD", header: 'Phí COD' },
    { field: "paymentCODTypeName", header: 'Hình thức thanh toán phí COD' },
    { field: "content", header: 'Nội dung hàng hóa' },
    { field: "cusNote", header: 'Khách hàng ghi chú' },
    { field: "note", header: 'Ghi chú nội bộ' },
    { field: "isReturn", header: 'Chuyển hoàn' },
    { field: "shipmentStatusName", header: 'Trang thái' },
    { field: "realRecipientName", header: 'Người ký nhận ' },
    { field: "endDeliveryTime", header: 'Thời gian ký nhận' },
    { field: "deliveryNote", header: 'Ghi chú giao hàng' },
    { field: "iSPrioritize", header: 'Vận đơn ưu tiên' },
    { field: "isIncidents", header: 'Vận đơn sự cố' },
  ];

  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  maxRecordExport = 200;

  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  //
  show: string = "all";
  showDeadline: string = "deadline";
  showIsLate: string = "islate";
  showNormal: string = "normal";
  statuses: SelectItem[];
  selectedStatus: number;
  countInventory: number = 0;
  countIsLate: number = 0;
  countDeadline: number = 0;
  countNormal: number = 0;
  countPriority: number = 0;
  countIncident: number = 0;
  //
  ladingScheduleCreatedWhen: SelectItem[];
  selectedLadingScheduleCreatedWhen: Date[];
  //
  dateRageValue: any = new Object();
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  //
  reviewChecked: boolean;
  dsDiPhatChecked: boolean;

  txtSearchText: string = "";

  listPhanLoaiPhat: SelectItem[] = [
    { label: `-- Tất cả --`, value: 0 },
    { label: `Phát nội trạm`, value: 1 },
    { label: `Phát trạm khác`, value: 2 },
  ];
  selectedPhanLoaiPhat: number = 0;
  shipmentNumberAssignUpdates: any[] = []
  ngOnInit() {
    this.initData();
  }

  async initData() {
    var currentUser = await this.authService.getAccountInfoAsync();
    this.shipmentFilterViewModel.CurrentHubId = currentUser.hubId;
    this.shipmentFilterViewModel.groupStatusId = 9;
    this.loadShipment();
  }

  lookupRowStyleClass(rowData: Shipment) {
    let result: any;
    var date = new Date();
    var endDate = moment(date).add(8, 'hours').toDate();
    if (rowData.deliveryDate) {
      var deadline = new Date(rowData.deliveryDate);
      if (deadline > date && deadline <= endDate) {
        result = 'isWarning';
      }
      if (deadline < date) {
        result = 'isDanger';
      }
    }
    if (rowData.isReturn) {
      result = 'isReturn';
    }
    return result;
  }

  loadCountByDeadLineType() {
    const res = this.shipmentService.getCountByDeadLineTypeAsync().then(
      res => {
        if (res.isSuccess == true) {
          const data = res.data as any;
          this.countInventory = data.countInventory;
          this.countNormal = data.countNormal;
          this.countDeadline = data.countDeadline;
          this.countIsLate = data.countIsLate;
          this.countPriority = data.countPrioritize;
          this.countIncident = data.countIncidents
        }
      }
    );
  }

  async loadShipmentPaging() {
    this.totalRecords = 0;
    await this.shipmentService.getListShipment(this.shipmentFilterViewModel).then(x => {
      if (x.isSuccess == true) {
        this.listData = x.data as Shipment[];
        if (x.data[0]) this.totalRecords = x.data[0].totalCount;
      }
    });
  }

  loadShipment() {
    this.loadShipmentPaging();
    this.loadShipmentStatus();
    this.loadCountByDeadLineType();
  }



  open(type: number) {
    this.shipmentFilterViewModel.deadlineTypeId = type;
    this.loadShipmentPaging();
  }

  refresh() {
    this.txtSearchText = "";
    this.reviewChecked = false;
    this.txtFilterGb = null;

    this.selectedPhanLoaiPhat = 0;

    this.shipmentFilterViewModel.Cols = this.includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.inventory;
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;

    this.loadShipment();
  }

  l

  loadShipmentStatus() {
    this.statuses = [];
    this.shipmentStatusService.getAllSelectModelAsync().then(x => {
      this.statuses = x;
    });
  }

  changePhanLoaiPhat() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.CurrentHubDelivery = this.selectedPhanLoaiPhat;
    this.loadShipmentPaging();
  }

  changeShipmentStatus() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ShipmentStatusId = this.selectedStatus;
    this.loadShipmentPaging();
  }

  oncheckDeviveryOverOneTimes() {
    if (this.reviewChecked) {
      this.dsDiPhatChecked = false;
      this.checkDeviveryThreeTimes = false;
      this.shipmentFilterViewModel.numIssueDelivery = 1;
      this.shipmentFilterViewModel.endNumDelivery = null;
    } else {
      this.shipmentFilterViewModel.numIssueDelivery = null;
    }
    this.shipmentFilterViewModel.PageNumber = 1;
    this.loadShipmentPaging();
  }

  oncheckNotDelivery() {
    if (this.dsDiPhatChecked) {
      this.reviewChecked = false;
      this.checkDeviveryThreeTimes = false;
      this.shipmentFilterViewModel.numIssueDelivery = 0;
      this.shipmentFilterViewModel.endNumDelivery = 0;
    } else {
      this.shipmentFilterViewModel.numIssueDelivery = null;
      this.shipmentFilterViewModel.endNumDelivery = null;
    }
    this.shipmentFilterViewModel.PageNumber = 1;
    this.loadShipmentPaging();
  }

  onPageChange(event: any) {
    this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModel.PageSize = event.rows;
    this.loadShipmentPaging();
  }

  search() {
    this.shipmentFilterViewModel.SearchText = this.txtSearchText;
    this.loadShipmentPaging();
  }
  oncheckDeviveryThreeTimes() {
    if (this.checkDeviveryThreeTimes) {
      this.reviewChecked = false;
      this.dsDiPhatChecked = false;
      this.shipmentFilterViewModel.numIssueDelivery = 3;
      this.shipmentFilterViewModel.endNumDelivery = null;
    } else {
      this.shipmentFilterViewModel.numIssueDelivery = null;
    }
    this.shipmentFilterViewModel.PageNumber = 1;
    this.loadShipmentPaging();
  }

  confirmReturn(shipment: Shipment, template: TemplateRef<any>) {
    if (shipment.isReturn) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vận đơn đã duyệt chuyển hoàn!' });
      return;
    }
    this.acceptReturn.shipmentIds = [shipment.id];
    this.acceptReturn.shipmentId = shipment.id;
    this.acceptReturn.empId = this.authService.getUserId();
    this.acceptReturn.shipmentStatusId = 38;
    this.acceptReturn.shipmentNumber = shipment.shipmentNumber;
    this.acceptReturn.cusNote = shipment.cusNote;
    this.modalTitle = "Ghi chú chuyển hoàn";
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  async assignUpdate() {
    if (!this.acceptReturn || !this.acceptReturn.shipmentIds || this.acceptReturn.shipmentIds.length == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Dữ liệu trống!' });
      return;
    }
    if (!this.acceptReturn.note) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Nhập lý do chuyển hoàn!' });
      return;
    }
    let res = await this.shipmentService.assignUpdateDeliveryListAsync(this.acceptReturn);
    this.selectedData = [];
    if (res.isSuccess) {
      this.messageService.add({
        severity: Constant.messageStatus.success, detail: "Duyệt chuyển hoàn thành công"
      });
      let shipment = this.listData.find(f => f.id == this.acceptReturn.shipmentId);
      if (shipment) shipment.isReturn = true;
      this.acceptReturn = new ListUpdateStatusViewModel();
      this.bsModalRef.hide();
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.error, detail: "Duyệt chuyển hoàn thất bại"
      });
    }
  }

  
  async exportCSV(dt: any) {
    if (dt) {
      let fileName = "HANG_TRONG_KHO.xlsx";
      if (this.totalRecords > 0) {
        if (this.totalRecords > this.maxRecordExport) {
          let data: any[] = [];
          let count = Math.ceil(this.totalRecords / this.maxRecordExport);
          let promise = [];

          for (let i = 1; i <= count; i++) {
            let clone = this.shipmentFilterViewModel;
            clone.PageNumber = i;
            clone.PageSize = this.maxRecordExport;

            promise.push(await this.shipmentService.getListShipment(clone));
          }
          Promise.all(promise).then(rs => {
            rs.map(x => {
              data = data.concat(x.data);
            })

            let dataE = data.reverse();
            var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columnsExport, false, false);
            ExportAnglar5CSV.exportExcelBB(dataEX,fileName);
          })
        }
        else {
          let clone = this.shipmentFilterViewModel;
          clone.PageNumber = 1;
          clone.PageSize = this.totalRecords;

          this.shipmentService.getListShipment(clone).then(x => {
            let data = x.data.reverse();
            dt.value = data;
            var dataEX = ExportAnglar5CSV.ExportData(data, this.columnsExport, false, false);
            ExportAnglar5CSV.exportExcelBB(dataEX,fileName);
            //dt.exportCSV();
          });
        }
      }
      else {
        dt.exportCSV();
      }
    }
  }
  confirmReturns(template: TemplateRef<any>) {
    if (this.selectedData.length === 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Dữ liệu trống!' });
      return;
    }
    const shipmentIds = [];
    this.shipmentNumberAssignUpdates = [];
    this.selectedData.map(m => {
      shipmentIds.push(m.id);
      this.shipmentNumberAssignUpdates.push(m.shipmentNumber);
    });
    this.acceptReturn.shipmentIds = shipmentIds;
    // this.acceptReturn.shipmentId = shipment.id;
    this.acceptReturn.empId = this.authService.getUserId();
    this.acceptReturn.shipmentStatusId = 38;
    // this.acceptReturn.shipmentNumber = shipment.shipmentNumber;
    // this.acceptReturn.cusNote = shipment.cusNote;
    this.modalTitle = "Ghi chú chuyển hoàn";
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }
  
  async assignUpdates() {
    if (!this.acceptReturn.note) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Nhập lý do chuyển hoàn!' });
      return;
    }
    let res = await this.shipmentService.assignUpdateDeliveryListAsync(this.acceptReturn);
    this.selectedData = [];
    if (res.isSuccess) {
      this.messageService.add({
        severity: Constant.messageStatus.success, detail: "Duyệt chuyển hoàn thành công"
      });
      let shipment = this.listData.find(f => f.id == this.acceptReturn.shipmentId);
      if (shipment) shipment.isReturn = true;
      this.acceptReturn = new ListUpdateStatusViewModel();
      this.loadShipment();
      this.bsModalRef.hide();
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.error, detail: "Duyệt chuyển hoàn thất bại"
      });
    }
  }
  selectionDataChange(selection) {
    for (let i = selection.length - 1; i >= 0; i--) {
      let data = selection[i];
      if (this.isRowDisabled(data)) {
        selection.splice(i, 1);
      }
    }
    this.selectedData = selection;
    if (this.cloneSelectedData.length != this.selectedData.length) {
      this.cloneSelectedData = this.selectedData;
    } else {
      this.cloneSelectedData = [];
      this.selectedData = [];
      this.loadShipmentPaging();
    }
    //console.log(this.selectedData);
  }
  isRowDisabled(data: any): any  {
    return data.isReturn;
  }
  check(data: any)  {
    this.selectedData = [];
  }
  clone(model: Shipment[]): any[] {
    let dataId = [];
    for (let i=0;i<model.length;i++) {
      dataId.push(model[i].id);
    }
    return dataId;
  }
  sendShopcheck(){
    let listdataShopcheck =[];
    listdataShopcheck=this.clone(this.selectedData);
    this.shipmentService.WarehousingShopCheck(listdataShopcheck).subscribe();
    this.loadShipment();
    console.log(listdataShopcheck);
    

  }
}

import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { DaterangepickerConfig } from "ng2-daterangepicker";

import * as moment from "moment";
import { environment } from '../../../../environments/environment';
import { ShipmentService, AuthService } from '../../../services';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { Shipment, BaseModel } from '../../../models';
import { LazyLoadEvent } from 'primeng/primeng';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { MessageService } from 'primeng/components/common/messageservice';
import { ListUpdateStatusViewModel } from '../../..//view-model';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

@Component({
  selector: 'cancel-return',
  templateUrl: 'cancel-return.component.html',
  styles: []
})
export class CancelReturnComponent extends BaseComponent implements OnInit {
  cancelReturnShipment: Shipment;
  bsModalRef: BsModalRef;
  showItemShipment: any;
  gbModelRef: BsModalRef;
  datasource: Shipment[];
  listData: Shipment[];
  totalRecords: number = 0;
  rowPerPage: number = 20;
  pageNum: number = 1;
  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  eventLog: string;
  txtFilterGb: string;
  parentPage: string = Constant.pages.return.name;
  currentPage: string = Constant.pages.return.children.cancelreturn.name;
  event: LazyLoadEvent;
  modalTitle: string;
  dataModal: ListUpdateStatusViewModel = new ListUpdateStatusViewModel();
  //  
  columns: any[] = [
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

  constructor(
    protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
    private shipmentService: ShipmentService,
    private authservice: AuthService,
    private modalService: BsModalService,
  ) {
    super(messageService, permissionService, router);

    this.shipmentFilterViewModel.OrderDateFrom = moment(moment(new Date()).format(environment.formatDate) + " 00:00:00").toDate();
    this.shipmentFilterViewModel.OrderDateTo = moment(moment(new Date()).format(environment.formatDate) + " 23:59:59").toDate();
  }

  ngOnInit() {
    this.initData();
  }

  async initData() {
    this.loadShipment();
  }

  selectedDate(value: any, dateInput: any) {

    dateInput.start = value.start;
    dateInput.end = value.end;

    this.shipmentFilterViewModel.OrderDateFrom = value.start.toISOString();
    this.shipmentFilterViewModel.OrderDateTo = value.end.toISOString();
    this.loadShipmentPaging();
  }

  calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  // dateRangePicker
  mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  async loadShipment() {

    let us = await this.authservice.getAccountInfoAsync();
    var currentHubId = us.hubId;

    let includes: string =
    Constant.classes.includes.shipment.shipmentStatus + "," +
    Constant.classes.includes.shipment.toHubRouting;
    this.shipmentFilterViewModel.Cols = includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.cancelreturn;
    this.shipmentFilterViewModel.groupStatusId = 10;
    this.shipmentFilterViewModel.CurrentHubId = currentHubId;
    this.shipmentFilterViewModel.isBox = null;
    this.shipmentFilterViewModel.PageNumber = this.pageNum; 
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;

    await this.loadShipmentPaging();
  }

  async loadShipmentPaging() {
    const res = await this.shipmentService.getListShipment(this.shipmentFilterViewModel);
    this.listData = res.data;
    this.totalRecords = this.listData.length > 0 ? this.listData[0].totalCount : 0;
    // console.log(this.shipmentFilterViewModel);
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.datasource) {
        var filterRows = this.datasource;

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows;
      }
    }, 250);
  }

  onPageChange(event: any) {
    this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModel.PageSize = event.rows;
    this.loadShipmentPaging();
  }

  search(input) {
    this.shipmentFilterViewModel.SearchText = input.value.trim();
    this.loadShipmentPaging();
  }

  openModelCancelReturn(template: TemplateRef<any>, data: Shipment) {
    this.modalTitle = "Hủy chuyển hoàn";
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
    this.cancelReturnShipment = data;
  }

  async onCancelReturn(shipment: Shipment) {
    this.messageService.clear();
    if (shipment) {
      const model = new BaseModel(shipment.id);
      const data = await this.shipmentService.cancelReturnAsync(model);
      if (data) {
        this.bsModalRef.hide();
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Hủy chuyển hoàn thành công!"
        });
        this.refresh();
      }
    }
  }

  
  //#region Xử lý
  openModal(template: TemplateRef<any>, rowData: Shipment[], statusId: number) {
    this.dataModal = new ListUpdateStatusViewModel();
    this.dataModal.empId = this.authservice.getUserId();
    this.dataModal.shipmentStatusId = statusId;
    this.dataModal.shipmentIds = rowData.map(x => x.id);
    this.modalTitle = statusId == 38 ? "Duyệt chuyển hoàn" : "Tiếp tục giao hàng";
    this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-lg" });
  }

  async assignUpdate() {
    let res = await this.shipmentService.assignUpdateDeliveryListAsync(this.dataModal);
    if (res.isSuccess) {
      this.messageService.add({
        severity: Constant.messageStatus.success, detail: this.modalTitle + " thành công"
      });
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.error, detail: this.modalTitle + " thất bại"
      });
    }
    this.loadShipmentPaging();
    this.bsModalRef.hide();
  }

  
  async changeFilter() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PageSize = 20;
    this.loadShipmentPaging();
  }

  refresh() {
    this.txtFilterGb = null;
    this.loadShipmentPaging();
  }
}

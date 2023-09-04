import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { Shipment } from '../../../models';
import { ShipmentService, AuthService } from '../../../services';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService } from "primeng/components/common/messageservice";
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import * as moment from "moment";
import { environment } from '../../../../environments/environment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { ListUpdateStatusViewModel } from '../../../view-model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';

@Component({
  selector: 'app-wait-return',
  templateUrl: './wait-return.component.html',
  styles: []
})
export class WaitReturnComponent extends BaseComponent implements OnInit {

  constructor(
    protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
    private shipmentService: ShipmentService,
    private authservice: AuthService,
    private modalService: BsModalService
  ) {
    super(messageService, permissionService, router);
  }

  public dateRange = {
    start: moment(),
    end: moment()
  }

  parentPage: string = Constant.pages.return.name;
  currentPage: string = Constant.pages.return.children.waitReturn.name;

  // Data
  listData: Shipment[] = [];
  totalCount: number = 0;
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
  //

  // Filter
  filterModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  selectedData: Shipment[] = [];
  currentHubId: number = null;
  //

  //

  // Modal
  modalTitle: string;
  bsModalRef: BsModalRef;

  statusId: number;
  dataModal: ListUpdateStatusViewModel = new ListUpdateStatusViewModel();
  //

  async ngOnInit() {
    //
    let fromDate = null;
    let toDate = null;
    if (this.dateRange) {
        fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
        toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    }
    this.filterModel.OrderDateFrom = fromDate;
    this.filterModel.OrderDateTo = toDate;

    await this.getHubId();
    this.loadData();
  }

  refresh() {
    this.selectedData = [];
    this.filterModel = new ShipmentFilterViewModel();
    let fromDate = null;
    let toDate = null;
    if (this.dateRange) {
        fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
        toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    }
    this.filterModel.OrderDateFrom = fromDate;
    this.filterModel.OrderDateTo = toDate;
    this.loadData();
  }

  //#region Data
  async getHubId() {
    let us = await this.authservice.getAccountInfoAsync();
    this.currentHubId = us.hubId;
  }

  async loadData() {
    this.filterModel.ShipmentStatusId = 14;
    this.filterModel.CurrentHubId = this.currentHubId;
    this.filterModel.isBox = null;

    const res = await this.shipmentService.getListShipment(this.filterModel);
    this.listData = res.data;
    this.totalCount = this.listData.length > 0 ? this.listData[0].totalCount : 0;
  }

  async changeFilter() {
    this.filterModel.PageNumber = 1;
    this.filterModel.PageSize = 20;
    this.loadData();
  }

  onPageChange(event: any) {
    this.filterModel.PageNumber = event.first / event.rows + 1;
    this.filterModel.PageSize = event.rows;
    this.loadData();
  }
  //#endregion

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
    this.selectedData = [];
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
    this.loadData();
    this.bsModalRef.hide();
  }
  //#endregion


  public selectedDate() {
    this.filterModel.OrderDateFrom = SearchDate.formatToISODate(moment(this.filterModel.OrderDateFrom).toDate());
    this.filterModel.OrderDateTo = SearchDate.formatToISODate(moment(this.filterModel.OrderDateTo).toDate());
    this.changeFilter();
  }
}

import { Component, OnInit, TemplateRef } from "@angular/core";

import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  UserService,
  ShipmentService,
  CustomerService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BaseComponent } from "../../../shared/components/baseComponent";
import {
  ListCustomerPayment,
  Hub,
  Customer
} from "../../../models/index";
import {
  ListCustomerPaymentViewModel
} from "../../../view-model/index";
import { ListCustomerPaymentTypeHelper } from "../../../infrastructure/listCustomerPaymentTypeHelper";
import { ListCustomerPaymentService } from "../../../services/listcustomerpayment.service";
import { Shipment } from "../../../models/shipment.model";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { ConvertNumberToText } from "../../../infrastructure/convertNumberToText";
import { environment } from "../../../../environments/environment";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { SelectModel } from "../../../models/select.model";
import { ShipmentTracking } from "../../../models/abstract/shipmentTracking.interface";

declare var jQuery: any;

function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

@Component({
  selector: "app-customer-payment-totalprice",
  templateUrl: "customer-payment-totalprice.component.html",
  styles: []
})
export class CustomerPaymentTotalPriceComponent extends BaseComponent
  implements OnInit {

  txtNoteAdjustPrice: string;
  cloneListCustomerPayment: ListCustomerPayment;
  grandTotalAfterAdjustment: number;
  adjustPrice: number;
  selectedUpDown: boolean = true;
  checkSubmitUpdateGrandTotal: boolean;
  idPrint: string;
  itemCustomerPayment: any;
  txtShipmentNumber: string;
  filterRows: ShipmentTracking[];
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  firstLeft: number = 0;
  firstRight: number = 0;
  txtFilterGb: any;
  txtCreatedDate: any;
  txtFilterGbRight: any;
  totalAddShipments: number = 0;
  hideConfirm: boolean = false;
  percentShipments: number = 0;
  //
  constructor(
    protected messageService: MessageService,
    private listCustomerPaymentService: ListCustomerPaymentService,
    private customerService: CustomerService,
    private userService: UserService,
    private shipmentService: ShipmentService,
    private generalInfoService: GeneralInfoService,
    private convertNumberToText: ConvertNumberToText,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    public permissionService: PermissionService,
    private bsModalService: BsModalService,
    public router: Router, ) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.customerPayment.name;
  currentPage: string = Constant.pages.customerPayment.children.customerPaymentTotalPrice.name;
  modalTitle: string;
  bsModalRef: BsModalRef;

  bsModalRef_LCP: BsModalRef;
  listShipment: ShipmentTracking[];
  dataModalVanDonTheoBangKe: ListCustomerPayment;
  columnsFilterdtVanDonTheoBangKe: string[] = [
    "shipmentNumber",
    "totalPrice",
    "cod",
    "tplNumber",
    "tpl?.code",
    "tplNumber",
    "createdWhen",
    "service.name",
    "weight",
    "totalBox"
  ];
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'Shipment.xlsx';
  generalInfo: GeneralInfoModel;
  customerInfo: Customer

  displayDialog: boolean;
  selectedData: ShipmentTracking[];
  selectedDataRight: ShipmentTracking[];
  listDataRight: ShipmentTracking[];
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "shipmentNumber",
    "orderDate",
    "receiverName",
    "addressNoteTo",
    "shippingAddress",
    "receiverPhone",
    "weight",
    "totalPrice",
  ];
  columnsFilterRight: string[] = [
    "shipmentNumber",
    "orderDate",
    "receiverName",
    "addressNoteTo",
    "shippingAddress",
    "receiverPhone",
    "weight",
    "totalPrice",
  ]

  columnsExport = [
    { field: 'code', header: 'Mã' },
    { field: 'customer.code', header: 'Mã khách hàng' },
    { field: 'customer.name', header: 'Tên khách hàng' },
    { field: 'grandTotal', header: 'Tổng tiền' },
    { field: 'statusName', header: 'Tình trạng' },
    { field: 'userCreated.fullName', header: 'Người tạo' },
    { field: 'createdWhen', header: 'Ngày tạo' },
    { field: 'userModified.fullName', header: 'userModified.fullName' },
    { field: 'modifiedWhen', header: 'modifiedWhen' },
  ]

  datasource: ShipmentTracking[];
  //
  hubs: SelectItem[];
  selectedHub: Hub;
  //============================
  //BEGIN Danh sách bảng kê thanh toán cước phí
  //============================
  rowPerPageLCP: 20;
  totalRecordsLCP: number;
  columnsLCP: string[] = [
    "code",
    "createdWhen",
    "id",
    "customer.code",
    "customer.name",
    "grandTotal",
    "statusName",
    "totalCOD",
    "grandTotal",
    "userCreated.fullName",
    "createdWhen",
    "userModified.fullName",
    "modifiedWhen"
  ];
  datasourceLCP: ListCustomerPayment[];
  listDataLCP: ListCustomerPayment[];
  eventLCP: LazyLoadEvent;
  statuesLCP: SelectItem[];
  customersLRP: SelectItem[];
  selectedCustomerLCP: Customer;
  selectedStatusLCP: Customer;
  //
  customerChange: any;
  filteredCustomers: any[] = [];
  customers: SelectModel[];
  selectedCustomer: Customer;
  selectedIscussess: boolean = false;
  listIssuccess: SelectItem[] = [
    { value: false, label: 'Ngày tạo' },
    { value: true, label: 'Ngày giao TC' }
  ];
  listCategoryPayment: SelectItem[] = [
    { value: 1, label: 'Thanh toán cước phí' },
    { value: 2, label: 'Trả thu hộ (COD)' },
    { value: 3, label: 'TT Cước phí & trả COD' }
  ]
  selectedDateFrom: any;
  selectedDateTo: any;
  listPaymentCustomer: SelectModel[] = [];
  data: ListCustomerPaymentViewModel = new ListCustomerPaymentViewModel();
  searchTextLeft: string = '';
  searchTextRight: string = '';
  sumText: string = 'Tổng';
  sumLeft: number = 0;
  sumRight: number = 0;
  sumDetail: number = 0;
  //
  pageSizeLeft: number = 10;
  pageNumberLeft: number = 1;
  totalRecordLeft: number = 0;
  //  
  pageSizeRight: number = 10;
  pageNumberRight: number = 1;
  totalRecordRight: number = 0;
  //
  searchTextDetail: string = '';
  firstDetail: number = 0;
  pageSizeDetail: number = 10;
  pageNumberDetail: number = 1;
  totalRecordDetail: number = 0;
  //
  public dateRangeLCP = {
    start: moment(),
    end: moment()
  };
  //============================
  //END Danh sách bảng kê thanh toán cước phí
  //============================
  ngOnInit() {
    this.initData();
  }

  initData() {
    this.selectedData = null;
    this.listDataRight = [];
    this.selectedDateFrom = SearchDate.formatToISODate(new Date());
    this.selectedDateTo = SearchDate.formatToISODate(new Date());
    this.loadListReceitMoney();
  }

  onPageChangeLeft(event: LazyLoadEvent) {
    this.pageNumberLeft = event.first / event.rows + 1;
    this.pageSizeLeft = event.rows;
    this.loadShipmentLeft();
  }

  loadShipmentLeft() {
    this.selectedData = [];
    if (!this.data.customerId) {
      this.datasource = [];
      this.totalRecordLeft = 0;
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn khách hàng' });
      return false;
    }
    if (!this.data.listCustomerPaymentTypeId) {
      this.datasource = [];
      this.totalRecordLeft = 0;
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn loại thanh toán' });
      return false;
    }
    this.listCustomerPaymentService
      .getListShipmentToPaymentAsync(
        this.data.listCustomerPaymentTypeId,
        this.data.customerId,
        this.selectedIscussess,
        SearchDate.formatToISODate(this.selectedDateFrom),
        SearchDate.formatToISODate(this.selectedDateTo),
        this.searchTextLeft,
        this.pageSizeLeft,
        this.pageNumberLeft
      )
      .then(x => {
        this.datasource = x;
        if (this.datasource.length > 0 && this.datasource[0].totalCount) {
          this.totalRecordLeft = this.datasource[0].totalCount;
          if (this.data.listCustomerPaymentTypeId == ListCustomerPaymentTypeHelper.PAYMENT_TOTALPRICE) {
            this.sumLeft = this.datasource[0].sumPayTotalPrice;
          } else {
            this.sumLeft = this.datasource[0].sumPayCOD - (this.datasource[0].sumPayPriceCOD + this.datasource[0].sumPayTotalPrice);
          }
        }
      });
  }

  //filter Customers
  filterCustomers(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            let data = (x.data as Customer[]);
            data.map(m => {
              this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
              this.filteredCustomers.push(`${m.code} ${m.name}`);
            });
          }
        }
      );
    }
  }
  //  
  changeSender() {
    let cloneSelectedCustomer = JSON.parse(JSON.stringify(this.customerChange));
    if (cloneSelectedCustomer) {
      let findCus = this.customers.find(f => f.label == cloneSelectedCustomer);
      if (findCus) {
        this.data.customerId = findCus.value;
      }
    } else {
      this.data.customerId = 0;
    }
    this.loadListPaymentCustomer();
  }
  //
  async loadListPaymentCustomer() {
    this.listPaymentCustomer = [];
    this.data.id = null;
    if (!this.data.customerId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn khách hàng!' });
      return false;
    }
    this.listCustomerPaymentService.getListByTypeNewAsync(this.data.customerId).then(
      x => {
        if (x) {
          this.listPaymentCustomer = x;
        }
        if (this.listCategoryPayment && this.listPaymentCustomer.length >= 1) {
          this.data = this.listPaymentCustomer[0].data;
        } else {
          this.listPaymentCustomer.push({ value: 0, label: 'Tạo mã thanh toán mới' });
        }
        this.loadSumText();
        this.loadShipmentRight();
      }
    )
  }
  loadSumText() {
    if (this.data.listCustomerPaymentTypeId == ListCustomerPaymentTypeHelper.PAYMENT_TOTALPRICE) {
      this.sumText = 'Tổng TT'
    } else {
      'Tổng PT'
    }
  }
  eventSelectedPaymentCustomer(template: TemplateRef<any>) {
    if (!this.data.id) {
      let cloneCustomerId = JSON.parse(JSON.stringify(this.data.customerId));
      let cloneListCustomerPaymentTypeId = JSON.parse(JSON.stringify(this.data.listCustomerPaymentTypeId));
      this.data = new ListCustomerPaymentViewModel();
      this.data.customerId = cloneCustomerId;
      this.data.listCustomerPaymentTypeId = cloneListCustomerPaymentTypeId;
      this.bsModalRef = this.bsModalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
    } else {
      let find = this.listPaymentCustomer.find(f => f.value === this.data.id);
      if (find) {
        this.data = find.data;
        this.loadShipmentRight();
        this.loadSumText();
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy thông tin bảng kê!' });
        return false;
      }
    }
  }
  async createNewPaymentCustomer() {
    this.messageService.clear();
    if (!this.data.customerId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn khách hàng!' });
      return false;
    }
    if (!this.data.listCustomerPaymentTypeId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn loại thanh toán!' });
      return false;
    }
    this.listCustomerPaymentService.createNew(this.data).subscribe(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Tạo mã bảng kê thành công!' });
        this.loadListPaymentCustomer();
        this.searchTextLeft = '';
        this.bsModalRef.hide();
      }
    )
  }
  noneCreateNewPaymentCustomer() {
    this.data.id = null;
    this.bsModalRef.hide();
  }
  //
  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }

  allSelect(event) {
    if (event.checked) {
      if (this.filterRows) {
        this.selectedData = this.filterRows;
      } else {
        this.selectedData = this.datasource;
      }
    }
  }

  unInstall(shipment: ShipmentTracking) {
    this.messageService.clear();
    if (this.data && this.data.id) {
      let model: any = new Object();
      model.shipmentId = shipment.id;
      model.listCustomerPaymentId = this.data.id;
      this.listCustomerPaymentService.UnInstallAsync(model).then(
        x => {
          if (!this.isValidResponse(x)) return;
          this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Gỡ thành công' });
          this.loadShipmentLeft();
          this.loadShipmentRight();
        }
      )
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy thông tin bảng kê' });
    }
  }

  save() {
    if (!this.data || !this.data.id) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Bảng kê trống, vui lòng kiểm tra lại"
      });
      return;
    }
    if (!this.data.customerId) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn khách hàng"
      });
      return;
    }
    this.listCustomerPaymentService.update(this.data).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Lưu thông tin bảng kê thành công"
      });
    });
  }

  removeDataLeft(listRemove: ShipmentTracking[]) {
    let listClone = Array.from(this.datasource);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
      this.datasource.splice(this.datasource.indexOf(obj), 1);
    }
    this.datasource = listClone;
    this.selectedData = [];
  }
  onPageChangeRight(event: LazyLoadEvent) {
    this.pageNumberRight = event.first / event.rows + 1;
    this.pageSizeLeft = event.rows;
    this.loadShipmentRight();
  }
  onPageChangeDetail(event: LazyLoadEvent) {
    this.pageNumberDetail = event.first / event.rows + 1;
    this.pageSizeDetail = event.rows;
    this.SearchDetail();
  }
  loadShipmentRight() {
    this.messageService.clear();
    if (!this.data.id) {
      this.listDataRight = [];
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn bảng kê trước!' });
      return false;
    }
    this.listCustomerPaymentService.getShipmentListPaymentCustomerAsync(this.data.id, this.searchTextRight, this.pageSizeRight, this.pageNumberRight)
      .then(
        x => {
          this.listDataRight = x;
          if (this.listDataRight.length > 0) {
            let firstRow = this.listDataRight[0];
            this.totalRecordRight = firstRow.totalCount ? firstRow.totalCount : 0;
            if (this.data.listCustomerPaymentTypeId == ListCustomerPaymentTypeHelper.PAYMENT_TOTALPRICE) {
              this.sumRight = firstRow.sumPayTotalPrice;
            } else {
              this.sumRight = firstRow.sumPayCOD - (firstRow.sumPayPriceCOD + firstRow.sumPayTotalPrice);
            }
          } else {
            this.sumRight = 0;
            this.totalRecordRight = 0;
          }
        }
      )
  }
  removeDataRight(listRemove: ShipmentTracking[]) {
    let listClone = Array.from(this.listDataRight);
    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
    }

    this.listDataRight = listClone;
    this.selectedDataRight = [];
    this.selectedData = [];
  }
  //======== BEGIN METHOD ListReceiveMoney =======
  loadListReceitMoney() {
    let includes: any = [];
    let includesListCustomerPayment =
      Constant.classes.includes.listCustomerPayment;
    for (var prop in Constant.classes.includes.listCustomerPayment) {
      includes.push(includesListCustomerPayment[prop]);
    }
    var fromDate = null;
    var toDate = null;
    if (this.dateRangeLCP) {
      fromDate = this.dateRangeLCP.start.add(0, "d").toJSON();
      toDate = this.dateRangeLCP.end.toJSON();
    }
    this.listCustomerPaymentService
      .getListByType(
        ListCustomerPaymentTypeHelper.PAYMENT_ALL,
        fromDate,
        toDate,
        includes
      )
      .subscribe(x => {
        this.datasourceLCP = x.data as ListCustomerPayment[];
        this.totalRecordsLCP = this.datasourceLCP.length;
        this.listDataLCP = this.datasourceLCP.slice(0, this.rowPerPageLCP);
        this.loadFilterLCP();
      });
  }

  loadFilterLCP() {
    let uniqueStatus = [];
    this.statuesLCP = [];
    this.datasourceLCP.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuesLCP.push({ label: "Chọn tất cả", value: null });
      }
      //
    });
    //
  }

  async findListGooods(shipmentNumber: string, type: number): Promise<ListCustomerPayment[]> {
    this.messageService.clear();
    const data = await this.listCustomerPaymentService.getListCustomerPaymentByShipmentNumberAndTypeAsync(shipmentNumber, type);
    if (data) {
      return data;
    } else {
      shipmentNumber = null;
      this.txtShipmentNumber = null;
      return [];
    }
  }

  async addShipmentToPayment() {
    if (!this.data) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng tạo mã bảng kê thanh toán trước.' });
      return;
    }
    if (this.selectedData.length && this.selectedData.length > 0) {
      let model: ListCustomerPaymentViewModel = new ListCustomerPaymentViewModel();
      model.id = this.data.id;
      model.listCustomerPaymentTypeId = this.data.listCustomerPaymentTypeId;
      this.selectedData.map(m => { model.shipmentIds.push(m.id) });
      this.listCustomerPaymentService.addShipmentToPayment(model).then(
        x => {
          if (this.isValidResponse(x)) this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Thêm bảng kê thanh toán thành công.' });
          else this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Thêm bảng kê thanh toán thành công.' });
          this.loadShipmentLeft();
          this.loadShipmentRight();
        }
      )
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn vận đơn' });
      return;
    }
  }
  confirmAddShipmentToPayments(template: TemplateRef<any>) {
    this.hideConfirm = false;
    this.percentShipments = 0;
    if (this.datasource && this.datasource.length && this.datasource.length > 0) {
      this.totalAddShipments = this.datasource[0].totalCount;
      this.bsModalRef = this.bsModalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Danh sách vận đơn trống.' });
      return;
    }
  }
  async addShipmentToPayments() {
    this.hideConfirm = true;
    if (!this.data) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng tạo mã bảng kê thanh toán trước.' });
      return;
    }
    if (this.datasource && this.datasource.length && this.datasource.length > 0) {
      let limit: number = 200;//200
      let countFor: number = 1;
      if (this.datasource[0].totalCount > limit) countFor = Math.ceil(this.datasource[0].totalCount / limit);
      let totalSuccess = 0;
      let promise = [];
      for (let i = 1; i <= countFor; i++) {
        await this.listCustomerPaymentService
          .getListShipmentToPaymentAsync(
            this.data.listCustomerPaymentTypeId,
            this.data.customerId,
            this.selectedIscussess,
            SearchDate.formatToISODate(this.selectedDateFrom),
            SearchDate.formatToISODate(this.selectedDateTo),
            this.searchTextLeft,
            limit,
            1
          )
          .then(async dataShipments => {
            if (dataShipments && dataShipments.length > 0) {
              let model: ListCustomerPaymentViewModel = new ListCustomerPaymentViewModel();
              model.id = this.data.id;
              dataShipments.map(m => { model.shipmentIds.push(m.id) });
              await this.listCustomerPaymentService.addShipmentToPayment(model).then(
                async x => {
                  if (x.isSuccess == true) {
                    totalSuccess += dataShipments.length;
                    promise.push(dataShipments);
                  }
                }
              )
            }
          });
      }
      Promise.all(promise).then(rs => {
        rs.map(x => {
          this.percentShipments = Math.ceil(totalSuccess * 100 / this.totalAddShipments);
        })
      });
      //
      this.messageService.add({ severity: Constant.messageStatus.success, detail: `Thêm vào bảng kê thành công ${totalSuccess} vận đơn.` });
      this.loadShipmentLeft();
      this.loadShipmentRight();
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Danh sách vận đơn trống.' });
      return;
    }
  }

  refreshLCP() {
    this.loadListReceitMoney();

    //refresh
    this.selectedCustomerLCP = null;
    this.txtFilterGb = null;
    this.firstLeft = 0;
    this.firstRight = 0;
    this.txtNoteAdjustPrice = null;
    this.adjustPrice = null;
    this.grandTotalAfterAdjustment = null;
  }
  lockLCP(data: ListCustomerPayment) {
    if (!data) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Bảng kê không tìm thấy, vui lòng chọn bảng kê."
      });
      return;
    }
    let model = new ListCustomerPaymentViewModel();
    model.id = data.id;
    this.listCustomerPaymentService.lock(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLCP();
      this.resetData();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Khóa bảng kê thu tiền thành công"
      });
    });
  }
  resetData() {
    this.data = new ListCustomerPaymentViewModel();
    this.datasource = [];
    this.datasourceLCP = [];
    this.listDataRight = [];
    this.customerChange = '';
    this.filteredCustomers = [];
    this.totalRecordLeft = 0;
    this.totalRecordRight = 0;
    this.listCategoryPayment = [];
    this.sumLeft = 0;
    this.sumRight = 0;
  }
  unlockLCP(data: ListCustomerPayment) {
    let model = new ListCustomerPaymentViewModel();
    model.id = data.id;
    this.listCustomerPaymentService.unlock(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLCP();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Mở khóa bảng kê thu tiền thành công"
      });
    });
  }
  payLCP(data: ListCustomerPayment) {
    let model = new ListCustomerPaymentViewModel();
    model.id = data.id;
    this.listCustomerPaymentService.pay(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLCP();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Xác nhận bảng kê thu tiền thành công"
      });
    });
  }
  cancelLCP(data: ListCustomerPayment) {
    let model = new ListCustomerPaymentViewModel();
    model.id = data.id;
    this.listCustomerPaymentService.cancel(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLCP();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Hủy bảng kê thu tiền thành công"
      });
    });
  }
  public eventLog = "";

  public selectedDateLCP(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
    this.loadListReceitMoney();
  }

  private applyDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }


  // dateRangePicker
  public eventLogLS = "";

  public mainInput = {
    start: moment(),
    end: moment()
  };

  async viewLCP(data, template: TemplateRef<any>) {
    this.dataModalVanDonTheoBangKe = data;
    await this.getListShipmentPriceByPaymentIdAsync(data.id);
    this.bsModalRef_LCP = this.bsModalService.show(template, {
      class: "inmodal animated bounceInRight modal-lg modal-full"
    });
  }

  async SearchDetail() {
    this.firstDetail = 0;
    this.pageNumberDetail = 1;
    await this.getListShipmentPriceByPaymentIdAsync(this.dataModalVanDonTheoBangKe.id);
  }

  async openAdjustPriceLCP(template: TemplateRef<any>, data: ListCustomerPayment) {
    this.bsModalRef = this.bsModalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
    const listCustomerPayment = await this.getCustomerPaymentById(data);
    if (listCustomerPayment) {
      this.cloneListCustomerPayment = listCustomerPayment;
      if (!this.cloneListCustomerPayment.adjustPrice) this.cloneListCustomerPayment.adjustPrice = 0;
      if (this.cloneListCustomerPayment.adjustPrice < 0) this.adjustPrice = -1 * this.cloneListCustomerPayment.adjustPrice;
      else this.adjustPrice = this.cloneListCustomerPayment.adjustPrice;
      this.grandTotalAfterAdjustment = this.cloneListCustomerPayment.adjustPrice + this.cloneListCustomerPayment.grandTotal;
      if (this.cloneListCustomerPayment.adjustPrice < 0) {
        this.selectedUpDown = false;
      } else {
        this.selectedUpDown = true;
      }
    }
  }

  async updateGrandTotal() {
    if (!this.adjustPrice && this.adjustPrice != 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập điều chỉnh tổng tiền"
      });
      return;
    }
    if (!this.txtNoteAdjustPrice || this.txtNoteAdjustPrice.trim() === "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập ghi chú"
      });
      return;
    }
    if (this.grandTotalAfterAdjustment <= 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Tổng tiền phải lớn hơn 0"
      });
      return;
    }

    this.checkSubmitUpdateGrandTotal = true;
    let model: ListCustomerPaymentViewModel = new ListCustomerPaymentViewModel();
    model.id = this.cloneListCustomerPayment.id;
    model.note = this.txtNoteAdjustPrice.trim();
    model.grandTotal = this.cloneListCustomerPayment.grandTotal;
    if (this.selectedUpDown) {
      model.adjustPrice = this.adjustPrice;
    } else {
      model.adjustPrice = -1 * this.adjustPrice;
    }
    // console.log(JSON.stringify(model));
    const data = await this.listCustomerPaymentService.adjustPriceCustomerPaymentAsync(model);
    this.checkSubmitUpdateGrandTotal = false;
    if (data) {
      this.txtNoteAdjustPrice = null;
      this.adjustPrice = null;
      this.grandTotalAfterAdjustment = null;
      this.bsModalRef.hide();
    }
  }

  changeInputSwitch() {
    this.changeAdjustPrice();
  }

  changeAdjustPrice() {
    if (this.selectedUpDown) {
      this.grandTotalAfterAdjustment = this.cloneListCustomerPayment.grandTotal + this.adjustPrice;
    } else {
      this.grandTotalAfterAdjustment = this.cloneListCustomerPayment.grandTotal - this.adjustPrice;
    }
  }

  async printLCP(data: ListCustomerPayment) {
    this.itemCustomerPayment = await this.onGetShipmentsByCustomerPayment(data);
    if (this.itemCustomerPayment) {
      // console.log(this.itemCustomerPayment);
      setTimeout(() => {
        this.idPrint = ListGoodsTypeHelper.printCustomerPaymentTotalPrice;
        this.printFrormServiceInstance.sendCustomEvent(this.itemCustomerPayment);
      }, 0);
    }
  }

  async onGetShipmentsByCustomerPayment(data: ListCustomerPayment): Promise<Shipment[]> {
    const listCustomerPayment = await this.getCustomerPaymentById(data);
    const include: string[] = [
      Constant.classes.includes.shipment.toProvince,
      Constant.classes.includes.shipment.service,
    ];
    const shipments = await this.shipmentService.getListShipmentPriceByPaymentIdAsync(data.id.toString(), include);
    if (shipments) {
      // console.log(shipments);
      this.itemCustomerPayment = [...shipments];
      await this.getGeneralInfoAsync();
      this.itemCustomerPayment.logoUrl = this.generalInfo.logoUrl;
      this.itemCustomerPayment.companyName = this.generalInfo.companyName;
      this.itemCustomerPayment.hotLine = this.generalInfo.hotLine;
      this.itemCustomerPayment.centerHubAddress = this.generalInfo.addressMain;
      this.itemCustomerPayment.dateCreate = SearchDate.formatToISODate(new Date());

      if (listCustomerPayment) {
        console.log(listCustomerPayment);
        if (listCustomerPayment.customer) {
          this.itemCustomerPayment.customer = listCustomerPayment.customer;
          this.itemCustomerPayment.grandTotal = listCustomerPayment.grandTotal;
        }
      }
      const currentHub = await this.userService.getCurrentHub();
      if (currentHub) {
        this.itemCustomerPayment.paymentInfo = currentHub;
      }

      let sumDefaultPrice = 0;
      let sumFuelPrice = 0;
      let sumCOD = 0;
      let sumInsured = 0;
      let sumRemoteAreasPrice = 0;
      let sumTotalDVGT = 0;
      let sumOtherPrice = 0;
      let sumVatPrice = 0;
      let grandTotalsumPrice = 0;
      await Promise.all(this.itemCustomerPayment.map(async (item, index) => {
        let stt = index + 1;
        this.itemCustomerPayment[index].stt = stt;
        //
        this.itemCustomerPayment[index].defaultPrice = this.itemCustomerPayment[index].defaultPrice ? this.itemCustomerPayment[index].defaultPrice : 0;
        sumDefaultPrice += this.itemCustomerPayment[index].defaultPrice;
        this.itemCustomerPayment.sumDefaultPrice = sumDefaultPrice;
        //
        this.itemCustomerPayment[index].fuelPrice = this.itemCustomerPayment[index].fuelPrice ? this.itemCustomerPayment[index].fuelPrice : 0;
        sumFuelPrice += this.itemCustomerPayment[index].fuelPrice;
        this.itemCustomerPayment.sumFuelPrice = sumFuelPrice;
        //
        this.itemCustomerPayment[index].cod = this.itemCustomerPayment[index].cod ? this.itemCustomerPayment[index].cod : 0;
        sumCOD += this.itemCustomerPayment[index].cod;
        this.itemCustomerPayment.sumCOD = sumCOD;
        //
        this.itemCustomerPayment[index].insured = this.itemCustomerPayment[index].insured ? this.itemCustomerPayment[index].insured : 0;
        sumInsured += this.itemCustomerPayment[index].insured;
        this.itemCustomerPayment.sumInsured = sumInsured;
        //
        this.itemCustomerPayment[index].remoteAreasPrice = this.itemCustomerPayment[index].remoteAreasPrice ? this.itemCustomerPayment[index].remoteAreasPrice : 0;
        sumRemoteAreasPrice += this.itemCustomerPayment[index].remoteAreasPrice;
        this.itemCustomerPayment.sumRemoteAreasPrice = sumRemoteAreasPrice;
        //
        this.itemCustomerPayment[index].totalDVGT = this.itemCustomerPayment[index].totalDVGT ? this.itemCustomerPayment[index].totalDVGT : 0;
        sumTotalDVGT += this.itemCustomerPayment[index].totalDVGT;
        this.itemCustomerPayment.sumTotalDVGT = sumTotalDVGT;
        //
        this.itemCustomerPayment[index].otherPrice = this.itemCustomerPayment[index].otherPrice ? this.itemCustomerPayment[index].otherPrice : 0;
        sumOtherPrice += this.itemCustomerPayment[index].otherPrice;
        this.itemCustomerPayment.sumOtherPrice = sumOtherPrice;
        //
        this.itemCustomerPayment[index].vatPrice = this.itemCustomerPayment[index].vatPrice ? this.itemCustomerPayment[index].vatPrice : 0;
        sumVatPrice += this.itemCustomerPayment[index].vatPrice;
        this.itemCustomerPayment.sumVatPrice = sumVatPrice;
        //
        // grandTotalsumPrice = sumDefaultPrice + sumCOD + sumFuelPrice + sumInsured + sumOtherPrice + sumRemoteAreasPrice + sumTotalDVGT + sumVatPrice;
        // this.itemCustomerPayment.grandTotalsumPrice = grandTotalsumPrice;
      }));
    }
    return this.itemCustomerPayment;
  }

  async getCustomerPaymentById(data: ListCustomerPayment): Promise<ListCustomerPayment> {
    const includeLCP: string[] = [
      Constant.classes.includes.listCustomerPayment.customer,
      Constant.classes.includes.listCustomerPayment.hubCreated,
      Constant.classes.includes.listCustomerPayment.listCustomerPaymentType,
      Constant.classes.includes.listCustomerPayment.userCreated,
      Constant.classes.includes.listCustomerPayment.userModified
    ];
    const listCustomerPayment = await this.listCustomerPaymentService.getAsync(data.id, includeLCP);
    if (listCustomerPayment) {
      return listCustomerPayment;
    } else {
      return null;
    }
  }

  public async getListShipmentPriceByPaymentIdAsync(paymentId: any) {
    await this.listCustomerPaymentService.getShipmentListPaymentCustomerAsync(paymentId, this.searchTextDetail, this.pageSizeDetail, this.pageNumberDetail).then(data => {
      this.listShipment = data;
      if (this.listShipment.length > 0) {
        let firstRow = this.listShipment[0];
        this.totalRecordDetail = firstRow.totalCount ? firstRow.totalCount : 0;
        if (this.dataModalVanDonTheoBangKe && this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == ListCustomerPaymentTypeHelper.PAYMENT_TOTALPRICE) {
          this.sumDetail = firstRow.sumPayTotalPrice;
        } else {
          this.sumDetail = firstRow.sumPayCOD - (firstRow.sumPayPriceCOD + firstRow.sumPayTotalPrice);
        }
      } else {
        this.totalRecordDetail = 0;
        this.sumDetail = 0;
      }
    });
  }

  public async getGeneralInfoAsync() {
    await this.generalInfoService.getAsync().then(data => {
      this.generalInfo = data as GeneralInfoModel;
    });
  }

  public async getCustomerById(id: number) {
    await this.customerService.getCustomerById(id).then(data => {
      this.customerInfo = data as Customer;
    })
  }

  async exportCSV() {
    if (!this.dataModalVanDonTheoBangKe) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy thông tin bảng kê.' });
      return;
    }
    if (!this.listShipment || !this.listShipment.length) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Bảng kê không có vận đơn.' });
      return;
    }
    await this.getGeneralInfoAsync();
    await this.getCustomerById(this.dataModalVanDonTheoBangKe.customerId);

    let datas: any[] = [];
    let textPayment: string = '';
    let cuocPhibanDau: number = 0;
    let lastTotal: number = 0;
    let ppxd: number = 0;

    datas.push([this.generalInfo.companyName.toUpperCase()])
    datas.push([this.generalInfo.hotLine])
    datas.push([""]);
    datas.push([this.data.note]);
    datas.push([""]);
    datas.push(["Tên khách hàng: " + (this.customerInfo.companyName ? this.customerInfo.companyName : this.customerInfo.name)]);
    datas.push(["MST: " + this.customerInfo.taxCode]);
    datas.push(["Điện thoại: " + this.customerInfo.phoneNumber + " / Fax: " + this.customerInfo.fax]);
    if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == 1) {
      datas.push([
        "STT", "MÃ VẬN ĐƠN", "NGÀY TẠO", "TÊN NGƯỜI NHẬN", "ĐỊA CHỈ NHẬN", "ĐIỆN THOẠI", "TỈNH ĐẾN", "T LƯỢNG" + environment.unit, "KIỆN", "DICH VỤ", "CƯỚC VC", "TRẠNG THÁI"
      ]);
    }
    else if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == 2) {
      datas.push([
        "STT", "MÃ VẬN ĐƠN", "NGÀY TẠO", "TÊN NGƯỜI NHẬN", "ĐỊA CHỈ NHẬN", "ĐIỆN THOẠI", "TỈNH ĐẾN", "T LƯỢNG" + environment.unit, "KIỆN", "DICH VỤ", "COD", "Cước COD", "TRẠNG THÁI"
      ]);
    } else if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == 3) {
      datas.push([
        "STT", "MÃ VẬN ĐƠN", "NGÀY TẠO", "TÊN NGƯỜI NHẬN", "ĐỊA CHỈ NHẬN", "ĐIỆN THOẠI", "TỈNH ĐẾN", "T LƯỢNG" + environment.unit, "KIỆN", "DICH VỤ", "COD", "Cước COD", "CƯỚC VC", "TRẠNG THÁI"
      ]);
    }
    let i = 0;
    let getPageSize = 200;
    let promise = [];
    let exportDatas: any[] = [];
    let getFor = Math.ceil(this.listShipment[0].totalCount / getPageSize);
    for (let getPageNum = 1; getPageNum <= getFor; getPageNum++) {
      promise.push(await this.listCustomerPaymentService.getShipmentListPaymentCustomerAsync(this.dataModalVanDonTheoBangKe.id, '', getPageSize, getPageNum));
    }
    await Promise.all(promise).then(rs => {
      rs.map(x => {
        exportDatas = exportDatas.concat(x);
      });
      if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == 1) {
        exportDatas.forEach(item => {
          datas.push([
            i + 1, item.shipmentNumber, moment(item.orderDate).format(environment.formatDate), item.receiverName,
            (item.addressNoteTo ? item.addressNoteTo + " - " : "") + item.shippingAddress, item.receiverPhone, item.toProvinceName, item.weight, item.totalBox, item.serviceName, item.payTotalPrice, item.shipmentStatusName
          ])
          i++;
        });
      } else if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == 2) {
        exportDatas.forEach(item => {
          datas.push([
            i + 1, item.shipmentNumber, moment(item.orderDate).format(environment.formatDate), item.receiverName,
            (item.addressNoteTo ? item.addressNoteTo + " - " : "") + item.shippingAddress, item.receiverPhone, item.toProvinceName, item.weight, item.totalBox, item.serviceName, item.payCOD, item.payPriceCOD, item.shipmentStatusName
          ])
          i++;
        });
      } else if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == 3) {
        exportDatas.forEach(item => {
          datas.push([
            i + 1, item.shipmentNumber, moment(item.orderDate).format(environment.formatDate), item.receiverName,
            (item.addressNoteTo ? item.addressNoteTo + " - " : "") + item.shippingAddress, item.receiverPhone, item.toProvinceName, item.weight, item.totalBox, item.serviceName, item.payCOD, item.payPriceCOD, item.payTotalPrice, item.shipmentStatusName
          ])
          i++;
        });
      }
    });
    if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == 1) {
      datas.push(["", "", "", "", "", "", "", "TỔNG:", "", "", exportDatas[0].sumPayTotalPrice]);
    }
    else if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == 2) {
      datas.push(["", "", "", "", "", "", "", "TỔNG:", "", "", exportDatas[0].sumPayCOD, exportDatas[0].sumPayPriceCOD]);
    }
    else if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == 3) {
      datas.push(["", "", "", "", "", "", "", "TỔNG:", "", "", exportDatas[0].sumPayCOD, exportDatas[0].sumPayPriceCOD, exportDatas[0].sumPayTotalPrice]);
    }
    if (this.dataModalVanDonTheoBangKe.listCustomerPaymentTypeId == ListCustomerPaymentTypeHelper.PAYMENT_TOTALPRICE) {
      cuocPhibanDau = exportDatas[0].sumPayTotalPrice;
      textPayment = 'KHÁCH HÀNG PHẢI THANH TOÁN';
    } else {
      cuocPhibanDau = exportDatas[0].sumPayCOD - (exportDatas[0].sumPayPriceCOD + exportDatas[0].sumPayTotalPrice);
      textPayment = 'PHẢI THANH TOÁN CHO KHÁCH';
    }
    lastTotal = cuocPhibanDau + (this.dataModalVanDonTheoBangKe.adjustPrice ? this.dataModalVanDonTheoBangKe.adjustPrice : 0);
    datas.push([`Tổng tiền:`, "", "", cuocPhibanDau])
    datas.push([`Điều chỉnh:`, "", "", (this.dataModalVanDonTheoBangKe.adjustPrice ? this.dataModalVanDonTheoBangKe.adjustPrice : 0)])
    datas.push([`${textPayment}:`, "", "", lastTotal])
    datas.push(["(Bằng chữ: " + this.convertNumberToText.DocTienBangChu(lastTotal) + " đồng.)"])
    if (this.dataModalVanDonTheoBangKe.adjustPrice) datas.push([`Lý do điều chỉnh: ${this.dataModalVanDonTheoBangKe.note}`])
    let date = new Date(this.dataModalVanDonTheoBangKe["createdWhen"]);
    datas.push([
      "", "", "", "", "", "", "", ".....,ngày " + date.getDay() + " tháng " + date.getMonth() + " năm " + date.getFullYear()
    ])

    datas.push(["", "", "", "", "", "", "", "", "KẾ TOÁN"])
    datas.push([""])
    datas.push([""])
    datas.push([""])
    datas.push(["", "", "", "", "", "", "", "", this.dataModalVanDonTheoBangKe["userCreated"]["fullName"]])
    console.log('Export');
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datas);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    const wbout: string = XLSX.write(wb, this.wopts);
    saveAs(new Blob([s2ab(wbout)]), this.fileName);
  }
  public async exportEXCEL() {
    await this.getGeneralInfoAsync();
    await this.getCustomerById(this.dataModalVanDonTheoBangKe.customerId);

    let datas: any[] = [];
    let cuocPhi: number = 0;
    let tong: number = 0;
    let ppxd: number = 0;

    datas.push([this.generalInfo.companyName.toUpperCase(), "", "", "", "", "Khách hàng: " + (this.customerInfo.companyName ? this.customerInfo.companyName : this.customerInfo.name), "", "", "", ""])
    datas.push([
      "Địa chỉ: " + this.generalInfo.addressMain +
      "Mã số thuế: " +
      "Số điện thoại: " + this.generalInfo.hotLine +
      "Fax: " + this.generalInfo.fax, "", "", "", "",
      "Địa chỉ: " + this.customerInfo.address +
      "Mã số thuế: " + this.customerInfo.businessLicenseNumber +
      "Số điện thoại: " + this.customerInfo.phoneNumber +
      "Fax: " + this.customerInfo.fax, "", "", "", ""
    ])
    datas.push([""]);
    datas.push(["BẢNG KÊ CHI TIẾT SỐ " + this.dataModalVanDonTheoBangKe.code]);
    datas.push(["Ngày.....tháng.....năm....."]);
    datas.push(["Kèm theo HĐ GTGT số..........ngày ..... tháng ..... năm ....."]);

    datas.push([
      "STT", "Ngày", "Số vận đơn", "Lộ trình", "T.lượng (" + environment.unit + ")", "Loại", "Giá (VNĐ)", "Phụ phí (VNĐ)", "Phí khác (VNĐ)", "Cộng (VNĐ)"
    ])

    let i = 0;
    this.listShipment.forEach(item => {
      cuocPhi += item.defaultPrice + item.fuelPrice + item.remoteAreasPrice + item.otherPrice + item.totalDVGT;
      tong += (item.defaultPrice + item.fuelPrice + item.remoteAreasPrice + item.otherPrice + item.totalDVGT) + ((item.defaultPrice + item.fuelPrice + item.remoteAreasPrice + item.otherPrice + item.totalDVGT) * 0.1);
      ppxd += item.fuelPrice;

      let date = new Date(item["createdWhen"]).toLocaleDateString("vi");
      datas.push([
        i + 1,
        moment(item.orderDate).format(environment.formatDate),
        item.shipmentNumber,
        (item.shipmentStatus ? item.shipmentStatus.name : ""),
        item.weight,
        (item.paymentType ? item.paymentType.name : ""),
        item.defaultPrice,
        item.fuelPrice + item.remoteAreasPrice,
        item.otherPrice + item.totalDVGT,
        item.defaultPrice + item.fuelPrice + item.remoteAreasPrice + item.otherPrice + item.totalDVGT,
      ])
      i++;
    })

    datas.push(["", "", "", "", "CỘNG", "", "", "", "", cuocPhi])
    datas.push(["", "", "", "", "", "", "Thành tiền VND", "", "", ""])
    datas.push(["", "", "", "", "", "", "VAT (10%)", "", "", ""])
    datas.push(["", "", "", "", "", "", "Tổng cộng:", "", "", tong])
    datas.push(["Bằng chữ: " + this.convertNumberToText.DocTienBangChu(tong) + " đồng."])

    datas.push([""])
    datas.push(["Quý khách vui lòng thanh toán cho công ty chúng tôi theo thông tin tài khoản sau và ghi rõ số Hóa đơn khi thanh toán."])
    datas.push([""])
    datas.push(["Tên TK: " + this.generalInfo.companyName.toUpperCase()])
    datas.push([""])
    datas.push(["Số tài khoản VNĐ: "])
    datas.push(["Tại: "])
    datas.push(["Địa chỉ: "])
    datas.push([""])
    datas.push([""])
    datas.push([""])
    datas.push(["", "", "NGƯỜI MUA HÀNG", "", "", "", "", "kÉ TOÁN", "", ""])

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datas);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    const wbout: string = XLSX.write(wb, this.wopts);
    saveAs(new Blob([s2ab(wbout)]), this.fileName);
  }


}

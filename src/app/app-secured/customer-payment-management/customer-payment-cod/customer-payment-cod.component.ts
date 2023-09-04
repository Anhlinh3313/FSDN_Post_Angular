import { Component, OnInit, TemplateRef } from '@angular/core';

import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { ShipmentService, CustomerService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { ListCustomerPayment, Hub, Customer } from '../../../models/index';
import { ListCustomerPaymentViewModel, DateRangeFromTo } from '../../../view-model/index';
import { ListCustomerPaymentTypeHelper } from '../../../infrastructure/listCustomerPaymentTypeHelper';
import { ListCustomerPaymentService } from '../../../services/listcustomerpayment.service';
import { Shipment } from '../../../models/shipment.model';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { ConvertNumberToText } from '../../../infrastructure/convertNumberToText';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { PrintHelper } from '../../../infrastructure/printHelper';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';

declare var jQuery: any;

function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
}

@Component({
  selector: 'app-customer-payment-cod',
  templateUrl: 'customer-payment-cod.component.html',
  styles: []
})
export class CustomerPaymentCODComponent extends BaseComponent implements OnInit {
  constructor(private modalService: BsModalService, protected messageService: MessageService,
    private listCustomerPaymentService: ListCustomerPaymentService,
    private customerService: CustomerService,
    private shipmentService: ShipmentService,
    private generalInfoService: GeneralInfoService,
    private convertNumberToText: ConvertNumberToText, 
    public permissionService: PermissionService, 
    public router: Router,
    private printFrormServiceInstance: PrintFrormServiceInstance
    ) {
    super(messageService,permissionService,router);
  }

  txtShipmentNumber: string;
  txtNote: any;
  parentPage: string = Constant.pages.customerPayment.name;
  currentPage: string = Constant.pages.customerPayment.children.customerPaymentCOD.name;
  modalTitle: string;
  bsModalRef: BsModalRef;

  isSuccessDelivery: boolean = true;

  bsModalRef_LCP: BsModalRef;
  listShipment: Shipment[];
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
  selectedData: Shipment[];
  selectedDataRight: Shipment[];
  listData: Shipment[];
  listDataRight: Shipment[];
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
  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  hubs: SelectItem[];
  selectedHub: Hub;
  //
  customers: SelectItem[];
  selectedCustomer: Customer;

  selectedDateTo: Date;
  selectedDateFrom: Date;
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();

  //============================
  //BEGIN Danh sách bảng kê thanh toán cước phí
  //============================
  rowPerPageLCP: 20;
  totalRecordsLCP: number;
  columnsLCP: string[] = ["code", "createdWhen", "", "listCustomerPaymentStatus.name",
    "paidByEmp.fullName", "totalPrice", "totalCOD", "grandTotal", "userCreated.fullName", "createdWhen", "userModified.fullName", "modifiedWhen"];
  datasourceLCP: ListCustomerPayment[];
  listDataLCP: ListCustomerPayment[];
  eventLCP: LazyLoadEvent;
  statuesLCP: SelectItem[];
  customersLRP: SelectItem[];
  selectedCustomerLCP: Customer;
  selectedStatusLCP: Customer;
  public dateRangeLCP = {
    start: moment(),
    end: moment()
  }
  //============================
  //END Danh sách bảng kê thanh toán cước phí
  //============================
  ngOnInit() {
    this.initData();
  }

  async initData() {
    this.loadCustomer();
    await this.loadShipment(undefined);
    this.selectedData = null;
    this.listDataRight = [];

    this.loadListReceitMoney();
  }
  loadCustomer() {
    this.listCustomerPaymentService.getCustomerWaitingPayment(ListCustomerPaymentTypeHelper.PAYMENT_COD).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.customers = [];
        let customers = x.data as Customer[];
        this.customers = customers.map(function (element) {
          return { label: element.name, value: element };
        })
        // this.customersLRP = [{ label: "Chọn tất cả", value: null }].concat(this.customers);
        this.customersLRP = [{ label: "Chọn tất cả", value: null }];
        x.data.forEach(element => {
          this.customersLRP.push({
            label: element.name, value: element.id
          })
        });

        this.selectedCustomer = null;
        this.selectedCustomerLCP = null;
      }
    );
  }
  async loadShipment(customerId: number) {
    this.listDataRight = [];
    if (customerId) {
      let includes: any = [
        Constant.classes.includes.shipment.service,
        Constant.classes.includes.shipment.paymentType,
        Constant.classes.includes.shipment.shipmentStatus,
        Constant.classes.includes.shipment.tpl,
        Constant.classes.includes.shipment.sender,
      ];

      this.datasource = await this.listCustomerPaymentService.getListShipmentToPaymentAsync(ListCustomerPaymentTypeHelper.PAYMENT_COD, customerId, includes)
      this.totalRecords = this.datasource.length;
      // this.listData = this.datasource.slice(0, this.rowPerPage);
      this.listData = this.datasource;

      // this.listCustomerPaymentService.getListShipmentToPayment(ListCustomerPaymentTypeHelper.PAYMENT_COD, customerId, includes).subscribe(
      //   x => {
      //     let shipments = x.data as Shipment[];
      //     this.datasource = shipments;
      //     this.totalRecords = this.datasource.length;
      //     // this.listData = this.datasource.slice(0, this.rowPerPage);
      //     this.listData = this.datasource;
      //   });
    } else {
      this.datasource = [];
      this.totalRecords = 0;
      this.listData = [];
    }
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
        var filterRows = this.datasource;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        //End Custom filter

        if (this.selectedDateFrom && this.selectedDateTo) {
          //
          filterRows = filterRows.filter(x => moment((this.isSuccessDelivery ? x.endDeliveryTime : x.orderDate)).isBetween(this.selectedDateFrom, this.selectedDateTo));
        } else if (this.selectedDateFrom) {
          filterRows = filterRows.filter(x => moment((this.isSuccessDelivery ? x.endDeliveryTime : x.orderDate)).isAfter(this.selectedDateFrom));
        } else if (this.selectedDateTo) {
          filterRows = filterRows.filter(x => moment((this.isSuccessDelivery ? x.endDeliveryTime : x.orderDate)).isBefore(this.selectedDateTo));
        }

        // sort data
        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        // this.listData = filterRows.slice(event.first, (event.first + event.rows))
        this.listData = filterRows;
        this.totalRecords = filterRows.length;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }
  async changeCustomer() {
    await this.loadShipment((this.selectedCustomer == null ? undefined : this.selectedCustomer.id));
    this.loadLazy(this.event);
  }

  async refresh() {
    this.listDataRight = [];
    this.selectedHub = null;
    this.selectedCustomer = null;
    await this.loadShipment(undefined);
    if (this.bsModalRef)
      this.bsModalRef.hide();
  }

  save() {
    // console.log(this.listDataRight);
    if (!this.listDataRight.length) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Chưa chọn vận đơn" });
      return;
    }
    if (!this.selectedCustomer) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Chưa chọn nhân viên" });
      return;
    }

    let shipments = [];
    let model = new ListCustomerPaymentViewModel();

    shipments = this.listDataRight.map(function (x) {
      return x.id;
    });
    model.customerId = this.selectedCustomer.id;
    model.shipmentIds = shipments;
    model.note = this.txtNote;
    model.listCustomerPaymentTypeId = ListCustomerPaymentTypeHelper.PAYMENT_COD;
    this.listCustomerPaymentService.create(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refresh();
      this.messageService.add({ severity: Constant.messageStatus.success, detail: "Tạo bảng kê thu tiền thành công" });
    });
  }

  removeDataLeft(listRemove: Shipment[]) {
    let listClone = Array.from(this.listData);

    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
      this.datasource.splice(this.datasource.indexOf(obj), 1);
    }

    this.listData = listClone;
    this.selectedData = [];
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
  assign() {
    if (!this.selectedCustomer) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Chưa chọn nhân viên" });
      return;
    } else if (!this.datasource.length) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Chưa chọn vận đơn" });
      return;
    }

    let listDataClone = Array.from(this.listDataRight);
    this.selectedData.forEach(x => listDataClone.push(x));
    this.listDataRight = listDataClone;
    this.removeDataLeft(this.selectedData);
  }

  unAssign() {
    if (!this.selectedDataRight) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Chưa chọn vận đơn" });
      return;
    }

    let listDataClone = Array.from(this.listData);
    this.selectedDataRight.forEach(x => { listDataClone.push(x); this.datasource.push(x); });
    this.listData = listDataClone;
    this.removeDataRight(this.selectedDataRight);
  }
  clickRefresh(template: TemplateRef<any>) {
    this.refresh();
  }
  //======== BEGIN METHOD ListReceiveMoney ======= 
  loadListReceitMoney() {
    let includes: any = [];
    let includesListCustomerPayment = Constant.classes.includes.listCustomerPayment;
    for (var prop in Constant.classes.includes.listCustomerPayment) {
      includes.push(includesListCustomerPayment[prop]);
    }
    var fromDate = null;
    var toDate = null;
    if (this.dateRangeLCP) {
      fromDate = this.dateRangeLCP.start.add(0, 'd').toJSON();
      toDate = this.dateRangeLCP.end.toJSON();
    }
    this.listCustomerPaymentService.getListByType(ListCustomerPaymentTypeHelper.PAYMENT_COD, fromDate, toDate, includes)
      .subscribe(x => {
        this.datasourceLCP = x.data as ListCustomerPayment[];
        this.totalRecordsLCP = this.datasourceLCP.length;
        this.listDataLCP = this.datasourceLCP.slice(0, this.rowPerPageLCP);
        this.loadFilterLCP();
      });
  }

  async loadLazyListReceiveMoney(event: LazyLoadEvent) {
    this.eventLCP = event;
    setTimeout(async () => {
      if (this.datasourceLCP) {
        var filterRows;
        if (event.filters.length > 0)
          filterRows = this.datasourceLCP.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasourceLCP.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLCP));

        if (this.selectedStatusLCP) {
          filterRows = filterRows.filter(x => x.listReceiptMoneyStatusId === this.selectedStatusLCP.id);
        }

        if (this.selectedCustomerLCP) {
          filterRows = filterRows.filter(x => x.customerId === this.selectedCustomerLCP);
        }

        // search ListGoodsByShipmentNumberandType
        if (this.txtShipmentNumber) {
          if (this.txtShipmentNumber.trim() === "") {
            this.messageService.add({
              severity: Constant.messageStatus.warn,
              detail: "Vui lòng nhập mã vận đơn!"
            });
          } else {
            filterRows = await this.findListGooods(this.txtShipmentNumber, ListCustomerPaymentTypeHelper.PAYMENT_COD);
          }
        }

        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.listDataLCP = filterRows.slice(event.first, (event.first + event.rows))
        this.totalRecordsLCP = filterRows.length;
      }
    }, 250);
  }
  loadFilterLCP() {
    let uniqueStatus = [];
    this.statuesLCP = [];
    this.datasourceLCP.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuesLCP.push({ label: "Chọn tất cả", value: null });
      }
      //
    })
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

  refreshLCP() {
    this.loadListReceitMoney();
  }
  changeFilterLCP() {
    this.loadLazyListReceiveMoney(this.eventLCP);
  }
  lockLCP(data: ListCustomerPayment) {
    let model = new ListCustomerPaymentViewModel();
    model.id = data.id;
    this.listCustomerPaymentService.lock(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLCP();
      this.messageService.add({ severity: Constant.messageStatus.success, detail: "Khóa bảng kê thu tiền thành công" });
    });;
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
      this.messageService.add({ severity: Constant.messageStatus.success, detail: "Xác nhận bảng kê thu tiền thành công" });
    });;
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

  onViewSuccessDelivery() {
    this.loadLazy(this.event);
  }

  public eventLog = '';

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
    this.eventLog += '\nEvent Fired: ' + e.event.type;
  }

  //======== END METHOD ListReceiveMoney ======= 

  public async viewLCP(data, template: TemplateRef<any>) {
    let includeView: string[] = [
      Constant.classes.includes.shipment.tpl,
      Constant.classes.includes.shipment.service,
      Constant.classes.includes.shipment.paymentType,
    ];

    this.dataModalVanDonTheoBangKe = data;

    await this.getListShipmentCODByPaymentIdAsync(data.id, includeView);
    this.bsModalRef_LCP = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-lg modal-full"
    });
  }

  public getListShipmentCODByPaymentIdAsync(paymentId: string, arrCols: string[]) {
    this.shipmentService.getListShipmentCODByPaymentIdAsync(paymentId, arrCols).then(data => {
      this.listShipment = data;
      // console.log(data);
    })
  }

  public async getGeneralInfoAsync() {
    await this.generalInfoService.getAsync().then(data => {
      this.generalInfo = data as GeneralInfoModel;
      // console.log(data);
    })
  }

  public async getCustomerById(id: number) {
    await this.customerService.getCustomerById(id).then(data => {
      this.customerInfo = data as Customer;
      // console.log(data);
    })
  }

  public async exportCSV() {

    await this.getGeneralInfoAsync();
    await this.getCustomerById(this.dataModalVanDonTheoBangKe.customerId);

    let datas: any[] = [];
    let cuocPhibanDau: number = 0;
    let ppxd: number = 0;
    let cod: number = 0;

    datas.push([this.generalInfo.companyName.toUpperCase()])
    datas.push([this.generalInfo.hotLine])
    datas.push([""]);
    datas.push([this.txtNote]);
    datas.push([""]);
    datas.push(["Tên khách hàng: " + (this.customerInfo.companyName ? this.customerInfo.companyName : this.customerInfo.name)]);
    datas.push(["MST: " + this.customerInfo.taxCode]);
    datas.push(["Điện thoại: " + this.customerInfo.phoneNumber + " / Fax: " + this.customerInfo.fax]);

    datas.push([
      "STT", "MÃ VẬN ĐƠN", "NGÀY GỬI", "TÊN NGƯỜI NHẬN", "ĐỊA CHỈ NHẬN", "SĐT NGƯỜI NHẬN", "T LƯỢNG" + environment.unit, "COD", "Ngày giao thành công"
    ])

    let i = 0;
    this.listShipment.forEach(item => {
      cuocPhibanDau += item.defaultPrice;
      ppxd += item.fuelPrice;
      cod += item.cod;

      let date = new Date(item["createdWhen"]).toLocaleDateString("vi");
      datas.push([
        i + 1, item.shipmentNumber, moment(item.orderDate).format(environment.formatDate), item.receiverName, (item.addressNoteTo ? item.addressNoteTo + " - " : "") + item.shippingAddress, item.receiverPhone, item.weight, item.cod, item.endDeliveryTime
      ])
      i++;
    })

    datas.push(["", "", "", "", "", "", "CỘNG COD", cod])
    datas.push(["(Bằng chữ: " + this.convertNumberToText.DocTienBangChu(cod) + " đồng.)"])

    let date = new Date(this.dataModalVanDonTheoBangKe["createdWhen"]);
    datas.push([
      "", "", "", "", "", "", "", ".....,ngày " + date.getDay() + " tháng " + date.getMonth() + " năm " + date.getFullYear()
    ])

    datas.push(["", "", "", "", "", "", "", "", "KẾ TOÁN"])
    datas.push([""])
    datas.push([""])
    datas.push([""])
    datas.push(["", "", "", "", "", "", "", "", this.dataModalVanDonTheoBangKe["userCreated"]["fullName"]])

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datas);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    /* save to file */
    const wbout: string = XLSX.write(wb, this.wopts);
    saveAs(new Blob([s2ab(wbout)]), this.fileName);
  }

  // Date picker
  public eventLogLS = "";

  public mainInput = {
    start: moment(),
    end: moment()
  };

  public selectedDate: string = "Chọn ngày"

  public selectedDateLS(value: any, dateInput: any) {
    this.selectedData = [];
    dateInput.start = value.start;
    dateInput.end = value.end;
    this.requestGetPickupHistory.fromDate = moment(value.start).toDate();
    this.requestGetPickupHistory.toDate = moment(value.end).toDate();
    this.selectedDateFrom = this.requestGetPickupHistory.fromDate;
    this.selectedDateTo = this.requestGetPickupHistory.toDate;

    this.selectedDate = moment(value.start).format(environment.formatDate) + " - " + moment(value.end).format(environment.formatDate);

    this.loadLazy(this.event);
  }

  public calendarEventsHandlerLS(e: any) {
    this.eventLogLS += "\nEvent Fired: " + e.event.type;
  }
  //

  idPrint: string;
  print(data) {
    if (data) {
      console.log(data);
      setTimeout(() => {
        this.idPrint = PrintHelper.printReceiptPayment;
        this.printFrormServiceInstance.sendCustomEvent([data]);
      }, 0);
    }
  }
}

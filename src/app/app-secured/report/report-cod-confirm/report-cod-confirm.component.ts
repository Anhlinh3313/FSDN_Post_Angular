import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem, DataTable } from 'primeng/primeng';
import { UserService, ShipmentService, HubService, ProvinceService, PaymentTypeService, ServiceService, CustomerService, ShipmentStatusService, ReportService, AccountingAccountService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Customer } from '../../../models/index';
import { DateRangeFromTo } from '../../../view-model/index';
import { Shipment } from '../../../models/shipment.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
import { ReportCODConfirm } from '../../../models/reportCODConfirm.model';
import { ReportCODConfirmFilter } from '../../../models/reportCODConfirmFilter.model';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ReportCODConfirmViewModel } from '../../../view-model/reportCODConfirm.viewModel';

@Component({
  selector: 'app-report-cod-confirm',
  templateUrl: './report-cod-confirm.component.html',
  styles: []
})

export class ReportCodConfirmConponent extends BaseComponent implements OnInit {
  public dateRange = {
    start: moment(),
    end: moment()
  }
  hub = environment;

  customer: any;
  customers: SelectModel[];
  users: SelectModel[];
  selectedUser: any = null;
  deliverUser: any = null;
  filteredCustomers: any;

  typeDelivery: string;
  isSuccessDelivery: boolean;
  //
  constructor(
    protected messageService: MessageService,
    // private shipmentService: ShipmentService,
    private reportService: ReportService,
    private hubService: HubService,
    private userService: UserService,
    private provinceService: ProvinceService,
    private paymentTypeService: PaymentTypeService,
    private serviceService: ServiceService,
    private customerService: CustomerService,
    private shipmentStatusService: ShipmentStatusService,
    private accountingAccountService: AccountingAccountService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);

    let fromDate = null;
    let toDate = null;
    if (this.dateRange) {
      fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
      toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    }

    this.filterViewModel.dateFrom = fromDate;
    this.filterViewModel.dateTo = toDate;
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.pageSize = this.rowPerPage;
  }

  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportCODConfirm.name;

  //============================
  //BEGIN
  //============================
  txtFilterGb: any;
  pageNum = 1;
  rowPerPage = 20;
  totalRecevice: number = 0;
  totalRecords: number = 0;
  maxRecordExport = 200;

  filterViewModel: ReportCODConfirmViewModel = new ReportCODConfirmViewModel();

  // datasource: Shipment[];
  listData: ReportCODConfirm[];
  event: LazyLoadEvent;

  //
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  //

  //
  txtSearchText: string = "";

  fromProvincesLS: SelectItem[];
  fromSelectedProvinceLS: number;

  toProvincesLS: SelectItem[];
  toSelectedProvinceLS: number;

  fromHub: SelectItem[];
  selectedFromHub: number;

  currentHub: SelectItem[];
  selectedCurrentHub: number;

  toHub: SelectItem[];
  selectedToHub: number;

  fromSendersLS: SelectItem[];
  fromSelectedSenderLS: number;

  servicesLS: SelectItem[];
  selectedServicesLS: number;

  paymentTypesLS: SelectItem[];
  selectedPaymentTypeLS: number;

  statusesLS: SelectItem[];
  selectedStatusLS: number;
  
  accounyingAccount: SelectItem[];
  selectedAccounyingAccount: number;

  selectedDateFrom: Date;
  selectedDateTo: Date;
  //

  //
  columns: any[] = [
    { field: "shipmentNumber", header: 'Mã vận đơn' },
    { field: "requestShipmentId", header: 'Mã bill tổng' },
    { field: "cusNote", header: 'Yêu cầu phục vụ' },
    { field: "orderDate", header: 'Ngày gửi', typeFormat: "date", formatString: 'YYYY/MM/DD' },
    { field: "orderDate", header: 'Giờ gửi', typeFormat: "time", formatString: 'HH:mm' },
    { field: "paymentType", child: true, childName: "name", header: 'HTTT' },
    { field: "service", child: true, childName: "name", header: 'Dịch vụ' },
    { field: "shipmentServiceDVGTs", header: 'Dịch vụ gia tăng' },
    { field: "cod", header: 'COD', typeFormat: "number" },
    { field: "defaultPrice", header: 'Cước chính', typeFormat: "number" },
    { field: "fuelPrice", header: 'PPXD', typeFormat: "number" },
    { field: "remoteAreasPrice", header: 'VSVX', typeFormat: "number" },
    { field: "totalDVGT", header: 'Phí DVGT', typeFormat: "number" },
    { field: "vatPrice", header: 'VAT', typeFormat: "number" },
    { field: "totalPrice", header: 'Tổng cước', typeFormat: "number" },
    { field: "shipmentStatus", child: true, childName: "name", header: 'Trạng thái' },
    { field: "currentEmp", child: true, childName: "fullName", header: 'Nhân viên giữ' },
    { field: "senderName", header: 'Tên người gửi' },
    { field: "senderPhone", header: 'Đt gửi' },
    { field: "companyFrom", header: 'CTY gửi' },
    { field: "pickingAddress", header: 'Địa chỉ gửi' },
    { field: "fromProvince", child: true, childName: "name", header: 'Tỉnh đi' },
    { field: "fromHub", child: true, childName: "name", header: 'Trạm lấy' },
    { field: "fromHubRouting", child: true, childName: "name", header: 'Tuyến lấy' },
    { field: "receiverCode2", header: 'Mã người nhận' },
    { field: "receiverName", header: 'Tên người nhận' },
    { field: "receiverPhone", header: 'Đt nhận' },
    { field: "companyTo", header: 'CTY nhận' },
    { field: "shippingAddress", header: 'Địa chỉ nhận' },
    { field: "toProvince", child: true, childName: "name", header: 'Tỉnh đến' },
    { field: "toHub", child: true, childName: "name", header: 'Trạm giao' },
    { field: "toHubRouting", child: true, childName: "name", header: 'Tuyến giao' },
  ];
  //

  //============================
  //END 
  //============================

  ngOnInit() {
    this.initData();
    console.log(this.dateRange);
  }

  initData() {
    this.filterViewModel.dateFrom = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    this.filterViewModel.dateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    this.loadShipment();
  }

  //======== BEGIN METHOD ListReceiveMoney ======= 

  async loadShipmentPaging() {
    let data = await this.reportService.getReportCODConfirm(this.filterViewModel);
    this.listData = data.reverse();
    this.totalRecords = data.length ? data[0].totalCount : 0;
    this.totalRecevice = data.length ? data[0].totalCOD : 0;
    this.sumTotalReceive();
  }

  loadShipment() {
    this.loadShipmentPaging();
    this.loadFilter();
  }

  async loadUserByHub(hubId: any) {
    this.users = [{ value: null, label: `-- Tất cả --` }];
    let data = await this.userService.getAllEmpByHubIdAsync(hubId);
    data.map(m => {
      this.users.push({ value: m.id, label: `${m.code} ${m.fullName}`, data: m })
    });
  }

  loadFilter() {
    this.loadProvinceLS();
    this.loadSenderLS();
    this.loadServiceLS();
    this.loadAccounyingAccount();
    this.loadPaymentTypeLS();
    this.loadShipmentStatusLS();
    this.loadHub();
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.listData) {

        this.listData.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
      }
    }, 250);
  }

  refresh() {
    this.selectedPaymentTypeLS = 0;
    this.selectedServicesLS = 0;
    this.selectedStatusLS = 0;
    this.toSelectedProvinceLS = 0;
    this.fromSelectedProvinceLS = 0;
    this.fromSelectedSenderLS = 0;
    this.selectedToHub = 0;

    this.filterViewModel = new ReportCODConfirmViewModel();

    let fromDate = null;
    let toDate = null;
    if (this.dateRange) {
      fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
      toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    }

    this.filterViewModel.dateFrom = fromDate;
    this.filterViewModel.dateTo = toDate;
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.pageSize = this.rowPerPage;

    this.loadShipment();
  }

  async exportCSV(dt: DataTable) {
    if (dt) {
      let fileName: string = 'BAO_CAO_COD_PHAI_THU.xlsx';
      if (this.totalRecords > 0) {
        if (this.totalRecords > this.maxRecordExport) {
          let data: any[] = [];
          let count = Math.ceil(this.totalRecords / this.maxRecordExport);
          let promise = [];
          for (let i = 1; i <= count; i++) {
            let clone = this.filterViewModel;
            clone.pageNumber = i;
            clone.pageSize = this.maxRecordExport;

            promise.push(await this.reportService.getReportCODConfirm(clone));
          }
          Promise.all(promise).then(rs => {
            rs.map(x => {
              data = data.concat(x.data);
            });

            let dataE = data.reverse();
            var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columns, false, false);
            ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
          });
        }
        else {
          let clone = this.filterViewModel;
          clone.pageNumber = 1;
          clone.pageSize = this.totalRecords;

          this.reportService.getReportCODConfirm(clone).then(x => {
            let data = x.reverse();
            dt.value = data;
            var dataEX = ExportAnglar5CSV.ExportData(data, this.columns, false, false);
            ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
          });
        }
      }
      else {
        dt.exportCSV();
      }
    }
  }


  // Handler Filter
  // Date picker
  public selectedDate() {
    this.filterViewModel.dateFrom = SearchDate.formatToISODate(moment(this.filterViewModel.dateFrom).toDate());
    this.filterViewModel.dateTo = SearchDate.formatToISODate(moment(this.filterViewModel.dateTo).toDate());
  }

  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public eventLog = "";

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }
  //

  //
  loadProvinceLS() {
    this.fromProvincesLS = [];
    this.toProvincesLS = [];
    this.provinceService.getAllSelectModelAsync().then(x => {
      this.fromProvincesLS = x;
      this.toProvincesLS = x;
    });
  }

  loadHub() {
    this.fromHub = [];
    this.currentHub = [];
    this.toHub = [];
    this.hubService.getAllHubSelectModelAsync().then(x => {
      this.fromHub = x;
      this.currentHub = x;
      this.toHub = x;
    });
  }

  loadSenderLS() {
    this.fromSendersLS = [];
    this.customerService.getAllSelectModelAsync().then(x => {
      this.fromSendersLS = x;
    })
  }

  loadServiceLS() {
    this.servicesLS = [];
    this.serviceService.getAllSelectModelAsync().then(x => {
      this.servicesLS = x;
    })
  }

  loadAccounyingAccount() {
    this.accounyingAccount = [];
    this.accountingAccountService.getAllSelectModelAsync().then(x => {
      this.accounyingAccount = x;
    })
  }

  loadPaymentTypeLS() {
    this.paymentTypesLS = [];
    this.paymentTypeService.getAllSelectModelAsync().then(x => {
      this.paymentTypesLS = x;
    })
  }

  loadShipmentStatusLS() {
    this.statusesLS = [];
    this.shipmentStatusService.getAllSelectModelAsync().then(x => {
      this.statusesLS = x;
    })
  }
  //

  changeSender() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.senderId = this.fromSelectedSenderLS;
  }


  onPageChange(event: any) {
    this.filterViewModel.pageNumber = event.first / event.rows + 1;
    this.filterViewModel.pageSize = event.rows;
    this.loadShipmentPaging();
  }
  //
  //
  sumTotalReceive() {
    this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
      return priceKeeping += (shipment.cod + shipment.totalPrice);
    }, 0);
  }

  filterCustomers(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            this.filteredCustomers.push("-- Chọn tất cả --");
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

  onSelectedCustomer() {
    this.fromSelectedSenderLS = null;
    let cloneSelectedCustomer = this.customer;
    let index = cloneSelectedCustomer.indexOf(" -");
    let customers: any;
    if (index !== -1) {
      customers = cloneSelectedCustomer.substring(0, index);
      cloneSelectedCustomer = customers;
    }
    this.customers.forEach(x => {
      let obj = x.data as Customer;
      if (obj) {
        if (cloneSelectedCustomer === x.label) {
          this.fromSelectedSenderLS = obj.id;
        }
      } else {
        this.fromSelectedSenderLS = null;
      }
    });
    this.changeSender();
  }

  keyTabSender(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
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
            let findCus: SelectModel = null;
            if (this.customers.length == 1) {
              findCus = this.customers[0];
            } else {
              findCus = this.customers.find(f => f.data.code == value || f.label == value);
            }
            if (findCus) {
              this.fromSelectedSenderLS = findCus.value;
              this.customer = findCus.label;
            }
            else {
              this.fromSelectedSenderLS = null;
            }
            this.changeSender();
          } else {
            this.fromSelectedSenderLS = null;
            this.changeSender();
          }
        }
      );
    } else {
      this.fromSelectedSenderLS = null;
      this.changeSender();
    }
  }
  //
  changeFromHub() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.fromHubId = this.selectedFromHub;
  }
  changeCurrentHub() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.currentHubId = this.selectedCurrentHub;
    this.loadUserByHub(this.selectedCurrentHub);
  }
  changeUser() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.currentEmpId = this.selectedUser;
  }
  changeToHub() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.toHubId = this.selectedToHub;
  }
  changeFromProvince() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.fromProvinceId = this.fromSelectedProvinceLS;
  }
  changeToProvince() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.toProvinceId = this.toSelectedProvinceLS;
  }
  changeServices() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.serviceId = this.selectedServicesLS;
  }
  changeShipmentStatus() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.shipmentStatusId = this.selectedStatusLS;
  }
  changeAccountingAccount() {
    this.filterViewModel.pageNumber = 1;
    this.filterViewModel.accountingAccountId = this.selectedAccounyingAccount;
  }
  search() {
    this.filterViewModel.searchText = this.txtSearchText;
  }
  //
  async exportCSVNewFormat(dt: any) {
    if (dt) {
      let fileName = "BAO_CAO_COD_DA_XAC_NHAN";
      let clone = this.filterViewModel;
      clone.customExportFile.fileNameReport = fileName;
      clone.customExportFile.columnExcelModels = this.columns;
      clone.pageNumber = 1;
      clone.pageSize = this.totalRecords;
      this.reportService.getReportCODConfirmExcel(clone);
    }
  }
}


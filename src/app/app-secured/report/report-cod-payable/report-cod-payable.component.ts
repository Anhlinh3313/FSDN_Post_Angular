import { Component, OnInit } from '@angular/core';

import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent, SelectItem, DataTable } from 'primeng/primeng';
import { ShipmentService, HubService, ProvinceService, PaymentTypeService, ServiceService, CustomerService, ShipmentStatusService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Customer } from '../../../models/index';
import { DateRangeFromTo } from '../../../view-model/index';
import { Shipment } from '../../../models/shipment.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
import { ShipmentTypeHelper } from '../../../infrastructure/shipmentType.helper';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';

@Component({
  selector: 'app-report-cod-payable',
  templateUrl: './report-cod-payable.component.html',
  styles: []
})

export class ReportCodPayableComponent extends BaseComponent implements OnInit {
  typeDelivery: string;
  isSuccessDelivery: boolean;
  constructor(
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private hubService: HubService,
    private provinceService: ProvinceService,
    private paymentTypeService: PaymentTypeService,
    private serviceService: ServiceService,
    private customerService: CustomerService,
    private shipmentStatusService: ShipmentStatusService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);

    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    let orderDateFrom = currentDate + "T01:00:00";
    let orderDateTo = currentDate + "T23:59:59";

    this.shipmentFilterViewModel.Cols = this.includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.codrecivereadypayment;
    this.shipmentFilterViewModel.OrderDateFrom = orderDateFrom;
    this.shipmentFilterViewModel.OrderDateTo = orderDateTo;
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
  }

  includes: string =
    Constant.classes.includes.shipment.fromHubRouting + "," +
    Constant.classes.includes.shipment.shipmentStatus + "," +
    Constant.classes.includes.shipment.service + "," +
    Constant.classes.includes.shipment.fromHub + "," +
    Constant.classes.includes.shipment.toHub + "," +
    Constant.classes.includes.shipment.toHubRouting + "," +
    Constant.classes.includes.shipment.pickUser + "," +
    Constant.classes.includes.shipment.fromWard + "," +
    Constant.classes.includes.shipment.toWard + "," +
    Constant.classes.includes.shipment.fromDistrict + "," +
    Constant.classes.includes.shipment.fromProvince + "," +
    Constant.classes.includes.shipment.toDistrict + "," +
    Constant.classes.includes.shipment.toProvince + "," +
    Constant.classes.includes.shipment.deliverUser + "," +
    Constant.classes.includes.shipment.paymentType + "," +
    Constant.classes.includes.shipment.sender + "," +
    Constant.classes.includes.shipment.structure + "," +
    Constant.classes.includes.shipment.serviceDVGT + "," +
    Constant.classes.includes.shipment.boxes;

  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportCODPayable.name;

  customer: any;
  customers: SelectModel[];
  filteredCustomers: any;

  //============================
  //BEGIN
  //============================
  txtFilterGb: any;
  pageNum = 1;
  rowPerPage = 20;
  totalRecords: number = 0;
  totalRecevice: number = 0;
  maxRecordExport = 200;

  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();

  // datasource: Shipment[];
  listData: Shipment[];
  event: LazyLoadEvent;

  //
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  public dateRange = {
    start: moment().hour(1).minute(0).second(0),
    end: moment().hour(23).minute(59).second(0)
  }
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
    { field: "paymentType.name", header: 'HTTT' },
    { field: "service.name", header: 'Dịch vụ' },
    { field: "shipmentServiceDVGTs", header: 'Dịch vụ gia tăng' },
    { field: "cod", header: 'COD', typeFormat: "number" },
    { field: "defaultPrice", header: 'Cước chính', typeFormat: "number" },
    { field: "fuelPrice", header: 'PPXD', typeFormat: "number" },
    { field: "remoteAreasPrice", header: 'VSVX', typeFormat: "number" },
    { field: "totalDVGT", header: 'Phí DVGT', typeFormat: "number" },
    { field: "vatPrice", header: 'VAT', typeFormat: "number" },
    { field: "totalPrice", header: 'Tổng cước', typeFormat: "number" },
    { field: "shipmentStatus.name", header: 'Trạng thái' },
    { field: "currentEmp.fullName", header: 'Nhân viên giữ' },
    { field: "senderName", header: 'Tên người gửi' },
    { field: "senderPhone", header: 'Đt gửi' },
    { field: "companyFrom", header: 'CTY gửi' },
    { field: "pickingAddress", header: 'Địa chỉ gửi' },
    { field: "fromWard.district.province.name", header: 'Tỉnh đi' },
    { field: "fromHub.name", header: 'Trạm lấy' },
    { field: "fromHubRouting.name", header: 'Tuyến lấy' },
    { field: "receiverCode2", header: 'Mã người nhận' },
    { field: "receiverName", header: 'Tên người nhận' },
    { field: "receiverPhone", header: 'Đt nhận' },
    { field: "companyTo", header: 'CTY nhận' },
    { field: "shippingAddress", header: 'Địa chỉ nhận' },
    { field: "toWard.district.province.name", header: 'Tỉnh đến' },
    { field: "toHub.name", header: 'Trạm giao' },
    { field: "toHubRouting.name", header: 'Tuyến giao' },
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
    this.shipmentFilterViewModel.OrderDateFrom = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    this.shipmentFilterViewModel.OrderDateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    this.loadShipment();
  }

  //======== BEGIN METHOD ListReceiveMoney ======= 

  async loadShipmentPaging() {

    // this.shipmentFilterViewModel.ShipmentNumber = null;
    // this.shipmentFilterViewModel.OrderDateFrom = this.selectedDateFrom;
    // this.

    await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel).then(x => {
      if (x.isSuccess) {
        let data = x.data as Shipment[];
        this.listData = data.reverse();
        this.totalRecords = x.dataCount;
        this.sumTotalReceive();
      }
    });
  }

  loadShipment() {
    this.loadShipmentPaging();
    this.loadFilter();
  }

  loadFilter() {
    this.loadProvinceLS();
    this.loadSenderLS();
    this.loadServiceLS();
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

    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    let orderDateFrom = currentDate + "T01:00:00";
    let orderDateTo = currentDate + "T23:59:59";

    this.shipmentFilterViewModel = new ShipmentFilterViewModel();

    this.shipmentFilterViewModel.Cols = this.includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.codrecivereadypayment;
    this.shipmentFilterViewModel.OrderDateFrom = orderDateFrom;
    this.shipmentFilterViewModel.OrderDateTo = orderDateTo;
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;

    this.loadShipment();
  }

  async exportCSV(dt: DataTable) {

    if (dt) {
      let fileName: string = 'BAO_CAO_COD_PHAI_TRA.xlsx';
      if (this.totalRecords > 0) {
        if (this.totalRecords > this.maxRecordExport) {
          let data: any[] = [];
          let count = Math.ceil(this.totalRecords / this.maxRecordExport);
          let promise = [];
          for (let i = 1; i <= count; i++) {
            let clone = this.shipmentFilterViewModel;
            clone.PageNumber = i;
            clone.PageSize = this.maxRecordExport;

            promise.push(await this.shipmentService.postByTypeAsync(clone));
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
          let clone = this.shipmentFilterViewModel;
          clone.PageNumber = 1;
          clone.PageSize = this.totalRecords;

          this.shipmentService.postByTypeAsync(clone).then(x => {
            let data = x.data.reverse();
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
    this.shipmentFilterViewModel.OrderDateFrom = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateFrom).toDate());
    this.shipmentFilterViewModel.OrderDateTo = SearchDate.formatToISODate(moment(this.shipmentFilterViewModel.OrderDateTo).toDate());
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
    // this.fromSendersLS = [];
    // this.customerService.getAllSelectModelAsync().then(x => {
    //   this.fromSendersLS = x;
    // })
  }

  loadServiceLS() {
    this.servicesLS = [];
    this.serviceService.getAllSelectModelAsync().then(x => {
      this.servicesLS = x;
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

  //
  search() {
    this.shipmentFilterViewModel.SearchText = this.txtSearchText;
    this.loadShipmentPaging();
  }

  changeFromProvince() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.FromProvinceId = this.fromSelectedProvinceLS;
  }

  changeToProvince() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ToProvinceId = this.toSelectedProvinceLS;
  }

  changeSender() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.SenderId = this.fromSelectedSenderLS;
  }

  changeShipmentStatus() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ShipmentStatusId = this.selectedStatusLS;
  }

  changeServices() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ServiceId = this.selectedServicesLS;
  }

  changePaymentType() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.PaymentTypeId = this.selectedPaymentTypeLS;
  }

  changeFromHub() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.FromHubId = this.selectedFromHub;
  }

  changeCurrentHub() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.CurrentHubId = this.selectedCurrentHub;
  }

  changeToHub() {
    this.shipmentFilterViewModel.PageNumber = 1;
    this.shipmentFilterViewModel.ToHubId = this.selectedToHub;
  }

  onPageChange(event: any) {
    this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModel.PageSize = event.rows;
  }
  //
  //
  sumTotalReceive() {
    this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
      return priceKeeping += (shipment.cod + shipment.totalPrice);
    }, 0)
  }

  filterCustomers(event) {
    let value = event.query;
    if (value.length >= 2) {
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

  onSelectedCustomer() {
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
          this.changeSender();
        }
      }
    });
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
              this.fromSelectedSenderLS = null
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
}



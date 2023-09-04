import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent } from 'primeng/primeng';
import { HubService, ReportService, CustomerService, ProvinceService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Customer } from '../../../models/index';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { ReportKPICustomer } from '../../../models/reportKPICustomer.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import * as XLSX from 'xlsx';
declare var jQuery: any;


@Component({
  selector: 'app-report-kpi-customer',
  templateUrl: './report-kpi-customer.component.html',
  styles: []
})
export class ReportKPICustomerComponent extends BaseComponent implements OnInit {
  constructor(protected messageService: MessageService,
    private hubService: HubService,
    private reportService: ReportService,
    public permissionService: PermissionService,
    public router: Router,
    private provinceService: ProvinceService,
    private customerService: CustomerService
  ) {
    super(messageService, permissionService, router);
  }

  // Page
  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportResultBusiness.name;
  //

  // Modal
  bsModalRef: BsModalRef;
  //

  // Data
  rowPerPage = 10;
  totalRecords: number;
  cols: any = [
    { field: 'id', header: 'STT' },
    { field: 'code', header: 'Mã KH' },
    { field: 'name', header: 'Tên KH' },
    { field: 'taxCode', header: 'Mã số thuế' },
    { field: 'phoneNumber', header: 'Số ĐT' },
    { field: 'totalShipment', header: 'Số đơn đã tạo ' },
    { field: 'totalShipmentReal', header: 'Số đơn đã gửi' },
    { field: 'totalComplete', header: 'Tổng giao thành công' },
    { field: 'totalReturn', header: 'Tổng hàng hoàn' },
    { field: 'totalDeliveredOnTime', header: 'Tổng giao đúng hạn' },
    { field: 'ratioCompleted', header: 'Tỉ lệ giao thành công' },
    { field: 'ratioReturn', header: 'Tỉ lệ hàng hoàn' },
    { field: 'ratioOnTime', header: 'Tỉ lệ giao đúng hạn ' },
    { field: 'totalPriceAll', header: 'Doanh thu' },
    { field: 'totalIncidents', header: 'Tổng sự cố' },
    { field: 'totalCompensationValue', header: 'Số tiền đền bù' }
  ]
  columns: any = [
    { field: 'id', header: 'STT' },
    { field: 'code', header: 'Mã KH' },
    { field: 'name', header: 'Tên KH' },
    { field: 'taxCode', header: 'Mã số thuế' },
    { field: 'phoneNumber', header: 'Số ĐT	' },
    { field: 'totalShipment', header: 'Số đơn đã tạo' },
    { field: 'totalShipmentReal', header: 'Số đơn đã gửi' },
    { field: 'totalComplete', header: 'Tổng giao thành công' },
    { field: 'totalReturn', header: 'Tổng hàng hoàn' },
    { field: 'totalDeliveredOnTime', header: 'Tổng giao đúng hạn' },
    { field: 'ratioCompleted', header: 'Tỉ lệ giao thành công' },
    { field: 'ratioReturn', header: 'Tỉ lệ hàng hoàn' },
    { field: 'ratioOnTime', header: 'Tỉ lệ giao đúng hạn' },
    { field: 'totalPriceAll', header: 'Doanh thu' },
    { field: 'totalIncidents', header: 'Tổng sự cố' },
    { field: 'totalCompensationValue', header: 'Số tiền đền bù' }
  ];
  datasource: ReportKPICustomer[];
  listData: ReportKPICustomer[];
  event: LazyLoadEvent;

  // Dropdown
  hubs: SelectModel[];
  selectedHub: number;

  selectedCustomer: number;
  customer: any;
  customers: SelectModel[];
  filteredCustomers: any;
  //
  selectedDateFrom: any;
  selectedDateTo: any;
  // Date
  public dateRange = {
    start: moment(),
    end: moment()
  }
  //

  ngOnInit() {
    this.selectedDateFrom = this.dateRange.start.add(0, 'd').toDate();
    this.selectedDateTo = this.dateRange.end.toDate();

    this.loadShipment();
    this.loadFilter();
  }

  refresh() {
    this.loadShipment();
  }

  //#region Load data
  async loadShipment() {
    let x = await this.reportService.getReportKPICustomer(this.selectedDateFrom, this.selectedDateTo, this.selectedHub);
    this.datasource = x as ReportKPICustomer[];
    this.totalRecords = this.datasource.length;
    this.listData = this.datasource.slice(0, this.rowPerPage);
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;

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
        //End Custom filter

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows.slice(event.first, event.first + parseInt(event.rows.toString()));
        this.totalRecords = filterRows.length;
      }
    }, 250);
  }
  //#endregion

  //#region Filter
  loadFilter() {
    this.loadHub();
  }

  async loadHub() {
    this.hubs = await this.hubService.getAllHubSelectModelAsync();
  }

  changeFilter() {
  }

  public eventLog = '';

  public selectedDate() {
    this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
    this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += '\nEvent Fired: ' + e.event.type;
  }

  // Customer
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
          this.selectedCustomer = obj.id;
          this.loadShipment();
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
              this.selectedCustomer = findCus.value;
              this.customer = findCus.label;
            }
            else {
              this.selectedCustomer = null
            }
            this.loadShipment();
          } else {
            this.selectedCustomer = null;
            this.loadShipment();
          }
        }
      );
    } else {
      this.selectedCustomer = null;
      this.loadShipment();
    }
  }
  //
  //#endregion

  // public async exportCSV() {

  //   await this.getGeneralInfoAsync();
  //   await this.getCustomerById(this.dataModalVanDonTheoBangKe.customerId);

  //   let datas: any[] = [];
  //   let cuocPhibanDau: number = 0;
  //   let ppxd: number = 0;
  //   let cod: number = 0;

  //   datas.push([this.generalInfo.companyName.toUpperCase()])
  //   datas.push([this.generalInfo.hotLine])
  //   datas.push([""]);
  //   datas.push([this.txtNote]);
  //   datas.push([""]);
  //   datas.push(["Tên khách hàng: " + (this.customerInfo.companyName ? this.customerInfo.companyName : this.customerInfo.name)]);
  //   datas.push(["MST: " + this.customerInfo.taxCode]);
  //   datas.push(["Điện thoại: " + this.customerInfo.phoneNumber + " / Fax: " + this.customerInfo.fax]);

  //   datas.push([
  //     "STT", "MÃ VẬN ĐƠN", "NGÀY GỬI", "TÊN NGƯỜI NHẬN", "ĐỊA CHỈ NHẬN", "SĐT NGƯỜI NHẬN", "T LƯỢNG" + environment.unit, "COD", "Ngày giao thành công"
  //   ])

  //   let i = 0;
  //   this.listShipment.forEach(item => {
  //     cuocPhibanDau += item.defaultPrice;
  //     ppxd += item.fuelPrice;
  //     cod += item.cod;

  //     let date = new Date(item["createdWhen"]).toLocaleDateString("vi");
  //     datas.push([
  //       i + 1, item.shipmentNumber, moment(item.orderDate).format(environment.formatDate), item.receiverName, (item.addressNoteTo ? item.addressNoteTo + " - " : "") + item.shippingAddress, item.receiverPhone, item.weight, item.cod, item.endDeliveryTime
  //     ])
  //     i++;
  //   })

  //   datas.push(["", "", "", "", "", "", "CỘNG COD", cod])
  //   datas.push(["(Bằng chữ: " + this.convertNumberToText.DocTienBangChu(cod) + " đồng.)"])

  //   let date = new Date(this.dataModalVanDonTheoBangKe["createdWhen"]);
  //   datas.push([
  //     "", "", "", "", "", "", "", ".....,ngày " + date.getDay() + " tháng " + date.getMonth() + " năm " + date.getFullYear()
  //   ])

  //   datas.push(["", "", "", "", "", "", "", "", "KẾ TOÁN"])
  //   datas.push([""])
  //   datas.push([""])
  //   datas.push([""])
  //   datas.push(["", "", "", "", "", "", "", "", this.dataModalVanDonTheoBangKe["userCreated"]["fullName"]])

  //   const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(datas);

  //   /* generate workbook and add the worksheet */
  //   const wb: XLSX.WorkBook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  //   /* save to file */
  //   const wbout: string = XLSX.write(wb, this.wopts);
  //   saveAs(new Blob([s2ab(wbout)]), this.fileName);
  // }
}


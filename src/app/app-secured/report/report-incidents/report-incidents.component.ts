import { Component, OnInit } from '@angular/core';

import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { LazyLoadEvent } from 'primeng/primeng';
import { HubService, ReportService, CustomerService, ProvinceService, UserService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Customer, User } from '../../../models/index';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SelectModel } from '../../../models/select.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { ReportLadingSchedule } from '../../../models/reportLadingSchedule.model';
import { ReportIncidentsFilter } from '../../../models/ReportIncidentsFilter.model';
import { ReportIncidents } from '../../../models/reportIncidents.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';

@Component({
  selector: 'app-report-incidents',
  templateUrl: './report-incidents.component.html',
  styles: []
})
export class ReportIncidentsComponent extends BaseComponent implements OnInit {
  constructor(protected messageService: MessageService,
    private hubService: HubService,
    private reportService: ReportService,
    public permissionService: PermissionService,
    public router: Router,
    private provinceService: ProvinceService,
    private customerService: CustomerService,
    private userService: UserService
  ) {
    super(messageService, permissionService, router);
  }

  // Page
  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.reportIncidents.name;
  //

  // Modal
  bsModalRef: BsModalRef;
  //

  // Data
  columns: [
    { field: 'fromProvinceName', header: 'Từ tỉnh' },
    { field: 'toProvinceName', header: 'Đến tỉnh' },
    { field: 'customerTypeName', header: 'Loại khách hàng' },
    { field: 'shipmentNumber', header: 'Số vận đơn' },
    { field: 'orderDate', header: 'Ngày vận đơn' },
    { field: 'thoiGianNhapKho', header: 'Thời gian nhập kho(nhận)' },
    { field: 'thoiGianXuatKho', header: 'Thời gian xuất kho(giao)' },
    { field: 'deliverUserName', header: 'Nhân viên giao hàng' },
    { field: 'realRecipientName', header: 'Tên người nhận' },
    { field: 'endDeliveryTime', header: 'Thời gian giao hàng Hình ảnh' },
    { field: 'isReturn', header: 'Hoàn trả hàng' },
    { field: 'shipmentTypeName', header: 'Chuyển hoàn chứng từ' },
    { field: 'relativeShipmentNumber', header: 'Vận đơn liên quan' },
    { field: 'maBangKeTienCuocDaNop', header: 'Tiền cước đã nộp' },
    { field: 'maBangKeCODDaNop', header: 'COD đã nộp' },
    { field: 'deliveryDate', header: 'Deadline giao hàng' },
    { field: 'kPI', header: 'KPI' }
  ];

  lstData: ReportIncidents[] = [];
  totalCount: number = 0;
  filterModel: ReportIncidentsFilter = new ReportIncidentsFilter();

  // Dropdown
  customer: any;
  filteredCustomers: any;
  customers: SelectModel[];

  employee: any;
  employees: any;
  filteredEmployees: any;
  selectedEmployee: number;

  employee_2: any;
  employees_2: any;
  filteredEmployees_2: any;
  selectedEmployee_2: number;
  //

  // Date
  public dateRange = {
    start: moment(),
    end: moment()
  }
  //

  ngOnInit() {
    this.filterModel.fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    this.filterModel.toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    this.loadData();
  }

  refresh() {
    this.filterModel = new ReportIncidentsFilter();
    this.loadData();
  }

  //#region Load data
  async loadData() {
    this.lstData = await this.reportService.getReportIncidents(this.filterModel) || [];
    this.totalCount = this.lstData.length > 0 ? this.lstData[0].totalCount : 0;
  }

  async changeFilter() {
    this.filterModel.pageNumber = 1;
    this.filterModel.pageSize = 20;

  }

  onPageChange(event: any) {
    this.filterModel.pageNumber = event.first / event.rows + 1;
    this.filterModel.pageSize = event.rows;
    this.loadData();
  }
  //#endregion

  //#region Filter
  public eventLog = '';

  public selectedDate() {
    this.filterModel.fromDate = SearchDate.formatToISODate(moment(this.filterModel.fromDate).toDate());
    this.filterModel.toDate = SearchDate.formatToISODate(moment(this.filterModel.toDate).toDate());
    this.changeFilter();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += '\nEvent Fired: ' + e.event.type;
  }

  // customer
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
          this.filterModel.customerId = obj.id;
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
              this.filterModel.customerId = findCus.value;
              this.customer = findCus.label;
            }
            else {
              this.filterModel.customerId = null
            }
          } else {
            this.filterModel.customerId = null;
          }
        }
      );
    } else {
      this.filterModel.customerId = null;
      this.changeFilter();
    }
  }
  //

  // filter Employee 2
  async filterEmployee_2(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees_2 = [];
      this.filteredEmployees_2 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_2.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedEmployee_2() {
    let cloneSelectedUser = this.employee_2;
    let index = cloneSelectedUser.indexOf(" -");
    let users: any;
    if (index !== -1) {
      users = cloneSelectedUser.substring(0, index);
      cloneSelectedUser = users;
    }
    this.employees_2.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel.handleEmpId = x.value;
        }
      }
    });
  }

  async keyTabEmployee_2(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees_2 = [];
      this.filteredEmployees_2 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_2.push(`${m.code} ${m.name}`);
      });
      let findCus: SelectModel = null;
      if (this.employees_2.length == 1) {
        findCus = this.employees_2[0];
      } else {
        findCus = this.employees_2.find(f => f.data.code == value || f.label == value);
      }
      if (findCus) {
        this.filterModel.handleEmpId = findCus.data.id;
        this.employee_2 = findCus.label;
      }
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
  }
  //

  // filter Employee
  async filterEmployee(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees = [];
      this.filteredEmployees = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedEmployee() {
    let cloneSelectedUser = this.employee;
    let index = cloneSelectedUser.indexOf(" -");
    let users: any;
    if (index !== -1) {
      users = cloneSelectedUser.substring(0, index);
      cloneSelectedUser = users;
    }
    this.employees.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel.incidentEmpId = x.value;
        }
      }
    });
  }

  async keyTabEmployee(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees = [];
      this.filteredEmployees = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      });
      let findCus: SelectModel = null;
      if (this.employees.length == 1) {
        findCus = this.employees[0];
      } else {
        findCus = this.employees.find(f => f.data.code == value || f.label == value);
      }
      if (findCus) {
        this.filterModel.incidentEmpId = findCus.data.id;
        this.employee = findCus.label;
      }
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
  }
  //
  //#endregion
}

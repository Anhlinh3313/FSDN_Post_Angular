import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { MessageService, LazyLoadEvent } from 'primeng/primeng';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import {  UserService, ShipmentService, HubService, AuthService, } from '../../../services';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { environment } from '../../../../environments/environment';

import * as moment from "moment";
import { SelectModel } from '../../../models/select.model';
import { User, Shipment, Hub, Package } from '../../../models';
import { ListGoods } from '../../../models/listGoods.model';
import { ListGoodsTypeHelper } from '../../../infrastructure/listGoodsType.helper';
// import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { GeneralInfoModel } from '../../../models/generalInfo.model';
// import { GeneralInfoService } from '../../../services/generalInfo.service';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
// import { PaymentTypeHelper } from '../../../infrastructure/paymentType.helper';
// import { PrintHelper } from '../../../infrastructure/printHelper';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
// import { InputValue } from '../../../infrastructure/inputValue.helper';
// import { FilterUtil } from '../../../infrastructure/filter.util';
// import { ShipmentFilterViewModel } from '../../../models/shipmentFilterViewModel';
// import { ExportAnglar5CSV } from '../../../infrastructure/exportAngular5CSV.helper';
// import { throwError } from 'rxjs';

@Component({
  selector: 'app-management-edit-cod',
  templateUrl: './management-edit-cod.component.html',
  styles: []
})
export class ManagementEditCODComponent extends BaseComponent implements OnInit {

 
  // Page
  rowPerPage: number = 20; 
  parentPage: string = Constant.pages.shipment.name;
  currentPage: string = Constant.pages.shipment.children.managementEditCOD.name;
  infoGeneral = environment;
  //
  // Calendar
  fromDate: any = moment(new Date()).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
  toDate: any = moment(new Date()).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");

 
  listTypeIssues: SelectModel[] = [{ value: 100, label: '-- Tất cả --' },
  { value: 3, label: 'Xuất kho giao hàng' },
  { value: 10, label: 'Xuất kho trả hàng' },
  { value: 8, label: 'Xuất kho trung chuyển' }];
  //

  // Filter
  lstUsers: SelectModel[];
  selectedUser: number;
  selectedUser_2: number;
  listgoodDataView: ListGoods = new ListGoods();

  hub: any;
  hubs: any;
  filteredHubs: any;
  selectedHub: number;

  employee: any;
  employees: any;
  filteredEmployees: any;
  selectedEmployee: number;

  employee_2: any;
  employees_2: any;
  filteredEmployees_2: any;
  selectedEmployee_2: number;
  //
  employee_All: any;
  employees_All: any;
  filteredEmployees_All: any;
  selectedEmployee_All: number;
  // Print
  itemShipment: any = [];
  idPrint: string;
  fromHub: string;
  currentUser: User;
  generalInfo: GeneralInfoModel;
  dateCreate: any;
  totalCalWeight: number;
  totalWeight: number;
  totalSumPrice: any;
  totalBox: number;
  stt: number;
  itemShipmentLAT: any;

  listShipment: Shipment[] = [];
  listPackage: Package[] = [];

  totalRecords: number = 0;
  bsModalRef: BsModalRef;
  //

  // Data
  filterModel = {
    typeId: 3,
    createByHubId: null,
    fromHubId: null,
    toHubId: null,
    userId: null,
    statusId: null,
    transportTypeId: null,
    tplId: null,
    dateFrom: this.fromDate,
    dateTo: this.toDate,
    listGoodsCode: null,
    pageNumber: 1,
    pageSize: 20
  };
  datasource: ListGoods[];
  lstData: ListGoods[];
  selected_lstData: ListGoods[];
  totalCount: number = 0;

  datasourceReturn: ListGoods[];
  lstDataReturn: ListGoods[];
  selected_lstDataReturn: ListGoods[];
  totalCountReturn: number = 0;

  lstData_2: ListGoods[];
  datasource_2: ListGoods[];
  selected_lstData2: ListGoods[];
  totalCount_2: number = 0;

  datasource_3: ListGoods[];
  lstData_3: ListGoods[];
  selected_lstData3: ListGoods[];
  totalCount_3: number = 0;
  event_2: LazyLoadEvent;
  event_All: LazyLoadEvent;
  event: LazyLoadEvent;
  event_3: LazyLoadEvent;
  //
  selectedListGoods: ListGoods[];
  lstData_All: ListGoods[];
  datasource_All: ListGoods[];
  totalCount_All: number = 0;
  textDate: string;
  textUser: string;
  eventLog: string;
  //

  constructor(
    protected messageService: MessageService,
    private daterangepickerOptions: DaterangepickerConfig, 
    public permissionService: PermissionService,
    public router: Router,
    private userService: UserService,
    private authService: AuthService,
    // private printFrormServiceInstance: PrintFrormServiceInstance,
    // private generalInfoService: GeneralInfoService,
    // private departmentService: DepartmentService,
    private shipmentService: ShipmentService,
    private hubService: HubService,
    // private packageSerive: PackageService,
    // private modalService: BsModalService
  ) {
    super(messageService, permissionService, router);
    // dateRangePicker
    this.daterangepickerOptions.settings = {
      locale: { format: environment.formatDate },
      alwaysShowCalendars: false,
      ranges: {
        "Hôm nay": [moment().subtract(0, "day"), moment()],
        "1 tuần": [moment().subtract(7, "day"), moment()],
        "1 tháng trước": [moment().subtract(1, "month"), moment()],
        "3 tháng trước": [moment().subtract(4, "month"), moment()],
        "6 tháng trước": [moment().subtract(6, "month"), moment()],
        "12 tháng trước": [moment().subtract(12, "month"), moment()],
        "2 năm trước": [moment().subtract(24, "month"), moment()]
      }
    };
  }

  async ngOnInit() {
    await this.loadFilter();
    this.authService.getAccountInfoAsync().then(
      currentUser => {
        this.filterModel.createByHubId = currentUser.hubId;
        this.filterModel.fromHubId = currentUser.hubId;
        this.loadData();
      });
  }

  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }

  //#region Tab 1
  refresh() {
    // this.filterModel.userId = null;
    // this.filterModel.dateFrom = this.fromDate;
    // this.filterModel.dateTo = this.toDate;
    // this.filterModel.listGoodsCode = null;
    this.loadData();
  }

  // Load data
  async loadData() { 
  } 
  loadLazy(event: LazyLoadEvent) {
    // this.event = event;
    // setTimeout(() => {
    //   if (this.datasource) {
    //     var filterRows;
    //     if (event.filters.length > 0)
    //       filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
    //     else
    //       filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

    //     filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
    //     this.lstData = filterRows.slice(event.first, (event.first + event.rows));
    //     this.totalCount = filterRows.length;
    //   }
    // }, 250);
  }

  // Load filter
  async loadFilter() {
    this.loadUser();
    this.loadCurrentUser(); 
  }

  async loadUser() {
    this.lstUsers = await this.userService.getSelectModelAllUserByCurrentHubAsync();
  }
 
 
  async loadCurrentUser() {
    let cols = [
      Constant.classes.includes.user.hub,
      Constant.classes.includes.user.department
    ];

    await this.userService.getAsync(this.authService.getUserId(), cols).then(x => {
      if (!x) return;
      this.currentUser = x as User;
      this.fromHub = this.currentUser.hub.name;
    });
  }

  //

  // Calendar
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public selectedDate() {
    this.filterModel.dateFrom = SearchDate.formatToISODate(moment(this.filterModel.dateFrom).toDate());
    this.filterModel.dateTo = SearchDate.formatToISODate(moment(this.filterModel.dateTo).toDate());
    this.loadData();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  } 

  // Calendar
  public mainInput_2 = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  
  //filter Hub
  async filterHub(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.hubService.getHubSearchByValueAsync(value, null)
      this.hubs = [];
      this.filteredHubs = [];
      let data = (x as Hub[]);
      Promise.all(data.map(m => {
        this.hubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredHubs.push(`${m.code} ${m.name}`);
      }));
      this.hubs.push({ value: null, label: `-- Tất cả --`, data: null })
      this.filteredHubs.push(`-- Tất cả --`);
    }
  }

  onSelectedHub() {
    let cloneSelectedUser = this.hub;
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    // this.hubs.forEach(x => {
    //   let obj = x.label;
    //   if (obj) {
    //     if (cloneSelectedUser === obj) {
    //       this.filterModel_2.toHubId = x.value;
    //       this.loadData_2();
    //     }
    //   }
    // });
  }

  onSelectedHub_All() {
    let cloneSelectedUser = this.hub;
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    // this.hubs.forEach(x => {
    //   let obj = x.label;
    //   if (obj) {
    //     if (cloneSelectedUser === obj) {
    //       this.filterModel_All.toHubId = x.value;
    //       this.loadData_All();
    //     }
    //   }
    // });
  }

 

  // filter Employee
  async filterEmployee(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees = [];
      this.filteredEmployees = [];
      let data = (x as User[]);
      Promise.all(data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      }));
      this.employees.push({ value: null, label: `-- Tất cả --`, data: null })
      this.filteredEmployees.push(`-- Tất cả --`);
    }
  }

  onSelectedEmployee() {
    let cloneSelectedUser = this.employee;
    // let index = cloneSelectedUser.indexOf(" -");
    // let users: any;
    // if (index !== -1) {
    //   users = cloneSelectedUser.substring(0, index);
    //   cloneSelectedUser = users;
    // }
    this.employees.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel.userId = x.value;
          this.loadData();
        }
      }
    });
  }

}
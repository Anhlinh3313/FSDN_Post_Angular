import { Component, OnInit } from "@angular/core";
import { Constant } from "../../../infrastructure/constant";
import { Daterangepicker } from "ng2-daterangepicker";
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
import { environment } from "../../../../environments/environment";
import { SelectItem, SelectItemGroup, LazyLoadEvent } from "primeng/primeng";
import {
  ShipmentService,
  ReportService,
  HubService,
  AuthService,
  UserService,
  CustomerService
} from "../../../services";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { MessageService } from "../../../../../node_modules/primeng/components/common/messageservice";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "../../../../../node_modules/@angular/router";
import { User, Hub, Shipment, Customer } from "../../../models";
import { FilterUtil } from "../../../infrastructure/filter.util";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { Table } from "../../../../../node_modules/primeng/table";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { SelectModel } from "../../../models/select.model";

@Component({
  selector: "app-report-cancel-shipment",
  templateUrl: "./report-cancel-shipment.component.html",
  styles: []
})
export class ReportCancelShipmentComponent extends BaseComponent
  implements OnInit {
  wopts: XLSX.WritingOptions = { bookType: "xlsx", type: "binary" };
  fileName: string = "ReportCancelShipments.xlsx";
  searchText: string;
  listData: Shipment[];
  datasource: Shipment[];
  totalRecords: number = 0;
  totalRecevice: number = 0;
  hubItemGroups: SelectItemGroup[];
  selectedHub: number;
  hubSelectItems: SelectItem[];
  environment = environment;
  pageNum = 1;
  rowPerPage: number = 20;
  listEmps: SelectItem[];
  selectedEmp: number;
  parentPage: string = Constant.pages.report.name;
  currentPage: string = Constant.pages.report.children.cancelShipment.name;

  mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };
  eventLog = "";
  selectedDateFrom: any;
  selectedDateTo: any;
  event: LazyLoadEvent;
  filterRows: Shipment[];

  employee: any;
  employees: any;
  filteredEmployees: any;
  selectedEmployee: number;
  //
  selectedCustomer: number;
  selectedCustomerType: number;
  customers: SelectModel[];
  filteredCustomers: any;
  customer: any;

  public dateRange = {
    start: moment(),
    end: moment()
  }
  //
  constructor(
    private userService: UserService,
    private daterangepickerOptions: DaterangepickerConfig,
    private shipmentService: ShipmentService,
    private reportService: ReportService,
    private hubService: HubService,
    private authService: AuthService,
    protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected customerService: CustomerService,
    protected router: Router
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

  ngOnInit() {
    this.selectedDateFrom = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    this.selectedDateTo = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    this.initData();
  }

  initData() {
    this.loadAllHubs();
    this.loadReportCancelShipment();
  }

  async loadAllHubs() {
    this.hubItemGroups = [];
    this.hubSelectItems = [];
    let curentHub: Hub = null;
    const currentUser: User = await this.authService.getAccountInfoAsync();
    if (currentUser.hub) {
      curentHub = currentUser.hub;
    }
    const hubs: Hub[] = await this.hubService.getAllAsync();
    if (hubs) {
      hubs.forEach(element => {
        if (element.centerHubId && element.poHubId) {
          // get SelectItemHubs with tag Title
          this.hubSelectItems.push({
            label: element.name,
            value: element.id,
            title: element.centerHubId.toString()
          });
        }
      });
    }
    let groupOfCenterHubs = this.hubSelectItems.reduce(
      (outData, item) =>
        // group all Hubs by title
        Object.assign(outData, {
          [item.title]: (outData[item.title] || []).concat(item)
        }),
      []
    );
    let centerHubs = [];
    hubs.map(x => {
      if (!x.centerHubId) {
        centerHubs.push(x);
        return x;
      }
    });
    centerHubs.forEach(x => {
      groupOfCenterHubs.forEach((y, index) => {
        if (x.id == y[0].title) {
          let hubs = y.filter(e => e.value);
          hubs.push({
            label: x.name,
            value: x.id,
            title: null
          });
          //
          this.hubItemGroups.push({
            label: `-- ${x.name} --`,
            items: hubs
          });
        }
      });
    });
  }

  async loadReportCancelShipment() {
    const res = await this.reportService.getReportCancelShipmentAsync(
      this.selectedHub,
      this.selectedEmp,
      this.selectedCustomer,
      this.selectedDateFrom,
      this.selectedDateTo,
      this.searchText,
      this.rowPerPage,
      this.pageNum
    );
    if (res) {
      const data = res.data as Shipment[];
      this.datasource = data.reverse();
      this.listData = this.datasource;
      this.totalRecords = res.dataCount;
      this.sumTotalReceive();
    }
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;

        this.filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = this.filterRows;
        // this.totalRecords = this.filterRows.length;
      }
    }, 250);
  }

  onPageChange(event: any) {
    this.pageNum = event.first / event.rows + 1;
    this.rowPerPage = event.rows;
    this.loadReportCancelShipment();
  }

  search(value) {
    this.searchText = value;
    this.loadReportCancelShipment();
  }

  public selectedDate() {
    this.selectedDateFrom = SearchDate.formatToISODate(moment(this.selectedDateFrom).toDate());
    this.selectedDateTo = SearchDate.formatToISODate(moment(this.selectedDateTo).toDate());
    this.pageNum = 1;
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  async onChangeHub() {
    this.loadEmpByHubId();
  }

  async loadEmpByHubId() {
    this.pageNum = 1;
    const data = await this.userService.getSelectModelAllEmpByHubIdAsync(this.selectedHub);
    if (data) {
      this.listEmps = data as SelectItem[];
    }
  }

  onChangeEmps() {
    this.pageNum = 1;
  }
  exportCSV(dt: Table) {
    let data: any[] = [];
    data.push([
      "Mã NV hủy",
      "Tên NV hủy",
      "Trạm hủy",
      "Mã vận đơn",
      "TG hủy",
      "Mã bill tổng",
      "Ngày tạo",
      "Yêu cầu phục vụ",
      "Ngày gửi",
      "HTTT",
      "Dịch vụ",
      "Cước chính",
      "PPXD",
      "VSVX",
      "Phí DVGT",
      "VAT",
      "Tổng cước",
      "NV gửi",
      "Tên người gửi",
      "Đt gửi",
      "CTY gửi",
      "Địa chỉ gửi",
      "Tỉnh đi",
      "Trạm lấy",
      "Tuyến lấy",
      "Tên người nhận",
      "Đt nhận",
      "CTY nhận",
      "Địa chỉ nhận chi tiết",
      "Địa chỉ nhận",
      "Tên người nhận thực tế",
      "TG giao hàng",
      "Tỉnh đến",
      "Trạm giao",
      "Tuyến giao"
    ]);

    this.datasource.map((shipment) => {
      let ship: Shipment = Object.assign({}, shipment);
      ship.deletedShipmentAt = SearchDate.formatDate(shipment.deletedShipmentAt);
      ship.createdWhen = SearchDate.formatDate(shipment.createdWhen);
      ship.orderDate = SearchDate.formatDate(shipment.orderDate);
      ship.endDeliveryTime = SearchDate.formatDate(shipment.endDeliveryTime);
      data.push([
        ship.userCode,
        ship.userFullName,
        ship.userHubName,
        ship.shipmentNumber,
        ship.deletedShipmentAt,
        ship.requestShipmentId,
        ship.createdWhen,
        ship.cusNote,
        ship.orderDate,
        ship.paymentTypeName,
        ship.serviceName,
        ship.defaultPrice,
        ship.fuelPrice,
        ship.remoteAreasPrice,
        ship.totalDVGT,
        ship.vatPrice,
        ship.totalPrice,
        ship.deliverUserName,
        ship.senderName,
        ship.senderPhone,
        ship.companyFrom,
        ship.pickingAddress,
        ship.fromProvinceName,
        ship.fromHubName,
        ship.fromHubRoutingName,
        ship.receiverName,
        ship.receiverPhone,
        ship.companyTo,
        ship.addressNoteTo,
        ship.shippingAddress,
        ship.realRecipientName,
        ship.endDeliveryTime,
        ship.toProvinceName,
        ship.toHubName,
        ship.toHubRoutingName,
      ]);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const wbout: string = XLSX.write(wb, this.wopts);
    saveAs(new Blob([InputValue.s2ab(wbout)]), this.fileName);
  }

  refresh() {
    this.selectedCustomer = null;
    this.selectedHub = null;
    this.selectedEmp = null;
    this.pageNum = 1;
    this.searchText = null;
    this.loadReportCancelShipment();
  }
  sumTotalReceive() {
    this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
      return priceKeeping += ((shipment.cod ? shipment.cod : 0) + shipment.totalPrice);
    }, 0)
  }

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
          this.selectedEmp = x.value;
          this.onChangeEmps();
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
        this.selectedEmp = findCus.data.id;
        this.employee = findCus.label;
      }
      this.onChangeEmps();

    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
  }
  //customer
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
          this.selectedCustomer = obj.id
          this.loadReportCancelShipment();
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
            this.loadReportCancelShipment();
          } else {
            this.selectedCustomer = null;
            this.loadReportCancelShipment();
          }
        }
      );
    } else {
      this.selectedCustomer = null;
      this.loadReportCancelShipment();
    }
  }
  onClearCustomer() {
    this.selectedCustomer = null;
    this.loadReportCancelShipment();
  }
}

import { Component, OnInit, TemplateRef } from "@angular/core";

import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  UserService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import {
  User,
  ListReceiptMoney,
  Hub,
  ListReceiptMoneyStatus,
  DataPrint
} from "../../../models/index";
import {
  ListReceiptMoneyViewModel,
  DateRangeFromTo
} from "../../../view-model/index";
import { ListReceiptMoneyService } from "../../../services/receiptMoney.service.";
import { ShipmentEmployeeKeeping } from "../../../models/shipmentEmployeeKeeping";
import { ListReceiptMoneyTypeHelper } from "../../../infrastructure/listReceiptMoneyTypeHelper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ReceiveMoneyDetailComponent } from "../receive-money-detail/receive-money-detail.component";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { SelectModel } from "../../../models/select.model";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { PrintHelper } from "../../../infrastructure/printHelper";
declare var jQuery: any;

@Component({
  selector: "app-receive-money-from-rider",
  templateUrl: "receive-money-from-rider.component.html",
  styles: []
})
export class ReceiveMoneyFromRiderComponent extends BaseComponent
  implements OnInit {
  isCheckCreateLSRM: boolean;
  txtShipmentNumber: string;
  first: number = 0;
  txtCreatedDate: any;
  txtNote: any;
  txtFilterGb: any;
  txtFilterGbRight: any;
  txtFilterGbLeft: any;
  stt: number = 0;
  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    private listReceiptMoneyService: ListReceiptMoneyService,
    private userService: UserService,
    public permissionService: PermissionService,
    public router: Router,
    private printFrormServiceInstance: PrintFrormServiceInstance,
  ) {
    super(messageService, permissionService, router);
  }

  //Data  
  idPrint: string;

  parentPage: string = Constant.pages.receiptMoney.name;
  currentPage: string = Constant.pages.receiptMoney.children.receiveMoneyFromRider.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: ShipmentEmployeeKeeping[];
  selectedDataRight: ShipmentEmployeeKeeping[];
  listData: ShipmentEmployeeKeeping[];
  clonelistData: ShipmentEmployeeKeeping[];
  listDataRight: ShipmentEmployeeKeeping[];
  cloneListDataRight: ShipmentEmployeeKeeping[];
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "shipmentNumber",
    "createdWhen",
    "codKeeping",
    "totalPriceKeeping",
    "senderName",
    "serviceName",
    "paymentTypeName",
    "shipmentStatusName",
    "code",
    "listReceiptMoneyStatus.name",
    "paidByEmp.fullName",
    "totalPrice",
    "totalCOD",
    "grandTotal",
    "userCreated.fullName",
    "createdWhen",
    "userModified.fullName",
    "modifiedWhen"
  ];
  datasource: ShipmentEmployeeKeeping[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  hubs: SelectItem[];
  selectedHub: Hub;
  //
  employee: any;
  employees: any;
  filteredEmployees: any;
  selectedEmployee: number;
  //
  //============================
  //BEGIN Danh sách bảng kê thu tiền nhân vien
  //============================
  selectedStatusLRM: ListReceiptMoneyStatus;
  rowPerPageLRM: 10;
  totalRecordsLRM: number;
  columnsLRM: string[] = [
    "code",
    "createdWhen",
    "listReceiptMoneyStatus.name",
    "paidByEmp.fullName",
    "totalPrice",
    "totalCOD",
    "grandTotal",
    "userCreated.fullName",
    "createdWhen",
    "userModified.fullName",
    "modifiedWhen"
  ];
  toalMoneyLRM: number = 0;
  datasourceLRM: ListReceiptMoney[];
  listDataLRM: ListReceiptMoney[];
  eventLRM: LazyLoadEvent;
  statuesLRM: SelectItem[];

  totalRecevice: number = 0;
  totalReceviceRight: number = 0;

  listReceiptMoneyViewModel: ListReceiptMoneyViewModel = new ListReceiptMoneyViewModel()

  public dateRangeLRM = {
    start: moment(),
    end: moment()
  };
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  selectedDateTo: Date;
  selectedDateFrom: Date;
  //============================
  //END Danh sách bảng kê thu tiền nhân vien
  //============================
  ngOnInit() {
    this.initData();
  }

  initData() {
    // this.loadShipment();
    this.listDataRight = [];
    this.loadListReceitMoney();
  }
  loadShipment() {
    this.listReceiptMoneyService
      .getListShipmentKeepingByEmployee(this.selectedEmployee)
      .subscribe(x => {
        let shipments = x.data as ShipmentEmployeeKeeping[];
        this.datasource = shipments;
        this.totalRecords = this.datasource.length;
        // this.listData = this.datasource.slice(0, this.rowPerPage);
        this.listData = this.datasource;
        this.clonelistData = this.listData;
        this.sumTotalReceive();
      });
    //refresh
    this.txtFilterGbLeft = null;
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
    this.employees.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.selectedEmployee = x.value;
          this.loadShipment();
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
        this.selectedEmployee = findCus.data.id;
        this.employee = findCus.label;
      }
      this.loadShipment();

    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
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

  sumTotalReceive() {
    this.totalRecevice = this.listData.reduce((priceKeeping, shipment) => {
      return priceKeeping += (shipment.totalPriceKeeping + shipment.codKeeping);
    }, 0)
  }

  sumTotalReceiveRight() {
    this.totalReceviceRight = this.listDataRight.reduce((priceKeeping, shipment) => {
      return priceKeeping += (shipment.totalPriceKeeping + shipment.codKeeping);
    }, 0)
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

        if (this.selectedDateFrom && this.selectedDateTo) {
          //
          filterRows = filterRows.filter(x => {
            return moment(x.createdWhen).isBetween(this.selectedDateFrom, this.selectedDateTo)
          });
        } else if (this.selectedDateFrom) {
          filterRows = filterRows.filter(x => moment(x.createdWhen).isAfter(this.selectedDateFrom));
        } else if (this.selectedDateTo) {
          filterRows = filterRows.filter(x => moment(x.createdWhen).isBefore(this.selectedDateTo));
          //
        }

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        // this.listData = filterRows.slice(event.first, event.first + event.rows);
        this.listData = filterRows;
        this.totalRecords = filterRows.length;

        this.sumTotalReceive();

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }
  changeRider() {
    // this.loadShipment(
    //   this.selectedRider == null ? undefined : this.selectedRider.id
    // );
    Array.prototype.push.apply(this.datasource, this.listDataRight);
    this.loadLazy(this.event);
    this.listDataRight = [];

    this.sumTotalReceive();
    this.sumTotalReceiveRight();
  }

  refresh() {
    this.loadShipment();
    this.listDataRight = [];
    this.selectedHub = null;
    this.selectedEmployee = null;
    this.employee = null;
    if (this.bsModalRef) this.bsModalRef.hide();

    //refresh
    this.txtFilterGbRight = null;
    this.txtNote = null;
  }

  save() {
    // console.log(this.listDataRight);
    if (!this.listDataRight.length) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      return;
    }
    if (!this.selectedEmployee) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    }

    let shipments = [];
    let model = new ListReceiptMoneyViewModel();
    model.paidByEmpId = this.selectedEmployee;
    shipments = this.listDataRight.map(function (x) {
      return {
        id: x.id,
        cOD: x.keepingCODEmpId == model.paidByEmpId ? x.codKeeping : 0,
        totalPrice: x.totalPriceKeeping
      };
    });

    model.shipments = shipments;
    model.note = this.txtNote;

    //
    this.isCheckCreateLSRM = true;
    this.listReceiptMoneyService
      .createListReceiptMoneyFromRider(model)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.refresh();
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tạo bảng kê thu tiền thành công"
        });
        this.refreshLRM();
      });

    setTimeout(() => {
      this.isCheckCreateLSRM = false;
    }, 3000);
  }

  assignAll() {
    this.listData.map(x => {
      this.assign(x);
    })
  }

  assign(rowData: ShipmentEmployeeKeeping) {
    if (!this.selectedEmployee) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      return;
    }
    //add Right 
    this.listDataRight = this.listDataRight.concat([rowData]);
    this.cloneListDataRight = this.listDataRight;
    //remove Left
    var index = this.listData.indexOf(rowData);
    this.datasource.splice(this.datasource.indexOf(rowData), 1);
    this.listData = this.listData.filter((val, i) => i != this.listData.indexOf(rowData));
    this.sumTotalReceive();
    this.sumTotalReceiveRight();
  }
  unAssign(rowData: ShipmentEmployeeKeeping) {
    //add Left 
    this.datasource.push(rowData);
    this.listData = this.listData.concat([rowData]);
    //remove Right
    this.listDataRight = this.listDataRight.filter((val, i) => i != this.listDataRight.indexOf(rowData));
    this.cloneListDataRight = this.listDataRight;
    this.sumTotalReceive();
    this.sumTotalReceiveRight();
  }
  onEnterCodeLeft($this: any) {
    if ($this.value) {
      var arrCode = $this.value.split(" ");
      arrCode.forEach(code => {
        var rowData = this.listData.find(x => x.shipmentNumber.toUpperCase() === code.toUpperCase());
        if (rowData) this.assign(rowData);
      });
      $this.value = "";
    }
  }
  onEnterCodeRight($this: any) {
    if ($this.value) {
      var arrCode = $this.value.split(" ");
      arrCode.forEach(code => {
        var rowData = this.listDataRight.find(x => x.shipmentNumber.toUpperCase() === code.toUpperCase());
        if (rowData) this.unAssign(rowData);
      });
      $this.value = "";
    }
  }
  clickRefresh(template: TemplateRef<any>) {
    if (this.listDataRight.length > 0) {
      this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
      });
      return;
    }
    this.refresh();
  }
  //======== BEGIN METHOD ListReceiveMoney =======
  loadListReceitMoney() {
    let includes: any = [];
    let includesListReceiptMoney = Constant.classes.includes.listReceiptMoney;
    for (var prop in Constant.classes.includes.listReceiptMoney) {
      includes.push(includesListReceiptMoney[prop]);
    }
    var fromDate = null;
    var toDate = null;
    if (this.dateRangeLRM) {
      fromDate = this.dateRangeLRM.start.add(0, "d").toJSON();
      toDate = this.dateRangeLRM.end.toJSON();
    }
    this.listReceiptMoneyService
      .getListByType(
        ListReceiptMoneyTypeHelper.EMPLOYEE,
        fromDate,
        toDate,
        includes
      )
      .subscribe(x => {
        let result = x.data as ListReceiptMoney[];
        this.datasourceLRM = result;
        this.totalRecordsLRM = this.datasourceLRM.length;
        this.listDataLRM = this.datasourceLRM.slice(0, this.rowPerPageLRM);
        this.listDataLRM = this.listDataLRM.sort((x, y) => {
          const a = new Date(x.orderDate);
          const b = new Date(y.orderDate);
          if (a > b) return -1;
          return 1;
        });
        if (this.datasourceLRM) {
          this.toalMoneyLRM = 0;
          this.datasourceLRM.map(m => this.toalMoneyLRM += m.grandTotal);
        }
        this.loadFilterLRM();
      });
  }
  async loadLazyListReceiveMoney(event: LazyLoadEvent) {
    this.eventLRM = event;
    setTimeout(async () => {
      if (this.datasourceLRM) {
        var filterRows;
        if (event.filters.length > 0)
          filterRows = this.datasourceLRM.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasourceLRM.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLRM)
          );
        //
        if (this.selectedStatusLRM) {
          filterRows = filterRows.filter(
            x => x.listReceiptMoneyStatusId === this.selectedStatusLRM.id
          );
        }
        // search ListGoodsByShipmentNumber
        if (this.txtShipmentNumber) {
          if (this.txtShipmentNumber.trim() === "") {
            this.messageService.add({
              severity: Constant.messageStatus.warn,
              detail: "Vui lòng nhập mã vận đơn!"
            });
          } else {
            filterRows = await this.findListGooods(this.txtShipmentNumber);
          }
        }
        // search datetime
        if (this.txtFilterGb) {
          let result = SearchDate.searchFullDate(this.txtFilterGb);
          if (result) {
            filterRows = this.datasourceLRM.filter(x =>
              FilterUtil.gbFilterFiled(x, result, this.columnsLRM)
            );
          }
          //
          let res = SearchDate.searchDayMonth(this.txtFilterGb);
          if (res) {
            filterRows = this.datasourceLRM.filter(x =>
              FilterUtil.gbFilterFiled(x, res, this.columnsLRM)
            );
          }
        }

        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listDataLRM = filterRows.slice(
          event.first,
          event.first + event.rows
        );
        this.totalRecordsLRM = filterRows.length;
      }
    }, 250);
  }
  loadFilterLRM() {
    this.selectedStatusLRM = null;
    let uniqueStatus = [];
    this.statuesLRM = [];
    this.datasourceLRM.forEach(x => {
      if (uniqueStatus.length === 0) {
        this.statuesLRM.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueStatus.indexOf(x.listReceiptMoneyStatusId) === -1 &&
        x.listReceiptMoneyStatusId
      ) {
        uniqueStatus.push(x.listReceiptMoneyStatusId);
        this.statuesLRM.push({
          label: x.listReceiptMoneyStatus.name,
          value: x.listReceiptMoneyStatus
        });
      }
    });
  }

  async findListGooods(shipmentNumber: string): Promise<ListReceiptMoney[]> {
    this.messageService.clear();
    const data = await this.listReceiptMoneyService.getListReceiptByShipmentNumberAsync(shipmentNumber);
    if (data) {
      return data;
    } else {
      shipmentNumber = null;
      this.txtShipmentNumber = null;
      return [];
    }
  }

  refreshLRM() {
    this.loadListReceitMoney();

    //refresh
    this.txtFilterGb = null;
    this.first = 0;
  }
  changeFilterLRM() {
    this.loadLazyListReceiveMoney(this.eventLRM);
  }
  lockLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.lock(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Khóa bảng kê thu tiền thành công"
      });
    });
  }
  unlockLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.unlock(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Mở khóa bảng kê thu tiền thành công"
      });
    });
  }

  openModalConfirmMoney(data, template) {
    this.listReceiptMoneyViewModel.id = data.id;

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  confirmLRM() {
    this.listReceiptMoneyService.confirm(this.listReceiptMoneyViewModel).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.listReceiptMoneyViewModel = new ListReceiptMoneyViewModel();
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Xác nhận bảng kê thu tiền thành công"
      });
    });
  }
  cancelLRM(data: ListReceiptMoney) {
    let model = new ListReceiptMoneyViewModel();
    model.id = data.id;
    this.listReceiptMoneyService.cancel(model).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.refreshLRM();
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Hủy bảng kê thu tiền thành công"
      });
    });
  }
  viewLRM(data: ListReceiptMoney) {
    this.bsModalRef = this.modalService.show(ReceiveMoneyDetailComponent, { class: 'inmodal animated bounceInRight modal-xlg' });
    this.bsModalRef.content.loadData(data);
  }
  public eventLog = "";

  public selectedDateLRM(value: any, dateInput: any) {
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
  //======== END METHOD ListReceiveMoney =======

  onEnterShipmentNumberLeft($this: any) {
    if ($this.value) {
      const trackingShipmentNumber = [];
      var arrCode = $this.value.split(" ");
      arrCode.forEach(code => {
        var rowData = this.clonelistData.find(x => x.shipmentNumber.toUpperCase() === code.toUpperCase());
        if (rowData) {
          var rowTracking = trackingShipmentNumber.find(x => x.shipmentNumber.toUpperCase() === rowData.shipmentNumber.toUpperCase());
          if (!rowTracking) {
            trackingShipmentNumber.push(rowData);
          }
        };
      });
      if (trackingShipmentNumber.length > 0) {
        this.listData = trackingShipmentNumber;
      } else {
        this.listData = [];
      }
      // $this.value = "";
    } else {
      this.listData = this.clonelistData;
    }
  }
  onEnterTrackingShipmentNumberRight($this: any) {
    if ($this.value) {
      const trackingShipmentNumber = [];
      var arrCode = $this.value.split(" ");
      arrCode.forEach(code => {
        var rowData = this.cloneListDataRight.find(x => x.shipmentNumber.toUpperCase() === code.toUpperCase());
        if (rowData) {
          var rowTracking = trackingShipmentNumber.find(x => x.shipmentNumber.toUpperCase() === rowData.shipmentNumber.toUpperCase());
          if (!rowTracking) {
            trackingShipmentNumber.push(rowData);
          }
        };
      });
      if (trackingShipmentNumber.length > 0) {
        this.listDataRight = trackingShipmentNumber;
      } else {
        this.listDataRight = [];
      }
      // $this.value = "";
    } else {
      this.listDataRight = this.cloneListDataRight;
    }
  }

  async inLRM(data) {
    let arr;
    let total = 0;
    data["fakeId"] = "id" + data.id;
    data["shipmentNumber"] = data.code;

    let includes: any = [];
    includes.push(Constant.classes.includes.shipment.fromHub);
    
    this.listReceiptMoneyService.getListReceiptMoneyShipmentByListReceiptMoney(data.id,
      ["Shipment", "Shipment.PaymentType", "Shipment.Service", "Shipment.ListGoods", "Shipment.Sender"]).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        arr = x.data;
        x.data.forEach(el => {
          total += el.cod;
        });
        setTimeout(() => {
          arr['code'] = data.code;
          arr['paidByEmpName'] = data.paidByEmp.fullName;
          arr['createdWhen'] = data.createdWhen;
          arr['totalPrice'] = total.toLocaleString();
          this.printFrormServiceInstance.sendCustomEvent(arr);
        }, 100);
      });
    this.idPrint = PrintHelper.printReceiveMoneyFromRider;
  }
}

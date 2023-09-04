import { Component, OnInit, TemplateRef, ElementRef, ViewChild } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";

//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem, SelectItemGroup } from "primeng/primeng";
import { ShipmentService, UserService, HubService, AuthService, TPLService, ListGoodsService, ServiceService, CustomerService } from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { User, Hub } from "../../../models/index";
import { PersistenceService } from "angular-persistence";
import {
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { ListGoods } from "../../../models/listGoods.model";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { TransportTypeService } from "../../../services/transportType.service";
import { TransportTypeHelper } from "../../../infrastructure/transportType.helper";
import { InputValue } from "../../../infrastructure/inputValue.helper";

// daterangepicker
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";
import { SelectModel } from "../../../models/select.model";
import { InformationComponent } from "../../../infrastructure/information.helper";
import { Table } from "primeng/table";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { ListGoodsStatusService } from "../../../services/listGoodsStatus.service";
import { environment } from "../../../../environments/environment";

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { CompanyInfomationHelper } from "../../../infrastructure/companyInfomation.helper";
import { TruckScheduleService } from "../../../services/truckSchedule.service";

declare var $: any;
var count_click = 0;

@Component({
  selector: "app-transfer",
  templateUrl: "transfer.component.html",
  styles: []
})
export class TransferComponent extends InformationComponent implements OnInit {
  //#region params basic
  textNameAll: string = "Tất cả";
  textOtherHub: string = "Ngoại trạm";
  //#endregion
  @ViewChild("txtUnAssignShipment") txtShipmentRefRight: ElementRef;
  @ViewChild("txtAssignShipment") txtShipmentRefLeft: ElementRef;
  isTransferAllHub: boolean = false;
  unit = environment.unit;
  hub = environment;

  filterTPLId: number = null;
  transportTypeId: number = null;
  statusId: number = null;
  toHubId: number = null;
  fromHubId: number = null;
  dateTo: any;
  dateFrom: any;
  checkSubmit: boolean;
  listDataLATExportExcel: any;
  datasourceRightClient: Shipment[] = [];
  unAssignShipment: string;
  assignShipment: string;
  includes: string;
  arrSelectedShipmentNumber: string[];
  first: number = 0;
  filterRows: Shipment[];
  pageNum = 1;
  shipmentFilterViewModelLeft: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  shipmentFilterViewModelRight: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  generalInfo: GeneralInfoModel;
  curentHub: Hub;
  placeHolderReceiverHub: string = "Chọn dữ liệu";
  transportType: any;
  filteredTransportTypes: any[];
  cloneRowDataListGood: ListGoods;
  isEditLAT: boolean = false;
  cloneItemShipmentLAT: any;
  users: any[];
  isActiveTabOne: boolean = true;
  selectedDateFrom: Date = moment(new Date()).hour(0).minute(0).second(0).toDate();
  selectedDateTo: Date = moment(new Date()).hour(23).minute(59).second(0).toDate();
  itemShipmentLAT: any;
  tplId: any;
  datasourceLAT: ListGoods[];
  totalRecordsLAT: number;
  isLazyListAssigned: boolean = true;
  eventListAssigned: LazyLoadEvent;
  isLazyRight: boolean = true;
  totalRightRecords: number;
  datasourceRight: Shipment[] = [];
  eventAssign: LazyLoadEvent;
  select: any[] = [];
  startExpectedTime: Date;
  startTime: Date;
  endExpectedTime: Date;
  currentTime: Date;
  mawb: string;
  truckNumber: string;
  realWeight: number = 0;
  isSelectedPlane: boolean;
  isSelectedTruck: boolean;
  idPrint: string;
  toHubName: any;
  totalBox: number;
  totalCalWeight: number;
  totalWeight: number;
  senderId: number;
  totalSumPrice: number;
  txtFilterGbRight: any;
  txtFilterGbLeft: any;
  txtFilterGb: any;
  fromHub: string;
  toHub: string;
  clickedFilter: boolean = false;
  status_dropdown_menu = 0;

  isShow = true;
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;
  sealNumber: string;
  note: string;

  listGoods: any;
  dateCreate: any;

  isEditLg: boolean = false;
  UnShipmentIds: number[] = [];
  AddShipmentIds: number[] = [];
  ShipmentIds: number[] = [];
  ListGoodID: number = 0;

  lstTruckSchedule: SelectModel[] = [];
  selectedTruckSchedule: number;

  constructor(
    private modalService: BsModalService,
    private serviceService: ServiceService,
    private customerService: CustomerService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private hubService: HubService,
    private listGoodsStatusService: ListGoodsStatusService,
    protected generalInfoService: GeneralInfoService,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    private transportTypeService: TransportTypeService,
    private tplService: TPLService,
    private listGoodsService: ListGoodsService,
    private daterangepickerOptions: DaterangepickerConfig,
    protected authService: AuthService,
    public permissionService: PermissionService,
    public router: Router,
    private truckScheduleService: TruckScheduleService
  ) {
    super(generalInfoService, authService, messageService, permissionService, router);
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

  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'ListGoodsDelivery.xlsx';

  parentPage: string = Constant.pages.transfer.name;
  currentPage: string = Constant.pages.transfer.children.transfer.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  selectedData: Shipment[];
  selectedDataRight: Shipment[];
  listData: Shipment[];
  listDataRight: Shipment[] = [];
  listDataLAT: ListGoods[] = [];
  //
  localStorageRightData = "localStorageRightData";
  columns: string[] = [
    "shipmentNumber",
    "orderDate",
    "package.code",
    "service.name",
    "sender.name",
    "toHub.name",
    "totalBox",
  ];
  columnsLAT: string[] = [
    "code",
    "createdWhen",
    "toHub.name",
    "fromHub.name",
    "emp.fullName",
    "transportTypeId",
    "transportTypeFullName",
    "totalShipment",
    "realWeight",
    "listGoodsStatus.name"
  ];
  columnsExport = [
    { field: 'code', header: 'Mã BK' },
    { field: 'createdWhen', header: 'TG tạo' },
    { field: 'fromHubName', header: 'TT/CN/T gửi' },
    { field: 'toHubName', header: 'TT/CN/T nhận' },
    { field: 'fullName', header: 'NV vận chuyển' },
    { field: 'transportTypeFullName', header: 'HT trung chuyển' },
    { field: 'totalShipment', header: 'Tổng vận đơn' },
    { field: 'realWeight', header: 'Tổng TL ' + environment.unit },
    { field: 'statusName', header: 'Trạng thái' }
  ];
  datasource: Shipment[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //
  currentUser: User;
  //
  statuses: SelectItem[];
  selectedStatus: number;
  //
  statuesLAT: SelectItem[];
  selectedStatusLAT: number;
  //
  hubsLeft: SelectItem[];
  selectedHubLeft: number;
  //
  riders: SelectItem[];
  selectedRider: any;
  //
  receiverHubs: SelectItemGroup[];
  selectedReceiverHub: number;
  receiverHub: SelectItem[];
  //
  receiverHubsLAT: SelectItemGroup[];
  selectedReceiverHubLAT: number;
  //
  senderHubsLAT: SelectItem[];
  selectedSenderHubLAT: number;
  //
  packages: SelectItem[];
  selectedPackage: number;
  //
  services: SelectItem[];
  selectedService: number;
  //
  customers: SelectItem[];
  selectedCustomer: number;
  //
  disabledControlLeft: boolean = false;
  //
  transportTypes: SelectModel[];
  selectedTransportType: any;
  //
  transportTypesLAT: SelectModel[];
  selectedTransportTypeLAT: any;
  //
  partners: SelectItem[];
  selectedPartner: number;
  //
  reviewChecked: boolean;

  //
  public singlePickerstartExpectedTime = {
    singleDatePicker: true,
    timePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: this.currentTime
  };
  //
  public singlePickerendExpectedTime = {
    singleDatePicker: true,
    timePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: this.currentTime
  };

  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();

  ngOnInit() {
    this.currentTime = new Date();
    this.startExpectedTime = this.currentTime;
    this.singlePickerstartExpectedTime.startDate = new Date(this.currentTime);

    // declare shipmentFilterViewModelLeft
    // this.includes =
    //   Constant.classes.includes.shipment.package + "," +
    //   Constant.classes.includes.shipment.service + "," +
    //   Constant.classes.includes.shipment.toProvince + "," +
    //   Constant.classes.includes.shipment.fromHub + "," +
    //   Constant.classes.includes.shipment.toHub + "," +
    //   Constant.classes.includes.shipment.fromProvince + "," +
    //   Constant.classes.includes.shipment.shipmentStatus + "," +
    //   Constant.classes.includes.shipment.sender + "," +
    //   Constant.classes.includes.shipment.transferUser;
    this.includes = "";

    this.shipmentFilterViewModelLeft.Cols = this.includes;
    this.shipmentFilterViewModelLeft.Type = ShipmentTypeHelper.transfer;
    this.shipmentFilterViewModelLeft.PageNumber = this.pageNum;
    this.shipmentFilterViewModelLeft.PageSize = this.rowPerPage;

    // declare shipmentFilterViewModelRight
    this.shipmentFilterViewModelRight.Cols = this.includes;
    this.shipmentFilterViewModelRight.Type = ShipmentTypeHelper.transfer;

    // delare parrams getListGoods
    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    this.dateFrom = currentDate + "T00:00:00";
    this.dateTo = currentDate + "T23:59:59";
    this.initData();
  }

  async initData() {
    this.loadShipment();
    this.loadTransportType();
    this.loadListGoodsStatus();
    this.loadListAssignedTransfer();
    this.loadUser();
    this.loadRider();
    this.loadFilterLeft();
    await this.loadCurrentUser();
    this.loadGroupReceiverHubs();
    this.loadGeneralInfo();
    this.listDataRight = [];
    this.selectedData = [];
    this.first = 0;
  }

  async loadGeneralInfo() {
    this.generalInfo = await this.generalInfoService.getAsync();
  }

  async loadRider() {
    this.selectedRider = null;
    // this.riders = await this.userService.getSelectModelEmpByCurrentHubAsync();
    this.riders = await this.userService.getSelectModelRiderAllHubAsyncTransfer();
  }

  async loadUser() {
    // this.users = await this.userService.getEmpByCurrentHubAsync();
    this.users = await this.userService.getSelectModelRiderAllHubAsyncTransfer();
  }

  //
  public singleSelectFrom(value: any) {
    this.selectedDateFrom = moment(value.start).toDate();
    this.loadLazyListAssignedTransfer(this.eventListAssigned);
  }
  //
  public singleSelectTo(value: any) {
    this.selectedDateTo = moment(value.start).toDate();
    this.loadLazyListAssignedTransfer(this.eventListAssigned);
  }

  async loadShipment() {
    this.arrSelectedShipmentNumber = [];
    this.datasourceRightClient = [];
    this.shipmentFilterViewModelLeft.ShipmentNumberListUnSelect = [];
    this.shipmentFilterViewModelRight.ShipmentNumberListSelect = [];
    this.loadShipmentPagingLeft();
    //refresh
    this.txtFilterGbLeft = null;
    this.txtFilterGbRight = null;
  }

  async loadShipmentPagingLeft(): Promise<Shipment[]> {
    // console.log(JSON.stringify(this.shipmentFilterViewModelLeft));
    const res = await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModelLeft);
    if (res) {
      const data = res.data as Shipment[];
      this.datasource = data;
      this.totalRecords = res.dataCount;
      this.listData = this.datasource;
      return this.datasource;
    }
  }

  async loadShipmentRight(): Promise<Shipment[]> {
    // console.log(JSON.stringify(this.shipmentFilterViewModelRight));
    const res = await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModelRight);
    if (res) {
      const data = res.data as Shipment[];

      data.forEach(item => {
        this.realWeight += item.weight ? item.weight : 0;
      });

      this.datasourceRight = data;
      this.listDataRight = this.datasourceRight;
      return this.datasourceRight;
    }
  }

  async loadServiceLeft() {
    this.services = [];
    const data = await this.serviceService.getAllSelectModelAsync();
    if (data) {
      this.services = data;
    }
  }

  async loadCustomersLeft() {
    this.customers = [];
    const data = await this.customerService.getAllSelectModelAsync();
    if (data) {
      this.customers = data;
    }
  }

  async loadListAssignedTransfer() {
    const typeId = ListGoodsTypeHelper.detailTranfer;
    const data = await this.listGoodsService.getListGoodsAsync(typeId, null, this.fromHubId, this.toHubId, null, this.statusId, this.transportTypeId, this.filterTPLId, this.dateFrom, this.dateTo);
    if (data) {
      this.datasourceLAT = data.reverse();
      if (this.transportTypeId && !this.filterTPLId) {
        this.datasourceLAT = this.datasourceLAT.filter(x => !x.tplCode);
      }
      this.datasourceLAT = this.datasourceLAT.map(obj => {
        if (obj.transportTypeName) {
          if (!obj.tplCode || obj.tplCode.trim() === "") {
            const transportTypeName = obj.transportTypeName;
            obj.transportTypeFullName = transportTypeName + " (NB)";
          } else {
            const transportTypeName = obj.transportTypeName;
            const tplCode = obj.tplCode;
            obj.transportTypeFullName = tplCode + " - " + transportTypeName;
          }
        } else {
          obj.transportTypeFullName = null;
        }
        return obj;
      });
      this.totalRecordsLAT = this.datasourceLAT.length;
      this.listDataLAT = this.datasourceLAT;
      this.listDataLAT = this.listDataLAT.sort((x, y) => {
        const a = new Date(x.createdWhen);
        const b = new Date(y.createdWhen);
        if (a > b) return -1;
        return 1;
      })
      this.listDataLATExportExcel = this.datasourceLAT;
    }
  }

  async loadTransportType() {
    const cols = [
      Constant.classes.includes.transportType.tplTransportTypes,
    ];
    this.transportTypes = await this.transportTypeService.getSelectModelTransportTypeAsync(cols);
    // console.log(this.transportTypes);
    this.transportTypesLAT = this.transportTypes;
    this.transportType = this.transportTypes[0].label;
    this.selectedTransportType = this.transportTypes[0];
  }

  async loadListGoodsStatus() {
    this.statuesLAT = [];
    this.listGoodsStatusService.getAllSelectModelAsync().then(x => {
      this.statuesLAT = x;
    });
  }

  //filter TransportType
  filterTransportTypes(event) {
    this.filteredTransportTypes = [];
    for (let i = 0; i < this.transportTypes.length; i++) {
      let transportType = this.transportTypes[i].label;
      if (transportType.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
        this.filteredTransportTypes.push(transportType);
      }
    }
  }

  onSelectedTransportTypes() {
    for (let x of this.transportTypes) {
      if ((this.transportType == x.value) || (x.value && this.transportType.tplId == x.value.tplId && this.transportType.transportTypeId == x.value.transportTypeId)) {
        this.selectedTransportType = x;
        this.changeTransportType();
        break;
      }
    };
  }

  refreshTransportType() {
    this.truckNumber = null;
    this.mawb = null;
    this.startExpectedTime = this.currentTime;
    this.endExpectedTime = this.currentTime;
    this.lstTruckSchedule = [];
    this.selectedTruckSchedule = null;
  }

  changeTransportType() {
    this.refreshTransportType();
    if (this.transportTypes) {
      if (this.selectedTransportType) {
        if (this.selectedTransportType.title === TransportTypeHelper.truckCode) {
          this.isSelectedTruck = true;
        } else {
          this.isSelectedTruck = false;
        }
        if (this.selectedTransportType.title === TransportTypeHelper.planeCode) {
          this.isSelectedPlane = true;
        } else {
          this.isSelectedPlane = false;
        }
        if (this.selectedTransportType.data) {
          this.tplId = this.selectedTransportType.data;
        } else {
          this.tplId = null;
        }
      }
    }
  }

  async loadCurrentUser() {
    let cols = [
      Constant.classes.includes.user.hub,
      Constant.classes.includes.user.department
    ];
    const id = this.authService.getUserId();
    this.currentUser = await this.userService.getAsync(id, cols);
    if (this.currentUser.hub) {
      this.curentHub = this.currentUser.hub;
      this.fromHub = this.currentUser.hub.name;
    }
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;
        //filter

        //End Custom filter

        // sort data
        this.filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );

        // this.listData = this.filterRows.slice(event.first, event.first + event.rows);
        this.listData = this.filterRows;
        // this.totalRecords = this.filterRows.length;
        // console.log("listData", this.listData);
        // console.log("selectedCustomer", this.selectedCustomer);
        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  onPageChange(event: LazyLoadEvent) {
    this.shipmentFilterViewModelLeft.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModelLeft.PageSize = event.rows;
    this.loadShipmentPagingLeft();
  }

  loadLazyListAssign(event: LazyLoadEvent) {
    this.eventAssign = event;
    setTimeout(() => {
      if (this.reviewChecked) {
        this.listDataRight = this.selectedDataRight;
        this.totalRightRecords = this.selectedData.length;
      }
      else if (this.datasourceRight) {
        var filterRows;
        //filter
        if (event.filters.length > 0)
          filterRows = this.datasourceRight.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasourceRight.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );

        // sort data          
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listDataRight = filterRows.slice(
          event.first,
          event.first + event.rows
        );
        this.totalRightRecords = filterRows.length;
      }
      this.isLazyRight = false;
    }, 250);
  }

  loadLazyListAssignedTransfer(event: LazyLoadEvent) {
    this.eventListAssigned = event;
    setTimeout(() => {
      if (this.datasourceLAT) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasourceLAT.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasourceLAT.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLAT)
          );

        //Begin Custom filter
        if (this.selectedStatusLAT) {
          filterRows = filterRows.filter(
            x => x.listGoodsStatusId === this.selectedStatusLAT
          );
        }
        if (this.selectedTransportTypeLAT) {
          filterRows = filterRows.filter(x => {
            if (x.tpl) {
              return x.transportTypeId === this.selectedTransportTypeLAT - x.tplId;
            } else {
              return x.transportTypeId === this.selectedTransportTypeLAT;
            }
          });
        }
        if (this.selectedReceiverHubLAT) {
          filterRows = filterRows.filter(
            x => x.toHub.id === this.selectedReceiverHubLAT
          );
        }

        //
        if (this.selectedDateFrom && this.selectedDateTo) {
          //
          filterRows = filterRows.filter(x => moment(x.createdWhen).isBetween(this.selectedDateFrom, this.selectedDateTo));
        } else if (this.selectedDateFrom) {
          filterRows = filterRows.filter(x => moment(x.createdWhen).isAfter(this.selectedDateFrom));
        } else if (this.selectedDateTo) {
          filterRows = filterRows.filter(x => moment(x.createdWhen).isBefore(this.selectedDateTo));
          //
        }

        //End Custom filter

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listDataLATExportExcel = filterRows;
        this.listDataLAT = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecordsLAT = filterRows.length;
      }
      this.isLazyListAssigned = false;
    }, 250);
  }

  changeServiceLeft() {
    this.shipmentFilterViewModelLeft.PageNumber = 1;
    this.shipmentFilterViewModelLeft.ServiceId = this.selectedService;
    this.loadShipmentPagingLeft();
  }

  changeCustomerLeft() {
    this.shipmentFilterViewModelLeft.PageNumber = 1;
    this.shipmentFilterViewModelLeft.SenderId = this.selectedCustomer;
    this.loadShipmentPagingLeft();
  }

  changeFilterLeft() {
    this.selectedData = [];
    this.loadLazy(this.event);
  }

  changeStatusLAT() {
    this.statusId = this.selectedStatusLAT;
    this.loadListAssignedTransfer();
  }

  changeTransportTypeLAT() {
    if (this.selectedTransportTypeLAT) {
      if (this.selectedTransportTypeLAT.tplId) {
        this.filterTPLId = this.selectedTransportTypeLAT.tplId;
      } else {
        this.filterTPLId = null;
      }
      this.transportTypeId = this.selectedTransportTypeLAT.transportTypeId;
    } else {
      this.transportTypeId = null;
      this.filterTPLId = null;
    }
    this.loadListAssignedTransfer();
  }

  changeReceiverHubLAT() {
    this.toHubId = this.selectedReceiverHubLAT;
    this.loadListAssignedTransfer();
  }

  changeSenderHubLAT() {
    this.fromHubId = this.selectedSenderHubLAT;
    this.loadListAssignedTransfer();
  }

  loadFilterLeft() {
    this.loadServiceLeft();
    this.loadCustomersLeft();
  }

  reloadStartExpectedTime() {
    this.startExpectedTime = this.currentTime;
  }

  public singleSelectstartExpectedTime(value: any) {
    this.startExpectedTime = moment(value.start).toDate();
  }

  public singleSelectendExpectedTime(value: any) {
    this.endExpectedTime = moment(value.start).toDate();
  }

  assign(rowData: Shipment = null, selectedData?: Shipment[]) {
    this.changeAssignShipment(rowData.shipmentNumber);
  }

  async unAssign(rowData: Shipment, selectedDataRight?: Shipment[]) {
    this.changeUnAssignShipment(rowData.shipmentNumber);
  }

  refresh() {
    this.loadShipment();
    this.loadFilterLeft();
    if (this.bsModalRef) this.bsModalRef.hide();

    //refresh
    this.selectedData = [];
    this.selectedDataRight = [];
    this.listDataRight = [];
    this.datasourceRight = [];
    this.totalRightRecords = 0;
    this.reviewChecked = false;
    this.txtFilterGbRight = null;
    this.refreshTabOne();
    this.isSelectedTruck = null;
    this.isSelectedPlane = null;
    this.isEditLAT = false;
    this.cloneItemShipmentLAT = null;
    this.checkSubmit = false;
    if (this.transportTypes) {
      this.transportType = this.transportTypes[0].label;
    }
    this.placeHolderReceiverHub = "Chọn dữ liệu";

    this.isEditLg = false;
    this.checkSubmit = false;
  }

  async save() {
    if (!this.isValidToAssign()) return;
    this.checkSubmit = true;
    if (this.cloneItemShipmentLAT) {
      this.onUpdateListGood();
    } else {
      this.itemShipment = await this.onAssignTransferList(this.datasourceRightClient);
      this.refresh();
      this.mainInput.start = moment();
      this.mainInput.end = moment();
      const currentDate = moment(new Date()).format("YYYY/MM/DD");
      this.dateFrom = currentDate + "T00:00:00";
      this.dateTo = currentDate + "T23:59:59";
      this.loadListAssignedTransfer();
    }
  }

  isValidToAssign(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];
    if (!this.listDataRight || this.listDataRight.length === 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Bảng kê chưa có vận đơn"
      });
      result = false;
    }
    if (!this.selectedRider) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      result = false;
    } else if (!this.selectedRider.id) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn nhân viên"
      });
      result = false;
    }
    if (!this.selectedReceiverHub) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn TT/CN/T nhận"
      });
      result = false;
    }

    // check TransportType
    if (!this.selectedTransportType || !this.selectedTransportType.value) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn HT trung chuyển"
      });
      result = false;
    } else {
      // if (this.isSelectedTruck) {
      //   if (!this.truckNumber) {
      //     messages.push({
      //       severity: Constant.messageStatus.warn,
      //       detail: "Chưa nhập biển số"
      //     });
      //     result = false;
      //   }
      // }
      if (this.isSelectedPlane) {
        // if (!this.mawb) {
        //   messages.push({
        //     severity: Constant.messageStatus.warn,
        //     detail: "Chưa nhập Mã MAWB"
        //   });
        //   result = false;
        // }
        if (!this.startExpectedTime && environment.namePrint !== CompanyInfomationHelper.Name.TASETCO) {
          messages.push({
            severity: Constant.messageStatus.warn,
            detail: "Chưa chọn thời gian dự kiến bay"
          });
          result = false;
        } else {
          // let checkTime = moment(
          //   this.startExpectedTime
          // ).isBefore(this.currentTime);
          // if (checkTime) {
          //   messages.push({
          //     severity: Constant.messageStatus.warn,
          //     detail: "TG dự kiến bay không được nhỏ hơn thời gian hiện tại"
          //   });            
          //   result = false;
          // }          
        }
        if (!this.endExpectedTime && environment.namePrint !== CompanyInfomationHelper.Name.TASETCO) {
          messages.push({
            severity: Constant.messageStatus.warn,
            detail: "Chưa chọn thời gian dự kiến kết thúc"
          });
          result = false;
        }
        if (this.startExpectedTime && this.endExpectedTime && environment.namePrint !== CompanyInfomationHelper.Name.TASETCO) {
          let checkTime = moment(
            this.endExpectedTime
          ).isAfter(this.startExpectedTime);
          if (!checkTime) {
            messages.push({
              severity: Constant.messageStatus.warn,
              detail: "TG kết thúc không được nhỏ nhỏ hơn TG dự kiến bay"
            });
            result = false;
          }
        }
      }
    }

    //check realWeight
    // if (!this.realWeight && environment.namePrint !== CompanyInfomationHelper.Name.TASETCO) {
    //   messages.push({
    //     severity: Constant.messageStatus.warn,
    //     detail: "Chưa nhập TL bàn giao thực tế"
    //   });
    //   result = false;
    // }

    //begin check box
    let listBoxIds = [];
    this.selectedData.forEach(element => {
      if (element.packageId && listBoxIds.indexOf(element.packageId) == -1) {
        listBoxIds.push(element.packageId);
      }
    });

    //check package shipment exist
    let packageShipmentExistCount = 0;
    this.listData.forEach(element => {
      if (
        element.packageId &&
        listBoxIds.indexOf(element.packageId) != -1 &&
        this.selectedData.indexOf(element) == -1
      ) {
        packageShipmentExistCount++;
      }

      if (packageShipmentExistCount >= 1) {
        result = false;
      }
    });

    if (packageShipmentExistCount >= 1) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng quét gói"
      });
      result = false;
    }
    //end check box

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  async onAssignTransferList(selectedData: Shipment[]): Promise<any> {
    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();
    // console.log(selectedData);
    if (!selectedData || selectedData.length === 0) return;

    selectedData.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedRider.id;
    model.shipmentStatusId = StatusHelper.assignEmployeeTransfer;
    model.shipmentIds = shipmentIds;
    model.receiveHubId = this.selectedReceiverHub;
    model.note = this.note;
    model.sealNumber = this.sealNumber;
    model.fromHubId = this.currentUser.hubId;
    model.toHubId = this.selectedReceiverHub;
    // transportType
    model.transportTypeId = this.selectedTransportType.value.transportTypeId;
    model.realWeight = this.realWeight;

    if (this.isSelectedTruck === true) {
      model.truckNumber = this.truckNumber;
    }
    if (this.isSelectedPlane === true) {
      model.mawb = this.mawb;
      model.startExpectedTime = SearchDate.formatToISODate(this.startExpectedTime);
      model.startTime = model.startExpectedTime;
      model.endExpectedTime = SearchDate.formatToISODate(this.endExpectedTime);
      model.endTime = model.endExpectedTime;
    }
    if (this.tplId) {
      model.tplId = this.tplId;
    }

    // console.log(this.isEditLg);
    if (this.isEditLg) {
      this.UnShipmentIds = [];
      this.AddShipmentIds = [];

      model.shipmentIds = [];

      this.ShipmentIds.map(x => {
        let findUnship = this.datasourceRightClient.find(y => y.id == x);
        if (!findUnship) {
          this.UnShipmentIds.push(x);
        }
      });

      this.datasourceRightClient.map(x => {
        let findShip = this.ShipmentIds.find(y => y == x.id);
        if (!findShip) {
          this.AddShipmentIds.push(x.id);
        }
      })

      model.ListGoodsId = this.ListGoodID;
      model.UnShipmentIds = this.UnShipmentIds;
      model.AddShipmentIds = this.AddShipmentIds;
    }

    this.itemShipment = [...selectedData];
    // check phân tt ngoại trạm hay phân tt tất cả
    model.isTransferAllHub = this.isTransferAllHub;
    // console.log(JSON.stringify(model));

    this.listGoods = await this.shipmentService.assignTransferListAsync(model);
    this.checkSubmit = false;
    if (this.listGoods) {
      this.idPrint = ListGoodsTypeHelper.printDetailTranfer;
      this.itemShipment.listGoods = this.listGoods.code;
      // console.log(this.listGoods);
      this.itemShipment.logoUrl = this.generalInfo.logoUrl;
      this.itemShipment.companyName = this.generalInfo.companyName;
      this.itemShipment.hotLine = this.generalInfo.hotLine;
      this.itemShipment.centerHubAddress = this.generalInfo.addressMain;
      this.itemShipment.type = ListGoodsTypeHelper.ListGoodTypeName(this.listGoods.listGoodsTypeId);
      if (this.selectedRider) {
        this.itemShipment.createdBy = this.selectedRider.fullName;
      }

      if (this.currentUser.hub) {
        this.itemShipment.userHubName = this.currentUser.hub.name;
      }
      if (this.currentUser.department) {
        this.itemShipment.userDepartmentName = this.currentUser.department.name;
      }

      if (this.selectedRider) {
        this.itemShipment.createdPhone = this.selectedRider.phoneNumber;
      }
      this.itemShipment.toHub = this.toHub;
      // console.log(this.itemShipment.toHub);
      this.itemShipment.fromHub = this.fromHub;
      // console.log(this.itemShipment.toHub);
      this.dateCreate = SearchDate.formatToISODate(new Date());
      this.itemShipment.dateCreate = SearchDate.formatToISODate(new Date());

      this.totalSumPrice = 0;
      this.totalWeight = 0;
      this.totalCalWeight = 0;
      this.totalBox = 0;
      selectedData.forEach((item, index) => {
        this.stt = index + 1;
        this.itemShipment[index].stt = this.stt;
        this.totalWeight += this.itemShipment[index].weight;
        this.itemShipment.totalWeight = this.totalWeight;
        if (this.itemShipment[index].calWeight) {
          this.totalCalWeight += this.itemShipment[index].calWeight;
          this.itemShipment.totalCalWeight = this.totalCalWeight;
        }
        if (item.paymentTypeId) {
          if (item.paymentTypeId === PaymentTypeHelper.NGTTN) {
            this.itemShipment[index].sumPrice = item.totalPrice;
          }
          if (item.paymentTypeId === PaymentTypeHelper.NNTTN) {
            this.itemShipment[index].sumPrice = item.cod + item.totalPrice;
          }
          this.totalSumPrice += this.itemShipment[index].sumPrice;
          this.itemShipment.totalSumPrice = this.totalSumPrice;
        }
        this.itemShipment[index].fakeId =
          "id" + selectedData[index].id;

        if (item.transferUser) {
          this.itemShipment.transferUserFullName = item.transferUser.fullName;
        }

        if (this.listGoods.toHub) {
          this.toHubName = this.listGoods.toHub.name;
          this.itemShipment.toHubName = this.listGoods.toHub.name;
        }
      });
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công"
      });
      return this.itemShipment;
    }
  }

  async onUpdateListGood() {
    // update shipmentIds
    let shipmentIds = [];
    let model = new ListGoods();

    this.listDataRight.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedRider.id;
    model.shipmentIds = shipmentIds;
    model.note = this.note;
    model.sealNumber = this.sealNumber;
    model.toHubId = this.cloneRowDataListGood.toHubId;
    model.truckScheduleId = this.selectedTruckSchedule;
    // transportType
    model.transportTypeId = this.selectedTransportType.value.transportTypeId;
    model.realWeight = this.realWeight;

    if (this.isSelectedTruck === true) {
      model.truckNumber = this.truckNumber;
    }
    if (this.isSelectedPlane === true) {
      model.mawb = this.mawb;
      model.startExpectedTime = SearchDate.formatToISODate(this.startExpectedTime);
      model.startTime = model.startExpectedTime;
      model.endExpectedTime = SearchDate.formatToISODate(this.endExpectedTime);
      model.endTime = model.endExpectedTime;
    }
    if (this.tplId) {
      model.tplId = this.tplId;
    }
    model.listGoodsTypeId = this.cloneRowDataListGood.listGoodsTypeId;
    model.numPrint = this.cloneRowDataListGood.numPrint;
    model.createdByHub = this.cloneRowDataListGood.createdByHub;
    model.listGoodsStatusId = this.cloneRowDataListGood.listGoodsStatusId;
    model.fromHubId = this.cloneRowDataListGood.fromHubId;
    model.cancelTime = SearchDate.formatToISODate(this.cloneRowDataListGood.cancelTime);
    model.cancelNote = this.cloneRowDataListGood.cancelNote;
    model.isBlock = this.cloneRowDataListGood.isBlock;
    model.id = this.cloneRowDataListGood.id;
    model.code = this.cloneRowDataListGood.code;
    model.name = this.cloneRowDataListGood.name;
    //
    const data = await this.listGoodsService.updateAsync(model);
    this.checkSubmit = false;
    if (data) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công"
      });
      this.refresh();
      this.loadListAssignedTransfer();
    }
  }

  mapSaveData(obj: Shipment) {
    if (obj) {
    }
  }

  saveClient(list: Shipment[]) { }

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

  async changeAssignShipment(txtAssignShipment) {
    this.txtShipmentRefLeft.nativeElement.focus();
    this.txtShipmentRefLeft.nativeElement.select();
    this.messageService.clear();
    let messageWarn: string = "";
    let messageErr: string = "";
    let messageSuccess: string = "";
    let finalTypeMessage: string = "";
    const input = InputValue.trimInput(txtAssignShipment);
    if (input == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    let arraySN = input.split(" ");
    if (this.arrSelectedShipmentNumber[0] === "") {
      this.arrSelectedShipmentNumber = [];
    }
    const duplicateSN = this.arrSelectedShipmentNumber.filter(x => arraySN.includes(x));
    if (duplicateSN) {
      if (duplicateSN.length > 0) {
        const duplicateSNString = duplicateSN.join(" ");
        messageWarn = "Đã quét mã vận đơn " + duplicateSNString + " trước đó!" + `<br>`;
      }
    }
    arraySN = arraySN.filter(x => !duplicateSN.includes(x));
    this.arrSelectedShipmentNumber = Array.from(new Set(this.arrSelectedShipmentNumber.concat(arraySN)));
    if (arraySN.length !== 0) {

      this.shipmentFilterViewModelLeft.ShipmentNumberListUnSelect = this.arrSelectedShipmentNumber;

      if (!this.isEditLg) {
        // this.shipmentFilterViewModelLeft.ShipmentNumberListUnSelect = this.arrSelectedShipmentNumber;
        this.loadShipmentPagingLeft();
        this.shipmentFilterViewModelRight.ShipmentNumberListSelect = arraySN;
        await this.loadShipmentRight();
      }
      else {
        let arrLeft = this.datasource.map(x => Object.assign({}, x));
        let arrRight = [];

        this.datasource.map(x => {
          let find = arraySN.find(y => y == x.shipmentNumber);
          if (find) {
            let index = arrLeft.findIndex(x => x.shipmentNumber == find);
            arrLeft.splice(index, 1);
            arrRight.push(x);
            this.totalRecords -= 1;
          }
        })
        this.listData = this.datasource = arrLeft;
        this.listDataRight = this.datasourceRight = arrRight;
      }

      this.datasourceRightClient = this.datasourceRight.concat(this.datasourceRightClient);
      // this.arrSelectedShipmentNumber = this.datasourceRightClient.map(x => x.shipmentNumber);

      if (this.datasourceRightClient) {
        this.totalRightRecords = this.datasourceRightClient.length;
      }
      const listAssignSN = this.datasourceRightClient.map(x => x.shipmentNumber);
      const noExistSN = this.arrSelectedShipmentNumber.filter(x => !listAssignSN.includes(x));
      if (noExistSN) {
        if (noExistSN.length > 0) {
          const noExistSNString = noExistSN.join(" ");
          messageErr = "Không tìm thấy vận đơn " + noExistSNString + `<br>`;
        }
      }

      // if (this.datasourceRightClient) {
      //   this.totalRightRecords = this.datasourceRightClient.length;
      // }
      // const listAssignSN = this.datasourceRightClient.map(x => x.shipmentNumber);
      // const noExistSN = this.arrSelectedShipmentNumber.filter(x => !listAssignSN.includes(x));
      // if (noExistSN) {
      //   if (noExistSN.length > 0) {
      //     const noExistSNString = noExistSN.join(" ");
      //     messageErr = "Không tìm thấy vận đơn " + noExistSNString + `<br>`;
      //   }
      // }
      const scanSuccesSN = arraySN.length - noExistSN.length;
      if (scanSuccesSN > 0) {
        messageSuccess = "Quét thành công " + scanSuccesSN + " vận đơn" + `<br>`;
      }
      this.arrSelectedShipmentNumber = listAssignSN;

      if (noExistSN.length === 0 && duplicateSN.length === 0) {
        finalTypeMessage = Constant.messageStatus.success;
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
      }
      if (noExistSN.length > 0) {
        finalTypeMessage = Constant.messageStatus.error;
        SoundHelper.getSoundMessage(Constant.messageStatus.error);
      } else {
        if (duplicateSN) {
          if (duplicateSN.length > 0) {
            finalTypeMessage = Constant.messageStatus.warn;
            SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          }
        }
      }
    } else {
      if (duplicateSN.length > 0) {
        finalTypeMessage = Constant.messageStatus.warn;
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      }
    }
    this.messageService.add({
      severity: finalTypeMessage,
      detail: messageErr + messageWarn + messageSuccess
    });
    this.assignShipment = null;
  }

  async changeUnAssignShipment(txtUnAssignShipment) {
    this.txtShipmentRefRight.nativeElement.focus();
    this.txtShipmentRefRight.nativeElement.select();
    this.messageService.clear();
    let messageErr: string = "";
    let messageSuccess: string = "";
    let finalTypeMessage: string = "";
    const input = InputValue.trimInput(txtUnAssignShipment);
    if (input == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      return;
    }
    let unAssignSN = input.split(" ");
    const noExistSN = unAssignSN.filter(x => !this.arrSelectedShipmentNumber.includes(x));
    if (noExistSN) {
      if (noExistSN.length > 0) {
        const noExistSNString = noExistSN.join(" ");
        finalTypeMessage = Constant.messageStatus.error;
        messageErr = "Không tìm thấy vận đơn " + noExistSNString + `<br>`;
        SoundHelper.getSoundMessage(Constant.messageStatus.error);
      }
    }
    unAssignSN = unAssignSN.filter(x => !noExistSN.includes(x));
    if (unAssignSN.length > 0) {
      this.arrSelectedShipmentNumber = this.arrSelectedShipmentNumber.filter(x => !unAssignSN.includes(x));
      this.shipmentFilterViewModelLeft.ShipmentNumberListUnSelect = this.arrSelectedShipmentNumber;

      if (!this.isEditLg) {
        this.loadShipmentPagingLeft();
        this.shipmentFilterViewModelRight.ShipmentNumberListSelect = unAssignSN;
        if (this.arrSelectedShipmentNumber.length === 0) {
          this.shipmentFilterViewModelRight.ShipmentNumberListSelect.push("");
        }
        await this.loadShipmentRight();
      }
      else {
        let arrLeft = [];
        let arrRight = [];

        this.datasourceRightClient.map((x, i) => {
          let find = unAssignSN.find(y => y == x.shipmentNumber);
          if (find) {
            // let index = this.datasourceRightClient.findIndex(x => x.shipmentNumber == find);
            // arrRight.splice(index, 1);
            arrRight.push(x);
            this.datasource.push(x);
          }
        })
        this.listData = this.datasource;
        this.totalRecords = this.datasource.length;
        this.listDataRight = this.datasourceRight = this.listDataRight = arrRight;
      }

      const unAssignSNs = this.datasourceRight.map(x => x.id);

      unAssignSNs.forEach(y => {
        this.datasourceRightClient = this.datasourceRightClient.filter(x => x.id !== y);
      });

      if (this.datasourceRightClient) {
        this.totalRightRecords = this.datasourceRightClient.length;
      }
      messageSuccess = "Đã hủy " + this.datasourceRight.length + " vận đơn" + `<br>`;
      if ((!noExistSN || noExistSN.length === 0) && this.datasourceRight.length > 0) {
        finalTypeMessage = Constant.messageStatus.success;
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
      }
    }
    this.messageService.add({
      severity: finalTypeMessage,
      detail: messageErr + messageSuccess
    });
    this.unAssignShipment = null;
  }

  changeAssignPackage(txtAssignPackage) {
    this.selectedData = InputValue.scanShipmentNumber(txtAssignPackage.value, this.datasource, this.selectedData, this.messageService);
    this.assign(null, this.selectedData);
    txtAssignPackage.value = null;
  }

  changeUnAssignPackage(txtUnAssignPackage) {
    this.selectedDataRight = InputValue.scanShipmentNumber(txtUnAssignPackage.value, this.listDataRight, this.selectedDataRight, this.messageService);
    this.unAssign(null, this.selectedDataRight);
    txtUnAssignPackage.value = null;
  }

  async loadGroupReceiverHubs() {
    this.receiverHubs = [];
    this.receiverHub = [];
    const hubs = await this.hubService.getAllAsync();
    if (hubs) {
      this.senderHubsLAT = [];
      this.senderHubsLAT.push({ label: `-- Chọn trạm --`, value: null });
      hubs.forEach(element => {
        if (element.centerHubId && element.poHubId) {
          // get SelectItemHubs with tag Title
          this.receiverHub.push({
            label: element.name, value: element.id, title: element.centerHubId.toString()
          });
        }
        // get senderHubLAT
        this.senderHubsLAT.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
    }
    let groupOfCenterHubs = this.receiverHub.reduce((outData, item) =>
      // group all Hubs by title
      Object.assign(outData, { [item.title]: (outData[item.title] || []).concat(item) })
      , []);
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
          let hubs = y.filter(e => e.value != this.curentHub.id);
          hubs.push({
            label: x.name,
            value: x.id,
            title: null
          });
          // }
          this.receiverHubs.push({
            label: `-- ${x.name} --`,
            items: hubs,
          });
          this.receiverHubsLAT = this.receiverHubs;
        }
      });
    });
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

  refreshLAT() {
    this.txtFilterGb = null;
    this.selectedStatusLAT = null;
    this.selectedTransportTypeLAT = null;
    this.selectedReceiverHubLAT = null;
    this.listDataLAT = [];
    this.datasourceLAT = [];
    this.mainInput.start = moment();
    this.mainInput.end = moment();
    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    this.dateFrom = currentDate + "T00:00:00";
    this.dateTo = currentDate + "T23:59:59";
    this.toHubId = null;
    this.fromHubId = null;
    this.statusId = null;
    this.transportTypeId = null;
    this.filterTPLId = null;
    this.loadListAssignedTransfer();
  }

  refreshTabOne() {
    this.selectedTransportType = null;
    this.transportType = null;
    this.refreshTransportType();
    this.realWeight = null;
    this.selectedRider = null;
    this.selectedReceiverHub = null;
    this.placeHolderReceiverHub = "Chọn dữ liệu";
    this.sealNumber = null;
    this.note = null;
    this.selectedService = null;
    this.selectedCustomer = null;
  }

  async printLAT(rowData: ListGoods) {
    this.itemShipmentLAT = await this.onGetListGoodsId(rowData);
    if (this.itemShipmentLAT) {
      setTimeout(async () => {
        this.itemShipmentLAT.isPrintBareCode = true;
        this.idPrint = ListGoodsTypeHelper.printDetailTranfer;
        setTimeout(() => {
          this.printFrormServiceInstance.sendCustomEvent(this.itemShipmentLAT);
        }, 500);
      }, 0);
    }
  }

  async editLAT(rowData: ListGoods) {
    this.loadShipment();
    this.refreshTabOne();
    // load rowdata
    // console.log(rowData);
    this.cloneRowDataListGood = rowData;
    // active Tab name="createlist"
    this.isActiveTabOne = true;
    // load listGoods column
    this.selectedTransportType = new SelectModel;
    const transportTypes = this.transportTypes.find(x =>
      (x.value == rowData.transportTypeId) && (x.data == rowData.tplId)
    );
    if (transportTypes) {
      this.transportType = transportTypes.value;
      this.selectedTransportType = transportTypes;
    }
    // load Rider
    this.users.forEach(x => {
      if (x.value.id === rowData.empId) {
        this.selectedRider = x.value;
      }
    });
    // load transportType
    if (this.selectedTransportType) {
      if (rowData.transportType) {
        if (rowData.transportType.code === TransportTypeHelper.truckCode) {
          this.isSelectedTruck = true;
          this.truckNumber = rowData.truckNumber;
        } else {
          this.isSelectedTruck = false;
        }
        if (rowData.transportType.code === TransportTypeHelper.planeCode) {
          this.isSelectedPlane = true;
          this.mawb = rowData.mawb;
          this.startExpectedTime = rowData.startExpectedTime;
          this.endExpectedTime = rowData.endExpectedTime;
        } else {
          this.isSelectedPlane = false;
        }
      }
    }
    this.realWeight = rowData.realWeight;
    this.sealNumber = rowData.sealNumber;
    this.note = rowData.note;
    // load receiverHubs
    this.selectedReceiverHub = rowData.toHubId;
    this.receiverHubs.filter(x => {
      let item = x.items;
      item.filter(y => {
        if (y.value === rowData.toHubId) {
          this.placeHolderReceiverHub = y.label;
        }
      })
    });
    this.isEditLAT = true;
    // this.focusHub();
    // load item shipment of ListGoods
    this.itemShipmentLAT = await this.onGetListGoodsId(rowData);
    if (this.itemShipmentLAT) {
      // load listDataRight
      if (this.itemShipmentLAT.length > 0) {
        // console.log(this.itemShipmentLAT);
        this.cloneItemShipmentLAT = this.itemShipmentLAT;
        this.listDataRight = this.itemShipmentLAT;
        this.datasourceRight = this.itemShipmentLAT;
        this.totalRightRecords = this.datasourceRight.length;
      }
    }
  }

  async getShipmentByListGoodsId(data: ListGoods): Promise<Shipment[]> {
    const id = data.id;
    let includes: any = [];
    includes.push(Constant.classes.includes.shipment.fromHubRouting);
    includes.push(Constant.classes.includes.shipment.shipmentStatus);
    includes.push(Constant.classes.includes.shipment.service);
    includes.push(Constant.classes.includes.shipment.fromHub);
    includes.push(Constant.classes.includes.shipment.toHub);
    includes.push(Constant.classes.includes.shipment.toHubRouting);
    includes.push(Constant.classes.includes.shipment.pickUser);
    includes.push(Constant.classes.includes.shipment.fromWard);
    includes.push(Constant.classes.includes.shipment.toWard);
    includes.push(Constant.classes.includes.shipment.fromDistrict);
    includes.push(Constant.classes.includes.shipment.fromProvince);
    includes.push(Constant.classes.includes.shipment.toDistrict);
    includes.push(Constant.classes.includes.shipment.toProvince);
    includes.push(Constant.classes.includes.shipment.deliverUser);
    includes.push(Constant.classes.includes.shipment.paymentType);
    includes.push(Constant.classes.includes.shipment.receiveHub);
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.structure);
    includes.push(Constant.classes.includes.shipment.serviceDVGT);
    includes.push(Constant.classes.includes.shipment.boxes);
    includes.push(Constant.classes.includes.shipment.transferUser);

    let shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes);
    return shipments;
  }

  async onGetListGoodsId(data: ListGoods): Promise<any> {
    // const id = data.id;
    // let includes: any = [];
    // includes.push(Constant.classes.includes.shipment.fromHubRouting);
    // includes.push(Constant.classes.includes.shipment.shipmentStatus);
    // includes.push(Constant.classes.includes.shipment.service);
    // includes.push(Constant.classes.includes.shipment.fromHub);
    // includes.push(Constant.classes.includes.shipment.toHub);
    // includes.push(Constant.classes.includes.shipment.toHubRouting);
    // includes.push(Constant.classes.includes.shipment.pickUser);
    // includes.push(Constant.classes.includes.shipment.fromWard);
    // includes.push(Constant.classes.includes.shipment.toWard);
    // includes.push(Constant.classes.includes.shipment.fromDistrict);
    // includes.push(Constant.classes.includes.shipment.fromProvince);
    // includes.push(Constant.classes.includes.shipment.toDistrict);
    // includes.push(Constant.classes.includes.shipment.toProvince);
    // includes.push(Constant.classes.includes.shipment.deliverUser);
    // includes.push(Constant.classes.includes.shipment.paymentType);
    // includes.push(Constant.classes.includes.shipment.receiveHub);
    // includes.push(Constant.classes.includes.shipment.sender);
    // includes.push(Constant.classes.includes.shipment.structure);
    // includes.push(Constant.classes.includes.shipment.serviceDVGT);
    // includes.push(Constant.classes.includes.shipment.boxes);
    // includes.push(Constant.classes.includes.shipment.transferUser);

    // let shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes);
    let shipments = await this.getShipmentByListGoodsId(data);
    if (shipments) {
      this.itemShipmentLAT = [...shipments];
      // console.log(this.itemShipmentLAT);
      this.itemShipmentLAT.logoUrl = this.generalInfo.logoUrl;
      this.itemShipmentLAT.companyName = this.generalInfo.companyName;
      this.itemShipmentLAT.hotLine = this.generalInfo.hotLine;
      this.itemShipmentLAT.centerHubAddress = this.generalInfo.addressMain;
      if (data.toHubName) {
        this.itemShipmentLAT.toHubName = data.toHubName;
      }
      if (data.fromHubName) {
        this.itemShipmentLAT.fromHubName = data.fromHubName;
      }
      if (data.typeName) {
        this.itemShipmentLAT.type = data.typeName;
      } else {
        this.itemShipmentLAT.type = ListGoodsTypeHelper.detailTranferTypeName;
      }
      this.itemShipmentLAT.createdBy = this.currentUser.fullName;
      this.itemShipmentLAT.createdPhone = this.currentUser.phoneNumber;
      if (this.currentUser.hub) {
        this.itemShipmentLAT.userHubName = this.currentUser.hub.name;
      }
      if (this.currentUser.department) {
        this.itemShipmentLAT.userDepartmentName = this.currentUser.department.name;
      }
      this.itemShipmentLAT.listGoods = data.code;
      this.itemShipmentLAT.dateCreate = new Date();

      this.totalSumPrice = 0;
      this.totalWeight = 0;
      this.totalCalWeight = 0;
      this.totalBox = 0;
      this.senderId = 0;
      shipments.forEach(async (item, index) => {
        if (item.pickUser) {
          this.itemShipmentLAT.currentEmp = item.pickUser.fullName;
          if (item.pickUser.hub) {
            this.itemShipmentLAT.empHubName = item.pickUser.hub.name;
          }
        }
        if (item.transferUser) {
          this.itemShipmentLAT.transferUserFullName = item.transferUser.fullName;
        }

        this.stt = index + 1;
        this.itemShipmentLAT[index].stt = this.stt;
        this.totalWeight += this.itemShipmentLAT[index].weight;
        this.itemShipmentLAT.totalWeight = this.totalWeight;
        if (this.itemShipmentLAT[index].calWeight) {
          this.totalCalWeight += this.itemShipmentLAT[index].calWeight;
          this.itemShipmentLAT.totalCalWeight = this.totalCalWeight;
        }
        if (
          !this.itemShipmentLAT[index].totalBox ||
          this.itemShipmentLAT[index].totalBox === 0
        ) {
          this.itemShipmentLAT[index].totalBox = 1;
        }
        this.totalBox += this.itemShipmentLAT[index].totalBox;
        this.itemShipmentLAT.totalBox = this.totalBox;
        if (item.paymentTypeId) {
          if (item.paymentTypeId === PaymentTypeHelper.NGTTN) {
            this.itemShipmentLAT[index].sumPrice = item.totalPrice;
          }
          if (item.paymentTypeId === PaymentTypeHelper.NNTTN) {
            this.itemShipmentLAT[index].sumPrice = item.cod + item.totalPrice;
          }
          this.totalSumPrice += this.itemShipmentLAT[index].sumPrice;
          this.itemShipmentLAT.totalSumPrice = this.totalSumPrice;
        }

        this.senderId = this.itemShipmentLAT[index].senderId;
        let sender = await this.customerService.getAsync(this.senderId);
        if (sender.data) {
          this.itemShipmentLAT[index].companyFrom = sender.data["companyName"];
        }
        this.itemShipmentLAT[index].fakeId =
          "id" + shipments[index].id;
        const time = new Date();
        this.itemShipmentLAT.getFullYear = time.getFullYear();
      });
      return this.itemShipmentLAT;
    }
  }

  async exportCSVShipment(data: ListGoods) {
    const shipments = await this.getShipmentByListGoodsId(data);
    const listGoodsCode = data.code;
    if (shipments) {
      let data: any[] = [];
      data.push([
        'Mã bảng kê',
        'Mã vận đơn',
        'Ngày tạo',
        'Khách hàng gửi',
        'Số kiện',
        'Số Kg',
        'Địa chỉ giao',
        'Tên người nhận',
        'Tên người nhận thực tế',
        'Ngày giờ giao thực tế',
      ]);

      shipments.map((shipment) => {
        let ship = Object.assign({}, shipment);
        ship.orderDate = SearchDate.formatDate(shipment.orderDate);
        ship.endDeliveryTime = SearchDate.formatDate(shipment.endDeliveryTime);
        data.push([
          listGoodsCode,
          ship.shipmentNumber,
          ship.orderDate,
          ship.senderName,
          ship.totalBox,
          ship.weight / 1000,
          ship.shippingAddress,
          ship.receiverName,
          ship.realRecipientName,
          ship.endDeliveryTime
        ]);
      });

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);

      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      /* save to file */
      const wbout: string = XLSX.write(wb, this.wopts);
      saveAs(new Blob([InputValue.s2ab(wbout)]), this.fileName);
    }
  }

  onFilter() {
    count_click++;
    if (this.clickedFilter == false) {
      this.status_dropdown_menu = 1;
      this.clickedFilter = true;
    } else {
      this.status_dropdown_menu = 0;
      this.clickedFilter = false;
    }
    if (count_click % 2 !== 0) {
      $(".new-dropdown-menu").show();
      $(document).mouseup(function (e) {
        var container = $(".new-dropdown-menu");
        var btnfilter = $("#buttton-filter");
        if (
          !container.is(e.target) &&
          container.has(e.target).length === 0 &&
          !btnfilter.is(e.target)
        ) {
          $(".new-dropdown-menu").hide();
          count_click = 0;
        }
      });
    } else {
      $(".new-dropdown-menu").hide();
    }
  }

  // dateRangePicker
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public eventLog = "";

  public selectedDate(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;
    //
    this.requestGetPickupHistory.fromDate = moment(value.start).toDate();
    this.requestGetPickupHistory.toDate = moment(value.end).toDate();

    this.selectedDateFrom = this.requestGetPickupHistory.fromDate;
    this.selectedDateTo = this.requestGetPickupHistory.toDate;
    // this.loadLazyListAssignedTransfer(this.eventListAssigned);

    this.dateFrom = this.selectedDateFrom.toISOString();
    this.dateTo = this.selectedDateTo.toISOString();
    this.loadListAssignedTransfer();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  onSelectTabTwo() {
    this.isActiveTabOne = false;
  }

  exportCSV(dt: Table) {
    if (this.listDataLATExportExcel) {
      if (this.listDataLATExportExcel.length > 0) {
        dt._value = this.listDataLATExportExcel;
      }
    } else {
      dt._value = [];
    }
    dt.exportCSV();
  }

  async Edit(rowData) {
    this.shipmentFilterViewModelLeft.ShipmentNumberListUnSelect = [];
    this.shipmentFilterViewModelRight.ShipmentNumberListSelect = [];

    this.refresh();

    this.isEditLg = true;
    this.ListGoodID = rowData.id;

    let rs = await this.listGoodsService.getAsync(rowData.id);

    if (rs.isSuccess) {
      this.cloneRowDataListGood = rs.data;
      let data = rs.data;
      this.transportType = { tplId: data.tplId, transportTypeId: data.transportTypeId };
      this.onSelectedTransportTypes();
      this.truckNumber = data.truckNumber;
      this.realWeight = data.realWeight;
      this.mawb = data.mawb;
      this.startExpectedTime = data.startExpectedTime ? moment(data.startExpectedTime).toDate() : null;
      this.endExpectedTime = data.endExpectedTime ? moment(data.endExpectedTime).toDate() : null;
      this.selectedRider = this.riders.find(x => x.value.id == data.empId).value;

      let res = await this.getListTruckScheduleByTruckNumber();
      if (res) {
        this.lstTruckSchedule = res;
        this.selectedTruckSchedule = data.truckScheduleId;
      }

      setTimeout(() => {
        this.selectedReceiverHub = data.toHubId;
      }, 1000);
      this.sealNumber = data.sealNumber;
      this.note = data.note;

      this.isActiveTabOne = true;

      this.cloneItemShipmentLAT = this.datasourceRightClient = this.datasourceRight = this.listDataRight = await this.getByListGoodsIdAsync(data.id);
      this.arrSelectedShipmentNumber = this.datasourceRightClient.map(x => x.shipmentNumber);
      this.ShipmentIds = this.datasourceRightClient.map(x => x.id);

      // this.datasourceRightClient.forEach(element => {
      //   this.shipmentFilterViewModelLeft.ShipmentNumberListUnSelect.push(element.shipmentNumber);
      //   this.shipmentFilterViewModelRight.ShipmentNumberListSelect.push(element.shipmentNumber);
      //   this.ShipmentIds.push(element.id);
      // });

      // this.loadShipmentPagingLeft();
      // this.datasourceRightClient = await this.loadShipmentRight();
    }
  }

  async getByListGoodsIdAsync(id) {
    let includes = [
      Constant.classes.includes.shipment.package,
      Constant.classes.includes.shipment.service,
      Constant.classes.includes.shipment.toHub,
      Constant.classes.includes.shipment.sender
    ];

    let lstShipment = await this.shipmentService.getByListGoodsIdAsync(id, includes);

    return lstShipment;
  }

  async changeTruckNumber() {
    if (!this.truckNumber) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập biển số"
      });
      return;
    }
    let res = await this.getListTruckScheduleByTruckNumber();
    if (res) {
      this.lstTruckSchedule = res;
      this.selectedTruckSchedule = this.lstTruckSchedule[1].value;
      this.changeTruckSchedule();
    }
    else {
      this.lstTruckSchedule = [];
    }
  }

  async getListTruckScheduleByTruckNumber() {
    let cols = [
      Constant.classes.includes.truckSchedule.fromHub,
      Constant.classes.includes.truckSchedule.toHub,
      Constant.classes.includes.truckSchedule.truckScheduleStatus,
      Constant.classes.includes.truckSchedule.truck
    ];

    let res = await this.truckScheduleService.GetSelectModelByTruckNumber(this.truckNumber, cols);
    return res;
  }

  changeTruckSchedule() {
    let truckSchedule = this.lstTruckSchedule.find(x => x.value == this.selectedTruckSchedule);
    if (truckSchedule) {
      this.selectedRider = truckSchedule.data.riders ? this.riders.find(x => x.value.id == truckSchedule.data.riders[0].id).value : null;
       }
    else {
      this.selectedRider = this.selectedRider;
    }
  }

  changeInputSwitchTransferAllHub() {
    this.shipmentFilterViewModelLeft.PageNumber = 1;
    if (this.isTransferAllHub) {
      this.shipmentFilterViewModelLeft.Type = ShipmentTypeHelper.transferallhub;
      this.shipmentFilterViewModelRight.Type = ShipmentTypeHelper.transferallhub;
    } else {
      this.shipmentFilterViewModelLeft.Type = ShipmentTypeHelper.transfer;
      this.shipmentFilterViewModelRight.Type = ShipmentTypeHelper.transferallhub;
    }
    this.loadShipmentPagingLeft();
  }
}
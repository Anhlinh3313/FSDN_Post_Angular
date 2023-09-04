import {
  Component,
  OnInit,
  ElementRef,
  ViewChild
} from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem, CheckboxModule } from "primeng/primeng";
import {
  ShipmentService,
  UserService,
  ReasonService,
  ListGoodsService,
  AuthService,
  DepartmentService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { Shipment } from "../../../models/shipment.model";
import {
  User,
  Customer,
  Reason
} from "../../../models/index";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { FormControl } from "@angular/forms";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";

import { DaterangepickerConfig } from "ng2-daterangepicker";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { ListGoods } from "../../../models/listGoods.model";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { InformationComponent } from "../../../infrastructure/information.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { GeneralInfoModel } from "../../../models/generalInfo.model";

declare var $: any;

@Component({
  selector: "follow-list",
  templateUrl: "follow-list.component.html",
  styles: [
    `
      agm-map {
        height: 200px;
      }
    `
  ]
})
export class FollowListComponent extends InformationComponent implements OnInit {
  idPrint: string;
  isDetailReturn: boolean;
  isReceipTransfer: boolean;
  isDetailTransfer: boolean;
  isDetailDelivery: boolean;
  toHubName: any;
  totalBox: number;
  totalCalWeight: number;
  totalWeight: any;
  totalSumPrice: any;
  dateCreate: any;
  isRefusePickup: boolean;
  saveEvent: any;
  txtFilterGb: any;
  selectFromHubs: number;
  lostPackageNote: string;
  showItemShipment: string;
  gbModelRef: BsModalRef;
  first: number = 0;
  txtNote: any;
  fromHub: string;
  listGoods: any;
  itemShipment: any = [];
  stt: number;
  constructor(
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private daterangepickerOptions: DaterangepickerConfig,
    private listGoodsService: ListGoodsService,
    protected generalInfoService: GeneralInfoService,
    protected authService: AuthService,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    private departmentService: DepartmentService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(generalInfoService, authService, messageService,permissionService,router);
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
  parentPage: string = Constant.pages.historyPrint.name;
  currentPage: string = Constant.pages.historyPrint.children.followList.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;

  //
  // selectedData: Shipment[];
  // listData: Shipment[];
  //
  selectedData: ListGoods[];
  listData: ListGoods[];

  //
  selectedDateFrom: Date;
  selectedDateTo: Date;

  //
  fromHubRoutings: SelectItem[];
  selectedFromHubRouting: number;
  //
  toHubRoutings: SelectItem[];
  selectedToHubRouting: number;
  //
  selectedReasonPickupCancel: ReasonService;
  reasonPickupCancel: ReasonService[];
  reasonsPickupCancel: Reason;
  note: string;
  //
  reasons: SelectItem[];
  selectedReason: Reason;
  // selectedReason: ReasonService;
  // reasons: ReasonService[];
  // reasons: Reason;

  //
  columns: string[] = [
    "code",
    "name",
    "id",
    "listGoodsTypeId",
    "numPrint",
    "createdByHub",
    "createdHub",
    "createdWhen",
    "listGoodsType.name"
  ];
  // datasource: Shipment[];
  datasource: ListGoods[];
  totalRecords: number;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  //

  //
  data: Shipment;
  //
  customers: SelectItem[];
  selectedCustomer: Customer;
  //
  fromProvinces: SelectItem[];
  fromSelectedProvince: number;
  //
  fromDistricts: SelectItem[];
  fromSelectedDistrict: number;
  //
  fromWards: SelectItem[];
  fromSelectedWard: number;
  //
  fromCenterHubs: SelectItem[];
  fromSelectedCenterHub: number;
  //
  fromPoHubs: SelectItem[];
  fromSelectedPoHub: number;
  //
  fromStationHubs: SelectItem[];
  fromSelectedStationHub: number;

  //
  toProvinces: SelectItem[];
  toSelectedProvince: number;
  //
  toDistricts: SelectItem[];
  toSelectedDistrict: number;
  //
  toWards: SelectItem[];
  toSelectedWard: number;
  //
  toCenterHubs: SelectItem[];
  toSelectedCenterHub: number;
  //
  toPoHubs: SelectItem[];
  toSelectedPoHub: number;
  //
  toStationHubs: SelectItem[];
  toSelectedStationHub: number;
  //
  statuses: SelectItem[];
  selectedStatus: string;
  //
  riders: SelectItem[];
  selectedRider: number;
  //
  employees: SelectItem[];
  selectedEmployee: number;
  //
  dateAppointments: SelectItem[];
  selectedDateAppointment: Date;
  //
  defaultStatusesRight: ShipmentStatus[];
  statusesUpdate: SelectItem[];
  selectedStatusUpdate: number;
  //
  paymentTypeHelper: PaymentTypeHelper = PaymentTypeHelper;
  totalMoneyRiderHold: number = 0;
  //
  currentUser: User;
  printTypes: SelectItem[];
  selectedPrintType: number;

  public latitudeFrom: number;
  public longitudeFrom: number;
  public latitudeTo: number;
  public longitudeTo: number;
  public searchFromControl: FormControl;
  public searchToControl: FormControl;
  public zoom: number;
  @ViewChild("searchFrom") searchFromElementRef: ElementRef;
  @ViewChild("searchTo") searchToElementRef: ElementRef;

  currentDate = new Date();
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();

  public singlePickerDateFrom = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: "01/01/2017"
  };

  public singlePickerDateTo = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: this.currentDate
  };

  async ngOnInit() {
    //   this.initData();
    this.loadListGoods();
    this.loadCurrentUser();
    this.loadGeneralInfo();
    this.selectedDateTo = new Date();
    $("#print-section").hide();
  }

  async loadGeneralInfo() {
    this.generalInfo = await this.generalInfoService.getAsync();
  }

  refresh() {
    //   this.initData();
    this.loadListGoods();
    this.first = 0;
    this.selectedData = null;
    this.selectedPrintType = null;
    this.txtFilterGb = null;
  }

  public singleSelectFrom(value: any) {
    this.selectedDateFrom = moment(value.start).toDate();
    this.loadLazy(this.event);
  }

  public singleSelectTo(value: any) {
    this.selectedDateTo = moment(value.start).toDate();
    this.loadLazy(this.event);
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

  // initData() {
  //   // this.data = new Shipment();
  //   // this.fromSelectedCenterHub = null;

  //   this.requestShipmentService.getAll().subscribe(x => {
  //     this.datasource = x.data as Shipment[];
  //     this.totalRecords = this.datasource.length;
  //     this.listData = this.datasource.slice(0, this.rowPerPage);
  //     // console.log(this.datasource);
  //   });

  //   this.data = null;
  //   this.selectedData = null;
  //   this.isNew = true;

  //   //refresh
  //   this.selectedDateFrom = new Date(2017,0,1);
  //   this.selectedDateTo = new Date();
  //   this.txtFilterGb = null;
  // }

  async loadListGoods() {
    let includes = [
      Constant.classes.includes.listGoods.tpl,
      Constant.classes.includes.listGoods.listGoodsType,
      Constant.classes.includes.listGoods.listGoodsStatus,
      Constant.classes.includes.listGoods.fromHub,
      Constant.classes.includes.listGoods.toHub
    ];
    const listGoods = await this.listGoodsService.getAllAsync(includes);
    if (listGoods) {
      this.datasource = listGoods;
      // console.log(this.datasource);
      this.totalRecords = this.datasource.length;
      this.listData = this.datasource.slice(0, this.rowPerPage);
      this.loadDateAppointment();
      this.loadPrintType();
    }
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
        if (event.filters.length > 0) {
          filterRows = this.datasource.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        } else {
          filterRows = this.datasource.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );
        }

        //Begin Custom filter
        if (this.selectedDateFrom && this.selectedDateTo) {
          //
          filterRows = filterRows.filter(x =>
            moment(x.createdWhen).isBetween(
              this.selectedDateFrom,
              this.selectedDateTo
            )
          );
        } else if (this.selectedDateFrom) {
          filterRows = filterRows.filter(x =>
            moment(x.createdWhen).isAfter(this.selectedDateFrom)
          );
        } else if (this.selectedDateTo) {
          filterRows = filterRows.filter(x =>
            moment(x.createdWhen).isBefore(this.selectedDateTo)
          );
          //
        }

        if (this.selectedPrintType) {
          filterRows = filterRows.filter(
            x => x.listGoodsType.id === this.selectedPrintType
          );
        }

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecords = filterRows.length;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  loadDateAppointment() {
    this.selectedDateAppointment = null;
    let uniqueDateAppointment = [];
    this.dateAppointments = [];

    this.datasource.forEach(x => {
      if (uniqueDateAppointment.length === 0) {
        this.dateAppointments.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueDateAppointment.indexOf(x.createdWhen) === -1 &&
        x.createdWhen
      ) {
        uniqueDateAppointment.push(x.createdWhen);
        this.dateAppointments.push({
          label: moment(x.createdWhen).format(environment.formatDateTime),
          value: x.createdWhen
        });
      }
    });
    let uniqueDateAppointments = FilterUtil.removeDuplicates(
      this.dateAppointments,
      "label"
    );
    this.dateAppointments = uniqueDateAppointments;
  }

  async loadCurrentUser() {
    let cols = [
      Constant.classes.includes.user.hub,
      Constant.classes.includes.user.department
    ];
    const id = this.authService.getUserId();
    this.currentUser = await this.userService.getAsync(id, cols);
    if (this.currentUser.hub) {
      this.fromHub = this.currentUser.hub.name;
    }
  }

  loadDepartmentService(id: number) {
    return this.departmentService.get(id).map(x => {
      let data = x.data;
      return data;
    });
  }

  loadPrintType() {
    this.selectedPrintType = null;
    let uniquePrintType = [];
    this.printTypes = [];

    this.datasource.forEach(x => {
      if (uniquePrintType.length === 0) {
        this.printTypes.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniquePrintType.indexOf(x.listGoodsType.code) === -1 &&
        x.listGoodsType.code
      ) {
        uniquePrintType.push(x.listGoodsType.code);
        this.printTypes.push({
          label: x.listGoodsType.name,
          value: x.listGoodsType.id
        });
      }
    });
  }

  async onRePrint(data: ListGoods) {
    this.itemShipment = await this.onGetListGoodsId(data);
    if (this.itemShipment) {
      const shipmentIds = this.itemShipment.map(x => x.id);
      data.numPrint += 1;
      data.shipmentIds = shipmentIds;
      this.listGoodsService.updateAsync(data);
      this.idPrint = ListGoodsTypeHelper.printListGoodType(data.listGoodsType.id);
      setTimeout(() => {
        this.itemShipment.isPrintBareCode = true;
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
      }, 0);
    }
  }

  async onGetListGoodsId(data: ListGoods): Promise<any> {
    let id = data.id;
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
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.structure);
    includes.push(Constant.classes.includes.shipment.serviceDVGT);
    includes.push(Constant.classes.includes.shipment.boxes);
    includes.push(Constant.classes.includes.shipment.transferUser);

    let shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes);
    if (shipments) {
      this.itemShipment = [...shipments];
      this.itemShipment.logoUrl = this.generalInfo.logoUrl;
      this.itemShipment.companyName = this.generalInfo.companyName
      this.itemShipment.hotLine = this.generalInfo.hotLine;
      this.itemShipment.centerHubAddress = this.generalInfo.addressMain;
  
      if (data.toHub) {
        this.toHubName = data.toHub.name;
        this.itemShipment.toHubName = data.toHub.name;
      }
      this.itemShipment.type = data.listGoodsType.name;
      this.itemShipment.createdBy = this.currentUser.fullName;
      if (this.currentUser.hub) {
        this.itemShipment.userHubName = this.currentUser.hub.name;
      }
      if (this.currentUser.department) {
        this.itemShipment.userDepartmentName = this.currentUser.department.name;
      }
      
      this.itemShipment.listGoods = data.code;
      this.dateCreate = SearchDate.formatToISODate(new Date());
      this.itemShipment.dateCreate = SearchDate.formatToISODate(new Date());

      this.totalSumPrice = 0;
      this.totalWeight = 0;
      this.totalCalWeight = 0;
      this.totalBox = 0;
      
      await Promise.all(this.itemShipment.map(async (item, index) => {
        if (item.pickUser) {
          this.itemShipment.currentEmp = item.pickUser.fullName;
          if (item.pickUser.hub) {
            this.itemShipment.empHubName = item.pickUser.hub.name;
          }
          if (item.pickUser.departmentId) {
            const data = await this.departmentService.getDepartmentAsync(item.pickUser.departmentId);
            if (data) {
              this.itemShipment.empDepartmentName = data.name;
            }
          }
        }
  
        if (item.transferUser) {
          this.itemShipment.transferUserFullName = item.transferUser.fullName;
        }
  
        this.stt = index + 1;
        this.itemShipment[index].stt = this.stt;
        this.totalWeight += this.itemShipment[index].weight;
        this.itemShipment.totalWeight = this.totalWeight;
        if (this.itemShipment[index].calWeight) {
          this.totalCalWeight += this.itemShipment[index].calWeight;
          this.itemShipment.totalCalWeight = this.totalCalWeight;
        }
        if (
          !this.itemShipment[index].totalBox ||
          this.itemShipment[index].totalBox === 0
        ) {
          this.itemShipment[index].totalBox = 1;
        }
        this.totalBox += this.itemShipment[index].totalBox;
        this.itemShipment.totalBox = this.totalBox;
        if (item.paymentTypeId !== PaymentTypeHelper.NNTTN) {
          this.itemShipment[index].sumPrice = item.cod;
        } else {
          this.itemShipment[index].sumPrice = item.cod + item.totalPrice;
        }
        this.totalSumPrice += this.itemShipment[index].sumPrice;
        this.itemShipment.totalSumPrice = this.totalSumPrice;
        this.itemShipment[index].fakeId =
          "id" + shipments[index].id;
        const time = new Date();
        this.itemShipment.getFullYear = time.getFullYear();
      }));
      return this.itemShipment;
    }
  }

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  removeSelectedData(listRemove: ListGoods[]) {
    let listClone = Array.from(this.listData);
    for (var key in listRemove) {
      let obj = listRemove[key];
      listClone.splice(listClone.indexOf(obj), 1);
      this.datasource.splice(this.datasource.indexOf(obj), 1);
    }

    this.listData = listClone;
    this.selectedData = null;
  }

  changeDateAppointment() {
    this.selectedData = [];
    this.loadLazy(this.event);
  }

  changePrintTypes() {
    this.selectedData = [];
    this.loadLazy(this.event);
  }

  // findSelectedDataIndex(): number {
  //   return this.listData.indexOf(this.selectedData);
  // }

  ///////DateRangePicker
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public eventLog = "";

  public selectedDate(value: any, dateInput: any) {
    this.selectedData = [];
    dateInput.start = value.start;
    dateInput.end = value.end;

    //
    this.requestGetPickupHistory.fromDate = moment(value.start).toDate();
    this.requestGetPickupHistory.toDate = moment(value.end).toDate();

    this.selectedDateFrom = this.requestGetPickupHistory.fromDate;
    this.selectedDateTo = this.requestGetPickupHistory.toDate;
    this.loadLazy(this.event);
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }
}

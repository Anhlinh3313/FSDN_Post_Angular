import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import {
  ShipmentService,
  UserService,
  AuthService,
  CustomerService,
  HubService,
  DepartmentService,
  ListGoodsService,
  ShipmentStatusService,
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  User,
  Customer,
} from "../../../models/index";
import {
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { FormControl } from "@angular/forms";
import { RequestShipment } from "../../../models/RequestShipment.model";
import { ShipmentDetailComponent } from "../../shipment-detail/shipment-detail.component";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";

///////////////Daterangepicker
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { ListGoods } from "../../../models/listGoods.model";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { SelectModel } from "../../../models/select.model";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { Table } from "primeng/table";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { ShipmentDeliveryByListGoods } from "../../../models/abstract/shipmentDeliveryByListGoods.interface";

@Component({
  selector: "wait-assign-delivery",
  templateUrl: "wait-assign-delivery.component.html",
  styles: [
    `
      agm-map {
        height: 200px;
      }
    `
  ]
})
export class WaitAssignDeliveryComponent extends BaseComponent
  implements OnInit {
  sortOrderLeft: number;
  txtShipmentNumberInLg: string = "";
  sortOrder: number;
  sortField: string;
  unit = environment.unit;
  // centerPoStationHub = environment.centerPoStationHub;
  hub = environment;


  editListGoodsId: number;
  cloneItemShipmentLAD: Shipment[];
  isEditLAD: boolean;
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'binary' };
  fileName: string = 'ListGoodsDelivery.xlsx';
  listDataLADExportExcel: ListGoods[];
  listDataLADExportExcel_2: ListGoods[];
  generalInfo: GeneralInfoModel;
  checkShipmentInfo: boolean;
  totalBox: number;
  txtFilterGbLAD: any;

  isActiveTabOne: boolean = true;
  isActiveTabTwo: boolean = false;
  isActiveTabThree: boolean = false;

  reviewChecked: boolean;
  deliveryHubOther: boolean = false;
  idPrint: string;
  fromHub: string;
  currentUser: User;
  totalCalWeight: number;
  totalWeight: number;
  totalSumPrice: any;
  checkSubmitAndPrint: boolean;
  checkSubmit: boolean;
  objPickUsers: User[];
  objRiders: User[];
  saveEvent: any;
  txtFilterGb: any;
  selectFromHubs: number;
  lostPackageNote: string;
  showItemShipment: string;
  gbModelRef: BsModalRef;
  first: number = 0;
  widthFrozen: string = "419px";
  unFrozenWidth: string = "671px";
  generatorBarcode: string;
  itemShipment: any = [];
  stt: number;
  listGoods: any;
  dateCreate: any;
  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  // shipmentNumberListUnSelect: string[] = [];
  // shipmentNumberListSelect: string[] = [];
  pageNum: number = 1;

  @ViewChild('txtAssignShipment') txtAssignShipment: ElementRef;
  @ViewChild('txtUnAssignShipment') txtUnAssignShipment: ElementRef;

  constructor(
    private modalService: BsModalService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private customerService: CustomerService,
    private authService: AuthService,
    private hubService: HubService,
    private daterangepickerOptions: DaterangepickerConfig,
    private generalInfoService: GeneralInfoService,
    private printFrormServiceInstance: PrintFrormServiceInstance,
    private listGoodsService: ListGoodsService,
    private departmentService: DepartmentService,
    private shipmentStatusService: ShipmentStatusService,
    public permissionService: PermissionService,
    public router: Router,
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

    // let includes: string = Constant.classes.includes.shipment.toHubRouting + "," +
    //   Constant.classes.includes.shipment.service + "," +
    //   Constant.classes.includes.shipment.shipmentStatus + "," +
    //   Constant.classes.includes.shipment.sender + "," +
    //   Constant.classes.includes.shipment.listGoods + "," +
    //   Constant.classes.includes.listGoods.createdByHub;
    let includes: string = "";

    // shipnhnah muốn lọc danh sách nhatf gửi tăng dần
    if (environment.namePrint === "Shipnhanh") {
      this.shipmentFilterViewModel.isSortDescending = false;
    }
    this.shipmentFilterViewModel.Cols = includes;
    this.shipmentFilterViewModel.PageNumber = this.pageNum;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
  }
  parentPage: string = Constant.pages.deliveryManagement.name;
  currentPage: string = Constant.pages.deliveryManagement.children.waitAssignDelivery.name;

  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;

  //
  selectedData: Shipment[] = [];
  listData: Shipment[] = [];

  //
  selectedDateFrom: Date = moment(new Date()).hour(0).minute(0).second(1).toDate();
  selectedDateTo: Date = moment(new Date()).hour(23).minute(59).second(0).toDate();

  //
  // selectedPickUser: User;
  // pickUser: User[];

  pickUser: SelectItem[];
  selectedPickUser: number;

  //
  riders: SelectModel[];
  selectedRider: number;

  //
  toHubRoutings: SelectItem[];
  selectedToHubRouting: number;

  //
  senderNames: SelectItem[];
  selectedSenderNames: number;

  //
  dateAppointments: SelectItem[];
  selectedDateAppointment: Date;

  columns: string[] = [
    "shipmentNumber",
    "pickUserId.fullName",
    "orderDate",
    "totalPrice",
    "numPick",
    "cod",
    "deliveryupAppointmentTime",
    "cusNote",
    "receiverName",
    "receiverPhone",
    "deliveryAddress",
    "deliveryNote",
    "fromHubRouting.name",
    "senderName",
    "senderPhone",
    "companyFrom",
    "pickingAddress",
    "fromHub.name",
    "fromHub",
    "fromProvinceId.name",
    "fromWard",
    "fromWard.district.province",
    "fromWardID",
    "shipmentStatus.name",
    "receiverName",
    "receiverPhone",
    "companyTo",
    "shippingAddress",
    "toProvinceId",
    "toProvinceId.name",
    "toHub",
    "toHub.name",
    "toWard",
    "toWard.district.province",
    "toWardId",
    "toHubRouting"
  ];
  columnsLAD: string[] = [
    "code",
    "createdWhen",
    "transferUser.fullName",
    "transportTypeId",
    "transportTypeId",
    "totalShipment",
    "realWeight",
    "toHub.name",
    "listGoodsStatus.name"
  ];
  columnsLADExport = [
    { field: 'code', header: 'Mã BK' },
    { field: 'createdWhen', header: 'TG tạo' },
    { field: 'fromHub.name', header: 'TT/CN/T phát' },
    { field: 'emp.fullName', header: 'Nhân viên' },
    // { field: 'totalDeliveryComplete', header: 'Vđ phát TC' },
    { field: 'totalShipment', header: 'Tổng vận đơn' },
    { field: 'totalBillUnFinish', header: 'Tổng vđ phát không tc' },
    { field: 'realWeight', header: 'Tổng TL ' + environment.unit }
  ];
  datasource: Shipment[];
  totalRecords: number = 0;
  rowPerPage: number = 20;
  event: LazyLoadEvent;

  fromDate: any = moment(new Date).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
  toDate: any = moment(new Date()).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
  //

  totalRecordsRight: number = 0;

  listDataLAD: ListGoods[];
  selectedDataLAD: ListGoods[];
  totalRecordsLAD: number;
  datasourceLAD: ListGoods[];
  eventListAssigned: LazyLoadEvent;

  //
  columnsLAD_2: string[] = [
    "code",
    "createdWhen",
    "transferUser.fullName",
    "transportTypeId",
    "transportTypeId",
    "totalShipment",
    "totalBillFinish",
    "totalBillFinishByMobile",
    "realWeight",
    "toHub.name",
    "listGoodsStatus.name"
  ];
  columnsLADExport_2 = [
    { field: 'code', header: 'Mã BK' },
    { field: 'createdWhen', header: 'TG tạo' },
    { field: 'fromHub.name', header: 'TT/CN/T phát' },
    { field: 'emp.fullName', header: 'Nhân viên' },
    // { field: 'totalDeliveryComplete', header: 'Vđ phát TC' },
    { field: 'totalShipment', header: 'Tổng vận đơn' },
    { field: 'totalBillFinish', header: 'Tổng vđ phát tc' },
    { field: 'totalBillUnFinish', header: 'Tổng vđ phát không tc' },
    { field: 'totalBillFinishByMobile', header: 'Tổng vđ phát mobile tc' },
    { field: 'realWeight', header: 'Tổng TL ' + environment.unit }
  ];

  listDataLAD_2: ListGoods[];
  selectedDataLAD_2: ListGoods[];
  totalRecordsLAD_2: number;
  datasourceLAD_2: ListGoods[];
  eventListAssigned_2: LazyLoadEvent;

  fromDate_2: any = moment(new Date).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
  toDate_2: any = moment(new Date()).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
  hubId: any;
  empId: any;
  //

  //
  data: Shipment;
  //
  customers: SelectItem[];
  selectedCustomer: Customer;
  //
  statuses: SelectItem[];
  selectedStatus: string;
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
  paymentTypeHelper: any = PaymentTypeHelper;
  totalMoneyRiderHold: number = 0;

  //
  employees: SelectItem[];
  selectedEmployee: number;
  selectedEmployee_2: number;
  //

  //
  hubs: SelectItem[];
  selectedHub: number;
  selectedHub_2: number;
  //
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

  async ngOnInit() {
    // this.initData();
    this.loadFilterLAD();
    this.loadFilterHub();
    this.loadShipment();
    await this.loadCurrentUser();
    this.loadRider();
    this.loadListAssignedDelivery();
    this.getReportBroadcastListGoodsByAppAndMobilAsync();
    this.loadGeneralInfo();
    this.selectedDateTo = new Date();
    if (this.shipmentFilterViewModel.isSortDescending) {
      this.sortOrderLeft = -1;
    } else {
      this.sortOrderLeft = 1;
    }
  }

  ngAfterViewInit() {
  }

  async loadShipmentPaging() {
    let shipments: any;

    let shipmentUnselect = this.selectedData.map(ship => ship.shipmentNumber);
    if (this.deliveryHubOther == true) {
      this.shipmentFilterViewModel.Type = ShipmentTypeHelper.WaitingToDeliveryAndHubOther;
      this.shipmentFilterViewModel.ShipmentNumberListUnSelect = shipmentUnselect;
      shipments = await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel);
      if (shipments["isSuccess"]) {
        this.datasource = shipments["data"];
        this.totalRecords = shipments["dataCount"];
        this.listData = this.datasource;
      }
    } else {
      this.shipmentFilterViewModel.Type = ShipmentTypeHelper.waitingForDelivery;
      this.shipmentFilterViewModel.ShipmentNumberListUnSelect = shipmentUnselect;
      shipments = await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel);
      if (shipments["isSuccess"]) {
        this.datasource = shipments["data"];
        this.totalRecords = shipments["dataCount"];
        this.listData = this.datasource;
      }
    }
  }

  async loadShipment() {
    await this.loadShipmentPaging();
    this.loadFilter();
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;

    //imitate db connection over a network
    setTimeout(() => {
      // if (this.reviewChecked) {
      //   this.listData = this.selectedData;
      //   this.totalRecords = this.selectedData.length;
      // } else 
      if (this.datasource) {
        var filterRows = this.datasource;

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listData = filterRows;
        // this.totalRecords = filterRows.length;
      }
    }, 250);
  }

  async loadRider() {
    this.selectedRider = null;
    this.riders = [];
    this.objRiders = [];
    if (this.deliveryHubOther == true) {
      this.riders = await this.userService.getSelectModelRiderAllHubAsync();
      if (this.riders) {
        this.objRiders = this.riders.map(x => x.data);
      }
    } else {
      this.riders = await this.userService.getSelectModelAllRiderInCenterByHubIdAsync(this.currentUser.hubId);
      if (this.riders) {
        this.objRiders = this.riders.filter(x => x.data).map(x => x.data);
      }
    }
  }

  async loadGeneralInfo() {
    this.generalInfo = await this.generalInfoService.getAsync();
  }

  refresh() {
    // this.initData();
    this.loadShipmentPaging();
    this.first = 0;
    this.selectedData = [];
    this.totalRecordsRight = 0;
    this.selectedRider = null;
    this.txtFilterGb = null;
    this.reviewChecked = false;
    this.isEditLAD = false;
    this.cloneItemShipmentLAD = [];
    this.editListGoodsId = null;
  }

  async openModel(template: TemplateRef<any>, data: Shipment = null) {
    this.showItemShipment = data.shipmentNumber;

    this.gbModelRef = this.modalService.show(ShipmentDetailComponent, {
      class: "inmodal animated bounceInRight modal-lg"
    });
    let includes = [
      Constant.classes.includes.shipment.fromHub,
      Constant.classes.includes.shipment.toHub,
      Constant.classes.includes.shipment.fromWard,
      Constant.classes.includes.shipment.fromDistrict,
      Constant.classes.includes.shipment.fromProvince,
      Constant.classes.includes.shipment.fromHub,
      Constant.classes.includes.shipment.toWard,
      Constant.classes.includes.shipment.toDistrict,
      Constant.classes.includes.shipment.toProvince,
      Constant.classes.includes.shipment.shipmentStatus,
      Constant.classes.includes.shipment.paymentType,
      Constant.classes.includes.shipment.service,
      Constant.classes.includes.shipment.serviceDVGT,
    ];

    let shipment = await this.shipmentService.trackingShortAsync(this.showItemShipment, includes);
    if (shipment) {
      this.gbModelRef.content.loadData(shipment);
    }
  }


  allSelect(event) {
    if (event.checked) {
      this.selectedData = this.listData;
    }
  }

  assignRider() {
    this.messageService.clear();
    if (!this.isValidAssignRider()) return;
    this.choiceRider();
  }

  assignRiderAndPrint(isPrintBareCode: boolean) {
    if (!this.isValidAssignRider()) return;
    this.choiceRiderAndPrint(isPrintBareCode);
  }

  isValidAssignRider(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedData || this.selectedData.length === 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      result = false;
    } else {
      this.selectedData.forEach(x => {
        if (!this.checkShipmentInfo) {
          if (!x.paymentTypeId) {
            messages.push({
              severity: Constant.messageStatus.warn,
              detail: "Vận đơn " + x.shipmentNumber + " không có HTTT"
            });
            result = false;
          }
          if (!x.serviceId) {
            messages.push({
              severity: Constant.messageStatus.warn,
              detail: "Vận đơn " + x.shipmentNumber + " không có dịch vụ"
            });
            result = false;
          }
          if (!x.receiverName) {
            messages.push({
              severity: Constant.messageStatus.warn,
              detail: "Vận đơn " + x.shipmentNumber + " không có tên người nhận"
            });
            result = false;
          }
          if (!x.receiverPhone) {
            messages.push({
              severity: Constant.messageStatus.warn,
              detail: "Vận đơn " + x.shipmentNumber + " không có số đt người nhận"
            });
            result = false;
          }
          if (!x.shippingAddress) {
            messages.push({
              severity: Constant.messageStatus.warn,
              detail: "Vận đơn " + x.shipmentNumber + " không có địa chỉ nhận"
            });
            result = false;
          }
        }
      });
    }
    if (!this.selectedRider) {
      messages.push({
        severity: Constant.messageStatus.warn, detail: "Vui lòng chọn NV!"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  async choiceRider() {
    let list = [...this.listData];
    // console.log(this.selectedRider);
    this.checkSubmitAndPrint = true;
    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    this.selectedData.forEach(x => shipmentIds.push(x.id));
    if (this.isEditLAD) {
      const cloneShipmentIds = this.cloneItemShipmentLAD.map(x => x.id);
      model.shipmentIds = shipmentIds.filter(x => cloneShipmentIds.includes(x));
      model.AddShipmentIds = shipmentIds.filter(x => !cloneShipmentIds.includes(x));
      model.UnShipmentIds = cloneShipmentIds.filter(x => !shipmentIds.includes(x));
      model.listGoodsId = this.editListGoodsId;
    } else {
      model.shipmentIds = shipmentIds;
    }
    model.empId = this.selectedRider;
    model.deliveryOther = this.deliveryHubOther;
    model.shipmentStatusId = StatusHelper.assignEmployeeDelivery;
    model.realWeight = this.selectedData.reduce((realWeight, shipment) => {
      return realWeight += shipment.weight;
    }, 0);
    // model.toHubId = this.selectedToHubRouting;

    // console.log(JSON.stringify(model));
    let res = await this.shipmentService.assignDeliveryListAsync(model);
    this.checkSubmitAndPrint = false;
    if (res) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công"
      });
      if (this.isEditLAD) {
        this.loadShipmentPaging();
      }
      this.isEditLAD = false;
      this.cloneItemShipmentLAD = [];
      this.editListGoodsId = null;
      this.removeSelectedData(this.selectedData);
      this.loadListAssignedDelivery();
    }
  }

  async choiceRiderAndPrint(isPrintBareCode: boolean) {
    this.itemShipment = await this.onAssignAelivery(this.selectedData);
    if (this.itemShipment) {
      setTimeout(() => {
        this.itemShipment.isPrintBareCode = isPrintBareCode;
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
        this.removeSelectedData(this.selectedData);
        this.loadListAssignedDelivery();
      }, 0);
    }
  }

  async onAssignAelivery(selectedData: Shipment[]): Promise<Shipment[]> {
    this.checkSubmitAndPrint = true;
    let shipmentIds = [];
    let model = new ListUpdateStatusViewModel();

    selectedData.forEach(x => shipmentIds.push(x.id));
    model.empId = this.selectedRider;
    model.deliveryOther = this.deliveryHubOther;
    model.shipmentStatusId = StatusHelper.assignEmployeeDelivery;
    model.shipmentIds = shipmentIds;
    this.listGoods = await this.shipmentService.assignDeliveryListAsync(model);
    this.checkSubmitAndPrint = false;
    if (this.listGoods) {
      this.itemShipment = [...selectedData];
      if (this.listGoods.listGoodsType) {
        this.idPrint = ListGoodsTypeHelper.printListGoodType(this.listGoods.listGoodsType.id);
        this.itemShipment.type = this.listGoods.listGoodsType.name;
      } else {
        this.idPrint = ListGoodsTypeHelper.printDetailDelivery;
        this.itemShipment.type = ListGoodsTypeHelper.detailDeliveryTypeName;
      }
      if (selectedData[0].shipmentStatus) {
        this.itemShipment.shipmentStatus = selectedData[0].shipmentStatus.name;
      }
      this.itemShipment.createdBy = this.currentUser.fullName;
      if (this.currentUser.hub) {
        this.itemShipment.userHubName = this.currentUser.hub.name;
      }
      if (this.currentUser.department) {
        this.itemShipment.userDepartmentName = this.currentUser.department.name;
      }
      this.itemShipment.logoUrl = this.generalInfo.logoUrl;
      this.itemShipment.companyName = this.generalInfo.companyName
      this.itemShipment.hotLine = this.generalInfo.hotLine;
      this.itemShipment.centerHubAddress = this.generalInfo.addressMain;
      const time = new Date();
      this.itemShipment.getFullYear = time.getFullYear();
      await Promise.all(this.objRiders.map(async x => {
        if (x.id == this.selectedRider) {
          this.itemShipment.currentEmp = x.fullName;
          if (x.hub) {
            this.itemShipment.empHubName = x.hub.name;
          }
          if (x.departmentId) {
            let data = await this.departmentService.getDepartmentAsync(x.departmentId);
            if (data) {
              this.itemShipment.empDepartmentName = data.name;
            }
          }
        }
      }));
      this.itemShipment.listGoods = this.listGoods.code;
      this.dateCreate = SearchDate.formatToISODate(new Date());
      this.itemShipment.dateCreate = SearchDate.formatToISODate(new Date());

      this.totalSumPrice = 0;
      this.totalWeight = 0;
      this.totalCalWeight = 0;
      selectedData.forEach((item, index) => {
        this.stt = index + 1;
        this.itemShipment[index].stt = this.stt;
        this.totalWeight += this.itemShipment[index].weight;
        this.itemShipment.totalWeight = this.totalWeight;
        if (this.itemShipment[index].calWeight) {
          this.totalCalWeight += this.itemShipment[index].calWeight;
          this.itemShipment.totalCalWeight = this.totalCalWeight;
        }
        if (item.paymentTypeId === PaymentTypeHelper.NNTTN) {
          this.itemShipment[index].sumPrice = item.cod + item.totalPrice;
        } else {
          this.itemShipment[index].sumPrice = item.cod;
        }
        this.totalSumPrice += this.itemShipment[index].sumPrice;
        this.itemShipment.totalSumPrice = this.totalSumPrice;
        this.itemShipment[index].fakeId =
          "id" + selectedData[index].id;
      });

      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật thành công"
      });
      return this.itemShipment;
    }
  }

  removeSelectedData(listRemove: Shipment[]) {
    // let listClone = Array.from(this.listData);

    // for (var key in listRemove) {
    //   let obj = listRemove[key];
    //   listClone.splice(listClone.indexOf(obj), 1);
    //   this.datasource.splice(this.datasource.indexOf(obj), 1);
    // }

    // this.listData = listClone;
    listRemove = [];
    this.totalRecordsRight = 0;
    this.selectedData = [];
    this.selectedRider = null;
  }

  // changeFilter() {
  //   this.selectedData = [];
  //   this.loadLazy(this.event);
  // }

  changeShipmentStatus() {
    this.shipmentFilterViewModel.ShipmentStatusId = this.selectedStatus;
    this.loadShipmentPaging();
  }

  changeSender() {
    this.shipmentFilterViewModel.SenderId = this.selectedSenderNames;
    this.loadShipmentPaging();
  }

  search(input) {
    this.shipmentFilterViewModel.SearchText = input.value.trim();
    this.loadShipmentPaging();
  }


  async scanShipmentNumber(txtShipmentNumber) {
    this.txtAssignShipment.nativeElement.focus();
    this.txtAssignShipment.nativeElement.select();
    this.messageService.clear();

    if (!txtShipmentNumber.value.trim()) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
    }
    else {
      let arrNum: string[] = txtShipmentNumber.value.split(" ");
      // this.shipmentNumberListUnSelect = this.shipmentNumberListUnSelect.concat(arrNum);

      let numRight = this.selectedData.map(ship => ship.shipmentNumber);

      let filterModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
      filterModel.ShipmentNumberListSelect = arrNum;
      filterModel.ShipmentNumberListUnSelect = numRight;
      filterModel.Type = this.shipmentFilterViewModel.Type;

      let rs_right = await this.shipmentService.postByTypeAsync(filterModel);

      // Check error, warning
      let shipError = [];
      let shipWarning = [];


      shipError = arrNum.filter(x => {
        let find = rs_right["data"].find(ship => ship.shipmentNumber == x);
        let find_right = this.selectedData.find(ship => ship.shipmentNumber == x);
        if (!find && !find_right)
          return x;
      })

      shipWarning = arrNum.filter(x => {
        let find = this.selectedData.find(ship => ship.shipmentNumber == x);
        if (find) {
          return x;
        }
      })

      // console.log(shipError);
      // console.log(shipWarning);
      //

      if (rs_right["isSuccess"] && rs_right["data"]) {

        this.selectedData.reverse();
        rs_right["data"].reverse();

        this.selectedData = this.selectedData.concat(rs_right["data"]);

        this.selectedData.reverse();

        this.totalRecordsRight = this.selectedData.length;

        // this.shipmentFilterViewModel.ShipmentNumberListUnSelect = this.shipmentNumberListUnSelect;
        this.loadShipmentPaging();

        let severity = shipError.length > 0 ? Constant.messageStatus.error : shipWarning.length > 0 ? Constant.messageStatus.warn : Constant.messageStatus.success;
        let message = (shipError.length > 0 ? ("Quét không thành công: " + shipError.join(" ") + "<br>") : "") +
          (shipWarning.length > 0 ? ("Vận đơn đã quét: " + shipWarning.join(" ") + "<br>") : "") +
          ("Quét thành công " + rs_right["data"].length + " vận đơn");

        this.messageService.add({
          severity: severity,
          detail: message
        });
        SoundHelper.getSoundMessage(severity);

        // if (shipError.length > 0 && shipWarning.length > 0) {
        //   this.messageService.add({
        //     severity: Constant.messageStatus.error,
        //     detail: "Quét không thành công: " + shipError.join(" ") + "<br>" +
        //       "Vận đơn đã quét: " + shipWarning.join(" ") + "<br>" +
        //       "Quét thành công " + rs_right["data"].length + " vận đơn"
        //   });
        //   SoundHelper.getSoundMessage(Constant.messageStatus.error);
        // }
        // else if (shipError.length > 0) {
        //   this.messageService.add({
        //     severity: Constant.messageStatus.error,
        //     detail: "Quét không thành công: " + shipError.join(" ") + "<br>" +
        //       "Quét thành công " + rs_right["data"].length + " vận đơn"
        //   });
        //   SoundHelper.getSoundMessage(Constant.messageStatus.error);
        // }
        // else if (shipWarning.length > 0) {
        //   this.messageService.add({
        //     severity: Constant.messageStatus.warn,
        //     detail: "Vận đơn đã quét: " + shipWarning.join(" ") + "<br>" +
        //       "Quét thành công " + rs_right["data"].length + " vận đơn"
        //   });
        //   SoundHelper.getSoundMessage(Constant.messageStatus.warn);
        // }
        // else {
        //   this.messageService.add({
        //     severity: Constant.messageStatus.success,
        //     detail: "Quét thành công " + rs_right["data"].length + " vận đơn"
        //   });
        //   SoundHelper.getSoundMessage(Constant.messageStatus.success);
        // }
      }

      // else {
      //   this.messageService.add({
      //     severity: Constant.messageStatus.error,
      //     detail: "Quét không thành công"
      //   });
      //   SoundHelper.getSoundMessage(Constant.messageStatus.error);
      // }

      this.txtAssignShipment.nativeElement.value = "";
    }
  }

  async changeUnAssignShipment(txtShipmentNumber) {
    this.txtUnAssignShipment.nativeElement.focus();
    this.txtUnAssignShipment.nativeElement.select();
    this.messageService.clear();

    if (!txtShipmentNumber.value.trim()) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
    }
    else {
      let arrNum: string[] = txtShipmentNumber.value.split(" ");
      let total = 0;

      let shipError = [];

      shipError = arrNum.filter(x => {
        let find = this.selectedData.find(ship => ship.shipmentNumber == x);
        if (!find) {
          return x;
        }
      })

      for (let i = 0; i < arrNum.length; i++) {
        const num = arrNum[i];
        for (let j = 0; j < this.selectedData.length; j++) {
          const shipment = this.selectedData[j];
          if (num == shipment.shipmentNumber) {
            this.selectedData.splice(j, 1);

            this.listData.unshift(shipment);

            this.totalRecords += 1;
            this.totalRecordsRight -= 1;
            total += 1;
            break;
          }
        }
      }

      setTimeout(() => {
        this.messageService.clear();

        let severity = shipError.length > 0 ? Constant.messageStatus.error : Constant.messageStatus.success;
        let message = (shipError.length > 0 ? ("Quét không thành công: " + shipError.join(" ") + "<br>") : "") +
          "Hủy thành công " + total + " vận đơn"

        this.messageService.add({
          severity: severity,
          detail: message
        });
        SoundHelper.getSoundMessage(severity);

        // if (total > 0) {
        //   this.messageService.add({
        //     severity: Constant.messageStatus.success,
        //     detail: "Hủy thành công " + total + " vận đơn"
        //   });
        //   SoundHelper.getSoundMessage(Constant.messageStatus.success);
        // } else {
        //   this.messageService.add({
        //     severity: Constant.messageStatus.error,
        //     detail: "Quét không thành công"
        //   });
        //   SoundHelper.getSoundMessage(Constant.messageStatus.error);
        // }

        this.txtUnAssignShipment.nativeElement.value = "";
      }, 0);

      // let filterModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
      // filterModel.ShipmentNumberListSelect = this.shipmentNumberListUnSelect;
      // filterModel.Type = this.shipmentFilterViewModel.Type;
      // let rs_right = await this.shipmentService.postByTypeAsync(filterModel);
      // if (rs_right["isSuccess"] && rs_right["data"]) {
      //   this.selectedData = rs_right["data"];
      //   this.totalRecordsRight = this.selectedData.length;

      //   this.shipmentFilterViewModel.ShipmentNumberListUnSelect = this.shipmentNumberListUnSelect;
      //   this.loadShipmentPaging();
      // }
    }
  }

  async assign(shipment: Shipment) {

    // this.shipmentNumberListUnSelect.push(shipment.shipmentNumber);
    // this.shipmentFilterViewModel.ShipmentNumberListUnSelect = this.shipmentNumberListUnSelect;

    this.selectedData.unshift(shipment);

    this.listData.map((ship, index, lstShipment) => {
      if (ship.shipmentNumber == shipment.shipmentNumber) {
        lstShipment = lstShipment.splice(index, 1);
      }
    })

    this.totalRecords -= 1;
    this.totalRecordsRight += 1;

    this.messageService.clear();
    this.messageService.add({
      severity: Constant.messageStatus.success,
      detail: "Quét thành công vận đơn " + shipment.shipmentNumber
    });
    SoundHelper.getSoundMessage(Constant.messageStatus.success);
  }

  unAssign(shipment: Shipment) {

    this.listData.push(shipment);

    this.selectedData.map((ship, index, lstShipment) => {
      if (ship.shipmentNumber == shipment.shipmentNumber) {
        lstShipment = lstShipment.splice(index, 1);
      }
    })

    // this.shipmentNumberListUnSelect.map((ship, index, lstShipment) => {
    //   if (ship == shipment.shipmentNumber) {
    //     lstShipment = lstShipment.splice(index, 1);
    //   }
    // })

    // this.shipmentFilterViewModel.ShipmentNumberListUnSelect = this.shipmentNumberListUnSelect;

    this.totalRecords += 1;
    this.totalRecordsRight -= 1;

    this.messageService.clear();
    this.messageService.add({
      severity: Constant.messageStatus.success,
      detail: "Hủy thành công vận đơn " + shipment.shipmentNumber
    });
    SoundHelper.getSoundMessage(Constant.messageStatus.success);
  }

  onChangeReview() {
    // this.loadLazy(this.event);
    // this.loadShipmentPaging();
  }

  onChangeDelivery() {
    this.loadRider();
    this.loadShipmentPaging();
    // this.loadShipment();
  }

  clearSelect() {
    this.selectedData = null;
    if (this.reviewChecked) {
      this.reviewChecked = false;
      this.onChangeReview();
    }
  }

  onPageChange(event: any) {
    this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
    this.shipmentFilterViewModel.PageSize = event.rows;
    setTimeout(() => {
      this.loadShipmentPaging();
    }, 0);
  }

  loadListStatus() {
    this.shipmentStatusService.getAllSelectModelAsync().then(x => this.statuses = x)
  }

  loadListHubRouting() {
    // this.hubRoutingService.getHubRoutingByPoHubId().then(x => this.statuses = x)
  }

  loadListSender() {
    this.customerService.getAllSelectModelAsync().then(x => this.senderNames = x)
  }

  loadFilter() {
    this.loadListStatus();
    this.loadListHubRouting();
    this.loadListSender();

    // this.selectedStatus = null;
    // this.statuses = [];
    // this.selectedToHubRouting = null;
    // this.toHubRoutings = [];
    // this.selectedSenderNames = null;
    // this.senderNames = [];
    // this.selectedDateAppointment = null;
    // this.dateAppointments = [];

    // let arrCols: string[] = [];
    // arrCols = [
    //   FilterUtil.Column.shipment.shipmentStatus,
    //   FilterUtil.Column.shipment.toHubRouting,
    //   FilterUtil.Column.shipment.sender,
    //   FilterUtil.Column.shipment.deliveryAppointmentTime,
    // ];
    // let result = FilterUtil.loadArrayFilter(this.datasource, arrCols);
    // result.forEach(x => {
    //   x.forEach(e => {
    //     if (e.title === FilterUtil.Column.shipment.shipmentStatus) {
    //       this.statuses = x;
    //     }
    //     if (e.title === FilterUtil.Column.shipment.sender) {
    //       this.senderNames = x;
    //     }
    //     if (e.title === FilterUtil.Column.shipment.toHubRouting) {
    //       this.toHubRoutings = x;
    //     }
    //     if (e.title === FilterUtil.Column.shipment.deliveryAppointmentTime) {
    //       this.dateAppointments = x;
    //     }
    //   });
    // });
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

  // findSelectedDataIndex(): number {
  //   return this.listData.indexOf(this.selectedData);
  // }

  lookupRowStyleClass(rowData: Shipment) {
    let result: any;
    if (rowData.shipmentStatusId === StatusHelper.pickupFail) {
      result = 'isPickupFail';
    }
    if (rowData.shipmentStatusId === StatusHelper.refusePickup) {
      result = 'isRefusePickup';
    }
    if (rowData.shipmentStatusId === StatusHelper.newRequest) {
      result = 'isNewRequest';
    }
    return result;
  }

  // tab two
  onSelectTab(num) {
    if (num == 1) {
      this.isActiveTabOne = true;
      this.isActiveTabTwo = this.isActiveTabThree = false;
    }
    else if (num == 2) {
      this.isActiveTabTwo = true;
      this.isActiveTabOne = this.isActiveTabThree = false;
    }
    else if (num == 3) {
      this.isActiveTabThree = true;
      this.isActiveTabOne = this.isActiveTabTwo = false;
    }
  }

  async loadListAssignedDelivery() {
    this.sortOrder = -1;
    this.sortField = "createdWhen";
    let includes = [
      Constant.classes.includes.listGoods.tpl,
      Constant.classes.includes.listGoods.listGoodsType,
      Constant.classes.includes.listGoods.createdHub,
      Constant.classes.includes.listGoods.listGoodsStatus,
      Constant.classes.includes.listGoods.fromHub,
      Constant.classes.includes.listGoods.toHub,
      Constant.classes.includes.listGoods.transportType,
      Constant.classes.includes.listGoods.emp,
    ];
    let ids = [ListGoodsTypeHelper.detailDelivery];

    // const data = await this.listGoodsService.getByTypeAsync(ids, includes);
    const data = await this.listGoodsService.getReportBroadcastListGoodsByAppAndMobilAsync(this.fromDate, this.toDate, this.hubId, this.empId, this.txtShipmentNumberInLg);
    // console.log(data);
    if (data) {
      this.datasourceLAD = data;
      this.datasourceLAD = this.datasourceLAD.sort((a, b) => b.createdWhen.localeCompare(a.createdWhen));
      this.totalRecordsLAD = this.datasourceLAD.length;
      this.listDataLAD = this.datasourceLAD;
      this.listDataLADExportExcel = this.datasourceLAD;
      // this.loadLazyListAssignedDelivery(this.eventListAssigned);
    }
  }

  async getReportBroadcastListGoodsByAppAndMobilAsync() {
    const data = await this.listGoodsService.getReportBroadcastListGoodsByAppAndMobilAsync(this.fromDate_2, this.toDate_2, this.hubId, this.empId, "");
    // console.log(data);
    this.datasourceLAD_2 = data;
    this.datasourceLAD_2 = this.datasourceLAD_2.sort((a, b) => b.createdWhen.localeCompare(a.createdWhen));
    this.totalRecordsLAD = this.datasourceLAD ? this.datasourceLAD.length : 0;
    this.totalRecordsLAD_2 = this.datasourceLAD_2 ? this.datasourceLAD_2.length : 0;
    this.listDataLAD_2 = this.datasourceLAD_2;
    this.listDataLADExportExcel_2 = this.datasourceLAD_2;
  }

  loadLazyListAssignedDelivery(event: LazyLoadEvent) {
    this.eventListAssigned = event;
    setTimeout(() => {
      if (this.datasourceLAD) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasourceLAD.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasourceLAD.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLAD)
          );

        //Begin Custom filter
        if (this.selectedEmployee) {
          filterRows = filterRows.filter(x => x.empId == this.selectedEmployee);
        }
        if (this.selectedHub) {
          filterRows = filterRows.filter(x => x.hubId == this.selectedHub);
        }
        //
        // if (this.selectedDateFrom && this.selectedDateTo) {
        //   //
        //   filterRows = filterRows.filter(x => moment(x.createdWhen).isBetween(this.selectedDateFrom, this.selectedDateTo));
        // } else if (this.selectedDateFrom) {
        //   filterRows = filterRows.filter(x => moment(x.createdWhen).isAfter(this.selectedDateFrom));
        // } else if (this.selectedDateTo) {
        //   filterRows = filterRows.filter(x => moment(x.createdWhen).isBefore(this.selectedDateTo));
        // }

        //End Custom filter

        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );
        this.listDataLADExportExcel = filterRows;
        this.listDataLAD = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecordsLAD = filterRows.length;
      }
    }, 250);
  }

  loadLazyListAssignedDelivery_2(event: LazyLoadEvent) {
    this.eventListAssigned_2 = event;
    setTimeout(() => {
      if (this.datasourceLAD_2) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasourceLAD_2.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasourceLAD_2.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columnsLAD_2)
          );

        //Begin Custom filter
        if (this.selectedEmployee_2) {
          filterRows = filterRows.filter(x => x.empId == this.selectedEmployee_2);
        }
        if (this.selectedHub_2) {
          filterRows = filterRows.filter(x => x.hubId == this.selectedHub_2);
        }
        // sort data
        filterRows.sort(
          (a, b) =>
            FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
        );

        this.listDataLADExportExcel_2 = filterRows;
        this.listDataLAD_2 = filterRows.slice(event.first, event.first + event.rows);
        this.totalRecordsLAD_2 = filterRows.length;
      }
    }, 250);
  }

  async loadFilterLAD() {
    this.selectedEmployee = null;
    this.selectedEmployee_2 = null;
    this.employees = [];

    this.employees = await this.userService.getSelectModelAllUserByCurrentHubAsync();

    // let arrCols: string[] = [];
    // arrCols = [
    //   FilterUtil.Column.listGood.emp,
    // ];
    // let result = FilterUtil.loadArrayFilter(this.datasourceLAD, arrCols);
    // result.forEach(x => {
    //   x.forEach(e => {
    //     if (e.title === FilterUtil.Column.listGood.emp) {
    //       this.employees = x;
    //     }
    //   });
    // });
  }

  async loadFilterHub() {
    this.selectedHub = null;
    this.selectedHub_2 = null;
    this.hubs = [];

    this.hubs = await this.hubService.getAllHubSelectModelAsync();
  }

  // dateRangePicker
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public mainInput_2 = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public eventLog = "";

  public selectedDate(value: any, dateInput: any) {
    // dateInput.start = value.start;
    // dateInput.end = value.end;
    // //
    // this.requestGetPickupHistory.fromDate = moment(value.start).toDate();
    // this.requestGetPickupHistory.toDate = moment(value.end).toDate();

    // this.selectedDateFrom = this.requestGetPickupHistory.fromDate;
    // this.selectedDateTo = this.requestGetPickupHistory.toDate;
    // this.loadLazyListAssignedDelivery(this.eventListAssigned);

    dateInput.start = value.start;
    dateInput.end = value.end;

    this.fromDate = moment(value.start).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    this.toDate = moment(value.end).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    this.loadListAssignedDelivery();
    this.loadLazyListAssignedDelivery(this.eventListAssigned);
  }

  public selectedDate_2(value: any, dateInput: any) {
    dateInput.start = value.start;
    dateInput.end = value.end;

    this.fromDate_2 = moment(value.start).hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    this.toDate_2 = moment(value.end).hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");
    this.getReportBroadcastListGoodsByAppAndMobilAsync();
    this.loadLazyListAssignedDelivery_2(this.eventListAssigned_2);
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  changeFilterLAD() {
    this.loadLazyListAssignedDelivery(this.eventListAssigned);
  }

  changeFilterLAD_2() {
    this.loadLazyListAssignedDelivery_2(this.eventListAssigned_2);
  }

  changeFilterLADBySN() {
    this.messageService.clear();
    this.loadListAssignedDelivery();
  }

  refreshLAD() {
    this.txtFilterGbLAD = null;
    this.listDataLAD = [];
    this.datasourceLAD = [];
    this.selectedEmployee = null;
    this.selectedDataLAD = [];
    this.txtShipmentNumberInLg = "";
    this.loadListAssignedDelivery();
  }

  async printLAD(data: ListGoods, isPrintBareCode: boolean) {
    this.itemShipment = await this.onGetListGoodsId(data);
    if (this.itemShipment) {
      setTimeout(() => {
        this.idPrint = ListGoodsTypeHelper.printDetailDelivery;
        this.itemShipment.isPrintBareCode = isPrintBareCode;
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
      }, 0);
    }
  }

  async printSignature(data: ListGoods, isPrintBareCode: boolean) {
    this.itemShipment = await this.onGetListGoodsId(data);
    // console.log(this.itemShipment);
    if (this.itemShipment) {
      setTimeout(() => {
        this.idPrint = PrintHelper.printSignature;
        this.itemShipment.isPrintBareCode = isPrintBareCode;
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
      }, 0);
    }
  }

  async editLAD(rowData: ListGoods) {
    // reset tabOne this.resetInputData();
    this.selectedData = [];
    this.selectedRider = null;
    this.isActiveTabOne = true;
    this.isEditLAD = true;
    const shipments = await this.getShipmentByListGoodsId(rowData);
    if (shipments) {
      this.cloneItemShipmentLAD = shipments.map(x => Object.assign({}, x));
      this.editListGoodsId = rowData.id;
      this.selectedData = shipments;
      this.selectedRider = rowData.empId;
      this.totalRecordsRight = this.selectedData.length;
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
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.structure);
    includes.push(Constant.classes.includes.shipment.serviceDVGT);
    includes.push(Constant.classes.includes.shipment.boxes);
    includes.push(Constant.classes.includes.shipment.transferUser);

    const shipments = await this.shipmentService.getByListGoodsIdAsync(id, includes);
    if (shipments) {
      return shipments;
    }
  }

  async getShipmentByListListGoodsId(listGoodsIds: number[]): Promise<ShipmentDeliveryByListGoods[]> {
    const shipments = await this.shipmentService.getByListListGoodsIdAsync(listGoodsIds);
    if (shipments) {
      return shipments;
    }
  }

  async onGetListGoodsId(data: ListGoods): Promise<Shipment[]> {
    const shipments = await this.getShipmentByListGoodsId(data);
    if (shipments) {
      this.itemShipment = [...shipments];

      this.itemShipment.logoUrl = this.generalInfo.logoUrl;
      this.itemShipment.companyName = this.generalInfo.companyName;
      this.itemShipment.hotLine = this.generalInfo.hotLine;
      this.itemShipment.centerHubAddress = this.generalInfo.addressMain;

      if (data.toHub) {
        this.itemShipment.toHubName = data.toHub.name;
      }

      if (data.listGoodsType)
        this.itemShipment.type = data.listGoodsType.name;

      if (this.currentUser)
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
        if (item.currentEmp) {
          this.itemShipment.currentEmp = item.currentEmp.fullName;
          if (item.currentEmp.hub) {
            this.itemShipment.empHubName = item.currentEmp.hub.name;
          }
          if (item.currentEmp.departmentId) {
            const id = item.currentEmp.departmentId;
            const data = await this.departmentService.getDepartmentAsync(id);
            this.itemShipment.empDepartmentName = data.name;
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
          item.cod = item.cod ? item.cod : 0;
          this.itemShipment[index].sumPrice = item.cod;
        } else {
          item.cod = item.cod ? item.cod : 0;
          item.totalPrice = item.totalPrice ? item.totalPrice : 0;
          this.itemShipment[index].sumPrice = item.cod + item.totalPrice;
        }
        this.itemShipment[index].sumPrice = this.itemShipment[index].sumPrice ? this.itemShipment[index].sumPrice : 0;
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

  onCancelLAD(data: ListGoods) {
    // cancel listgoods
  }

  exportCSV(dt: Table) {
    if (this.listDataLADExportExcel) {
      if (this.listDataLADExportExcel.length > 0) {
        dt._value = this.listDataLADExportExcel;
      }
    } else {
      dt._value = [];
    }
    dt.exportCSV();
  }

  exportCSV_2(dt: Table) {
    if (this.listDataLADExportExcel) {
      if (this.listDataLADExportExcel.length > 0) {
        dt._value = this.listDataLADExportExcel;
      }
    } else {
      dt._value = [];
    }
    dt.exportCSV();
  }

  // excel báo cáo báo phát chi tiết vận đơn thoe điều kiện lọc (bưu cục phát, nhân viên)
  async exportCSVDetail_2() {
    let listGoodsIds: number[] = this.datasourceLAD_2.map(x => x.id);
    if (listGoodsIds.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "DS bảng kê trống"
      });
      return;
    }

    const shipments = await this.getShipmentByListListGoodsId(listGoodsIds);
    if (shipments) {
      let data: any[] = [];
      data.push([
        "Bưu cục phát",
        "Nhân viên phát",
        "Mã bảng kê",
        "Mã vận đơn",
        "Ngày tạo",
        "Khách hàng gửi",
        "Số kiện",
        "Số " + environment.unit,
        "Địa chỉ nhận",
        "Tên người nhận",
        "Tên người nhận thực tế",
        "Ngày giờ phát thực tế",
      ]);

      shipments.map((shipmentDeliveryByListGoods) => {
        let ship = Object.assign({}, shipmentDeliveryByListGoods);
        ship.orderDate = SearchDate.formatDate(shipmentDeliveryByListGoods.orderDate);
        ship.endDeliveryTime = SearchDate.formatDate(shipmentDeliveryByListGoods.endDeliveryTime);
        data.push([
          ship.fromHubName,
          ship.deliveryUserName,
          ship.listGoodsCode,
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
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      /* save to file */
      const wbout: string = XLSX.write(wb, this.wopts);
      saveAs(new Blob([InputValue.s2ab(wbout)]), this.fileName);
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
        'Số ' + environment.unit,
        'Địa chỉ nhận',
        'Tên người nhận',
        'Tên người nhận thực tế',
        'Ngày giờ phát thực tế',
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
}

import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  NgZone,
  OnDestroy,
  AfterContentInit,
  AfterViewInit,
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem, AutoComplete } from "primeng/primeng";
import {
  ShipmentService,
  UserService,
  CustomerService,
  ProvinceService,
  WardService,
  DistrictService,
  HubService,
  PaymentTypeService,
  ServiceDVGTService,
  ServiceService,
  StructureService,
  PriceService,
  AuthService,
  CustomerInfoLogService,
  GeocodingApiService,
  ShipmentVersionService,
  ShipmentStatusService,
  UploadService,
  PriceServiceService,
  RequestShipmentService,
  PaymentCODTypeService,
  FormPrintService,
  CustomerPaymentToService,
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  User,
  Customer,
  Hub,
  DataPrint,
  Service,
} from "../../../models/index";
import { PersistenceService } from "angular-persistence";
import {
  ShipmentCalculateViewModel,
  IdViewModel,
  FromPrintViewModel
} from "../../../view-model/index";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { FormControl } from "@angular/forms";
// import { } from "googlemaps";
import { MapsAPILoader } from "@agm/core";
import { Boxes } from "../../../models/boxes.model";

//
import { PrintHelper } from "../../../infrastructure/printHelper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { CustomerHelper } from "../../../infrastructure/customer.helper";
import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { ServiceHelper } from "../../../infrastructure/service.helper";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { DateRangeFromTo } from "../../../view-model/dateRangeFromTo.viewModel";
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { SelectModel } from "../../../models/select.model";
import { ShipmentVersion } from "../../../models/shipmentVersion.model";
import { InformationComponent } from "../../../infrastructure/information.helper";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { CusDepartmentService } from "../../../services/cusDepartment.service.";
import { ImagePickupServiceInstance } from "../../../services/imagePickup.serviceInstance";
import { UpdateViewModelShipment } from "../../../models/abstract/updateViewModelShipment.interface";
import { Subscription } from "rxjs/Subscription";
import { CommandService } from "../../../services/command.service";
import { Command } from "../../../models/abstract/command.interface";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { StringHelper } from "../../../infrastructure/string.helper";
import { ShipmentType } from "../../../infrastructure/enums/shipmentType.enum";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { ShipmentVersionHelper } from "../../../infrastructure/shipmentVersion.helper";
import { SignalRService } from "../../../services/signalR.service";
import { UploadExcelHistoryService } from "../../../services/uploadExcelHistory.service";
import { DaterangePickerHelper } from "../../../infrastructure/daterangePicker.helper";
import { ArrayHelper } from "../../../infrastructure/array.helper";
import { Angular5Csv } from 'angular5-csv/Angular5-csv';
import { ExportAnglar5CSV } from "../../../infrastructure/exportAngular5CSV.helper";
import { ServiceDVGTHelper } from "../../../infrastructure/serviceDVGTHelper";
import { HubConnection } from "@aspnet/signalr";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { CurrencyFormatPipe } from "../../../pipes/currencyFormat.pipe";
import { UpdateStatusCurrentEmp } from "../../../models/updateStatusCurrentEmp.models";
import { ShipmentDetailComponent } from "../../shipment-detail/shipment-detail.component";
import { CustomerInfoLog } from "../../../models/customerInfoLog.model";
import { MineTypeHelper } from "../../../infrastructure/mimeType.helper";

@Component({
  selector: "app-list-shipment",
  templateUrl: "list-shipment.component.html",
  styles: [
    `
    agm-map {
      height: 200px;
    }
  `  ]
})
export class ListShipmentComponent extends InformationComponent implements OnInit, AfterViewInit, OnDestroy {
  //
  placeHolderHub: string;
  allHubs: SelectModel[] = [];
  fromHubSelected: any;
  fromHubFilters: any[] = [];
  printCustomerId: any = 0;
  formPrintA5: string = '';
  isViewSinglePickerOrderDate: boolean = false;
  currentUser: User;
  countLoadLS: number = 0;
  optionSingleDateFrom: any;
  optionSingleDateTo: any;
  onPageChangeEvent: any;
  searchText: string;
  includes: string;
  // [x: string]: any;
  hubConnection: HubConnection;
  inputPickingAddress: string = null;
  selectedUploadExcelHistory: number;
  uploadExcelHistories: SelectItem[];
  dim: number;
  scanShipmentNumber: string;
  isExistParentShipment: boolean;
  selectedShipmentType: SelectItem;
  shipmentTypes: SelectItem[];
  displayInsured: boolean;
  displayCustomer: boolean;
  displayTotalShipment: boolean;
  cloneShipmentSP: Shipment;
  displayStatusDeliveryComplete: boolean;
  scanShipmmentNumber: string;
  unit = environment.unit;
  hub = environment;
  companyName = environment.namePrint;

  shopCode: any;
  requestShipmentCode: string;
  requestShipmentId: number;

  isEditPriceDVGT: boolean = false;
  isBox: boolean = false;
  isShowCheckBoxChangeShippingAddress: boolean;
  isSelectChangeShippingAddress: boolean;
  subscription: Subscription;
  shipmetCancel: Shipment;
  txtNoteCancel: string;
  buttonSavePrintChange: string = "clickPrintChange";
  buttonSavePrintCode: string = "clickSavePrintCode";
  buttonSaveChange: string = "clickSaveChange";
  clickTxtButton: string;
  displayNoTotalPrice: boolean;
  updateImagePath: any;
  isExistImagePickup: boolean;
  isExistInfoDelivery: boolean;
  paymentTypeTTCT: number;
  deliveryCompleteStatus: number;
  selectedDepartment: number;
  cusDepartments: SelectModel[];
  cusDepartment: string;
  filteredCusDepartments: any[];
  pageNum = 1;
  isShowPrice: boolean;
  listShipmentVersionsByGetIds: ShipmentVersion[];
  isShowItemVersion: boolean;
  titleTabOne: string;
  isViewVersion: boolean;
  shipmentVersions: ShipmentVersion[];
  isActiveTabTwo: boolean;
  exportDataFilter: Shipment[];
  toWardName: string;
  toDistrictName: string;
  isAgreementPrice: boolean = false;
  isViewToLocation: boolean;
  currentUserId: number;
  isPaidPrice: boolean = false;
  fromHubCode: string;
  toHubCode: string;
  filterRows: Shipment[];
  cloneSelectData: any;
  cloneNewEditBoxes: Boxes[];
  detectDeleteBox: boolean;
  selectedDeleteBoxes: Boxes[]; // tổng số box bị xóa (lúc sửa vận đơn)
  newEditBoxes: Boxes[]; // tổng số box mới thêm vào vận đơn (lúc sửa vận đơn)
  boxesLS: Boxes[];
  serviceDVGTsLS: number[];
  isEditLS: boolean = false;
  cloneRowDataShipment: Shipment;
  cloneSelectCode: any[];
  searchShipmentNumber: string;
  isListTable: boolean = true;
  isGribTable: boolean;
  colorList: string = "#183545";
  colorGrib: string;
  isActiveTabOne: boolean = true;
  msgxpectedDeliveryTime: string;
  idPrint: string;
  serviceName: string;
  loadSelectExpectedDeliveryTime: boolean;
  cloneExpectedDeliveryTime: Date;
  isLoadExpectedDeliveryTimeSystem: boolean;
  isLoadOrderDate: boolean;
  colorExpectedDeliveryTime: string;
  eventExpectedDeliveryTime: any;
  fromHubId: number;
  toHubId: number;
  cloneTotalSelectedCountSK: number;
  totalChargeWeightBoxes: number = 0; // trong lượng tính cước của Box
  totalCalWeightBoxes: number = 0; // trong lượng quy đổi của Box
  totalWeightBoxes: number = 0; // trong lượng thực tế của Box
  isCreatedBox: boolean;
  currentTime: Date;
  generalInfo: GeneralInfoModel;
  checkSubmitPrintCode: boolean;
  checkSubmitPrintSection: boolean;
  cloneInputShipmentNumber: any;
  inputShipmentNumber: string;
  msgService: string;
  filteredServices: any[] = [];
  filteredPaymentTypes: any[] = [];
  filteredStructures: any[] = [];
  filteredEmployees: any;
  filteredToProvinces: any;
  filteredToDistricts: any;
  filteredToWards: any;
  filteredToHubs: any;
  filteredToCenterHubs: any;
  filteredToPoHubs: any;
  filteredToStationHubs: any;
  filteredPickupUsers: any;
  filteredFromHubs: any;
  filteredFromPoHubs: any[];
  filteredFromCenterHubs: any[];
  filteredFromWards: any;
  filteredFromDistricts: any[];
  filteredFromProvinces: any;
  filteredCustomers: any[] = [];
  checkSubmit: boolean;
  cloneFromWardName: string;
  cloneFromDistrictName: string;
  cloneFromProviceName: string;
  cloneToWardName: string;
  cloneToDistrictName: string;
  cloneToProviceName: string;
  cloneTotalBox: Boxes[];
  objSelectesServiceDVGTs: any[];
  shipmentServiceName: any[];
  createdDataShipment: any;
  itemShipment: any = [];
  filteredSenderPhones: any[];
  filteredSenderNames: any[];
  filteredSenderCompanies: any[];
  listInfoLog: CustomerInfoLog[] = [];
  filteredReceiverPhones: any[] = [];
  filteredReceiverNames: any[];
  filteredReceiverCompanies: any[];
  senderPhone: any;
  senderName: any;
  senderCompany: any;
  fromLocation: string = "none";
  receiverPhone: any;
  receiverName: any;
  receiverCompany: any;
  toLocation: string = "none";
  sender: any;
  customerChange: any;
  customer: any;
  customerReceipt: any;
  employee: any;
  pickupUser: any;
  fromProvince: any;
  fromDistrict: any;
  fromWard: any;
  fromCenterHub: any;
  fromPoHub: any;
  fromStationHub: any;
  fromHub: any;
  toProvince: any;
  toDistrict: any;
  toWard: any;
  toCenterHub: any;
  toPoHub: any;
  toStationHub: any;
  toHub: any;
  structure: any;
  paymentType: any;
  service: any;
  chargeWeight: number; // trong lượng tính cước của vận đơn
  reviewChecked: boolean;
  cloneCustomer: Customer;
  isCreateShipmentSP: boolean; // có phải là tạo vận đơn hỗ trợ hay không
  fromInfoHub: Hub;
  toInfoHub: Hub;
  //
  paymentCODType: any = `---`;
  filteredPaymentCODTypes: string[] = [];

  //Vận đơn nhiều kiên
  shipmentBoxs: Shipment[] = [];
  shipmentBox: Shipment = new Shipment();
  //
  totalCollect: number = 0;
  //
  infoDelivery: SelectItem[] = [
    { label: 'Tất cả', value: null },
    { label: 'Thiếu thông tin giao', value: false },
    { label: 'Đủ thông tin giao', value: true },
  ];
  //
  imagePickup: SelectItem[] = [
    { label: 'Tất cả', value: null },
    { label: 'Có ảnh', value: true },
    { label: 'Không có ảnh', value: false },
  ];
  //
  printBills: SelectItem[] = [
    { label: 'Tất cả', value: null },
    { label: 'Đã in', value: true },
    { label: 'Chưa in', value: false },
  ];
  //
  user: any;
  users: SelectModel[];
  selectedUser: number;
  filteredUsers: any;
  //
  isScanAndPrint: boolean = false;
  //

  constructor(
    protected uploadExcelHistoryService: UploadExcelHistoryService,
    protected priceServiceService: PriceServiceService,
    protected modalService: BsModalService,
    protected persistenceService: PersistenceService,
    protected messageService: MessageService,
    protected shipmentService: ShipmentService,
    protected requestShipmentService: RequestShipmentService,
    protected userService: UserService,
    protected customerService: CustomerService,
    protected customerInfoLogService: CustomerInfoLogService,
    protected provinceService: ProvinceService,
    protected districtService: DistrictService,
    protected wardService: WardService,
    protected hubService: HubService,
    protected paymentTypeService: PaymentTypeService,
    protected paymentCODTypeService: PaymentCODTypeService,
    protected serviceService: ServiceService,
    protected serviceDVGTService: ServiceDVGTService,
    protected structureService: StructureService,
    protected priceService: PriceService,
    protected mapsAPILoader: MapsAPILoader,
    protected authService: AuthService,
    protected generalInfoService: GeneralInfoService,
    protected ngZone: NgZone,
    protected geocodingApiService: GeocodingApiService,
    protected daterangepickerOptions: DaterangepickerConfig,
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected shipmentVersionService: ShipmentVersionService,
    protected shipmentStatusService: ShipmentStatusService,
    protected cusDepartmentService: CusDepartmentService,
    protected uploadService: UploadService,
    protected imagePickupServiceInstance: ImagePickupServiceInstance,
    protected commandService: CommandService,
    public permissionService: PermissionService,
    public router: Router,
    protected formPrintService: FormPrintService,
    protected signalRService: SignalRService,
    protected customerPaymentToService: CustomerPaymentToService,
    protected currencyFormat: CurrencyFormatPipe
  ) {
    super(generalInfoService, authService, messageService, permissionService, router);
    // dateRangePicker
    this.daterangepickerOptions = DaterangePickerHelper.getSettings(this.daterangepickerOptions);

    let includes: string =
      Constant.classes.includes.shipment.shipmentStatus + "," +
      Constant.classes.includes.shipment.service + "," +
      Constant.classes.includes.shipment.fromHub + "," +
      Constant.classes.includes.shipment.currentHub + "," +
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
      Constant.classes.includes.shipment.cusDepartment + "," +
      Constant.classes.includes.shipment.requestShipment + "," +
      Constant.classes.includes.shipment.boxes;

    this.includes = includes;
    const currentDate = moment(new Date()).format("YYYY/MM/DD");
    let orderDateFrom = currentDate + "T00:00:00";
    let orderDateTo = currentDate + "T23:59:59";

    this.shipmentFilterViewModel.Cols = includes;
    this.shipmentFilterViewModel.Type = ShipmentTypeHelper.historyPickup;
    this.shipmentFilterViewModel.OrderDateFrom = orderDateFrom;
    this.shipmentFilterViewModel.OrderDateTo = orderDateTo;
    this.shipmentFilterViewModel.PageNumber = this.pageNum;
    this.shipmentFilterViewModel.PageSize = this.rowPerPage;
  }
  parentPage: string = Constant.pages.shipment.name;
  currentPage: string = Constant.pages.shipment.children.listShipment.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  bsModalRefCancel: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;
  //
  data: Shipment;
  //
  customers: SelectModel[] = [];
  selectedCustomer: Customer;
  selectedCustomerReceipt: Customer;
  //
  customerInfoLogs: CustomerInfoLog[];
  selectedCustomerInfoLogs: CustomerInfoLog;
  //
  fromProvinces: SelectItem[];
  selectedFromProvince: number;
  fromDistricts: SelectItem[];
  selectedFromDistrict: number;
  fromWards: SelectItem[];
  selectedFromWard: number;
  fromCenterHubs: SelectItem[];
  selectedFromCenterHub: number;
  fromPoHubs: SelectItem[];
  selectedFromPoHub: number;
  fromStationHubs: SelectItem[];
  selectedFromStationHub: number;
  //
  toProvinces: SelectItem[];
  selectedToProvince: number;
  toDistricts: SelectModel[];
  selectedToDistrict: number;
  toWards: SelectModel[];
  selectedToWard: number;
  toCenterHubs: SelectItem[];
  selectedToCenterHub: number;
  toPoHubs: SelectItem[];
  selectedToPoHub: number;
  toStationHubs: SelectItem[];
  selectedToStationHub: number;
  //
  employees: SelectItem[];
  selectedEmployee: number;
  //
  pickupUsers: SelectItem[];
  selectedPickupUser: number;
  //
  paymentTypes: SelectModel[];
  selectedPaymentType: number;
  //
  structures: SelectItem[];
  selectedStructure: number;
  //
  services: SelectModel[];
  selectedService: number;
  //
  serviceDVGTs: Service[];
  serviceDVGTModels: SelectModel[];
  selectedServiceDVGTs: number[];
  //
  fromHubs: SelectModel[];
  selectedFromHub: number;
  //
  toHubs: SelectModel[];
  selectedToHub: number;
  //

  selectedContent: string;
  selectedWeight: number = 0;
  selectedLength: number;
  selectedWidth: number;
  selectedHeight: number;
  selectedCalWeight: number;
  selectedCountSK: number;
  selectedWoodWeight: number = 0;
  totalSelectedCountSK: number;
  //

  public latitudeFrom: number;
  public longitudeFrom: number;
  public latitudeTo: number;
  public longitudeTo: number;
  public searchFromControl: FormControl;
  public searchToControl: FormControl;
  public zoom: number;
  @ViewChild("txtTotalBox") txtTotalBoxRef: ElementRef;
  @ViewChild("atcSenderCode") atcSenderCodeRef: AutoComplete;
  @ViewChild("atcPaymentCOD") atcPaymentCODRef: AutoComplete;
  @ViewChild("txtAreaContent") txtAreaContentRef: ElementRef;
  @ViewChild("searchFrom") searchFromElementRef: ElementRef;
  @ViewChild("searchTo") searchToElementRef: ElementRef;
  @ViewChild("busenissUser") busenissUserRef: ElementRef;
  @ViewChild("pickupUser") pickupUserRef: ElementRef;
  @ViewChild('templateBox') templateBox: TemplateRef<any>;
  @ViewChild('templateInsured') templateInsured: TemplateRef<any>;
  pickupUserCode: string = null;
  busenissUserCode: string = null;
  //
  public singlePickerOrderDate = {
    singleDatePicker: true,
    timePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: this.currentTime
  };

  //
  public singlePickerExpectedDeliveryTime = {
    singleDatePicker: true,
    timePicker: true,
    showDropdowns: true,
    opens: "left",
    startDate: this.currentTime
  };

  // tab two
  first: number = 0;
  shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  fromProvincesLS: SelectItem[];
  fromSelectedProvinceLS: number;
  toProvincesLS: SelectItem[];
  toSelectedProvinceLS: number;
  fromSendersLS: SelectItem[];
  fromSelectedSenderLS: number;
  txtFromWeight: number;
  fromWeight: number;
  txtToWeight: number;
  toWeight: number;
  //
  servicesLS: SelectItem[];
  selectedServicesLS: number;
  //
  statuses: SelectItem[] = [
    { label: "Tất cả", value: null },
    { label: "Chưa lấy hàng", value: 1 },
    { label: "Đã lấy hàng ", value: 2 },
    { label: "Nhập kho trung chuyển", value: 3 },
    { label: "Đang trung chuyển", value: 4 },
    { label: "Nhập kho giao hàng", value: 5 },
    { label: "Đang giao hàng", value: 6 },
    { label: "Giao không thành công", value: 8 },
    { label: "Giao thành công", value: 7 },
    { label: "Đã trả hàng", value: 200 },
    { label: "Sự cố", value: 201 },
    { label: "Đền bù", value: 202 },
    // { label: "Khác", value: 8 },
  ];
  //
  shipmentType: SelectItem[] = [
    { label: "Tất cả", value: null },
    { label: "Kiện", value: true },
    { label: "Mẹ", value: false },
  ]
  //
  paymentTypesLS: SelectItem[];
  selectedPaymentTypeLS: number;
  statusesLS: SelectItem[];
  selectedStatusLS: number;
  txtFilterGb: string;
  requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();
  txtShipmentNumber: string;
  txtRequestShipmentNumber: string;
  searchRequestShipmentId: number;
  selectedDateFrom: any;
  selectedDateTo: any;
  columns: any[] = [
    { field: "id", header: 'ID' },
    { field: "shipmentNumber", header: 'Mã vận đơn' },
    { field: "reShipmentNumber", header: 'Mã bill tổng' },
    { field: "cusNote", header: 'Yêu cầu phục vụ' },
    { field: "orderDate", header: 'Ngày gửi', typeFormat: "date", formatString: 'YYYY/MM/DD HH:mm' },
    { field: "paymentTypeName", header: 'HTTT' },
    { field: "serviceName", header: 'Dịch vụ' },
    { field: "ServiceDVGTCodes", header: 'Dịch vụ gia tăng' },
    { field: "content", header: 'Nội dung hàng hóa' },
    { field: "weight", header: "TL " + this.unit, typeFormat: "number" },
    { field: "calWeight", header: "TL QĐ " + this.unit, typeFormat: "number" },
    { field: "totalBox", header: "Số kiện", typeFormat: "number" },
    { field: "cod", header: "COD", typeFormat: "number" },
    { field: "insured", header: "Khai giá", typeFormat: "number" },
    { field: "priceCOD", header: "Cước thu hộ", typeFormat: "number" },
    { field: "defaultPrice", header: 'Cước chính', typeFormat: "number" },
    { field: "fuelPrice", header: 'PPXD', typeFormat: "number" },
    { field: "remoteAreasPrice", header: 'VSVX', typeFormat: "number" },
    { field: "totalDVGT", header: 'Phí DVGT', typeFormat: "number" },
    // { field: "vatPrice", header: 'VAT' },
    { field: "totalPrice", header: 'Tổng cước', typeFormat: "number" },

    { field: "shipmentStatusName", header: 'Trạng thái' },
    //{ field: "currentHub", header: 'Trạm đang giữ' },
    { field: "fullName", header: 'Nhân thao tác cuối' },
    { field: "senderCode", header: 'Mã người gửi' },
    { field: "senderName", header: 'Tên người gửi' },
    { field: "senderPhone", header: 'Đt gửi' },
    { field: "companyNameFrom", header: 'CTY gửi' },
    { field: "pickingAddress", header: 'Địa chỉ gửi' },
    { field: "fromProvinceName", header: 'Tỉnh đi' },
    { field: "fromHubName", header: 'Trạm lấy' },
    { field: "fromHubRoutingName", header: 'Tuyến lấy' },
    { field: "receiverName", header: 'Tên người nhận' },
    { field: "receiverPhone", header: 'Đt nhận' },
    { field: "companyTo", header: 'CTY nhận' },
    { field: "addressNoteTo", header: 'Địa chỉ nhận chi tiết' },
    { field: "shippingAddress", header: 'Địa chỉ nhận' },
    { field: "toProvinceName", header: 'Tỉnh đến' },
    { field: "toDistrictName", header: 'Quận/huyện đến' },
    { field: "kmNumberTD", header: 'KM tuyến huyện', typeFormat: "number" },
    { field: "toWardName", header: 'Phường/xã đến' },
    { field: "kmNumberTW", header: 'KM tuyến xã', typeFormat: "number" },
    { field: "toHubName", header: 'Trạm giao' },
    { field: "toHubRoutingName", header: 'Tuyến giao' },
    { field: "tplNumber", header: 'Mã VĐ đối tác' },
    { field: "tplName", header: 'Đối tác' },
  ];
  paymentCODTypes: SelectModel[] = [];
  selectedData: Shipment[] = [];
  listData: Shipment[];
  datasource: Shipment[];
  totalRecords: number = 0;
  maxRecordExport = 200;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  countSuccessCancelShipment = 0;
  countErrorCancelShipment = 0;
  dataCancelError: Shipment[] = [];
  totalShipmentCancel: number = 0;
  isConfirmCancels: boolean = false;
  isClickCancels: boolean = false;
  value: any = 0;
  ngOnInit() {
    this.placeHolderHub = `Chọn ${this.hub.centerHubSortName}/${this.hub.poHubSortName}/${this.hub.stationHubSortName}`;
    this.initData();
    this.loadProvinceLS();
    //this.loadCustomer();
    this.loadProvince();
    this.isActiveTabOne = false;
    this.isActiveTabTwo = true;
    this.loadShipment();
  }

  ngAfterViewInit() {
    (<any>$('.ui-table-wrapper')).doubleScroll();
  }

  initData() {
    this.optionSingleDateFrom = DaterangePickerHelper.getOptionSingleDatePickerNoTime(this.optionSingleDateFrom);
    this.optionSingleDateTo = DaterangePickerHelper.getOptionSingleDatePickerNoTime(this.optionSingleDateTo);
    this.subscription = this.commandService.commands.subscribe(c => this.handleCommand(c));
    this.deliveryCompleteStatus = StatusHelper.deliveryComplete;
    this.paymentTypeTTCT = PaymentTypeHelper.NGTTS;
    this.data = new Shipment();
    this.selectedFromCenterHub = null;
    this.currentTime = new Date();
    this.data.orderDate = this.currentTime;
    this.singlePickerOrderDate.startDate = new Date(
      this.currentTime
    );
    this.data.totalBox = 0;
    this.titleTabOne = "Tạo vận đơn chi tiết";
    this.loadCurrentHub();
    this.loadListService();
    this.loadGeneralInfo();
    // tab two
    this.updateImagePath = null;
    this.first = 0;
  }

  handleCommand(command: Command) {
    switch (command.name) {
      case 'CreateShipmentComponent.Ctrl+S':
        if (!this.checkSubmit) {
          this.clickSaveChange();
        }
        break;
      case 'CreateShipmentComponent.Ctrl+R':
        this.refresh();
        break;
      case 'CreateShipmentComponent.Ctrl+Q':
        if (!this.checkSubmitPrintSection) {
          this.clickSavePrintChange();
        }
        break;
    }
  }

  resetData() {
    this.resetInputData();
    this.resetFromLocationData();
    this.resetToLocationData();
    this.resetFlag();
  }

  resetInputData() {
    this.data = new Shipment();
    this.data.orderDate = null;
    this.inputShipmentNumber = null;
    this.selectedEmployee = null;
    this.selectedPickupUser = null;
    this.employees = null;
    this.employee = null;
    this.pickupUsers = null;
    this.pickupUser = null;
    this.cusDepartment = null;
    this.cusDepartments = null;
    this.shopCode = null;
    this.selectedDepartment = null;
    this.cloneCustomer = null;
    this.selectedCustomer = null;
    this.selectedCustomerReceipt = null;
    this.selectedPaymentType = null;
    this.selectedService = null;
    this.service = null;
    this.selectedStructure = null;
    this.structure = null;
    this.paymentType = null;
    this.selectedServiceDVGTs = [];
    this.toWeight = null;
    this.fromWeight = null;
    this.customer = null;
    this.customerReceipt = null;
    this.senderPhone = null;
    this.senderName = null;
    this.senderCompany = null;
    this.receiverPhone = null;
    this.receiverName = null;
    this.receiverCompany = null;
    this.chargeWeight = null;
    this.cloneTotalSelectedCountSK = null;
    this.isCreatedBox = null;
    this.msgService = null;
    this.msgxpectedDeliveryTime = null;
    this.selectedData = [];
    this.cloneRowDataShipment = null;
    this.isPaidPrice = false;
    this.isAgreementPrice = false;
    this.displayNoTotalPrice = false;
    this.isShowCheckBoxChangeShippingAddress = false;
    this.isSelectChangeShippingAddress = false;
    this.pickupUserCode = null;
    this.busenissUserCode = null;
  }

  resetInputDataNotSender() {
    this.data = new Shipment();
    this.data.orderDate = null;
    this.inputShipmentNumber = null;
    this.selectedEmployee = null;
    this.employees = null;
    this.employee = null;
    this.selectedPaymentType = null;
    this.selectedService = null;
    this.service = null;
    this.selectedStructure = null;
    this.structure = null;
    this.paymentType = null;
    this.selectedServiceDVGTs = [];
    this.toWeight = null;
    this.fromWeight = null;
    this.receiverPhone = null;
    this.receiverName = null;
    this.receiverCompany = null;
    this.chargeWeight = null;
    this.cloneTotalSelectedCountSK = null;
    this.isCreatedBox = null;
    this.msgService = null;
    this.msgxpectedDeliveryTime = null;
    this.selectedData = [];
    this.cloneRowDataShipment = null;
    this.isPaidPrice = false;
    this.isAgreementPrice = false;
    this.displayNoTotalPrice = false;
    this.isShowCheckBoxChangeShippingAddress = false;
    this.isSelectChangeShippingAddress = false;
  }
  resetFlag() {
    this.isEditLS = null;
    this.isViewVersion = null;
    this.isShowItemVersion = null;
  }

  async eventFilterFromHubs(event) {
    let value = event.query;
    if (value.length >= 1) {
      await this.hubService.getHubSearchByValueAsync(value, null).then(
        x => {
          this.allHubs = [];
          this.fromHubFilters = [];
          this.fromHubFilters.push("-- Chọn tất cả --");
          x.map(m => this.allHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.allHubs.map(m => this.fromHubFilters.push(m.label));
        }
      );
    }
  }
  // lọc bưu cục gửi
  eventOnSelectedFromHub() {
    let findH = this.allHubs.find(f => f.label == this.fromHubSelected);
    if (findH) {
      this.shipmentFilterViewModel.FromHubId = findH.value;
    } else {
      this.shipmentFilterViewModel.FromHubId = null;
    }
  }

  resetFilter() {
    this.txtFilterGb = null;
    this.txtShipmentNumber = null;
    this.txtFromWeight = null;
    this.txtToWeight = null;
    this.fromSelectedProvinceLS = null;
    this.toSelectedProvinceLS = null;
    this.fromSelectedSenderLS = null;
    this.selectedServicesLS = null;
    this.selectedPaymentTypeLS = null;
    this.selectedStatusLS = null;
  }

  resetFromLocationData() {
    this.searchFromControl.setValue(null);
    this.searchFromControl.enable();
    this.resetFromPDW();
    this.resetFromHubData();
  }

  resetFromPDW() {
    this.selectedFromProvince = null;
    this.fromProvince = null;
    this.fromDistricts = [];
    this.selectedFromDistrict = null;
    this.fromDistrict = null;
    this.fromWards = [];
    this.selectedFromWard = null;
    this.fromWard = null;
  }

  resetFromHubData() {
    this.selectedFromCenterHub = null;
    this.fromCenterHub = null;
    this.fromPoHubs = [];
    this.selectedFromPoHub = null;
    this.fromPoHub = null;
    this.fromStationHubs = [];
    this.selectedFromStationHub = null;
    this.fromStationHub = null;
    // this.fromHub = null;
    this.fromHubs = [];
  }

  resetToLocationData() {
    this.searchToControl.setValue(null);
    this.resetToPDW();
    this.resetToHubData();
  }

  resetToPDW() {
    this.selectedToProvince = null;
    this.toProvince = null;
    this.toDistricts = [];
    this.selectedToDistrict = null;
    this.toDistrict = null;
    this.toWards = [];
    this.selectedToWard = null;
    this.toWard = null;
  }

  resetToHubData() {
    this.selectedToCenterHub = null;
    this.toCenterHub = null;
    this.toPoHubs = [];
    this.selectedToPoHub = null;
    this.toPoHub = null;
    this.toStationHubs = [];
    this.selectedToStationHub = null;
    this.toStationHub = null;
    this.toHub = null;
    this.toHubs = [];
  }

  resetBox() {
    this.selectedContent = null;
    this.selectedWeight = 0;
    this.selectedWoodWeight = 0;
    this.selectedLength = null;
    this.selectedWidth = null;
    this.selectedHeight = null;
    this.selectedCalWeight = null;
    this.selectedCountSK = null;
    this.totalChargeWeightBoxes = null;
    this.totalCalWeightBoxes = null;
    this.totalWeightBoxes = null;
    this.totalSelectedCountSK = null;
  }

  resetPrice() {
    this.data.defaultPrice = 0;
    this.data.fuelPrice = 0;
    this.data.otherPrice = 0;
    this.data.remoteAreasPrice = 0;
    this.data.totalDVGT = 0;
    this.data.totalPrice = 0;
    this.data.vatPrice = 0;
  }

  // so sánh trọng lượng nhập vào với 3 loại trọng lượng của Box để lấy ra trọng lượng tính cước của vận đơn

  async loadProvince() {
    this.fromProvinces = [];
    this.resetFromPDW();
    this.toProvinces = [];
    this.resetToPDW();
    this.fromProvinces = await this.provinceService.getAllSelectModelAsync();
    if (this.fromProvinces) {
      this.toProvinces = this.fromProvinces
    }
  }

  async loadListService() {
    this.serviceService.getAllSelectModelAsync().then(
      x => {
        this.services = x as SelectModel[];
        let find = this.services.find(x => x.label.split(" - ")[0].indexOf("cpn") != -1)
        if (find) {
          this.selectedService = find.value;
          this.service = find.label;
          this.serviceName = find.title;
        }
        else {
          this.selectedService = this.services[1].value;
          this.service = this.services[1].label;
          this.serviceName = this.services[1].title;
        }
      }
    )
  }

  async loadService() {
    this.services = [];
    this.service = [];
    this.selectedService = null;
    this.resetPrice();
    let model = ServiceHelper.checkParams(this.selectedCustomer, this.selectedFromDistrict, this.selectedFromWard, this.selectedToDistrict, this.chargeWeight);
    // console.log(JSON.stringify(model));
    if (model && !this.isCreateShipmentSP) {
      model.insured = this.data.insured ? this.data.insured : 0;
      model.totalItem = this.data.totalItem ? this.data.totalItem : 0;
      model.structureId = this.selectedStructure;
      let data = await this.priceService.loadListServiceAsync(model);
      // console.log(data);
      if (data.message) {
        this.msgService = data.message;
      } else {
        this.msgService = null;
        this.services = data.data as SelectModel[];
        if (this.cloneRowDataShipment) {
          this.selectedService = this.cloneRowDataShipment.serviceId;
          let service = this.services.find(x => x.value == this.selectedService);
          if (service) {
            this.service = service.label;
            this.serviceName = service.title;
          }
        } else {
          let find = this.services.find(x => x.label.split(" - ")[0].indexOf("cpn") != -1)
          if (find) {
            this.selectedService = find.value;
            this.service = find.label;
            this.serviceName = find.title;
          }
          else {
            this.selectedService = this.services[1].value;
            this.service = this.services[1].label;
            this.serviceName = this.services[1].title;
          }
        }
        this.calculatePrice();
      }
    } else {
      this.services = [];
      this.service = [];
      this.selectedService = null;
    }
  }

  async loadGeneralInfo(): Promise<GeneralInfoModel> {
    this.generalInfo = await this.generalInfoService.getAsync();
    this.data.weight = this.generalInfo.defaultWeight;
    this.data.totalItem = 1;
    return this.generalInfo;
  }

  async loadCurrentHub() {
    const id = this.authService.getUserId();
    this.currentUserId = id;
    const arrCols = ["Hub"];
    const user = await this.userService.getAsync(id, arrCols);
    if (user) {
      this.currentUser = user;
      if (user.hub) {
        this.selectedFromHub = this.currentUser.hub.id;
        this.fromHubId = user.hub.id;
        this.fromHub = `${user.hub.code} - ${user.hub.name}`;
        this.fromHubCode = user.hub.code;
      }
    }
  }

  //filter Customers
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


  changeSender() {
    let cloneSelectedCustomer = this.customerChange;
    if (this.customerChange) {
      let findCus = this.customers.find(f => f.label.indexOf(cloneSelectedCustomer) >= 0);
      if (findCus) {
        this.fromSelectedSenderLS = findCus.value;
        this.shipmentFilterViewModel.SenderId = findCus.value;
      }
    } else {
      this.fromSelectedSenderLS = null;
      this.shipmentFilterViewModel.SenderId = null;
    }
    //this.loadShipmentPaging();
  }

  //search receiver
  async filterReceiverPhones(event) {
    let query = event.query;
    if (query.length > 9 && query.length <= 11) {
      await this.customerInfoLogService.searchAsync(query, this.data.senderId).then(
        x => {
          if (x) {
            this.filteredReceiverPhones = [];
            this.listInfoLog = x;
            this.listInfoLog.map(m => this.filteredReceiverPhones.push(m.phoneNumber));
          }
        }
      )
    }
  }

  keyUpShipmentNumber(input: any): boolean {
    this.cloneInputShipmentNumber = input;
    let isValidShipmentNumber: boolean = true;
    if (input) {
      if (input.errors) {
        if (input.errors.pattern) {
          isValidShipmentNumber = false;
        } else {
          isValidShipmentNumber = true;
        }
      }
    }
    return isValidShipmentNumber;
  }

  refresh() {
    this.resetData();
    this.resetFromHubData();
    this.resetFromLocationData();
    this.resetToHubData();
    this.resetToLocationData();
    this.resetBox();
    this.resetFilter();
    this.initData();
    this.isEditPriceDVGT = false;
  }
  refreshSave() {
    this.resetSaveData();
    // this.resetFromHubData();
    // this.resetFromLocationData();
    this.resetToHubData();
    this.resetToLocationData();
    this.resetBox();
    this.resetFilter();
    this.initData();
    this.isEditPriceDVGT = false;
  }
  resetSaveData() {
    this.resetInputDataNotSender();
    // this.resetSaveFromLocationData();
    this.resetToLocationData();
    this.loadGeneralInfo();
    this.resetFlag();
  }
  // resetSaveFromLocationData() {
  //   this.searchFromControl.setValue(null);
  //   this.searchFromControl.enable();
  //   this.resetFromPDW();
  //   this.resetFromHubData();
  // }

  reloadOrderDate() {
    if (this.isLoadOrderDate) {
      this.data.orderDate = this.currentTime;
    }
    if (this.isEditLS) {
      this.data.orderDate = this.currentTime;
    }
    //this.loadDeadlinePickupDelivery();
  }

  public singleSelectOrderDate(value: any) {
    this.data.orderDate = moment(value.start).toDate();
    this.isLoadOrderDate = true;
    //this.loadDeadlinePickupDelivery();
  }


  compareTime(fullTime: Date) {
    let time = new Date(fullTime);
    let now = new Date();
    let fullYear = time.getFullYear();
    let month = time.getMonth();
    let date = time.getDate();
    let hours = time.getHours();
    let minutes = time.getMinutes();
    let res = new Date(fullYear, month, date, hours, minutes);
    return res;
  }

  async processSavePrintCode() {
    // if (!this.createShipmentNoTotalPrice(this.isCreateShipmentNoTotalPrice)) return;
    this.checkSubmitPrintCode = true;

    this.data = await this.saveShipment();
    this.createOrUpdateCustomerInfoLog();
    // console.log(JSON.stringify(this.data));
    this.itemShipment = await this.onCreateAndPrintCode(this.data);
    this.idPrint = PrintHelper.printCodeCreateShipment;
    if (this.itemShipment) {
      setTimeout(() => {
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
        this.refreshSave();
        this.reSetPrimeShipment();
        this.data.pickingAddress = this.inputPickingAddress;
      }, 0);
    }
  }

  async clickSavePrintCode() {
    this.clickTxtButton = this.buttonSavePrintCode;
    if (!this.isValidToCreate()) return;
    this.checkTotalPrice();
  }

  async onCreateAndPrintCode(data: Shipment): Promise<Shipment> {
    this.createdDataShipment = await this.shipmentService.createAsync(data);
    this.checkSubmitPrintCode = InputValue.checkSubmit(
      this.checkSubmitPrintCode
    );
    if (this.createdDataShipment) {
      this.createdDataShipment.fakeId = "id" + this.createdDataShipment.id;
      this.itemShipment = [];
      this.itemShipment.push(this.createdDataShipment);
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Tạo đơn hàng thành công"
      });
    }
    return this.itemShipment;
  }

  async processSavePrintChange() {
    // if (!this.createShipmentNoTotalPrice(this.isCreateShipmentNoTotalPrice)) return;
    this.checkSubmitPrintSection = true;

    this.data = await this.saveShipment();
    this.createOrUpdateCustomerInfoLog();
    // console.log(JSON.stringify(this.data));
    this.itemShipment = await this.onCreateAndPrint(this.data);
    this.idPrint = PrintHelper.printCreateMultiShipment;

    let dataPrint: DataPrint = new DataPrint();
    dataPrint.dataPrints = this.itemShipment; //this.cloneSelectData;

    if (this.itemShipment) {
      await this.formPrintService.getFormPrintA5Async(this.data.senderId).then(
        x => {
          if (!this.isValidResponse(x)) return;
          let resultFormPrint = x.data as FromPrintViewModel;
          dataPrint.formPrint = resultFormPrint.formPrintBody;
          setTimeout(() => {
            this.printFrormServiceInstance.sendCustomEvent(dataPrint);
            this.refreshSave();
            this.reSetPrimeShipment();
            this.data.pickingAddress = this.inputPickingAddress;
          }, 0);
        }
      );
    }
    // if (this.itemShipment) {
    //   setTimeout(() => {
    //     this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
    //     this.refreshSave();
    //     this.reSetPrimeShipment();
    //     this.data.pickingAddress = this.inputPickingAddress;
    //   }, 0);
    // }
  }

  async clickSavePrintChange() {
    this.clickTxtButton = this.buttonSavePrintChange;
    if (!this.isValidToCreate()) return;
    this.checkTotalPrice(); // check tổng cước có bằng 0 hay không
  }

  async onCreateAndPrint(data: Shipment): Promise<Shipment> {
    this.createdDataShipment = await this.shipmentService.createAsync(data);
    this.checkSubmitPrintSection = InputValue.checkSubmit(
      this.checkSubmitPrintSection
    );
    //=============================================================================
    if (environment.namePrint == "Vietstar Express") {
      var dataSelected: any;
      var dataBox: any;
      let printSelectedData = [];
      if (this.createdDataShipment) {
        printSelectedData.push(this.createdDataShipment);
        const ids: number[] = printSelectedData.map(x => x.id);
        dataSelected = await this.shipmentService.getShipmentToPrintAsync(ids);
        if (dataSelected) {
          dataBox = await this.shipmentService.getBoxesAsync(ids);
          if (dataBox) {
            if (!ArrayHelper.isNullOrZero(dataBox)) {
              dataSelected.forEach(shipment => {
                shipment.boxes = [];
                dataBox.forEach(box => {
                  if (box.shipmentId === shipment.id) {
                    shipment.boxes.push(box);
                  }
                });
              });
            } else {
              dataSelected.forEach(shipment => {
                shipment.boxes = [];
              });
            }
          }
          if (!ArrayHelper.isNullOrZero(dataSelected)) {
            this.itemShipment = [];
            dataSelected[0].fakeId = "id" + this.createdDataShipment.id;
            //================
            this.itemShipment.companyName = this.generalInfo.companyName.toLocaleUpperCase();
            this.itemShipment.logoUrl = this.generalInfo.logoUrl;
            this.itemShipment.hotLine = this.generalInfo.hotLine;
            this.itemShipment.centerHubAddress = this.generalInfo.addressMain;
            this.itemShipment.website = this.generalInfo.website;
            this.itemShipment.policy = this.generalInfo.policy;
            //================
            this.itemShipment.push(dataSelected[0]);
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Tạo đơn hàng thành công"
            });
          }
          return this.itemShipment;
        }
      }
    }
    //===========================================================================
    else {
      if (this.createdDataShipment) {
        this.itemShipment = [];
        this.createdDataShipment.fakeId = "id" + this.createdDataShipment.id;
        this.itemShipment.companyName = this.generalInfo.companyName.toLocaleUpperCase();
        this.itemShipment.logoUrl = this.generalInfo.logoUrl;
        this.itemShipment.hotLine = this.generalInfo.hotLine;
        this.itemShipment.centerHubAddress = this.generalInfo.addressMain;
        this.itemShipment.website = this.generalInfo.website;
        this.itemShipment.policy = this.generalInfo.policy;
        //
        this.createdDataShipment.isShowPrice = this.isShowPrice;
        this.createdDataShipment.fromHubCode = this.fromHubCode;
        this.createdDataShipment.toDistrictName = this.toDistrictName;
        this.createdDataShipment.toWardName = this.toWardName;
        let toHub = this.toHubs.find(x => x.value == this.selectedToHub);
        if (toHub) {
          if (toHub.data) {
            this.createdDataShipment.toHubCode = toHub.data.code;
          }
        }
        if (this.createdDataShipment.pickUserId == this.currentUserId) {
          this.createdDataShipment.pickUserCode = this.authService.getUserName();
          this.createdDataShipment.pickUserFullName = this.authService.getFullName();
        }
        let senderCode = new SelectModel;
        if (this.selectedCustomer) {
          senderCode = this.customers.find(x => x.value == this.selectedCustomer.id);
        }
        this.createdDataShipment.senderCode = senderCode.data.code;
        let structure = this.structures.find(x => x.value == this.selectedStructure);
        this.createdDataShipment.structureName = structure.title;
        this.createdDataShipment.serviceName = this.serviceName;
        let payment = this.paymentTypes.find(x => x.value == this.selectedPaymentType)
        this.createdDataShipment.paymentName = payment.title;
        let obj = [];
        this.objSelectesServiceDVGTs.forEach(x => {
          obj.push(x.name);
        });
        this.createdDataShipment.serviceDVGTIdsName = obj.join(", ");
        this.createdDataShipment.createdBy = this.authService.getFullName();
        const time = new Date();
        this.createdDataShipment.printTime = time;
        this.createdDataShipment.getFullYear = time.getFullYear();
        this.itemShipment.push(this.createdDataShipment);
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tạo đơn hàng thành công"
        });
      }
      return this.itemShipment;
    }
  }

  async processSaveChange() {
    this.checkSubmit = true;
    this.data.shopCode = this.shopCode;
    this.data.requestShipmentId = this.requestShipmentId;

    if (!this.cloneRowDataShipment) {
      this.data = await this.saveShipment();
      this.createOrUpdateCustomerInfoLog();
      // console.log(JSON.stringify(this.data));
      let data = await this.shipmentService.createAsync(this.data);
      this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);
      if (data) {
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tạo đơn hàng thành công"
        });
        this.refreshSave();
        this.reSetPrimeShipment();
        this.atcSenderCodeRef.domHandler.findSingle(this.atcSenderCodeRef.el.nativeElement, 'input').focus();
        this.atcSenderCodeRef.domHandler.findSingle(this.atcSenderCodeRef.el.nativeElement, 'input').select();
      }
    } else {
      this.data = await this.saveShipment();
      // console.log(JSON.stringify(this.data));
      let data = await this.shipmentService.updateAsync(this.data);
      this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);
      if (data) {
        //create Version
        // save column haved changed into DataChanged
        this.cloneRowDataShipment.orderDate = SearchDate.formatToISODate(this.cloneRowDataShipment.orderDate);
        this.cloneRowDataShipment.endPickTime = SearchDate.formatToISODate(this.cloneRowDataShipment.endPickTime);
        const dataChanged = ShipmentVersionHelper.getDiff(this.cloneRowDataShipment, this.data);
        if (!StringHelper.isNullOrEmpty(dataChanged)) {
          this.cloneRowDataShipment.dataChanged = dataChanged;
        }
        // save column haved changed into PropertyChanged
        this.shipmentVersionService.createAsync(this.cloneRowDataShipment);
        this.messageService.add({ severity: Constant.messageStatus.success, detail: "Sửa đơn hàng thành công" });
        this.refresh();
        this.reSetPrimeShipment();
        this.requestShipmentId = null;
        this.requestShipmentCode = null;
      }
    }
    this.data.pickingAddress = this.inputPickingAddress;
  }

  keyTabServiceDVGT(multiselectDVGT) {
    // multiselectDVGT.overlayVisible = true;
    // multiselectDVGT.domHandler.findSingle(multiselectDVGT.el.nativeElement, 'input').focus();
    // multiselectDVGT.target.Select;
  }
  keyEseServiceDVGT(multiselectDVGT) {
    //multiselectDVGT.overlayVisible = false;
  }

  async clickSaveChange() {
    this.clickTxtButton = this.buttonSaveChange;
    if (!this.isValidToCreate()) return;
    this.checkTotalPrice();
  }

  async saveShipment(): Promise<any> { // map dữ liệu để tạo hoặc update vận đwon
    // save shipmentNumber
    let isValidShipmentNumber: boolean = this.keyUpShipmentNumber(
      this.cloneInputShipmentNumber
    );
    if (this.inputShipmentNumber && isValidShipmentNumber) {
      if (!this.isEditLS) {
        const isDuplicate = await this.shipmentService.checkExistTrackingNumberAsync(this.inputShipmentNumber);
        // const isDuplicate = InputValue.checkDuplicateCode(this.inputShipmentNumber, "shipmentNumber", this.datasource, this.messageService);
        if (!isDuplicate.isSuccess) {
          this.data.shipmentNumber = this.inputShipmentNumber;
        } else {
          return;
        }
      } else {
        this.data.shipmentNumber = this.inputShipmentNumber;
      }
    }

    // check tạo vận đơn hỗ trợ
    if (this.isCreateShipmentSP && !this.cloneRowDataShipment) {
      this.clickSaveShipmentSP();
    }

    // save OrderDate EndPickTimne ExpectedDeliveryTime
    this.saveTime();

    // save Sender
    this.senderPhone = InputValue.trimInput(this.senderPhone);
    this.data.senderPhone = this.senderPhone;
    this.senderName = InputValue.trimInput(this.senderName);
    this.data.senderName = this.senderName;
    if (this.senderCompany) {
      this.senderCompany = InputValue.trimInput(this.senderCompany);
      this.data.companyFrom = this.senderCompany;
    }
    if (this.selectedDepartment) {
      this.data.cusDepartmentId = this.selectedDepartment;
    }

    // save Receiver
    this.receiverPhone = InputValue.trimInput(this.receiverPhone);
    this.data.receiverPhone = this.receiverPhone;
    if (this.data.addressNoteFrom) {
      this.data.addressNoteFrom = InputValue.trimInput(
        this.data.addressNoteFrom
      );
    }
    this.receiverName = InputValue.trimInput(this.receiverName);
    this.data.receiverName = this.receiverName;
    if (this.receiverCompany) {
      this.receiverCompany = InputValue.trimInput(this.receiverCompany);
      this.data.companyTo = this.receiverCompany;
    }
    if (this.data.addressNoteTo) {
      this.data.addressNoteTo = InputValue.trimInput(this.data.addressNoteTo);
    }
    if (this.data.content) {
      this.data.content = InputValue.trimInput(this.data.content);
    }
    if (this.selectedCustomer) {
      this.data.senderId = this.selectedCustomer.id;
      this.isShowPrice = this.selectedCustomer.isShowPrice;
    }
    if (this.customerReceipt && this.selectedCustomerReceipt) {
      this.data.receiverId = this.selectedCustomerReceipt.id;
    }

    // save fromWard, fromHub
    this.data.fromProvinceId = this.selectedFromProvince;
    this.data.fromDistrictId = this.selectedFromDistrict;
    this.data.fromWardId = this.selectedFromWard;
    this.data.serviceDVGTIds = this.selectedServiceDVGTs;
    if (this.selectedServiceDVGTs) {
      this.objSelectesServiceDVGTs = [];
      this.serviceDVGTs.forEach((x, index, array) => {
        let obj: Service = x;
        this.selectedServiceDVGTs.forEach(y => {
          if (obj.id === y) {
            this.objSelectesServiceDVGTs.push(obj);
          }
        });
      });
      this.data.shipmentServiceDVGTs = this.objSelectesServiceDVGTs;
    }


    this.data.fromHubId = this.selectedFromHub;
    // save ToWard, ToHub
    if (this.selectedToProvince) {
      this.data.toProvinceId = this.selectedToProvince;
    }

    if (this.selectedToDistrict) {
      this.data.toDistrictId = this.selectedToDistrict;
    }

    if (this.selectedToWard) {
      this.data.toWardId = this.selectedToWard;
    }

    this.data.toHubId = this.selectedToHub;

    if (!this.cloneRowDataShipment) {
      this.data.shipmentStatusId = StatusHelper.readyToDelivery;
      // save Employee
      if (this.selectedEmployee && this.data.fromHubId === this.data.toHubId) {
        this.data.shipmentStatusId = StatusHelper.assignEmployeeDelivery;
        this.data.deliverUserId = this.selectedEmployee;
        this.data.currentEmpId = this.selectedEmployee;
      } else if (this.data.fromHubId !== this.data.toHubId) {
        this.data.shipmentStatusId = StatusHelper.waitingToTransfer;
      }
    } else {
      this.data.shipmentStatusId = this.cloneRowDataShipment.shipmentStatusId;
    }

    // save payment
    if (this.selectedPaymentType) {
      this.data.paymentTypeId = this.selectedPaymentType;
      if (this.selectedPaymentType === PaymentTypeHelper.NGTTN) {
        this.data.keepingTotalPriceEmpId = this.data.pickUserId;
      }
    }

    // save structure
    if (this.selectedStructure) {
      this.data.structureId = this.selectedStructure;
    }

    // save service
    if (this.selectedService) {
      this.data.serviceId = this.selectedService;
    }

    // save boxes
    if (!this.isCreatedBox) {
      this.data.totalBox = this.data.totalBox ? this.data.totalBox : 0;
    } else {
      this.data.totalBox =
        this.data.totalBox >= this.cloneTotalSelectedCountSK
          ? this.data.totalBox
          : this.cloneTotalSelectedCountSK;
    }

    // save price
    this.data.totalItem = this.data.totalItem ? this.data.totalItem : 0;
    this.data.calWeight = this.data.calWeight ? this.data.calWeight : 0;
    this.data.cod = this.data.cod ? this.data.cod : 0;
    this.data.insured = this.data.insured ? this.data.insured : 0;
    this.data.otherPrice = this.data.otherPrice ? this.data.otherPrice : 0;
    this.data.isAgreementPrice = this.isAgreementPrice;
    this.data.defaultPrice = this.data.defaultPrice
      ? this.data.defaultPrice
      : 0;
    this.data.fuelPrice = this.data.fuelPrice ? this.data.fuelPrice : 0;
    this.data.otherPrice = this.data.otherPrice ? this.data.otherPrice : 0;
    this.data.remoteAreasPrice = this.data.remoteAreasPrice
      ? this.data.remoteAreasPrice
      : 0;
    this.data.totalDVGT = this.data.totalDVGT ? this.data.totalDVGT : 0;
    this.data.totalPrice = this.data.totalPrice ? this.data.totalPrice : 0;
    this.data.vatPrice = this.data.vatPrice ? this.data.vatPrice : 0;
    if (this.data.priceDVGTs) {
      if (this.data.priceDVGTs.length > 0) {
        this.data.priceDVGTs = this.data.priceDVGTs;
      }
    } else {
      this.data.priceDVGTs = [];
    }
    return this.data;
  }

  async clickSaveShipmentSP() {
    this.messageService.clear();
    if (!this.isValidInsured()) return;
    const insured = this.data.insured;
    const defaultCod = this.cloneShipmentSP.cod;
    if (!insured || insured === 0) {
      // alert("Giá trị trả về bằng 0, bạn có chắc chắn muốn tạo vđ hỗ trợ này không?");
      this.displayInsured = true;
      return;
    } else {
      const updateShipment = Object.assign({}, this.cloneShipmentSP);
      this.cloneShipmentSP.cod = defaultCod - insured;
      let noteForVersion: string = "";
      if (!this.cloneShipmentSP.isAgreementPrice) {
        const chargeWeight = (this.cloneShipmentSP.weight >= this.cloneShipmentSP.calWeight) ? this.cloneShipmentSP.weight : this.cloneShipmentSP.calWeight;
        this.calculatePriceShipmentSP(this.cloneShipmentSP, chargeWeight);
        noteForVersion = "Tạo vđ hỗ trợ trả về giá là: " + insured + " VNĐ" + ", có cập nhật giá";
        updateShipment.note = noteForVersion;
      } else {
        noteForVersion = "Tạo vđ hỗ trợ trả về giá là: " + insured + " VNĐ" + ", không cập nhật giá";
        updateShipment.note = noteForVersion;
      }
      // update shipment default
      this.shipmentService.updateAsync(this.cloneShipmentSP);
      // create version
      this.shipmentVersionService.createAsync(updateShipment);
    }
    if (this.displayInsured) {
      this.displayInsured = false;
    }
  }

  async calculatePriceShipmentSP(shipment: Shipment, chargeWeight: number) {
    if (
      shipment.fromDistrictId &&
      shipment.serviceId &&
      shipment.toDistrictId &&
      (!this.selectedFromWard && !this.selectedFromDistrict) &&
      chargeWeight
    ) {
      let model: ShipmentCalculateViewModel = new ShipmentCalculateViewModel();
      model.fromDistrictId = shipment.fromDistrictId;
      model.fromWardId = shipment.fromWardId;
      model.structureId = shipment.structureId;
      model.insured = shipment.insured ? shipment.insured : 0;
      model.otherPrice = shipment.otherPrice ? shipment.otherPrice : 0;
      model.cod = shipment.cod ? shipment.cod : 0;
      if (shipment.sender) {
        model.senderId = shipment.sender.id;
      }
      model.serviceId = shipment.serviceId;
      model.serviceDVGTIds = shipment.serviceDVGTIds;
      model.toDistrictId = shipment.toDistrictId;
      model.weight = chargeWeight;
      model.isAgreementPrice = shipment.isAgreementPrice;
      model.defaultPrice = shipment.defaultPrice ? shipment.defaultPrice : 0;
      model.totalItem = shipment.totalItem ? shipment.totalItem : 0;

      // const boxes = await this.boxService.getByShipmentIdAsync(shipment.id);
      // model.priceBox = boxes;
      const data = await this.serviceDVGTService.getPriceDVGTByShipmentIdAsync(shipment.id);
      model.priceDVGTs = shipment.serviceDVGTIds.map(x => {
        if (data) {
          if (data.length > 0) {
            const priceDVGTs = data.map(x => {
              x["totalPrice"] = x["price"];
              return x;
            }) as any[];
            let find = priceDVGTs.find(y => x == y.serviceDVGTId);
            if (find)
              return find;
            else
              return {
                ServiceDVGTId: x,
                isAgree: false,
                totalPrice: 0
              }
          }
        }
      });
      model.priceBox = this.data.boxes;
      model.calWeight = shipment.calWeight;
      model.toWardId = shipment.toWardId;
      const price = await this.priceService.calculateAsync(model);
      if (price) {
        shipment.defaultPrice = price.defaultPrice;
        shipment.fuelPrice = price.fuelPrice;
        shipment.otherPrice = price.otherPrice;
        shipment.remoteAreasPrice = price.remoteAreasPrice;
        shipment.totalDVGT = price.totalDVGT;
        shipment.totalPrice = price.totalPrice;
        shipment.vatPrice = price.vatPrice;
        shipment.priceDVGTs = price.priceDVGTs;
      }
    }
  }

  async createOrUpdateCustomerInfoLog() {
    // createorUpdate CustomerInfoLog
    let model = new CustomerInfoLog();
    model.name = this.receiverName;
    model.address = this.data.shippingAddress;
    model.addressNote = this.data.addressNoteTo;
    model.senderId = this.data.senderId;
    model.phoneNumber = this.data.receiverPhone;
    model.companyName = this.data.companyTo;
    model.provinceId = this.selectedToProvince;
    model.districtId = this.selectedToDistrict;
    model.wardId = this.selectedToWard;
    model.lat = this.data.latTo;
    model.lng = this.data.lngTo;

    let data = await this.customerInfoLogService.createOrUpdateAsync(model);
    return data;
  }

  saveTime() {
    // save OrderDate EndPickTimne ExpectedDeliveryTime
    if (!this.data.orderDate) {
      this.data.orderDate = this.currentTime;
      this.data.endPickTime = this.currentTime;
      this.data.startPickTime = this.currentTime;
    } else {
      this.data.endPickTime = this.data.orderDate;
      this.data.startPickTime = this.currentTime;
    }
    this.data.orderDate = SearchDate.formatToISODate(this.data.orderDate);
    this.data.endPickTime = SearchDate.formatToISODate(this.data.endPickTime);
    this.data.startPickTime = SearchDate.formatToISODate(this.data.startPickTime);
  }

  async checkRequestShipmentId() {
    if (this.requestShipmentCode) {
      let requestShipment = await this.requestShipmentService.trackingShortAsync(this.requestShipmentCode, []);
      if (requestShipment && requestShipment.id) {
        this.requestShipmentId = requestShipment.id;
      }
      else
        this.requestShipmentId = null;
    }
    else
      this.requestShipmentId = null;
  }

  isValidToCreate(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (this.selectedShipmentType.value === 2 || this.selectedShipmentType.value === 3) {
      if (StringHelper.isNullOrEmpty(this.scanShipmentNumber)) {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "Chưa scan mã vận đơn gốc"
        });
        result = false;
      }
    }

    if (!this.senderPhone) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập số điện thoại người gửi"
      });
      result = false;
    }

    if (!this.senderName) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập tên người gửi"
      });
      result = false;
    }

    if (!this.data.pickUserId) {
      let currentUserId = this.authService.getUserId();
      this.data.pickUserId = currentUserId;
    }

    if (!this.data.pickingAddress) {
      this.data.pickingAddress = this.inputPickingAddress;
      if (!this.data.pickingAddress) {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "Chưa nhập địa chỉ lấy hàng"
        });
        result = false;
      }
    }

    if (!this.selectedFromProvince) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn tỉnh/thành gửi"
      });
      result = false;
    }

    if (!this.selectedFromDistrict) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn quận/huyện gửi"
      });
      result = false;
    }

    if (!this.receiverPhone) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập số điện thoại người nhận"
      });
      result = false;
    }

    if (!this.receiverName) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập tên người nhận"
      });
      result = false;
    }

    if (!this.data.shippingAddress) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập địa chỉ giao hàng"
      });
      result = false;
    }

    if (!this.selectedToProvince) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn tỉnh/thành nhận"
      });
      result = false;
    }

    if (!this.selectedToDistrict) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn quận/huyện nhận"
      });
      result = false;
    }

    if (!this.selectedPaymentType) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn HT thanh toán"
      });
      result = false;
    }

    if (!this.selectedStructure) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn loại hàng hoá"
      });
      result = false;
    }

    // if (!this.selectedService) {
    //   messages.push({
    //     severity: Constant.messageStatus.warn,
    //     detail: "Chưa chọn dịch vụ"
    //   });
    //   result = false;
    // }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  checkTotalPrice() {
    if (!this.data.totalPrice || this.data.totalPrice === 0 && !this.isCreateShipmentSP) {
      this.displayNoTotalPrice = true; // tổng cước bằng 0 => show cảnh báo
    } else {
      this.createShipmentNoTotalPrice();
    }
  }

  search(value) {
    this.shipmentFilterViewModel.SearchText = value;
    this.loadShipmentPaging();
  }

  isValidToCreateBox(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedLength) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập chiều dài"
      });
      result = false;
    }

    if (!this.selectedWidth) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập chiều rộng"
      });
      result = false;
    }

    if (!this.selectedHeight) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập chiều cao"
      });
      result = false;
    }

    if (!this.dim) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa có DIM tính TLQĐ"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  onAgreementPrice() {
    if (!this.isAgreementPrice) {
      this.calculatePrice();
    }
  }

  changeCOD() {
    if (!this.data.cod) this.data.cod = 0;
    if (this.data.cod > 0 && !this.data.paymentCODTypeId) this.data.paymentCODTypeId = 1;
    else if (this.data.cod == 0) this.data.paymentCODTypeId = null;
    this.calculatePrice();
  }

  async calculatePrice() {
    let findService = this.serviceDVGTs.find(f => f.code.toUpperCase() == ServiceDVGTHelper.COD.toUpperCase())
    if (this.data.cod) {
      if (!this.selectedServiceDVGTs.find(f => f == findService.id)) {
        this.selectedServiceDVGTs.push(findService.id);
      }
    } else {
      let finIndex = this.selectedServiceDVGTs.findIndex(f => f == findService.id);
      if (finIndex >= 0) {
        this.selectedServiceDVGTs.splice(finIndex, 1);
      }
    }
    // tạo vận đơn bình thường hoặc vd liên quan
    if (
      this.selectedFromDistrict &&
      // this.selectedCustomer &&
      this.selectedService &&
      this.selectedToDistrict &&
      (this.selectedFromWard || this.selectedFromDistrict) &&
      this.chargeWeight
    ) {
      let model: ShipmentCalculateViewModel = new ShipmentCalculateViewModel();
      if (this.selectedFromDistrict) {
        model.fromDistrictId = this.selectedFromDistrict;
      }
      if (this.data.endPickTime) model.orderDate = this.data.endPickTime;
      if (model.orderDate && this.data.orderDate) model.orderDate = this.data.orderDate;
      model.fromHubId = this.selectedFromHub;
      model.isAgreementPrice = this.isAgreementPrice;
      model.defaultPrice = this.data.defaultPrice;
      model.fromWardId = this.selectedFromWard;
      model.structureId = this.selectedStructure;
      model.otherPrice = this.data.otherPrice ? this.data.otherPrice : 0;
      model.cod = this.data.cod ? this.data.cod : 0;
      model.insured = this.data.insured ? this.data.insured : 0;
      if (this.selectedCustomer) {
        model.senderId = this.selectedCustomer.id;
      }
      model.serviceId = this.selectedService;
      model.toDistrictId = this.selectedToDistrict;
      model.weight = this.chargeWeight;
      model.isAgreementPrice = this.isAgreementPrice;
      model.defaultPrice = this.data.defaultPrice ? this.data.defaultPrice : 0;
      model.totalItem = this.data.totalItem ? this.data.totalItem : 0;
      model.priceDVGTs = this.data.priceDVGTs;
      model.serviceDVGTIds = this.data.serviceDVGTIds;
      // this.selectedServiceDVGTs.map(x => {
      //   if (!this.data.priceDVGTs) this.data.priceDVGTs = [];
      //   let find = this.data.priceDVGTs.find(y => x == y.serviceDVGTId);
      //   if (find)
      //     return find;
      //   else
      //     return {
      //       ServiceDVGTId: x,
      //       isAgree: false,
      //       totalPrice: 0
      //     }
      // });

      // console.log(JSON.stringify(model));
      model.priceBox = this.data.boxes;
      model.calWeight = this.data.calWeight;
      model.toWardId = this.selectedToWard;
      let price = await this.priceService.calculateAsync(model);
      if (price) {
        this.resetPrice();
        // console.log(price);
        this.data.defaultPrice = price.defaultPrice;
        this.data.fuelPrice = price.fuelPrice;
        this.data.otherPrice = price.otherPrice;
        this.data.remoteAreasPrice = price.remoteAreasPrice;
        this.data.totalDVGT = price.totalDVGT;
        this.data.vatPrice = price.vatPrice;
        this.data.priceDVGTs = price.priceDVGTs;
        this.data.priceReturn = price.priceReturn;
        this.data.priceCOD = price.priceCOD;
        this.data.totalPrice = price.totalPrice;
        this.data.totalPriceSYS = price.totalPriceSYS;
        this.data.deliveryDate = SearchDate.formatToISODate(price.deadlineDelivery);
        this.dim = price.dim;
        this.resetTotalCollect();
        if (price.priceDVGTs.length > 0) {
          this.isEditPriceDVGT = true;
        }
        else {
          this.isEditPriceDVGT = false;
        }
      }
    } else {
      this.resetPrice();
    }
  }

  resetTotalCollect() {
    this.totalCollect = 0;
    if (this.data.cod) this.totalCollect += parseInt(this.data.cod.toString());
    if (this.selectedPaymentType == PaymentTypeHelper.NNTTN && this.data.totalPrice) this.totalCollect += parseFloat(this.data.totalPrice.toString());
    if (this.data.paymentCODTypeId == 2 && this.data.priceCOD) this.totalCollect += parseFloat(this.data.priceCOD.toString());
  }

  /**
   * Tab 2
   */

  onViewToLocation() {
    if (this.isViewToLocation) {
      this.toLocation = "block";
      this.fromLocation = "block";
    } else {
      this.toLocation = "none";
      this.fromLocation = "none";
    }
  }

  onChaneShippingAddress() {
    if (this.cloneRowDataShipment) {
      this.data.isChangeShippingAddress = this.isSelectChangeShippingAddress;
    }
  }

  async loadShipmentPaging() {
    // params lọc vận đơn tùy vào có lọc mã vận đơn hay không
    this.shipmentFilterViewModel.IsExistInfoDelivery = this.isExistInfoDelivery;
    this.shipmentFilterViewModel.IsExistImagePickup = this.isExistImagePickup;
    if (this.onPageChangeEvent) {
      this.shipmentFilterViewModel.PageNumber = this.onPageChangeEvent.first / this.onPageChangeEvent.rows + 1;
      this.shipmentFilterViewModel.PageSize = this.onPageChangeEvent.rows;
    } else {
      this.shipmentFilterViewModel.PageSize = this.rowPerPage;
      this.shipmentFilterViewModel.PageNumber = this.pageNum;
    }
    if (!StringHelper.isNullOrEmpty(this.txtShipmentNumber) || (!StringHelper.isNullOrEmpty(this.txtRequestShipmentNumber) && this.searchRequestShipmentId)) {
      this.shipmentFilterViewModel.Cols = this.includes;
      this.shipmentFilterViewModel.Type = ShipmentTypeHelper.historyPickup;
      this.shipmentFilterViewModel.PageSize = this.rowPerPage;
      this.shipmentFilterViewModel.PageNumber = 1;
      this.shipmentFilterViewModel.ShipmentNumber = this.txtShipmentNumber;
      this.shipmentFilterViewModel.RequestShipmentId = this.searchRequestShipmentId;
      this.shipmentFilterViewModel.isBox = null;
    } else {
      this.shipmentFilterViewModel.ShipmentNumber = null;
      this.shipmentFilterViewModel.FromProvinceId = this.fromSelectedProvinceLS;
      this.shipmentFilterViewModel.ToProvinceId = this.toSelectedProvinceLS;
      this.shipmentFilterViewModel.SearchText = this.searchText;
      this.shipmentFilterViewModel.SenderId = this.fromSelectedSenderLS;
      this.shipmentFilterViewModel.ShipmentStatusId = this.selectedStatusLS;
      this.shipmentFilterViewModel.ServiceId = this.selectedServicesLS;
      this.shipmentFilterViewModel.PaymentTypeId = this.selectedPaymentTypeLS;
      this.shipmentFilterViewModel.WeightFrom = this.txtFromWeight;
      this.shipmentFilterViewModel.WeightTo = this.txtToWeight;
      this.shipmentFilterViewModel.uploadExcelHistoryId = this.selectedUploadExcelHistory;
      if (!this.selectedDateFrom) {// load ngày hiện tại
        this.selectedDateFrom = SearchDate.formatToISODate(new Date());
      } else {
        this.selectedDateFrom = SearchDate.formatToISODate(this.selectedDateFrom);
      }
      if (!this.selectedDateTo) {// load ngày hiện tại
        this.selectedDateTo = SearchDate.formatToISODate(new Date());
      } else {
        this.selectedDateTo = SearchDate.formatToISODate(this.selectedDateTo);
      }
      this.shipmentFilterViewModel.OrderDateFrom = this.selectedDateFrom;
      this.shipmentFilterViewModel.OrderDateTo = this.selectedDateTo;
    }

    // await this.shipmentService.getListShipment(this.shipmentFilterViewModel).then(x => {
    await this.shipmentService.getListShipment(this.shipmentFilterViewModel).then(x => {
      if (x) {
        this.countLoadLS++;
        const data = x.data as Shipment[] || [];
        this.datasource = data;
        this.listData = this.datasource;
        this.totalRecords = this.listData.length > 0 ? data[0].totalCount : 0;
        // return this.datasource;
        // if (!ArrayHelper.isNullOrZero(this.datasource)) {
        //   this.loadShipmentVersion();
        // }
      }
    });
    //
    this.loadUploadExcelHisstoryLS();
  }

  async loadShipment() {
    await this.loadShipmentPaging();
  }

  async loadShipmentVersion() {
    const ids: number[] = this.datasource.map(x => x.id);
    const includes: string[] = [];
    includes.push("CreatedByUser");
    const data = await this.shipmentVersionService.getGetByListShipmentIdAsync(ids, includes);
    if (data) {
      this.listShipmentVersionsByGetIds = data;
      this.datasource = this.checkExistVersion();
    }
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;

        // filter
        // if (event.filters.length > 0)
        //   this.filterRows = this.datasource.filter(x =>
        //     FilterUtil.filterField(x, event.filters)
        //   );
        // else
        //   this.filterRows = this.datasource.filter(x =>
        //     FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
        //   );

        // begin Custom filter

        // sort data
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
    this.onPageChangeEvent = event;
    this.shipmentFilterViewModel.PageNumber = this.onPageChangeEvent.first / this.onPageChangeEvent.rows + 1;
    this.shipmentFilterViewModel.PageSize = this.onPageChangeEvent.rows;
    this.loadShipmentPaging();
  }

  showListTable() {
    this.colorList = "#183545";
    this.colorGrib = "#dadada";
    this.isGribTable = false;
    this.isListTable = true;
  }

  showGribTable() {
    this.colorGrib = "#183545";
    this.colorList = "#dadada";
    this.isGribTable = true;
    this.isListTable = false;
  }

  async exportCSV(dt: any) {
    if (dt) {
      let fileName = "DANH_SACH_VAN_DON.xlsx";
      if (this.totalRecords > 0) {
        if (this.totalRecords > this.maxRecordExport) {
          let data: any[] = [];
          let count = Math.ceil(this.totalRecords / this.maxRecordExport);
          let promise = [];

          for (let i = 1; i <= count; i++) {
            let clone = this.shipmentFilterViewModel;
            clone.PageNumber = i;
            clone.PageSize = this.maxRecordExport;

            promise.push(await this.shipmentService.getListShipment(clone));
          }
          Promise.all(promise).then(rs => {
            rs.map(x => {
              data = data.concat(x.data);
            })

            let dataE = data.reverse();
            var dataEX = ExportAnglar5CSV.ExportData(dataE, this.columns, false, false);
            ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
          })
        }
        else {
          let clone = this.shipmentFilterViewModel;
          clone.PageNumber = 1;
          clone.PageSize = this.totalRecords;

          this.shipmentService.getListShipment(clone).then(x => {
            let data = x.data.reverse();
            dt.value = data;
            var dataEX = ExportAnglar5CSV.ExportData(data, this.columns, false, false);
            ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
            //dt.exportCSV();
          });
        }
      }
      else {
        dt.exportCSV();
      }
    }
  }

  exportCSVNew(dt: any) {
    if (dt) {
        let fileName = "BAO_CAO_GIAO_NHAN_CHI_TIET";
        let strMimeType = MineTypeHelper.mineTypeXLSX;
        let clone = this.shipmentFilterViewModel;
        clone.customExportFile.columnExcelModels = this.columns;
        clone.PageNumber = 1;
        clone.PageSize = this.totalRecords;
        this.shipmentService.getListShipmentExport(this.shipmentFilterViewModel);
    }
}

  totalReCal: number = 0;
  totalReCalSuccess: number = 0;
  totalReCalFail: number = 0;
  percentReCal: number = 0;
  isReCalculate: boolean = false;
  listError: string;
  async openModelReCalculete(template: TemplateRef<any>, dt: any) {
    this.messageService.clear();
    this.totalReCal = 0;
    this.totalReCalSuccess = 0;
    this.totalReCalFail = 0;
    this.percentReCal = 0;
    this.isReCalculate = false;
    this.listError = null;
    if (!dt) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không có vận đơn để tính giá' });
      return
    }
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }
  async reCalculateShipment(dt: any) {
    this.listError = null;
    this.isReCalculate = true;
    if (dt) {
      let getRecords = 200;
      if (this.totalRecords > 0) {
        let count: number = 1;
        if (this.totalRecords > getRecords) {
          count = Math.ceil(this.totalRecords / getRecords);
        }
        for (let i = 1; i <= count; i++) {
          let clone = this.shipmentFilterViewModel;
          clone.Cols = null;
          clone.PageNumber = i;
          clone.PageSize = getRecords;
          await this.shipmentService.getListShipment(clone).then(
            async x => {
              if (x.isSuccess == true) {
                await (x.data as Shipment[]).map(async s => {
                  let updatShipment: UpdateStatusCurrentEmp = new UpdateStatusCurrentEmp();
                  updatShipment.id = s.id;
                  await this.shipmentService.reCalcualteShipmentAsync(updatShipment).then(
                    async u => {
                      this.totalReCal++;
                      this.percentReCal = Math.ceil(this.totalReCal * 100 / this.totalRecords);
                      if (u.isSuccess == true) this.totalReCalSuccess++;
                      else {
                        this.totalReCalFail++;
                        if (this.listError) this.listError += `, ${updatShipment.shipmentNumber}`;
                        else this.listError = updatShipment.shipmentNumber;
                        if (!updatShipment.shipmentNumber) console.log(`${this.totalReCalFail} ShipmentId: ${updatShipment.id}`, updatShipment, u);
                      }
                    }
                  )
                })
              } else {
                // gte list error
              }
            }
          );
        }
      }
    }
  }

  checkExistVersion() {
    if (!ArrayHelper.isNullOrZero(this.listShipmentVersionsByGetIds)) {
      this.listShipmentVersionsByGetIds.forEach(x => {
        this.datasource.forEach(y => {
          if (x.shipmentId === y.id) {
            y.isExistVersion = true; // show version trên từng dòng nếu có version
          }
        });
      });
    }
    return this.datasource;
  }

  loadProvinceLS() {
    this.fromProvincesLS = [];
    this.toProvincesLS = [];
    this.provinceService.getAllSelectModelAsync().then(x => {
      this.fromProvincesLS = x;
      this.toProvincesLS = x;
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

  loadUploadExcelHisstoryLS() {
    this.uploadExcelHistories = [];
    let cols: string = Constant.classes.includes.uploadExcelHistory.user;
    this.uploadExcelHistoryService.getHistorySelectItemAsync(this.shipmentFilterViewModel.OrderDateFrom, this.shipmentFilterViewModel.OrderDateTo, cols).then(x => {
      this.uploadExcelHistories = x;
    });
  }

  loadFilterLS() {
    if (this.countLoadLS < 2) {// chỉ load lần đầu tiên khi click vào tab 2
      this.loadProvinceLS();
      this.loadSenderLS();
      this.loadPaymentTypeLS();
      this.loadShipmentStatusLS();
      this.loadServiceLS();
    }
  }

  async changeShipmentNumber(element) {
    await this.loadShipmentPaging();
    if (this.txtShipmentNumber) {
      this.scanAndPrint(element);
    }
  }

  async changeReferencesCode(element) {
    await this.loadShipmentPaging();
    if (this.shipmentFilterViewModel.referencesCode) {
      this.scanAndPrint(element);
    }
  }

  async changeRequestShipmentNumber(element) {
    let x = await this.requestShipmentService.trackingShortAsync(this.txtRequestShipmentNumber, [])
    if (x) this.searchRequestShipmentId = x.id;
    else this.searchRequestShipmentId = null;
    await this.loadShipmentPaging();
    if (this.txtRequestShipmentNumber) {
      this.scanAndPrint(element);
    }
  }

  async scanAndPrint(element) {
    if (this.isScanAndPrint) {
      if (this.listData.length > 0) {
        this.selectedData = this.listData;
        await this.multiPrintShipment(false, true);
      }
    }
    element.select();
  }

  checkSearchByShipmentNumber(txtShipmentNumber, shipmentFilterViewModel): ShipmentFilterViewModel {
    if (!StringHelper.isNullOrEmpty(txtShipmentNumber)) {
      let newFilter = new ShipmentFilterViewModel();
      newFilter.Cols = this.includes;
      newFilter.Type = ShipmentTypeHelper.historyPickup;
      newFilter.PageNumber = this.pageNum;
      newFilter.PageSize = this.rowPerPage;
      newFilter.PageNumber = 1;
      newFilter.ShipmentNumber = txtShipmentNumber;
      return newFilter;
    }
    return shipmentFilterViewModel;
  }


  changeShipmentStatus() {
    this.shipmentFilterViewModel.ShipmentStatusId = this.selectedStatusLS;
    //this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeServices() {
    this.shipmentFilterViewModel.ServiceId = this.selectedServicesLS;
    //this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changePaymentType() {
    this.shipmentFilterViewModel.PaymentTypeId = this.selectedPaymentTypeLS;
    //this.loadShipmentPaging();
    // this.loadLazy(this.event);
  }

  changeFromWeight(input: number) {
    this.shipmentFilterViewModel.WeightFrom = input;
    //this.loadShipmentPaging();
    // setTimeout(() => {
    //   this.loadLazy(this.event);
    // }, 0);
    // this.fromWeight = input;
  }

  changeFromProvince() {
    this.shipmentFilterViewModel.FromProvinceId = this.fromSelectedProvinceLS;
    //this.loadShipmentPaging();
  }

  changeToProvince() {
    this.shipmentFilterViewModel.ToProvinceId = this.toSelectedProvinceLS;
    //this.loadShipmentPaging();
  }

  changeToWeight(input: number) {
    this.shipmentFilterViewModel.WeightTo = input;
    //this.loadShipmentPaging();
    // setTimeout(() => {
    //   this.loadLazy(this.event);
    // }, 0);
    this.toWeight = input;
  }

  async changeUploadExcelHistory() {
    this.shipmentFilterViewModel.uploadExcelHistoryId = this.selectedUploadExcelHistory;
    this.loadShipmentPaging();
  }

  //

  async printCodeA4() {
    this.cloneSelectCode = await this.sendSelectDataPrintMultiCode(this.selectedData);
    if (this.cloneSelectCode) {
      this.idPrint = PrintHelper.printCodeA4DetailShipment;
      setTimeout(() => {
        this.printFrormServiceInstance.sendCustomEvent(this.cloneSelectCode);
      }, 0);
    }
  }

  async printCodeSticker() {
    this.cloneSelectCode = await this.sendSelectDataPrintMultiCode(this.selectedData);
    if (this.cloneSelectCode) {
      this.idPrint = PrintHelper.printCreateMultiShipment;
      let dataPrint: DataPrint = new DataPrint();
      dataPrint.dataPrints = this.cloneSelectCode;
      await this.formPrintService.getFormPrintBarCodeAsync().then(
        x => {
          if (!this.isValidResponse(x)) return;
          let resultFormPrint = x.data as FromPrintViewModel;
          dataPrint.formPrint = resultFormPrint.formPrintBody;
          setTimeout(() => {
            this.printFrormServiceInstance.sendCustomEvent(dataPrint);
          }, 0);
        }
      );
    }
  }

  multiPrintCodeA4() {
    if (!this.isValidSelectData()) return;
    this.printCodeA4();
  }

  multiPrintCodeSticker() {
    if (!this.isValidSelectData()) return;
    this.printCodeSticker();
  }

  onDetectTitleTabOne() {
    if (this.isShowItemVersion || this.isViewVersion) {
      this.titleTabOne = "Xem ds version";
    }
    if (this.isEditLS) {
      this.titleTabOne = "Sửa vận đơn";
    }
  }

  allSelect(event) {
    if (event.checked) {
      if (this.filterRows) {
        this.selectedData = this.filterRows;
      } else {
        this.selectedData = this.datasource;
      }
    }
  }

  isValidSelectData(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedData || this.selectedData.length === 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn vận đơn"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  async printShipment(noPrintShipment, noPrintAdviceOfDelivery) {
    this.cloneSelectData = await this.getPrintShipmentDatas();
    this.cloneSelectData.noPrintShipment = noPrintShipment;
    this.cloneSelectData.noPrintAdviceOfDelivery = noPrintAdviceOfDelivery;

    if (environment.isInTong) {
      await Promise.all(this.cloneSelectData.map(async ele => {
        let priceDVGT = await this.serviceDVGTService.getPriceDVGTByShipmentIdAsync(ele.id);
        ele.priceDVGT = priceDVGT;
      }));
    }


    if (!this.cloneSelectData.noPrintAdviceOfDelivery && this.cloneSelectData.noPrintShipment) {
      this.cloneSelectData = this.cloneSelectData.filter(x => x.isAdviceOfDelivery);
      this.cloneSelectData.noPrintShipment = noPrintShipment;
      if (this.cloneSelectData.length === 0) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Vui lòng chọn vđ có DVGT BP!"
        });
        return;
      }
    }
    this.idPrint = PrintHelper.printCreateMultiShipment;
    let dataPrint: DataPrint = new DataPrint();
    dataPrint.dataPrints = this.cloneSelectData;
    await this.formPrintService.getFormPrintA5Async(this.printCustomerId).then(
      x => {
        if (!this.isValidResponse(x)) return;
        let resultFormPrint = x.data as FromPrintViewModel;
        dataPrint.formPrint = resultFormPrint.formPrintBody;
        setTimeout(() => {
          this.printFrormServiceInstance.sendCustomEvent(dataPrint);
        }, 0);
      }
    );
  }

  async getPrintShipmentDatas(): Promise<any> {
    var dataSelected: any;
    var dataBox: any;
    let printSelectedData = this.selectedData.map(x => Object.assign({}, x));
    const ids: number[] = [];
    printSelectedData.map(x => {
      ids.push(x.id);
      if (!this.printCustomerId && x.senderId) {
        this.printCustomerId = x.senderId;
      } else {
        if (this.printCustomerId && this.printCustomerId != x.senderId) this.printCustomerId = -1;
      }
    });
    dataSelected = await this.shipmentService.getShipmentToPrintAsync(ids);
    if (dataSelected) {
      dataBox = await this.shipmentService.getBoxesAsync(ids);
      if (dataBox) {
        if (!ArrayHelper.isNullOrZero(dataBox)) {
          dataSelected.forEach(shipment => {
            shipment.boxes = [];
            dataBox.forEach(box => {
              if (box.shipmentId === shipment.id) {
                shipment.boxes.push(box);
              }
            });
            if (!StringHelper.isNullOrEmpty(shipment.strServiceDVGTIds)) {
              shipment.serviceDVGTName = ServiceDVGTHelper.mapServiceDVGT(this.serviceDVGTs, shipment.strServiceDVGTIds);
            } else {
              shipment.serviceDVGTName = "";
            }
          });
        } else {
          dataSelected.forEach(shipment => {
            shipment.boxes = [];
          });
        }
        this.cloneSelectData = await this.sendSelectDataPrintMultiShipmentVSE(dataSelected, this.generalInfo);
        return this.cloneSelectData;
      }
    }
  }

  multiPrintShipment(noPrintShipment, noPrintAdviceOfDelivery) {
    if (!this.isValidSelectData()) return;
    this.printShipment(noPrintShipment, noPrintAdviceOfDelivery);
  }

  async multiPrintBox() {
    if (!this.isValidSelectData()) return;

    let ids = this.selectedData.map(x => x.id);
    let model: IdViewModel = new IdViewModel();
    model.ids = ids;
    model.cols = "";
    //let data = await this.boxService.getListByShipmentIdsAsync(model);

    let boxs = [];
    // data.map(x => {
    //   x.boxes.map(box => {
    //     boxs.push(box);
    //   });
    // });

    if (boxs.length > 0) {
      this.idPrint = PrintHelper.printCreateMultiBox;
      setTimeout(() => {
        this.printFrormServiceInstance.sendCustomEvent(boxs);
      }, 0);
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy kiện"
      });
    }
  }

  async multiPrintBill() {
    if (!this.isValidSelectData()) return;
    this.selectedData.map((x, i) => {
      x["fakeId"] = "id" + x.id;
    });
    this.idPrint = PrintHelper.printCreateMultiShipment;
    let dataPrint: DataPrint = new DataPrint();
    dataPrint.dataPrints = this.selectedData;
    await this.formPrintService.getFormPrintLabelAsync().then(
      x => {
        if (!this.isValidResponse(x)) return;
        let resultFormPrint = x.data as FromPrintViewModel;
        dataPrint.formPrint = resultFormPrint.formPrintBody;
        setTimeout(() => {
          this.printFrormServiceInstance.sendCustomEvent(dataPrint);
        }, 0);
      }
    );
  }

  // dateRangePicker
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

    this.selectedDateFrom = SearchDate.formatToISODate(moment(value.start).toDate());
    this.selectedDateTo = SearchDate.formatToISODate(moment(value.end).toDate());

    this.shipmentFilterViewModel.OrderDateFrom = this.selectedDateFrom;
    this.shipmentFilterViewModel.OrderDateTo = this.selectedDateTo;

    // this.loadLazy(this.event);
    const fromDate = this.requestGetPickupHistory.fromDate.toISOString();
    const toDate = this.requestGetPickupHistory.toDate.toISOString();
    // this.loadShipment(fromDate, toDate);
    //this.loadShipment();
  }

  selectedSingleDateFrom(value: any) {
    this.selectedData = [];
    this.selectedDateFrom = SearchDate.formatToISODate(moment(value.start).toDate());
    //this.loadShipment();
  }

  selectedSingleDateTo(value: any) {
    this.selectedData = [];
    this.selectedDateTo = SearchDate.formatToISODate(moment(value.end).toDate());
    //this.loadShipment();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  // view version shipment
  async onViewVersion(rowData: Shipment) {
    this.isViewVersion = true;
    this.isEditLS = false;
    this.isShowItemVersion = false;
    this.onDetectTitleTabOne();
    this.isActiveTabOne = true;
    const cols = "CreatedByUser";
    // this.shipmentVersions = await this.shipmentVersionService.getByShipmentIdAsync(rowData.id, cols);
    this.shipmentVersions = [];
    this.listShipmentVersionsByGetIds.forEach(x => {
      if (x.shipmentId === rowData.id) {
        this.shipmentVersions.push(x);
      }
    });
  }
  onChangeReview() {
    if (this.reviewChecked) {
      this.datasource = this.selectedData;
    }
    else {
      this.datasource = this.listData;
    }
  }

  onChangeShipmentInfoDelivery() {
    this.loadShipmentPaging();
  }

  onChangeShipmentImagePickup() {
    this.loadShipmentPaging();
  }

  openModel(data: Shipment) {
    this.imagePickupServiceInstance.sendCustomEvent(data);
  }

  colorRow(rowData) {
    if (rowData.shipmentStatusId === StatusHelper.deliveryComplete) {
      return '#1c84c6';
    }
    if (rowData.shipmentStatusId === StatusHelper.returnComplete) {
      return '#ED5565';
    }
  }

  createShipmentNoTotalPrice() {
    if (this.displayNoTotalPrice) {
      this.displayNoTotalPrice = false;
    }
    if (this.clickTxtButton === this.buttonSaveChange) {
      this.processSaveChange(); // tạo vận đơn
    }
    if (this.clickTxtButton === this.buttonSavePrintCode) {
      this.processSavePrintCode(); // tạo vận đơn và in code
    }
    if (this.clickTxtButton === this.buttonSavePrintChange) {
      this.processSavePrintChange(); // tạo vận đơn và in chi tiết
    }
  }

  onCancelLS(template: TemplateRef<any>, data: Shipment) {
    this.modalTitle = "Hủy vận đơn";
    this.bsModalRefCancel = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
    this.shipmetCancel = data;
  }

  confirmCancelShipment() {
    if (StringHelper.isNullOrEmpty(this.txtNoteCancel)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập lý do hủy vđ"
      });
      return;
    }
    this.cancelShipment();
  }

  async cancelShipment() {
    // let obj = new Object() as UpdateViewModelShipment;
    let obj = new Object() as UpdateViewModelShipment;
    // let obj = new BaseModel(this.shipmetCancel.id);
    obj.note = this.txtNoteCancel.trim();
    obj.id = this.shipmetCancel.id;

    const data = await this.shipmentService.cancelAsync(obj);
    // const data = await this.shipmentService.cancelAsync(obj);
    if (data) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Đã hủy vđ thành công"
      });
      this.datasource = this.datasource.filter(x => x.id !== obj.id);
      this.totalRecords--;
      this.shipmetCancel = new Shipment();
      this.txtNoteCancel = null;
      this.bsModalRefCancel.hide();
    }
  }

  onChangeTypeShipment() {
    this.refresh();
    this.reSetPrimeShipment();
    this.scanShipmentNumber = null;
    // this.resetData();
  }

  async scanAndCreateShipmentNumber(txtShipmentNumber: any) {
    this.inputShipmentNumber = null;
    const shipmentNumber = txtShipmentNumber.value.trim();
    if (!shipmentNumber || shipmentNumber == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng nhập mã vận đơn!",
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      txtShipmentNumber.value = null;
      return;
    }

    let includes = [];
    includes.push(Constant.classes.includes.shipment.sender);
    includes.push(Constant.classes.includes.shipment.service);
    includes.push(Constant.classes.includes.shipment.fromHub);
    includes.push(Constant.classes.includes.shipment.fromProvince);
    includes.push(Constant.classes.includes.shipment.fromDistrict);
    includes.push(Constant.classes.includes.shipment.fromWard);
    includes.push(Constant.classes.includes.shipment.paymentType);
    includes.push(Constant.classes.includes.shipment.structure);
    includes.push(Constant.classes.includes.shipment.toHub);
    includes.push(Constant.classes.includes.shipment.toWard);
    includes.push(Constant.classes.includes.shipment.toProvince);
    includes.push(Constant.classes.includes.shipment.toDistrict);
    includes.push(Constant.classes.includes.shipment.pickUser);
    includes.push(Constant.classes.includes.shipment.deliverUser);

    const shipment = await this.shipmentService.trackingShortAsync(shipmentNumber, includes);
    if (!shipment) {
      SoundHelper.getSoundMessage(Constant.messageStatus.error);
      this.isExistParentShipment = false;
      txtShipmentNumber.value = null;
      this.refresh();
    }

    // vận đơn hỗ trợ
    if (shipment) {
      this.messageService.add({
        severity: Constant.messageStatus.success, detail: "Quét vận đơn thành công!",
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.success);

      // vận đơn liên quan
      if (this.selectedShipmentType.value === ShipmentType.Related) {
        this.data.typeId = ShipmentType.Related;
        this.data.shipmentId = shipment.id;
        return;
      }
      if (shipment.shipmentStatusId !== StatusHelper.deliveryComplete) {
        // alert("Chỉ hỗ trợ đơn giao hàng thành công!");
        this.displayStatusDeliveryComplete = true;
        txtShipmentNumber.value = null;
        this.refresh();
        return;
      }
      const cloneShipment = Object.assign({}, shipment);
      this.data = shipment;
      if (shipment.sender) {
        if (shipment.sender.customerTypeId === CustomerHelper.KHACH_HOP_DONG) {
          this.cloneShipmentSP = cloneShipment;
          if (shipment.totalShipment > 0) {
            // alert("Đã hỗ trợ: " + shipment.totalShipment + " lần, bạn có muốn hỗ trợ tiếp không?");
            this.displayTotalShipment = true;
          } else {
            this.inputShipmentNumber = shipment.shipmentNumber + "SP";
          }
        } else {
          // alert("Chức năng hỗ trợ chỉ được áp dụng cho khách hợp đồng");
          this.displayCustomer = true;
          txtShipmentNumber.value = null;
          this.refresh();
          return;
        }
      }
      //
      this.data.shipmentId = shipment.id;
      //this.data.typeId = ShipmentType.Support;
      this.data.shipmentNumber = null;
      this.data.orderDate = this.currentTime;
      this.singlePickerOrderDate.startDate = new Date(this.currentTime);
      // reverse sender, receiver
      this.senderPhone = cloneShipment.receiverPhone;
      this.senderName = cloneShipment.receiverName;
      this.data.addressNoteFrom = cloneShipment.addressNoteTo;
      this.senderCompany = cloneShipment.companyTo;
      this.data.pickingAddress = cloneShipment.shippingAddress;
      this.searchFromControl.setValue(cloneShipment.shippingAddress);
      this.selectedFromProvince = cloneShipment.toProvinceId;
      this.selectedFromDistrict = cloneShipment.toDistrictId;
      this.selectedFromWard = cloneShipment.toWardId;
      this.selectedFromHub = cloneShipment.toHubId;
      this.data.fromHubRoutingId = cloneShipment.toHubRoutingId;
      this.data.latFrom = cloneShipment.latTo;
      this.data.lngFrom = cloneShipment.lngTo;
      this.receiverPhone = cloneShipment.senderPhone;
      this.receiverName = cloneShipment.senderName;
      this.data.addressNoteTo = cloneShipment.addressNoteFrom;
      this.receiverCompany = cloneShipment.companyFrom;
      this.data.shippingAddress = cloneShipment.pickingAddress;
      this.searchToControl.setValue(cloneShipment.pickingAddress);
      this.selectedToProvince = cloneShipment.fromProvinceId;
      this.selectedToDistrict = cloneShipment.fromDistrictId;
      this.selectedToWard = cloneShipment.fromWardId;
      this.toHub = cloneShipment.fromHub ? cloneShipment.fromHub.name : "";
      this.selectedToHub = cloneShipment.fromHubId;
      this.data.toHubId = cloneShipment.fromHubId;
      this.data.toHubRoutingId = cloneShipment.fromHubRoutingId;
      this.data.latTo = cloneShipment.latFrom;
      this.data.lngTo = cloneShipment.lngFrom;
      // reset some values
      this.data.weight = 0;
      this.data.totalBox = 0;
      this.chargeWeight = 0;
      this.data.calWeight = 0;
      this.data.cod = 0;
      this.data.insured = 0;
      // this.data.paymentTypeId = PaymentTypeHelper.NGTTS;
      this.data.serviceId = null;
      this.data.defaultPrice = 0;
      this.data.fuelPrice = 0;
      this.data.totalPrice = 0;
      this.data.vatPrice = 0;
      this.data.remoteAreasPrice = 0;
      this.data.totalDVGT = 0;
      this.data.otherPrice = 0;
    }
  }

  reSetPrimeShipment() { // refresh vận đơn gốc (trong trường hợp tạo vđ liên quan, vđ hỗ trợ)
    this.cloneShipmentSP = null;
  }

  isValidInsured(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (this.data.insured > this.cloneShipmentSP.cod) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Giá trị hỗ trợ trả về không được lớn hơn COD của vđ gốc (" + this.cloneShipmentSP.cod + " VNĐ)"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  refreshTypeShipment() {
    this.selectedShipmentType = this.shipmentTypes[0];
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.imagePickupServiceInstance.resetEventObserver();
  }

  // Nhân viên
  filterUsers(event) {
    let value = event.query;
    if (value.length >= 2) {
      this.userService.getSearchByValueAsync(value, null).then(
        x => {
          if (x) {
            this.users = [];
            this.filteredUsers = [];
            let data = (x as User[]);
            data.map(m => {
              this.users.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
              this.filteredUsers.push(`${m.code} ${m.name}`);
            });
          }
        }
      );
    }
  }

  onSelectedUser() {
    let cloneSelectedCustomer = this.user;
    let index = cloneSelectedCustomer.indexOf(" -");
    let users: any;
    if (index !== -1) {
      users = cloneSelectedCustomer.substring(0, index);
      cloneSelectedCustomer = users;
    }
    this.users.forEach(x => {
      let obj = x.data as User;
      if (obj) {
        if (cloneSelectedCustomer === x.label) {
          this.selectedUser = obj.id;
          this.shipmentFilterViewModel.currentEmpId = this.selectedUser;
          this.loadShipmentPaging();
        }
      }
    });
  }

  keyTabUser(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      this.userService.getSearchByValueAsync(value, null).then(
        x => {
          if (x) {
            this.users = [];
            this.filteredUsers = [];
            let data = (x as User[]);
            data.map(m => {
              this.users.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
              this.filteredUsers.push(`${m.code} ${m.name}`);
            });
            let findCus: SelectModel = null;
            if (this.users.length == 1) {
              findCus = this.users[0];
            } else {
              findCus = this.users.find(f => f.data.code == value || f.label == value);
            }
            if (findCus) {
              this.selectedUser = findCus.value;
              this.user = findCus.label;
              this.shipmentFilterViewModel.currentEmpId = this.selectedUser;
            }
            else {
              this.selectedUser = null
              this.shipmentFilterViewModel.currentEmpId = this.selectedUser;
            }
            this.loadShipmentPaging();
          } else {
            this.selectedUser = null;
            this.shipmentFilterViewModel.currentEmpId = this.selectedUser;
            this.loadShipmentPaging();
          }
        }
      );
    } else {
      this.selectedUser = null;
      this.shipmentFilterViewModel.currentEmpId = this.selectedUser;
      this.loadShipmentPaging();
    }
  }
  //

  async onEnterSearchGB(shipmentNumber) {
    this.bsModalRef = this.modalService.show(ShipmentDetailComponent, { class: 'inmodal animated bounceInRight modal-1000' });

    const data = await this.shipmentService.getByShipmentNumberAsync(shipmentNumber.trim());
    if (data) {
      const ladingSchedule = await this.shipmentService.getGetLadingScheduleAsync(data.id);
      if (ladingSchedule) {
        data.ladingSchedules = ladingSchedule;
      }
      this.bsModalRef.content.loadData(data, 1, true);
    }
  }
  
  onCancelLSMultiply(template: TemplateRef<any>) {
    this.modalTitle = "Hủy nhiều vận đơn";
    if (this.selectedData.length == 0) {
      return false;
    }
    this.bsModalRefCancel = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
    console.log(this.selectedData);
    
    this.countSuccessCancelShipment = 0;
    this.countErrorCancelShipment = 0;
    this.dataCancelError = [];
    this.value = 0;
    this.isConfirmCancels = false;
    this.isClickCancels = false;
    this.totalShipmentCancel = this.selectedData.length;
    // this.shipmetCancel = data;
  }

  async confirmCancelShipments() {
    if (StringHelper.isNullOrEmpty(this.txtNoteCancel)) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập lý do hủy vđ"
      });
      return;
    }
    this.isConfirmCancels = false;
    this.isClickCancels = true;
    this.cancelShipments();
  }
  
  async cancelShipments() {
    var countRun = 0;
    this.value = 0;
    let interval = setInterval(() => {
      if(this.value >= 100 || countRun == this.totalShipmentCancel) {
          this.loadShipmentPaging();
          this.isConfirmCancels = true;
          clearInterval(interval);
      }
    }, 0);

    await Promise.all(this.selectedData).then(promise => {
      promise.map(m => {
        setTimeout(() => {
          let obj = new Object() as UpdateViewModelShipment;
          obj.note = this.txtNoteCancel.trim();
          obj.id = m.id;
          this.shipmentService.cancel(obj).toPromise().then(data => {
            setTimeout(() => {
              if (data.isSuccess) {
                this.countSuccessCancelShipment++;
                this.datasource = this.datasource.filter(x => x.id !== obj.id);
                this.selectedData = this.selectedData.filter(x => x.id !== obj.id)
                this.totalRecords--;
                this.shipmetCancel = new Shipment();
                this.txtNoteCancel = null;
              } else {
                this.countErrorCancelShipment++;
                const obj = new Shipment();
                obj.shipmentNumber = m.shipmentNumber;
                this.dataCancelError.push(obj);
              }
              this.value = (((this.countErrorCancelShipment + this.countSuccessCancelShipment) * 100) / this.totalShipmentCancel).toFixed(1);
              countRun++;
              console.log('promise {0}', this.value);
            }, 1000);
          });
        }, 1000);
      });
    });
  }
  exportExcelCancels() {
    let fileName = "DANH_SACH_VAN_DON_HUY.xlsx";
    const cloumn = [
      { field: "shipmentNumber", header: 'Mã đơn hàng' },
    ]
    if (this.dataCancelError.length > 0) {
      if (this.totalRecords > this.maxRecordExport) {
        let data: any[] = [];
        Promise.all(this.dataCancelError).then(rs => {
          rs.map(x => {
            data = data.concat(x);
          })

          let dataE = data.reverse();
          var dataEX = ExportAnglar5CSV.ExportData(dataE, cloumn, false, false);
          ExportAnglar5CSV.exportExcelBB(dataEX, fileName);
        })
      }
    }
  }
}

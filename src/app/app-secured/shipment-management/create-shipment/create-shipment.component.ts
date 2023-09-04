import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  NgZone,
  OnDestroy
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
  BoxService,
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  User,
  Customer,
  District,
  Ward,
  Hub,
  DataPrint,
  PriceDVGT,
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
import { GMapHelper } from "../../../infrastructure/gmap.helper";
import { MapsAPILoader } from "@agm/core";
import { Boxes } from "../../../models/boxes.model";

//
import { PrintHelper } from "../../../infrastructure/printHelper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { SearchCusstomerHelper } from "../../../infrastructure/searchCustomer.helper";
import { CustomerInfoLog } from "../../../models/customerInfoLog.model";
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
import { SeriNumberViewModel } from "../../../view-model/SeriNumber.viewModel";
import { SignalRService } from "../../../services/signalR.service";
import { UploadExcelHistoryService } from "../../../services/uploadExcelHistory.service";
import { DaterangePickerHelper } from "../../../infrastructure/daterangePicker.helper";
import { ArrayHelper } from "../../../infrastructure/array.helper";
import { ServiceDVGTHelper } from "../../../infrastructure/serviceDVGTHelper";
import { HubConnection } from "@aspnet/signalr";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { CurrencyFormatPipe } from "../../../pipes/currencyFormat.pipe";
import * as $ from 'jquery';

@Component({
  selector: "app-create-shipment",
  templateUrl: "create-shipment.component.html",
  styles: [
    `
    agm-map {
      height: 200px;
    }
  `  ]
})
export class CreateShipmentComponent extends InformationComponent implements OnInit, OnDestroy {
  pickUsers: SelectModel[] = [];
  pickUserFilters: string[] = [];
  pickUserSelected: string;
  //
  usingPriceService: string = "";
  usingPriceServicePlus: string = "";
  stringInfoFrom: string = "Thông tin nhận hàng";
  stringInfoTo: string = "Thông tin giao hàng";
  priceDVGT?: PriceDVGT = new PriceDVGT();
  customerReceiver: Customer;
  printCustomerId: any = 0;
  formPrintA5: string = '';
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
  cloneShipment: Shipment;
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
  isViewToLocation: boolean = true;
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
  filteredEmployees: any[] = [];
  filteredToProvinces: any[] = [];
  filteredToDistricts: any[] = [];
  filteredToWards: any[] = [];
  filteredToHubs: any[] = [];
  filteredToCenterHubs: any[] = [];
  filteredToPoHubs: any[] = [];
  filteredToStationHubs: any[] = [];
  filteredPickupUsers: any[] = [];
  filteredFromHubs: any[] = [];
  filteredFromPoHubs: any[] = [];
  filteredFromCenterHubs: any[] = [];
  filteredFromWards: any[] = [];
  filteredFromDistricts: any[] = [];
  filteredFromProvinces: any[] = [];
  filteredCustomers: any[] = [];
  filteredServiceDVGT: any[] = [];

  selectedServiceDVGT: any;

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
  fromInfoHub: Hub;
  toInfoHub: Hub;
  //
  paymentCODType: any = `---`;
  filteredPaymentCODTypes: string[] = [];

  //Vận đơn nhiều kiên
  shipmentBoxs: Shipment[] = [];
  boxs: Boxes = new Boxes();
  shipmentBox: Shipment = new Shipment();
  quantilyBox: number = 1;
  //
  totalCollect: number = 0;
  isUpdateShipmentWhite: boolean = false;
  //
  isPickupInHub: boolean = false;

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
    protected boxService: BoxService,
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
  currentPage: string = Constant.pages.shipment.children.createShipment.name;
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
  allHubs: SelectModel[] = [];
  receiverHubFilters: any[] = [];
  receiverHubSelected: any;

  public latitudeFrom: number;
  public longitudeFrom: number;
  public latitudeTo: number;
  public longitudeTo: number;
  public searchFromControl: FormControl;
  public searchToControl: FormControl;
  public zoom: number;
  @ViewChild("shipmentNumberTxt") shipmentNumberTxtRef: ElementRef;
  @ViewChild("txtTotalBox") txtTotalBoxRef: ElementRef;
  @ViewChild("atcPickupUserCode") atcPickupUserCodeRef: AutoComplete;
  @ViewChild("atcSenderCode") atcSenderCodeRef: AutoComplete;
  @ViewChild("atcPaymentType") atcPaymentTypeRef: AutoComplete;
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
  servicesLS: SelectItem[];
  selectedServicesLS: number;
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
    { field: "requestShipment", header: 'Mã bill tổng', child: "true", childName: "shipmentNumber" },
    { field: "cusNote", header: 'Yêu cầu phục vụ' },
    { field: "orderDate", header: 'Ngày gửi', typeFormat: "date", formatString: 'YYYY/MM/DD HH:mm' },
    { field: "paymentType", header: 'HTTT', child: "true" },
    { field: "service", header: 'Dịch vụ', child: "true" },

    { field: "shipmentServiceDVGTs", header: 'Dịch vụ gia tăng' },
    { field: "weight", header: "TL " + this.unit },
    { field: "calWeight", header: "TL QĐ " + this.unit },
    { field: "totalBox", header: "Số kiện" },
    { field: "defaultPrice", header: 'Cước chính' },
    { field: "fuelPrice", header: 'PPXD' },
    { field: "remoteAreasPrice", header: 'VSVX' },
    { field: "totalDVGT", header: 'Phí DVGT' },
    { field: "vatPrice", header: 'VAT' },
    { field: "totalPrice", header: 'Tổng cước' },

    { field: "shipmentStatus", header: 'Trạng thái', child: "true" },
    { field: "currentHub", header: 'Trạm đang giữ', child: "true" },
    //{ field: "deliverUser.fullName", header: 'Nhân viên gửi' },
    { field: "senderName", header: 'Tên người gửi' },
    { field: "senderPhone", header: 'Đt gửi' },
    { field: "companyFrom", header: 'CTY gửi' },
    { field: "pickingAddress", header: 'Địa chỉ gửi' },
    { field: "fromProvince", header: 'Tỉnh đi' },
    { field: "fromHub", header: 'Trạm lấy', child: "true" },
    { field: "fromHubRouting", header: 'Tuyến lấy', child: "true" },
    { field: "receiverName", header: 'Tên người nhận' },
    { field: "receiverPhone", header: 'Đt nhận' },
    { field: "companyTo", header: 'CTY nhận' },
    { field: "addressNoteTo", header: 'Địa chỉ nhận chi tiết' },
    { field: "shippingAddress", header: 'Địa chỉ nhận' },
    { field: "toProvince", header: 'Tỉnh đến', child: "true" },
    { field: "toHub", header: 'Trạm giao', child: "true" },
    { field: "toHubRouting", header: 'Tuyến giao', child: "true" },
  ];
  paymentCODTypes: SelectModel[] = [];
  selectedData: Shipment[];
  listData: Shipment[];
  datasource: Shipment[];
  totalRecords: number = 0;
  maxRecordExport = 200;
  rowPerPage: number = 20;
  event: LazyLoadEvent;
  toHubName: string;
  toHubRoutingName: string;
  toHubRoutingUser: string;

  ngOnInit() {
    //
    if (this.companyName === "PCS Post") {
      this.stringInfoFrom = "Thông tin người gửi";
      this.stringInfoTo = "Thông tin người nhận";
    }


    this.subscription = this.commandService.commands.subscribe(c => this.handleCommand(c));
    this.initMap();
    this.initData();
    //this.loadCustomer();
    this.loadCustomerInfoLog();
    this.loadProvince();
    this.loadCenterHub();
    this.loadServiceDVGT();
    this.loadShipmentType();
    this.hubConnect();
    this.onViewToLocation();
    // this.loadPickupUser();
  }
  async hubConnect() {
    this.hubConnection = await this.signalRService.Connect();
    this.hubConnection.on("WeighingScaleChange", res => {
      let seriNumberViewModel = res.data as SeriNumberViewModel;
      this.authService.getAccountInfoAsync().then(x => {
        let user = x;
        if (seriNumberViewModel.seriNumber == user.seriNumber) {
          if (this.isBox == true) {
            this.selectedWeight = seriNumberViewModel.weight;
          } else {
            this.data.weight = seriNumberViewModel.weight;
            this.changeWeight();
          }
        }
      });
    });
  }

  changePickupInHub() {
    this.changeCustomer();
  }

  async loadShipmentType() {
    const data = await this.shipmentService.getAllShipmentTypeSelectItemAsync();
    if (data) {
      this.shipmentTypes = data;
      this.selectedShipmentType = this.shipmentTypes[0];
    }
  }

  keyUpBusinessUser(event) {
    let value = event.currentTarget.value;
    if (value && value.length > 2) {
      this.userService.getByCodeAsync(value).then(x => {
        if (!this.isValidResponse(x)) {
          this.busenissUserRef.nativeElement.focus();
          this.busenissUserRef.nativeElement.select();
          this.data.businessUserId = null;
          return;
        } else {
          let users = x.data as User[];
          if (users.length > 0) {
            let user = users[0];
            this.busenissUserRef.nativeElement.value = user.code;
            this.data.businessUserId = user.id;
          } else {
            this.busenissUserRef.nativeElement.focus();
            this.busenissUserRef.nativeElement.select();
            this.data.businessUserId = null;
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy NVKD!!!' });
          }
        }
      });
    } else {
      this.data.businessUserId = null;
    }
  }

  keyUpPickupUser(event) {
    let value = event.currentTarget.value;
    if (value && value.length > 2) {
      this.userService.getByCodeAsync(value).then(x => {
        if (!this.isValidResponse(x)) {
          this.pickupUserRef.nativeElement.focus();
          this.pickupUserRef.nativeElement.select();
          this.data.pickUserId = null;
          return;
        } else {
          let users = x.data as User[];
          if (users.length > 0) {
            let user = users[0];
            this.pickupUserRef.nativeElement.value = user.code;
            this.data.pickUserId = user.id;
          } else {
            this.pickupUserRef.nativeElement.focus();
            this.pickupUserRef.nativeElement.select();
            this.data.pickUserId = null;
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy NVNH!!!' });
          }
        }
      });
    } else {
      this.data.pickUserId = null;
    }
  }

  keyTabSender(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      if (!this.selectedCustomer || (this.selectedCustomer && this.selectedCustomer.code != value)) {
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
                this.selectedCustomer = findCus.data;
                this.customer = findCus.label;
              }
              this.changeCustomer();
            } else {
              this.changeCustomer();
            }
          }
        );
      }
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã khách gửi.` });
      this.atcSenderCodeRef.domHandler.findSingle(this.atcSenderCodeRef.el.nativeElement, 'input').focus();
      this.atcSenderCodeRef.domHandler.findSingle(this.atcSenderCodeRef.el.nativeElement, 'input').select();
    }
  }

  initData() {
    this.resetData();
    this.optionSingleDateFrom = DaterangePickerHelper.getOptionSingleDatePickerNoTime(this.optionSingleDateFrom);
    this.optionSingleDateTo = DaterangePickerHelper.getOptionSingleDatePickerNoTime(this.optionSingleDateTo);
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
    this.loadPaymentType();
    this.loadListService();
    this.loadStructure();
    this.loadPaymentCODType();
    this.loadGeneralInfo();
    // tab two
    this.isExistInfoDelivery = false;
    this.isExistImagePickup = false;
    this.updateImagePath = null;
    this.first = 0;
  }

  async eventFilterHubs(event) {
    let value = event.query;
    if (value.length >= 1) {
      await this.hubService.getHubSearchByValueAsync(value, null).then(
        x => {
          this.allHubs = [];
          this.receiverHubFilters = [];
          x.map(m => this.allHubs.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.allHubs.map(m => this.receiverHubFilters.push(m.label));
        }
      );
    }
  }

  eventKeyTabHub(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let findHub = this.allHubs.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (findHub) {
        this.receiverHubSelected = findHub.label;
        if (!this.receiverHubFilters.find(f => f == this.receiverHubSelected)) this.receiverHubFilters.push(this.receiverHubSelected);
        if (findHub) {
          let colsHub: string[] = ["Province", "District", "Ward"];
          this.hubService.get(findHub.value, colsHub).toPromise().then(
            res => {
              if (res.isSuccess) {
                let toHub = res.data as Hub;
                this.data.addressNoteTo = 'Phát tại: ' + toHub.name;
                this.data.shippingAddress = toHub.address;
                this.data.toProvinceId = toHub.provinceId;
                this.selectedToProvince = toHub.provinceId;
                this.data.toDistrictId = toHub.districtId;
                this.selectedToDistrict = toHub.districtId;
                this.data.toWardId = toHub.wardId;
                this.selectedToWard = toHub.wardId;
                //
                if (toHub.province) this.toProvince = `${toHub.province.code} - ${toHub.province.name}`;
                this.loadToDistrict(this.selectedToDistrict);
                this.loadToWard(this.selectedToDistrict, this.selectedToWard);
                this.calculatePrice(false);
                setTimeout(() => {
                  var atcServiceDVGT = $("#atcShippingAddress");
                  atcServiceDVGT.focus();
                  atcServiceDVGT.select();
                }, 0);
                this.bsModalRef.hide();
              } else {
                this.setFocusATCToHub();
                this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Thông tin bưu cục phát lỗi.` });
              }
            });
        } else {
          this.setFocusATCToHub();
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy thông tin bưu cục phát.` });
        }
      } else {
        this.setFocusATCToHub();
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy bưu cục phát!' });
      }
    } else if (!this.receiverHubSelected) {
      this.setFocusATCToHub();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn bưu cục phát!' });
    }
  }

  eventOnSelectedHub() {
    let findH = this.allHubs.find(f => f.label == this.receiverHubSelected)
    if (findH) {
      let colsHub: string[] = ["Province", "District", "Ward"];
      this.hubService.get(findH.value, colsHub).toPromise().then(
        res => {
          if (res.isSuccess) {
            let toHub = res.data as Hub;
            this.data.addressNoteTo = 'Phát tại: ' + toHub.name;
            this.data.shippingAddress = toHub.address;
            this.data.toProvinceId = toHub.provinceId;
            this.selectedToProvince = toHub.provinceId;
            this.data.toDistrictId = toHub.districtId;
            this.selectedToDistrict = toHub.districtId;
            this.data.toWardId = toHub.wardId;
            this.selectedToWard = toHub.wardId;
            //
            if (toHub.province) this.toProvince = `${toHub.province.code} - ${toHub.province.name}`;
            this.loadToDistrict(this.selectedToDistrict);
            this.loadToWard(this.selectedToDistrict, this.selectedToWard);
            this.calculatePrice(false);
            setTimeout(() => {
              var atcServiceDVGT = $("#atcShippingAddress");
              atcServiceDVGT.focus();
              atcServiceDVGT.select();
            }, 0);
            this.bsModalRef.hide();
          } else {
            this.setFocusATCToHub();
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Thông tin bưu cục phát lỗi.` });
          }
        });
    } else {
      this.setFocusATCToHub();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy thông tin bưu cục phát.` });
    }
  }

  setFocusShippingAddress() {
    setTimeout(() => {
      var atcServiceDVGT = $("#atcShippingAddress");
      atcServiceDVGT.focus();
      atcServiceDVGT.select();
    }, 0);
  }

  setFocusATCToHub() {
    setTimeout(() => {
      var atcServiceDVGT = $("#atcToHub input");
      atcServiceDVGT.focus();
      atcServiceDVGT.select();
    }, 0);
  }

  handleCommand(command: Command) {
    switch (command.name) {
      case 'CreateShipmentComponent.Ctrl+S':
        if (!this.checkSubmit) {
          this.clickSaveChange();
        }
        break;
      case 'CreateShipmentComponent.Ctrl+B':
        this.openModelBox(this.templateBox);
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

  async viewInfoDelivery() {
    this.toHubName = "";
    this.toHubRoutingName = "";
    this.toHubRoutingUser = "";
    if (this.data) {
      let res = await this.hubService.getInfoHubRoutingAsync(this.data.isTruckDelivery, this.data.toDistrictId, this.data.toWardId, this.data.weight)
      if (res) {
        this.toHubName = res.hubName;
        this.toHubRoutingName = res.hubRoutingName;
        this.toHubRoutingUser = res.hubRoutingUser;
      }
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
    this.data.orderDate = new Date();
    //this.inputShipmentNumber = null;
    this.scanShipmentNumber = null;
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
    this.cloneShipment = null;
    this.isPaidPrice = false;
    this.isAgreementPrice = false;
    this.displayNoTotalPrice = false;
    this.isShowCheckBoxChangeShippingAddress = false;
    this.isSelectChangeShippingAddress = false;
    this.pickupUserCode = null;
    this.busenissUserCode = null;
    this.customerReceipt = null;
    this.selectedFromHub = null;
    this.selectedFromWard = null;
    this.selectedFromDistrict = null;
    this.selectedFromProvince = null;
    this.selectedToHub = null;
    this.selectedToWard = null;
    this.selectedToDistrict = null;
    this.selectedToProvince = null;
  }

  resetInputDataNotSender() {
    this.cloneShipment = Object.assign({}, this.data);
    this.data = new Shipment();
    this.data.pickingAddress = this.cloneShipment.pickingAddress;
    this.data.addressNoteFrom = this.cloneShipment.addressNoteFrom;
    this.data.disCount = 0;
    // this.data.orderDate = null;
    this.data.paymentCODTypeId = null;
    // this.selectedShipmentType = this.shipmentTypes[0];
    this.data.typeId = this.selectedShipmentType.value;
    this.customerReceipt = null;
    // this.inputShipmentNumber = null;
    this.scanShipmentNumber = null;
    this.selectedEmployee = null;
    this.employees = null;
    this.employee = null;
    // this.selectedService = null;
    // this.service = null;
    // this.selectedStructure = null;
    // this.structure = null;
    // this.selectedPaymentType = null;
    // this.paymentType = null;
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
    this.cloneShipment = null;
    //
    this.data.orderDate = this.currentTime;
    this.singlePickerOrderDate.startDate = new Date(
      this.currentTime
    );
  }
  resetFlag() {
    this.isEditLS = null;
    this.isViewVersion = null;
    this.isShowItemVersion = null;
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
    if (!this.data.disCount) this.data.disCount = 0;
    this.data.defaultPrice = 0;
    this.data.fuelPrice = 0;
    this.data.otherPrice = 0;
    this.data.remoteAreasPrice = 0;
    this.data.totalDVGT = 0;
    this.data.totalPriceSYS = 0;
    this.data.vatPrice = 0;
  }

  eventFilterPickUsers(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.loadFilterSearchPickUser(value);
    }
  }

  eventOnSelectedPickUser() {
    let findU = this.pickUsers.find(f => f.label == this.pickUserSelected);
    if (findU) {
      this.data.pickUserId = findU.value as number;
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy nhân viên.` });
    }
  }

  keyTabPickuser(event) {
    let value = event.target.value;
    let findU = this.pickUsers.find(f => f.label == value);
    if (findU) {
      this.data.pickUserId = findU.value as number;
      this.pickUserSelected = findU.label;
    } else {
      // if (value && value.length > 0) {
      this.userService.getSearchByValueAsync(value, null).then(
        x => {
          if (x && x.length && x.length > 0) {
            this.pickUsers = [];
            this.pickUserFilters = [];
            let findUser = x[0];
            this.data.pickUserId = findUser.id;
            this.pickUserSelected = `${findUser.code} ${findUser.name}`;
            this.pickUsers.push({ value: findUser.id, label: `${findUser.code} ${findUser.name}`, data: findUser });
            this.pickUsers.map(m => this.pickUserFilters.push(m.label));
          } else {
            this.data.pickUserId = null;
            this.messageService.clear();
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên lấy hàng.` });
            this.atcSenderCodeRef.domHandler.findSingle(this.atcPickupUserCodeRef.el.nativeElement, 'input').focus();
            this.atcSenderCodeRef.domHandler.findSingle(this.atcPickupUserCodeRef.el.nativeElement, 'input').select();
          }
        }
      );
      // }
    }
  }

  // nv lấy hàng
  async loadFilterSearchPickUser(value: string) {
    await this.userService.getSearchByValueAsync(value, null).then(
      async x => {
        this.pickUsers = [];
        this.pickUserFilters = [];
        x.map(m =>
          this.pickUsers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
        this.pickUsers.map(m => this.pickUserFilters.push(m.label));
      }
    );
  }

  // so sánh trọng lượng nhập vào với 3 loại trọng lượng của Box để lấy ra trọng lượng tính cước của vận đơn
  loadChargeWeight() {
    if (!this.totalChargeWeightBoxes) {
      if (!this.data.calWeight) {
        this.chargeWeight = this.data.weight;
      } else {
        this.chargeWeight =
          this.data.weight >= this.data.calWeight
            ? this.data.weight
            : this.data.calWeight;
      }
    } else {
      this.chargeWeight =
        this.data.weight >= this.totalChargeWeightBoxes
          ? this.data.weight
          : this.totalChargeWeightBoxes;
    }
  }

  async loadPaymentType() {
    this.paymentTypes = [];
    this.selectedPaymentType = null;

    this.paymentTypes = await this.paymentTypeService.getAllSelectModelAsync();
    if (this.paymentTypes) {
      if (this.cloneRowDataShipment) {
        this.selectedPaymentType = this.cloneRowDataShipment.paymentTypeId;
        const findPaymentType = this.paymentTypes.find(x => x.value == this.cloneRowDataShipment.paymentTypeId);
        if (findPaymentType) {
          this.paymentType = findPaymentType.label;
        }
      } else {
        this.paymentType = this.paymentTypes[1].label;
        this.selectedPaymentType = this.paymentTypes[1].value;
      }
    }
  }

  async loadCusDepartment(customerId?: any) {
    this.cusDepartments = [];
    this.selectedDepartment = null;
    this.cusDepartment = null;
    const data = await this.cusDepartmentService.getSelectModelByCustomerIdAsync(customerId);
    if (data) {
      this.cusDepartments = data;
      if (this.cloneRowDataShipment) {
        if (this.cloneRowDataShipment.cusDepartmentId) {
          const cusDepartment = this.cusDepartments.find(x => x.value == this.cloneRowDataShipment.cusDepartmentId);
          if (cusDepartment) {
            this.cusDepartment = cusDepartment.label;
            this.selectedDepartment = cusDepartment.value;
          }
        }
      }
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
    if (model) {
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
    }
  }

  async loadServiceDVGT() {
    this.serviceDVGTs = [];
    this.serviceDVGTs = await this.serviceService.GetListServiceSubAsync();
    this.serviceDVGTModels = [];
    this.serviceDVGTs.forEach(m => { this.serviceDVGTModels.push({ value: m.id, label: `${m.code} - ${m.name}`, data: m }) });
  }


  async loadServiceDVGTLS(id: number = null) {
    this.serviceDVGTsLS = [];
    let data = await this.serviceDVGTService.getPriceDVGTByShipmentIdAsync(id);
    if (data) {
      this.serviceDVGTsLS = data.map(x => x.serviceId);
      this.data.priceDVGTs = data.map(x => {
        let priceDVGT: PriceDVGT = new PriceDVGT();
        if (x.service) {
          priceDVGT.code = x.service.code;
          priceDVGT.name = x.service.name;
        }
        priceDVGT.isAgree = x.isAgree;
        priceDVGT.serviceId = x.serviceId;
        priceDVGT.totalPrice = x.price;
        priceDVGT.vSEOracleCode = x.service.vseOracleCode;
        return priceDVGT;
      });
      this.data.strServiceDVGTName = '';
      this.data.priceDVGTs.map((m, index) => {
        if ((index + 1) >= this.data.priceDVGTs.length) this.data.strServiceDVGTName += m.code;
        else this.data.strServiceDVGTName += m.code + ',';
      });
    }
    if (this.serviceDVGTsLS) {
      if (this.cloneRowDataShipment) {
        if (this.cloneRowDataShipment.strServiceDVGTIds && this.cloneRowDataShipment.strServiceDVGTIds !== "") {
          this.selectedServiceDVGTs = this.cloneRowDataShipment.strServiceDVGTIds.split(",").map(x => +x);
          this.cloneRowDataShipment.serviceDVGTIds = this.selectedServiceDVGTs;
          this.isEditPriceDVGT = true;
        } else {
          this.selectedServiceDVGTs = [];
          this.isEditPriceDVGT = false;
        }
      }
    }
  }


  async loadPaymentCODType() {
    this.paymentCODTypes = await this.paymentCODTypeService.getAllSelectModelAsync();
    this.paymentCODTypes.map(m => this.filteredPaymentCODTypes.push(m.label));
  }

  async loadStructure(): Promise<void> {
    this.structures = [];
    this.structures = await this.structureService.getSelectModelStructuresAsync();
    if (this.cloneRowDataShipment) {
      this.selectedStructure = this.cloneRowDataShipment.structureId;
      if (this.structures) {
        let structure = this.structures.find(x => x.value == this.selectedStructure);
        if (structure) {
          this.structure = structure.label;
        }
      }
    } else {
      if (this.structures) {
        let codeStructure: string = "";
        if (environment.namePrint.toLowerCase() != 'tasetco') {
          codeStructure = "hh";
        } else {
          codeStructure = "khac";
        }
        let find = this.structures.find(x => x.label.split(" - ")[0] == codeStructure);
        if (find) {
          this.selectedStructure = find.value;
          this.structure = find.label;
        } else {
          this.selectedStructure = this.structures[1].value;
          this.structure = this.structures[1].label;
        }
      }
    }
  }

  async loadGeneralInfo(): Promise<GeneralInfoModel> {
    this.generalInfo = await this.generalInfoService.getAsync();
    this.data.weight = this.generalInfo.defaultWeight;
    this.data.totalItem = 1;
    this.loadChargeWeight();
    return this.generalInfo;
  }

  async loadEmployee() {
    this.employees = [];
    this.selectedEmployee = null;
    if (!this.selectedToCenterHub) return;
    this.employees = await this.userService.getSelectModelEmpByHubIdAsync(this.selectedToCenterHub);
    if (this.cloneRowDataShipment) {
      this.selectedEmployee = this.cloneRowDataShipment.deliverUserId;
      if (this.employees) {
        this.employees.forEach(x => {
          if (x.value === this.cloneRowDataShipment.deliverUserId) {
            this.employee = x.label;
          }
        });
      }
    }
  }

  async loadPickupUser() {
    if (this.cloneRowDataShipment) {
      let res = await this.userService.get(this.cloneRowDataShipment.pickUserId).toPromise();
      if (res.isSuccess == false) {
        this.pickupUserCode = null;
        this.data.pickUserId = null;
        return;
      } else {
        let pickupUser = res.data as User;
        if (pickupUser) {
          this.pickupUserCode = pickupUser.code;
          this.data.pickUserId = pickupUser.id;
        } else {
          this.pickupUserCode = null;
          this.data.pickUserId = null;
        }
      }
    } else {
      // khi vừa tạo vận đơn, mặc định nv láy hàng là nv đang tạo vận đơn
      let currentUserId = this.authService.getUserId();
      let currentUserCode = this.authService.getUserName();
      this.data.pickUserId = currentUserId;
      this.pickupUserCode = currentUserCode;
      if (this.currentUser) {
        this.pickUsers = [];
        this.pickUserSelected = `${this.currentUser.code} ${this.currentUser.fullName}`;
        this.pickUsers.push({ value: this.currentUser.id, label: `${this.currentUser.code} ${this.currentUser.fullName}`, data: this.currentUser });
      }
    }
  }

  // async loadCustomer() {
  //   this.customers = [];
  //   this.selectedCustomer = null;
  //   this.selectedCustomerReceipt = null;
  //   let includes = [
  //     Constant.classes.includes.customer.province,
  //     Constant.classes.includes.customer.district,
  //     Constant.classes.includes.customer.ward
  //   ];
  //   this.customers = await this.customerService.getAllSelectModel2Async(includes);
  // }

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

    this.loadPickupUser();
  }

  async loadCustomerInfoLog() {
    this.customerInfoLogs = [];
    this.customerInfoLogs = await this.customerInfoLogService.getAllAsync();
  }
  //search sender

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

  filterServiceDVGT(event) {
    this.filteredServiceDVGT = [];
    let value = event.query.toUpperCase();
    this.serviceDVGTModels.map(
      m => {
        if (value == '%') {
          this.filteredServiceDVGT.push(m.label);
        } else {
          if (m.label.toUpperCase().indexOf(value) >= 0) {
            this.filteredServiceDVGT.push(m.label);
          }
        }
      }
    );
  }

  async loadPriceListtByHubAndCustomer(customerId: number, hubId?: number) {
  }

  async onSelectedCustomer() {
    let cloneSelectedCustomer = this.customer;
    let index = cloneSelectedCustomer.indexOf(" -");
    let customers: any;
    if (index !== -1) {
      customers = cloneSelectedCustomer.substring(0, index);
      cloneSelectedCustomer = customers;
    }
    let findCus = this.customers.find(f => f.label == cloneSelectedCustomer);
    if (findCus) {
      this.selectedCustomer = findCus.data;
      await this.changeCustomer();
    }
  }

  keyDownEscapePaymentType(event) {
    if (this.selectedPaymentType == 4) {
      this.modalTitle = "Mã người nhận thanh toán cuối tháng";
      this.bsModalRef = this.modalService.show(this.templateInsured, {
        class: "inmodal animated bounceInRight modal-s"
      });
      setTimeout(() => {
        var element = document.getElementById("txtReceiverCode") as HTMLInputElement;
        element.focus();
        element.select();
      }, 0);
    }
  }

  keyTabCustomerReceipt(event) {
    this.messageService.clear();
    let value = event.target.value;
    if (value && value.length > 0) {
      this.customerService.getByCodeAsync(value).then(x => {
        if (x) {
          this.selectedCustomerReceipt = x;
          this.customerReceipt = x.code;
          this.data.receiverId = x.id;
          this.atcPaymentTypeRef.domHandler.findSingle(this.atcPaymentTypeRef.el.nativeElement, 'input').focus();
          this.atcPaymentTypeRef.domHandler.findSingle(this.atcPaymentTypeRef.el.nativeElement, 'input').select();
          this.bsModalRef.hide();
        } else {
          setTimeout(() => {
            var element = document.getElementById("txtReceiverCode") as HTMLInputElement;
            element.focus();
            element.select();
          }, 0);
          this.selectedCustomerReceipt = null;
          this.data.receiverId = null;
        }
      })
    } else {
      if (this.data.paymentTypeId == PaymentTypeHelper.NNTTS) {
        setTimeout(() => {
          var element = document.getElementById("txtReceiverCode") as HTMLInputElement;
          element.focus();
          element.select();
        }, 0);
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã khách hàng thanh toán` });
      } else {
        this.bsModalRef.hide();
        this.txtAreaContentRef.nativeElement.focus();
        this.txtAreaContentRef.nativeElement.select();
      }
    }
  }

  onSelectedCustomerReceipt() {
    let customer = this.customers.find(f => f.label.toLowerCase() == this.customerReceipt.toLowerCase());
    if (customer) {
      this.selectedCustomerReceipt = customer.data;
    }
  }

  async filterSenderPhones(event) {
    let includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward
    ];

    let query = event.query;
    let type = SearchCusstomerHelper.PHONE_NUMBER;
    let customer = await this.customerService.searchAsync(query, type, includes);
    if (customer) {
      this.filteredSenderPhones = this.filterSender(query, customer, type);
    }
  }

  selectedSenderPhone() {
    this.customers.forEach(x => {
      let obj = x.data as Customer;
      if (obj) {
        if (this.senderPhone === obj.phoneNumber) {
          this.selectedCustomer = obj;
          (this.customer = `${obj.code} - ${obj.name}- ${obj.phoneNumber}`),
            this.changeCustomer();
        }
      }
    });
  }

  async filterSenderNames(event) {
    let includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward
    ];

    let query = event.query;
    let type = SearchCusstomerHelper.NAME;
    let customer = await this.customerService.searchAsync(query, type, includes);
    if (customer) {
      this.filteredSenderNames = this.filterSender(query, customer, type);
    }
  }

  selectedSenderName() {
    this.customers.forEach(x => {
      let obj = x.data as Customer;
      if (obj) {
        if (this.senderName === obj.name) {
          this.selectedCustomer = obj;
          (this.customer = `${obj.code} - ${obj.name}- ${obj.phoneNumber}`),
            this.changeCustomer();
        }
      }
    });
  }

  async filterSenderCompanies(event) {
    let includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward
    ];

    let query = event.query;
    let type = SearchCusstomerHelper.COMPANY_NAME;
    let customer = await this.customerService.searchAsync(query, type, includes);
    if (customer) {
      this.filteredSenderCompanies = this.filterSender(query, customer, type);
    }
  }

  selectedSenderCompany() {
    this.customers.forEach(x => {
      let obj = x.data as Customer;
      if (obj) {
        if (this.senderCompany === obj.companyName) {
          this.selectedCustomer = obj;
          (this.customer = `${obj.code} - ${obj.name}- ${obj.phoneNumber}`),
            this.changeCustomer();
        }
      }
    });
  }

  filterSender(query, customers, type) {
    let filtered: any[] = [];
    for (let i = 0; i < customers.length; i++) {
      if (type === SearchCusstomerHelper.PHONE_NUMBER) {
        let senderPhone = customers[i].phoneNumber;
        if (senderPhone.indexOf(query) >= 0) {
          filtered.push(senderPhone);
        }
      }
      if (type === SearchCusstomerHelper.NAME) {
        let senderName = customers[i].name as string;
        if (senderName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(senderName);
        }
      }
      if (type === SearchCusstomerHelper.COMPANY_NAME) {
        if (customers[i].companyName) {
          let senderCompany = customers[i].companyName as string;
          if (senderCompany.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            filtered.push(senderCompany);
          }
        }
      }
    }
    return filtered;
  }

  // filter CusDepartments
  filterCusDepartments(event) {
    this.filteredCusDepartments = [];
    if (this.cusDepartments) {
      if (this.cusDepartments.length > 0) {
        for (let i = 0; i < this.cusDepartments.length; i++) {
          let cusDepartment = this.cusDepartments[i].label;
          if (cusDepartment.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
            this.filteredCusDepartments.push(cusDepartment);
          }
        }
      }
    }
  }

  //filter PickupUsers
  filterPickupUsers(event) {
    this.filteredPickupUsers = [];
    if (this.pickupUsers) {
      for (let i = 0; i < this.pickupUsers.length; i++) {
        let pickupUser = this.pickupUsers[i].label;
        if (pickupUser.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          this.filteredPickupUsers.push(pickupUser);
        }
      }
    }
  }

  onSelectedPickupUser() {
    this.pickupUsers.forEach(x => {
      if (this.pickupUser === x.label) {
        this.selectedPickupUser = x.value;
      }
    });
  }

  // filter fromProvince
  filterFromProvinces(event) {
    this.filteredFromProvinces = [];
    let textSearch = event.query.toLowerCase();
    for (let i = 0; i < this.fromProvinces.length; i++) {
      let fromProvince = this.fromProvinces[i].label;
      if (textSearch == '%') {
        this.filteredFromProvinces.push(fromProvince);
      } else {
        if (fromProvince.toLowerCase().indexOf(textSearch) >= 0) {
          this.filteredFromProvinces.push(fromProvince);
        }
      }
    }
  }

  keyTabFromProvince(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let fromProvince = this.fromProvinces.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (fromProvince) {
        this.fromProvince = fromProvince.label;
        if (!this.filteredFromProvinces.find(f => f == this.fromProvince)) this.filteredFromProvinces.push(this.fromProvince);
        if (this.selectedFromProvince == fromProvince.value) return;
        this.selectedFromProvince = fromProvince.value;
        this.fromDistrict = null;
        this.fromWard = null;
        this.changeFromProvince();
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy tỉnh/thành gửi!' });
      }
    } else if (!this.selectedFromProvince) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập tỉnh/thành gửi!' });
    }
  }

  onSelectedFromProvinces() {
    this.fromProvinces.forEach(x => {
      if (this.fromProvince === x.label) {
        this.selectedFromProvince = x.value;
        this.fromDistrict = null;
        this.fromWard = null;
        this.changeFromProvince();
      }
    });
  }

  // filter fromDistrict
  filterFromDistricts(event) {
    this.filteredFromDistricts = [];
    let textSearch = event.query.toLowerCase();
    for (let i = 0; i < this.fromDistricts.length; i++) {
      let fromDistrict = this.fromDistricts[i].label;
      if (textSearch == '%') {
        this.filteredFromDistricts.push(fromDistrict);
      } else {
        if (fromDistrict.toLowerCase().indexOf(textSearch) >= 0) {
          this.filteredFromDistricts.push(fromDistrict);
        }
      }
    }
  }

  keyTabFromDistrict(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let fromDistrict = this.fromDistricts.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (fromDistrict) {
        this.fromDistrict = fromDistrict.label;
        if (!this.filteredFromDistricts.find(f => f == this.fromDistrict)) this.filteredFromDistricts.push(this.fromDistrict);
        if (this.selectedFromDistrict == fromDistrict.value) return;
        this.selectedFromDistrict = fromDistrict.value;
        this.fromWard = null;
        this.changeFromDistrict();
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy quận/huyện gửi!' });
      }
    } else if (!this.selectedFromDistrict) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập quận/huyện gửi!' });
    }
  }

  onSelectedFromDistricts() {
    this.fromDistricts.forEach(x => {
      if (this.fromDistrict === x.label) {
        this.selectedFromDistrict = x.value;
        this.fromWard = null;
        this.changeFromDistrict();
      }
    });
  }

  // filter fromWard
  filterFromWards(event) {
    this.filteredFromWards = [];
    let textSearch = event.query.toLowerCase();
    for (let i = 0; i < this.fromWards.length; i++) {
      let fromWard = this.fromWards[i].label;
      if (textSearch == '%') {
        this.filteredFromWards.push(fromWard);
      } else {
        if (fromWard.toLowerCase().indexOf(textSearch) >= 0) {
          this.filteredFromWards.push(fromWard);
        }
      }
    }
  }

  keyTabFromWard(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let fromWard = this.fromWards.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (fromWard) {
        this.fromWard = fromWard.label;
        if (!this.filteredFromWards.find(f => f == this.fromWard)) this.filteredFromWards.push(this.fromWard);
        if (this.selectedFromWard == fromWard.value) return;
        this.selectedFromWard = fromWard.value;
        this.changeFromWard();
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy quận/huyện gửi!' });
      }
    }
  }

  onSelectedFromWards() {
    this.fromWards.forEach(x => {
      if (this.fromWard === x.label) {
        this.selectedFromWard = x.value;
        this.changeFromWard();
      }
    });
  }

  // filter fromHub
  filterFromHubs(event) {
    this.filteredFromHubs = [];
    if (this.fromHubs) {
      for (let i = 0; i < this.fromHubs.length; i++) {
        let fromHub = this.fromHubs[i].label;
        if (fromHub.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          this.filteredFromHubs.push(fromHub);
        }
      }
    }
  }

  onSelectedFromHubs() {
    this.fromHubs.forEach(x => {
      if (this.fromHub === x.label) {
        this.selectedFromHub = x.value;
        this.pickupUser = null;
        // this.loadDeadlinePickupDelivery();
      }
    });
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

  selectedReceiverPhone() {
    this.customerInfoLogs.forEach(x => {
      let obj = x as CustomerInfoLog;
      if (obj) {
        if (this.receiverPhone === obj.phoneNumber) {
          this.selectedCustomerInfoLogs = obj;
          this.changeCustomerInfoLog();
        }
      }
    });
  }

  selectedReceiverName() {
    this.customerInfoLogs.forEach(x => {
      let obj = x as CustomerInfoLog;
      if (obj) {
        if (this.receiverName === obj.name) {
          this.selectedCustomerInfoLogs = obj;
          this.changeCustomerInfoLog();
        }
      }
    });
  }

  selectedReceiverCompany() {
    this.customerInfoLogs.forEach(x => {
      let obj = x as CustomerInfoLog;
      if (obj) {
        if (this.receiverCompany === obj.companyName) {
          this.selectedCustomerInfoLogs = obj;
          this.changeCustomerInfoLog();
        }
      }
    });
  }

  //filter Employees
  filterEmployees(event) {
    this.filteredEmployees = [];
    if (this.employees) {
      for (let i = 0; i < this.employees.length; i++) {
        let employee = this.employees[i].label;
        if (employee.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          this.filteredEmployees.push(employee);
        }
      }
    }
  }

  onSelectedEmployee() {
    this.employees.forEach(x => {
      if (this.employee === x.label) {
        this.selectedEmployee = x.value;
      }
    });
  }

  // filter toProvince
  filterToProvinces(event) {
    this.filteredToProvinces = [];
    let textSearch = event.query.toLowerCase();
    for (let i = 0; i < this.toProvinces.length; i++) {
      let toProvince = this.toProvinces[i].label;
      if (textSearch == '%') {
        this.filteredToProvinces.push(toProvince);
      } else {
        if (toProvince.toLowerCase().indexOf(textSearch) >= 0) {
          this.filteredToProvinces.push(toProvince);
        }
      }
    }
  }

  keyTabToProvince(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let toProvince = this.toProvinces.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (toProvince) {
        this.toProvince = toProvince.label;
        if (!this.filteredToProvinces.find(f => f == this.toProvince)) this.filteredToProvinces.push(this.toProvince);
        if (this.selectedToProvince == toProvince.value) return;
        this.selectedToProvince = toProvince.value;
        this.toDistrict = null;
        this.toWard = null;
        this.changeToProvince();
      } else {
        this.toProvince = null;
        this.selectedToProvince = null;
        this.toDistrict = null;
        this.toWard = null;
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy tỉnh/thành nhận!' });
      }
    } else if (!this.selectedToProvince) {
      this.toProvince = null;
      this.selectedToProvince = null;
      this.toDistrict = null;
      this.toWard = null;
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập tỉnh/thành nhận!' });
    }
  }

  onSelectedToProvinces() {
    this.toProvinces.forEach(x => {
      if (this.toProvince === x.label) {
        this.selectedToProvince = x.value;
        this.toDistrict = null;
        this.toWard = null;
        this.changeToProvince();
      }
    });
  }

  // filter toDistrict
  filterToDistricts(event) {
    this.filteredToDistricts = [];
    let textSearch = event.query.toLowerCase();
    for (let i = 0; i < this.toDistricts.length; i++) {
      let toDistrict = this.toDistricts[i].label;
      if (textSearch == '%') {
        this.filteredToDistricts.push(toDistrict);
      } else {
        if (toDistrict.toLowerCase().indexOf(textSearch) >= 0) {
          this.filteredToDistricts.push(toDistrict);
        }
      }
    }
  }


  keyTabToDistrict(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let toDistrict = this.toDistricts.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (toDistrict) {
        this.toDistrict = toDistrict.label;
        if (!this.filteredToDistricts.find(f => f == this.toDistrict)) this.filteredToDistricts.push(this.toDistrict);
        if (this.selectedToDistrict == toDistrict.value) return;
        this.selectedToDistrict = toDistrict.value;
        this.toWard = null;
        this.changeToDistrict();
      } else {
        this.toDistrict = null;
        this.selectedToDistrict = null;
        this.toWard = null;
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy quận/huyện nhận!' });
      }
    } else if (!this.selectedToDistrict) {
      this.toDistrict = null;
      this.selectedToDistrict = null;
      this.toWard = null;
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập quận/huyện nhận!' });
    }
  }

  onSelectedToDistricts() {
    this.toDistricts.forEach(x => {
      if (this.toDistrict === x.label) {
        this.selectedToDistrict = x.value;
        this.toWard = null;
        this.changeToDistrict();
        //this.loadDeadlinePickupDelivery();
      }
    });
  }

  // filter toWard
  filterToWards(event) {
    this.filteredToWards = [];
    let textSearch = event.query.toLowerCase();
    for (let i = 0; i < this.toWards.length; i++) {
      let toWard = this.toWards[i].label;
      if (textSearch == '%') {
        this.filteredToWards.push(toWard);
      } else {
        if (toWard.toLowerCase().indexOf(textSearch) >= 0) {
          this.filteredToWards.push(toWard);
        }
      }
    }
  }

  keyTabToWard(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let toWard = this.toWards.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (toWard) {
        this.toWard = toWard.label;
        if (!this.filteredToWards.find(f => f == this.toWard)) this.filteredToWards.push(this.toWard);
        if (this.selectedToWard == toWard.value) return;
        this.selectedToWard = toWard.value;
        this.changeToWard();
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy phường/xã nhận!' });
      }
    }
  }

  onSelectedToWards() {
    this.toWards.forEach(x => {
      if (this.toWard === x.label) {
        this.selectedToWard = x.value;
        this.changeToWard();
      }
    });
  }
  // filter toHub
  filterToHubs(event) {
    this.filteredToHubs = [];
    if (this.toHubs) {
      for (let i = 0; i < this.toHubs.length; i++) {
        let toHub = this.toHubs[i].label;
        if (toHub.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          this.filteredToHubs.push(toHub);
        }
      }
    }
  }

  onSelectedToHubs() {
    this.toHubs.forEach(x => {
      if (this.toHub === x.label) {
        this.selectedToHub = x.value;
        this.toHubId = x.value;
        this.employee = null;
        this.loadEmployee();
      }
    });
  }

  // filter structures
  filterStructures(event) {
    this.filteredStructures = [];
    let textSearch = event.query.toLowerCase();
    for (let i = 0; i < this.structures.length; i++) {
      let structure = this.structures[i].label;
      if (textSearch == '%') {
        this.filteredStructures.push(structure);
      } else {
        if (structure.toLowerCase().indexOf(textSearch) >= 0) {
          this.filteredStructures.push(structure);
        }
      }
    }
  }

  keyTabStructure(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let structure = this.structures.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (structure) {
        this.structure = structure.label;
        if (!this.filteredStructures.find(f => f == this.structure)) this.filteredStructures.push(this.structure);
        if (this.selectedStructure == structure.value) return;
        this.selectedStructure = structure.value;
        this.calculatePrice();
      } else {
        this.structure = null;
        this.selectedStructure = null;
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy loại hàng hóa!' });
      }
    } else if (!this.selectedStructure) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn loại hàng hóa!' });
    }
  }

  onSelectedStructures() {
    this.structures.forEach(x => {
      if (this.structure === x.label) {
        this.selectedStructure = x.value;
        this.calculatePrice();
      }
    });
  }

  filterPaymentTypes(event) {
    this.filteredPaymentTypes = [];
    let textSearch = event.query.toLowerCase();
    for (let i = 0; i < this.paymentTypes.length; i++) {
      let paymentType = this.paymentTypes[i].label;
      if (textSearch == '%') {
        if (this.selectedShipmentType.value == ShipmentType.Return) {
          if (this.paymentTypes[i].value == PaymentTypeHelper.NGTTS || this.paymentTypes[i].value == PaymentTypeHelper.NNTTN)
            this.filteredPaymentTypes.push(paymentType);
        }
        else {
          this.filteredPaymentTypes.push(paymentType);
        }
      } else {
        if (paymentType.toLowerCase().indexOf(textSearch) >= 0) {
          if (this.selectedShipmentType.value == ShipmentType.Return) {
            if (this.paymentTypes[i].value == PaymentTypeHelper.NGTTS || this.paymentTypes[i].value == PaymentTypeHelper.NNTTN)
              this.filteredPaymentTypes.push(paymentType);
          }
          else {
            this.filteredPaymentTypes.push(paymentType);
          }
        }
      }
    }
  }

  keyTabPayment(event) {
    this.messageService.clear();
    let value = event.target.value;
    if (value && value.length > 0) {
      let paymentType = this.paymentTypes.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (paymentType) {
        this.paymentType = paymentType.label;
        if (!this.filteredPaymentTypes.find(f => f == this.paymentType)) this.filteredPaymentTypes.push(this.paymentType);
        if (this.selectedPaymentType == paymentType.value) return;
        this.selectedPaymentType = paymentType.value;
        this.checkPayment();
        this.setPaymentCODType();
        this.resetTotalCollect();
      } else {
        this.paymentType = null;
        this.selectedPaymentType = null;
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy hình thức thanh toán!' });
      }
    } else if (!this.selectedPaymentType) {
      this.paymentType = null;
      this.selectedPaymentType = null;
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn hình thức thanh toán!' });
    }
  }

  checkAllowPayment() {
    if (this.selectedPaymentType) this.data.paymentTypeId = this.selectedPaymentType;
    if (!this.data.paymentTypeId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng chọn hình thức thanh toán!` })
      return false;
    }
    if (this.data.paymentTypeId == PaymentTypeHelper.NGTTS) {
      if (!this.data.senderId || !this.selectedCustomer) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã khách gửi!` })
        return false;
      }
      if (this.selectedCustomer.customerTypeId == CustomerHelper.KHACH_LE) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Khách lẻ, chỉ cho phép thah toán ngay!` })
        return false;
      }
    } else if (this.data.paymentTypeId == PaymentTypeHelper.NNTTS) {
      if (!this.data.receiverId || !this.selectedCustomerReceipt) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã khách nhận!` });
        return false;
      }
      if (this.selectedCustomerReceipt.customerTypeId == CustomerHelper.KHACH_LE) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Khách lẻ, chỉ cho phép thah toán ngay!` })
        return false;
      }
    }
    return true;
  }

  checkPayment() {
    if (this.selectedPaymentType == PaymentTypeHelper.NNTTS) {
      if (!this.data.receiverId) {
        this.modalTitle = "Mã người nhận thanh toán cuối tháng";
        this.bsModalRef = this.modalService.show(this.templateInsured, {
          class: "inmodal animated bounceInRight modal-s"
        });
        setTimeout(() => {
          var element = document.getElementById("txtReceiverCode") as HTMLInputElement;
          element.focus();
          element.select();
        }, 0);
      }
    }
    return true;
  }

  async checkPaymentTo() {
    this.customerPaymentToService.checkCustomerPaymentTo(this.data.senderId, this.data.receiverId).then(
      x => {
        if (!this.isValidResponse(x)) {
          return false;
        } else {
          return true;
        }
      }
    )
  }

  filterPaymentCODTypes(event) {
    this.filteredPaymentCODTypes = [];
    let textSearch = event.query.toLowerCase();
    for (let i = 0; i < this.paymentCODTypes.length; i++) {
      let paymentCODTypes = this.paymentCODTypes[i].label;
      if (textSearch == '%') {
        this.filteredPaymentCODTypes.push(paymentCODTypes);
      } else {
        if (paymentCODTypes.toLowerCase().indexOf(textSearch) >= 0) {
          this.filteredPaymentCODTypes.push(paymentCODTypes);
        }
      }
    }
  }

  onSelectedPaymentCODTypes() {
    this.messageService.clear();
    this.paymentCODTypes.forEach(x => {
      if (this.paymentCODType === x.label) {
        this.data.paymentCODTypeId = x.value;
        this.resetTotalCollect();
      }
    });
    if (this.data.cod) {
      if (!this.data.paymentCODTypeId) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Chọn hình thức thanh thoán COD` });
        this.atcPaymentCODRef.domHandler.findSingle(this.atcPaymentCODRef.el.nativeElement, 'input').focus();
        this.atcPaymentCODRef.domHandler.findSingle(this.atcPaymentCODRef.el.nativeElement, 'input').select();
      }
    }
  }

  keyTabPaymentCOD(event) {
    this.messageService.clear();
    let value = event.target.value;
    if (value && value.length > 0) {
      let paymentCODType = this.paymentCODTypes.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (paymentCODType) {
        this.paymentCODType = paymentCODType.label;
        if (!this.filteredPaymentCODTypes.find(f => f == this.paymentCODType)) this.filteredPaymentCODTypes.push(this.paymentCODType);
        this.data.paymentCODTypeId = paymentCODType.value;
        this.resetTotalCollect();
      }
      setTimeout(() => {
        if (this.data.cod) {
          if (!this.data.paymentCODTypeId) {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Chọn hình thức thanh thoán COD` });
            this.atcPaymentCODRef.domHandler.findSingle(this.atcPaymentCODRef.el.nativeElement, 'input').focus();
            this.atcPaymentCODRef.domHandler.findSingle(this.atcPaymentCODRef.el.nativeElement, 'input').select();
          }
        }
      }, 0);
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Chọn hình thức thanh thoán COD` });
      this.atcPaymentCODRef.domHandler.findSingle(this.atcPaymentCODRef.el.nativeElement, 'input').focus();
      this.atcPaymentCODRef.domHandler.findSingle(this.atcPaymentCODRef.el.nativeElement, 'input').select();
    }
  }

  async keyTabReceiverPhones(event) {
    let query = event.target.value;
    this.receiverPhone = query;
    if (this.selectedCustomer) this.data.senderId = this.selectedCustomer.id;
    if (query.length == 10 || query.length == 11) {
      if (!this.selectedCustomer || !this.receiverName) {
        await this.customerInfoLogService.searchAsync(query, this.data.senderId).then(
          x => {
            if (x) {
              this.listInfoLog = x;
              if (this.listInfoLog && this.listInfoLog.length > 0) {
                this.selectedCustomerInfoLogs = this.listInfoLog[0];
                this.changeCustomerInfoLog();
              }
            }
          }
        );
      }
    }
  }

  onSelectedPaymentTypes() {
    this.messageService.clear();
    this.paymentTypes.forEach(x => {
      if (this.paymentType === x.label) {
        this.selectedPaymentType = x.value;
        this.checkPayment();
        this.setPaymentCODType();
        this.resetTotalCollect();
      }
    });
  }

  // filter services
  filterServices(event) {
    this.filteredServices = [];
    let textSearch = event.query.toLowerCase();
    if (this.services) {
      for (let i = 0; i < this.services.length; i++) {
        let service = this.services[i].label;
        if (textSearch == '%') {
          this.filteredServices.push(service);
        } else {
          if (service.toLowerCase().indexOf(textSearch) >= 0) {
            this.filteredServices.push(service);
          }
        }
      }
    }
  }

  keyTabService(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let service = this.services.find(f => f.label.toLowerCase().indexOf(value.toLowerCase()) >= 0);
      if (service) {
        this.service = service.label;
        if (!this.filteredServices.find(f => f == this.service)) this.filteredServices.push(this.service);
        if (this.selectedService == service.value) return;
        this.selectedService = service.value;
        this.calculatePrice(true);
      } else {
        this.service = null;
        this.selectedService = null;
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy dịch vụ!' });
      }
    } else if (!this.selectedService) {
      this.service = null;
      this.selectedService = null;
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn dịch vụ!' });
    }
  }

  onSelectedServices() {
    this.services.forEach(x => {
      if (this.service === x.label) {
        this.selectedService = x.value;
        this.calculatePrice(true);
      }
    });
  }

  //
  async loadCenterHub() {
    this.resetFromHubData();
    this.resetToHubData();
    this.fromCenterHubs = await this.hubService.getSelectModelCenterHubAsync();
    if (this.fromCenterHubs) {
      this.toCenterHubs = this.fromCenterHubs;
    }
  }

  async loadFromPoHub(selectedPoHub: number = null) {
    this.fromPoHubs = [];
    this.fromStationHubs = [];
    this.selectedFromStationHub = null;
    if (!this.selectedFromCenterHub) return;

    this.fromPoHubs = await this.hubService.getSelectModelPoHubByCenterIdAsync(this.selectedFromCenterHub);
    this.selectedFromPoHub = selectedPoHub;
    let data = await this.hubService.getPoHubByCenterIdAsync(this.selectedFromCenterHub);
    if (data) {
      data.forEach(element => {
        if (element.id == this.selectedFromPoHub) {
          this.fromPoHub = `${element.code} - ${element.name}`;
        }
      });
    }
  }

  async loadFromStationHub(
    selectedPoHub: number = null,
    selectedStationHub: number = null
  ) {
    this.fromStationHubs = [];

    if (this.selectedFromPoHub) {
      selectedPoHub = this.selectedFromPoHub;
    }

    this.fromStationHubs = await this.hubService.getSelectModelStationHubByPoIdAsync(selectedPoHub);
    this.selectedFromStationHub = selectedStationHub;
    let data = await this.hubService.getStationHubByPoIdAsync(selectedPoHub);
    if (data) {
      data.forEach(element => {
        if (element.id == this.selectedFromStationHub) {
          this.fromStationHub = `${element.code} - ${element.name}`;
        }
      });
    }
  }

  async loadToPoHub(selectedPoHub: number = null) {
    this.toPoHubs = [];
    this.toStationHubs = [];
    this.selectedToStationHub = null;

    if (!this.selectedToCenterHub) return;

    this.toPoHubs = await this.hubService.getSelectModelPoHubByCenterIdAsync(this.selectedToCenterHub);
    this.selectedToPoHub = selectedPoHub;
    let data = await this.hubService.getPoHubByCenterIdAsync(this.selectedToCenterHub);
    if (data) {
      data.forEach(element => {
        if (element.id == this.selectedToPoHub) {
          this.toPoHub = `${element.code} - ${element.name}`;
        }
      });
    }
  }

  async loadToStationHub(
    selectedPoHub: number = null,
    selectedStationHub: number = null
  ) {
    this.toStationHubs = [];

    if (this.selectedToPoHub) {
      selectedPoHub = this.selectedToPoHub;
    }

    this.toStationHubs = await this.hubService.getSelectModelStationHubByPoIdAsync(selectedPoHub);
    this.selectedToStationHub = selectedStationHub;
    let data = await this.hubService.getStationHubByPoIdAsync(selectedPoHub);
    if (data) {
      data.forEach(element => {
        if (element.id == this.selectedToStationHub) {
          this.toStationHub = `${element.code} - ${element.name}`;
        }
      });
    }
  }

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

  async loadFromDistrict(selectedDistrict: number = null) {
    this.fromDistricts = [];
    this.resetFromHubData();
    if (!this.selectedFromProvince) return;
    if (selectedDistrict)
      this.selectedFromDistrict = selectedDistrict;
    this.fromDistricts = await this.districtService.getSelectModelDistrictByProvinceIdAsync(this.selectedFromProvince);
    let data = await this.districtService.getDistrictByProvinceIdAsync(this.selectedFromProvince);
    if (data) {
      data.forEach(element => {
        if (this.selectedFromDistrict === element.id) {
          this.fromDistrict = `${element.code} - ${element.name}`;
        }
      });
    }
  }

  async loadFromWard(selectedDistrict: number = null, selectedWard: number = null) {
    this.fromWards = [];
    this.resetFromHubData();

    if (!this.selectedFromDistrict && !selectedDistrict) return;
    if (!selectedDistrict) {
      selectedDistrict = this.selectedFromDistrict;
    }
    this.fromWards = await this.wardService.getSelectModelWardByDistrictIdAsync(selectedDistrict);
    this.selectedFromWard = selectedWard;
    let data = await this.wardService.getWardByDistrictIdAsync(selectedDistrict);
    if (data) {
      data.forEach(element => {
        if (this.selectedFromWard === element.id) {
          this.fromWard = `${element.code} - ${element.name}`;
        }
      });
      if (!data.filter(f => f != null).find(f => f.id == this.selectedFromWard)) {
        this.selectedFromWard = null;
        this.fromWard = null;
      }
    }
  }

  async loadToDistrict(selectedDistrict: number = null) {
    this.toDistricts = [];
    this.toWards = [];
    this.resetToHubData();

    if (!this.selectedToProvince) return;
    if (selectedDistrict)
      this.selectedToDistrict = selectedDistrict;
    this.toDistricts = await this.districtService.getSelectModelDistrictByProvinceIdAsync(this.selectedToProvince);
    if (this.toDistricts) {
      let data = this.toDistricts.map(x => x.data) as District[];
      if (data) {
        data.forEach(element => {
          if (element) {
            if (this.selectedToDistrict === element.id) {
              this.toDistrict = `${element.code} - ${element.name}`;
              this.toDistrictName = element.name;
            }
          }
        });
      }
    }
    //this.loadDeadlinePickupDelivery();
  }

  async loadToWard(selectedDistrict: number = null, selectedWard: number = null) {
    this.toWards = [];
    this.resetToHubData();

    if (!this.selectedToDistrict && !selectedDistrict) return;
    if (!selectedDistrict) {
      selectedDistrict = this.selectedToDistrict;
    }
    if (selectedWard)
      this.selectedToWard = selectedWard;

    this.toWards = await this.wardService.getSelectModelWardByDistrictIdAsync(selectedDistrict);
    if (this.toWards) {
      let data = this.toWards.map(x => x.data) as Ward[];
      if (data) {
        data.forEach(element => {
          if (element) {
            if (this.selectedToWard === element.id) {
              this.toWard = `${element.code} - ${element.name}`;
              this.toWardName = element.name;
            }
          }
        });
        if (!data.filter(f => f != null).find(f => f.id == this.selectedToWard)) {
          this.selectedToWard = null;
          this.toWard = null;
        }
      }
    }
  }

  async loadLocationFromPlace(place: google.maps.places.PlaceResult) {
    this.fromProvince = null;
    this.selectedFromProvince = null;
    this.fromDistrict = null;
    this.selectedFromDistrict = null;
    this.fromWard = null;
    this.selectedFromWard = null;
    let provinceName = "";
    let districtName = "";
    let wardName = "";
    let isProvince: boolean;
    let isDistrict: boolean;
    let isWard: boolean;

    // place = await this.geocodingApiService.findFirstFromLatLngAsync(
    //   place.geometry.location.lat(),
    //   place.geometry.location.lng()
    // ) as google.maps.places.PlaceResult;

    // console.log(place);
    place.address_components.map(element => {
      //
      if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1) {
        isProvince = true;
        provinceName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1) {
        isDistrict = true;
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.LOCALITY) !== -1) {
        isDistrict = true;
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_3) !== -1) {
        isWard = true;
        wardName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        isWard = true;
        wardName = element.long_name;
      }
    });
    if (isProvince && isDistrict && !this.isViewToLocation) {
      this.fromLocation = "none";
    } else {
      this.fromLocation = "block";
    }

    this.cloneFromProviceName = provinceName;
    this.cloneFromDistrictName = districtName;
    this.cloneFromWardName = wardName;
    //
    await this.hubService.getInfoLocationAsync(provinceName, districtName, wardName, null, null, null, null).then(
      x => {
        if (x) {
          if (x.provinceId) this.selectedFromProvince = x.provinceId;
          if (x.districtId) this.selectedFromDistrict = x.districtId;
          if (x.wardId) this.selectedFromWard = x.wardId;
          if (x.hubId) this.selectedFromHub = x.hubId;
          if (x.hub) this.fromHub = x.hub;
        }
      }
    )
    //
    let fProvince = this.fromProvinces.find(f => f.value == this.selectedFromProvince);
    if (fProvince) {
      this.fromProvince = fProvince.label;
    }
    //
    this.loadFromDistrict();
    this.loadFromWard();
    this.loadHubFromByWard();
  }

  async loadLocationToPlace(place: google.maps.places.PlaceResult) {
    this.toProvince = null;
    this.selectedToProvince = null;
    this.toDistrict = null;
    this.selectedToDistrict = null;
    this.toWard = null;
    this.selectedToWard = null;
    let provinceName = "";
    let districtName = "";
    let wardName = "";
    let isProvince: boolean;
    let isDistrict: boolean;
    let isWard: boolean;

    // place = await this.geocodingApiService.findFirstFromLatLngAsync(
    //   place.geometry.location.lat(),
    //   place.geometry.location.lng()
    // ) as google.maps.places.PlaceResult;

    place.address_components.map(element => {
      //
      if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1) {
        isProvince = true;
        provinceName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1) {
        isDistrict = true;
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.LOCALITY) !== -1) {
        isDistrict = true;
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_3) !== -1) {
        isWard = true;
        wardName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        isWard = true;
        wardName = element.long_name;
      }
    });
    if (isProvince && isDistrict && !this.isViewToLocation) {
      this.toLocation = "none";
    } else {
      this.toLocation = "block";
    }
    if (!districtName && wardName) {
      districtName = wardName;
      wardName = null;
    }

    this.cloneToProviceName = provinceName;
    this.cloneToDistrictName = districtName;
    this.cloneToWardName = wardName;
    //
    await this.hubService.getInfoLocationAsync(provinceName, districtName, wardName, null, null, null, null).then(
      x => {
        if (x) {
          if (x.provinceId) this.selectedToProvince = x.provinceId;
          if (x.districtId) this.selectedToDistrict = x.districtId;
          if (x.wardId) this.selectedToWard = x.wardId;
          if (x.hubId) this.selectedToHub = x.hubId;
          if (x.hub) this.toInfoHub = x.hub;
          if (this.data) {
            this.data.toProvinceId = this.selectedToProvince;
            this.data.toDistrictId = this.selectedToDistrict;
            this.data.toWardId = this.selectedToWard;
          }
          let fProvince = this.fromProvinces.find(f => f.value == this.selectedToProvince);
          if (fProvince) {
            this.toProvince = fProvince.label;
          }
          this.loadToDistrict();
          this.loadToWard();
          this.loadHubToByWard();
          this.calculatePrice();
          this.viewInfoDelivery();
        }
      }
    )
  }

  async loadHubFromByWard(selectedWard: number = null) {
    this.resetFromHubData();
    this.fromHubs = [];
    // this.selectedFromHub = null;
    if (!this.selectedFromWard && !selectedWard) return;

    if (!selectedWard) {
      selectedWard = this.selectedFromWard;
    }

    let includes = [
      Constant.classes.includes.hub.centerHub,
      Constant.classes.includes.hub.poHub
    ];

    this.fromHubs = await this.hubService.getSelectModelgetListHubByWardIdAsync(selectedWard, includes);
    let stationHub = await this.hubService.getHubByWardIdAsync(selectedWard, includes);
    if (stationHub == null) return;
    this.selectedFromCenterHub = stationHub.centerHubId;
    if (this.cloneRowDataShipment) {
      if (this.fromHubs) {
        const fromHub = this.fromHubs.find(x => x.value == stationHub.id);
        if (fromHub) {
          this.selectedFromHub = fromHub.value;
        }
      }
    } else {
      this.selectedFromHub = this.fromHubId;
    }
  }

  async loadHubToByWard(selectedWard: number = null) {
    this.resetToHubData();
    this.toHubs = [];
    this.selectedToHub = null;
    if (!this.selectedToWard && !selectedWard) {

    } else {
      if (!selectedWard) {
        selectedWard = this.selectedToWard;
      }

      let includes = [
        Constant.classes.includes.hub.centerHub,
        Constant.classes.includes.hub.poHub
      ];

      this.toHubs = await this.hubService.getSelectModelgetListHubByWardIdAsync(selectedWard, includes);
      let stationHub = await this.hubService.getHubByWardIdAsync(selectedWard, includes);
      if (stationHub == null) return;
      this.selectedToCenterHub = stationHub.centerHubId;
      if (this.toHubs) {
        this.toHubs.forEach(e => {
          if (e.value == stationHub.id) {
            this.selectedToHub = e.value;
            this.toHub = e.label;
          }
        });
      }
      this.toHubId = this.selectedToHub;
      // console.log(this.selectedToHub);
      this.loadEmployee();
    }
    if (this.toInfoHub) {
      if (this.toInfoHub.id)
        if (!this.toHubs.find(f => f.value == this.toInfoHub.id)) {
          this.toHubs.push({ label: `${this.toInfoHub.code} - ${this.toInfoHub.name}`, value: this.toInfoHub.id, data: this.toInfoHub });
          this.selectedToHub = this.toInfoHub.id;
          this.toHub = `${this.toInfoHub.code} - ${this.toInfoHub.name}`;
        }
    }
  }

  initMap() {
    //set google maps defaults
    this.zoom = 4;
    this.latitudeFrom = 10.762622;
    this.longitudeFrom = 106.660172;
    this.latitudeTo = 10.762622;
    this.longitudeTo = 106.660172;

    //create search FormControl
    this.searchFromControl = new FormControl();
    this.searchToControl = new FormControl();

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let fromAutocomplete = new google.maps.places.Autocomplete(
        this.searchFromElementRef.nativeElement,
        {
          // types: ["address"]
        }
      );
      fromAutocomplete.addListener("place_changed", () => {
        this.ngZone.run(async () => {
          //get the place result
          let place: google.maps.places.PlaceResult = fromAutocomplete.getPlace();

          //verify result
          if (!place.geometry) {
            place = await this.geocodingApiService.findFromAddressAsync(place.name);

            if (!place) {
              this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy địa chỉ" });
              return;
            }
          }

          //
          this.loadLocationFromPlace(place);
          this.data.pickingAddress = place.formatted_address;
          //set latitudeFrom, longitudeFrom and zoom
          this.latitudeFrom = place.geometry.location.lat();
          this.longitudeFrom = place.geometry.location.lng();
          this.data.latFrom = this.latitudeFrom;
          this.data.lngFrom = this.longitudeFrom;
          this.zoom = 16;
        });
      });
    });

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let toAutocomplete = new google.maps.places.Autocomplete(
        this.searchToElementRef.nativeElement,
        {
          // types: ["address"]
        }
      );
      toAutocomplete.addListener("place_changed", () => {
        this.ngZone.run(async () => {
          //get the place result
          let place: google.maps.places.PlaceResult = toAutocomplete.getPlace();

          //verify result
          if (!place.geometry) {
            place = await this.geocodingApiService.findFromAddressAsync(place.name);

            if (!place) {
              this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Google Map không tìm thấy địa chỉ" });
              return;
            }
          }

          //
          this.loadLocationToPlace(place);
          this.data.shippingAddress = place.formatted_address;
          //set latitude, longitude and zoom
          this.latitudeTo = place.geometry.location.lat();
          this.longitudeTo = place.geometry.location.lng();
          this.data.latTo = this.latitudeTo;
          this.data.lngTo = this.longitudeTo;
          this.zoom = 16;
        });
      });
    });
  }
  hideBox() {
    this.txtTotalBoxRef.nativeElement.focus();
    this.txtTotalBoxRef.nativeElement.select();
    this.bsModalRef.hide();
    this.isBox = false;
  }

  openModelBox(template: TemplateRef<any>) {
    setTimeout(() => {
      var element = document.getElementById('txtLenght') as HTMLInputElement;
      element.focus();
      element.select();
    }, 0);
    this.modalTitle = "Kiện hàng";
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
    this.isBox = true;
    if (this.cloneRowDataShipment) {
      //this.loadBoxes(this.cloneRowDataShipment.id);
    }
  }

  openModelTemplateToHub(template: TemplateRef<any>) {
    setTimeout(() => {
      var atcServiceDVGT = $("#atcToHub input");
      atcServiceDVGT.focus();
      atcServiceDVGT.select();
    }, 0);
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  reCalWeightAllBox() {
    if (this.data.boxes && this.data.boxes.length > 0 && (this.dim || this.dim == 0)) {
      this.data.boxes.map(
        m => {
          var excWeight = parseFloat(m.length.toString()) * parseFloat(m.width.toString()) * parseFloat(m.height.toString()) * this.dim;
          m.excWeight = this.route(excWeight);
          if (m.weight > m.excWeight) m.calWeight = m.weight;
          else m.calWeight = m.excWeight;
        }
      );
      this.changeBox();
    }
  }

  addBox(isClose: boolean) {
    if (!this.data.boxes) this.data.boxes = [];
    if ((this.dim || this.dim == 0) && this.boxs.length && this.boxs.width && this.boxs.height) {
      if (!this.boxs.length) this.boxs.length = 0;
      if (!this.boxs.width) this.boxs.width = 0;
      if (!this.boxs.height) this.boxs.height = 0;
      var excWeight = parseFloat(this.boxs.length.toString()) * parseFloat(this.boxs.width.toString()) * parseFloat(this.boxs.height.toString()) * this.dim;
      this.boxs.excWeight = this.route(excWeight);
    } else {
      this.boxs.excWeight = 0;
    }
    //
    let findIndexBox = this.data.boxes.findIndex(f => f.id == this.boxs.id);
    if (this.boxs.id && findIndexBox >= 0) {
      //
    } else {
      let box = this.cloneBox(this.boxs);
      this.quantilyBox = this.quantilyBox ? this.quantilyBox : 1;
      for (let i = 0; i < this.quantilyBox; i++) {
        this.data.boxes.push(box);
      }
      // this.data.boxes.push(box);
    }
    //
    this.boxs = new Boxes();
    this.changeBox();
    if (isClose) {
      this.hideBox();
    } else {
      setTimeout(() => {
        var atcServiceDVGT = $("#txtLenght");
        atcServiceDVGT.focus();
        atcServiceDVGT.select();
      }, 0);
    }
  }

  deleteBox(rowIndex: any) {
    if (!rowIndex && rowIndex != 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn box cần hủy!!!"
      });
      return;
    }
    this.data.boxes.splice(rowIndex, 1);
    this.changeBox();
  }

  changeBox() {
    this.data.weight = 0;
    this.data.calWeight = 0;
    this.data.excWeight = 0;
    this.data.totalBox = 1;
    this.quantilyBox = 1;
    if (this.data.boxes && this.data.boxes.length > 0) {
      this.data.boxes.map(m => {
        this.data.weight += parseFloat(m.weight.toString());
        this.data.excWeight += parseFloat(m.excWeight.toString());
        if (m.weight > m.excWeight) m.calWeight = parseFloat(m.weight.toString());
        else m.calWeight = parseFloat(m.excWeight.toString());
        this.data.calWeight += parseFloat(m.calWeight.toString());
      });
      this.data.totalBox = this.data.boxes.length;
    }
    this.data.weight = this.route(this.data.weight);
    this.data.calWeight = this.route(this.data.calWeight);
    this.data.excWeight = this.route(this.data.excWeight);
    //
    this.changeWeight();
  }



  cloneBox(model: Boxes): Boxes {
    let data = new Boxes();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  async openModalEditPriceDVGT(template: TemplateRef<any>) {
    setTimeout(() => {
      var atcServiceDVGT = $("#atcServiceDVGT input");
      atcServiceDVGT.focus();
      atcServiceDVGT.select();
    }, 0);
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  async savePriceDVGT() {
    this.calculatePrice();
    this.messageService.add({
      severity: Constant.messageStatus.success,
      detail: "Cập nhật giá dvgt thành công"
    });
    this.bsModalRef.hide();
  }

  eventTabShipmentNumber() {
    this.onDetailShipment();
  }

  changeFromProvince() {
    this.loadFromDistrict();
    this.calculatePrice();
  }

  changeFromDistrict() {
    this.loadFromWard();
    this.calculatePrice();
  }

  changeFromWard() {
    this.loadHubFromByWard();
    this.calculatePrice();
  }

  changeFromCenterHub() {
    this.loadFromPoHub();
  }

  changeFromPoHub() {
    this.loadFromStationHub();
  }

  changeToProvince() {
    if (this.data) this.data.toProvinceId = this.selectedToProvince;
    this.loadToDistrict();
    this.calculatePrice();
  }

  changeToDistrict() {
    if (this.data) this.data.toDistrictId = this.selectedToDistrict;
    this.loadToWard();
    this.calculatePrice();
    this.viewInfoDelivery();
  }

  changeToWard() {
    if (this.data) this.data.toWardId = this.selectedToWard;
    this.loadHubToByWard();
    this.calculatePrice();
    this.viewInfoDelivery();
  }

  changeWeight() {
    if (!this.data.weight) this.data.weight = 0;
    if (!this.data.calWeight) this.data.calWeight = 0;
    if (!this.data.excWeight) this.data.excWeight = 0;
    if (!this.data.boxes || this.data.boxes.length == 0) {
      this.data.calWeight = 0;
      this.data.excWeight = 0;
    }
    if (this.data.weight > this.data.calWeight || this.data.excWeight > this.data.calWeight) {
      if (this.data.weight > this.data.excWeight) this.data.calWeight = this.data.weight;
      else this.data.calWeight = this.data.excWeight;
    }
    this.loadChargeWeight();
    this.calculatePrice();
  }

  changeToCenterHub() {
    this.loadToPoHub();
    this.loadEmployee();
  }

  changeToPoHub() {
    this.loadToStationHub();
  }

  async changeCustomer() {
    this.messageService.clear();
    let customer = this.selectedCustomer;
    this.cloneCustomer = Object.assign({}, customer);
    if (customer) {
      this.resetFromLocationData();
      this.resetFromHubData();
      this.data.senderId = customer.id;
      this.senderName = customer.name;
      this.data.senderName = this.senderName;
      this.senderPhone = customer.phoneNumber;
      this.data.senderPhone = this.senderPhone;
      this.senderCompany = customer.companyName;
      this.data.companyFrom = this.senderCompany;
      this.data.pickingAddress = customer.address;
      this.data.addressNoteFrom = customer.addressNote;
      this.latitudeFrom = customer.lat;
      this.longitudeFrom = customer.lng;
      this.data.latFrom = customer.lat;
      this.data.lngFrom = customer.lng;
      this.data.currentLat = customer.lat;
      this.data.currentLng = customer.lng;
      var isGetByCus: boolean = true;
      if (this.isPickupInHub == true) {
        await this.authService.getAccountInfoAsync().then(
          xUser => {
            if (xUser) {
              isGetByCus = false;
              let infoHub = xUser.hub;
              this.data.addressNoteFrom = '';
              this.data.pickingAddress = infoHub.address;
              this.inputPickingAddress = infoHub.address;
              this.selectedFromProvince = infoHub.provinceId;
              this.selectedFromDistrict = infoHub.districtId;
              this.selectedFromWard = infoHub.wardId;
              this.selectedFromHub = infoHub.id;
              this.data.fromHubId = infoHub.id;
            }
          }
        );
      }
      if (!customer.provinceId || !customer.districtId || StringHelper.isNullOrEmpty(customer.address)) {
        this.messageService.add({
          severity: Constant.messageStatus.warn, detail: `${customer.name} chưa được cập nhật địa chỉ, vui lòng cập nhật lại địa chỉ`
        });
      }
      this.loadInfoSender(isGetByCus, customer);
      if (customer.paymentTypeId) {
        Promise.all(this.paymentTypes.map(x => {
          if (customer.paymentTypeId == x.value) {
            this.paymentType = x.label;
            this.selectedPaymentType = x.value;
          }
        }));
        if (this.selectedPaymentType && this.selectedPaymentType != PaymentTypeHelper.NNTTN) {
          if (customer.discount) this.data.disCount = customer.discount;
          else this.data.disCount = 0;
        } else {
          this.data.disCount = 0;
        }
      }
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã khách gửi.` });
      this.atcSenderCodeRef.domHandler.findSingle(this.atcSenderCodeRef.el.nativeElement, 'input').focus();
      this.atcSenderCodeRef.domHandler.findSingle(this.atcSenderCodeRef.el.nativeElement, 'input').select();
    }
  }

  loadInfoSender(isGetByCus: boolean, customer: Customer) {

    if (isGetByCus == true && !this.inputPickingAddress) {
      this.data.pickingAddress = customer.address;
      this.inputPickingAddress = customer.address;
    }
    this.searchFromControl.setValue(this.inputPickingAddress);
    // this.searchFromControl.disable();
    if (customer.provinceId && customer.districtId && !this.isViewToLocation) {
      this.fromLocation = "none";
    } else {
      this.fromLocation = "block";
    }
    if (isGetByCus == true && customer.provinceId && !this.selectedFromProvince) this.selectedFromProvince = customer.provinceId;
    let findProvince = this.fromProvinces.find(f => f.value == this.selectedFromProvince);
    if (findProvince) {
      this.fromProvince = findProvince.label;
    }
    if (this.selectedFromProvince) {
      if (isGetByCus == true && customer.districtId && !this.selectedFromDistrict) this.selectedFromDistrict = customer.districtId;
      if (this.selectedFromDistrict) {
        this.loadFromDistrict(this.selectedFromDistrict);
      } else {
        this.selectedService = null;
        this.service = null;
        this.resetPrice();
      }
      if (isGetByCus == true && customer.wardId && !this.selectedFromWard) this.selectedFromWard = customer.wardId;
      if (this.selectedFromWard) {
        this.loadFromWard(this.selectedFromDistrict, this.selectedFromWard);
        this.loadHubFromByWard(this.selectedFromWard);
      } else {
        this.loadFromWard(this.selectedFromDistrict, null);
      }
    }
  }


  loadInfoSenderByHub(isGetByCus: boolean, hub: Hub) {

    if (isGetByCus == true && !this.inputPickingAddress) {
      this.data.pickingAddress = hub.address;
      this.inputPickingAddress = hub.address;
    }
    this.searchFromControl.setValue(this.inputPickingAddress);
    // this.searchFromControl.disable();
    if (hub.provinceId && hub.districtId && !this.isViewToLocation) {
      this.fromLocation = "none";
    } else {
      this.fromLocation = "block";
    }
    if (isGetByCus == true && hub.provinceId && !this.selectedFromProvince) this.selectedFromProvince = hub.provinceId;
    let findProvince = this.fromProvinces.find(f => f.value == this.selectedFromProvince);
    if (findProvince) {
      this.fromProvince = findProvince.label;
    }
    if (this.selectedFromProvince) {
      if (isGetByCus == true && hub.districtId && !this.selectedFromDistrict) this.selectedFromDistrict = hub.districtId;
      if (this.selectedFromDistrict) {
        this.loadFromDistrict(this.selectedFromDistrict);
      } else {
        this.selectedService = null;
        this.service = null;
        this.resetPrice();
      }
      if (isGetByCus == true && hub.wardId && !this.selectedFromWard) this.selectedFromWard = hub.wardId;
      if (this.selectedFromWard) {
        this.loadFromWard(this.selectedFromDistrict, this.selectedFromWard);
        this.loadHubFromByWard(this.selectedFromWard);
      } else {
        this.loadFromWard(this.selectedFromDistrict, null);
      }
    }
  }

  loadInfoReceiver() {
    if (this.selectedToProvince) {
      this.toProvinces.forEach(x => {
        if (this.selectedToProvince === x.value) {
          this.toProvince = x.label;
        }
      });
    }
    if (this.selectedToProvince && this.selectedToDistrict && !this.isViewToLocation) {
      this.toLocation = "none";
    } else {
      this.toLocation = "block";
    }
    if (this.selectedToProvince) {
      if (this.selectedToDistrict) {
        this.loadToDistrict(this.selectedToDistrict);
        this.resetPrice();
        this.calculatePrice();
      } else {
        this.selectedService = null;
        this.service = null;
      }
      if (this.selectedToWard) {
        this.loadToWard(this.selectedToDistrict, this.selectedToWard);
      } else {
        this.loadToWard(this.selectedToDistrict, null);
      }
      if (this.selectedToWard) {
        this.loadHubToByWard(this.selectedToWard);
      }
    }
  }

  changeCustomerInfoLog() {
    let customer = this.selectedCustomerInfoLogs;
    this.resetToLocationData();

    if (customer) {
      this.receiverName = customer.name;
      this.data.receiverName = this.receiverName;
      this.receiverPhone = customer.phoneNumber;
      this.data.receiverPhone = this.receiverPhone;
      this.receiverCompany = customer.companyName;
      this.data.companyTo = this.receiverCompany;
      this.data.addressNoteTo = customer.addressNote;
      this.data.shippingAddress = customer.address;
      this.latitudeTo = customer.lat;
      this.longitudeTo = customer.lng;
      this.data.latTo = customer.lat;
      this.data.lngTo = customer.lng;

      this.searchToControl.setValue(customer.address);
      this.selectedToProvince = customer.provinceId;
      if (customer.districtId) this.selectedToDistrict = customer.districtId;
      if (customer.wardId) this.selectedToWard = customer.wardId;
      this.loadInfoReceiver();
    }
  }

  changeLWH() {
    this.messageService.clear();
    if (!this.dim) {
      if (!this.selectedService) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Chưa chọn dịch vụ"
        });
      } else {
        if (!this.selectedService) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "Chưa chọn dịch vụ"
          });
        }
      }
      return;
    }
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight =
        this.selectedLength *
        this.selectedWidth *
        this.selectedHeight *
        this.dim;
    } else {
      this.selectedCalWeight = null;
    }
  }

  refresh() {
    if (this.inputShipmentNumber) {
      this.inputShipmentNumber = null;
    }
    this.initData();
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
    this.checkSubmit = false;
  }
  resetSaveData() {
    this.resetInputDataNotSender();
    // this.resetSaveFromLocationData();
    this.resetToLocationData();
    // this.loadPaymentType();
    // this.loadStructure();
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
      this.singlePickerOrderDate.startDate = new Date(
        this.currentTime
      );
    }
    if (this.isEditLS) {
      this.data.orderDate = this.currentTime;
      this.singlePickerOrderDate.startDate = new Date(
        this.currentTime
      );
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
    this.checkSubmitPrintCode = true;

    this.data = await this.saveShipment();
    this.createOrUpdateCustomerInfoLog();
    // console.log(JSON.stringify(this.data));
    this.itemShipment = await this.onCreateAndPrintCode(this.data);
    this.idPrint = PrintHelper.printCodeCreateShipment;
    if (this.itemShipment) {
      setTimeout(() => {
        this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
        this.resetInputDataNotSender();
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
            this.resetInputDataNotSender();
            this.reSetPrimeShipment();
            this.data.pickingAddress = this.inputPickingAddress;
          }, 0);
        }
      );
    }
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
          this.createdDataShipment.senderCode = senderCode.data.code;
        }
        let structure = this.structures.find(x => x.value == this.selectedStructure);
        this.createdDataShipment.structureName = structure.title;
        this.createdDataShipment.serviceName = this.serviceName;
        let payment = this.paymentTypes.find(x => x.value == this.selectedPaymentType)
        this.createdDataShipment.paymentName = payment.title;
        let obj = [];
        if (this.objSelectesServiceDVGTs) {
          this.objSelectesServiceDVGTs.forEach(x => {
            obj.push(x.name);
          });
        }
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
      if (!this.isAdd) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Tài khoản chưa được cấp quyền tạo vận đơn."
        });
        this.checkSubmit = false;
        return;
      }
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
        this.resetInputDataNotSender();
        this.reSetPrimeShipment();
        setTimeout(() => {
          var txtShipmentnumber = $('#idShipmentNumber');
          txtShipmentnumber.select();
          txtShipmentnumber.focus();
        }, 0);
      }
    } else {
      if (this.isUpdateShipmentWhite) {
        if (!this.isAdd) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "Tài khoản chưa được cấp quyền nhập liệu."
          });
          this.checkSubmit = false;
          return;
        }
      } else {
        if (!this.isEdit) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "Tài khoản chưa được cấp sửa vận đơn."
          });
          this.checkSubmit = false;
          return;
        }
      }
      this.data = await this.saveShipment();
      // console.log(JSON.stringify(this.data));
      let data = await this.shipmentService.updateAsync(this.data);
      this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);
      if (data) {
        //create Version
        // save column haved changed into DataChanged
        if (!this.isUpdateShipmentWhite) {
          this.cloneRowDataShipment.orderDate = SearchDate.formatToISODate(this.cloneRowDataShipment.orderDate);
          this.cloneRowDataShipment.endPickTime = SearchDate.formatToISODate(this.cloneRowDataShipment.endPickTime);
          const dataChanged = ShipmentVersionHelper.getDiff(this.cloneRowDataShipment, this.data);
          if (!StringHelper.isNullOrEmpty(dataChanged)) {
            this.cloneRowDataShipment.dataChanged = dataChanged;
          }
          // save column haved changed into PropertyChanged
          this.shipmentVersionService.createAsync(this.cloneRowDataShipment);
        }
        this.messageService.add({ severity: Constant.messageStatus.success, detail: "Sửa đơn hàng thành công" });
        this.refresh();
        this.reSetPrimeShipment();
        setTimeout(() => {
          var txtShipmentnumber = $('#idShipmentNumber');
          txtShipmentnumber.select();
          txtShipmentnumber.focus();
        }, 0);
      }
    }
    this.data.pickingAddress = this.inputPickingAddress;
  }

  keyTabServiceDVGT(event) {
    this.messageService.clear();
    let value = event.target.value;
    if (!value) {
      this.bsModalRef.hide();
      setTimeout(() => {
        var txtServiceDVGT = $('#txtServiceDVGT');
        txtServiceDVGT.focus();
        txtServiceDVGT.select();
      }, 0);
    } else {
      if (value.length >= 2) {
        let find = this.serviceDVGTModels.find(f => f.label.toUpperCase().indexOf(value.toUpperCase()) >= 0);
        if (find) {
          this.selectedServiceDVGT = find.label;
          if (!this.filteredServiceDVGT.find(f => f == this.selectedServiceDVGT)) this.filteredServiceDVGT.push(this.selectedServiceDVGT);
          if (!this.data.priceDVGTs) this.data.priceDVGTs = [];
          let checkDVGT = this.data.priceDVGTs.find(f => f.serviceId == find.value);
          if (!checkDVGT) {
            this.priceDVGT = new PriceDVGT();
            this.priceDVGT.isAgree = false;
            this.priceDVGT.totalPrice = 0;
          } else {
            this.priceDVGT.isAgree = checkDVGT.isAgree;
            this.priceDVGT.totalPrice = checkDVGT.totalPrice;
          }
          this.priceDVGT.code = find.data.code;
          this.priceDVGT.name = find.data.name;
          this.priceDVGT.serviceId = find.data.id;
          this.priceDVGT.vSEOracleCode = find.data.vseOracleCode;
        } else {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Dịch vụ gia tăng không đúng` });
          setTimeout(() => {
            var atcServiceDVGT = $("#atcServiceDVGT input");
            atcServiceDVGT.focus();
            atcServiceDVGT.select();
          }, 0);
        }
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập dịch vụ gia tăng` });
        setTimeout(() => {
          var atcServiceDVGT = $('#atcServiceDVGT input');
          atcServiceDVGT.focus();
          atcServiceDVGT.select();
        }, 0);
      }
    }
  }

  keyTabChangePrice() {
    if (this.priceDVGT.isAgree == false) this.keyEnterSaveDVGT();
  }

  keyEnterSaveDVGT() {
    this.messageService.clear();
    if (!this.priceDVGT || !this.priceDVGT.serviceId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Chọn dịch vụ gia tăng!` })
      return;
    }
    let checkDVGT = this.data.priceDVGTs.find(f => f.serviceId == this.priceDVGT.serviceId);
    if (!checkDVGT) {
      this.data.priceDVGTs.push(this.clonePriceDVGT(this.priceDVGT));
      this.data.strServiceDVGTName = '';
      this.data.priceDVGTs.map((m, index) => {
        if ((index + 1) >= this.data.priceDVGTs.length) this.data.strServiceDVGTName += m.code;
        else this.data.strServiceDVGTName += m.code + ',';
      });
    } else {
      checkDVGT.isAgree = this.priceDVGT.isAgree;
      if (checkDVGT.isAgree == false) this.priceDVGT.totalPrice = 0;
      checkDVGT.totalPrice = this.priceDVGT.totalPrice;
    }
    this.priceDVGT = new PriceDVGT();
    this.selectedServiceDVGT = null;
    this.calculatePrice();
    setTimeout(() => {
      var atcServiceDVGT = $('#atcServiceDVGT input');
      atcServiceDVGT.focus();
      atcServiceDVGT.select();
    }, 0);
  }

  clonePriceDVGT(model: PriceDVGT): PriceDVGT {
    let data = new PriceDVGT();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  removeServiceDVGT(serviceId: any) {
    this.messageService.clear();
    if (!this.data.priceDVGTs) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Chưa chọn dịch vụ gia tăng!` });
      return;
    }
    let findIndex = this.data.priceDVGTs.findIndex(f => f.serviceId == serviceId);
    if (findIndex >= 0) {
      this.data.priceDVGTs.splice(findIndex, 1);
      this.data.strServiceDVGTName = '';
      this.data.priceDVGTs.map((m, index) => {
        if ((index + 1) >= this.data.priceDVGTs.length) this.data.strServiceDVGTName += m.code;
        else this.data.strServiceDVGTName += m.code + ',';
      });
      this.calculatePrice();
      this.messageService.add({ severity: Constant.messageStatus.success, detail: `Xóa DVGT thành công!` });
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Không tìm thấy dịch vụ gia tăng!` });
    }
  }

  async clickSaveChange() {
    this.clickTxtButton = this.buttonSaveChange;
    if (!this.isValidToCreate()) return;
    this.checkTotalPrice();
  }

  async saveShipment(): Promise<any> { // map dữ liệu để tạo hoặc update vận đơn
    // save OrderDate EndPickTimne ExpectedDeliveryTime
    this.saveTime();
    if (this.selectedShipmentType) this.data.typeId = this.selectedShipmentType.value;
    else this.data.typeId = ShipmentType.Normal;
    // save Sender
    this.senderPhone = InputValue.trimInput(this.senderPhone);
    this.data.senderPhone = this.senderPhone;
    if (this.inputShipmentNumber) this.data.shipmentNumber = this.inputShipmentNumber;
    this.senderName = InputValue.trimInput(this.senderName);
    this.data.senderName = this.senderName;
    if (this.senderCompany) {
      this.senderCompany = InputValue.trimInput(this.senderCompany);
      this.data.companyFrom = this.senderCompany;
    }
    if (this.selectedDepartment) {
      this.data.cusDepartmentId = this.selectedDepartment;
    }
    if (!this.data.totalBox)
      this.data.totalBox = 1;

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
    // if (this.receiverCompany) {
    //   this.receiverCompany = InputValue.trimInput(this.receiverCompany);
    //   this.data.companyTo = this.receiverCompany;
    // }
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
      if (this.selectedPaymentType === PaymentTypeHelper.NGTTN && !this.data.keepingTotalPriceHubId) {
        this.data.keepingTotalPriceEmpId = this.data.pickUserId;
      } else if (this.data.cod > 0 && this.selectedPaymentType === PaymentTypeHelper.NNTTN && !this.data.keepingCODHubId
        && this.data.shipmentStatusId == StatusHelper.deliveryComplete && this.data.deliverUserId) {
        this.data.keepingCODEmpId = this.data.deliverUserId;
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
    //
    if (!this.data.latFrom) this.data.latFrom = 0;
    if (!this.data.lngFrom) this.data.lngFrom = 0;
    if (!this.data.latTo) this.data.latTo = 0;
    if (!this.data.lngTo) this.data.lngTo = 0;
    return this.data;
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
    this.messageService.clear();
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
      this.receiverPhone = "0";
      // messages.push({
      //   severity: Constant.messageStatus.warn,
      //   detail: "Chưa nhập số điện thoại người nhận"
      // });
      // result = false;
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
    if (!this.data.toHubRoutingId) {
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

    if (!this.selectedService || !this.service) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn dịch vụ!"
      });
      result = false;
    }

    if (!this.data.weight || this.data.weight <= 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Thiếu trọng lượng!"
      });
      result = false;
    }

    if (!this.data.totalBox || this.data.totalBox <= 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Thiếu số kiện!"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    } else {
      result = this.checkAllowPayment();
      if (result == true) {
        result = this.checkDisCount();
      }
    }
    return result;
  }

  checkTotalPrice() {
    if (!this.data.totalPrice) {
      this.displayNoTotalPrice = true; // tổng cước bằng 0 => show cảnh báo
    } else {
      this.createShipmentNoTotalPrice();
    }
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

  setPaymentCODType() {
    if (!this.data.cod) this.data.cod = 0;
    if (this.data.cod > 0) {
      let typePayCODCode = 'NG';
      if (this.selectedPaymentType == 1) typePayCODCode = 'NN';
      let paymentCODType = this.paymentCODTypes.find(f => f.label.toUpperCase().indexOf(typePayCODCode) >= 0);
      if (paymentCODType) {
        this.paymentCODType = paymentCODType.label;
        if (!this.filteredPaymentCODTypes.find(f => f == this.paymentCODType)) this.filteredPaymentCODTypes.push(this.paymentCODType);
        this.data.paymentCODTypeId = paymentCODType.value;
      }
    }
    else if (this.data.cod == 0) {
      this.data.paymentCODTypeId = null;
      this.paymentCODType = '--';
    }
  }

  changeCOD() {
    this.setPaymentCODType();
    this.calculatePriceCOD();
  }

  changeDisCount() {
    if (this.checkDisCount() == true) this.calculatePrice();
  }

  checkDisCount() {
    this.messageService.clear();
    let senderPayment: number[] = [PaymentTypeHelper.NGTTN, PaymentTypeHelper.NGTTS];
    let receiverPayment: number[] = [PaymentTypeHelper.NNTTN, PaymentTypeHelper.NNTTS];
    let infoPayment: Customer;
    let nameSender: string;
    if (senderPayment.findIndex(f => f == this.selectedPaymentType) >= 0) {
      infoPayment = this.selectedCustomer;
      nameSender = `GỬI`;
    } else if (receiverPayment.findIndex(f => f == this.selectedPaymentType) >= 0) {
      infoPayment = this.selectedCustomerReceipt;
      nameSender = `NHẬN`;
    }
    if (infoPayment) {
      if (this.data.typeId == ShipmentType.Return) {
        if (this.data.disCount > 50) {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: `thông tin ${nameSender} chỉ đươc giảm giá tối đa 50%.` });
          setTimeout(() => {
            infoPayment.discount = 50;
            var txtdisCount = $('#txtDisCount');
            txtdisCount.select();
            txtdisCount.focus();
          }, 0);
          return false;
        }
      } else {
        if (this.data.disCount > infoPayment.discount) {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: `thông tin ${nameSender} Chỉ đươc giảm giá tối đa ${infoPayment.discount}%.` });
          setTimeout(() => {
            this.data.disCount = infoPayment.discount;
            var txtdisCount = $('#txtDisCount');
            txtdisCount.select();
            txtdisCount.focus();
          }, 0);
          return false;
        }
      }
    } else {
      if (this.data.typeId == ShipmentType.Return) {
        if (this.data.disCount > 50) {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: `thông tin ${nameSender} chỉ đươc giảm giá tối đa 50%.` });
          setTimeout(() => {
            var txtdisCount = $('#txtDisCount');
            txtdisCount.select();
            txtdisCount.focus();
          }, 0);
          return false;
        }
      } else {
        if (this.data.disCount && this.data.disCount > 0) {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Mã khách ${nameSender} trống - không được phép giảm giá.` });
          setTimeout(() => {
            var txtdisCount = $('#txtDisCount');
            txtdisCount.select();
            txtdisCount.focus();
          }, 0);
          return false;
        }
      }
    }
    return true;
  }

  async calculatePrice(isChangeService?: boolean) {
    this.usingPriceService = '';
    this.usingPriceServicePlus = '';
    if (!this.chargeWeight) {
      if (this.data.weight) {
        if (this.data.calWeight) {
          if (this.data.weight >= this.data.calWeight) this.chargeWeight = this.data.weight;
          else this.chargeWeight = this.data.calWeight;
        } else this.chargeWeight = this.data.weight;
      }
    }
    if (!this.data.priceDVGTs) this.data.priceDVGTs = [];
    if (this.data.cod) {
      let findService = this.serviceDVGTs.find(f => f.code.toUpperCase() == ServiceDVGTHelper.COD.toUpperCase())
      if (!this.data.priceDVGTs.find(f => f.serviceId == findService.id)) {
        let priceDVGT = new PriceDVGT();
        priceDVGT.serviceId = findService.id;
        priceDVGT.isAgree = false;
        priceDVGT.totalPrice = 0;
        priceDVGT.code = findService.code;
        priceDVGT.name = priceDVGT.name;
        this.data.priceDVGTs.push(priceDVGT);
        this.data.strServiceDVGTName = '';
        this.data.priceDVGTs.map((m, index) => {
          if ((index + 1) >= this.data.priceDVGTs.length) this.data.strServiceDVGTName += m.code;
          else this.data.strServiceDVGTName += m.code + ',';
        });
      }
    } else {
      let finIndex = this.data.priceDVGTs.findIndex(f => f.code == ServiceDVGTHelper.COD);
      if (finIndex >= 0) {
        this.data.priceDVGTs.splice(finIndex, 1);
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
      model.senderId = this.data.senderId;
      model.fromHubId = this.selectedFromHub;
      model.isAgreementPrice = this.isAgreementPrice;
      model.defaultPrice = this.data.defaultPrice;
      model.fromWardId = this.selectedFromWard;
      model.structureId = this.selectedStructure;
      model.otherPrice = this.data.otherPrice ? this.data.otherPrice : 0;
      model.distance = this.data.distance ? this.data.distance : 0;
      model.cod = this.data.cod ? this.data.cod : 0;
      model.insured = this.data.insured ? this.data.insured : 0;
      if ((this.selectedPaymentType == PaymentTypeHelper.NGTTN || this.selectedPaymentType == PaymentTypeHelper.NGTTS)
        && this.selectedCustomer) {
        model.senderId = this.selectedCustomer.id;
      } else if ((this.selectedPaymentType == PaymentTypeHelper.NNTTN || this.selectedPaymentType == PaymentTypeHelper.NNTTS)
        && this.selectedCustomerReceipt) {
        model.senderId = this.selectedCustomer.id;
      }
      model.disCount = this.data.disCount;
      model.serviceId = this.selectedService;
      model.toDistrictId = this.selectedToDistrict;
      model.weight = this.chargeWeight;
      model.isAgreementPrice = this.isAgreementPrice;
      model.priceReturn = this.data.priceReturn;
      model.defaultPrice = this.data.defaultPrice ? this.data.defaultPrice : 0;
      model.totalItem = this.data.totalItem ? this.data.totalItem : 0;
      model.serviceDVGTIds = this.data.serviceDVGTIds;
      model.priceDVGTs = this.data.priceDVGTs;
      // console.log(JSON.stringify(model));
      model.priceBox = this.data.boxes;
      model.calWeight = this.data.calWeight;
      model.toWardId = this.selectedToWard;
      model.totalBox = this.data.totalBox;
      model.isReturn = this.data.isReturn;
      let price = await this.priceService.calculateAsync(model);
      if (price) {
        this.resetPrice();
        this.dim = price.dim;
        if (isChangeService && this.data.boxes && this.data.boxes.length > 0 && (this.dim || this.dim == 0)) {
          this.reCalWeightAllBox();
        } else {
          // console.log(price);
          this.data.defaultPrice = price.defaultPrice;
          this.data.defaultPriceS = price.defaultPriceS;
          this.data.defaultPriceP = price.defaultPriceP;
          this.data.fuelPrice = price.fuelPrice;
          this.data.otherPrice = price.otherPrice;
          this.data.remoteAreasPrice = price.remoteAreasPrice;
          this.data.totalDVGT = price.totalDVGT;
          this.data.vatPrice = price.vatPrice;
          this.data.priceDVGTs = price.priceDVGTs;
          this.data.priceReturn = price.priceReturn;
          this.data.priceCOD = price.priceCOD;
          this.data.totalPriceSYS = price.totalPrice;
          this.data.totalPrice = price.totalPrice;
          this.data.deliveryDate = SearchDate.formatToISODate(price.deadlineDelivery);
          this.usingPriceService = price.priceService.code;
          price.priceDVGTs.map(x => {
            if (x.priceServiceCode) this.usingPriceServicePlus += x.priceServiceCode + ', ';
          });
          this.resetTotalCollect();
          if (price.priceDVGTs.length > 0) {
            this.isEditPriceDVGT = true;
          }
          else {
            this.isEditPriceDVGT = false;
          }
        }
      }
    } else {
      this.resetPrice();
    }
  }


  async calculatePriceCOD() {
    this.usingPriceServicePlus = '';
    if (!this.chargeWeight) {
      if (this.data.weight) {
        if (this.data.calWeight) {
          if (this.data.weight >= this.data.calWeight) this.chargeWeight = this.data.weight;
          else this.chargeWeight = this.data.calWeight;
        } else this.chargeWeight = this.data.weight;
      }
    }
    if (!this.data.priceDVGTs) this.data.priceDVGTs = [];
    if (this.data.cod) {
      let findService = this.serviceDVGTs.find(f => f.code.toUpperCase() == ServiceDVGTHelper.COD.toUpperCase())
      if (findService && !this.data.priceDVGTs.find(f => f.serviceId == findService.id)) {
        let priceDVGT = new PriceDVGT();
        priceDVGT.serviceId = findService.id;
        priceDVGT.isAgree = false;
        priceDVGT.code = findService.code;
        priceDVGT.name = priceDVGT.name;
        priceDVGT.totalPrice = 0;
        this.data.priceDVGTs.push(priceDVGT);
        this.data.strServiceDVGTName = '';
        this.data.priceDVGTs.map((m, index) => {
          if ((index + 1) >= this.data.priceDVGTs.length) this.data.strServiceDVGTName += m.code;
          else this.data.strServiceDVGTName += m.code + ',';
        });
      }
    } else {
      let finIndex = this.data.priceDVGTs.findIndex(f => f.code.toUpperCase() == ServiceDVGTHelper.COD.toUpperCase());
      if (finIndex >= 0) {
        this.data.priceDVGTs.splice(finIndex, 1);
      }
    }
    // tạo vận đơn bình thường hoặc vd liên quan
    if (
      this.selectedFromDistrict &&
      // this.selectedCustomer &&
      this.selectedService &&
      this.selectedToDistrict &&
      this.data.cod &&
      (this.selectedFromWard || this.selectedFromDistrict) &&
      this.chargeWeight
    ) {
      let model: ShipmentCalculateViewModel = new ShipmentCalculateViewModel();
      if (this.selectedFromDistrict) {
        model.fromDistrictId = this.selectedFromDistrict;
      }
      if (this.data.endPickTime) model.orderDate = this.data.endPickTime;
      if (model.orderDate && this.data.orderDate) model.orderDate = this.data.orderDate;
      model.senderId = this.data.senderId;
      model.fromHubId = this.selectedFromHub;
      model.isAgreementPrice = this.isAgreementPrice;
      model.defaultPrice = this.data.defaultPrice;
      model.fromWardId = this.selectedFromWard;
      model.structureId = this.selectedStructure;
      model.otherPrice = this.data.otherPrice ? this.data.otherPrice : 0;
      model.cod = this.data.cod ? this.data.cod : 0;
      model.insured = this.data.insured ? this.data.insured : 0;
      model.distance = this.data.distance ? this.data.distance : 0;
      if ((this.selectedPaymentType == PaymentTypeHelper.NGTTN || this.selectedPaymentType == PaymentTypeHelper.NGTTS)
        && this.selectedCustomer) {
        model.senderId = this.selectedCustomer.id;
      } else if ((this.selectedPaymentType == PaymentTypeHelper.NNTTN || this.selectedPaymentType == PaymentTypeHelper.NNTTS)
        && this.selectedCustomerReceipt) {
        model.senderId = this.selectedCustomer.id;
      }
      model.disCount = this.data.disCount;
      model.serviceId = this.selectedService;
      model.toDistrictId = this.selectedToDistrict;
      model.weight = this.chargeWeight;
      model.isAgreementPrice = this.isAgreementPrice;
      model.priceReturn = this.data.priceReturn;
      model.defaultPrice = this.data.defaultPrice ? this.data.defaultPrice : 0;
      model.totalItem = this.data.totalItem ? this.data.totalItem : 0;
      model.serviceDVGTIds = this.data.serviceDVGTIds;
      model.priceDVGTs = this.data.priceDVGTs;

      // console.log(JSON.stringify(model));
      model.priceBox = this.data.boxes;
      model.calWeight = this.data.calWeight;
      model.toWardId = this.selectedToWard;
      model.totalBox = this.data.totalBox;
      let price = await this.priceService.calculateAsync(model);
      if (price) {
        this.data.priceCOD = 0;
        // console.log(price);
        this.data.priceCOD = price.priceCOD;
        this.resetTotalCollect();
        price.priceDVGTs.map(x => {
          if (x.priceServiceCode) this.usingPriceServicePlus += x.priceServiceCode + ', ';
        });
        if (price.priceDVGTs.length > 0) {
          this.isEditPriceDVGT = true;
        }
        else {
          this.isEditPriceDVGT = false;
        }
      }
    } else {
      this.data.priceCOD = 0;
      this.resetTotalCollect();
    }
  }

  resetTotalCollect() {
    this.totalCollect = 0;
    if (!this.data.paymentCODTypeId) {
      if (this.data.paymentTypeId == PaymentTypeHelper.NNTTN) this.data.paymentCODTypeId = 2;
      else this.data.paymentCODTypeId = 1;
      //      
      let fLabel = this.paymentCODTypes.find(f => f.value == this.data.paymentCODTypeId);
      if (fLabel) this.paymentCODType = fLabel.label;
    } else {
      if (!this.paymentCODType || this.paymentCODType == '---') {
        let fLabel = this.paymentCODTypes.find(f => f.value == this.data.paymentCODTypeId);
        if (fLabel) this.paymentCODType = fLabel.label;
      }
    }
    if (this.data.cod) this.totalCollect += parseFloat(this.data.cod.toString());
    if (this.data.paymentCODTypeId == 2 && this.data.cod && this.data.priceCOD) this.totalCollect += parseFloat(this.data.priceCOD.toString());
    if (this.selectedPaymentType == PaymentTypeHelper.NNTTN && this.data.totalPrice) this.totalCollect += parseFloat(this.data.totalPrice.toString());
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

  onSelectTabOne() {
    this.isActiveTabOne = true;
  }

  loadLazy(event: LazyLoadEvent) {
    this.event = event;
    setTimeout(() => {
      if (this.datasource) {
        this.filterRows = this.datasource;
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

  // edit shipment
  async onDetailShipment() {
    this.messageService.clear();
    this.isUpdateShipmentWhite = false;
    if (this.inputShipmentNumber) {
      // get Shipment by shipmentNumber
      let includes = [
        Constant.classes.includes.shipment.fromHubRouting,
        Constant.classes.includes.shipment.shipmentStatus,
        Constant.classes.includes.shipment.service,
        Constant.classes.includes.shipment.fromHub,
        Constant.classes.includes.shipment.toHub,
        Constant.classes.includes.shipment.toHubRouting,
        Constant.classes.includes.shipment.pickUser,
        Constant.classes.includes.shipment.fromWard,
        Constant.classes.includes.shipment.toWard,
        Constant.classes.includes.shipment.fromDistrict,
        Constant.classes.includes.shipment.fromProvince,
        Constant.classes.includes.shipment.toDistrict,
        Constant.classes.includes.shipment.toProvince,
        Constant.classes.includes.shipment.deliverUser,
        Constant.classes.includes.shipment.paymentType,
        Constant.classes.includes.shipment.sender,
        Constant.classes.includes.shipment.structure,
        Constant.classes.includes.shipment.serviceDVGT,
        Constant.classes.includes.shipment.boxes,
        Constant.classes.includes.shipment.businessUser,
        Constant.classes.includes.shipment.receiver,
        Constant.classes.includes.shipment.parrentShipment
      ];
      this.shipmentService.getShipmentByCodeAsync(this.inputShipmentNumber, includes).then(
        xShipment => {
          if (xShipment.isSuccess == false || !xShipment.data || xShipment.data.length === 0) {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vận đơn mới.` });
            this.resetInputDataNotSender();
            return;
          }
          let shipment = xShipment.data[0];
          if (!shipment) {
            this.resetInputDataNotSender();
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Tạo vận đơn mới.` });
          } else {
            this.resetData();
            this.isEditLS = true;
            if (!shipment.toProvinceId) this.isUpdateShipmentWhite = true;
            this.shopCode = shipment.shopCode;
            this.requestShipmentCode = shipment.requestShipment ? shipment.requestShipment.shipmentNumber : null;
            this.requestShipmentId = shipment.requestShipmentId;
            this.cloneRowDataShipment = Object.assign({}, shipment);
            // show checkBox đổi địa chỉ ShippingAddress
            if (shipment.businessUser) {
              this.busenissUserCode = shipment.businessUser.code;
            }
            if (shipment.pickUser) {
              this.pickUsers = [];
              this.pickupUserCode = shipment.pickUser.code;
              this.pickUserSelected = `${shipment.pickUser.code} ${shipment.pickUser.fullName}`;
              this.pickUsers.push({ value: shipment.pickUser.id, label: this.pickUserSelected, data: shipment.pickUser })
            } else {
              this.pickUsers = [];
              this.pickupUserCode = "";
              this.pickUserSelected = "";
            }
            if (shipment.sender) {
              let label = `${shipment.sender.code}`;
              this.customers.push({ value: shipment.sender.id, label: label });
              this.filteredCustomers.push(label);
              this.customer = label;
              this.selectedCustomer = shipment.sender;
            }
            if (shipment.receiver) {
              let label = `${shipment.receiver.code}`;
              this.customerReceipt = label;
            }
            if (shipment.structure) {
              let label = `${shipment.structure.code} - ${shipment.structure.name}`;
              this.filteredStructures.push(label);
              this.selectedStructure = shipment.structure.id;
              this.structure = label;
            }
            if (shipment.service) {
              let label = `${shipment.service.code} - ${shipment.service.name}`;
              this.filteredServices.push(label);
              this.selectedService = shipment.service.id;
              this.service = label;
            }
            this.filteredReceiverPhones.push(shipment.receiverPhone);
            if (shipment.orderDate) shipment.orderDate = new Date(shipment.orderDate);
            this.data = shipment;
            // this.searchFromControl.disable();
            // load shipment
            const typeShipment = this.shipmentTypes.find(x => x.value == shipment.typeId);
            if (typeShipment) {
              this.selectedShipmentType = typeShipment;
            } else {
              this.selectedShipmentType = this.shipmentTypes[0];
            }
            this.selectedFromHub = shipment.fromHubId;
            this.inputShipmentNumber = shipment.shipmentNumber;
            if (shipment.parrentShipment) this.scanShipmentNumber = shipment.parrentShipment.shipmentNumber;
            // load sender
            if (this.cloneRowDataShipment) {
              this.selectedPaymentType = this.cloneRowDataShipment.paymentTypeId;
              const findPaymentType = this.paymentTypes.find(x => x.value == this.cloneRowDataShipment.paymentTypeId);
              if (findPaymentType) {
                this.paymentType = findPaymentType.label;
              }
            }
            this.senderPhone = shipment.senderPhone;
            this.senderName = shipment.senderName;
            this.senderCompany = shipment.companyFrom;
            this.searchFromControl.setValue(shipment.pickingAddress);
            // load fromHub, fromWard
            this.selectedFromProvince = shipment.fromProvinceId;
            let dataFP = this.fromProvinces.find(x => x.value == this.selectedFromProvince);
            if (dataFP) {
              this.fromProvince = dataFP.label;
            }
            if (this.selectedFromProvince) {
              this.loadFromDistrict(shipment.fromDistrictId);
              this.loadFromWard(shipment.fromDistrictId, shipment.fromWardId);
            } else {
              this.selectedFromDistrict = shipment.fromDistrictId;
              this.selectedFromWard = shipment.fromWardId;
            }
            // load reicever
            this.receiverPhone = shipment.receiverPhone;
            this.receiverName = shipment.receiverName;
            this.receiverCompany = shipment.companyTo;
            this.searchToControl.setValue(shipment.shippingAddress);
            // load toHub, toWard
            this.selectedToProvince = shipment.toProvinceId;
            let data = this.toProvinces.find(x => x.value == this.selectedToProvince);
            if (data) {
              this.toProvince = data.label;
            }
            if (shipment.toHub) {
              this.toInfoHub = shipment.toHub;
            }
            if (this.selectedToProvince) {
              this.loadToDistrict(shipment.toDistrictId);
              this.loadToWard(shipment.toDistrictId, shipment.toWardId);
            } else {
              this.selectedToDistrict = shipment.toDistrictId;
            }
            //
            this.boxService.getByShipmentId(this.data.id).subscribe(
              x => {
                if (x.isSuccess) {
                  this.data.boxes = x.data as Boxes[];
                } else {
                  this.data.boxes = [];
                }
              }
            )
            //
            this.isAgreementPrice = this.cloneRowDataShipment.isAgreementPrice;
            // load serviceDVGT
            this.loadServiceDVGTLS(this.data.id);
            this.resetTotalCollect();
            this.viewInfoDelivery();
          }
        }
      );
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

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }

  onChangeReview() {
    if (this.reviewChecked) {
      this.datasource = this.selectedData;
    }
    else {
      this.datasource = this.listData;
    }
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
    if (this.selectedShipmentType) this.data.typeId = this.selectedShipmentType.value;
    if (this.data.typeId == ShipmentType.Return) {
      this.data.disCount = 50;
    } else {
      if (!this.data.disCount) this.data.disCount = 0;
    }
    if (this.data.typeId == ShipmentType.Normal)
      this.data.priceReturn = 0;
    // this.resetData();
  }
  setFocusShipmentNumberRef() {
    setTimeout(() => {
      let txtRef = $('#txtShipmentNumberSupport');
      txtRef.select();
      txtRef.focus();
    }, 0);
  }

  async scanAndCreateShipmentNumber(txtShipmentNumber: any) {
    this.data.typeId = this.selectedShipmentType.value;
    this.inputShipmentNumber = null;
    const shipmentNumber = txtShipmentNumber.value.trim();
    if (!shipmentNumber || shipmentNumber == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Vui lòng nhập mã vận đơn!",
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      txtShipmentNumber.value = null;
      this.setFocusShipmentNumberRef();
      return;
    }
    let includes = [];
    includes.push(Constant.classes.includes.shipment.sender);
    const shipment = await this.shipmentService.trackingShortAsync(shipmentNumber, includes);
    if (!shipment) {
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.isExistParentShipment = false;
      txtShipmentNumber.value = null;
      this.setFocusShipmentNumberRef();
      this.refresh();
    } else {
      if (shipment.isCreatedChild == true) {
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
        this.messageService.add({
          severity: Constant.messageStatus.warn, detail: "Vận đơn đã được sử dụng trước đó, không được sử dụng lại!",
        });
        this.setFocusShipmentNumberRef();
        return;
      }
      if (this.data.typeId == ShipmentType.Return) {
        if (shipment.shipmentStatusId == StatusHelper.deliveryComplete) {
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.messageService.add({
            severity: Constant.messageStatus.warn, detail: "Vận đơn đã giao thành công, không được chuyển hoàn!",
          });
          this.setFocusShipmentNumberRef();
          return;
        } else if (shipment.isReturn != true) {
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.messageService.add({
            severity: Constant.messageStatus.warn, detail: "Vận đơn chưa xác nhận chuyển hoàn, không được sử dụng!",
          });
          this.setFocusShipmentNumberRef();
          return;
        } else if (shipment.shipmentStatusId == StatusHelper.deliveryComplete) {
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.messageService.add({
            severity: Constant.messageStatus.success, detail: "Đã giao hàng thành công, không được tạo chuyển hoàn!",
          });
          this.setFocusShipmentNumberRef();
          return;
        }
      } else if (this.data.typeId === ShipmentType.Related) {
        if (this.data.shipmentStatusId == StatusHelper.deliveryComplete) {
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.messageService.add({
            severity: Constant.messageStatus.success, detail: "Đã giao hàng thành công, không được tạo liên quan!",
          });
          this.setFocusShipmentNumberRef();
          return;
        } else if (shipment.isReturn == true) {
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.messageService.add({
            severity: Constant.messageStatus.warn, detail: "Vận đơn chuyển hoàn không được tạo vận đơn liên quan!",
          });
          this.setFocusShipmentNumberRef();
          return;
        }
      } else if (this.data.typeId === ShipmentType.ReturnDOC) {
        if (shipment.shipmentStatusId !== StatusHelper.deliveryComplete) {
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.messageService.add({
            severity: Constant.messageStatus.warn, detail: "Chưa giao thành công, không được tạo chuyển hoàn chứng từ!",
          });
          this.setFocusShipmentNumberRef();
          return;
        }
      }
      // vận đơn lien quan - chuyển hoàn - chuyển hoàn chứng từ
      if (shipment) {
        this.messageService.add({
          severity: Constant.messageStatus.success, detail: "Quét vận đơn thành công!",
        });
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
        //
        this.cloneShipment = null;
        this.cloneShipment = Object.assign({}, shipment);
        this.data.shipmentId = this.cloneShipment.id;
        this.data.orderDate = this.currentTime;
        this.authService.getAccountInfoAsync().then(
          xUser => {
            if (!xUser) {
              this.messageService.add({
                severity: Constant.messageStatus.success, detail: "Không tìm thấy thông tin nhân viên!",
              });
              return;
            }
            if (!xUser.hub) {
              this.messageService.add({
                severity: Constant.messageStatus.success, detail: "Thông tin nhân viên đang đăng nhập lỗi!",
              });
              return;
            }
            // reverse sender, receiver
            if (this.data.typeId == ShipmentType.Return || this.data.typeId == ShipmentType.ReturnDOC) {
              // load info sender
              if (xUser.hub && this.cloneShipment.sender) {
                //load sender         
                this.selectedCustomer = this.cloneShipment.sender;
                this.customer = `${this.selectedCustomer.code} ${this.selectedCustomer.name}`;
                this.senderName = this.selectedCustomer.name;
                this.senderPhone = this.selectedCustomer.phoneNumber;
                this.senderCompany = this.selectedCustomer.companyName;
                this.data.senderId = this.selectedCustomer.id;
                //
                let infoHub = xUser.hub;
                this.data.addressNoteFrom = '';
                this.data.pickingAddress = infoHub.address;
                this.inputPickingAddress = infoHub.address;
                this.selectedFromProvince = infoHub.provinceId;
                this.selectedFromDistrict = infoHub.districtId;
                this.selectedFromWard = infoHub.wardId;
                this.selectedFromHub = infoHub.id;
                this.data.fromHubId = infoHub.id;
                this.loadInfoSenderByHub(false, infoHub);
                //
                this.receiverPhone = this.cloneShipment.senderPhone;
                this.receiverName = this.cloneShipment.senderName;
                this.data.addressNoteTo = this.cloneShipment.addressNoteFrom;
                this.receiverCompany = this.cloneShipment.companyFrom;
                this.data.shippingAddress = this.cloneShipment.pickingAddress;
                this.searchToControl.setValue(this.cloneShipment.pickingAddress);
                this.selectedToProvince = this.cloneShipment.fromProvinceId;
                this.selectedToDistrict = this.cloneShipment.fromDistrictId;
                this.selectedToWard = this.cloneShipment.fromWardId;
                this.toHub = this.cloneShipment.fromHub ? this.cloneShipment.fromHub.name : "";
                this.selectedToHub = this.cloneShipment.fromHubId;
                this.data.toHubId = this.cloneShipment.fromHubId;
                this.data.toHubRoutingId = this.cloneShipment.fromHubRoutingId;
                this.data.latTo = this.cloneShipment.latFrom;
                this.data.lngTo = this.cloneShipment.lngFrom;
                this.data.weight = this.cloneShipment.weight;
                this.data.totalBox = this.cloneShipment.totalBox;
                this.chargeWeight = this.cloneShipment.weight;
                this.data.calWeight = this.cloneShipment.calWeight;
                this.loadInfoReceiver();
                if (this.cloneShipment.calWeight > this.cloneShipment.weight) this.chargeWeight = this.cloneShipment.calWeight;
                this.data.cod = this.cloneShipment.cod;
                this.data.insured = this.cloneShipment.insured;
                if (this.data.typeId == ShipmentType.Return) {
                  this.data.serviceId = this.cloneShipment.serviceId;
                  if (this.cloneShipment.paymentTypeId == PaymentTypeHelper.NNTTN) this.data.priceReturn = this.cloneShipment.totalPrice;
                } else if (this.data.typeId == ShipmentType.ReturnDOC) {
                  this.data.weight = 0.05;
                  this.data.totalBox = 1;
                  this.chargeWeight = this.data.weight;
                  this.data.calWeight = 0;
                  this.data.cod = 0;
                  this.data.insured = 0;
                }
                setTimeout(() => {
                  this.calculatePrice();
                }, 0);
              } else {
                this.messageService.add({
                  severity: Constant.messageStatus.success, detail: "Không tìm thấy khách hàng gửi, vui lòng kiểm tra lại!",
                });
                return;
              }
            } else if (this.data.typeId == ShipmentType.Related) {
              let getSender = shipment.sender;
              this.receiverPhone = this.cloneShipment.receiverPhone;
              this.receiverName = this.cloneShipment.receiverName;
              this.receiverCompany = this.cloneShipment.companyTo;
              this.toHub = this.cloneShipment.toHub ? this.cloneShipment.toHub.name : "";
              this.data.latTo = this.cloneShipment.latTo;
              this.data.lngTo = this.cloneShipment.lngTo;
              this.data.weight = this.cloneShipment.weight;
              this.data.totalBox = this.cloneShipment.totalBox;
              this.chargeWeight = this.cloneShipment.weight;
              this.data.calWeight = this.cloneShipment.calWeight;
              this.data.cod = this.cloneShipment.cod;
              this.data.insured = this.cloneShipment.insured;
              if (this.cloneShipment.calWeight > this.cloneShipment.weight) this.chargeWeight = this.cloneShipment.calWeight;
              if (this.cloneShipment.paymentTypeId == PaymentTypeHelper.NNTTN) this.data.priceReturn = this.cloneShipment.totalPrice;
              if (getSender) {
                this.selectedCustomer = getSender;
                this.customer = `${getSender.code}`;
                this.senderName = this.cloneShipment.senderName;
                this.senderPhone = this.cloneShipment.senderPhone;
                this.senderCompany = this.cloneShipment.companyFrom;
                this.data.senderId = this.selectedCustomer.id;
                //
                let infoHub = xUser.hub;
                this.data.addressNoteFrom = '';
                this.data.pickingAddress = infoHub.address;
                this.inputPickingAddress = infoHub.address;
                this.selectedFromProvince = infoHub.provinceId;
                this.selectedFromDistrict = infoHub.districtId;
                this.selectedFromWard = infoHub.wardId;
                this.selectedFromHub = infoHub.id;
                this.data.fromHubId = infoHub.id;
                this.loadInfoSender(false, this.customer);
              } else {
                this.selectedCustomer = null;
                this.customer = ``;
                this.data.senderId = null;
                this.messageService.add({
                  severity: Constant.messageStatus.warn, detail: "Không tìm thấy khách gửi!",
                });
              }
            }
            // reset some values
            // this.data.paymentTypeId = PaymentTypeHelper.NGTTS;
          }
        );
      }
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
}

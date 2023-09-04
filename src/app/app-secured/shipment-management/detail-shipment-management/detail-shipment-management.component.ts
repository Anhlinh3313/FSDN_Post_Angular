import {
  Component,
  ElementRef,
  ViewChild,
  NgZone
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { SelectItem } from "primeng/primeng";
import { Shipment } from "../../../models/shipment.model";
import { LadingSchesule, Service } from "../../../models/index";

import {
  ShipmentService,
  UserService,
  CustomerService,
  ProvinceService,
  WardService,
  DistrictService,
  HubService,
  PaymentTypeService,
  PackTypeService,
  SizeService,
  ServiceDVGTService,
  StructureService,
  PriceService,
  BoxService,
  ShipmentVersionService,
  CustomerInfoLogService,
  ServiceService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import {
  User,
  Customer,
  Province,
  District,
  Ward,
  Hub,
  ServiceDVGT,
  Size,
  Price
} from "../../../models/index";
import {
  ShipmentCalculateViewModel
} from "../../../view-model/index";
import { FormControl, FormGroup } from "@angular/forms";
import { GMapHelper } from "../../../infrastructure/gmap.helper";
import { MapsAPILoader } from "@agm/core";
import { PackType } from "../../../models/packType.model";

//
import { Boxes } from "../../../models/boxes.model";
import { DetailShipmentVersionComponent } from "./detail-shipment-version/detail-shipment-version.component";
import { ShipmentVersion } from "../../../models/shipmentVersion.model";
import { ListCustomerTypeIdHelper } from "../../../infrastructure/listCustomerTypeIdHelper";
import { PaymentTypeHelper } from "../../../infrastructure/paymentType.helper";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { SearchCusstomerHelper } from "../../../infrastructure/searchCustomer.helper";
import { CustomerInfoLog } from "../../../models/customerInfoLog.model";
import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { CustomerHelper } from "../../../infrastructure/customer.helper";
import { HubHelper } from "../../../infrastructure/hub.helper";
import { KeyCodeUtil } from "../../../infrastructure/keyCode.util";
import { DeadlinePickupDelivery } from "../../../models/deadlinePickupDelivery.model";
import { DeadlinePickupDeliveryService } from "../../../services/deadlinePickupDelivery.service";
import { ServiceHelper } from "../../../infrastructure/service.helper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
type AOA = Array<Array<any>>;

function s2ab(s: string): ArrayBuffer {
  const buf: ArrayBuffer = new ArrayBuffer(s.length);
  const view: Uint8Array = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

declare var jQuery: any;

@Component({
  selector: "detail-shipment-management",
  templateUrl: "detail-shipment-management.component.html",
  styles: [
    `
  agm-map {
    height: 200px;
  }
`
  ]
})
export class DetailShipmentManagementComponent extends BaseComponent {
  unit = environment.unit;
  isPaidPrice: boolean;
  isChangeExpectedDeliveryTime: boolean;
  isChangeOrderDate: boolean;
  IsChangeAgreementPrice: boolean;
  isAgreementPrice: boolean = false;
  isViewToLocation: boolean;
  shipmentDataVersion: Shipment;
  serviceName: string;
  loadSelectExpectedDeliveryTime: boolean;
  eventExpectedDeliveryTime: any;
  cloneExpectedDeliveryTime: Date;
  colorExpectedDeliveryTime: string;
  fromHubId: number;
  toHubId: number;
  cloneTotalSelectedCountSK: number;
  totalChargeWeightBoxes: number = 0;
  isCreatedBox: boolean;
  currentTime: Date;
  generalInfo: GeneralInfoModel;
  checkSubmitPrintCode: boolean;
  checkSubmitPrintSection: boolean;
  cloneInputShipmentNumber: any;
  inputShipmentNumber: string;
  msgService: string;
  filteredServices: any;
  filteredPaymentTypes: any;
  filteredStructures: any;
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
  filteredCustomers: any[];
  checkSubmit: any;
  cloneFromWardName: string;
  cloneFromDistrictName: string;
  cloneFromProviceName: string;
  cloneToWardName: string;
  cloneToDistrictName: string;
  cloneToProviceName: string;
  cloneTotalBox: Boxes[];
  objSizes: Size[];
  objSelectesServiceDVGTs: any[];
  shipmentStructure: any[];
  shipmentServiceName: any[];
  shipmentPayment: any;
  objPayments: any;
  shipmentSenderCode: any;
  objCustomers: any;
  shipmentFromHub: any;
  shipmentToHub: any;
  objToStationHubs: any;
  objToPoHubs: any;
  objFromStationHubs: any;
  objFromPoHubs: any;
  objToCenterHubs: any;
  objFromCenterHubs: any;
  createdDataShipment: Shipment;
  itemShipment: any = [];
  generatorBarcode: string;
  filteredSenderPhones: any[];
  filteredSenderNames: any[];
  filteredSenderCompanies: any[];
  filteredReceiverPhones: any[];
  filteredReceiverNames: any[];
  filteredReceiverCompanies: any[];
  senderPhone: any;
  senderName: any;
  senderCompany: any;
  receiverPhone: any;
  receiverName: any;
  receiverCompany: any;
  sender: any;
  customer: any;
  employee: any;
  pickupUser: any;
  fromProvince: any;
  fromDistrict: any;
  fromWard: any;
  fromCenterHub: any;
  fromPoHub: any;
  fromStationHub: any;
  fromHub: any;
  fromLocation: string = "none";
  toProvince: any;
  toDistrict: any;
  toWard: any;
  toCenterHub: any;
  toPoHub: any;
  toStationHub: any;
  toHub: any;
  toLocation: string = "none";
  structure: any;
  paymentType: any;
  service: any;
  chargeWeight: number;
  detectDeleteBox: boolean = false;
  form: FormGroup;
  checkSender: any;
  saveShipmentData: Shipment;
  cloneShipmentData: Shipment;
  showItemShipment: any;
  shipmentVersions: ShipmentVersion[];
  cloneWardName: string;
  cloneDistrictName: string;
  cloneProviceName: string;
  cloneNewEditBoxes: Boxes[];
  selectedDeleteBoxes: Boxes[];
  newEditBoxes: Boxes[];
  arrServiceDVGTs: number[] = [];
  arrObjServiceDVGTs: ServiceDVGT[] = [];
  arrObjBoxes: Boxes[] = [];
  shipmentData: Shipment = new Shipment();
  shipmentLadingSchedule: LadingSchesule[] = [];
  constructor(
    public bsModalRef: BsModalRef,
    public bsModalRefVersion: BsModalRef,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    // private requestShipmentService: RequestShipmentService,
    private modalService: BsModalService,
    private userService: UserService,
    private customerInfoLogService: CustomerInfoLogService,
    private customerService: CustomerService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private wardService: WardService,
    private paymentTypeService: PaymentTypeService,
    private serviceDVGTService: ServiceDVGTService,
    private serviceService: ServiceService,
    private boxService: BoxService,
    private packTypeService: PackTypeService,
    private sizeService: SizeService,
    private structureService: StructureService,
    private priceService: PriceService,
    private hubService: HubService,
    private mapsAPILoader: MapsAPILoader,
    private shipmentVersionService: ShipmentVersionService,
    private deadlinePickupDeliveryService: DeadlinePickupDeliveryService,
    private ngZone: NgZone, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }

  //
  isNew: boolean;

  //
  customers: SelectItem[];
  selectedCustomer: Customer;
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
  toDistricts: SelectItem[];
  selectedToDistrict: number;
  toWards: SelectItem[];
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
  paymentTypes: SelectItem[];
  selectedPaymentType: number;
  //
  structures: SelectItem[];
  selectedStructure: number;
  //
  services: SelectItem[];
  selectedService: number;
  //
  serviceDVGTs: Service[];
  selectedServiceDVGTs: number[];
  //
  packTypes: SelectItem[];
  selectedPackType: number;
  //
  sizes: SelectItem[];
  selectedSize: number;
  //
  fromHubs: SelectItem[];
  selectedFromHub: number;
  //
  toHubs: SelectItem[];
  selectedToHub: number;
  //
  customerInfoLogs: CustomerInfoLog[];
  selectedCustomerInfoLogs: CustomerInfoLog;

  selectedContent: string;
  selectedWeight: number;
  selectedLength: number;
  selectedWidth: number;
  selectedHeight: number;
  selectedCalWeight: number;
  selectedCountSK: number;
  totalSelectedCountSK: number;

  boxes: Boxes[] = [];
  totalBoxes: Boxes[] = [];
  seletedItemBox: Boxes;
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

  //

  //
  datasource: Shipment[];
  totalRecords: number;
  selectedData: Shipment;
  listData: Shipment[];
  rowPerPage: number = 20;

  //
  public singlePickerOrderDate = {
    singleDatePicker: true,
    "timePicker": true,
    showDropdowns: true,
    opens: "left"
  };

  //
  public singlePickerExpectedDeliveryTime = {
    singleDatePicker: true,
    "timePicker": true,
    showDropdowns: true,
    opens: "left",
    startDate: this.shipmentData.expectedDeliveryTime
  };

  ngOnInit() {
    this.initMap();
    // this.initData();
    this.loadCustomer();
    this.loadCustomerInfoLog();
    this.loadProvince();
    this.loadCenterHub();
    this.loadPaymentType();
    this.loadStructure();
    this.loadServiceDVGT();
    this.loadPackType();
    this.loadSize();
    this.loadService();
    this.detectFormControl();
    this.currentTime = new Date();
  }

  detectFormControl() {
    this.form = new FormGroup({
      orderDate: new FormControl,
      expectedDeliveryTime: new FormControl,
      senderName: new FormControl,
      senderPhone: new FormControl,
      addressNoteFrom: new FormControl,
      companyFrom: new FormControl,
      receiverName: new FormControl,
      receiverPhone: new FormControl,
      fselectedPickupUser: new FormControl({value: '', disabled: false}),
      fselectedEmployee: new FormControl,
      addressNoteTo: new FormControl,
      companyTo: new FormControl,
      searchToControl: new FormControl,
      weight: new FormControl,
      totalBox: new FormControl,
      cod: new FormControl,
      insured: new FormControl,
      otherPrice: new FormControl,
      content: new FormControl,
      cusNote: new FormControl,
      fselectedPaymentType: new FormControl({value: '', disabled: false}),
      fselectedStructure: new FormControl,
      fselectedService: new FormControl,
      fselectedServiceDVGTs: new FormControl,
      fselectedPackType: new FormControl,
      fselectedSize: new FormControl,
      fselectedContent: new FormControl,
      fselectedWeight: new FormControl,
      fselectedLength: new FormControl,
      fselectedWidth: new FormControl,
      fselectedHeight: new FormControl,
      fselectedCountSK: new FormControl,
      fdeleteItemBox: new FormControl,
   });
  }

  initData() {
    // this.shipmentData = new Shipment();
    // this.selectedFromCenterHub = null;
    // this.shipmentData.orderDate = new Date();


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
    // includes.push(Constant.classes.includes.shipment.sender);
    // includes.push(Constant.classes.includes.shipment.structure);
    // includes.push(Constant.classes.includes.shipment.serviceDVGT);
    // includes.push(Constant.classes.includes.shipment.boxes);
    // // includes.push(Constant.classes.includes.shipment.companyFrom);
    // // includes.push(Constant.classes.includes.shipment.companyTo);
    // this.shipmentService
    // .getByType(ShipmentTypeHelper.historyPickup, includes)
    // .subscribe(x => {
    //   this.datasource = x.data as Shipment[];
    //   this.totalRecords = this.datasource.length;
    //   this.listData = this.datasource.slice(0, this.rowPerPage);
    // });

    // this.selectedData = null;
    // this.isNew = true;
  }

  resetData() {
    this.shipmentData = new Shipment();
    this.shipmentData.orderDate = new Date();
    this.searchFromControl.setValue(null);
    this.searchToControl.setValue(null);
    this.selectedEmployee = null;
    this.selectedCustomer = null;
    this.selectedPaymentType = null;
    this.selectedService = null;
    this.selectedStructure = null;
    this.selectedPackType = null;
    this.selectedSize = null;
    this.selectedServiceDVGTs = [];
    this.resetFromLocationData();
    this.resetToLocationData();
  }

  async loadData(shipment: Shipment) {
    // save version;
    this.shipmentDataVersion = { ...shipment };
    this.shipmentData = shipment;
    // this.shipmentLadingSchedule = this.shipmentData.ladingSchedules;
    this.selectedFromCenterHub = null;
    this.selectedData = shipment;
 
    // load expectedDeliveryTime
    this.singlePickerExpectedDeliveryTime.startDate = new Date(
      this.shipmentData.expectedDeliveryTime
    );
    this.colorExpectedDeliveryTime = "text-blue";

    if (this.shipmentData) {
      this.searchFromControl.setValue(shipment.pickingAddress);
      this.searchToControl.setValue(shipment.shippingAddress);

      //load customer
      this.loadCustomer().subscribe(res => {
        let selectedCustomers = res.filter(
          x => (x.value ? x.value.id === shipment.senderId : x.value === 0)
        );
        this.selectedCustomer =
          selectedCustomers.length > 0 ? selectedCustomers[0].value : null;
        res.forEach(x => {
          if (x.value !== null) {
            if (x.value.id === this.shipmentData.senderId) {
              this.customer = x.label;
            }
          }
        });
        // load payment 
        if(shipment.sender) {
          if (shipment.sender.customerTypeId) {
            this.loadPaymentType(shipment.sender.customerTypeId);
          } else {
            this.loadPaymentType(null);
          }
        } else {      
        }
      });

      //load employee
      if (this.shipmentData.toProvinceId) {
        if (this.shipmentData.deliverUserId) {
          this.selectedEmployee = this.shipmentData.deliverUserId;
          setTimeout(() => {
            this.selectedEmployee = this.shipmentData.deliverUserId;
          }, 2000);
        } else {
          setTimeout(() => {
            this.selectedEmployee = 0;
            this.shipmentData.deliverUserId = null;
          }, 2000);
        }
      }

      // load fromHub, fromWard
      this.selectedFromProvince = shipment.fromProvinceId;
      if (this.selectedFromProvince) {
        this.loadFromDistrict(shipment.fromDistrictId);
        this.loadFromWard(shipment.fromDistrictId, shipment.fromWardId);
        this.loadHubFromByWard(shipment.fromWardId);
      } else {
        this.selectedFromDistrict = shipment.fromDistrictId;
        this.selectedFromWard = shipment.fromWardId;
      }
      //load pickUser
      this.fromHubId = this.shipmentData.fromHubId;
      this.selectedFromHub = this.shipmentData.fromHubId;
      
      this.loadPickupUser();
      if (shipment.fromHub) {
        this.fromHub = `${shipment.fromHub.code} - ${shipment.fromHub.name}`;
      }
                
      if (this.shipmentData.isPaidPrice) {
        this.form.controls.fselectedPickupUser.disable();
        this.form.controls.fselectedPaymentType.disable();
      }

      // load toHub, toWard
      this.selectedToProvince = shipment.toProvinceId;
      let data = this.toProvinces.find(x => x.value == this.selectedToProvince);
      if (data) {
        this.toProvince = data.label;
      }
      if (this.selectedToProvince) {
        this.loadToDistrict(shipment.toDistrictId);
        this.loadToWard(shipment.toDistrictId, shipment.toWardId);
        this.loadHubToByWard(shipment.toWardId);
      } else {
        this.selectedToDistrict = shipment.toDistrictId;
      }

      // load receiver
      this.receiverPhone = this.shipmentData.receiverPhone;
      this.receiverName = this.shipmentData.receiverName;
      this.receiverCompany = this.shipmentData.companyTo;

      // load structure
      this.loadStructure();

      // load serviceDVGT
      if (shipment.serviceDVGTIds) {
        this.selectedServiceDVGTs = shipment.serviceDVGTIds;
      }

       // load serviceDVGT
      this.serviceDVGTService.getByShipmentId(shipment.id).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.arrObjServiceDVGTs = x.data as ServiceDVGT[];
        this.arrObjServiceDVGTs.forEach(x => {
          this.arrServiceDVGTs.push(x.id);
        });
        this.selectedServiceDVGTs = this.arrServiceDVGTs;
      });

      this.isAgreementPrice = shipment.isAgreementPrice;

      // load box
      this.boxService.getByShipmentId(shipment.id).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.arrObjBoxes = x.data as Boxes[];
        this.shipmentData.totalBox = this.arrObjBoxes.length;
        if (this.arrObjBoxes) {
          this.shipmentData.calWeight = this.arrObjBoxes.reduce((calWeight, item) => 
            calWeight + item.calWeight, 0
          );   
        }
        this.loadChargeWeight();
        this.newEditBoxes  = [];
        this.selectedDeleteBoxes = [];
      });

      setTimeout(() => {
        this.totalBoxes = this.arrObjBoxes;
        // console.log(this.totalBoxes);
        if (this.totalBoxes) {
          this.totalChargeWeightBoxes = this.totalBoxes.reduce((chargeWeight, item) => 
            chargeWeight + (item.calWeight >= item.weight ? item.calWeight : item.weight), 0
          );             
        }
      }, 5000);


      // load Version
      let cols = "CreatedByUser";
      this.shipmentVersionService.getByShipmentId(this.shipmentData.id, cols).subscribe(x => {
        if (!super.isValidResponse(x)) return;

        let arrObjVersion = x.data as ShipmentVersion[];
        this.shipmentVersions = arrObjVersion;
        // console.log(this.shipmentVersions);
      });

    } else {
      //
    }
  }

  loadDeadlinePickupDelivery() {
    this.shipmentData.expectedDeliveryTime = null;
    if ((this.selectedFromWard || this.fromHubId) &&  this.selectedService && this.selectedToDistrict) {
      let model : DeadlinePickupDelivery = new DeadlinePickupDelivery();
      if (this.shipmentData.orderDate) {
        model.timeStart = this.shipmentData.orderDate;
      } else {
        model.timeStart = this.currentTime;
      }
      if (this.selectedFromWard) {
        model.wardFromId = this.selectedFromWard;
      }
      if (this.fromHubId) {
        model.fromHudId = this.fromHubId;
      }
      model.serviceId = this.selectedService;
      model.districtToId = this.selectedToDistrict;

      this.deadlinePickupDeliveryService
        .getDeadlineDelivery(model)
        .subscribe(x => {
          let res = x.data as DeadlinePickupDelivery;
          if (res) {
            this.shipmentData.expectedDeliveryTime = res.formatDatetime;
            this.shipmentData.expectedDeliveryTimeSystem = res.formatDatetime;
            this.singlePickerExpectedDeliveryTime.startDate = new Date(
              res.formatDatetime
            );
            
            if (this.loadSelectExpectedDeliveryTime === true) {
              this.singlePickerExpectedDeliveryTime.startDate = new Date(
                this.shipmentData.expectedDeliveryTimeSystem
              );
              this.eventExpectedDeliveryTime.start = this.singlePickerExpectedDeliveryTime.startDate;
            }
            this.colorExpectedDeliveryTime = "text-blue";
            this.loadSelectExpectedDeliveryTime = false;
          } else {
            this.messageService.add({
              severity: Constant.messageStatus.warn,
              detail: x.message
            });
          }
      });
    }
  }

  compareTime(fullTime: Date){
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

  reloadOrderDate() {
    this.shipmentData.orderDate = this.currentTime;
    this.loadDeadlinePickupDelivery();
  }

  reloadExpectedDeliveryTime() {
    this.shipmentData.expectedDeliveryTime = this.shipmentData.expectedDeliveryTimeSystem;
    this.colorExpectedDeliveryTime = "text-blue";
  }

  resetFromLocationData() {
    this.selectedFromProvince = null;
    this.fromProvince = null;
    this.fromDistricts = [];
    this.selectedFromDistrict = null;
    this.fromDistrict = null;
    this.fromWards = [];
    this.selectedFromWard = null;
    this.fromWard = null;
    this.resetFromHubData();
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
    this.fromHub = null;
    this.fromHubs = [];
  }

  resetToLocationData() {
    this.selectedToProvince = null;
    this.toProvince = null;
    this.toDistricts = [];
    this.selectedToDistrict = null;
    this.toDistrict = null;
    this.toWards = [];
    this.selectedToWard = null;
    this.toWard = null;
    this.resetToHubData();
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
    this.selectedPackType = null;
    this.selectedSize = null;
    this.selectedContent = null;
    this.selectedWeight = null;
    this.selectedLength = null;
    this.selectedWidth = null;
    this.selectedHeight = null;
    this.selectedCalWeight = null;
    this.selectedCountSK = null;
    this.totalChargeWeightBoxes = null;
    this.totalSelectedCountSK = null;
    this.boxes = null;
    this.totalBoxes = [];
  }

  resetPrice() {
    this.shipmentData.defaultPrice = 0;
    this.shipmentData.fuelPrice = 0;
    this.shipmentData.otherPrice = 0;
    this.shipmentData.remoteAreasPrice = 0;
    this.shipmentData.totalDVGT = 0;
    this.shipmentData.totalPrice = 0;
    this.shipmentData.vatPrice = 0;
  }

  loadChargeWeight() {
    if (!this.shipmentData.calWeight) {
      this.chargeWeight = this.shipmentData.weight;
    } else {
      this.chargeWeight = (this.shipmentData.weight >= this.shipmentData.calWeight) ? this.shipmentData.weight : this.shipmentData.calWeight;
    }
    if (this.isCreatedBox && (this.shipmentData.calWeight >= this.shipmentData.weight)) {
      this.chargeWeight = this.shipmentData.calWeight;
      return;
    } else {
      this.loadService();
    }
  }

  async loadPaymentType(selectedCustomerTypeId: number = null): Promise<void> {
    this.paymentTypes = [];
    this.selectedPaymentType = null;

    this.paymentTypes = await this.paymentTypeService.getSelectModelPaymentdByCustomerTypeIDAsync(selectedCustomerTypeId);
    if (
      selectedCustomerTypeId ===
        ListCustomerTypeIdHelper.NON_CONTRACT_USER ||
      !selectedCustomerTypeId
    ) {
      if (this.shipmentData) {
        this.selectedPaymentType = this.shipmentData.paymentTypeId;
      } else {
        this.selectedPaymentType = PaymentTypeHelper.NGTTN;
      }
    }
    if (selectedCustomerTypeId === ListCustomerTypeIdHelper.CONTRACT_USER) {
      if (this.shipmentData) {
        this.selectedPaymentType = this.shipmentData.paymentTypeId;
      } else {
        this.selectedPaymentType = PaymentTypeHelper.NNTTS;
      }
    }

    if (this.paymentTypes) {
      this.paymentTypes.forEach(x => {
        if (this.selectedPaymentType === x.value) {
          this.paymentType = x.label;
        }
      });
    }
  }

  async loadService(): Promise<SelectItem[]>{
    this.services = [];
    this.service = [];
    this.selectedService = null;
    
    let model = ServiceHelper.checkParams(this.selectedCustomer, this.selectedFromDistrict, this.selectedFromWard, this.selectedToDistrict, this.chargeWeight);
    const totalItem = this.shipmentData.totalItem ? this.shipmentData.totalItem : 0;
    const structureId = this.shipmentData.structureId ? this.shipmentData.structureId : 0;
    if (model) {
      model.totalItem = totalItem;
      model.structureId = structureId;
      let data = await this.priceService.loadListServiceAsync(model);
      if (data.message) {
        this.msgService = data.message;
      } else {
        this.msgService = null;
        this.services = data.data as SelectItem[];
        if (this.shipmentDataVersion) {
          this.selectedService = this.shipmentDataVersion.serviceId;
          let service = this.services.find(x => x.value == this.selectedService);
          if (service) {
            this.service = service.label;
            this.serviceName = service.title;            
          }          
        } else {
          this.selectedService = this.services[1].value;
          this.service = this.services[1].label;
          this.serviceName = this.services[1].title;
        }
        this.loadDeadlinePickupDelivery();
        this.calculatePrice();
      }
    } else {
      this.services = [];
      this.service = [];
      this.selectedService = null;
    }
    return this.services;
  }

  loadServiceDVGT() {
    this.serviceDVGTs = [];
    this.selectedServiceDVGTs = [];

    this.serviceService.GetListServiceSub().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.serviceDVGTs = x.data as Service[];
    });
  }

  async loadStructure(): Promise<void> {
    this.structures = [];
    this.structures = await this.structureService.getSelectModelStructuresAsync();
    if (this.shipmentData) {
      this.selectedStructure = this.shipmentData.structureId;
      if (this.structures) {
        let structure = this.structures.find(x => x.value == this.selectedStructure);
        if (structure) {
          this.structure = structure.label;
        }
      }
    } else {
      if (this.structures) {
        this.selectedStructure = this.structures[1].value;
        this.structure = this.structures[1].label;
      }
    }   
  }

  loadPackType() {
    this.packTypes = [];
    this.selectedPackType = null;

    this.packTypeService.getAll().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let packTypes = x.data as PackType[];

      this.packTypes.push({ label: "-- Chọn dữ liệu --", value: null });

      packTypes.forEach(element => {
        this.packTypes.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
    });
  }

  loadSize() {
    this.sizes = [];
    this.selectedSize = null;
    this.objSizes = [];

    this.sizeService.getAll().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let sizes = x.data as Size[];

      this.sizes.push({ label: "-- Chọn dữ liệu --", value: null });

      sizes.forEach(element => {
        this.sizes.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
        this.objSizes.push(element);
      });
    });
  }

  loadEmployee() {
    this.selectedEmployee = null;
    this.employees = [];
    if (!this.selectedToCenterHub) return;

    this.userService.getEmpByHubId(this.selectedToCenterHub).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let users = x.data as User[];

      this.employees.push({ label: "-- Chọn nhân viên --", value: null });

      users.forEach(element => {
        this.employees.push({
          label: `${element.code} - ${element.fullName}`,
          value: element.id
        });
      });
    });
  }

  async loadPickupUser() {
    this.pickupUsers = [];
    this.selectedPickupUser = null;
    this.pickupUsers = await this.userService.getSelectModelAllEmpByHubIdAsync(this.selectedFromHub);
    if (this.pickupUsers) {
      let currentUser = this.pickupUsers.find(x => x.value == this.shipmentData.pickUserId);   
      if (currentUser) {
        this.selectedPickupUser = currentUser.value;
        this.pickupUser = currentUser.label;
      }
    }
  }

  loadCustomer() {
    this.customers = [];
    this.selectedCustomer = null;
    this.objCustomers = [];

    let includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward
    ];

    return this.customerService.getAll(includes).map(x => {
      if (!super.isValidResponse(x)) return;
      let objs = x.data as Customer[];

      this.customers.push({ label: `-- Chọn khách hàng --`, value: null });
      objs.forEach(element => {
        this.customers.push({
          label: `${element.code} - ${element.name} - ${element.phoneNumber}`,
          value: element
        });
        this.objCustomers.push({ code: element.code, id: element.id, phone: element.phoneNumber, name: element.name});
      });

      return this.customers;
    });
  }

  loadCustomerInfoLog() {
    this.customerInfoLogs = [];
    this.customerInfoLogService.getAll().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let customers = x.data as CustomerInfoLog[];
      customers.forEach(e => {
        this.customerInfoLogs.push(e);
      });
    });
  }

  //search sender

  //filter Customers
  filterCustomers(event) {
    this.filteredCustomers = [];
    for(let i = 0; i < this.objCustomers.length; i++) {
        let customer = `${this.objCustomers[i].code} - ${this.objCustomers[i].name} - ${this.objCustomers[i].phone}`;
        if(customer.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
            this.filteredCustomers.push(customer);
        }
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
      let obj = x.value as Customer;
      if (obj) {
        if (cloneSelectedCustomer === obj.code) {
          this.selectedCustomer = obj;
          this.changeCustomer();
        }
      }
    });
  }

  // filter fromHub
  filterFromHubs(event) {
    this.filteredFromHubs = [];
    if (this.fromHubs) {
      for(let i = 0; i < this.fromHubs.length; i++) {
          let fromHub = this.fromHubs[i].label;
          if(fromHub.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
              this.filteredFromHubs.push(fromHub);
          }
      }
    }
  }

  onSelectedFromHubs() {
    this.fromHubs.forEach(x => {
      if (this.fromHub === x.label) {
        this.selectedFromHub = x.value;
        this.fromHubId = x.value;
        this.pickupUser = null;
        this.loadDeadlinePickupDelivery();
      }
    });
  }

  //filter PickupUsers
  filterPickupUsers(event) {
    this.filteredPickupUsers = [];
    if (this.pickupUsers) {
      for(let i = 0; i < this.pickupUsers.length; i++) {
        let pickupUser = this.pickupUsers[i].label;
        if(pickupUser.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
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

  //search receiver

  filterReceiverPhones(event) {
    let query = event.query;
    let type = SearchCusstomerHelper.PHONE_NUMBER;
    this.customerInfoLogService.search(query, type).subscribe(customer => {
      this.filteredReceiverPhones = this.filterReceiver(query, customer.data, type);
    });
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

  filterReceiverNames(event) {
    let query = event.query;
    let type= SearchCusstomerHelper.NAME;
    this.customerInfoLogService.search(query, type).subscribe(customer => {
      this.filteredReceiverNames = this.filterReceiver(query, customer.data, type);
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

  filterReceiverCompanies(event) {
    let query = event.query;
    let type= SearchCusstomerHelper.COMPANY_NAME;
    this.customerInfoLogService.search(query, type).subscribe(customer => {
      this.filteredReceiverCompanies = this.filterReceiver(query, customer.data, type);
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

  filterReceiver(query, customers, type) {
    let filtered : any[] = [];
    for(let i = 0; i < customers.length; i++) {
      if (type === SearchCusstomerHelper.PHONE_NUMBER) {
        let receiverPhone = customers[i].phoneNumber;
        if(receiverPhone.indexOf(query) >= 0) {
            filtered.push(receiverPhone);
        }
      }
      if (type === SearchCusstomerHelper.NAME) {
        let receiverName = customers[i].name as string;
        if(receiverName.toLowerCase().indexOf((query).toLowerCase()) == 0) {
            filtered.push(receiverName);
        }
      }
      if (type === SearchCusstomerHelper.COMPANY_NAME) {
        if (customers[i].companyName) {
          let receiverCompany = customers[i].companyName as string;
          if(receiverCompany.toLowerCase().indexOf((query).toLowerCase()) == 0) {
              filtered.push(receiverCompany);
          }
        }

      }
    }
    return filtered;
  }

  //filter Employees
  filterEmployees(event) {
    this.filteredEmployees = [];
    if (this.employees) {
      for(let i = 0; i < this.employees.length; i++) {
        let employee = this.employees[i].label;
        if(employee.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
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
    for(let i = 0; i < this.toProvinces.length; i++) {
        let toProvince = this.toProvinces[i].label;
        if(toProvince.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
            this.filteredToProvinces.push(toProvince);
        }
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
    for(let i = 0; i < this.toDistricts.length; i++) {
        let toDistrict = this.toDistricts[i].label;
        if(toDistrict.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
            this.filteredToDistricts.push(toDistrict);
        }
    }
  }

  onSelectedToDistricts() {
    this.toDistricts.forEach(x => {
      if (this.toDistrict === x.label) {
        this.selectedToDistrict = x.value;
        this.toWard = null;
        this.changeToDistrict();
        this.loadDeadlinePickupDelivery();
      }
    });
  }

  // filter toWard
  filterToWards(event) {
    this.filteredToWards = [];
    for(let i = 0; i < this.toWards.length; i++) {
        let toWard = this.toWards[i].label;
        if(toWard.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
            this.filteredToWards.push(toWard);
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
      for(let i = 0; i < this.toHubs.length; i++) {
          let toHub = this.toHubs[i].label;
          if(toHub.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
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
    for(let i = 0; i < this.structures.length; i++) {
        let structure = this.structures[i].label;
        if(structure.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
            this.filteredStructures.push(structure);
        }
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

  // filter structures
  filterPaymentTypes(event) {
    this.filteredPaymentTypes = [];
    for(let i = 0; i < this.paymentTypes.length; i++) {
        let paymentType = this.paymentTypes[i].label;
        if(paymentType.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
            this.filteredPaymentTypes.push(paymentType);
        }
    }
  }

  onSelectedPaymentTypes() {
    this.paymentTypes.forEach(x => {
      if (this.paymentType === x.label) {
        this.selectedPaymentType = x.value;
      }
    });
  }

  // filter services
  filterServices(event) {
    this.filteredServices = [];
    if (this.services) {
      for(let i = 0; i < this.services.length; i++) {
          let service = this.services[i].label;
          if(service.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
              this.filteredServices.push(service);
          }
      }
    }
  }

  onSelectedServices() {
    this.services.forEach(x => {
      if (this.service === x.label) {
        this.selectedService = x.value;
        this.loadDeadlinePickupDelivery();
        this.calculatePrice();
      }
    });
  }

  //
  loadCenterHub() {
    this.fromCenterHubs = [];
    this.selectedFromCenterHub = null;
    this.fromPoHubs = [];
    this.selectedFromPoHub = null;
    this.fromStationHubs = [];
    this.selectedFromStationHub = null;
    //
    this.toCenterHubs = [];
    this.selectedToCenterHub = null;
    this.toPoHubs = [];
    this.selectedToPoHub = null;
    this.toStationHubs = [];
    this.selectedToStationHub = null;

    this.objFromCenterHubs = [];
    this.objToCenterHubs = [];

    this.hubService.getCenterHub().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let obj = x.data as Hub[];

      this.fromCenterHubs.push({ label: `-- Chọn trung tâm --`, value: null });
      this.toCenterHubs.push({ label: `-- Chọn trung tâm --`, value: null });
      obj.forEach(element => {
        this.fromCenterHubs.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
        this.objFromCenterHubs.push({ name: element.name, id: element.id });
        this.toCenterHubs.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
        this.objToCenterHubs.push({ name: element.name, id: element.id });
      });
    });
  }

  loadFromPoHub(selectedPoHub: number = null) {
    this.fromPoHubs = [];
    this.fromStationHubs = [];
    this.selectedFromStationHub = null;
    this.objFromPoHubs = [];
    if (!this.selectedFromCenterHub) return;

    this.hubService
      .getPoHubByCenterId(this.selectedFromCenterHub)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let obj = x.data as Hub[];

        this.fromPoHubs.push({ label: `-- Chọn bưu cục --`, value: null });
        this.selectedFromPoHub = selectedPoHub;
        obj.forEach(element => {
          this.fromPoHubs.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
          if (element.id == this.selectedFromPoHub) {
            this.fromPoHub = `${element.code} - ${element.name}`;
          }
          this.objFromPoHubs.push({ name: element.name, id: element.id });
        });
      });
  }

  loadFromStationHub(
    selectedPoHub: number = null,
    selectedStationHub: number = null
  ) {
    this.fromStationHubs = [];
    this.objFromStationHubs = [];

    if (this.selectedFromPoHub) {
      selectedPoHub = this.selectedFromPoHub;
    }

    this.hubService.getStationHubByPoId(selectedPoHub).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let obj = x.data as Hub[];
      if (!obj) return;
      this.selectedFromStationHub = selectedStationHub;

      this.fromStationHubs.push({ label: `-- Chọn trạm --`, value: null });
      obj.forEach(element => {
        this.fromStationHubs.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
        this.objFromStationHubs.push({ name: element.name, id: element.id });
        if (element.id == this.selectedFromStationHub) {
          this.fromStationHub = `${element.code} - ${element.name}`;
        }
      });
    });
  }

  loadToPoHub(selectedPoHub: number = null) {
    this.toPoHubs = [];
    this.toStationHubs = [];
    this.selectedToStationHub = null;
    this.objToPoHubs = [];

    if (!this.selectedToCenterHub) return;

    this.hubService
      .getPoHubByCenterId(this.selectedToCenterHub)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let obj = x.data as Hub[];

        this.toPoHubs.push({ label: `-- Chọn bưu cục --`, value: null });
        this.selectedToPoHub = selectedPoHub;
        obj.forEach(element => {
          this.toPoHubs.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
          this.objToPoHubs.push({ name: element.name, id: element.id });
          if (element.id == this.selectedToPoHub) {
            this.toPoHub = `${element.code} - ${element.name}`;
          }
        });
      });
  }

  loadToStationHub(
    selectedPoHub: number = null,
    selectedStationHub: number = null
  ) {
    this.toStationHubs = [];

    if (this.selectedToPoHub) {
      selectedPoHub = this.selectedToPoHub;
    }

    this.hubService.getStationHubByPoId(selectedPoHub).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let obj = x.data as Hub[];
      if (!obj) return;
      this.selectedToStationHub = selectedStationHub;

      this.toStationHubs.push({ label: `-- Chọn trạm --`, value: null });
      obj.forEach(element => {
        this.toStationHubs.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
    });
  }

  loadProvince() {
    this.fromProvinces = [];
    this.selectedFromProvince = null;
    this.fromProvince = null;
    this.fromDistricts = [];
    this.selectedFromDistrict = null;
    this.fromDistrict = null;
    this.fromWards = [];
    this.selectedFromWard = null;
    this.fromWard = null;
    //
    this.toProvinces = [];
    this.selectedToProvince = null;
    this.toProvince = null;
    this.toDistricts = [];
    this.selectedToDistrict = null;
    this.toDistrict = null;
    this.toWards = [];
    this.selectedToWard = null;
    this.toWard = null;

    this.provinceService.getAll().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let objs = x.data as Province[];

      this.fromProvinces.push({ label: `-- Chọn tỉnh/thành --`, value: null });
      this.toProvinces.push({ label: `-- Chọn tỉnh/thành --`, value: null });
      objs.forEach(element => {
        this.fromProvinces.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
        this.toProvinces.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
    });
  }

  loadFromDistrict(selectedDistrict: number = null) {
    this.fromDistricts = [];
    this.fromWards = [];
    this.selectedFromWard = null;
    this.fromWard = null;
    this.resetFromHubData();

    if (!this.selectedFromProvince) return;
    
    this.selectedFromDistrict = selectedDistrict;
    this.districtService
      .getDistrictByProvinceId(this.selectedFromProvince)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as District[];

        this.fromDistricts.push({
          label: `-- Chọn quận/huyện --`,
          value: null
        });
        objs.forEach(element => {
          this.fromDistricts.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
          if (this.selectedFromDistrict === element.id) {
            this.fromDistrict =`${element.code} - ${element.name}`;
          }
        });
    });
  }

  loadFromWard(selectedDistrict: number = null, selectedWard: number = null) {
    this.fromWards = [];
    this.resetFromHubData();

    if (!this.selectedFromDistrict && !selectedDistrict) return;
    if (!selectedDistrict) {
      selectedDistrict = this.selectedFromDistrict;
    }

    this.wardService.getWardByDistrictId(selectedDistrict).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let objs = x.data as Ward[];

      this.selectedFromWard = selectedWard;
      this.fromWards.push({ label: `-- Chọn phường/xã --`, value: null });
      objs.forEach(element => {
        this.fromWards.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
        if (this.selectedFromWard === element.id) {
          this.fromWard =`${element.code} - ${element.name}`;
        }
      });
    });
  }

  loadToDistrict(selectedDistrict: number = null) {
    this.toDistricts = [];
    this.toWards = [];
    this.selectedToWard = null;
    this.toWard = null;
    this.resetToHubData();

    if (!this.selectedToProvince) return;

    this.selectedToDistrict = selectedDistrict;
    this.districtService
      .getDistrictByProvinceId(this.selectedToProvince)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as District[];

        this.toDistricts.push({ label: `-- Chọn quận/huyện --`, value: null });
        objs.forEach(element => {
          this.toDistricts.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
          if (this.selectedToDistrict === element.id) {
            this.toDistrict =`${element.code} - ${element.name}`;
          }
        });
    });
    this.loadService();
    this.loadDeadlinePickupDelivery();
  }

  loadToWard(selectedDistrict: number = null, selectedWard: number = null) {
    this.toWards = [];
    this.resetToHubData();

    if (!this.selectedToDistrict && !selectedDistrict) return;
    if (!selectedDistrict) {
      selectedDistrict = this.selectedToDistrict;
    }

    this.wardService
      .getWardByDistrictId(selectedDistrict)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as Ward[];

        this.selectedToWard = selectedWard;
        this.toWards.push({ label: `-- Chọn phường/xã --`, value: null });
        objs.forEach(element => {
          this.toWards.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
          if (this.selectedToWard === element.id) {
            this.toWard =`${element.code} - ${element.name}`;
          }
        });
      });
  }

  loadLocationFromPlace(place: google.maps.places.PlaceResult) {
    let provinceName = "";
    let districtName = "";
    let wardName = "";

    let isProvince: boolean;
    let isDistrict: boolean;
    let isWard: boolean;
    place.address_components.forEach(element => {
      if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1
      ) {
        isProvince = true;
        provinceName = element.long_name;
      } else if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1
      ) {
        isDistrict = true;
        districtName = element.long_name;
      } else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        isWard = true;
        wardName = element.long_name;
      }
    });
    if (isProvince && isDistrict && isWard) {
      this.fromLocation = "none";
    } else {
      this.fromLocation = "block";
    }

    this.cloneFromProviceName = provinceName;
    this.cloneFromDistrictName = districtName;
    this.cloneFromWardName = wardName;
    this.provinceService.getProvinceByName(provinceName).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let province = x.data as Province;
        if (!province) {
          this.selectedFromProvince = null;
          this.fromProvince = null;
          return;
        }
        this.selectedFromProvince = province.id;
        this.fromProvinces.forEach(x => {
          if (x.value === this.selectedFromProvince) {
            this.fromProvince = x.label;
          }
        });
        this.selectedFromDistrict = null;
        this.fromDistrict = null;

        this.loadFromDistrict();
        this.districtService
          .getDistrictByName(districtName, this.selectedFromProvince)
          .subscribe(
            x => {
              if (!this.cloneFromDistrictName) {
                this.messageService.add({
                  severity: Constant.messageStatus.warn,
                  detail: "Vui lòng chọn Quận/huyện gửi!"
                });
                this.messageService.add({
                  severity: Constant.messageStatus.warn,
                  detail: "Vui lòng chọn Phường/xã gửi!"
                });
              } else {
                if (!super.isValidResponse(x)) return;
                let district = x.data as District;
                if (!district) {
                  this.selectedFromDistrict = null;
                  this.fromDistrict = null;
                  return;
                }
                this.selectedFromDistrict = district.id;
                this.fromDistricts.forEach(x => {
                  if (x.value === this.selectedFromDistrict) {
                    this.fromDistrict = x.label;
                  }
                });
                this.selectedFromWard = null;
                this.fromWard = null;
  
                this.loadFromWard();
                this.loadService();
                this.wardService
                  .getWardByName(wardName, this.selectedFromDistrict)
                  .subscribe(
                    x => {
                      if (!this.cloneFromWardName) {
                        this.messageService.add({
                          severity: Constant.messageStatus.warn,
                          detail: "Vui lòng chọn Phường/xã gửi!"
                        });
                      } else {
                        if (!super.isValidResponse(x)) return;
                        let ward = x.data as Ward;
    
                        if (!ward) {
                          this.selectedFromWard = null;
                          this.fromWard = null;
                          return;
                        }
                        this.selectedFromWard = ward.id;
                        this.fromWards.forEach(x => {
                          if (x.value === this.selectedFromWard) {
                            this.fromWard = x.label;
                          }
                        });
                        this.loadHubFromByWard();
                      }
                    } //End wardService
                );
              } //End districtService
           } 
        );
      } //End provinceService
    );
  }

  loadLocationToPlace(place: google.maps.places.PlaceResult) {
    let provinceName = "";
    let districtName = "";
    let wardName = "";

    let isProvince: boolean;
    let isDistrict: boolean;
    let isWard: boolean;
    place.address_components.forEach(element => {
      if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1
      ) {
        isProvince = true;
        provinceName = element.long_name;
      } else if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1
      ) {
        isDistrict = true;
        districtName = element.long_name;
      } else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        isWard = true;
        wardName = element.long_name;
      }
    });
    if (isProvince && isDistrict && isWard) {
      this.toLocation = "none";
    } else {
      this.toLocation = "block";
    }

    this.cloneToProviceName = provinceName;
    this.cloneToDistrictName = districtName;
    this.cloneToWardName = wardName;
    this.provinceService.getProvinceByName(provinceName).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let province = x.data as Province;
        if (!province) {
          this.selectedToProvince = null;
          this.toProvince = null;
          return;
        }
        this.selectedToProvince = province.id;
        this.toProvinces.forEach(x => {
          if (x.value === this.selectedToProvince) {
            this.toProvince = x.label;
          }
        });
        this.selectedToDistrict = null;
        this.toDistrict = null;

        this.loadToDistrict();
        this.districtService
          .getDistrictByName(districtName, this.selectedToProvince)
          .subscribe(x => {
            if (!this.cloneToDistrictName) {
              this.messageService.add({
                severity: Constant.messageStatus.warn,
                detail: "Vui lòng chọn Quận/huyện nhận!"
              });
              this.messageService.add({
                severity: Constant.messageStatus.warn,
                detail: "Vui lòng chọn Phường/xã nhận!"
              });
            } else {
              if (!super.isValidResponse(x)) return;
              let district = x.data as District;
              if (!district) {
                this.selectedToDistrict = null;
                this.toDistrict = null;
                return;
              }

              this.selectedToDistrict = district.id;
              this.toDistricts.forEach(x => {
                if (x.value === this.selectedToDistrict) {
                  this.toDistrict = x.label;
                }
              });
              this.selectedToWard = null;
              this.toWard = null;

              this.loadToWard();
              this.loadService();
              this.wardService
                .getWardByName(wardName, this.selectedToDistrict)
                .subscribe(
                  x => {
                    if (!this.cloneToWardName) {
                      this.messageService.add({
                        severity: Constant.messageStatus.warn,
                        detail: "Vui lòng chọn Phường/xã nhận!"
                      });
                    } else {
                      if (!super.isValidResponse(x)) return;
                      let ward = x.data as Ward;

                      if (!ward) {
                        this.selectedToWard = null;
                        this.toWard = null;
                        return;
                      }
                      this.selectedToWard = ward.id;
                      this.toWards.forEach(x => {
                        if (x.value === this.selectedToWard) {
                          this.toWard = x.label;
                        }
                      });
                      this.loadHubToByWard();
                    }
                  } //End wardService
              );
            } //End districtService
          });
      } //End provinceService
    );
  }

  loadHubFromByWard(selectedWard: number = null) {
    this.resetFromHubData();
    this.fromHubs = [];
    this.selectedFromHub = null;
    if (!this.selectedFromWard && !selectedWard) return;

    if (!selectedWard) {
      selectedWard = this.selectedFromWard;
    }

    let includes = [
      Constant.classes.includes.hub.centerHub,
      Constant.classes.includes.hub.poHub
    ];

    this.hubService.loadListHubByWard(selectedWard, includes).subscribe(data => {
      this.fromHubs = data;

      this.hubService.getHubByWardId(selectedWard, includes).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let stationHub = x.data as Hub;
        if (stationHub == null) return;

        this.selectedFromCenterHub = stationHub.centerHubId;

        this.fromHubs.forEach(e => {
          if (e.value === stationHub.id) {
            // this.selectedFromHub = e.value;
            // this.fromHub = e.label;
          }
        });
        let hubId = HubHelper.getHubId(
          stationHub.centerHubId,
          stationHub.poHubId,
          stationHub.id
        );
        this.fromHubId = hubId;
      });
    });
  }

  loadHubToByWard(selectedWard: number = null) {
    this.resetToHubData();
    this.toHubs = [];
    this.selectedToHub = null;
    if (!this.selectedToWard && !selectedWard) return;

    if (!selectedWard) {
      selectedWard = this.selectedToWard;
    }

    let includes = [
      Constant.classes.includes.hub.centerHub,
      Constant.classes.includes.hub.poHub
    ];

    this.hubService.loadListHubByWard(selectedWard, includes).subscribe(data => {
      this.toHubs = data;

      this.hubService.getHubByWardId(selectedWard, includes).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let stationHub = x.data as Hub;
        if (stationHub == null) return;

        this.selectedToCenterHub = stationHub.centerHubId;

        this.toHubs.forEach(e => {
          if (e.value === stationHub.id) {
            this.selectedToHub = e.value;
            this.toHub = e.label;
          }
        });
        let hubId = HubHelper.getHubId(
          stationHub.centerHubId,
          stationHub.poHubId,
          stationHub.id
        );
        this.toHubId = hubId;
        this.loadEmployee();
      });
    });
  }

  initMap() {
    //set google maps defaults
    this.zoom = 4;
    this.latitudeFrom = 10.762622;
    this.longitudeFrom = 106.660172;
    this.latitudeTo = 10.762622;
    this.longitudeTo = 106.660172;

    //create search FormControl
    this.searchFromControl = new FormControl;
    this.searchToControl = new FormControl;

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let fromAutocomplete = new google.maps.places.Autocomplete(
        this.searchFromElementRef.nativeElement,
        {
          // types: ["address"]
        }
      );
      fromAutocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = fromAutocomplete.getPlace();

          //verify result
          if (!place.geometry || !place.geometry) {
            this.messageService.add({
              severity: Constant.messageStatus.warn,
              detail: "Không tìm thấy địa chỉ"
            });
            return;
          }

          //
          this.loadLocationFromPlace(place);
          this.shipmentData.pickingAddress = place.formatted_address;
          //set latitudeFrom, longitudeFrom and zoom
          this.latitudeFrom = place.geometry.location.lat();
          this.longitudeFrom = place.geometry.location.lng();
          this.shipmentData.latFrom = this.latitudeFrom;
          this.shipmentData.lngFrom = this.longitudeFrom;
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
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = toAutocomplete.getPlace();
          //verify result
          if (!place.geometry || !place.geometry) {
            this.messageService.add({
              severity: Constant.messageStatus.warn,
              detail: "Không tìm thấy địa chỉ"
            });
            return;
          }

          //
          this.loadLocationToPlace(place);
          this.shipmentData.shippingAddress = place.formatted_address;
          //set latitude, longitude and zoom
          this.latitudeTo = place.geometry.location.lat();
          this.longitudeTo = place.geometry.location.lng();
          this.shipmentData.latTo = this.latitudeTo;
          this.shipmentData.lngTo = this.longitudeTo;
          this.zoom = 16;
        });
      });
    });
  }

  changeFromProvince() {
    this.loadFromDistrict();
  }

  changeFromDistrict() {
    this.loadFromWard();
    this.calculatePrice();
  }

  changeFromWard() {
    this.loadHubFromByWard();
  }

  changeFromCenterHub() {
    this.loadFromPoHub();
  }

  changeFromPoHub() {
    this.loadFromStationHub();
  }

  changeToProvince() {
    this.loadToDistrict();
  }

  changeToDistrict() {
    this.loadToWard();
    this.calculatePrice();
  }

  changeToWard() {
    this.loadHubToByWard();
  }

  changeWeight() {
    this.loadChargeWeight();
  }

  changeToCenterHub() {
    this.loadToPoHub();
    this.loadEmployee();
  }

  changeToPoHub() {
    this.loadToStationHub();
  }

  changeCustomer() {
    let customer = this.selectedCustomer;
    this.resetFromLocationData();
    this.resetFromHubData();

    if (customer) {
      this.senderName = customer.name;
      this.shipmentData.senderName = this.senderName;
      this.senderPhone = customer.phoneNumber;
      this.shipmentData.senderPhone = this.senderPhone;
      this.senderCompany = customer.companyName;
      this.shipmentData.companyFrom = this.senderCompany;
      this.shipmentData.pickingAddress = customer.address;
      this.shipmentData.addressNoteFrom = customer.addressNote;
      this.latitudeFrom = customer.lat;
      this.longitudeFrom = customer.lng;
      this.shipmentData.latFrom = customer.lat;
      this.shipmentData.lngFrom = customer.lng;
      this.shipmentData.currentLat = customer.lat;
      this.shipmentData.currentLng = customer.lng;

      this.searchFromControl.setValue(customer.address);

      if (customer.province) {
        this.selectedFromProvince = customer.province.id;
        this.fromProvince = `${customer.province.code} - ${customer.province.name}`;
      }

      if (customer.province && customer.district && customer.ward) {
        this.fromLocation = "none";
      } else {
        this.fromLocation = "block";
      }

      if (this.selectedFromProvince) {
        if (customer.district) {
          this.loadFromDistrict(customer.district.id);
        } else {
          this.selectedService = null;
          this.service = null;
          this.resetPrice();
        }
        if (customer.ward) {
          this.loadFromWard(customer.district.id, customer.ward.id);
          this.loadHubFromByWard(customer.ward.id);
        } else {
          this.loadFromWard(customer.district.id, null);
        }
      }
      this.loadPaymentType(customer.customerTypeId);
    }
  }

  changeCustomerInfoLog() {
    let customer = this.selectedCustomerInfoLogs;
    this.resetToLocationData();

    if (customer) {
      this.receiverName = customer.name;
      this.shipmentData.receiverName = this.receiverName;
      this.receiverPhone = customer.phoneNumber;
      this.shipmentData.receiverPhone = this.receiverPhone;
      this.receiverCompany = customer.companyName;
      this.shipmentData.companyTo = this.receiverCompany;
      this.shipmentData.addressNoteTo = customer.addressNote;
      this.shipmentData.shippingAddress = customer.address;
      this.latitudeTo = customer.lat;
      this.longitudeTo = customer.lng;
      this.shipmentData.latTo = customer.lat;
      this.shipmentData.lngTo = customer.lng;

      this.searchToControl.setValue(customer.address);
      this.selectedToProvince = customer.provinceId;

      if (customer.provinceId) {
        this.toProvinces.forEach(x => {
          if (customer.provinceId === x.value) {
            this.toProvince = x.label;
          }
        });
      }

      if (customer.provinceId && customer.districtId && customer.wardId) {
        this.toLocation = "none";
      } else {
        this.toLocation = "block";
      }

      if (this.selectedToProvince) {
        if (customer.districtId) {
          this.loadToDistrict(customer.districtId);
        } else {
          this.selectedService = null;
          this.service = null;
          this.resetPrice();
        }
        if (customer.wardId) {
          this.loadToWard(customer.districtId, customer.wardId);
        } else {
          this.loadToWard(customer.districtId, null);
        }
        if (customer.wardId) {
          this.loadHubToByWard(customer.wardId);
        }
      }
    }
  }

  changeLength(length: number) {
    this.selectedLength = length;
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight = (this.selectedLength*this.selectedWidth*this.selectedHeight)/environment.defaultSize;
    } else {
      this.selectedCalWeight = null;
    }
  }

  changeWidth(width: number) {
    this.selectedWidth = width;
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight = (this.selectedLength*this.selectedWidth*this.selectedHeight)/environment.defaultSize;
    } else {
      this.selectedCalWeight = null;
    }
  }

  changeHeight(height: number) {
    this.selectedHeight = height;
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight = (this.selectedLength*this.selectedWidth*this.selectedHeight)/environment.defaultSize;
    } else {
      this.selectedCalWeight = null;
    }
  }

  changeSize() {
    if(this.selectedSize) {
      this.objSizes.forEach(x => {
        if(x.id == this.selectedSize) {
          this.selectedLength = x.length;
          this.selectedWidth = x.width;
          this.selectedHeight = x.height;

          if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
            this.selectedCalWeight = (this.selectedLength*this.selectedWidth*this.selectedHeight)/environment.defaultSize;
          }
        }
      });
    } else {
      this.selectedCalWeight = null;
      this.selectedLength = null;
      this.selectedWidth = null;
      this.selectedHeight = null;
      this.changeLength(this.selectedLength);
      this.changeWidth(this.selectedWidth);
      this.changeHeight(this.selectedHeight);
    }
  }

  onViewToLocation() {
    if (this.isViewToLocation) {
      this.toLocation = "block";
    } else {
      this.toLocation = "none";
    }
  }  

  onAgreementPrice() {
    this.IsChangeAgreementPrice = true;
    if (!this.isAgreementPrice) {
      this.calculatePrice();
    }
  }  

  refresh() {
    this.resetData();
    this.resetFromHubData();
    this.resetFromLocationData();
    this.resetToHubData();
    this.resetToLocationData();
    this.initData();
  }

  public singleSelectOrderDate(value: any) {
    this.shipmentData.orderDate = moment(value.start).toDate();
    this.loadDeadlinePickupDelivery();
    this.isChangeOrderDate = true;
  }

  public singleSelectExpectedDeliveryTime(value: any) {
    this.shipmentData.expectedDeliveryTime = moment(value.start).toDate();
    this.eventExpectedDeliveryTime = value;
    this.loadSelectExpectedDeliveryTime = true;
    this.isChangeExpectedDeliveryTime = true;

    let checkExpectedDeliveryTime;
    checkExpectedDeliveryTime = moment(
      this.shipmentData.expectedDeliveryTime
    ).isSameOrAfter(this.shipmentData.orderDate);
    if (checkExpectedDeliveryTime === false) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Thời gian dự kiến không được nhỏ hơn Ngày gửi"
      });
      this.shipmentData.expectedDeliveryTime = this.shipmentData.expectedDeliveryTimeSystem
      this.singlePickerExpectedDeliveryTime.startDate = new Date(
      this.shipmentData.expectedDeliveryTimeSystem
      );
      value.start = this.singlePickerExpectedDeliveryTime.startDate;
      this.eventExpectedDeliveryTime = value;
    }

    
    this.cloneExpectedDeliveryTime = this.shipmentData.expectedDeliveryTime;
    let expectedDeliveryTime = this.compareTime(this.shipmentData.expectedDeliveryTime);
    let expectedDeliveryTimeSystem = this.compareTime(this.shipmentData.expectedDeliveryTimeSystem);
    let state = moment(expectedDeliveryTime).isSame(expectedDeliveryTimeSystem);
    if (state) {
      this.colorExpectedDeliveryTime = "text-blue";
    } else {
      this.colorExpectedDeliveryTime = "text-red";
    }
  }

  isEquivalent(a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // if (aProps.length != bProps.length) {
    //     return false;
    // }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];
        if (a[propName] !== b[propName]) {
            return false;
        }
    }
    return true;
}

  save() {
    // console.log(this.checkSender);
    // console.log(this.saveShipmentData);
    if (!this.isValidToUpdateShipment())  return;
    // console.log(this.shipmentData);
    this.checkSubmit = true;

    // save OrderDate EndPickTimne ExpectedDeliveryTime
    this.saveTime();

    // save Sender
    this.shipmentData.senderPhone = InputValue.trimInput(this.shipmentData.senderPhone);
    this.shipmentData.senderName = InputValue.trimInput(this.shipmentData.senderName);
    if (this.shipmentData.companyFrom) {
      this.shipmentData.companyFrom = InputValue.trimInput(this.shipmentData.companyFrom);
    }

    // save Receiver
    this.receiverPhone = InputValue.trimInput(this.receiverPhone);
    this.shipmentData.receiverPhone = this.receiverPhone;
    if (this.shipmentData.addressNoteFrom) {
      this.shipmentData.addressNoteFrom = InputValue.trimInput(this.shipmentData.addressNoteFrom);
    }
    this.receiverName = InputValue.trimInput(this.receiverName);
    this.shipmentData.receiverName = this.receiverName;
    if (this.receiverCompany) {
      this.receiverCompany = InputValue.trimInput(this.receiverCompany);
      this.shipmentData.companyTo = this.receiverCompany;
    }
    if (this.shipmentData.addressNoteTo) {
      this.shipmentData.addressNoteTo = InputValue.trimInput(this.shipmentData.addressNoteTo);      
    }
    if (this.shipmentData.content) {
      this.shipmentData.content = InputValue.trimInput(this.shipmentData.content);
    }

    this.shipmentData.fromProvinceId = this.selectedFromProvince;
    this.shipmentData.fromDistrictId = this.selectedFromDistrict;
    this.shipmentData.fromWardId = this.selectedFromWard;
    this.shipmentData.serviceDVGTIds = this.selectedServiceDVGTs;
    // console.log(this.selectedServiceDVGTs);
    // console.log(this.shipmentData.serviceDVGTIds);

    this.shipmentData.fromHubId = this.selectedFromHub;
    //
    if (this.selectedToProvince) {
      this.shipmentData.toProvinceId = this.selectedToProvince;
    }

    if (this.selectedToDistrict) {
      this.shipmentData.toDistrictId = this.selectedToDistrict;
    }

    if (this.selectedToWard) {
      this.shipmentData.toWardId = this.selectedToWard;
    }

    this.shipmentData.toHubId = this.toHubId;
    // check shipmentStatus
    if (this.shipmentData.shipmentStatusId !== StatusHelper.notComplete) {
      if (this.selectedEmployee && this.shipmentData.fromHubId === this.shipmentData.toHubId) {
        this.shipmentData.shipmentStatusId = StatusHelper.assignEmployeeDelivery;
        this.shipmentData.deliverUserId = this.selectedEmployee;
        this.shipmentData.currentEmpId = this.selectedEmployee;
      } else if (this.shipmentData.fromHubId !== this.shipmentData.toHubId) {
        this.shipmentData.shipmentStatusId = StatusHelper.waitingToTransfer;
      }
    } else {
      if (this.shipmentData.totalPrice > 0) {
        if (this.shipmentData.fromHubId === this.shipmentData.toHubId) {
          this.shipmentData.shipmentStatusId = StatusHelper.readyToDelivery;
        } else {
          this.shipmentData.shipmentStatusId = StatusHelper.waitingToTransfer;
        }
      }
    }

    this.shipmentData.pickUserId = this.selectedPickupUser;
    if (this.selectedPaymentType) {
      this.shipmentData.paymentTypeId = this.selectedPaymentType;
      if (this.selectedPaymentType === PaymentTypeHelper.NGTTN) {
        this.shipmentData.keepingTotalPriceEmpId = this.selectedPickupUser;
      }
    }

    if (!this.selectedEmployee) {
      this.shipmentData.deliverUserId = null;
    }


    if (this.selectedStructure) {
      this.shipmentData.structureId = this.selectedStructure;
    }

    if (this.selectedService) {
      this.shipmentData.serviceId = this.selectedService;
    }

    if (!this.isCreatedBox) {
      this.shipmentData.totalBox = this.shipmentData.totalBox ? this.shipmentData.totalBox : 1;
    } else {
      this.shipmentData.totalBox = (this.shipmentData.totalBox >= this.cloneTotalSelectedCountSK) ? this.shipmentData.totalBox : this.cloneTotalSelectedCountSK;
    }

    this.shipmentData.calWeight = (this.shipmentData.calWeight) ? this.shipmentData.calWeight : 0;
    this.shipmentData.height = (this.shipmentData.height) ? this.shipmentData.height : 0;
    this.shipmentData.length = (this.shipmentData.length) ? this.shipmentData.length : 0;
    this.shipmentData.width = (this.shipmentData.width) ? this.shipmentData.width : 0;
    this.shipmentData.cod = (this.shipmentData.cod) ? this.shipmentData.cod : 0;
    this.shipmentData.otherPrice = (this.shipmentData.otherPrice) ? this.shipmentData.otherPrice : 0;
    this.shipmentData.defaultPrice = (this.shipmentData.defaultPrice) ? this.shipmentData.defaultPrice : 0;
    this.shipmentData.isAgreementPrice = this.isAgreementPrice;
    this.shipmentData.fuelPrice = (this.shipmentData.fuelPrice) ? this.shipmentData.fuelPrice : 0;
    this.shipmentData.otherPrice = (this.shipmentData.otherPrice) ? this.shipmentData.otherPrice : 0;
    this.shipmentData.remoteAreasPrice = (this.shipmentData.remoteAreasPrice) ? this.shipmentData.remoteAreasPrice : 0;
    this.shipmentData.totalDVGT = (this.shipmentData.totalDVGT) ? this.shipmentData.totalDVGT : 0;
    this.shipmentData.totalPrice = (this.shipmentData.totalPrice) ? this.shipmentData.totalPrice : 0;
    this.shipmentData.vatPrice = (this.shipmentData.vatPrice) ? this.shipmentData.vatPrice : 0;

    // console.log(JSON.stringify(this.shipmentData));
    // console.log(this.shipmentData.boxes);
    // console.log(this.shipmentData.totalBox);
    // console.log(this.shipmentData.shipmentStatusId);

    // this.datasource.forEach(x => {
    //   if(x.shipmentNumber == this.shipmentData.shipmentNumber) {
    //     this.cloneShipmentData = x;
    //     console.log(JSON.stringify(this.shipmentData));
    //     // console.log(JSON.stringify(x));
    //     // console.log(JSON.stringify(this.clone(x)));
    //     // console.log(this.isEquivalent(this.cloneShipmentData, this.shipmentData));
    //   }
    // });
    this.shipmentService.update(this.shipmentData).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);
        let data = x.data as Shipment;

        //create Version
        this.shipmentDataVersion.serviceDVGTIds = this.selectedServiceDVGTs;
        this.shipmentVersionService.create(this.shipmentDataVersion).subscribe(x => {
          if (!super.isValidResponse(x)) return;

          this.messageService.add({ severity: Constant.messageStatus.success, detail: "Sửa đơn hàng thành công" });
          this.bsModalRef.hide();
        });
      }
    );
  }

  saveTime() {
    // save OrderDate EndPickTimne ExpectedDeliveryTime
    this.shipmentData.orderDate = SearchDate.formatToISODate(this.shipmentData.orderDate);
    this.shipmentData.endPickTime = SearchDate.formatToISODate(this.shipmentData.orderDate);
    this.shipmentData.expectedDeliveryTime = SearchDate.formatToISODate(this.shipmentData.expectedDeliveryTime);
  }

  isValidToUpdateShipment(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.shipmentData.senderPhone) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập số điện thoại người gửi" });
      result = false;
    }

    if (!this.shipmentData.senderName) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập tên người gửi" });
      result = false;
    }

    if (!this.selectedPickupUser) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn NV lấy hàng" });
      result = false;
    }
    //
    if (!this.shipmentData.receiverPhone) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập số điện thoại người nhận" });
      result = false;
    }

    if (!this.shipmentData.receiverName) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập tên người nhận" });
      result = false;
    }

    if (!this.shipmentData.shippingAddress) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập địa chỉ giao hàng" });
      result = false;
    }

    if (!this.selectedToProvince) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn tỉnh/thành nhận" });
      result = false;
    }

    if (!this.selectedToDistrict) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn quận/huyện nhận" });
      result = false;
    }

    if (!this.selectedToWard) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn phường/xã nhận" });
      result = false;
    }

    if (!this.selectedToCenterHub && !this.selectedToPoHub && !this.selectedToStationHub) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn TT/CN/T nhận" });
      result = false;
    }

    if (!this.shipmentData.weight) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập trọng lượng" });
      result = false;
    } else if (this.shipmentData.weight == 0) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Trọng lượng phải lớn hơn 0" });
      result = false;
    }

    if (!this.selectedPaymentType) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn HT thanh toán" });
      result = false;
    }

    if (!this.selectedStructure) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn loại hàng hoá" });
      result = false;
    }

    // if (!this.selectedService) {
    //   messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn dịch vụ" });
    //   result = false;
    // }

    if (!this.shipmentData.totalPrice) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy bảng giá" });
      result = false;
    } else if (this.shipmentData.totalPrice === 0) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy bảng giá" });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  // cloneShipment(data: Shipment) {
  //   this.saveShipmentData = data;
  // }

  isValidToCreateBox(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedPackType) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn loại đóng gói" });
      result = false;
    }

    if (!this.selectedWeight) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập trọng lượng" });
      result = false;
    }

    if (!this.selectedLength) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập chiều dài" });
      result = false;
    }

    if (!this.selectedWidth) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập chiều rộng" });
      result = false;
    }

    if (!this.selectedHeight) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập chiều cao" });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  createBox() {
    if (!this.isValidToCreateBox()) return;

    this.boxes = [];
    this.totalChargeWeightBoxes = 0;

    if(this.selectedLength && this.selectedWidth && this.selectedHeight && this.selectedWeight && this.selectedPackType) {
      const obj: Boxes = new Boxes;

      if(!this.selectedPackType){
        obj.packTypeId = null;
      } else {
        obj.packTypeId = this.selectedPackType;
      }
      if (this.selectedContent) {
        obj.content = this.selectedContent as string;
      } else {
        obj.content = null;
      }
      obj.weight = this.selectedWeight;
      obj.length = this.selectedLength;
      obj.width = this.selectedWidth;
      obj.height = this.selectedHeight;
      obj.calWeight = this.selectedCalWeight;
      obj.shipmentId = this.shipmentData.id;
      if(this.selectedCountSK == 0){
        this.boxes = [];
      } else if(!this.selectedCountSK || this.selectedCountSK == 1) {
        this.boxes.push(obj);
      }else {
        this.boxes = [];
        for (let i=1 ; i <= this.selectedCountSK; i++) {
          this.boxes.push(obj);
        }
      }
      if(this.boxes && this.totalBoxes) {
        this.totalBoxes = this.totalBoxes.concat(this.boxes);
      }

      this.totalSelectedCountSK = this.arrObjBoxes.length + this.selectedCountSK;
      this.newEditBoxes = this.newEditBoxes.concat(this.boxes);
    }

    this.getTotalBoxes();
  }

  getTotalBoxes() {
    this.totalChargeWeightBoxes = 0;
    this.cloneTotalSelectedCountSK = null;

    if (this.totalBoxes) {
      this.totalChargeWeightBoxes = this.totalBoxes.reduce((chargeWeight, item) => 
        chargeWeight + (item.calWeight >= item.weight ? item.calWeight : item.weight), 0
      );       
      this.totalSelectedCountSK = this.totalBoxes.length;
      this.cloneTotalSelectedCountSK = this.totalSelectedCountSK;
    }
  }

  saveBox(){
    if(this.boxes && this.selectedPackType) {
      this.shipmentData.boxes = this.totalBoxes;
      this.shipmentData.calWeight = this.totalChargeWeightBoxes;
      if (this.shipmentData.totalBox) {
        this.shipmentData.totalBox = (this.totalSelectedCountSK >= this.shipmentData.totalBox) ? this.totalSelectedCountSK : this.shipmentData.totalBox;
      } else {
        this.shipmentData.totalBox = this.totalSelectedCountSK;
      }
    }
    this.editSelectedBoxes();
    this.loadChargeWeight();
    this.isCreatedBox = true;
    this.resetBox();
  }

  deleteItemBox(data: Boxes) {
    this.detectDeleteBox = true;
    this.cloneTotalBox = [];
    this.cloneNewEditBoxes = [];
    this.seletedItemBox = data;
    let index = this.totalBoxes.lastIndexOf(this.seletedItemBox);
    this.cloneTotalBox = this.totalBoxes.splice(index,1);

    if(this.cloneTotalBox[0].code) {
      this.selectedDeleteBoxes = this.selectedDeleteBoxes.concat(this.cloneTotalBox[0]);
    } else {
      let indexDelete = this.newEditBoxes.lastIndexOf(this.cloneTotalBox[0]);
      this.cloneNewEditBoxes = this.newEditBoxes.splice(indexDelete,1);
      this.cloneNewEditBoxes.forEach(x => {
        this.reloadCloneBoxes(this.newEditBoxes.filter((val, i) => val = x));
      });
    }
    this.cloneTotalBox.forEach(x => {
      this.reloadBoxes(this.totalBoxes.filter((val, i) => val = x));
    });
    this.getTotalBoxes();
    // console.log(this.totalBoxes);
    // console.log(this.selectedDeleteBoxes);
    // console.log(this.newEditBoxes);
  }

  editSelectedBoxes(){
    if (this.newEditBoxes) {
      this.newEditBoxes.forEach(x => {
        this.boxService.create(x).subscribe(x => {
          if (!super.isValidResponse(x)) return;
          
          let obj = x.data as Boxes;
        });
      });
    }

    if(this.selectedDeleteBoxes) {
      this.selectedDeleteBoxes.forEach(x => {
        this.boxService.delete({id: x.id}).subscribe(x => {
          if (!super.isValidResponse(x)) return;
          
          let obj = x.data as Boxes;
        });
      });
    } else {
      // console.log("ERR: this.selectedDeleteBoxes  =  null");
    }
  }

  reloadBoxes(list: Boxes[]) {
    this.totalBoxes = list;
  }

  reloadCloneBoxes(list: Boxes[]) {
    this.newEditBoxes = list;
  }

  calculatePrice() {
    // this.resetPrice();
    if (
      this.selectedFromDistrict &&
      // this.selectedCustomer &&
      this.selectedService &&
      this.selectedToDistrict &&
      this.selectedFromWard &&
      this.chargeWeight
    ) {
      let model: ShipmentCalculateViewModel = new ShipmentCalculateViewModel();
      if (this.selectedFromDistrict) {
        model.fromDistrictId = this.selectedFromDistrict;
      }
      model.fromWardId = this.selectedFromWard;
      model.structureId = this.selectedStructure;
      model.insured = this.shipmentData.insured ? this.shipmentData.insured : 0;
      model.otherPrice = this.shipmentData.otherPrice ? this.shipmentData.otherPrice : 0;
      model.cod = this.shipmentData.cod ? this.shipmentData.cod : 0;
      // model.priceListId = this.selectedCustomer.priceListId;
      if (this.selectedCustomer) {
        model.priceListId = this.selectedCustomer.priceListId;
      } else {
        //
      }
      if (this.selectedCustomer) {
        model.senderId = this.selectedCustomer.id;
      }
      // model.senderId = this.selectedCustomer.id;
      model.serviceDVGTIds = this.selectedServiceDVGTs;
      model.serviceId = this.selectedService;
      model.toDistrictId = this.selectedToDistrict;
      model.weight = this.chargeWeight;
      model.isAgreementPrice = this.isAgreementPrice;
      model.defaultPrice = this.shipmentData.defaultPrice ? this.shipmentData.defaultPrice : 0;
      model.totalItem = this.shipmentData.totalItem ? this.shipmentData.totalItem : 0;
      model.calWeight = this.shipmentData.calWeight;
      model.toWardId = this.shipmentData.toWardId;
      // console.log(JSON.stringify(model));
      this.priceService.calculate(model).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let price = x.data as Price;

        this.shipmentData.defaultPrice = price.defaultPrice;
        this.shipmentData.fuelPrice = price.fuelPrice;
        this.shipmentData.otherPrice = price.otherPrice;
        this.shipmentData.remoteAreasPrice = price.remoteAreasPrice;
        this.shipmentData.totalDVGT = price.totalDVGT;
        this.shipmentData.totalPrice = price.totalPrice;
        this.shipmentData.vatPrice = price.vatPrice;
      });
    } else {
      this.resetPrice();
    }
  }

  onDetailVersions(template,data: ShipmentVersion) {
    this.shipmentVersions.forEach(x => {
      if (x.id === data.id) {
        this.showItemShipment = data.id;
      }
    });
    // console.log(data);
    
    this.bsModalRefVersion = this.modalService.show(DetailShipmentVersionComponent, { class: 'inmodal animated bounceInRight modal-lg' });
    let includes = [
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
      Constant.classes.includes.shipment.fromHubRouting,
      // Constant.classes.includes.shipment.serviceDVGT,
      // Constant.classes.includes.shipment.shipmentServiceDVGTs,
      // Constant.classes.includes.shipment.serviceDVGTIds,
      // Constant.classes.includes.shipment.boxes,
    ];

    this.shipmentVersionService
    .get(this.showItemShipment, includes)
    .subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.bsModalRefVersion.content.loadData(x.data as Shipment);
    });
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }

  compareFn(c1: Shipment, c2: Shipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  clone(model: Shipment): Shipment {
    let data = new Shipment();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  keyDownFunction(event) {
    if((event.ctrlKey || event.metaKey) && event.which === KeyCodeUtil.charS) {
      this.save();
      event.preventDefault();
      return false;
    }
  }
}

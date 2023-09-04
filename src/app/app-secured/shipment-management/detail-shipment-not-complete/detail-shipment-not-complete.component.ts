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
import { LadingSchesule } from "../../../models/index";

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
  ServiceService,
  StructureService,
  PriceService,
  BoxService
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
  Service,
  ServiceDVGT,
  Size,
  Price
} from "../../../models/index";
import { PersistenceService, } from "angular-persistence";
import {
  ShipmentCalculateViewModel
} from "../../../view-model/index";
import { FormControl } from "@angular/forms";
// import {} from "googlemaps";
import { GMapHelper } from "../../../infrastructure/gmap.helper";
import { MapsAPILoader } from "@agm/core";
import { PackType } from "../../../models/packType.model";
import { Structure } from "../../../models/structure.model";

//
import { Boxes } from "../../../models/boxes.model";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { KeyCodeUtil } from "../../../infrastructure/keyCode.util";
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
  selector: "detail-shipment-not-complete",
  templateUrl: "detail-shipment-not-complete.component.html",
  styles: [
    `
  agm-map {
    height: 200px;
  }
`
  ]
})
export class DetailShipmentNotCompleteComponent extends BaseComponent {
  checkSubmit: any;
  clonePlace: any;
  cloneWardName: string;
  cloneDistrictName: string;
  cloneProviceName: string;
  cloneNewEditBoxes: Boxes[];
  selectedDeleteBoxes: Boxes[];
  newEditBoxes: Boxes[];
  cloneTotalBox: Boxes[];
  totalTLQD: number = 0;
  objSizes: Size[];
  arrServiceDVGTs: number[] = [];
  arrObjServiceDVGTs: ServiceDVGT[] = [];
  arrObjBoxes: Boxes[] = [];
  shipmentData: Shipment = new Shipment();
  shipmentLadingSchedule: LadingSchesule[] = [];
  unit = environment.unit;
  constructor(
    public bsModalRef: BsModalRef,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    // private requestShipmentService: RequestShipmentService,
    private modalService: BsModalService,
    private userService: UserService,
    private customerService: CustomerService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private wardService: WardService,
    private paymentTypeService: PaymentTypeService,
    private serviceService: ServiceService,
    private serviceDVGTService: ServiceDVGTService,
    private serviceDVGTSByshipmentId: ServiceDVGTService,
    private boxService: BoxService,
    private packTypeService: PackTypeService,
    private sizeService: SizeService,
    private structureService: StructureService,
    private priceService: PriceService,
    private hubService: HubService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }

  //
  modalTitle: string;
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

  ngOnInit() {
    this.initMap();
    // this.initData();
    this.loadCustomer();
    this.loadProvince();
    this.loadCenterHub();
    // this.loadPaymentType();
    this.loadStructure();
    this.loadService();
    this.loadServiceDVGT();
    this.loadPackType();
    this.loadSize();
  }

  initData() {
    // this.shipmentData = new Shipment();
    // this.selectedFromCenterHub = null;
    // this.shipmentData.orderDate = new Date();

    // this.shipmentService.getAll().subscribe(x => {
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

  loadData(shipment: Shipment) {
    this.shipmentData = shipment;
    // this.shipmentLadingSchedule = this.shipmentData.ladingSchedules;
    this.selectedFromCenterHub = null;
    this.selectedData = shipment;
    // console.log(this.shipmentData);

    if (this.shipmentData) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;

      this.searchFromControl.setValue(shipment.pickingAddress);
      let selectedCustomers = this.customers.filter(
        x => (x.value ? x.value.id === shipment.senderId : x.value === 0)
      );
      this.selectedCustomer =
        selectedCustomers.length > 0 ? selectedCustomers[0].value : null;
      if (this.shipmentData.fromProvinceId) {
        if (this.shipmentData.pickUserId) {
          this.selectedEmployee = this.shipmentData.pickUserId;
          setTimeout(() => {
            this.selectedEmployee = this.shipmentData.pickUserId;
          }, 2000);
        } else {
          setTimeout(() => {
            this.selectedEmployee = 0;
            this.shipmentData.pickUserId = null;
          }, 2000);
        }
      }
      this.selectedFromProvince = shipment.fromProvinceId;
      if (this.selectedFromProvince) {
        this.loadFromDistrict(shipment.fromDistrictId);
        this.loadFromWard(shipment.fromDistrictId, shipment.fromWardId);
        this.loadHubFromByWard(shipment.fromWardId);
      }
      this.selectedToProvince = shipment.toProvinceId;
      this.selectedToDistrict = shipment.toDistrictId;
      this.selectedToWard = shipment.toWardId;
      this.selectedToCenterHub = shipment.toProvinceId;
      this.searchToControl.setValue(shipment.shippingAddress);
      this.loadToWard(shipment.toDistrictId, shipment.toWardId);
      this.loadToDistrict(shipment.toProvinceId);
      this.loadHubToByWard(shipment.toWardId);

      if (shipment.paymentTypeId) {
        if(this.selectedCustomer) {
          this.selectedPaymentType = shipment.paymentTypeId;
          this.loadPaymentType(this.selectedCustomer.customerTypeId);
        }
      } else {
        if(this.selectedCustomer) {
          this.selectedPaymentType = null;
          this.loadPaymentType(this.selectedCustomer.customerTypeId);
        }
      }
      if (shipment.structureId) {
        setTimeout(() => {
          this.selectedStructure = shipment.structureId;
        }, 100);
      }
      if (shipment.serviceId) {
        setTimeout(() => {
          this.selectedService = shipment.serviceId;
        }, 100);
      }
      if (shipment.serviceDVGTIds) {
        this.selectedServiceDVGTs = shipment.serviceDVGTIds;
      }
      if (shipment.shippingAddress) {
        this.clonePlace = shipment.shippingAddress;
      }

      this.serviceDVGTSByshipmentId
        .getByShipmentId(shipment.id)
        .subscribe(x => {
          if (!super.isValidResponse(x)) return;
          this.arrObjServiceDVGTs = x.data as ServiceDVGT[];
          this.arrObjServiceDVGTs.forEach(x => {
            this.arrServiceDVGTs.push(x.id);
          });
          this.selectedServiceDVGTs = this.arrServiceDVGTs;
        });

      this.boxService.getByShipmentId(shipment.id).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        this.arrObjBoxes = x.data as Boxes[];
        this.shipmentData.totalBox = this.arrObjBoxes.length;
        let calWeight: number = 0;
        if (this.arrObjBoxes) {
          this.arrObjBoxes.forEach(x => {
            calWeight += x.calWeight;
          });
        }
        this.shipmentData.calWeight = calWeight;
        this.newEditBoxes = [];
        this.selectedDeleteBoxes = [];
        // if(this.shipmentData.boxes) {
        //   this.totalBoxes = this.shipmentData.boxes;
        //   console.log(this.shipmentData.boxes);
        // } else {
        //   // console.log(this.shipmentData.boxes);
        // }
      });

      setTimeout(() => {
        this.totalBoxes = this.arrObjBoxes;
        // console.log(this.totalBoxes);
        this.totalTLQD = shipment.calWeight;
      }, 5000);
    } else {
      //
    }
  }

  resetFromLocationData() {
    this.selectedFromProvince = null;
    this.fromDistricts = [];
    this.selectedFromDistrict = null;
    this.fromWards = [];
    this.selectedFromWard = null;
    this.resetFromHubData();
  }

  resetFromHubData() {
    this.selectedFromCenterHub = null;
    this.fromPoHubs = [];
    this.selectedFromPoHub = null;
    this.fromStationHubs = [];
    this.selectedFromStationHub = null;
  }

  resetToLocationData() {
    this.selectedToProvince = null;
    this.toDistricts = [];
    this.selectedToDistrict = null;
    this.toWards = [];
    this.selectedToWard = null;
    this.resetToHubData();
  }

  resetToHubData() {
    this.selectedToCenterHub = null;
    this.toPoHubs = [];
    this.selectedToPoHub = null;
    this.toStationHubs = [];
    this.selectedToStationHub = null;
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
    this.totalTLQD = null;
    this.totalSelectedCountSK = null;
    this.boxes = null;
    this.totalBoxes = [];
  }

  loadPaymentType(selectedCustomerTypeId: number = null) {
    this.paymentTypes = [];
    // this.selectedPaymentType = null;

    this.paymentTypeService.getPaymentdByCustomerTypeID(selectedCustomerTypeId).subscribe(res => {
      this.paymentTypes = res;
    });
  }

  loadService() {
    this.services = [];
    this.selectedService = null;

    this.serviceService.GetListService().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let services = x.data as Service[];

      this.services.push({ label: "-- Chọn dữ liệu --", value: null });

      services.forEach(element => {
        this.services.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
    });
  }

  loadServiceDVGT() {
    this.serviceDVGTs = [];
    this.selectedServiceDVGTs = [];

    this.serviceService.GetListServiceSub().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      this.serviceDVGTs = x.data as Service[];
    });
  }

  loadStructure() {
    this.structures = [];
    this.selectedStructure = null;

    this.structureService.getAll().subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let structures = x.data as Structure[];

      this.structures.push({ label: "-- Chọn dữ liệu --", value: null });

      structures.forEach(element => {
        this.structures.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
    });
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
    if (!this.selectedFromCenterHub) return;
    this.selectedEmployee = null;
    this.employees = [];

    this.userService.getEmpByHubId(this.selectedFromCenterHub).subscribe(x => {
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

  loadCustomer() {
    this.customers = [];
    this.selectedCustomer = null;

    let includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward
    ];

    this.customerService.getAll(includes).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let objs = x.data as Customer[];

      this.customers.push({ label: `-- Chọn khách hàng --`, value: null });
      objs.forEach(element => {
        this.customers.push({
          label: `${element.code} - ${element.name}`,
          value: element
        });
      });
    });
  }

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
        this.toCenterHubs.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
    });
  }

  loadFromPoHub(selectedPoHub: number = null) {
    this.fromPoHubs = [];
    this.fromStationHubs = [];
    this.selectedFromStationHub = null;
    if (!this.selectedFromCenterHub) return;

    this.hubService
      .getPoHubByCenterId(this.selectedFromCenterHub)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let obj = x.data as Hub[];

        this.fromPoHubs.push({ label: `-- Chọn bưu cục --`, value: null });
        obj.forEach(element => {
          this.fromPoHubs.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
        });

        this.selectedFromPoHub = selectedPoHub;
      });
  }

  loadFromStationHub(
    selectedPoHub: number = null,
    selectedStationHub: number = null
  ) {
    this.fromStationHubs = [];

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
      });
    });
  }

  loadToPoHub(selectedPoHub: number = null) {
    this.toPoHubs = [];
    this.toStationHubs = [];
    this.selectedToStationHub = null;

    if (!this.selectedToCenterHub) return;

    this.hubService
      .getPoHubByCenterId(this.selectedToCenterHub)
      .subscribe(x => {
        if (!super.isValidResponse(x)) return;
        let obj = x.data as Hub[];

        this.toPoHubs.push({ label: `-- Chọn bưu cục --`, value: null });
        obj.forEach(element => {
          this.toPoHubs.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
        });

        this.selectedToPoHub = selectedPoHub;
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
    this.fromDistricts = [];
    this.selectedFromDistrict = null;
    this.fromWards = [];
    this.selectedFromWard = null;
    //
    this.toProvinces = [];
    this.selectedToProvince = null;
    this.toDistricts = [];
    this.selectedToDistrict = null;
    this.toWards = [];
    this.selectedToWard = null;

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
    this.resetFromHubData();

    if (!this.selectedFromProvince) return;

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
        });
        this.selectedFromDistrict = selectedDistrict;
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

      this.fromWards.push({ label: `-- Chọn phường/xã --`, value: null });
      objs.forEach(element => {
        this.fromWards.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });

      this.selectedFromWard = selectedWard;
    });
  }

  loadToDistrict(selectedDistrict: number = null) {
    this.toDistricts = [];
    this.toWards = [];
    this.selectedToWard = null;
    this.resetToHubData();

    if (!this.selectedToProvince) return;

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
          if (selectedDistrict) this.selectedToDistrict = selectedDistrict;
        });
      });
  }

  loadToWard(selectedDistrict: number = null, selectedWard: number = null) {
    this.toWards = [];
    this.resetToHubData();

    if (!this.selectedToDistrict) return;
    if (!this.selectedToDistrict && !selectedDistrict) return;
    if (!selectedDistrict) {
      selectedDistrict = this.selectedToDistrict;
    }
    this.wardService.getWardByDistrictId(selectedDistrict).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let objs = x.data as Ward[];

      this.toWards.push({ label: `-- Chọn phường/xã --`, value: null });
      objs.forEach(element => {
        this.toWards.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });

      if (selectedWard) this.selectedToWard = selectedWard;
    });
  }

  loadLocationFromPlace(place: google.maps.places.PlaceResult) {
    let provinceName = "";
    let districtName = "";
    let wardName = "";

    place.address_components.forEach(element => {
      if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1
      ) {
        provinceName = element.long_name;
      } else if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1
      ) {
        districtName = element.long_name;
      } else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        wardName = element.long_name;
      }
    });

    this.provinceService.getProvinceByName(provinceName).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let province = x.data as Province;
        if (!province) {
          this.selectedFromProvince = null;
          return;
        }
        this.selectedFromProvince = province.id;
        this.selectedFromDistrict = null;

        this.loadFromDistrict();
        this.districtService
          .getDistrictByName(districtName, this.selectedFromProvince)
          .subscribe(
            x => {
              if (!super.isValidResponse(x)) return;
              let district = x.data as District;
              if (!district) {
                this.selectedFromDistrict = null;
                return;
              }
              this.selectedFromDistrict = district.id;
              this.selectedFromWard = null;

              this.loadFromWard();
              this.calculatePrice();
              this.wardService
                .getWardByName(wardName, this.selectedFromDistrict)
                .subscribe(
                  x => {
                    if (!super.isValidResponse(x)) return;
                    let ward = x.data as Ward;

                    if (!ward) {
                      this.selectedFromWard = null;
                      return;
                    }
                    this.selectedFromWard = ward.id;
                    this.loadHubFromByWard();
                  } //End wardService
                );
            } //End districtService
          );
      } //End provinceService
    );
  }

  loadLocationToPlace(place: google.maps.places.PlaceResult) {
    let provinceName = "";
    let districtName = "";
    let wardName = "";

    place.address_components.forEach(element => {
      if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1
      ) {
        provinceName = element.long_name;
      } else if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1
      ) {
        districtName = element.long_name;
      } else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        wardName = element.long_name;
      }
    });

    this.cloneProviceName = provinceName;
    this.cloneDistrictName = districtName;
    this.cloneWardName = wardName;
    this.provinceService.getProvinceByName(provinceName).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let province = x.data as Province;
        if (!province) {
          this.selectedToProvince = null;
          return;
        }
        this.selectedToProvince = province.id;
        this.selectedToDistrict = null;

        this.loadToDistrict();
        this.districtService
          .getDistrictByName(districtName, this.selectedToProvince)
          .subscribe(x => {
            if (!this.cloneDistrictName) {
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
                return;
              }

              this.selectedToDistrict = district.id;
              this.selectedToWard = null;

              this.loadToWard();
              this.calculatePrice();
              this.wardService
                .getWardByName(wardName, this.selectedToDistrict)
                .subscribe(
                  x => {
                    if (!this.cloneWardName) {
                      this.messageService.add({
                        severity: Constant.messageStatus.warn,
                        detail: "Vui lòng chọn Phường/xã nhận!"
                      });
                    } else {
                      if (!super.isValidResponse(x)) return;
                      let ward = x.data as Ward;

                      if (!ward) {
                        this.selectedToWard = null;
                        return;
                      }
                      this.selectedToWard = ward.id;
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
    if (!this.selectedFromWard && !selectedWard) return;

    if (!selectedWard) {
      selectedWard = this.selectedFromWard;
    }

    let includes = [
      Constant.classes.includes.hub.centerHub,
      Constant.classes.includes.hub.poHub
    ];

    this.hubService.getHubByWardId(selectedWard, includes).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let stationHub = x.data as Hub;
      if (stationHub == null) return;

      this.selectedFromCenterHub = stationHub.centerHubId;
      this.loadEmployee();
      this.loadFromPoHub(stationHub.poHubId);
      this.loadFromStationHub(stationHub.poHubId, stationHub.id);
    });
  }

  loadHubToByWard(selectedWard: number = null) {
    this.resetToHubData();
    if (!this.selectedToWard && !selectedWard) return;

    if (!selectedWard) {
      selectedWard = this.selectedToWard;
    }

    let includes = [
      Constant.classes.includes.hub.centerHub,
      Constant.classes.includes.hub.poHub
    ];

    this.hubService.getHubByWardId(selectedWard, includes).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let stationHub = x.data as Hub;
      if (stationHub == null) return;

      this.selectedToCenterHub = stationHub.centerHubId;
      this.loadToPoHub(stationHub.poHubId);
      this.loadToStationHub(stationHub.poHubId, stationHub.id);
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
          this.clonePlace = place;

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

  changeFromWard() {}

  changeFromCenterHub() {
    this.loadFromPoHub();
    this.loadEmployee();
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

  changeToCenterHub() {
    this.loadToPoHub();
  }

  changeToPoHub() {
    this.loadToStationHub();
  }

  changeCustomer() {
    let customer = this.selectedCustomer;
    this.resetFromLocationData();

    if (customer) {
      this.shipmentData.senderName = customer.name;
      this.shipmentData.senderPhone = customer.phoneNumber;
      this.shipmentData.pickingAddress = customer.address;
      this.latitudeFrom = customer.lat;
      this.longitudeFrom = customer.lng;
      this.shipmentData.latFrom = customer.lat;
      this.shipmentData.lngFrom = customer.lng;
      this.shipmentData.currentLat = customer.lat;
      this.shipmentData.currentLng = customer.lng;

      this.searchFromControl.setValue(customer.address);
      this.selectedFromProvince = customer.province.id;

      if (this.selectedFromProvince) {
        this.selectedFromDistrict = null;
        this.loadFromDistrict(customer.district.id);
        this.loadFromWard(customer.district.id, customer.ward.id);
        this.loadHubFromByWard(customer.ward.id);
      }
      this.calculatePrice();
    }
  }

  changeLength(length: number) {
    this.selectedLength = length;
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight =
        this.selectedLength *
        this.selectedWidth *
        this.selectedHeight /
        environment.defaultSize;
    } else {
      this.selectedCalWeight = null;
    }
  }

  changeWidth(width: number) {
    this.selectedWidth = width;
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight =
        this.selectedLength *
        this.selectedWidth *
        this.selectedHeight /
        environment.defaultSize;
    } else {
      this.selectedCalWeight = null;
    }
  }

  changeHeight(height: number) {
    this.selectedHeight = height;
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight =
        this.selectedLength *
        this.selectedWidth *
        this.selectedHeight /
        environment.defaultSize;
    } else {
      this.selectedCalWeight = null;
    }
  }

  changeSize() {
    if (this.selectedSize) {
      this.objSizes.forEach(x => {
        if (x.id == this.selectedSize) {
          this.selectedLength = x.length;
          this.selectedWidth = x.width;
          this.selectedHeight = x.height;

          if (
            this.selectedLength &&
            this.selectedWidth &&
            this.selectedHeight
          ) {
            this.selectedCalWeight =
              this.selectedLength *
              this.selectedWidth *
              this.selectedHeight /
              environment.defaultSize;
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

  refresh() {
    this.resetData();
    this.resetFromHubData();
    this.resetFromLocationData();
    this.resetToHubData();
    this.resetToLocationData();
    this.initData();
  }

  public singleSelect(value: any) {
    this.shipmentData.orderDate = moment(value.start).toDate();
  }

  save() {
    if (!this.isValidToUpdateShipment()) return;
    this.checkSubmit = true;
    this.shipmentData.fromProvinceId = this.selectedFromProvince;
    this.shipmentData.fromDistrictId = this.selectedFromDistrict;
    this.shipmentData.fromWardId = this.selectedFromWard;
    this.shipmentData.serviceDVGTIds = this.selectedServiceDVGTs;
    // console.log(this.selectedServiceDVGTs);
    // console.log(this.shipmentData.serviceDVGTIds);

    if (this.selectedCustomer) {
      this.shipmentData.senderId = this.selectedCustomer.id;
    } else {
      this.shipmentData.senderId = null;
    }
    if (
      this.selectedFromCenterHub &&
      this.selectedFromPoHub &&
      this.selectedFromStationHub
    ) {
      this.shipmentData.fromHubId = this.selectedFromStationHub;
    } else if (this.selectedFromCenterHub && this.selectedFromPoHub) {
      this.shipmentData.fromHubId = this.selectedFromPoHub;
    } else {
      this.shipmentData.fromHubId = this.selectedFromCenterHub;
    }
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

    if (
      this.selectedToCenterHub &&
      this.selectedToPoHub &&
      this.selectedToStationHub
    ) {
      this.shipmentData.toHubId = this.selectedToStationHub;
    } else if (this.selectedToCenterHub && this.selectedToPoHub) {
      this.shipmentData.toHubId = this.selectedToPoHub;
    } else {
      this.shipmentData.toHubId = this.selectedToCenterHub;
    }

    // check shipmentStatus
    if (this.shipmentData.shipmentStatusId !== StatusHelper.notComplete) {
      if (
        this.selectedEmployee &&
        this.shipmentData.fromHubId === this.shipmentData.toHubId
      ) {
        this.shipmentData.shipmentStatusId =
          StatusHelper.assignEmployeeDelivery;
        this.shipmentData.deliverUserId = this.selectedEmployee;
        this.shipmentData.currentEmpId = this.selectedEmployee;
      } else if (this.shipmentData.fromHubId !== this.shipmentData.toHubId) {
        this.shipmentData.shipmentStatusId = StatusHelper.waitingToTransfer;
      }
    } else {
      if (this.shipmentData.totalPrice > 0) {
        if (this.shipmentData.fromHubId === this.shipmentData.toHubId) {
          this.shipmentData.shipmentStatusId = StatusHelper.readyToDelivery;
          // console.log(this.shipmentData.shipmentStatusId);
        } else {
          this.shipmentData.shipmentStatusId = StatusHelper.waitingToTransfer;
          // console.log(this.shipmentData.shipmentStatusId);
        }
      }
    }

    if (!this.selectedEmployee) {
      this.shipmentData.deliverUserId = null;
    }

    this.shipmentData.totalBox = this.shipmentData.totalBox
      ? this.shipmentData.totalBox
      : 0;
    this.shipmentData.calWeight = this.shipmentData.calWeight
      ? this.shipmentData.calWeight
      : 0;
    this.shipmentData.height = this.shipmentData.height
      ? this.shipmentData.height
      : 0;
    this.shipmentData.length = this.shipmentData.length
      ? this.shipmentData.length
      : 0;
    this.shipmentData.width = this.shipmentData.width
      ? this.shipmentData.width
      : 0;
    this.shipmentData.cod = this.shipmentData.cod ? this.shipmentData.cod : 0;
    this.shipmentData.otherPrice = this.shipmentData.otherPrice
      ? this.shipmentData.otherPrice
      : 0;
    this.shipmentData.defaultPrice = this.shipmentData.defaultPrice
      ? this.shipmentData.defaultPrice
      : 0;
    this.shipmentData.fuelPrice = this.shipmentData.fuelPrice
      ? this.shipmentData.fuelPrice
      : 0;
    this.shipmentData.otherPrice = this.shipmentData.otherPrice
      ? this.shipmentData.otherPrice
      : 0;
    this.shipmentData.remoteAreasPrice = this.shipmentData.remoteAreasPrice
      ? this.shipmentData.remoteAreasPrice
      : 0;
    this.shipmentData.totalDVGT = this.shipmentData.totalDVGT
      ? this.shipmentData.totalDVGT
      : 0;
    this.shipmentData.totalPrice = this.shipmentData.totalPrice
      ? this.shipmentData.totalPrice
      : 0;
    this.shipmentData.vatPrice = this.shipmentData.vatPrice
      ? this.shipmentData.vatPrice
      : 0;

    // console.log(JSON.stringify(this.shipmentData));
    // console.log(this.shipmentData.boxes);
    // console.log(this.shipmentData.totalBox);
    // console.log(this.shipmentData.shipmentStatusId);

    this.shipmentService.update(this.shipmentData).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);

        this.messageService.add({ severity: Constant.messageStatus.success, detail: "Sửa đơn hàng thành công" });
        this.bsModalRef.hide();
        this.resetData();
      }
    );
  }

  isValidToUpdateShipment(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.shipmentData.senderPhone) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập số điện thoại người gửi"
      });
      result = false;
    }

    if (!this.shipmentData.senderName) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập tên người gửi"
      });
      result = false;
    }
    //
    if (!this.shipmentData.receiverPhone) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập số điện thoại người nhận"
      });
      result = false;
    }

    if (!this.shipmentData.receiverName) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập tên người nhận"
      });
      result = false;
    }

    if (!this.clonePlace) {
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

    if (!this.selectedToWard) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn phường/xã nhận"
      });
      result = false;
    }

    if (
      !this.selectedToCenterHub &&
      !this.selectedToPoHub &&
      !this.selectedToStationHub
    ) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn TT/CN/T nhận"
      });
      result = false;
    }

    if (!this.shipmentData.weight) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập trọng lượng"
      });
      result = false;
    } else if (this.shipmentData.weight == 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Trọng lượng phải lớn hơn 0"
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
    //   messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn dịch vụ" });
    //   result = false;
    // }

    if (!this.shipmentData.totalPrice) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy bảng giá"
      });
      result = false;
    } else if (this.shipmentData.totalPrice === 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy bảng giá"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  isValidToCreateBox(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedPackType) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn loại đóng gói"
      });
      result = false;
    }

    if (!this.selectedWeight) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập trọng lượng"
      });
      result = false;
    }

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

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  createBox() {
    if (!this.isValidToCreateBox()) return;

    this.boxes = [];
    this.totalTLQD = 0;
    if (
      this.selectedLength &&
      this.selectedWidth &&
      this.selectedHeight &&
      this.selectedWeight &&
      this.selectedPackType
    ) {
      const obj: Boxes = new Boxes();

      if (!this.selectedPackType) {
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
      if (this.selectedCountSK == 0) {
        this.boxes = [];
      } else if (!this.selectedCountSK || this.selectedCountSK == 1) {
        this.boxes.push(obj);
      } else {
        this.boxes = [];
        for (let i = 1; i <= this.selectedCountSK; i++) {
          this.boxes.push(obj);
        }
      }
      if (this.boxes && this.totalBoxes) {
        this.totalBoxes = this.totalBoxes.concat(this.boxes);
      }

      this.totalSelectedCountSK =
        this.arrObjBoxes.length + this.selectedCountSK;
      this.newEditBoxes = this.newEditBoxes.concat(this.boxes);
    }

    this.getTotalBoxes();
  }

  getTotalBoxes() {
    if (this.totalBoxes) {
      this.totalBoxes.forEach(x => {
        this.totalTLQD += x.calWeight;
      });
      this.totalSelectedCountSK = this.totalBoxes.length;
    }
  }

  saveBox() {
    // console.log(this.totalBoxes);
    // console.log(this.selectedDeleteBoxes);
    // console.log(this.newEditBoxes);
    if (this.boxes && this.selectedPackType) {
      this.shipmentData.boxes = this.totalBoxes;
      this.shipmentData.calWeight = this.totalTLQD;
      this.shipmentData.totalBox = this.totalBoxes.length;
    }
    this.editSelectedBoxes();
  }

  deleteItemBox(data: Boxes) {
    this.totalTLQD = 0;
    this.cloneTotalBox = [];
    this.cloneNewEditBoxes = [];
    this.seletedItemBox = data;
    let index = this.totalBoxes.lastIndexOf(this.seletedItemBox);
    this.cloneTotalBox = this.totalBoxes.splice(index, 1);

    if (this.cloneTotalBox[0].code) {
      this.selectedDeleteBoxes = this.selectedDeleteBoxes.concat(
        this.cloneTotalBox[0]
      );
    } else {
      let indexDelete = this.newEditBoxes.lastIndexOf(this.cloneTotalBox[0]);
      this.cloneNewEditBoxes = this.newEditBoxes.splice(indexDelete, 1);
      this.cloneNewEditBoxes.forEach(x => {
        this.reloadCloneBoxes(this.newEditBoxes.filter((val, i) => (val = x)));
      });
    }
    this.cloneTotalBox.forEach(x => {
      this.reloadBoxes(this.totalBoxes.filter((val, i) => (val = x)));
    });
    this.getTotalBoxes();
    // console.log(this.totalBoxes);
    // console.log(this.selectedDeleteBoxes);
    // console.log(this.newEditBoxes);
  }

  editSelectedBoxes() {
    if (this.newEditBoxes) {
      this.newEditBoxes.forEach(x => {
        this.boxService.create(x).subscribe(x => {
          if (!super.isValidResponse(x)) return;

          let obj = x.data as Boxes;
        });
      });
    }

    if (this.selectedDeleteBoxes) {
      this.selectedDeleteBoxes.forEach(x => {
        this.boxService.delete({ id: x.id }).subscribe(x => {
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
    if (
      this.selectedFromDistrict &&
      this.selectedCustomer &&
      this.selectedService &&
      this.selectedToDistrict &&
      this.shipmentData.weight
    ) {
      let model: ShipmentCalculateViewModel = new ShipmentCalculateViewModel();
      model.fromDistrictId = this.selectedFromDistrict;
      model.insured = this.shipmentData.insured ? this.shipmentData.insured : 0;
      model.otherPrice = this.shipmentData.otherPrice
        ? this.shipmentData.otherPrice
        : 0;
      model.priceListId = this.selectedCustomer.priceListId;
      model.senderId = this.selectedCustomer.id;
      model.serviceDVGTIds = this.selectedServiceDVGTs;
      model.serviceId = this.selectedService;
      model.toDistrictId = this.selectedToDistrict;
      model.totalItem = this.shipmentData.totalItem ? this.shipmentData.totalItem : 0;
      model.calWeight = this.shipmentData.calWeight;
      model.toWardId = this.shipmentData.toWardId;
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
    }
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }
  compareFn(c1: Shipment, c2: Shipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  keyDownFunction(event) {
    if((event.ctrlKey || event.metaKey) && event.which === KeyCodeUtil.charS) {
      this.save();
      event.preventDefault();
      return false;
    }
  }
}

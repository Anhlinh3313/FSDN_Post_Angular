import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { Constant } from '../../../../infrastructure/constant';
import { Shipment, Customer, PriceDVGT, Service } from '../../../../models';
import { MessageService } from 'primeng/components/common/messageservice';
import { ShipmentService, ServiceDVGTService, CustomerService, CustomerInfoLogService, PaymentTypeService, GeocodingApiService, PriceService, ProvinceService, DistrictService, WardService, HubService, ShipmentVersionService, DeadlinePickupDeliveryService, AuthService, BoxService, SizeService, PackTypeService, UserService, StructureService, PriceListService, PriceServiceService, ServiceService } from '../../../../services';
import { SelectModel } from '../../../../models/select.model';
import { SearchCusstomerHelper } from '../../../../infrastructure/searchCustomer.helper';
import { CustomerInfoLog } from '../../../../models/customerInfoLog.model';
import { SelectItem, Message } from 'primeng/primeng';
import { PaymentTypeHelper } from '../../../../infrastructure/paymentType.helper';
import { MapsAPILoader } from '@agm/core';
import { GMapHelper } from '../../../../infrastructure/gmap.helper';
import { InputValue } from '../../../../infrastructure/inputValue.helper';
import { EntryShipment } from '../../../../models/abstract/entryShipment.interface';
import { EntryShipmentServiceInstance } from '../../../../services/entryShipment.serviceInstace.';
import { PrintHelper } from '../../../../infrastructure/printHelper';
import { PrintFrormServiceInstance } from '../../../../services/printTest.serviceInstace';
import { GeneralInfoService } from '../../../../services/generalInfo.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BoxServiceInstance } from '../../../../services/box.serviceInstance';
import { BoxComponent } from '../../../component-helper/shipment/box-helper.component';
import { CommandService } from '../../../../services/command.service';
import { Subscription } from 'rxjs/Subscription';
import { Command } from '../../../../models/abstract/command.interface';
import { SoundHelper } from '../../../../infrastructure/sound.helper';
import { environment } from '../../../../../environments/environment';
import { PermissionService } from '../../../../services/permission.service';
import { Router } from '@angular/router';
import { CusDepartmentService } from '../../../../services/cusDepartment.service.';
import { StringHelper } from '../../../../infrastructure/string.helper';
import { CusDepartment } from '../../../../models/cusDepartment.model';
import { ShipmentVersionHelper } from '../../../../infrastructure/shipmentVersion.helper';

@Component({
  selector: 'app-update-bill-of-request',
  templateUrl: './update-bill-of-request.component.html',
  styles: []
})
export class UpdateBillOfRequestComponent extends BoxComponent implements OnInit, OnDestroy {
  //#region params basic
  shipmentName: string = "Vặn đơn";
  requestShipmentName: string = "Yêu cầu";
  //#endregion
  filteredSenderNames: any[];
  filteredSenderPhones: any[];
  filteredSenderCompanies: any[];
  hub = environment;
  unit = environment.unit;
  arrSelectedShipmentNumber: string[];
  shipmentNumber: string;
  selectedShipmentType: boolean;
  subscription: Subscription;
  idPrint: string;
  isPrintShipmet: boolean;
  toProvinces: SelectItem[];
  cloneallShipmentEntries: EntryShipment[];
  checkSubmit: boolean;
  zoom: number;
  paymentType: string;
  paymentTypes: SelectItem[];
  selectedPaymentType: number;
  filteredPaymentTypes: any[];
  receiverCompany: string;
  filteredReceiverCompanies: any[];
  receiverName: string;
  filteredReceiverNames: any[];
  selectedCustomerInfoLogs: CustomerInfoLog;
  customerInfoLogs: CustomerInfoLog[];
  receiverPhone: string;
  filteredReceiverPhones: any[];
  serviceDVGTsLS: number[];
  selectedServiceDVGTs: number[];
  serviceDVGTs: Service[];
  allShipmentEntries: EntryShipment[];
  listCode: any;
  customers: SelectModel[];
  fromProvinces: SelectItem[];
  structures: SelectModel[];

  constructor(
    protected shipmentService: ShipmentService,
    protected customerInfoLogService: CustomerInfoLogService,
    protected paymentTypeService: PaymentTypeService,
    protected mapsAPILoader: MapsAPILoader,
    protected ngZone: NgZone,
    protected geocodingApiService: GeocodingApiService,
    protected provinceService: ProvinceService,
    protected districtService: DistrictService,
    protected wardService: WardService,
    protected hubService: HubService,
    protected shipmentVersionService: ShipmentVersionService,
    protected entryShipmentServiceInstance: EntryShipmentServiceInstance,
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected deadlinePickupDeliveryService: DeadlinePickupDeliveryService,
    protected priceListService: PriceListService,
    protected serviceDVGTService: ServiceDVGTService,
    protected serviceService: ServiceService,
    protected boxService: BoxService,
    protected priceService: PriceService,
    protected boxServiceInstance: BoxServiceInstance,
    protected generalInfoService: GeneralInfoService,
    protected authService: AuthService,
    protected modalService: BsModalService,
    protected sizeService: SizeService,
    protected messageService: MessageService,
    protected packTypeService: PackTypeService,
    protected priceServiceService: PriceServiceService,
    protected customerService: CustomerService,
    protected commandService: CommandService,
    protected cusDepartmentService: CusDepartmentService,
    protected userService: UserService,
    protected structureService: StructureService,
    public permissionService: PermissionService,
    public router: Router
  ) {
    super(modalService, sizeService, messageService, packTypeService, boxServiceInstance, priceServiceService, customerService, deadlinePickupDeliveryService, priceListService, serviceDVGTService, boxService, priceService, generalInfoService, authService, permissionService, router);
  }

  parentPage: string = Constant.pages.shipment.name;
  currentPage: string = Constant.pages.shipment.children.entryShipmentDetail.name;

  async ngOnInit() {
    this.subscription = this.commandService.commands.subscribe(c => this.handleCommand(c));
    this.arrSelectedShipmentNumber = [];
    this.onGetEntryShipmentFromShipmentRequest();
    this.loadServiceDVGT();
    this.loadCustomerInfoLog();
    this.loadProvince();
    // get all Structures
    const structures = await this.structureService.getSelectModelStructuresAsync();
    if (structures) {
      this.structures = structures;
    }
    // get all paymentTypes
    const paymentTypes = await this.paymentTypeService.getAllSelectModelAsync();
    if (paymentTypes) {
      this.paymentTypes = paymentTypes;
    }
    // get all Customer
    const includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward
    ];
    this.customers = await this.customerService.getAllSelectModelAsync(includes);
  }

  handleCommand(command: Command) {
    switch (command.name) {
      case 'EntryShipmentDetailComponent.Ctrl+S':
        if (!this.checkSubmit) {
          this.updateShipments(false);
        }
        break;
        ;
      case 'EntryShipmentDetailComponent.Ctrl+Q':
        if (!this.checkSubmit) {
          this.updateShipments(true);
        }
        break;
        ;
      case 'EntryShipmentDetailComponent.Ctrl+R':
        this.refreshUpdateBill();
        break;
    }
  }

  onGetEntryShipmentFromShipmentRequest() {
    this.entryShipmentServiceInstance.getEventSubject.subscribe(data => {
      if (data) {
        if (data) {
          this.scanListCode(null, data);
        }
      }
    });
  }

  async scanListCode(txtListCode?: any, entryShipmentFromRequestShipment?: EntryShipment[]) {
    let listCode: string = "";
    if (txtListCode) {
      listCode = txtListCode.value.trim();
      this.allShipmentEntries = [];
      if (!listCode || listCode == "") {
        this.messageService.add({
          severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập mã bảng kê!',
        });
        // SoundHelper.getSoundMessage(Constant.messageStatus.warn);
        txtListCode.value = null;
        return;
      }
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

    let shipments: Shipment[] = [];
    if (entryShipmentFromRequestShipment) {
      shipments = entryShipmentFromRequestShipment;
    } else {
      shipments = await this.shipmentService.getByListGoodsCodeAsync(listCode, includes);
    }
    if (shipments) {
      this.cloneallShipmentEntries = shipments.map(x => Object.assign({}, x)) as EntryShipment[];
      this.allShipmentEntries = shipments as EntryShipment[];
      await Promise.all(this.allShipmentEntries.map(async element => {
        if (!element.totalItem) {
          element.totalItem = 1;
        }
        // load customer
        await this.loadCustomer(element);
        // load priceList
        await this.loadPriceList(element);
        // load pickupUser
        this.loadPickupUser(element);
        // load structure
        this.loadStructure(element);
        // load cusDEpartment
        this.loadCusDepartment(element);
        // load DVGTS
        this.loadServiceDVGTLS(element);
        // load PaymentType
        this.loadPaymentType(element);
        // load Service
        await this.loadServiceSP(element);
        // load GoogleMap
        this.initMap(element);
        // load fromLocation
        const findFromProvince = this.fromProvinces.find(x => x.value == element.fromProvinceId);
        if (findFromProvince) {
          element.fromProvinceLabel = findFromProvince.label;
        }
        if (element.fromProvinceId) {
          this.loadFromDistrict(element);
          this.loadFromWard(element);
          this.loadHubFromByWard(element);
        }
        // load toLocation
        const findToProvince = this.toProvinces.find(x => x.value == element.toProvinceId);
        if (findToProvince) {
          element.toProvinceLabel = findToProvince.label;
        }
        if (element.toProvinceId) {
          this.loadToDistrict(element);
          this.loadToWard(element);
          this.loadHubToByWard(element);
        }
        // load deliveryUser
        this.loadDeliveryUser(element);
        // load Boxes
        this.loadBoxes(element);
      }));
    } else {
      txtListCode.value = null;
    }
  }

  async scanShipmentNumber(txtShipmentNumber?: any) {
    this.messageService.clear();
    let messageWarn: string = "";
    let messageErr: string = "";
    let messageSuccess: string = "";
    let finalTypeMessage: string = "";
    const input = InputValue.trimInput(txtShipmentNumber);
    if (input == "") {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã vận đơn"
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      txtShipmentNumber = null;
      this.shipmentNumber = null;
      return;
    }

    // begin scan shipment
    let arraySN = input.split(" ");

    const duplicateSN = this.arrSelectedShipmentNumber.filter(x => arraySN.includes(x));
    if (duplicateSN) {
      if (duplicateSN.length > 0) {
        const duplicateSNString = duplicateSN.join(", ");
        messageWarn = "Đã quét mã vận đơn " + duplicateSNString + " trước đó!" + `<br>`;
      }
    }
    arraySN = arraySN.filter(x => !duplicateSN.includes(x));

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

    let noExistSN: string[] = [];
    let shipments: Shipment[] = [];
    if (arraySN.length > 0) {
      // scan shipmentNumbers
      await Promise.all(arraySN.map(async shipmentNumber => {
        const itemShipment = await this.shipmentService.trackingShortAsync(shipmentNumber, includes);
        if (itemShipment) {
          shipments.unshift(itemShipment);
          this.arrSelectedShipmentNumber.push(itemShipment.shipmentNumber);
        } else {
          noExistSN.push(shipmentNumber);
        }
      }));
      if (noExistSN.length > 0) {
        const noExistSNString = noExistSN.join(", ");
        messageErr = "Không tìm thấy vận đơn " + noExistSNString + `<br>`;
      }
      const scanSuccesSN = arraySN.length - noExistSN.length;
      if (scanSuccesSN > 0) {
        messageSuccess = "Quét thành công " + scanSuccesSN + " vận đơn" + `<br>`;
      }
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
    this.shipmentNumber = null;
    // end scan shipment
    if (shipments.length > 0) {
      if (this.cloneallShipmentEntries) {
        this.cloneallShipmentEntries = shipments.concat(this.cloneallShipmentEntries).map(x => Object.assign({}, x)) as EntryShipment[];
      } else {
        this.cloneallShipmentEntries = shipments.map(x => Object.assign({}, x)) as EntryShipment[];
      }
      if (this.allShipmentEntries) {
        this.allShipmentEntries = shipments.concat(this.allShipmentEntries) as EntryShipment[];
      } else {
        this.allShipmentEntries = shipments as EntryShipment[];
      }
      // console.log(this.allShipmentEntries);
      await Promise.all(this.allShipmentEntries.map(async element => {
        // load customer
        await this.loadCustomer(element);
        // load pickupUser
        // load priceList
        await this.loadPriceList(element); 
        this.loadPickupUser(element);
        // load structure
        this.loadStructure(element);
        // load cusDEpartment
        this.loadCusDepartment(element);
        // load DVGTS
        this.loadServiceDVGTLS(element);
        // load PaymentType
        this.loadPaymentType(element);
        // load GoogleMap
        // load Service
        await this.loadServiceSP(element);
        this.initMap(element);
        // load fromLocation
        const findFromProvince = this.fromProvinces.find(x => x.value === element.fromProvinceId);
        if (findFromProvince) {
          element.fromProvinceLabel = findFromProvince.label;
        }
        if (element.fromProvinceId) {
          this.loadFromDistrict(element);
          this.loadFromWard(element);
          this.loadHubFromByWard(element);
        }
        // load toLocation
        const findToProvince = this.toProvinces.find(x => x.value === element.toProvinceId);
        if (findToProvince) {
          element.toProvinceLabel = findToProvince.label;
        }
        if (element.toProvinceId) {
          this.loadToDistrict(element);
          this.loadToWard(element);
          this.loadHubToByWard(element);
        }
        // load deliveryUser
        this.loadDeliveryUser(element);
        // load Boxes
        this.loadBoxes(element);
      }));
    } else {
      txtShipmentNumber = null;
    }
  }

  getShipmentsByShipmentNumbers() {

  }

  initMap(shipment: EntryShipment) {
    this.zoom = 4;
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let fromAutocomplete = new google.maps.places.Autocomplete(
        <HTMLInputElement>document.getElementById('idFrom' + shipment.shipmentNumber),
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
              this.resetFromLocation(shipment);
              this.resetService(shipment);
              this.resetPrice(shipment);
              return;
            }
          }
          //
          this.loadLocationFromPlace(place, shipment);
          shipment.pickingAddress = place.formatted_address;
          //set latitude, longitude and zoom
          const latitudeFrom = place.geometry.location.lat();
          const longitudeFrom = place.geometry.location.lng();
          shipment.latTo = latitudeFrom;
          shipment.lngTo = longitudeFrom;
          this.zoom = 16;
        });
      });
    });
    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let toAutocomplete = new google.maps.places.Autocomplete(
        <HTMLInputElement>document.getElementById('idTo' + shipment.shipmentNumber),
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
              this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy địa chỉ" });
              this.resetToLocation(shipment);
              this.resetService(shipment);
              this.resetPrice(shipment);
              return;
            }
          }
          //
          this.loadLocationToPlace(place, shipment);
          shipment.shippingAddress = place.formatted_address;
          //set latitude, longitude and zoom
          const latitudeTo = place.geometry.location.lat();
          const longitudeTo = place.geometry.location.lng();
          shipment.latTo = latitudeTo;
          shipment.lngTo = longitudeTo;
          this.zoom = 16;
        });
      });
    });
  }

  async loadLocationFromPlace(place: google.maps.places.PlaceResult, shipment: EntryShipment) {
    let provinceName = "";
    let districtName = "";
    let wardName = "";

    place = await this.geocodingApiService.findFirstFromLatLngAsync(
      place.geometry.location.lat(),
      place.geometry.location.lng()
    ) as google.maps.places.PlaceResult;

    place.address_components.forEach(element => {
      if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1
      ) {
        provinceName = element.long_name;
      } else if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1
      ) {
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_3) !== -1) {
        wardName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        wardName = element.long_name;
      }
    });
    //
    const province = await this.provinceService.getProvinceByNameAsync(provinceName);
    if (!province) {
      this.resetFromLocation(shipment);
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    }
    const provinceId = province.id;
    shipment.fromProvinceId = provinceId;
    shipment.fromProvinceLabel = `${province.code} - ${province.name}`;

    this.loadFromDistrict(shipment);
    //
    if (!districtName) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn Quận/huyện gửi!"
      });
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn Phường/xã gửi!"
      });
    }
    const district = await this.districtService.getDistrictByNameAsync(districtName, provinceId);
    if (!district) {
      shipment.fromDistrictId = null;
      shipment.fromDistricts = null;
      shipment.fromDistrictLabel = null;
      shipment.fromWardId = null;
      shipment.fromWardLabel = null;
      shipment.fromWards = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    }
    const districtId = district.id;
    shipment.fromDistrictId = districtId;
    shipment.fromDistrictLabel = `${district.code} - ${district.name}`;

    this.loadFromWard(shipment);
    this.loadServiceSP(shipment);
    //
    if (!wardName) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn Phường/xã nhận!"
      });
    }
    const ward = await this.wardService.getWardByNameAsync(wardName, districtId);
    if (!ward) {
      shipment.fromWardId = null;
      shipment.fromWards = null;
      shipment.fromWardLabel = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    }
    const wardId = ward.id;
    shipment.fromWardId = wardId;
    shipment.fromWardLabel = `${ward.code} - ${ward.name}`;
    this.loadHubFromByWard(shipment);
  }

  async loadLocationToPlace(place: google.maps.places.PlaceResult, shipment: EntryShipment) {
    let provinceName = "";
    let districtName = "";
    let wardName = "";

    place = await this.geocodingApiService.findFirstFromLatLngAsync(
      place.geometry.location.lat(),
      place.geometry.location.lng()
    ) as google.maps.places.PlaceResult;

    place.address_components.forEach(element => {
      if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1
      ) {
        provinceName = element.long_name;
      } else if (
        element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1
      ) {
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_3) !== -1) {
        wardName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        wardName = element.long_name;
      }
    });
    //
    const province = await this.provinceService.getProvinceByNameAsync(provinceName);
    if (!province) {
      this.resetToLocation(shipment);
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    }
    const provinceId = province.id;
    shipment.toProvinceId = provinceId;
    shipment.toProvinceLabel = `${province.code} - ${province.name}`;

    this.loadToDistrict(shipment);
    //
    if (!districtName) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn Quận/huyện nhận!"
      });
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn Phường/xã nhận!"
      });
    }
    const district = await this.districtService.getDistrictByNameAsync(districtName, provinceId);
    if (!district) {
      shipment.toDistrictId = null;
      shipment.toDistricts = null;
      shipment.toDistrictLabel = null;
      shipment.toWardId = null;
      shipment.toWardLabel = null;
      shipment.toWards = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    }
    const districtId = district.id;
    shipment.toDistrictId = districtId;
    shipment.toDistrictLabel = `${district.code} - ${district.name}`;

    this.loadToWard(shipment);
    this.loadServiceSP(shipment);
    //
    if (!wardName) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn Phường/xã nhận!"
      });
    }
    const ward = await this.wardService.getWardByNameAsync(wardName, districtId);
    if (!ward) {
      shipment.toWardId = null;
      shipment.toWards = null;
      shipment.toWardLabel = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    }
    const wardId = ward.id;
    shipment.toWardId = wardId;
    shipment.toWardLabel = `${ward.code} - ${ward.name}`;
    this.loadHubToByWard(shipment);
  }

  async loadHubFromByWard(shipment: EntryShipment) {
    const selectedWard = shipment.fromWardId;
    if (!selectedWard) return;
    shipment.fromHubs = [];
    const includes = [
      Constant.classes.includes.hub.centerHub,
      Constant.classes.includes.hub.poHub
    ];

    shipment.fromHubs = await this.hubService.getSelectModelgetListHubByWardIdAsync(selectedWard, includes);
    const stationHub = await this.hubService.getHubByWardIdAsync(selectedWard, includes);
    if (stationHub == null) return;
    if (shipment.fromHubs) {
      const fromHub =  shipment.fromHubs.find(x => x.value == stationHub.id);
      if (fromHub) {
        shipment.fromHubId = fromHub.value;
      }
    }
    this.loadServiceSP(shipment);
  }

  async loadHubToByWard(shipment: EntryShipment) {
    const selectedWard = shipment.toWardId;
    if (!selectedWard) return;
    shipment.toHubs = [];
    const includes = [
      Constant.classes.includes.hub.centerHub,
      Constant.classes.includes.hub.poHub
    ];

    shipment.toHubs = await this.hubService.getSelectModelgetListHubByWardIdAsync(selectedWard, includes);
    const stationHub = await this.hubService.getHubByWardIdAsync(selectedWard, includes);
    if (stationHub == null) return;
    shipment.toCenterHubId = stationHub.centerHubId;
    if (shipment.toHubs) {
      const toHub = shipment.toHubs.find(x => x.value == stationHub.id);
      if (toHub) {
        shipment.toHubId = toHub.value;
        shipment.toHubLabel = toHub.label;
      }
    }
    this.loadDeliveryUser(shipment);
  }

  async loadFromDistrict(shipment?: EntryShipment) {
    if (!shipment.fromProvinceId) {
      shipment.fromDistrictId = null;
      shipment.fromDistricts = null;
      shipment.fromDistrictLabel = null;
      shipment.fromWardId = null;
      shipment.fromWardLabel = null;
      shipment.fromWards = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    };
    shipment.fromDistricts = await this.districtService.getSelectModelDistrictByProvinceIdAsync(shipment.fromProvinceId);
    if (shipment.fromDistricts) {
      const fromDistricts = shipment.fromDistricts;
      const indexfromDistrict = fromDistricts.findIndex(x => x.value == shipment.fromDistrictId);
      if (indexfromDistrict !== -1) {
        shipment.fromDistrictLabel = shipment.fromDistricts[indexfromDistrict].label;
      } else {
        shipment.fromDistrictLabel = shipment.fromDistricts[0].label;
      }
    }
    // this.loadServiceSP(shipment);
  }

  async loadToDistrict(shipment?: EntryShipment) {
    if (!shipment.toProvinceId) {
      shipment.toDistrictId = null;
      shipment.toDistricts = null;
      shipment.toDistrictLabel = null;
      shipment.toWardId = null;
      shipment.toWardLabel = null;
      shipment.toWards = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    };
    shipment.toDistricts = await this.districtService.getSelectModelDistrictByProvinceIdAsync(shipment.toProvinceId);
    if (shipment.toDistricts) {
      const toDistricts = shipment.toDistricts;
      const indextoDistrict = toDistricts.findIndex(x => x.value == shipment.toDistrictId);
      if (indextoDistrict !== -1) {
        shipment.toDistrictLabel = shipment.toDistricts[indextoDistrict].label;
      } else {
        shipment.toDistrictLabel = shipment.toDistricts[0].label;
      }
    }
    this.loadServiceSP(shipment);
    this.loadDeadlinePickupDelivery(shipment);
  }

  async loadFromWard(shipment?: EntryShipment) {
    if (!shipment.fromDistrictId) {
      shipment.fromWardId = null;
      shipment.fromWards = null;
      shipment.fromWardLabel = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    };
    shipment.fromWards = await this.wardService.getSelectModelWardByDistrictIdAsync(shipment.fromDistrictId);
    if (shipment.fromWards) {
      const fromWards = shipment.fromWards;
      const indexfromWard = fromWards.findIndex(x => x.value === shipment.fromWardId);
      if (indexfromWard !== -1) {
        shipment.fromWardLabel = shipment.fromWards[indexfromWard].label;
      } else {
        shipment.fromWardLabel = shipment.fromWards[0].label;
      }
    }
    // this.loadServiceSP(shipment);
  }

  async loadToWard(shipment?: EntryShipment) {
    if (!shipment.toDistrictId) {
      shipment.toWardId = null;
      shipment.toWards = null;
      shipment.toWardLabel = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    };
    shipment.toWards = await this.wardService.getSelectModelWardByDistrictIdAsync(shipment.toDistrictId);
    if (shipment.toWards) {
      const toWards = shipment.toWards;
      const indextoWard = toWards.findIndex(x => x.value === shipment.toWardId);
      if (indextoWard !== -1) {
        shipment.toWardLabel = shipment.toWards[indextoWard].label;
      } else {
        shipment.toWardLabel = shipment.toWards[0].label;
      }
    }
  }

  // load DVGT
  async loadServiceDVGT() {
    this.serviceDVGTs = [];
    this.selectedServiceDVGTs = [];
    this.serviceDVGTs = await this.serviceService.GetListServiceSubAsync();
  }

  async loadServiceDVGTLS(shipment: EntryShipment) {
    this.serviceDVGTsLS = [];
    const data = await this.serviceDVGTService.getByShipmentIdAsync(shipment.id);
    if (data) {
      this.serviceDVGTsLS = data.map(x => x.id);
      shipment.serviceDVGTIds = this.serviceDVGTsLS;
      shipment.priceDVGTs = data.map(x => {
        let priceDVGT:PriceDVGT = new PriceDVGT();
        priceDVGT.code = x.code;
        priceDVGT.name = x.name;
        //priceDVGT.isAgree = x.is
        priceDVGT.serviceId = x.id;
        priceDVGT.totalPrice =  x.price;
        priceDVGT.vSEOracleCode = x.vseOracleCode;
        return priceDVGT;
      });
    }
  }

  async loadPickupUser(shipment: EntryShipment) {
    const fromHubId = shipment.fromHubId;
    const pickUserId = shipment.pickUserId;
    if (fromHubId) {
      const data = await this.userService.getSelectModelAllEmpByHubIdAsync(shipment.fromHubId);
      if (data) {
        shipment.pickupUsers = data;
        const pickupUser = data.find(x => (x.value && x.value == pickUserId));
        if (pickupUser) {
          shipment.pickupUserLabel = pickupUser.label;
        } else {
          shipment.pickUserId = data[1].value;
          shipment.pickupUserLabel = data[1].label;
        }
      }
    }
  }

  async loadDeliveryUser(shipment: EntryShipment) {
    const deliveryUserId = shipment.deliverUserId;
    const toCenterHubId = shipment.toCenterHubId;
    if (toCenterHubId) {
      const data = await this.userService.getSelectModelEmpByHubIdAsync(toCenterHubId);
      if (data) {
        shipment.deliveryUsers = data;
        const deliveryUser = data.find(x => x.value == deliveryUserId);
        if (deliveryUser) {
          shipment.deliveryUserLabel = deliveryUser.label;
        }
      }
    }
  }

  async loadCustomer(shipment: EntryShipment) {
    const senderId = shipment.senderId;
    if (senderId) {
      const customer = this.customers.find(x => x.value == senderId);
      if (customer) {
        shipment.customerLabel = customer.label;
        shipment.cloneCustomer = Object.assign({}, customer.data);
      }
    }
  }

  async changeCustomer(shipment: EntryShipment, customer: Customer) {
    this.resetFromLocation(shipment);
    // this.resetFromHub(shipment);
    if (customer) {
      shipment.cloneCustomer = Object.assign({}, customer);
      shipment.senderName = customer.name;
      shipment.senderPhone = customer.phoneNumber;
      shipment.companyFrom = customer.companyName;
      shipment.addressNoteFrom = customer.addressNote;
      shipment.pickingAddress = customer.address;
      shipment.latFrom = customer.lat;
      shipment.lngFrom = customer.lng;
      shipment.currentLat = customer.lat;
      shipment.currentLng = customer.lng;

      if (!customer.provinceId || !customer.districtId || !customer.wardId || StringHelper.isNullOrEmpty(customer.address)) {
        this.messageService.add({
          severity: Constant.messageStatus.warn, detail: `${customer.name} chưa được cập nhật địa chỉ, vui lòng cập nhật lại địa chỉ`
        });
      }

      if (customer.provinceId) {
        shipment.fromProvinceId = customer.provinceId;
        const findProvince = this.toProvinces.find(x => x.value === shipment.toProvinceId);
        if (findProvince) {
          shipment.fromProvinceLabel = findProvince.label;
        }
        if (customer.districtId) {
          shipment.fromDistrictId = customer.districtId;
        }
        this.loadFromDistrict(shipment);
        if (customer.wardId) {
          shipment.fromWardId = customer.wardId;
        }
        this.loadFromWard(shipment);
        this.loadHubFromByWard(shipment);
      }
    }
  }

  async loadCustomerInfoLog() {
    this.customerInfoLogs = [];
    this.customerInfoLogs = await this.customerInfoLogService.getAllAsync();
  }

  async changeCustomerInfoLog(shipment: EntryShipment, customerInfoLog: CustomerInfoLog) {
    if (customerInfoLog) {
      shipment.receiverName = customerInfoLog.name;
      shipment.receiverPhone = customerInfoLog.phoneNumber;
      shipment.companyTo = customerInfoLog.companyName;
      shipment.addressNoteTo = customerInfoLog.addressNote;
      shipment.shippingAddress = customerInfoLog.address;
      shipment.latTo = customerInfoLog.lat;
      shipment.lngTo = customerInfoLog.lng;

      if (customerInfoLog.provinceId) {
        shipment.toProvinceId = customerInfoLog.provinceId;
        const findProvince = this.toProvinces.find(x => x.value == shipment.toProvinceId);
        if (findProvince) {
          shipment.toProvinceLabel = findProvince.label;
        }
        if (customerInfoLog.districtId) {
          shipment.toDistrictId = customerInfoLog.districtId;
        }
        this.loadToDistrict(shipment);
        if (customerInfoLog.wardId) {
          shipment.toWardId = customerInfoLog.wardId;
        }
        this.loadToWard(shipment);
        this.loadHubToByWard(shipment);
      }
    }
  }

  //filter Customers
  filterCustomers(event, Shipment: EntryShipment) {
    Shipment.filteredCustomers = [];
    for (let i = 0; i < this.customers.length; i++) {
      const customer = this.customers[i].label;
      if (customer.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
        Shipment.filteredCustomers.push(customer);
      }
    }
  }

  async onSelectedCustomer(shipment: EntryShipment, inputCustomer) {
    const customer = this.customers.find(x => x.label == inputCustomer.viewModel);
    if (customer) {
      const cloneSelectedCustomer = customer.label;
      const index = cloneSelectedCustomer.indexOf(" -");
      let customers: any;
      if (index !== -1) {
        customers = cloneSelectedCustomer.substring(0, index);
      }
      this.customers.forEach(async x => {
        let obj = x.data as Customer;
        if (obj) {
          if (customers === obj.code) {
            await this.changeCustomer(shipment, obj);
            this.loadPriceList(shipment);
          }
        }
      });
    }
  }

  // filter PickupUsers
  filterPickupUsers(event, shipment: EntryShipment) {
    shipment.filteredPickupUsers = [];
    if (shipment.pickupUsers) {
      for (let i = 0; i < shipment.pickupUsers.length; i++) {
        let pickupUser = shipment.pickupUsers[i].label;
        if (pickupUser.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredPickupUsers.push(pickupUser);
        }
      }
    }
  }

  onSelectedPickupUsers(shipment: EntryShipment, inputPickupUser) {
    const data = shipment.pickupUsers.find(x => x.label == inputPickupUser.viewModel);
    if (data) {
      shipment.pickUserId = data.value;
    }
  }

  // filter DeliveryUsers
  filterDeliveryUsers(event, shipment: EntryShipment) {
    shipment.filteredDeliveryUsers = [];
    if (shipment.deliveryUsers) {
      for (let i = 0; i < shipment.deliveryUsers.length; i++) {
        let deliveryUser = shipment.deliveryUsers[i].label;
        if (deliveryUser.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredDeliveryUsers.push(deliveryUser);
        }
      }
    }
  }

  onSelectedDeliveryUsers(shipment: EntryShipment, inputDeliveryUser) {
    const data = shipment.deliveryUsers.find(x => x.label == inputDeliveryUser.viewModel);
    if (data) {
      shipment.deliverUserId = data.value;
    }
  }

  // filter toHub
  filterToHubs(event, shipment: EntryShipment) {
    shipment.filteredToHubs = [];
    if (shipment.toHubs) {
      for (let i = 0; i < shipment.toHubs.length; i++) {
        let toHub = shipment.toHubs[i].label;
        if (toHub.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredToHubs.push(toHub);
        }
      }
    }
  }

  onSelectedToHubs(shipment: EntryShipment, inputPickupUser) {
    const data = shipment.toHubs.find(x => x.label == inputPickupUser.viewModel);
    if (data) {
      shipment.toHubId = data.value;
      shipment.deliveryUserLabel = null;
      this.loadDeliveryUser(shipment);
    }
  }

  // filter sender
  async filterSenderPhones(event) {
    const query = event.query;
    const type = SearchCusstomerHelper.PHONE_NUMBER;
    const customer = await this.customerService.searchAsync(query, type);
    if (customer) {
      this.filteredSenderPhones = this.filterSender(query, customer, type);
    }
  }

  selectedSenderPhone(shipment: EntryShipment, inputSenderPhoneNumber) {
    const data = this.customers.find(x => x.data && x.data.phoneNumber == inputSenderPhoneNumber.viewModel);
    if (data) {
      const customer = data.data as Customer;
      shipment.senderPhone = customer.phoneNumber;
      shipment.customerLabel = `${customer.code} - ${customer.name}- ${customer.phoneNumber}`;
      this.changeCustomer(shipment, customer);
    }
  }

  async filterSenderNames(event) {
    const query = event.query;
    const type = SearchCusstomerHelper.NAME;
    const customer = await this.customerService.searchAsync(query, type);
    if (customer) {
      this.filteredSenderNames = this.filterSender(query, customer, type);
    }
  }

  selectedSenderName(shipment: EntryShipment, inputSenderName) {
    const data = this.customers.find(x => x.data && x.data.name == inputSenderName.viewModel);
    if (data) {
      const customer = data.data as Customer;
      shipment.senderName = customer.name;
      shipment.customerLabel = `${customer.code} - ${customer.name}- ${customer.phoneNumber}`;
      this.changeCustomer(shipment, customer);
    }
  }
  async filterSenderCompanies(event) {
    const query = event.query;
    const type = SearchCusstomerHelper.COMPANY_NAME;
    const customer = await this.customerService.searchAsync(query, type);
    if (customer) {
      this.filteredSenderCompanies = this.filterSender(query, customer, type);
    }
  }

  selectedSenderCompany(shipment: EntryShipment, inputCompanyFrom) {
    const data = this.customers.find(x => x.data && x.data.companyName == inputCompanyFrom.viewModel);
    if (data) {
      const customer= data.data as Customer;
      shipment.companyFrom = customer.companyName;
      shipment.customerLabel = `${customer.code} - ${customer.name}- ${customer.phoneNumber}`;
      this.changeCustomer(shipment, customer);
    }
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

  //search receiver
  async filterReceiverPhones(event) {
    const query = event.query;
    const type = SearchCusstomerHelper.PHONE_NUMBER;
    const customer = await this.customerInfoLogService.searchAsync(query, type);
    if (customer) {
      this.filteredReceiverPhones = this.filterReceiver(query, customer, type);
    }
  }

  selectedReceiverPhone(shipment: EntryShipment, inputReceiverPhoneNumber) {
    const customerInfoLog = this.customerInfoLogs.find(x => x.phoneNumber == inputReceiverPhoneNumber.viewModel);
    if (customerInfoLog) {
      shipment.receiverPhone = customerInfoLog.phoneNumber;
      this.changeCustomerInfoLog(shipment, customerInfoLog);
    }
  }

  async filterReceiverNames(event) {
    const query = event.query;
    const type = SearchCusstomerHelper.NAME;
    const customer = await this.customerInfoLogService.searchAsync(query, type);
    if (customer) {
      this.filteredReceiverNames = this.filterReceiver(query, customer, type);
    }
  }

  selectedReceiverName(shipment: EntryShipment, inputReceiverName) {
    const customerInfoLog = this.customerInfoLogs.find(x => x.name == inputReceiverName.viewModel);
    if (customerInfoLog) {
      shipment.receiverName = customerInfoLog.name;
      this.changeCustomerInfoLog(shipment, customerInfoLog);
    }
  }

  async filterReceiverCompanies(event) {
    const query = event.query;
    const type = SearchCusstomerHelper.COMPANY_NAME;
    const customer = await this.customerInfoLogService.searchAsync(query, type);
    if (customer) {
      this.filteredReceiverCompanies = this.filterReceiver(query, customer, type);
    }
  }

  selectedReceiverCompany(shipment: EntryShipment, inputCompanyTo) {
    const customerInfoLog = this.customerInfoLogs.find(x => x.companyName == inputCompanyTo.viewModel);
    if (customerInfoLog) {
      shipment.companyTo = customerInfoLog.companyName;
      this.changeCustomerInfoLog(shipment, customerInfoLog);
    }
  }

  filterReceiver(query, customers, type) {
    let filtered: any[] = [];
    for (let i = 0; i < customers.length; i++) {
      if (type === SearchCusstomerHelper.PHONE_NUMBER) {
        let receiverPhone = customers[i].phoneNumber;
        if (receiverPhone.indexOf(query) >= 0) {
          filtered.push(receiverPhone);
        }
      }
      if (type === SearchCusstomerHelper.NAME) {
        let receiverName = customers[i].name as string;
        if (receiverName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(receiverName);
        }
      }
      if (type === SearchCusstomerHelper.COMPANY_NAME) {
        if (customers[i].companyName) {
          let receiverCompany = customers[i].companyName as string;
          if (receiverCompany.toLowerCase().indexOf(query.toLowerCase()) == 0) {
            filtered.push(receiverCompany);
          }
        }
      }
    }
    return filtered;
  }

  // filter cusdepartments
  async filterCusdepartments(event, shipment: EntryShipment) {
    shipment.filteredCusDepartments = [];
    if (shipment.cusDepartments) {
      for (let i = 0; i < shipment.cusDepartments.length; i++) {
        const cusDepartment = shipment.cusDepartments[i].label;
        if (cusDepartment.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredCusDepartments.push(cusDepartment);
        }
      }
    }
  }

  async selectedCusdepartments(shipment: EntryShipment, inputCusdepartment) {
    const cusDepartment = shipment.cusDepartments.find(x => x.label == inputCusdepartment.viewModel);
    if (cusDepartment) {
      shipment.cusDepartmentId = cusDepartment.value;
      if (shipment.cusDepartmentId) {
        const department: CusDepartment = await this.cusDepartmentService.getAsync(shipment.cusDepartmentId);
        if (department) {
          if (!StringHelper.isNullOrEmpty(department.representativeName)) {
            shipment.senderName = department.representativeName;
          } else {
            shipment.senderName = shipment.cloneCustomer.name;
          }
          if (!StringHelper.isNullOrEmpty(department.phoneNumber)) {
            shipment.senderPhone = department.phoneNumber;
          } else {
            shipment.senderPhone = shipment.cloneCustomer.phoneNumber;
          }
          if (!StringHelper.isNullOrEmpty(department.addressNote)) {
            shipment.addressNoteFrom = department.addressNote;
          } else {
            shipment.addressNoteFrom = shipment.cloneCustomer.addressNote;
          }
          if (StringHelper.isNullOrEmpty(department.address) || !department.provinceId || !department.districtId || !department.wardId) {
            await this.changeCustomer(shipment, shipment.cloneCustomer);
            shipment.cusDepartmentId = cusDepartment.value;
            shipment.cusDepartmentLabel = cusDepartment.label;
            shipment.pickingAddress = shipment.cloneCustomer.address;
            shipment.fromProvinceId = shipment.cloneCustomer.provinceId;
            shipment.fromDistrictId = shipment.cloneCustomer.districtId;
            shipment.fromWardId = shipment.cloneCustomer.wardId;
            shipment.latFrom = shipment.cloneCustomer.lat;
            shipment.currentLat = shipment.cloneCustomer.lat;
            shipment.lngFrom = shipment.cloneCustomer.lng;
            shipment.currentLng = shipment.cloneCustomer.lng;
          } else {
            shipment.pickingAddress = department.address;
            shipment.fromProvinceId = department.provinceId;
            shipment.fromDistrictId = department.districtId;
            shipment.fromWardId = department.wardId;
            if (department.lat) {
              shipment.latFrom = department.lat;
              shipment.currentLat = department.lat;
            } else {
              shipment.latFrom = shipment.cloneCustomer.lat;
              shipment.currentLat = shipment.cloneCustomer.lat;
            }
            if (department.lng) {
              shipment.lngFrom = department.lng;
              shipment.currentLng = department.lng;
            } else {
              shipment.lngFrom = shipment.cloneCustomer.lng;
              shipment.currentLng = shipment.cloneCustomer.lng;
            }
          }
        }
      }
    }
  }

  // filter services
  filterServicesSP(event, shipment: EntryShipment) {
    shipment.filteredServices = [];
    if (shipment.services) {
      for (let i = 0; i < shipment.services.length; i++) {
        const service = shipment.services[i].label;
        if (service.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredServices.push(service);
        }
      }
    }
  }

  onSelectedServicesSP(shipment: EntryShipment, inputService) {
    const service = shipment.services.find(x => x.label == inputService.viewModel);
    if (service) {
      shipment.serviceId = service.value;
      this.changeService(shipment);
    }
  }

  changeService(shipment: EntryShipment) {
    this.loadDIM(shipment);
    this.loadDeadlinePickupDelivery(shipment);
    this.calculatePrice(shipment);
  }

  // filter structures
  filterStructures(event, shipment: EntryShipment) {
    shipment.filteredStructures = [];
    if (shipment.structures) {
      for (let i = 0; i < shipment.structures.length; i++) {
        const structure = shipment.structures[i].label;
        if (structure.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredStructures.push(structure);
        }
      }
    }
  }

  onSelectedStructures(shipment: EntryShipment, inputStructure) {
    const structure = shipment.structures.find(x => x.label == inputStructure.viewModel);
    if (structure) {
      shipment.structureId = structure.value;
    }
  }

  // filter paymentTypes
  filterPaymentTypes(event, shipment: EntryShipment) {
    shipment.filteredPaymentTypes = [];
    if (shipment.paymentTypes) {
      for (let i = 0; i < shipment.paymentTypes.length; i++) {
        const paymentType = shipment.paymentTypes[i].label;
        if (paymentType.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredPaymentTypes.push(paymentType);
        }
      }
    }
  }

  onSelectedPaymentTypes(shipment: EntryShipment, inputPaymentType) {
    const paymentType = shipment.paymentTypes.find(x => x.label == inputPaymentType.viewModel);
    if (paymentType) {
      shipment.paymentTypeId = paymentType.value;
    }
  }

  // filter toProvince
  filterToProvinces(event, shipment: EntryShipment) {
    shipment.filteredToProvinces = [];
    if (this.toProvinces) {
      for (let i = 0; i < this.toProvinces.length; i++) {
        const toProvince = this.toProvinces[i].label;
        if (toProvince.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredToProvinces.push(toProvince);
        }
      }
    }
  }

  onSelectedToProvinces(shipment: EntryShipment, inputtoProvince) {
    const toProvince = this.toProvinces.find(x => x.label == inputtoProvince.viewModel);
    if (toProvince) {
      shipment.toProvinceId = toProvince.value;
      this.changeToProvince(shipment);
    }
  }

  changeToProvince(shipment: EntryShipment) {
    shipment.toDistrictId = null;
    shipment.toWardId = null;
    shipment.toWardLabel = null;
    shipment.toWards = null;
    if (!shipment.toProvinceId) {
      shipment.toDistricts = null;
      shipment.toDistrictLabel = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    }
    this.loadToDistrict(shipment);
  }

  // filter toDistrict
  filterToDistricts(event, shipment: EntryShipment) {
    shipment.filteredToDistricts = [];
    if (shipment.toDistricts) {
      for (let i = 0; i < shipment.toDistricts.length; i++) {
        const toDistrict = shipment.toDistricts[i].label;
        if (toDistrict.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredToDistricts.push(toDistrict);
        }
      }
    }
  }

  onSelectedToDistricts(shipment: EntryShipment, inputtoDistrict) {
    const toDistrict = shipment.toDistricts.find(x => x.label == inputtoDistrict.viewModel);
    if (toDistrict) {
      shipment.toDistrictId = toDistrict.value;
      this.changeToDistrict(shipment);
    }
  }

  changeToDistrict(shipment: EntryShipment) {
    shipment.toWardId = null;
    if (!shipment.toDistrictId) {
      shipment.toWards = null;
      shipment.toWardLabel = null;
      this.resetService(shipment);
      this.resetPrice(shipment);
      return;
    }
    this.loadToWard(shipment);
    this.loadServiceSP(shipment);
  }

  // filter toWard
  filterToWards(event, shipment: EntryShipment) {
    shipment.filteredToWards = [];
    if (shipment.toWards) {
      for (let i = 0; i < shipment.toWards.length; i++) {
        const toWard = shipment.toWards[i].label;
        if (toWard.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
          shipment.filteredToWards.push(toWard);
        }
      }
    }
  }

  onSelectedToWards(shipment: EntryShipment, inputtoWard) {
    const toWard = shipment.toWards.find(x => x.label == inputtoWard.viewModel);
    if (toWard) {
      shipment.toWardId = toWard.value;
      this.changeToWard(shipment);
    }
  }

  changeToWard(shipment: EntryShipment) {
    this.loadHubToByWard(shipment);
  }

  changeWeight(shipment: EntryShipment) {
    this.loadChargeWeight(shipment);
  }

  async loadProvince() {
    this.toProvinces = [];
    this.fromProvinces = [];
    this.toProvinces = await this.provinceService.getAllSelectModelAsync();
    this.fromProvinces = this.toProvinces;
  }

  // loadChargeWeight(shipment: EntryShipment) {
  //   if (!shipment.calWeight) {
  //     shipment.chargeWeight = shipment.weight;
  //   } else {
  //     shipment.chargeWeight =
  //     shipment.weight >= shipment.calWeight
  //         ? shipment.weight
  //         : shipment.calWeight;
  //   }
  //   this.loadServiceSP(shipment);
  // }

  // async loadBoxes(shipment: EntryShipment) {
  //   const shipmentId = shipment.id;
  //   this.resetBox();
  //   this.boxesLS = await this.boxService.getByShipmentIdAsync(shipmentId);
  //   if (this.boxesLS) {
  //     if (this.cloneRowDataShipment) {
  //       this.totalBoxes = this.boxesLS;
  //       this.totalChargeWeightBoxes = this.totalBoxes.reduce((chargeWeight, item) =>
  //         chargeWeight + (item.calWeight >= item.weight ? item.calWeight : item.weight), 0
  //       );
  //       this.data.calWeight = this.totalChargeWeightBoxes;
  //       this.loadChargeWeight();
  //       this.data.totalBox = this.totalBoxes.length;
  //       this.newEditBoxes = [];
  //       this.selectedDeleteBoxes = [];
  //     }
  //   }
  // }

  async loadPaymentType(shipment: EntryShipment): Promise<void> {
    if (this.paymentTypes) {
      shipment.paymentTypes = this.paymentTypes;
      if (shipment.paymentTypeId) {
        const paymentType = shipment.paymentTypes.find(x => x.value == shipment.paymentTypeId);
        if (paymentType) {
          shipment.paymentTypeLabel = paymentType.label;
        }
      } else {
        shipment.paymentTypeId = shipment.paymentTypes[1].value;
        shipment.paymentTypeLabel = shipment.paymentTypes[1].label;
      }
    }
  }

  async loadStructure(shipment: EntryShipment): Promise<void> {
    if (this.structures) {
      shipment.structures = this.structures;
      if (shipment.structureId) {
        const structure = this.structures.find(x => x.value == shipment.structureId);
        if (structure) {
          shipment.structureLabel = structure.label;
        }
      } else {
        let codeStructure: string = "";
        if (environment.namePrint.toLowerCase() != "tasetco") {
          codeStructure = "hh";
        } else {
          codeStructure = "khac";
        }
        let find = shipment.structures.find(x => x.label.split(" - ")[0] == codeStructure);
        if (find) {
          shipment.structureId = find.value;
          shipment.structureLabel = find.label;
        } else {
          shipment.structureId = shipment.structures[1].value;
          shipment.structureLabel = shipment.structures[1].label;
        }
      }
    }
  }

  async loadCusDepartment(shipment: EntryShipment) {
    const customerId = shipment.senderId;
    let cusDepartments = [];
    cusDepartments = await this.cusDepartmentService.getSelectModelByCustomerIdAsync(customerId);
    if (cusDepartments) {
      shipment.cusDepartments = cusDepartments;
      if (shipment.cusDepartmentId) {
        const cusDepartment = cusDepartments.find(x => x.value == shipment.cusDepartmentId);
        if (cusDepartment) {
          shipment.cusDepartmentLabel = cusDepartment.label;
        }
      }
    }
  }

  async openModelBoxItem(shipment: EntryShipment) {
    this.boxServiceInstance.sendCustomEvent(shipment);
  }

  async updateShipments(isPrintShipmet?: boolean) {
    this.isPrintShipmet = isPrintShipmet;
    this.messageService.clear();
    let countSuccess: number = 0;
    let shipmentsUpdate: EntryShipment[] = [];
    let cloneShipmentsUpdate: EntryShipment[] = [];
    let datasPrint: Shipment[] = [];
    await Promise.all(this.allShipmentEntries.map(async (element, index) => {
      if (!element.isCreateMissingInfo) {
        if (!this.isValidToUpdate(element)) return;
      }
      this.checkSubmit = true;
      this.saveShipment(element);
      const data = await this.shipmentService.updateAsync(element);
      if (data) {
        //create Version
        const dataChanged = ShipmentVersionHelper.getDiff(this.allShipmentEntries[index], this.cloneallShipmentEntries[index],);
        if (!StringHelper.isNullOrEmpty(dataChanged)) {
          this.cloneallShipmentEntries[index].dataChanged = dataChanged;
        }
        // save column haved changed into PropertyChanged
        await this.shipmentVersionService.createAsync(this.cloneallShipmentEntries[index]);
        countSuccess++;
        shipmentsUpdate.push(element);
        cloneShipmentsUpdate.push(this.cloneallShipmentEntries[index]);
        // print shipment
        if (this.isPrintShipmet) {
          datasPrint.push(data);
        }
      }
    }));
    this.checkSubmit = false;
    if (countSuccess > 0) {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: "Cập nhập thành công " + countSuccess + " VĐ" });
      if (this.isPrintShipmet) {
        // console.log(datasPrint);
        this.printItemShipmentDetails(datasPrint);
      }
    }
    this.allShipmentEntries = this.allShipmentEntries.filter(x => !shipmentsUpdate.includes(x));
    this.cloneallShipmentEntries = this.cloneallShipmentEntries.filter(x => !cloneShipmentsUpdate.includes(x));
    if (this.allShipmentEntries.length === 0) {
      this.refreshUpdateBill();
    }
  }

  saveShipment(shipment: EntryShipment) {
    // save Sender
    if (shipment.senderPhone) {
      shipment.senderPhone = InputValue.trimInput(shipment.senderPhone);
    }
    if (shipment.senderPhone) {
      shipment.senderPhone = InputValue.trimInput(shipment.senderPhone);
    }
    if (shipment.companyFrom) {
      shipment.companyFrom = InputValue.trimInput(shipment.companyFrom);
    }
    // save Receiver
    if (shipment.receiverPhone) {
      shipment.receiverPhone = InputValue.trimInput(shipment.receiverPhone);
    }
    if (shipment.receiverName) {
      shipment.receiverName = InputValue.trimInput(shipment.receiverName);
    }
    if (shipment.shippingAddress) {
      shipment.shippingAddress = InputValue.trimInput(shipment.shippingAddress);
    }
    if (shipment.addressNoteTo) {
      shipment.addressNoteTo = InputValue.trimInput(shipment.addressNoteTo);
    }
    if (shipment.companyTo) {
      shipment.companyTo = InputValue.trimInput(shipment.companyTo);
    }
    if (shipment.cusNote) {
      shipment.cusNote = InputValue.trimInput(shipment.cusNote);
    }
    if (shipment.content) {
      shipment.content = InputValue.trimInput(shipment.content);
    }
    // save payment
    if (shipment.paymentTypeId) {
      if (shipment.paymentTypeId === PaymentTypeHelper.NGTTN && shipment.pickUserId) {
        shipment.keepingTotalPriceEmpId = shipment.pickUserId;
      }
    }
    // save boxes
    if (!this.isCreatedBox) {
      shipment.totalBox = shipment.totalBox ? shipment.totalBox : 0;
    } else {
      shipment.totalBox =
        shipment.totalBox >= this.cloneTotalSelectedCountSK
          ? shipment.totalBox
          : this.cloneTotalSelectedCountSK;
    }
    // console.log(shipment.serviceDVGTIds);
    // save price
    shipment.totalItem = shipment.totalItem ? shipment.totalItem : 0;
    shipment.calWeight = shipment.calWeight ? shipment.calWeight : 0;
    shipment.cod = shipment.cod ? shipment.cod : 0;
    shipment.otherPrice = shipment.otherPrice ? shipment.otherPrice : 0;
    shipment.defaultPrice = shipment.defaultPrice
      ? shipment.defaultPrice
      : 0;
    shipment.fuelPrice = shipment.fuelPrice ? shipment.fuelPrice : 0;
    shipment.otherPrice = shipment.otherPrice ? shipment.otherPrice : 0;
    shipment.remoteAreasPrice = shipment.remoteAreasPrice
      ? shipment.remoteAreasPrice
      : 0;
    shipment.totalDVGT = shipment.totalDVGT ? shipment.totalDVGT : 0;
    shipment.totalPrice = shipment.totalPrice ? shipment.totalPrice : 0;
    shipment.vatPrice = shipment.vatPrice ? shipment.vatPrice : 0;
    if (shipment.priceDVGTs) {
      if (shipment.priceDVGTs.length > 0) {
        shipment.priceDVGTs = shipment.priceDVGTs;
      }
    } else {
      shipment.priceDVGTs = [];
    }
  }

  async printItemShipmentDetails(datas) {
    const shipmentIds = datas.map(x => x.id);
    const includes: string =
      Constant.classes.includes.shipment.sender + "," +
      Constant.classes.includes.shipment.toDistrict + "," +
      Constant.classes.includes.shipment.service + "," +
      Constant.classes.includes.shipment.structure + "," +
      Constant.classes.includes.shipment.paymentType + "," +
      Constant.classes.includes.shipment.fromHub + "," +
      Constant.classes.includes.shipment.toHub + "," +
      Constant.classes.includes.shipment.deliverUser;
    const shipments = await this.shipmentService.getByListIdAsync(shipmentIds, includes);
    if (shipments) {
      const cloneSelectData = await this.getPrintShipmentDatas(shipments);
      if (cloneSelectData) {
        this.idPrint = PrintHelper.printCreateMultiShipment;
        setTimeout(() => {
          this.printFrormServiceInstance.sendCustomEvent(cloneSelectData);
        }, 0);
      }
    }
  }

  async getPrintShipmentDatas(datas) {
    const cloneSelectData = await this.sendSelectDataPrintMultiShipment(datas);
    if (cloneSelectData) {
      await Promise.all(cloneSelectData.map(async item => {
        const shipmentId = item.id;
        const serviceDVGTIdsName = await this.serviceDVGTService.getNameByShipmentIdAsync(shipmentId);
        item.serviceDVGTIdsName = serviceDVGTIdsName;
      }));
      return cloneSelectData;
    }
  }

  isValidToUpdate(shipment: EntryShipment): boolean {
    let result: boolean = true;
    let messages: Message[] = [];
    const shipmentNumber = shipment.shipmentNumber;

    if (!shipment.senderPhone) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa nhập số điện thoại người gửi"
      });
      result = false;
    }

    if (!shipment.senderName) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa nhập tên người gửi"
      });
      result = false;
    }

    if (!shipment.pickUserId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa chọn NV nhận hàng"
      });
      result = false;
    }

    if (!shipment.pickingAddress) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa nhập địa chỉ gửi hàng"
      });
      result = false;
    }

    if (!shipment.fromProvinceId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa chọn tỉnh/thành gửi"
      });
      result = false;
    }

    if (!shipment.fromDistrictId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa chọn quận/huyện gưi"
      });
      result = false;
    }

    if (!shipment.fromWardId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa chọn phường/xã gửi"
      });
      result = false;
    }
    //
    if (!shipment.receiverPhone) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa nhập số điện thoại người nhận"
      });
      result = false;
    }
    // if (!shipment.receiverName) {
    //   messages.push({
    //     severity: Constant.messageStatus.warn,
    //     detail: "VĐ " + shipmentNumber + ": " + "Chưa nhập tên người nhận"
    //   });
    //   result = false;
    // }
    if (!shipment.shippingAddress) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa nhập địa chỉ giao hàng"
      });
      result = false;
    }
    if (!shipment.toProvinceId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Địa chỉ thiếu tỉnh/thành nhận"
      });
      result = false;
    }
    if (!shipment.toDistrictId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Địa chỉ thiếu quận/huyện nhận"
      });
      result = false;
    }
    if (!shipment.toWardId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Địa chỉ thiếu phường/xã nhận"
      });
      result = false;
    }
    if (!shipment.weight) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa nhập trọng lượng"
      });
      result = false;
    } else if (shipment.weight == 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Trọng lượng phải lớn hơn 0"
      });
      result = false;
    }
    if (!shipment.serviceId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa chọn dịch vụ"
      });
      result = false;
    }
    if (!shipment.paymentTypeId) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Chưa chọn HT thanh toán"
      });
      result = false;
    }
    if (!shipment.totalPrice) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Không tìm thấy bảng giá"
      });
      result = false;
    } else if (shipment.totalPrice === 0) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "VĐ " + shipmentNumber + ": " + "Không tìm thấy bảng giá"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  resetFromLocation(shipment: EntryShipment) {
    shipment.fromProvinceId = null;
    shipment.fromProvinceLabel = null;
    shipment.fromDistrictId = null;
    shipment.fromDistricts = null;
    shipment.fromDistrictLabel = null;
    shipment.fromWardId = null;
    shipment.fromWards = null;
    shipment.fromWardLabel = null;
  }

  resetToLocation(shipment: EntryShipment) {
    shipment.toProvinceId = null;
    shipment.toProvinceLabel = null;
    shipment.toDistrictId = null;
    shipment.toDistricts = null;
    shipment.toDistrictLabel = null;
    shipment.toWardId = null;
    shipment.toWards = null;
    shipment.toWardLabel = null;
  }

  refreshUpdateBill() {
    this.allShipmentEntries = null;
    this.cloneallShipmentEntries = null;
    this.listCode = null;
    this.isPrintShipmet = null;
    this.arrSelectedShipmentNumber = [];
  }

  changeInputSwitch() {
    this.refreshUpdateBill();
  }

  ngAfterViewInit() {
    this.entryShipmentServiceInstance.resetEventObserver();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
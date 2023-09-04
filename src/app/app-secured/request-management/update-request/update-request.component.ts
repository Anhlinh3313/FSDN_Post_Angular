import { Component, OnInit, TemplateRef, ElementRef, ViewChild, NgZone } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { SelectItem } from 'primeng/primeng';
import { ShipmentService, UserService, CustomerService, ProvinceService, WardService, DistrictService, HubService, RequestShipmentService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { Shipment } from '../../../models/shipment.model';
import { User, Customer, Province, District, Ward, Hub } from '../../../models/index';
import { PersistenceService, } from 'angular-persistence';
import { FormControl } from '@angular/forms';
// import { } from 'googlemaps';
import { GMapHelper } from '../../../infrastructure/gmap.helper';
import { MapsAPILoader } from '@agm/core';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

declare var jQuery: any;

@Component({
  selector: 'app-update-request',
  templateUrl: 'update-request.component.html',
  styles: [`
    agm-map {
      height: 200px;
    }
  `]
})
export class UpdateRequestComponent extends BaseComponent implements OnInit {
  constructor(private modalService: BsModalService, private persistenceService: PersistenceService, protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private customerService: CustomerService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private wardService: WardService,
    private hubService: HubService,
    private requestShipmentService: RequestShipmentService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }
  unit = environment.unit;
  
  parentPage: string = Constant.pages.request.name;
  currentPage: string = Constant.pages.request.children.listRequest.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;
  //
  data: Shipment;
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
  public latitudeFrom: number;
  public longitudeFrom: number;
  public latitudeTo: number;
  public longitudeTo: number;
  public searchFromControl: FormControl;
  public searchToControl: FormControl;
  public zoom: number;
  @ViewChild("searchFrom")
  searchFromElementRef: ElementRef;
  @ViewChild("searchTo")
  searchToElementRef: ElementRef;

  ngOnInit() {
    this.initMap();
    this.initData();
    this.loadCustomer();
    this.loadProvince();
    this.loadCenterHub();
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

  initData() {
    this.data = new Shipment;
    this.selectedFromCenterHub = null;
  }

  resetData() {
    this.data = new Shipment;
    this.searchFromControl.setValue(null);
    this.searchToControl.setValue(null);
    this.selectedEmployee = null;
    this.selectedCustomer = null;
    this.resetFromLocationData();
    this.resetToLocationData();
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

  loadEmployee() {
    if (!this.selectedFromCenterHub) return;
    this.selectedEmployee = null;
    this.employees = [];

    this.userService.getEmpByHubId(this.selectedFromCenterHub).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let users = x.data as User[];

        this.employees.push({ label: "-- Chọn nhân viên --", value: null });

        users.forEach(element => {
          this.employees.push({ label: `${element.code} - ${element.fullName}`, value: element.id });
        });
      }
    );
  }

  loadCustomer() {
    this.customers = [];
    this.selectedCustomer = null;

    let includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward,
    ];

    this.customerService.getAll(includes).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as Customer[];

        this.customers.push({ label: `-- Chọn khách hàng --`, value: null });
        objs.forEach(element => {
          this.customers.push({ label: `${element.code} - ${element.name}`, value: element });
        });
      }
    );
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

    this.hubService.getCenterHub().subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let obj = x.data as Hub[];

        this.fromCenterHubs.push({ label: `-- Chọn trung tâm --`, value: null });
        this.toCenterHubs.push({ label: `-- Chọn trung tâm --`, value: null });
        obj.forEach(element => {
          this.fromCenterHubs.push({ label: `${element.code} - ${element.name}`, value: element.id });
          this.toCenterHubs.push({ label: `${element.code} - ${element.name}`, value: element.id });
        });
      }
    );
  }

  loadFromPoHub(selectedPoHub: number = null) {
    this.fromPoHubs = [];
    this.fromStationHubs = [];
    this.selectedFromStationHub = null;
    if (!this.selectedFromCenterHub) return;

    this.hubService.getPoHubByCenterId(this.selectedFromCenterHub).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let obj = x.data as Hub[];

        this.fromPoHubs.push({ label: `-- Chọn bưu cục --`, value: null });
        obj.forEach(element => {
          this.fromPoHubs.push({ label: `${element.code} - ${element.name}`, value: element.id });
        });

        this.selectedFromPoHub = selectedPoHub;
      }
    );
  }

  loadFromStationHub(selectedPoHub: number = null, selectedStationHub: number = null) {
    this.fromStationHubs = [];

    if (this.selectedFromPoHub) {
      selectedPoHub = this.selectedFromPoHub;
    }

    this.hubService.getStationHubByPoId(selectedPoHub).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let obj = x.data as Hub[];
        if (!obj) return;
        this.selectedFromStationHub = selectedStationHub;

        this.fromStationHubs.push({ label: `-- Chọn trạm --`, value: null });
        obj.forEach(element => {
          this.fromStationHubs.push({ label: `${element.code} - ${element.name}`, value: element.id });
        });


      }
    );
  }

  loadToPoHub(selectedPoHub: number = null) {
    this.toPoHubs = [];
    this.toStationHubs = [];
    this.selectedToStationHub = null;

    if (!this.selectedToCenterHub) return;

    this.hubService.getPoHubByCenterId(this.selectedToCenterHub).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let obj = x.data as Hub[];

        this.toPoHubs.push({ label: `-- Chọn bưu cục --`, value: null });
        obj.forEach(element => {
          this.toPoHubs.push({ label: `${element.code} - ${element.name}`, value: element.id });
        });

        this.selectedToPoHub = selectedPoHub;
      }
    );
  }

  loadToStationHub(selectedPoHub: number = null, selectedStationHub: number = null) {
    this.toStationHubs = [];

    if (this.selectedToPoHub) {
      selectedPoHub = this.selectedToPoHub;
    }

    this.hubService.getStationHubByPoId(selectedPoHub).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let obj = x.data as Hub[];
        if (!obj) return;
        this.selectedToStationHub = selectedStationHub;

        this.toStationHubs.push({ label: `-- Chọn trạm --`, value: null });
        obj.forEach(element => {
          this.toStationHubs.push({ label: `${element.code} - ${element.name}`, value: element.id });
        });
      }
    );
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

    this.provinceService.getAll().subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as Province[];

        this.fromProvinces.push({ label: `-- Chọn tỉnh/thành --`, value: null });
        this.toProvinces.push({ label: `-- Chọn tỉnh/thành --`, value: null });
        objs.forEach(element => {
          this.fromProvinces.push({ label: `${element.code} - ${element.name}`, value: element.id });
          this.toProvinces.push({ label: `${element.code} - ${element.name}`, value: element.id });
        });
      }
    );
  }

  loadFromDistrict(selectedDistrict: number = null) {
    this.fromDistricts = [];
    this.fromWards = [];
    this.selectedFromWard = null;
    this.resetFromHubData();

    if (!this.selectedFromProvince) return;

    this.districtService.getDistrictByProvinceId(this.selectedFromProvince).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as District[];

        this.fromDistricts.push({ label: `-- Chọn quận/huyện --`, value: null });
        objs.forEach(element => {
          this.fromDistricts.push({ label: `${element.code} - ${element.name}`, value: element.id });
        });
        if (selectedDistrict)
          this.selectedFromDistrict = selectedDistrict;
      }
    );
  }

  loadFromWard(selectedDistrict: number = null, selectedWard: number = null) {
    this.fromWards = [];
    this.resetFromHubData();

    if (!this.selectedFromDistrict && !selectedDistrict) return;
    if (!selectedDistrict) {
      selectedDistrict = this.selectedFromDistrict;
    }

    this.wardService.getWardByDistrictId(selectedDistrict).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as Ward[];

        this.fromWards.push({ label: `-- Chọn phường/xã --`, value: null });
        objs.forEach(element => {
          this.fromWards.push({ label: `${element.code} - ${element.name}`, value: element.id });
        });

        if (selectedWard)
          this.selectedFromWard = selectedWard;
      }
    );
  }

  loadToDistrict(selectedDistrict: number = null) {
    this.toDistricts = [];
    this.toWards = [];
    this.selectedToWard = null;
    this.resetToHubData();

    if (!this.selectedToProvince) return;

    this.districtService.getDistrictByProvinceId(this.selectedToProvince).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as District[];

        this.toDistricts.push({ label: `-- Chọn quận/huyện --`, value: null });
        objs.forEach(element => {
          this.toDistricts.push({ label: `${element.code} - ${element.name}`, value: element.id });
          if (selectedDistrict)
            this.selectedToDistrict = selectedDistrict;
        });
      }
    );
  }

  loadToWard(selectedDistrict: number = null, selectedWard: number = null) {
    this.toWards = [];
    this.resetToHubData();

    if (!this.selectedToDistrict) return;
    if (!this.selectedToDistrict && !selectedDistrict) return;
    if (!selectedDistrict) {
      selectedDistrict = this.selectedToDistrict;
    }

    this.wardService.getWardByDistrictId(selectedDistrict).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as Ward[];

        this.toWards.push({ label: `-- Chọn phường/xã --`, value: null });
        objs.forEach(element => {
          this.toWards.push({ label: `${element.code} - ${element.name}`, value: element.id });
        });

        if (selectedWard)
          this.selectedToWard = selectedWard;
      }
    );
  }

  loadLocationFromPlace(place: google.maps.places.PlaceResult) {
    let provinceName = "";
    let districtName = "";
    let wardName = "";

    place.address_components.forEach(element => {
      if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1) {
        provinceName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1) {
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
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
        this.districtService.getDistrictByName(districtName, this.selectedFromProvince).subscribe(
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
            this.wardService.getWardByName(wardName, this.selectedFromDistrict).subscribe(
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
      if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1) {
        provinceName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1) {
        districtName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.SUBLOCALITY_LEVEL_1) !== -1) {
        wardName = element.long_name;
      }
    });

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
        this.districtService.getDistrictByName(districtName, this.selectedToProvince).subscribe(
          x => {
            if (!super.isValidResponse(x)) return;
            let district = x.data as District;
            if (!district) {
              this.selectedToDistrict = null;
              return;
            }
            this.selectedToDistrict = district.id;
            this.selectedToWard = null;

            this.loadToWard();
            this.wardService.getWardByName(wardName, this.selectedToDistrict).subscribe(
              x => {
                if (!super.isValidResponse(x)) return;
                let ward = x.data as Ward;

                if (!ward) {
                  this.selectedToWard = null;
                  return;
                }
                this.selectedToWard = ward.id;
                this.loadHubToByWard();
              } //End wardService
            );
          } //End districtService
        );
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

    this.hubService.getHubByWardId(selectedWard, includes).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let stationHub = x.data as Hub;
        if (stationHub == null) return;

        this.selectedFromCenterHub = stationHub.centerHubId;
        this.loadEmployee();
        this.loadFromPoHub(stationHub.poHubId);
        this.loadFromStationHub(stationHub.poHubId, stationHub.id);

      }
    );
  }

  loadHubToByWard() {
    this.resetToHubData();
    if (!this.selectedToWard) return;

    let includes = [
      Constant.classes.includes.hub.centerHub,
      Constant.classes.includes.hub.poHub
    ];

    this.hubService.getHubByWardId(this.selectedToWard, includes).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let stationHub = x.data as Hub;
        if (stationHub == null) return;

        this.selectedToCenterHub = stationHub.centerHubId;
        this.loadToPoHub(stationHub.poHubId);
        this.loadToStationHub(stationHub.poHubId, stationHub.id);

      }
    );
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
      let fromAutocomplete = new google.maps.places.Autocomplete(this.searchFromElementRef.nativeElement, {
        // types: ["address"]
      });
      fromAutocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = fromAutocomplete.getPlace();

          //verify result
          if (!place.geometry || !place.geometry) {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy địa chỉ" });
            return;
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
      let toAutocomplete = new google.maps.places.Autocomplete(this.searchToElementRef.nativeElement, {
        // types: ["address"]
      });
      toAutocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = toAutocomplete.getPlace();

          //verify result
          if (!place.geometry || !place.geometry) {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy địa chỉ" });
            return;
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

  openModel(template: TemplateRef<any>) {
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  changeFromProvince() {
    this.loadFromDistrict();
  }

  changeFromDistrict() {
    this.loadFromWard();
  }

  changeFromWard() {

  }

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
      this.data.senderName = customer.name;
      this.data.senderPhone = customer.phoneNumber;
      this.data.pickingAddress = customer.address;
      this.latitudeFrom = customer.lat;
      this.longitudeFrom = customer.lng;
      this.data.latFrom = customer.lat;
      this.data.lngFrom = customer.lng;
      this.data.currentLat = customer.lat;
      this.data.currentLng = customer.lng;

      this.searchFromControl.setValue(customer.address);
      this.selectedFromProvince = customer.province.id;
      if (this.selectedFromProvince) {
        this.selectedFromDistrict = null;
        this.loadFromDistrict(customer.district.id);
        this.loadFromWard(customer.district.id, customer.ward.id);
        this.loadHubFromByWard(customer.ward.id);
      }
    }
  }

  clickSaveChange() {
    if (!this.isValidToCreateRequest()) return;

    this.data.shipmentStatusId = StatusHelper.readyToPick;
    this.data.senderId = this.selectedCustomer.id;
    this.data.fromProvinceId = this.selectedFromProvince;
    this.data.fromDistrictId = this.selectedFromDistrict;
    this.data.fromWardId = this.selectedFromWard;

    if (this.selectedEmployee) {
      this.data.shipmentStatusId = StatusHelper.assignEmployeePickup;
      this.data.pickUserId = this.selectedEmployee;
      this.data.currentEmpId = this.selectedEmployee;
    }

    if (this.selectedFromCenterHub && this.selectedFromPoHub && this.selectedFromStationHub) {
      this.data.fromHubId = this.selectedFromStationHub;
    } else if (this.selectedFromCenterHub && this.selectedFromPoHub) {
      this.data.fromHubId = this.selectedFromPoHub;
    } else {
      this.data.fromHubId = this.selectedFromCenterHub;
    }
    //
    if (this.selectedToProvince) {
      this.data.toProvinceId = this.selectedToProvince;
    }

    if (this.selectedToDistrict) {
      this.data.toDistrictId = this.selectedToDistrict;
    }

    if (this.selectedToWard) {
      this.data.toWardId = this.selectedToWard;
    }

    if (this.selectedToCenterHub && this.selectedToPoHub && this.selectedToStationHub) {
      this.data.toHubId = this.selectedToStationHub;
    } else if (this.selectedToCenterHub && this.selectedToPoHub) {
      this.data.toHubId = this.selectedToPoHub;
    } else {
      this.data.toHubId = this.selectedToCenterHub;
    }

    this.requestShipmentService.create(this.data).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;

        this.messageService.add({ severity: Constant.messageStatus.success, detail: "Tạo yêu cầu thành công" });
        this.resetData();
      }
    );
  }

  isValidToCreateRequest(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedCustomer) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn khác hàng" });
      result = false;
    }

    if (!this.data.senderPhone) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập số điện thoại người gửi" });
      result = false;
    }

    if (!this.data.senderName) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập tên người gửi" });
      result = false;
    }

    if (!this.data.pickingAddress) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập địa chỉ lấy hàng" });
      result = false;
    }

    if (!this.selectedFromProvince) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn tỉnh/thành gửi" });
      result = false;
    }

    if (!this.selectedFromDistrict) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn quận/huyện gửi" });
      result = false;
    }

    if (!this.selectedFromWard) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn phường/xã gửi" });
      result = false;
    }

    if (!this.selectedFromCenterHub && !this.selectedFromPoHub && !this.selectedFromStationHub) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn TT/CN/T gửi" });
      result = false;
    }

    if (this.selectedToProvince || this.selectedToDistrict || this.selectedToWard || this.selectedToCenterHub) {
      // console.log(this.selectedToProvince);
      // console.log(this.selectedToDistrict);
      // console.log(this.selectedToWard);
      // console.log(this.selectedToCenterHub);
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
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }
}

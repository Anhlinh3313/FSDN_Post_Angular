import { GeocodingApiService } from './../../../services/geocodingApiService.service';
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, NgZone } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
//
import { Constant } from '../../../infrastructure/constant';
import { SelectItem } from 'primeng/primeng';
import { ShipmentService, UserService, CustomerService, ProvinceService, WardService, DistrictService, HubService, RequestShipmentService, CustomerInfoLogService, AuthService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { StatusHelper } from '../../../infrastructure/statusHelper';
import { Shipment } from '../../../models/shipment.model';
import { User, Customer, Province, District, Ward, Hub } from '../../../models/index';
import { PersistenceService } from 'angular-persistence';
import { FormControl } from '@angular/forms';
// import { } from 'googlemaps';
import { GMapHelper } from '../../../infrastructure/gmap.helper';
import { MapsAPILoader } from '@agm/core';

import * as XLSX from 'xlsx';
import { SearchCusstomerHelper } from '../../../infrastructure/searchCustomer.helper';
import { CustomerInfoLog } from '../../../models/customerInfoLog.model';
import { InputValue } from '../../../infrastructure/inputValue.helper';
import { KeyCodeUtil } from '../../../infrastructure/keyCode.util';
import { HubHelper } from '../../../infrastructure/hub.helper';
import { StreetService } from '../../../services/street.service';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { CusDepartmentService } from '../../../services/cusDepartment.service.';
import { CusDepartment } from '../../../models/cusDepartment.model';
import { StringHelper } from '../../../infrastructure/string.helper';
import { SoundHelper } from '../../../infrastructure/sound.helper';
import { SelectModel } from '../../../models/select.model';
type AOA = Array<Array<any>>;


@Component({
  selector: 'app-create-request',
  templateUrl: 'create-request.component.html',
  styles: [`
    agm-map {
      height: 200px;
    }
  `]
})
export class CreateRequestComponent extends BaseComponent implements OnInit {
  //#region params báic
  requestShipmentName: string = "Y/c mới tạo";
  //#endregion
  hub = environment;
  selectedDepartment: number;
  cusDepartments: SelectItem[];
  filteredCusDepartments: any[];
  cusDepartment: string;
  isAssignEmployee: boolean = true;
  fromHubId: number;
  toHubId: number;
  cloneToWardName: string;
  cloneToDistrictName: string;
  cloneToProviceName: string;
  cloneFromWardName: string;
  cloneFromDistrictName: string;
  cloneFromProviceName: string;
  filteredEmployees: any;
  filteredToStationHubs: any;
  filteredToPoHubs: any;
  filteredToCenterHubs: any;
  filteredToHubs: any;
  filteredToWards: any;
  filteredToDistricts: any;
  filteredToProvinces: any;
  filteredFromStationHubs: any;
  filteredFromPoHubs: any;
  filteredFromCenterHubs: any;
  filteredFromHubs: any;
  filteredFromWards: any;
  filteredFromDistricts: any;
  filteredFromProvinces: any;
  filteredCustomers: any;
  checkSubmit: boolean;
  objCustomers: any[];
  filteredSenderPhones: any[];
  filteredSenderNames: any[];
  filteredSenderCompanies: any[];
  filteredReceiverPhones: any[];
  filteredReceiverNames: any[];
  filteredReceiverCompanies: any[];
  senderPhone: string;
  senderName: any;
  fromStreetId: any;
  fromProvince: any;
  fromDistrict: any;
  fromWard: any;
  fromCenterHub: any;
  fromPoHub: any;
  fromStationHub: any;
  fromHub: any;
  senderCompany: any;
  fromLocation: string = "none";
  receiverPhone: any;
  receiverName: any;
  receiverCompany: any;
  toLocation: string = "none";
  toProvince: any;
  toDistrict: any;
  toWard: any;
  toCenterHub: any;
  toPoHub: any;
  toStationHub: any;
  toHub: any;
  customer: any;
  employee: any;
  cloneCustomer: Customer;

  constructor(private modalService: BsModalService, private persistenceService: PersistenceService, protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private customerService: CustomerService,
    private customerInfoLogService: CustomerInfoLogService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private streetService: StreetService,
    private wardService: WardService,
    private hubService: HubService,
    private requestShipmentService: RequestShipmentService,
    private geocodingApiService: GeocodingApiService,
    private mapsAPILoader: MapsAPILoader,
    private cusDepartmentService: CusDepartmentService,
    private authService: AuthService,
    private ngZone: NgZone, public permissionService: PermissionService, public router: Router) {
    super(messageService, permissionService, router);
  }

  unit = environment.unit;

  parentPage: string = Constant.pages.pickupManagement.name;
  currentPage: string = Constant.pages.pickupManagement.children.createRequest.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;
  //
  data: Shipment;
  //
  shipmentNumber: any;
  //
  customers: SelectModel[];
  selectedCustomer: Customer;
  //
  customerInfoLogs: CustomerInfoLog[];
  selectedCustomerInfoLogs: CustomerInfoLog;
  //
  typeRiders: SelectItem[] = [{ label: 'Xem máy', value: false }, { label: 'Xe tải', value: true }]

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
  fromHubs: SelectItem[];
  selectedFromHub: number;
  //
  toHubs: SelectItem[];
  selectedToHub: number;
  //
  userInfo: User;
  isHubPickup: boolean = false;
  //
  selectedShipmentType: boolean = true;
  localStorageShipmentType: string = "ShipmentType";
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

  async ngOnInit() {
    await this.getUserInfo();
    this.initMap();
    this.initData();
    // this.loadCustomer();
    this.loadCustomerInfoLog();
    this.loadProvince();
    this.loadCenterHub();

    // let o1 = {
    //   one: 1,
    //   two: 2,
    //   three: 31
    // };

    // let o2 = {
    //   one: 1,
    //   two: 23,
    //   three: 3
    // };

    // let diff = Object.keys(o2).reduce((diff, key) => {
    //   if (o1[key] === o2[key]) return diff
    //   return {
    //     ...diff,
    //     [key]: o2[key]
    //   };
    // }, {});
    // if (diff !== {}) {
    //   console.log("Success");
    // }
    // console.log(diff);
  }

  async getUserInfo() {
    this.userInfo = await this.authService.getAccountInfoAsync();
  }

  changeIsHubPickup() {
    if (this.isHubPickup) {
      this.selectedFromCenterHub = this.userInfo.hub.centerHubId;
      this.selectedFromHub = this.userInfo.hubId;
      this.fromHub = this.userInfo.hub.name;
      this.loadListEmployee();
    }
    else {
      this.selectedFromCenterHub = null;
      this.selectedFromHub = null;
      this.fromHub = null;
      let customer = this.selectedCustomer;
      this.loadInfoSender(true, customer);
      this.loadListEmployee();
    }
  }

  initData() {
    this.data = new Shipment;
    this.selectedFromCenterHub = null;

    if (localStorage.getItem(this.localStorageShipmentType)) {
      this.selectedShipmentType = JSON.parse(localStorage.getItem(this.localStorageShipmentType));
    }
  }

  resetData() {
    this.data = new Shipment;
    this.customer = null;
    this.cusDepartment = null;
    this.cusDepartments = null;
    this.selectedDepartment = null;
    this.cloneCustomer = null;
    this.searchFromControl.setValue(null);
    this.searchToControl.setValue(null);
    this.selectedEmployee = null;
    this.selectedCustomer = null;
    this.resetFromLocationData();
    this.resetToLocationData();
    this.senderPhone = null;
    this.senderName = null;
    this.senderCompany = null;
    this.fromProvince = null;
    this.fromDistrict = null;
    this.fromWard = null;
    this.receiverPhone = null;
    this.receiverName = null;
    this.receiverCompany = null;
    this.employee = null;
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

  loadListEmployee() {
    if (!this.selectedFromHub) return;
    this.selectedEmployee = null;
    this.employee = null;
    this.employees = [];

    this.userService.getEmpByHubId(this.selectedFromHub).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let users = x.data as User[];

        this.employees.push({ label: "-- Chọn nhân viên --", value: null });

        users.forEach(element => {
          this.employees.push({ label: `${element.code} - ${element.fullName}`, value: element.id });
        });
        if (this.isAssignEmployee) {
          this.loadEmployee();
        } else {
          this.selectedEmployee = null;
          this.employee = null;
        }
      }
    );
  }

  loadEmployee() {
    if (!this.selectedFromWard && !this.selectedFromDistrict) return;
    this.selectedEmployee = null;
    this.employee = null;

    this.userService.getByHubWardId(this.selectedFromWard, this.selectedFromDistrict, this.data.isTruckDelivery, this.data.weight).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let users = x.data as User;
        if (users) {
          this.employees.forEach(e => {
            if (e.value === users.id) {
              this.selectedEmployee = e.value;
              this.employee = e.label;
            }
          });
        }
      }
    );
  }

  loadCustomer() {
    this.customers = [];
    this.selectedCustomer = null;
    this.objCustomers = [];

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
          this.customers.push({ label: `${element.code} ${element.name}`, value: element });
          this.objCustomers.push({ code: element.code, id: element.id, phone: element.phoneNumber, name: element.name });
        });
      }
    );
  }

  async loadCusDepartment(customerId?: any) {
    this.cusDepartments = [];
    this.selectedDepartment = null;
    this.cusDepartment = null;
    const data = await this.cusDepartmentService.getSelectModelByCustomerIdAsync(customerId);
    if (data) {
      this.cusDepartments = data;
    }
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
    // console.log(this.customerInfoLogs);
  }

  //search sender

  //filter Customers
  filterCustomers(event) {
    // this.filteredCustomers = [];
    // for (let i = 0; i < this.objCustomers.length; i++) {
    //   let customer = `${this.objCustomers[i].code} - ${this.objCustomers[i].name} - ${this.objCustomers[i].phone}`;
    //   if (customer.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
    //     this.filteredCustomers.push(customer);
    //   }
    // }

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

  onSelectedCustomer() {
    let cloneSelectedCustomer = this.customer;
    this.customers.forEach(x => {
      let obj = x.data as Customer;
      if (obj) {
        if (cloneSelectedCustomer === `${obj.code} ${obj.name}`) {
          this.selectedCustomer = obj;
          this.changeCustomer();
        }
      }
    });
  }

  keyTabSender(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
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
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã khách gửi.` });
    }
  }

  filterSenderPhones(event) {
    let includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward
    ];

    let query = event.query;
    let type = SearchCusstomerHelper.PHONE_NUMBER;
    this.customerService.search(query, type, includes).subscribe(customer => {
      this.filteredSenderPhones = this.filterSender(query, customer.data, type);
    });
  }

  selectedSenderPhone() {
    this.customers.forEach(x => {
      let obj = x.value as Customer;
      if (obj) {
        if (this.senderPhone === obj.phoneNumber) {
          this.selectedCustomer = obj;
          this.changeCustomer();
        }
      }
    });
  }

  filterSenderNames(event) {
    let includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward
    ];

    let query = event.query;
    let type = SearchCusstomerHelper.NAME;
    this.customerService.search(query, type, includes).subscribe(customer => {
      this.filteredSenderNames = this.filterSender(query, customer.data, type);
    });
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

  async selectedCusDepartment() {
    this.cusDepartments.forEach(async x => {
      if (this.cusDepartment === x.label) {
        this.selectedDepartment = x.value;
        if (this.selectedDepartment) {
          const department: CusDepartment = await this.cusDepartmentService.getAsync(this.selectedDepartment);
          if (department) {
            if (!StringHelper.isNullOrEmpty(department.representativeName)) {
              this.senderName = department.representativeName;
            } else {
              this.senderName = this.cloneCustomer.name;
            }
            if (!StringHelper.isNullOrEmpty(department.phoneNumber)) {
              this.senderPhone = department.phoneNumber;
            } else {
              this.senderPhone = this.cloneCustomer.phoneNumber;
            }
            if (!StringHelper.isNullOrEmpty(department.addressNote)) {
              this.data.addressNoteFrom = department.addressNote;
            } else {
              this.data.addressNoteFrom = this.cloneCustomer.addressNote;
            }
            if (StringHelper.isNullOrEmpty(department.address) || !department.provinceId || !department.districtId || !department.wardId) {
              await this.changeCustomer();
              this.selectedDepartment = x.value;
              this.cusDepartment = x.label;
              this.data.pickingAddress = this.cloneCustomer.address;
              this.searchFromControl.setValue(this.cloneCustomer.address);
              this.selectedFromProvince = this.cloneCustomer.provinceId;
              this.selectedFromDistrict = this.cloneCustomer.districtId;
              this.selectedFromWard = this.cloneCustomer.wardId;
              this.data.latFrom = this.cloneCustomer.lat;
              this.data.currentLat = this.cloneCustomer.lat;
              this.latitudeFrom = this.cloneCustomer.lat;
              this.data.lngFrom = this.cloneCustomer.lng;
              this.data.currentLng = this.cloneCustomer.lng;
              this.longitudeFrom = this.cloneCustomer.lng;
            } else {
              this.data.pickingAddress = department.address;
              this.searchFromControl.setValue(department.address);
              this.selectedFromProvince = department.provinceId;
              this.selectedFromDistrict = department.districtId;
              this.selectedFromWard = department.wardId;
              if (department.lat) {
                this.data.latFrom = department.lat;
                this.data.currentLat = department.lat;
                this.latitudeFrom = department.lat;
              } else {
                this.data.latFrom = this.cloneCustomer.lat;
                this.data.currentLat = this.cloneCustomer.lat;
                this.latitudeFrom = this.cloneCustomer.lat;
              }
              if (department.lng) {
                this.data.lngFrom = department.lng;
                this.data.currentLng = department.lng;
                this.longitudeFrom = department.lng;
              } else {
                this.data.lngFrom = this.cloneCustomer.lng;
                this.data.currentLng = this.cloneCustomer.lng;
                this.longitudeFrom = this.cloneCustomer.lng;
              }
            }
          }
        }
      }
    });
  }

  selectedSenderName() {
    this.customers.forEach(x => {
      let obj = x.value as Customer;
      if (obj) {
        if (this.senderName === obj.name) {
          this.selectedCustomer = obj;
          this.changeCustomer();
        }
      }
    });
  }

  filterSenderCompanies(event) {
    let includes = [
      Constant.classes.includes.customer.province,
      Constant.classes.includes.customer.district,
      Constant.classes.includes.customer.ward
    ];

    let query = event.query;
    let type = SearchCusstomerHelper.COMPANY_NAME;
    this.customerService.search(query, type, includes).subscribe(customer => {
      this.filteredSenderCompanies = this.filterSender(query, customer.data, type);
    });
  }

  selectedSenderCompany() {
    this.customers.forEach(x => {
      let obj = x.value as Customer;
      if (obj) {
        if (this.senderCompany === obj.companyName) {
          this.selectedCustomer = obj;
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
        if (senderName.toLowerCase().indexOf((query).toLowerCase()) == 0) {
          filtered.push(senderName);
        }
      }
      if (type === SearchCusstomerHelper.COMPANY_NAME) {
        if (customers[i].companyName) {
          let senderCompany = customers[i].companyName as string;
          if (senderCompany.toLowerCase().indexOf((query).toLowerCase()) == 0) {
            filtered.push(senderCompany);
          }
        }

      }
    }
    return filtered;
  }

  // filter fromProvince
  filterFromProvinces(event) {
    this.filteredFromProvinces = [];
    for (let i = 0; i < this.fromProvinces.length; i++) {
      let fromProvince = this.fromProvinces[i].label;
      if (fromProvince.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
        this.filteredFromProvinces.push(fromProvince);
      }
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
    for (let i = 0; i < this.fromDistricts.length; i++) {
      let fromDistrict = this.fromDistricts[i].label;
      if (fromDistrict.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
        this.filteredFromDistricts.push(fromDistrict);
      }
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
    for (let i = 0; i < this.fromWards.length; i++) {
      let fromWard = this.fromWards[i].label;
      if (fromWard.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
        this.filteredFromWards.push(fromWard);
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
        this.selectedEmployee = null;
        this.selectedFromHub = x.value;
        this.loadListEmployee();
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
    let type = SearchCusstomerHelper.NAME;
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
    let type = SearchCusstomerHelper.COMPANY_NAME;
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
        if (receiverName.toLowerCase().indexOf((query).toLowerCase()) == 0) {
          filtered.push(receiverName);
        }
      }
      if (type === SearchCusstomerHelper.COMPANY_NAME) {
        if (customers[i].companyName) {
          let receiverCompany = customers[i].companyName as string;
          if (receiverCompany.toLowerCase().indexOf((query).toLowerCase()) == 0) {
            filtered.push(receiverCompany);
          }
        }

      }
    }
    return filtered;
  }


  // filter toProvince
  filterToProvinces(event) {
    this.filteredToProvinces = [];
    for (let i = 0; i < this.toProvinces.length; i++) {
      let toProvince = this.toProvinces[i].label;
      if (toProvince.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
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
    for (let i = 0; i < this.toDistricts.length; i++) {
      let toDistrict = this.toDistricts[i].label;
      if (toDistrict.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
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
      }
    });
  }

  // filter toWard
  filterToWards(event) {
    this.filteredToWards = [];
    for (let i = 0; i < this.toWards.length; i++) {
      let toWard = this.toWards[i].label;
      if (toWard.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
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
        this.selectedFromPoHub = selectedPoHub;
        obj.forEach(element => {
          this.fromPoHubs.push({ label: `${element.code} - ${element.name}`, value: element.id });
          if (element.id == this.selectedFromPoHub) {
            this.fromPoHub = `${element.code} - ${element.name}`;
          }
        });
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
          if (element.id == this.selectedFromStationHub) {
            this.fromStationHub = `${element.code} - ${element.name}`;
          }
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
        this.selectedToPoHub = selectedPoHub;
        obj.forEach(element => {
          this.toPoHubs.push({ label: `${element.code} - ${element.name}`, value: element.id });
          if (element.id == this.selectedToPoHub) {
            this.toPoHub = `${element.code} - ${element.name}`;
          }
        });
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
          if (element.id == this.selectedToStationHub) {
            this.toStationHub = `${element.code} - ${element.name}`;
          }
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
          if (element.id == selectedDistrict) this.fromDistrict = `${element.code} - ${element.name}`;
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
          if (element.id == selectedWard) this.fromWard = `${element.code} - ${element.name}`;
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

        if (selectedDistrict) {
          this.selectedToDistrict = selectedDistrict;
        }
        this.toDistricts.push({ label: `-- Chọn quận/huyện --`, value: null });
        objs.forEach(element => {
          this.toDistricts.push({ label: `${element.code} - ${element.name}`, value: element.id });
          if (this.selectedToDistrict === element.id) {
            this.toDistrict = `${element.code} - ${element.name}`;
          }
        });
      }
    );
  }

  loadToWard(selectedDistrict: number = null, selectedWard: number = null) {
    this.toWards = [];
    this.resetToHubData();

    // if (!this.selectedToDistrict) return;
    if (!this.selectedToDistrict && !selectedDistrict) return;
    if (!selectedDistrict) {
      selectedDistrict = this.selectedToDistrict;
    }

    this.wardService.getWardByDistrictId(selectedDistrict).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        let objs = x.data as Ward[];

        if (selectedWard) {
          this.selectedToWard = selectedWard;
        }
        this.toWards.push({ label: `-- Chọn phường/xã --`, value: null });
        objs.forEach(element => {
          this.toWards.push({ label: `${element.code} - ${element.name}`, value: element.id });
          if (this.selectedToWard === element.id) {
            this.toWard = `${element.code} - ${element.name}`;
          }
        });

      }
    );
  }

  async loadLocationFromPlace(place: google.maps.places.PlaceResult) {
    let provinceName = "";
    let districtName = "";
    let wardName = "";
    let streetName = "";

    let isProvince: boolean;
    let isDistrict: boolean;
    let isWard: boolean;
    let isStreet: boolean;

    // place = await this.geocodingApiService.findFirstFromLatLngAsync(
    //   place.geometry.location.lat(),
    //   place.geometry.location.lng()
    // ) as google.maps.places.PlaceResult;

    // console.log(place);

    place.address_components.forEach(element => {
      if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1) {
        isProvince = true;
        provinceName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1) {
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
      else if (element.types.indexOf(GMapHelper.ROUTE) !== -1) {
        isStreet = true;
        streetName = element.long_name;
      }
    });

    let street = await this.streetService.getStreetByNameAsync(streetName);
    if (street) {
      this.fromStreetId = street[0].id;
    }

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
        // if (!super.isValidResponse(x)) return;
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
        this.districtService.getDistrictByName(districtName, this.selectedFromProvince).subscribe(
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
              // if (!super.isValidResponse(x)) return;
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
              this.wardService.getWardByName(wardName, this.selectedFromDistrict).subscribe(
                x => {
                  if (!this.cloneFromWardName) {
                    this.messageService.add({
                      severity: Constant.messageStatus.warn,
                      detail: "Vui lòng chọn Phường/xã gửi!"
                    });
                  } else {
                    // if (!super.isValidResponse(x)) return;
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
            }
          } //End districtService
        );
      } //End provinceService
    );
  }

  async loadLocationToPlace(place: google.maps.places.PlaceResult) {
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

    place.address_components.forEach(element => {
      if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_1) !== -1) {
        isProvince = true;
        provinceName = element.long_name;
      }
      else if (element.types.indexOf(GMapHelper.ADMINISTRATIVE_AREA_LEVEL_2) !== -1) {
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
        // if (!super.isValidResponse(x)) return;
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
        this.districtService.getDistrictByName(districtName, this.selectedToProvince).subscribe(
          x => {
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
              // if (!super.isValidResponse(x)) return;
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
              this.wardService.getWardByName(wardName, this.selectedToDistrict).subscribe(
                x => {
                  if (!this.cloneToWardName) {
                    this.messageService.add({
                      severity: Constant.messageStatus.warn,
                      detail: "Vui lòng chọn Phường/xã nhận!"
                    });
                  } else {
                    // if (!super.isValidResponse(x)) return;
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
            }
          } //End districtService
        );
      } //End provinceService
    );
  }

  loadHubFromByWard(selectedWard: number = null) {
    if (this.isHubPickup) {
      this.selectedFromCenterHub = this.userInfo.hub.centerHubId;
      this.selectedFromHub = this.userInfo.hubId;
      this.fromHub = this.userInfo.hub.name;
      this.loadListEmployee();
    }
    else {
      this.resetFromHubData();
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
              this.selectedFromHub = e.value;
              this.fromHub = e.label;
            }
          });
          this.loadListEmployee();
        });
      });
    }
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
        let hubId = HubHelper.getHubId(stationHub.centerHubId, stationHub.poHubId, stationHub.id);
        if (!hubId) {
          this.toHubId = this.selectedToHub;
        } else {
          this.toHubId = hubId;
        }
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
    this.searchFromControl = new FormControl();
    this.searchToControl = new FormControl();

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let fromAutocomplete = new google.maps.places.Autocomplete(this.searchFromElementRef.nativeElement, {
        // types: ["address"]
      });
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
      let toAutocomplete = new google.maps.places.Autocomplete(this.searchToElementRef.nativeElement, {
        // types: ["address"]
      });
      toAutocomplete.addListener("place_changed", () => {
        this.ngZone.run(async () => {
          //get the place result
          let place: google.maps.places.PlaceResult = toAutocomplete.getPlace();

          //verify result
          if (!place.geometry) {
            place = await this.geocodingApiService.findFromAddressAsync(place.name);

            if (!place) {
              this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy địa chỉ" });
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
    this.loadFromWard(this.selectedFromDistrict, this.selectedFromWard);
    this.loadHubFromByWard(this.selectedFromWard);
  }

  changeFromCenterHub() {
    this.loadFromPoHub();
    this.loadListEmployee();
  }

  changeFromPoHub() {
    this.loadFromStationHub();
    this.loadListEmployee();
  }

  changeFromStationHub() {
    this.loadListEmployee();
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
    this.cloneCustomer = Object.assign({}, customer);
    this.resetFromLocationData();

    if (customer) {
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

      if (!customer.provinceId || !customer.districtId || !customer.wardId || StringHelper.isNullOrEmpty(customer.address)) {
        this.messageService.add({
          severity: Constant.messageStatus.warn, detail: `${customer.name} chưa được cập nhật địa chỉ, vui lòng cập nhật lại địa chỉ`
        });
      }
      this.loadInfoSender(true, customer);
    }
  }

  loadInfoSender(isGetByCus: boolean, customer: Customer) {
    if (isGetByCus == true && !customer.address) {
      this.data.pickingAddress = customer.address;
    }
    this.searchFromControl.setValue(customer.address);
    // this.searchFromControl.disable();
    if (customer.provinceId && customer.districtId && customer.wardId) {
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
      // this.data.currentLat = customer.lat;
      // this.data.currentLng = customer.lng;

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
        // this.selectedToDistrict = null;
        this.loadToDistrict(customer.districtId);
        this.loadToWard(customer.districtId, customer.wardId);
        this.loadHubToByWard(customer.wardId);
      }
    }
  }

  async clickSaveChange() {
    if (!this.isValidToCreateRequest()) return;

    this.checkSubmit = true;

    if (this.shipmentNumber) {
      this.data.shipmentNumber = this.shipmentNumber;
    } else {
      this.data.shipmentNumber = null;
    }
    this.senderPhone = InputValue.trimInput(this.senderPhone);
    this.data.senderPhone = this.senderPhone;
    this.senderName = InputValue.trimInput(this.senderName);
    this.data.senderName = this.senderName;
    if (this.selectedDepartment) {
      this.data.cusDepartmentId = this.selectedDepartment;
    }
    if (this.senderCompany) {
      this.senderCompany = InputValue.trimInput(this.senderCompany);
      this.data.companyFrom = this.senderCompany;
    }
    if (this.data.addressNoteFrom) {
      this.data.addressNoteFrom = InputValue.trimInput(this.data.addressNoteFrom);
    }
    if (this.receiverPhone) {
      this.receiverPhone = InputValue.trimInput(this.receiverPhone);
      this.data.receiverPhone = this.receiverPhone;
    }
    if (this.receiverName) {
      this.receiverName = InputValue.trimInput(this.receiverName);
      this.data.receiverName = this.receiverName;
    }
    if (this.receiverCompany) {
      this.receiverCompany = InputValue.trimInput(this.receiverCompany);
      this.data.companyTo = this.receiverCompany;
    }
    if (this.data.addressNoteTo) {
      this.data.addressNoteTo = InputValue.trimInput(this.data.addressNoteTo);
    }
    if (this.data.cusNote) {
      this.data.cusNote = InputValue.trimInput(this.data.cusNote);
    }
    // this.data.senderPhone = this.senderPhone;
    if (this.selectedShipmentType) {
      this.data.shipmentStatusId = StatusHelper.readyToPick;
    } else {
      this.data.shipmentStatusId = StatusHelper.pickupComplete;
    }
    if (this.selectedCustomer) {
      this.data.senderId = this.selectedCustomer.id;
    }
    // this.data.senderId = this.selectedCustomer.id;
    this.data.fromProvinceId = this.selectedFromProvince;
    this.data.fromDistrictId = this.selectedFromDistrict;
    this.data.fromWardId = this.selectedFromWard;

    if (this.selectedEmployee) {
      this.data.shipmentStatusId = StatusHelper.assignEmployeePickup;
      this.data.pickUserId = this.selectedEmployee;
      this.data.currentEmpId = this.selectedEmployee;
    } else {
      this.data.pickUserId = this.selectedEmployee;
      this.data.currentEmpId = this.selectedEmployee;
    }

    this.data.fromHubId = this.selectedFromHub;
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

    if (this.fromStreetId) {
      this.data.fromStreetId = this.fromStreetId;
    }

    this.data.toHubId = this.selectedToHub;

    //createorUpdate CustomerInfoLog
    let model = new CustomerInfoLog();
    model.name = this.receiverName;
    model.address = this.data.shippingAddress;
    model.addressNote = this.data.addressNoteTo;
    // console.log(this.data.addressNoteTo);
    model.phoneNumber = this.data.receiverPhone;
    model.companyName = this.data.companyTo;
    model.provinceId = this.selectedToProvince;
    model.districtId = this.selectedToDistrict;
    model.wardId = this.selectedToWard;
    //
    this.customerInfoLogService.createOrUpdate(model).subscribe(e => {
      // console.log(e.data);
    });

    // console.log(JSON.stringify(this.data));
    const res = await this.requestShipmentService.createAsync(this.data);
    if (!super.isValidResponse(res)) return;
    this.checkSubmit = false;
    this.messageService.add({ severity: Constant.messageStatus.success, detail: "Tạo yêu cầu thành công" });
    this.resetData();
    this.refresh();
  }

  isValidToCreateRequest(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    // if (!this.selectedCustomer) {
    //   messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn khác hàng" });
    //   result = false;
    // }

    if (!this.senderPhone) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa nhập số điện thoại người gửi" });
      result = false;
    }

    if (!this.senderName) {
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

    if (!this.selectedFromHub) {
      messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn TT/CN/T gửi" });
      result = false;
    }

    if (this.selectedToProvince || this.selectedToDistrict || this.selectedToWard || this.selectedToCenterHub) {
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

      if (!this.selectedToHub) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Chưa chọn TT/CN/T nhận" });
        result = false;
      }
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  /**
   * Tab 2
   */
  datas: AOA = [];

  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length < 1) {
      // console.log('Vui lòng chọn file upload');
    } else if (target.files.length > 1) {
      // console.log('Không thể upload nhiều file cùng lúc');
    } else {
      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
        /* save data */
        this.datas = <AOA>(XLSX.utils.sheet_to_json(ws, { header: 1 }));
      };
      reader.readAsBinaryString(target.files[0]);
    }
  }

  uploadExcel() {
    if (this.datas.length === 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy dữ liệu upload, vui lòng kiểm tra lại!"
      })
      return;
    }
  }

  getSampleExcel() {

  }
  /**End Tab 2 */

  refresh() {
    this.resetData();
    this.resetFromHubData();
    this.resetFromLocationData();
    this.resetToHubData();
    this.resetToLocationData();
    this.initData();
    this.shipmentNumber = null;
  }

  keyDownFunction(event) {
    if ((event.ctrlKey || event.metaKey) && event.which === KeyCodeUtil.charS) {
      this.clickSaveChange();
      event.preventDefault();
      return false;
    }
  }

  onCheckAssignEmployee() {
    this.loadListEmployee();
  }
  async ScanShipmentNumber(txtShipmentNumber: any) {
    const shipmentNumber = txtShipmentNumber.value.trim();
    if (!shipmentNumber || shipmentNumber == "") {
      this.shipmentNumber = null;
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

    const shipment = await this.requestShipmentService.trackingShortAsyncNoMessage(shipmentNumber, includes);
    if (shipment) {
      this.messageService.add({
        severity: Constant.messageStatus.warn, detail: "Mã yêu cầu " + shipmentNumber + " đã tồn tại!",
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.shipmentNumber = null;
      this.refresh();
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.success, detail: "Quét mã yêu cầu thành công!",
      });
      SoundHelper.getSoundMessage(Constant.messageStatus.success);
    }
  }
  change() {
    if (this.selectedShipmentType) {
      this.requestShipmentName = 'Yêu cầu mới';
    } else {
      this.requestShipmentName = 'Đã lấy hàng';
    }
    localStorage.setItem(this.localStorageShipmentType, JSON.stringify(this.selectedShipmentType));
  }
}

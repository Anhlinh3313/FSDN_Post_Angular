import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  NgZone
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
//
import { Constant } from "../../../infrastructure/constant";
import { SelectItem } from "primeng/primeng";
import {
  ShipmentService,
  UserService,
  CustomerService,
  ProvinceService,
  WardService,
  DistrictService,
  HubService,
  RequestShipmentService,
  CustomerInfoLogService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import {
  User,
  Customer,
  Province,
  District,
  Ward,
  Hub
} from "../../../models/index";
import { PersistenceService } from "angular-persistence";
import { FormControl } from "@angular/forms";
// import { } from "googlemaps";
import { GMapHelper } from "../../../infrastructure/gmap.helper";
import { MapsAPILoader } from "@agm/core";
import { LadingSchesule } from "../../../models/index";

import { RequestShipment } from "../../../models/RequestShipment.model";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { CustomerInfoLog } from "../../../models/customerInfoLog.model";
import { SearchCusstomerHelper } from "../../../infrastructure/searchCustomer.helper";
import { HubHelper } from "../../../infrastructure/hub.helper";
import { StreetService } from "../../../services/street.service";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { CusDepartment } from "../../../models/cusDepartment.model";
import { CusDepartmentService } from "../../../services/cusDepartment.service.";
import { StringHelper } from "../../../infrastructure/string.helper";
// import { Message } from "@angular/compiler/src/i18n/i18n_ast";
type AOA = Array<Array<any>>;

declare var jQuery: any;

@Component({
  selector: "app-detail-request-management.component",
  templateUrl: "detail-request-management.component.html",
  styles: [
    `
  agm-map {
    height: 200px;
  }
`
  ]
})
export class DetailRequestShipmentComponent extends BaseComponent
  implements OnInit {
  selectedDepartment: number;
  cusDepartments: SelectItem[];
  filteredCusDepartments: any[];
  cusDepartment: string;
  unit = environment.unit;
  shipmentData: Shipment = new Shipment();
  shipmentLadingSchedule: LadingSchesule[] = [];
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
  constructor(
    public bsModalRef: BsModalRef,
    private cusDepartmentService: CusDepartmentService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private requestShipmentService: RequestShipmentService,
    private modalService: BsModalService,
    private userService: UserService,
    private customerService: CustomerService,
    private customerInfoLogService: CustomerInfoLogService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private streetService: StreetService,
    private wardService: WardService,
    private hubService: HubService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }

  //
  // customers: Customer[];
  // selectedCustomer: string;

  //
  modalTitle: string;
  displayDialog: boolean;
  isNew: boolean;

  //
  customers: SelectItem[];
  selectedCustomer: Customer;
  //
  customerInfoLogs: CustomerInfoLog[];
  selectedCustomerInfoLogs: CustomerInfoLog;
  //

  fromStreetId: number;
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
  datasource: Shipment[];
  totalRecords: number;
  selectedData: Shipment;
  listData: Shipment[];
  rowPerPage: number = 20;

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
  ngOnInit() {
    // this.loadData(this.shipmentData);
    this.initMap();
    // this.initData();
    this.loadCustomer();
    this.loadCustomerInfoLog();
    this.loadProvince();
    this.loadCenterHub();
    this.loadFromDistrict();
    this.loadFromWard();
    this.loadEmployee();
  }

  initData() {
    // this.requestShipmentService.getAll().subscribe(x => {
    //   this.datasource = x.data as Shipment[];
    //   this.totalRecords = this.datasource.length;
    //   this.listData = this.datasource.slice(0, this.rowPerPage);
    // });
    // // this.shipmentData = null;
    // this.selectedData = null;
    // this.isNew = true;
  }

  resetData() {
    this.shipmentData = new Shipment();
    this.shipmentLadingSchedule = [];
    this.searchFromControl.setValue(null);
    this.searchToControl.setValue(null);
    this.selectedEmployee = null;
    this.selectedCustomer = null;
    this.cloneCustomer = null;
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

      this.searchFromControl.setValue(shipment.pickingAddress);
      this.loadCustomer().subscribe(res => {
        let selectedCustomers = res.filter(
          x => (x.value ? x.value.id === shipment.senderId : x.value === 0)
        );
        this.selectedCustomer =
          selectedCustomers.length > 0 ? selectedCustomers[0].value : null;
        this.cloneCustomer = Object.assign({}, this.selectedCustomer);
        res.forEach(x => {
          if (x.value !== null) {
            if (x.value.id === this.shipmentData.senderId) {
              this.customer = x.label;
            }
          }
        });
      });
      // load department
      this.loadCusDepartment(shipment.senderId);

      this.fromStreetId = this.shipmentData.fromStreetId;
      this.senderPhone = this.shipmentData.senderPhone;
      this.senderName = this.shipmentData.senderName;
      this.senderCompany = this.shipmentData.companyFrom;

      this.receiverPhone = this.shipmentData.receiverPhone;
      this.receiverName = this.shipmentData.receiverName;
      this.receiverCompany = this.shipmentData.companyTo;

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
    } else {
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
    if (!this.fromHubId) return;
    this.selectedEmployee = null;
    this.employee = null;
    this.employees = [];

    this.userService.getEmpByHubId(this.fromHubId).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let users = x.data as User[];

      this.employees.push({ label: "-- Chọn nhân viên --", value: null });

      users.forEach(element => {
        this.employees.push({
          label: `${element.code} - ${element.fullName}`,
          value: element.id
        });
      });

      this.loadEmployee();
    });
  }

  loadEmployee() {
    if (!this.selectedFromWard) return;
    this.selectedEmployee = null;
    this.employee = null;

    this.userService.getByHubWardId(this.selectedFromWard).subscribe(x => {
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
    });
  }

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
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
          label: `${element.code} - ${element.name}- ${element.phoneNumber}`,
          value: element
        });
        this.objCustomers.push({
          code: element.code,
          id: element.id,
          phone: element.phoneNumber,
          name: element.name
        });
      });

      return this.customers;
    });
  }

  async loadCusDepartment(customerId?: any) {
    this.cusDepartments = [];
    this.selectedDepartment = null;
    this.cusDepartment = null;
    const data = await this.cusDepartmentService.getSelectModelByCustomerIdAsync(customerId);
    if (data) {
      this.cusDepartments = data;
      if (this.shipmentData.cusDepartmentId) {
        const cusDepartment = this.cusDepartments.find(x => x.value == this.shipmentData.cusDepartmentId);
        if (cusDepartment) {
          this.cusDepartment = cusDepartment.label;
          this.selectedDepartment = cusDepartment.value;
        }
      }
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
    this.filteredCustomers = [];
    for (let i = 0; i < this.objCustomers.length; i++) {
      let customer = `${this.objCustomers[i].code} - ${
        this.objCustomers[i].name
        } - ${this.objCustomers[i].phone}`;
      if (customer.toLowerCase().indexOf(event.query.toLowerCase()) >= 0) {
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
      this.filteredSenderCompanies = this.filterSender(
        query,
        customer.data,
        type
      );
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
              this.shipmentData.addressNoteFrom = department.addressNote;
            } else {
              this.shipmentData.addressNoteFrom = this.cloneCustomer.addressNote;
            }
            if (StringHelper.isNullOrEmpty(department.address) || !department.provinceId || !department.districtId || !department.wardId) {
              await this.changeCustomer();
              this.selectedDepartment = x.value;
              this.cusDepartment = x.label;
              this.shipmentData.pickingAddress = this.cloneCustomer.address;
              this.searchFromControl.setValue(this.cloneCustomer.address);
              this.selectedFromProvince = this.cloneCustomer.provinceId;
              this.selectedFromDistrict = this.cloneCustomer.districtId;
              this.selectedFromWard = this.cloneCustomer.wardId;
              this.shipmentData.latFrom = this.cloneCustomer.lat;
              this.shipmentData.currentLat = this.cloneCustomer.lat;
              this.latitudeFrom = this.cloneCustomer.lat;
              this.shipmentData.lngFrom = this.cloneCustomer.lng;
              this.shipmentData.currentLng = this.cloneCustomer.lng;
              this.longitudeFrom = this.cloneCustomer.lng;
            } else {
              this.shipmentData.pickingAddress = department.address;
              this.searchFromControl.setValue(department.address);
              this.selectedFromProvince = department.provinceId;
              this.selectedFromDistrict = department.districtId;
              this.selectedFromWard = department.wardId;
              if (department.lat) {
                this.shipmentData.latFrom = department.lat;
                this.shipmentData.currentLat = department.lat;
                this.latitudeFrom = department.lat;
              } else {
                this.shipmentData.latFrom = this.cloneCustomer.lat;
                this.shipmentData.currentLat = this.cloneCustomer.lat;
                this.latitudeFrom = this.cloneCustomer.lat;
              }
              if (department.lng) {
                this.shipmentData.lngFrom = department.lng;
                this.shipmentData.currentLng = department.lng;
                this.longitudeFrom = department.lng;
              } else {
                this.shipmentData.lngFrom = this.cloneCustomer.lng;
                this.shipmentData.currentLng = this.cloneCustomer.lng;
                this.longitudeFrom = this.cloneCustomer.lng;
              }
            }
          }
        }
      }
    });
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
        this.selectedFromHub = x.value;
        this.selectedEmployee = null;
        this.fromHubId = x.value;
        this.loadListEmployee();
      }
    });
  }

  //search receiver

  filterReceiverPhones(event) {
    let query = event.query;
    let type = SearchCusstomerHelper.PHONE_NUMBER;
    this.customerInfoLogService.search(query, type).subscribe(customer => {
      this.filteredReceiverPhones = this.filterReceiver(
        query,
        customer.data,
        type
      );
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
      this.filteredReceiverNames = this.filterReceiver(
        query,
        customer.data,
        type
      );
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
      this.filteredReceiverCompanies = this.filterReceiver(
        query,
        customer.data,
        type
      );
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
        this.selectedFromPoHub = selectedPoHub;
        obj.forEach(element => {
          this.fromPoHubs.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
          if (element.id == this.selectedFromPoHub) {
            this.fromPoHub = `${element.code} - ${element.name}`;
          }
        });
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
        if (element.id == this.selectedToStationHub) {
          this.toStationHub = `${element.code} - ${element.name}`;
        }
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
        if (selectedDistrict) this.selectedFromDistrict = selectedDistrict;
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

      if (selectedWard) this.selectedFromWard = selectedWard;
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

        if (selectedDistrict) {
          this.selectedToDistrict = selectedDistrict;
        }
        this.toDistricts.push({ label: `-- Chọn quận/huyện --`, value: null });
        objs.forEach(element => {
          this.toDistricts.push({
            label: `${element.code} - ${element.name}`,
            value: element.id
          });
          if (this.selectedToDistrict === element.id) {
            this.toDistrict = `${element.code} - ${element.name}`;
          }
        });
      });
  }

  loadToWard(selectedDistrict: number = null, selectedWard: number = null) {
    this.toWards = [];
    this.resetToHubData();

    // if (!this.selectedToDistrict) return;
    if (!this.selectedToDistrict && !selectedDistrict) return;
    if (!selectedDistrict) {
      selectedDistrict = this.selectedToDistrict;
    }

    this.wardService.getWardByDistrictId(selectedDistrict).subscribe(x => {
      if (!super.isValidResponse(x)) return;
      let objs = x.data as Ward[];

      if (selectedWard) {
        this.selectedToWard = selectedWard;
      }
      this.toWards.push({ label: `-- Chọn phường/xã --`, value: null });
      objs.forEach(element => {
        this.toWards.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
        if (this.selectedToWard === element.id) {
          this.toWard = `${element.code} - ${element.name}`;
        }
      });
    });
  }

  async loadLocationFromPlace(place: google.maps.places.PlaceResult) {
    let provinceName = "";
    let districtName = "";
    let wardName = "";
    let streetName = "";

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
      } else if (element.types.indexOf(GMapHelper.ROUTE) !== -1) {
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
              }
            } //End districtService
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
          .subscribe(
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
              }
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

    this.hubService
      .loadListHubByWard(selectedWard, includes)
      .subscribe(data => {
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
          let hubId = HubHelper.getHubId(
            stationHub.centerHubId,
            stationHub.poHubId,
            stationHub.id
          );
          this.fromHubId = hubId;
          this.loadListEmployee();
        });
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

    this.hubService
      .loadListHubByWard(selectedWard, includes)
      .subscribe(data => {
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
  }

  changeFromWard() {

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

      if (!customer.provinceId || !customer.districtId || !customer.wardId || StringHelper.isNullOrEmpty(customer.address)) {
        this.messageService.add({
          severity: Constant.messageStatus.warn, detail: `${customer.name} chưa được cập nhật địa chỉ, vui lòng cập nhật lại địa chỉ`
        });
      }

      this.searchFromControl.setValue(customer.address);
      this.selectedFromProvince = customer.province.id;

      if (customer.province) {
        this.fromProvince = `${customer.province.code} - ${customer.province.name}`;
      }
      if (customer.district) {
        this.fromDistrict = `${customer.district.code} - ${customer.district.name}`;
      }

      if (customer.province && customer.district && customer.ward) {
        this.fromLocation = "none";
      } else {
        this.fromLocation = "block";
      }

      if (this.selectedFromProvince) {
        this.selectedFromDistrict = null;
        if (customer.district) {
          this.loadFromDistrict(customer.district.id);
        }
        if (customer.ward) {
          this.loadFromWard(customer.district.id, customer.ward.id);
        } else {
          this.loadFromWard(customer.district.id, null);
        }
        if (customer.ward) {
          this.loadHubFromByWard(customer.ward.id);
        }
      }
      this.loadCusDepartment(customer.id);
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
      // this.shipmentData.currentLat = customer.lat;
      // this.shipmentData.currentLng = customer.lng;

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

  save() {
    if (this.shipmentData.shipmentStatusId === StatusHelper.newRequest) {
      this.checkSubmit = true;

      this.senderPhone = InputValue.trimInput(this.senderPhone);
      this.shipmentData.senderPhone = this.senderPhone;
      this.senderName = InputValue.trimInput(this.senderName);
      this.shipmentData.senderName = this.senderName;
      if (this.senderCompany) {
        this.senderCompany = InputValue.trimInput(this.senderCompany);
        this.shipmentData.companyFrom = this.senderCompany;
      }
      if (this.shipmentData.addressNoteFrom) {
        this.shipmentData.addressNoteFrom = InputValue.trimInput(this.shipmentData.addressNoteFrom);
      }
      if (this.receiverPhone) {
        this.receiverPhone = InputValue.trimInput(this.receiverPhone);
        this.shipmentData.receiverPhone = this.receiverPhone;
      }
      if (this.receiverName) {
        this.receiverName = InputValue.trimInput(this.receiverName);
        this.shipmentData.receiverName = this.receiverName;
      }
      if (this.receiverCompany) {
        this.receiverCompany = InputValue.trimInput(this.receiverCompany);
        this.shipmentData.companyTo = this.receiverCompany;
      }
      if (this.shipmentData.addressNoteTo) {
        this.shipmentData.addressNoteTo = InputValue.trimInput(this.shipmentData.addressNoteTo);
      }
      if (this.shipmentData.cusNote) {
        this.shipmentData.cusNote = InputValue.trimInput(this.shipmentData.cusNote);
      }

      if (this.selectedCustomer) {
        this.shipmentData.senderId = this.selectedCustomer.id;
      } else {
        this.shipmentData.senderId = null;
      }


      if (this.selectedFromProvince) {
        this.shipmentData.fromProvinceId = this.selectedFromProvince;
      }
      if (this.selectedFromDistrict) {
        this.shipmentData.fromDistrictId = this.selectedFromDistrict;
      }
      if (this.selectedFromWard) {
        this.shipmentData.fromWardId = this.selectedFromWard;
      }
      if (this.selectedEmployee) {
        this.shipmentData.shipmentStatusId = StatusHelper.assignEmployeePickup;
        this.shipmentData.pickUserId = this.selectedEmployee;
        this.shipmentData.currentEmpId = this.selectedEmployee;
      }
      this.shipmentData.fromHubId = this.fromHubId;

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

      if (!this.selectedEmployee) {
        this.shipmentData.pickUserId = null;
      }

      if (this.fromStreetId) {
        this.shipmentData.fromStreetId = this.fromStreetId;
      }
      // console.log(this.shipmentData);

      this.requestShipmentService.update(this.shipmentData).subscribe(x => {
        if (!super.isValidResponse(x)) return;

        this.checkSubmit = InputValue.checkSubmit(this.checkSubmit);
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Sửa yêu cầu thành công"
        });
        this.resetData();
      });
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: `Trạng thái là "Yêu cầu mới" mới được thực hiện cập nhật này!`
      });
    }
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }
}

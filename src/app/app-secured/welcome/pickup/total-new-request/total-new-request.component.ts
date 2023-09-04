import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  NgZone
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../../models/base.model";
import {
  ShipmentService,
  UserService,
  CustomerService,
  ProvinceService,
  WardService,
  DistrictService,
  HubService,
  RequestShipmentService,
  ReasonService
} from "../../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../../models/response.model";
import { FilterUtil } from "../../../../infrastructure/filter.util";
import { BaseComponent } from "../../../../shared/components/baseComponent";
import { StatusHelper } from "../../../../infrastructure/statusHelper";
import { Shipment } from "../../../../models/shipment.model";
import {
  User,
  Customer,
  Province,
  District,
  Ward,
  Hub,
  Reason
} from "../../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../../view-model/index";
import { ShipmentStatus } from "../../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../../infrastructure/shipmentType.helper";
import { FormControl } from "@angular/forms";
import { RequestShipment } from "../../../../models/RequestShipment.model";
import { ShipmentDetailComponent } from "../../../shipment-detail/shipment-detail.component";
import { DetailRequestShipmentComponent } from "../../../request-management/detail-request-shipment/detail-request-management.component";
import { ReasonHelper } from "../../../../infrastructure/reason.helper";
import { SearchDate } from "../../../../infrastructure/searchDate.helper";
import { PermissionService } from "../../../../services/permission.service";
import { Router } from "@angular/router";

declare var jQuery: any;

@Component({
  selector: "total-new-request",
  templateUrl: "total-new-request.component.html",
  styles: [
    `
        agm-map {
          height: 200px;
        }
      `
  ],
  providers: [CustomerService, ProvinceService, DistrictService, WardService, HubService, ReasonService],
})
export class TotalNewRequestComponent extends BaseComponent
  implements OnInit {
  txtFilterGb: any;
  selectFromHubs: number;
  lostPackageNote: string;
  showItemShipment: number;
  gbModelRef: BsModalRef;
  constructor(
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private customerService: CustomerService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private wardService: WardService,
    private hubService: HubService,
    private requestShipmentService: RequestShipmentService,
    private reasonService: ReasonService,
    private ngZone: NgZone, public permissionService: PermissionService, public router: Router) {
      super(messageService, permissionService, router);
  }
  parentPage: string = Constant.pages.request.name;
  currentPage: string = Constant.pages.request.children.listRequest.name;
  modalTitle: string;
  // bsModalRef: BsModalRef;
  displayDialog: boolean;
  isNew: boolean;

  //
  selectedData: Shipment;
  listData: Shipment[];

  //
  selectedDateFrom: Date;
  selectedDateTo: Date;

  //
  selectedPickUser: User;
  pickUser: User[];

  //
  selectedReasonPickupCancel: ReasonService;
  reasonPickupCancel: ReasonService[];
  reasonsPickupCancel: Reason;
  note: string;

  //
  columns: string[] = [
    "shipmentNumber",
    "pickUserId.fullName",
    "orderDate",
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
  datasource: Shipment[];
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
  fromHubs: SelectItem[];
  fromSelectedHub: string;
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
  @ViewChild("searchFrom") searchFromElementRef: ElementRef;
  @ViewChild("searchTo") searchToElementRef: ElementRef;

  public singlePicker = {
    singleDatePicker: true,
    showDropdowns: true,
    opens: "left"
  };

  ngOnInit() {
    this.loadShipment();
  }

  refresh() {
    this.loadShipment();
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

  loadData(shipment: Shipment[]) {
  this.datasource = shipment as Shipment[];
  this.totalRecords = this.datasource.length;
  this.listData = this.datasource.slice(0, this.rowPerPage);

  this.data = null;
  this.selectedData = null;
  this.isNew = true;
  }

  loadShipment() {
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
      // includes.push(Constant.classes.includes.shipment.companyFrom);
      // includes.push(Constant.classes.includes.shipment.companyTo);

    this.requestShipmentService
      .getByType(ShipmentTypeHelper.historyPickup, includes)
      .subscribe(x => {
        this.datasource = x.data as Shipment[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadFromHub();
        this.loadShipmentStatus();
      });

    this.reasonService.getByType(ReasonHelper.PickCancel).subscribe(x => {
      this.reasonPickupCancel = x.data as ReasonService[];
    });
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
        if (this.fromSelectedHub) {
          filterRows = filterRows.filter(x => {
            if (x.fromHub) {
              return x.fromHub.name === this.fromSelectedHub;
            }
            return false;
          });
        }
        if (this.selectedStatus) {
          filterRows = filterRows.filter(x => {
            if (x.shipmentStatus) {
              return x.shipmentStatus.name === this.selectedStatus;
            } else {
              return false;
            }
          });
        }

        if (this.selectedDateFrom && this.selectedDateTo) {
          //
          filterRows = filterRows.filter(x =>
            moment(x.orderDate).isBetween(
              this.selectedDateFrom,
              this.selectedDateTo
            )
          );
        } else if (this.selectedDateFrom) {
          filterRows = filterRows.filter(x =>
            moment(x.orderDate).isAfter(this.selectedDateFrom)
          );
        } else if (this.selectedDateTo) {
          filterRows = filterRows.filter(x =>
            moment(x.orderDate).isBefore(this.selectedDateTo)
          );
          //
        }

        // search datetime
        if (this.txtFilterGb) {
          let result = SearchDate.searchFullDate(this.txtFilterGb);
          if (result) {
            filterRows = this.datasource.filter(x =>
              FilterUtil.gbFilterFiled(x, result, this.columns)
            );
          }
          //
          let res = SearchDate.searchDayMonth(this.txtFilterGb);
          if (res) {
            filterRows = this.datasource.filter(x =>
              FilterUtil.gbFilterFiled(x, res, this.columns)
            );
          }
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

  openModel(template: TemplateRef<any>, data: Shipment = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new Shipment();
    }
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-lg"
    });
  }

  onDetailRequestShipment(template, data: Shipment) {
    // console.log(data.shipmentNumber);
    this.showItemShipment = data.id;
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new Shipment();
    }
    // this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-lg' });

    this.gbModelRef = this.modalService.show(DetailRequestShipmentComponent, {
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
      Constant.classes.includes.shipment.sender,

      Constant.classes.includes.shipment.fromHubRouting,
      Constant.classes.includes.shipment.toHubRouting,
      Constant.classes.includes.shipment.pickUser
    ];

    this.requestShipmentService
      .get(this.showItemShipment, includes)
      .subscribe(x => {
        // console.log(x);
        if (!super.isValidResponse(x)) return;
        this.gbModelRef.content.loadData(x.data as Shipment);
      });
  }

  openDeleteModel(template: TemplateRef<any>, data: Shipment) {
    if (data) {
      this.modalTitle = "Hủy yêu cầu";
      this.isNew = false;
      this.selectedData = data;
      this.data = this.clone(data);
      this.selectedReasonPickupCancel = data.reasonService;
    } else {
      this.isNew = true;
      this.data = new Shipment();
      this.selectedData = new Shipment;
    }

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  openModelPickUser(template: TemplateRef<any>, data: Shipment) {
    if (data) {
      this.modalTitle = "Phân NVLH";
      this.isNew = false;

      this.selectedData = data;
      this.data = this.clone(data);
      this.selectFromHubs = data.fromHubId;

      if (!this.selectFromHubs) {
        this.userService.getEmpByCurrentHub().subscribe(x => {
          if (!super.isValidResponse(x)) return;
          // this.pickUser.forEach(x => {
          //   if(x.hubId){
          //     console.log("name: " + x.fullName + "pickupUser Hub: " + x.hubId);
          //   }
          // });

          if (data.pickUser) {
            this.selectedPickUser = data.pickUser as User;
            this.pickUser = x.data as User[];
          } else {
            this.selectedPickUser = null;
            let data = x.data as User[];
            this.pickUser = [];
            this.pickUser.push(new User());
            data.forEach(x => {
              this.pickUser.push(x);
            });
            // console.log(this.pickUser);
          }
        });
      } else {
        this.userService.getEmpByHubId(this.selectFromHubs).subscribe(x => {
          if (!super.isValidResponse(x)) return;
          // this.pickUser = x.data as User[];
          // console.log(this.pickUser);

          if (data.pickUser) {
            this.selectedPickUser = data.pickUser as User;
            this.pickUser = x.data as User[];
          } else {
            this.selectedPickUser = new User();
            let data = x.data as User[];
            this.pickUser = [];
            // this.pickUser.push(new User());
            data.forEach(x => {
              this.pickUser.push(x);
            });
            // console.log(this.pickUser);
          }
        });
      }

    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new Shipment();
      this.selectedPickUser = new User;
    }
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  openModelLost(template: TemplateRef<any>, data: Shipment) {
    if (data) {
      this.modalTitle = "Mất hàng";
      this.isNew = false;
      this.selectedData = data;
      this.data = this.clone(data);
      this.lostPackageNote = data.note;
    } else {
      this.isNew = true;
      this.data = new Shipment();
      this.selectedData = new Shipment;
    }

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  compareFn(c1: RequestShipment, c2: RequestShipment): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  save(data: Shipment) {
    let list = [...this.listData];
    if (this.isNew) {
      if (data.shipmentStatus.name === "Yêu cầu mới") {
        this.requestShipmentService.create(this.data).subscribe(x => {
          if (!this.isValidResponse(x)) return;
          var obj = x.data as Shipment;
          this.mapSaveData(obj);
          list.push(this.data);
          this.datasource.push(this.data);
          this.saveClient(list);
        });
      } else {
        return;
      }
    } else {
      if (data.shipmentStatus.name === "Yêu cầu mới") {
        this.requestShipmentService.update(this.data).subscribe(x => {
          if (!this.isValidResponse(x)) return;
          var obj = x.data as Shipment;
          this.mapSaveData(obj);
          list[this.findSelectedDataIndex()] = this.data;
          this.datasource[
            this.datasource.indexOf(this.selectedData)
          ] = this.data;
          this.saveClient(list);
        });
      } else {
        return;
      }
    }
  }

  mapSaveData(obj: Shipment) {
    if (obj) {
      if (this.data) {
        this.data.id = obj.id;
      }
      this.data.concurrencyStamp = obj.concurrencyStamp;
    }
  }

  saveClient(list: Shipment[]) {
    this.messageService.add({
      severity: Constant.messageStatus.success,
      detail: "Cập nhật thành công"
    });
    this.listData = list;
    this.data = new Shipment();
    this.selectedData = new Shipment();
    this.bsModalRef.hide();
  }

  delete(data: Shipment) {
    let list = [...this.listData];

    if (this.selectedReasonPickupCancel) {
      this.data.reasonService = this.selectedReasonPickupCancel;
      this.data.shipmentStatusId = StatusHelper.pickupCancel;

      let note = "";
      let reasonNote = JSON.stringify(this.selectedReasonPickupCancel);
      // this.data.shipmentStatus.name = JSON.parse(reasonNote).name;

      if (data.note) {
        note = `${JSON.parse(reasonNote).name}, ${data.note}`;
      } else {
        note = `${JSON.parse(reasonNote).name}`;
      }
      data.note = note;
      this.requestShipmentService.update(this.data).subscribe(x => {
        if (!super.isValidResponse(x)) return;
        var obj = x.data as Shipment;
        this.mapPickupCancelData(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    } else {
      // console.log(this.selectedReasonPickupCancel);
    }
    // this.refresh();
  }

  mapPickupCancelData(obj: Shipment) {
    if (obj) {
      if (this.data) {
        this.data.id = obj.id;
      }
      this.data.concurrencyStamp = obj.concurrencyStamp;
      this.data.reasonService = this.selectedReasonPickupCancel;
    }
  }

  updateLostPackge(data: Shipment) {
    // alert(this.lostPackageNote);
    let list = [...this.listData];

        if (this.lostPackageNote && this.lostPackageNote.toString().trim() !== "") {
          this.data.note = this.lostPackageNote;
          this.data.shipmentStatusId = StatusHelper.pickupLostPackage;
          // console.log("satutusId: " + StatusHelper.pickupLostPackage);

          let note = "";

          if (data.note) {
            note = `${this.lostPackageNote}, ${data.note}`;
          } else {
            note = `${this.lostPackageNote}`;
          }
          data.note = note;
          // console.log(data.note);
          this.requestShipmentService.update(this.data).subscribe(x => {
            if (!super.isValidResponse(x)) return;
            var obj = x.data as Shipment;
            this.mapSaveLostPackage(obj);
            list[this.findSelectedDataIndex()] = this.data;
            this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
            this.saveClient(list);
          });
        } else {
          this.messageService.add({
            severity: Constant.messageStatus.warn, detail: "Vui lòng nhập lý do mất hàng!"
          });
        }

      // this.refresh();
  }

  choicePickupUser(data: Shipment) {
    // console.log(this.selectedData);
    let list = [...this.listData];

      if (typeof this.selectedPickUser.fullName === "undefined") {
        this.messageService.add({
          severity: Constant.messageStatus.warn, detail: "Vui lòng chọn NVLH!"
        });
      } else {
        // console.log(this.selectedPickUser);
        this.data.pickUser = this.selectedPickUser;
        this.data.pickUserId = this.selectedPickUser.id;
        this.data.shipmentStatusId = StatusHelper.assignEmployeePickup;
        this.data.pickUser.fullName = this.selectedPickUser.fullName;
        this.data.currentEmpId = this.selectedPickUser.id;

        this.requestShipmentService.update(this.data).subscribe(x => {
          if (!super.isValidResponse(x)) return;
          var obj = x.data as Shipment;
          this.mapSavePickupUser(obj);
          list[this.findSelectedDataIndex()] = this.data;
          this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
          this.saveClient(list);
        });
      }
    // this.refresh();
  }

  mapSaveLostPackage(obj: Shipment) {
    if (obj) {
      if(this.data){
        this.data.id = obj.id;
        this.data.concurrencyStamp = obj.concurrencyStamp;
        this.data.note = this.lostPackageNote;
        // this.data.shipmentStatus.name = "Mất hàng khi lấy hàng";
        this.data.shipmentStatusId = StatusHelper.pickupLostPackage;
      }
    }
  }

  mapSavePickupUser(obj: Shipment) {
    if (obj) {
      if(this.data){
        this.data.id = obj.id;
        this.data.concurrencyStamp = obj.concurrencyStamp;
        this.data.pickUser.fullName = this.selectedPickUser.fullName;
        this.data.pickUserId = this.selectedPickUser.id;
        this.data.currentEmpId = this.selectedPickUser.id;
        this.data.shipmentStatusId = StatusHelper.assignEmployeePickup;
      }

    }
  }

  changeFromHub() {
    this.loadLazy(this.event);
  }

  changeShipmentStatus() {
    this.loadLazy(this.event);
  }

  loadFromHub() {
    this.fromSelectedHub = null;
    let uniqueFromHub = [];
    this.fromHubs = [];

    this.datasource.forEach(x => {
      if (uniqueFromHub.length === 0) {
        this.fromHubs.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (uniqueFromHub.indexOf(x.fromHubId) === -1 && x.fromHubId) {
        uniqueFromHub.push(x.fromHubId);
        this.fromHubs.push({ label: x.fromHub.name, value: x.fromHub.name });
      }
    });
  }

  loadShipmentStatus() {
    this.selectedStatus = null;
    let uniqueShipmentStatus = [];
    this.statuses = [];

    this.datasource.forEach(x => {
      if (uniqueShipmentStatus.length === 0) {
        this.statuses.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (
        uniqueShipmentStatus.indexOf(x.shipmentStatusId) === -1 &&
        x.shipmentStatusId
      ) {
        uniqueShipmentStatus.push(x.shipmentStatusId);
        this.statuses.push({
          label: x.shipmentStatus.name,
          value: x.shipmentStatus.name
        });
      }
    });
  }

  clone(model: Shipment): Shipment {
    let data = new Shipment();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }
}

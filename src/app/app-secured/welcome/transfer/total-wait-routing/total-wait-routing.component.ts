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
  import * as JsBarcode from "jsbarcode";
  //
  import { Constant } from "../../../../infrastructure/constant";
  import { LazyLoadEvent, SelectItem } from "primeng/primeng";
  import { BaseModel } from "../../../../models/base.model";
  import {
    ShipmentService,
    UserService,
    ProvinceService,
    WardService,
    DistrictService,
    HubService,
    RequestShipmentService,
    AuthService,
    ReasonService,
    CustomerService
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
    Province,
    District,
    Ward,
    Hub,
    PrintModel
  } from "../../../../models/index";
  import { PersistenceService, StorageType } from "angular-persistence";
  import {
    KeyValuesViewModel,
    ListUpdateStatusViewModel
  } from "../../../../view-model/index";
  import { ShipmentStatus } from "../../../../models/shipmentStatus.model";
  import { ShipmentTypeHelper } from "../../../../infrastructure/shipmentType.helper";
  import { FormControl } from "@angular/forms";
  import { Input } from "@angular/core/src/metadata/directives";
  import { DetailShipmentManagementComponent } from "../../../shipment-management/detail-shipment-management/detail-shipment-management.component";
  import { ReasonHelper } from "../../../../infrastructure/reason.helper";
  import { PrintHelper } from "../../../../infrastructure/printHelper";
import { Router } from "@angular/router";
import { PermissionService } from "../../../../services/permission.service";
import { ShipmentFilterViewModel } from "../../../../models/shipmentFilterViewModel";
import { ArrayHelper } from "../../../../infrastructure/array.helper";
  
  declare var jQuery: any;
  declare var $: any;
  
  @Component({
    selector: "total-wait-routing",
    templateUrl: "total-wait-routing.component.html",
    styles: [],
    providers: [CustomerService, ProvinceService, DistrictService, WardService, HubService, ReasonService],
  })
  export class TotalWaitRoutingComponent extends BaseComponent
    implements OnInit {
    objSelectesServiceDVGTs: any[];
    txtFilterGb: any;
    txtToWeight: any;
    txtFromWeight: any;
    txtShipmentNumber: any;
    searchShipmentNumber: any;
    gbModelRef: BsModalRef;
    showItemShipment: any;
    isShow = true;
    arrPrintShipment: any = [];
    generatorBarcode: string;
  
    constructor(
      public bsModalRef: BsModalRef,
      private modalService: BsModalService,
      private persistenceService: PersistenceService,
      protected messageService: MessageService,
      private shipmentService: ShipmentService,
      private userService: UserService,
      private provinceService: ProvinceService,
      private districtService: DistrictService,
      private wardService: WardService,
      private hubService: HubService,
      private requestShipmentService: RequestShipmentService,
      private ngZone: NgZone,
      private authService: AuthService,
      private reasonService: ReasonService, public permissionService: PermissionService, public router: Router) {
        super(messageService, permissionService, router);
    }
    parentPage: string = Constant.pages.shipment.name;
    currentPage: string = Constant.pages.shipment.children.listShipment.name;
    modalTitle: string;
    // bsModalRef: BsModalRef;
    displayDialog: boolean;
    isNew: boolean;
  
    itemShipment: any = [];
  
    //
    selectedDateFrom: Date;
    selectedDateTo: Date;
  
    //
    columns: string[] = [
      "shipmentNumber",
      "pickUserId.name",
      "service",
      "service.name",
      "orderDate",
      "fromHubRouting.name",
      "senderName",
      "senderPhone",
      "companyFrom",
      "pickingAddress",
      "fromHub.name",
      "fromHub",
      "fromProvinceId",
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
      "toHubRouting",
      "deliverUser",
      "deliverUser.fullName",
      "paymentType",
      "paymentType.name",
      "weight",
      "sender.code",
      "totalBox",
      "structure",
      "serviceDVGT",
      "serviceDVGT.id"
    ];
    datasource: Shipment[];
    totalRecords: number;
    rowPerPage: number = 20;
    event: LazyLoadEvent;
  
    //
    selectedData: Shipment;
    listData: Shipment[];
  
    //
    fromSenders: SelectItem[];
    fromSelectedSender: number;
  
    //
    statuses: SelectItem[];
    selectedStatus: string;
  
    //
    services: SelectItem[];
    selectedServices: number;
  
    //
    paymentTypes: SelectItem[];
    selectedPaymentType: number;
  
    //
    fromProvinces: SelectItem[];
    fromSelectedProvince: number;
  
    //
    toProvinces: SelectItem[];
    toSelectedProvince: number;
  
    //
    toWeight: number = 0;
    fromWeight: number = 0;
  
    //
    data: Shipment;
  
    //
    selectedReasonPickupCancel: ReasonService;
    reasonPickupCancel: ReasonService[];
    currentDate = new Date();
  
    public singlePickerDateFrom = {
      singleDatePicker: true,
      showDropdowns: true,
      opens: "left",
      startDate: "01/01/2017",
    }
  
    public singlePickerDateTo = {
      singleDatePicker: true,
      showDropdowns: true,
      opens: "left",
      startDate: this.currentDate,
    }
  
    ngOnInit() {
      this.loadShipment();
      $("#print-section").hide();
      this.selectedDateTo = new Date();
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
      let includes: string =
      Constant.classes.includes.shipment.fromHubRouting + "," +
      Constant.classes.includes.shipment.shipmentStatus + "," +
      Constant.classes.includes.shipment.service + "," +
      Constant.classes.includes.shipment.fromHub + "," +
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
      Constant.classes.includes.shipment.boxes;
      // includes.push(Constant.classes.includes.shipment.companyFrom);
      // includes.push(Constant.classes.includes.shipment.companyTo);
  
      let shipmentFilterViewModel = new ShipmentFilterViewModel();
      shipmentFilterViewModel.Type = ShipmentTypeHelper.transfer;
      shipmentFilterViewModel.Cols = includes;

      this.datasource = [];
      this.listData = [];
      this.shipmentService
        .postByType(shipmentFilterViewModel)
        .subscribe(x => {
          this.datasource = x.data as Shipment[];
          if (!ArrayHelper.isNullOrZero(this.datasource)) {
            this.totalRecords = this.datasource.length;
            this.listData = this.datasource.slice(0, this.rowPerPage);
            // console.log(this.listData);
            this.loadFromSenders();
            this.loadShipmentStatus();
            this.loadServices();
            this.loadPaymentTypes();
            this.loadFromProvinces();
            this.loadToProvinces();
          }
        });
  
  
        this.reasonService.getByType(ReasonHelper.PickCancel).subscribe(x => {
          this.reasonPickupCancel = x.data as ReasonService[];
        });
  
        //refresh
        this.txtFilterGb = null;
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
          if (event.filters.length > 0)
            filterRows = this.datasource.filter(x =>
              FilterUtil.filterField(x, event.filters)
            );
          else
            filterRows = this.datasource.filter(x =>
              FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
            );
  
          //Begin Custom filter
          if(this.searchShipmentNumber) {
            filterRows = filterRows.filter(
              x => x.shipmentNumber === this.searchShipmentNumber
            );
          }
  
          if (this.fromSelectedSender) {
            filterRows = filterRows.filter(
              x => x.senderName === this.fromSelectedSender
            );
          }
          if (this.selectedStatus) {
            filterRows = filterRows.filter(
              x => {
                if(x.shipmentStatus){
                  return x.shipmentStatus.name === this.selectedStatus;
                } else {
                  return false;
                }
              });
          }
          if (this.selectedServices) {
            filterRows = filterRows.filter(
              x => x.service.name === this.selectedServices
            );
          }
          if (this.selectedPaymentType) {
            filterRows = filterRows.filter(
              x => {
                if (x.paymentType) {
                  return x.paymentType.name === this.selectedPaymentType;
                } else {
                  return false;
                }
              }
            );
          }
          if (this.fromSelectedProvince) {
            filterRows = filterRows.filter(
              x => x.fromWard.district.province.name === this.fromSelectedProvince
            );
          }
          if (this.toSelectedProvince) {
            filterRows = filterRows.filter(
              x => x.toWard.district.province.name === this.toSelectedProvince
            );
          }
          if(this.toWeight == 0) {
            if (typeof this.fromWeight != 'undefined' && this.fromWeight != null) {
              filterRows = filterRows.filter(x => x.weight >= this.fromWeight);
            }
          }
          if(this.toWeight > 0) {
            filterRows = filterRows.filter(x => x.weight <= this.toWeight);
            if(this.fromWeight > 0) {
              filterRows = filterRows.filter(x => (x.weight <= this.toWeight && x.weight >= this.fromWeight) );
            }
          }
          if(this.selectedDateFrom && this.selectedDateTo) {
            //
            filterRows = filterRows.filter(x => moment(x.orderDate).isBetween(this.selectedDateFrom, this.selectedDateTo));
          } else if(this.selectedDateFrom) {
            filterRows = filterRows.filter(x => moment(x.orderDate).isAfter(this.selectedDateFrom));
          } else if(this.selectedDateTo) {
            filterRows = filterRows.filter(x => moment(x.orderDate).isBefore(this.selectedDateTo));
            //
          }
  
          // sort data
          filterRows.sort(
            (a, b) =>
              FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
          );
          this.listData = filterRows.slice(event.first, event.first + event.rows);
          this.totalRecords = filterRows.length;
          // console.log(this.listData);
  
          // this.listData = filterRows.slice(event.first, (event.first + event.rows));
        }
      }, 250);
    }
  
    onDetailShipment(template, data: Shipment) {
      // console.log(JSON.stringify(data));
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
      this.gbModelRef = this.modalService.show(DetailShipmentManagementComponent, {
        class: "inmodal animated bounceInRight modal-lg"
      });
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
  
      this.shipmentService
        .get(this.showItemShipment, includes)
        .subscribe(x => {
          if (!super.isValidResponse(x)) return;
          this.gbModelRef.content.loadData(x.data as Shipment);
        });
    }
  
    openDeleteModel(template: TemplateRef<any>, data: Shipment) {
      if (data) {
        this.modalTitle = "Hủy vận đơn";
        this.isNew = false;
        this.selectedData = data;
        this.data = this.clone(data);
        this.selectedReasonPickupCancel = data.reasonService;
      } else {
        this.isNew = true;
      }
  
      this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
      });
    }
  
    // mapSaveData(obj: Shipment) {
    //   if (obj) {
    //     this.data.id = obj.id;
    //     this.data.concurrencyStamp = obj.concurrencyStamp;
    //     this.data.reasonService = this.selectedReasonPickupCancel;
    //     // this.data.shipmentStatus.name = "Hủy lấy hàng";
    //   }
    // }
  
    // saveClient(list: Shipment[]) {
    //   this.messageService.add({
    //     severity: Constant.messageStatus.success,
    //     detail: "Cập nhật thành công"
    //   });
    //   this.listData = list;
    //   this.data = new Shipment();
    //   this.selectedData = new Shipment();
    //   this.bsModalRef.hide();
    // }
  
    delete() {
      // alert("123");
  
      // let list = [...this.listData];
      
      //     if (this.selectedReasonPickupCancel) {
      //       this.data.reasonService = this.selectedReasonPickupCancel;
      //       this.data.shipmentStatusId = StatusHelper.pickupCancel;
      
      //       let note = "";
      //       let reasonNote = JSON.stringify(this.selectedReasonPickupCancel);
      //       // this.data.shipmentStatus.name = JSON.parse(reasonNote).name;
      
      //       if (data.note) {
      //         note = `${JSON.parse(reasonNote).name}, ${data.note}`;
      //       } else {
      //         note = `${JSON.parse(reasonNote).name}`;
      //       }
      //       data.note = note;
      //       this.requestShipmentService.update(this.data).subscribe(x => {
      //         if (!super.isValidResponse(x)) return;
      //         var obj = x.data as Shipment;
      //         this.mapSaveData(obj);
      //         list[this.findSelectedDataIndex()] = this.data;
      //         this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
      //         this.saveClient(list);
      //       });
      //     } else {
      //       console.log(this.selectedReasonPickupCancel);
      //     }
      
      //     setTimeout(() => {
      //       this.refresh();
      //     },100);
    }
  
    changeShipment(txtShipment) {
        this.searchShipmentNumber = txtShipment.value;
        this.loadLazy(this.event);
    }
  
    changeSender() {
      this.loadLazy(this.event);
    }
  
    changeShipmentStatus() {
      this.loadLazy(this.event);
    }
  
    changeServices() {
      this.loadLazy(this.event);
    }
  
    changePaymentType() {
      this.loadLazy(this.event);
    }
  
    changeFromProvince() {
      this.loadLazy(this.event);
    }
  
    changeToProvince() {
      this.loadLazy(this.event);
    }
  
    changeFromWeight(input: number) {
      setTimeout(() => {
        this.loadLazy(this.event);
      }, 0);
      this.fromWeight = input;
    }
  
    changeToWeight(input: number) {
      setTimeout(() => {
        this.loadLazy(this.event);
      }, 0);
      this.toWeight = input;
    }
  
    //
  
    loadFromSenders() {
      this.fromSelectedSender = null;
      let uniqueFromSelectedSender = [];
      this.fromSenders = [];
  
      this.datasource.forEach(x => {
        if (uniqueFromSelectedSender.length === 0) {
          this.fromSenders.push({ label: "Chọn tất cả", value: null });
        }
        //
        if (uniqueFromSelectedSender.indexOf(x.senderId) === -1 && x.senderId) {
          uniqueFromSelectedSender.push(x.senderId);
          this.fromSenders.push({
            label: x.senderName,
            value: x.senderName
          });
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
  
    loadServices() {
      this.selectedServices = null;
      let uniqueServices = [];
      this.services = [];
  
      this.datasource.forEach(x => {
        if (uniqueServices.length === 0) {
          this.services.push({ label: "Chọn tất cả", value: null });
        }
        //
        if (uniqueServices.indexOf(x.serviceId) === -1 && x.serviceId) {
          uniqueServices.push(x.serviceId);
          this.services.push({
            label: x.service.name,
            value: x.service.name
          });
        }
      });
    }
  
    loadPaymentTypes() {
      this.selectedPaymentType = null;
      let uniquePaymentType = [];
      this.paymentTypes = [];
  
      this.datasource.forEach(x => {
        if (uniquePaymentType.length === 0) {
          this.paymentTypes.push({ label: "Chọn tất cả", value: null });
        }
        //
        if (
          uniquePaymentType.indexOf(x.paymentTypeId) === -1 &&
          x.paymentTypeId
        ) {
          uniquePaymentType.push(x.paymentTypeId);
          this.paymentTypes.push({
            label: x.paymentType.name,
            value: x.paymentType.name
          });
        }
      });
    }
  
    loadFromProvinces() {
      this.fromSelectedProvince = null;
      let uniqueFromSelectedProvince = [];
      this.fromProvinces = [];
  
      this.datasource.forEach(x => {
        if (uniqueFromSelectedProvince.length === 0) {
          this.fromProvinces.push({ label: "Chọn tất cả", value: null });
        }
        //
        if (
          uniqueFromSelectedProvince.indexOf(x.fromWard.district.province.id) ===
            -1 &&
          x.fromWard.district.province.id
        ) {
          uniqueFromSelectedProvince.push(x.fromWard.district.province.id);
          this.fromProvinces.push({
            label: x.fromWard.district.province.name,
            value: x.fromWard.district.province.name
          });
        }
      });
    }
  
    loadToProvinces() {
      this.toSelectedProvince = null;
      let uniqueToSelectedProvince = [];
      this.toProvinces = [];
  
      this.datasource.forEach(x => {
        if (uniqueToSelectedProvince.length === 0) {
          this.toProvinces.push({ label: "Chọn tất cả", value: null });
        }
        //
        if (
          uniqueToSelectedProvince.indexOf(x.toWard.district.province.id) ===
            -1 &&
          x.toWard.district.province.id
        ) {
          uniqueToSelectedProvince.push(x.toWard.district.province.id);
          this.toProvinces.push({
            label: x.toWard.district.province.name,
            value: x.toWard.district.province.name
          });
        }
      });
    }
  
    //
  
    changeValue(data: Shipment) {
      this.itemShipment = data as Shipment;
      this.itemShipment.createdBy = this.authService.getFullName();
      this.generatorBarcode = this.itemShipment.shipmentNumber as string;
  
      JsBarcode("#shipment-barcode", this.generatorBarcode, {
        format: "CODE128",
        height: 40,
        width: 1,
        displayValue: false
      });
  
      const time = new Date;
      this.itemShipment.getFullYear = time.getFullYear();
      this.itemShipment.companyName = PrintHelper.CompanyName;
      this.itemShipment.hotline = PrintHelper.Hotline;
      this.itemShipment.centerHubAddress = PrintHelper.CenterHubAddress;
      this.itemShipment.website = PrintHelper.Website;
        if (this.itemShipment.totalBox && this.data.totalBox) {
          this.itemShipment.totalBox = this.data.totalBox;
        }
        if (this.itemShipment.calWeight && this.data.calWeight) {
          this.itemShipment.calWeight = this.data.calWeight;
        }
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
  
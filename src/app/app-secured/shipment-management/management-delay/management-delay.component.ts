import {
  Component, 
  OnInit,
  TemplateRef, 
}from "@angular/core"; 
import {MessageService }from "primeng/components/common/messageservice"; 
import {BaseComponent }from "../../../shared/components/baseComponent"; 
import {PermissionService }from "../../../services/permission.service"; 
import {Router }from "@angular/router"; 
import {Constant }from "../../../infrastructure/constant"; 
import {ShipmentService, EmailCenterService, CustomerService, ReasonService, ServiceService }from "../../../services"; 
import * as moment from "moment";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { DaterangePickerHelper } from "../../../infrastructure/daterangePicker.helper";
import { SendEmailShipmentViewModel, EmailCenterDetailViewModel } from "../../../view-model";
import { SelectModel } from "../../../models/select.model";
import { SortUtil } from "../../../infrastructure/sort.util";
import { LazyLoadEvent } from "primeng/primeng";
@Component( {
  selector:"app-management-delay", 
  templateUrl:"management-delay.component.html", 
  styles:[]
})
export class ManagementDelayComponent extends BaseComponent implements OnInit {
  parentPage:string = Constant.pages.shipment.name; 
  currentPage:string = Constant.pages.shipment.children.managementDelay.name; 
  //
  isActiveTabOne:boolean = true; 
  //
  titleTabOne:string; 
  //
  sCanShipmentNumber:string = "";
  dataCompenstion: any;
  optionSingleDateFrom: any;
  optionSingleDateTo: any;
  //
  customerId: any;
  serviceId: any;
  reasonDelayId: any;
  fromDate: any;
  toDate: any;
  pageSize: number = 20;
  pageNumber: number = 1;
  totalRecords: number;
  rowPerPage: number = 20;
  //
  dataDelay:any;
  selectedData: any[] = [];
  reasonDelays:SelectModel[] = [];
  reasonDelay:any;
  serviceDelays:SelectModel[] = [];
  serviceDelay:any;
  //
  bsModalRef: BsModalRef;
  dataDelayRef: any[];
  dataSendEmailRef: SendEmailShipmentViewModel = new SendEmailShipmentViewModel();
  dataEmailCenterDetailRef: EmailCenterDetailViewModel;
  emailCenterDetailRef: any[] = [];
  //
  title:string;
  body:string;
  nameFrom:string;
  infoShipments:any;
  //
  formPrintBody: any;
  ckeConfig: any;
   //
   customers: SelectModel[] = [];
   customerFilters: string[] = [];
   customerSelected: string;
   //
  constructor(
    protected shipmentService:ShipmentService, 
    protected messageService:MessageService, 
    private modalService: BsModalService,
    private emailCenterService: EmailCenterService,
    private customerService: CustomerService,
    private reasonService: ReasonService,
    private serviceService: ServiceService,
    public permissionService:PermissionService, public router:Router) {
      super(messageService, permissionService, router); 
    // dateRangePicker
  }
  ngOnInit() {
    this.initData(); 
  }
  initData() {
    this.titleTabOne = "Báo vận đơn ưu tiên"; 
    this.optionSingleDateFrom = DaterangePickerHelper.getOptionSingleDatePickerNoTime(this.optionSingleDateFrom);
    this.optionSingleDateTo = DaterangePickerHelper.getOptionSingleDatePickerNoTime(this.optionSingleDateTo);
    this.loadListShipmentDelay();
    this.loadReasonDelay();
    this.loadServiceDelay();
  }
  onSelectTabOne() {
    this.isActiveTabOne = true; 
  }
  eventEnterShipmentNumber() {
    this.loadListShipmentDelay(); 
  }
  async loadListShipmentDelay() {
    if (!this.fromDate) {// load ngày hiện tại
      this.fromDate = moment(new Date()).format("YYYY/MM/DD 00:00");
    }
    if (!this.toDate) {// load ngày hiện tại
      this.toDate = SearchDate.formatToISODate(new Date());
    }
    let results = await this.shipmentService.getListShipmentDelayAsync(this.customerId, this.serviceId, this.reasonDelayId, this.fromDate, this.toDate, this.pageSize, this.pageNumber);
    if (results.isSuccess) {
      this.dataDelay = results.data;
      this.totalRecords = results.data ? results.data[0].totalCount : 0;
    }
  }
  onPageChange(event: LazyLoadEvent) {
    this.pageNumber = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.loadListShipmentDelay();
  } 
  onChangeReasonDelay(){
    this.reasonDelayId = this.reasonDelay;
    this.loadListShipmentDelay()
  }
  onChangeServiceDelay(){
    this.serviceId = this.serviceDelay;
    this.loadListShipmentDelay()
  }
  async loadReasonDelay() {
    let results = await this.reasonService.getByType("delay").toPromise();
    this.reasonDelays.push({ value: null, label: `Chọn tất cả` })
    results.data = SortUtil.sortAlphanumerical(results.data, -1, "id");
    results.data.map(mReasonDelay => this.reasonDelays.push({ value: mReasonDelay.id, label: `${mReasonDelay.name}` }));
  }
  async loadServiceDelay() {
    let results = await this.serviceService.GetListServiceAsync();
    this.serviceDelays.push({ value: null, label: `Chọn tất cả` })
    results = SortUtil.sortAlphanumerical(results, -1, "id");
    results.map(mServiceDelay => this.serviceDelays.push({ value: mServiceDelay.id, label: `${mServiceDelay.name}` }));
  }
  selectedSingleDateFrom(value: any) {
    this.dataCompenstion = [];
    this.fromDate = SearchDate.formatToISODate(moment(value.start).toDate());
    this.loadListShipmentDelay();
  }
  selectedSingleDateTo(value: any) {
    this.dataCompenstion = [];
    this.toDate = SearchDate.formatToISODate(moment(value.end).toDate());
    this.loadListShipmentDelay();
  }
  
  openModel(template: TemplateRef<any>) {
    if (this.selectedData.length == 0) {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng chọn vận đơn delay!` });
      return false;
    }
    this.dataDelayRef = null
    this.dataDelayRef = this.selectedData;
    setTimeout(() => {
      this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-lg' });
    }, 1000);
  }
  clickSave(){
    this.emailCenterDetailRef = [];
    this.dataSendEmailRef.nameFrom = this.nameFrom;
    this.dataSendEmailRef.title = this.title;
    this.dataSendEmailRef.body = this.body;
    this.selectedData.forEach(xDelayRef => {
      if (xDelayRef) {
        this.dataEmailCenterDetailRef = new EmailCenterDetailViewModel()
        this.dataEmailCenterDetailRef.ShipmentId = xDelayRef.shipmentId;
        this.dataEmailCenterDetailRef.LadingScheduleId = xDelayRef.id;
        this.dataEmailCenterDetailRef.ComplainId = null;
        this.dataEmailCenterDetailRef.IncidentsId = null;
        this.dataEmailCenterDetailRef.IsDeliverd = true;
        this.dataEmailCenterDetailRef.IsReturn = true;
      }
      this.emailCenterDetailRef.push(this.dataEmailCenterDetailRef);
    });
    this.dataSendEmailRef.infoShipments = this.emailCenterDetailRef;
    this.sendEmailShipment()
  }
  async sendEmailShipment(){
    if (!this.dataSendEmailRef.nameFrom) {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng nhập tên người gửi!` });
      return false;
    }
    if (!this.dataSendEmailRef.title) {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng nhập chủ đề!` });
      return false;
    }
    if (!this.dataSendEmailRef.body) {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng nhập nội dung email!` });
      return false;
    }
    let resutlt = await this.emailCenterService.sendEmailShipmentAsync(this.dataSendEmailRef);
    if (resutlt.isSuccess) {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.success, detail: `Gửi email thành công!` });
      this.emailCenterDetailRef = [];
      this.selectedData = [];
      this.nameFrom = null;
      this.title = null;
      this.body = null;
      this.dataEmailCenterDetailRef = new EmailCenterDetailViewModel()
      this.loadListShipmentDelay();
      this.bsModalRef.hide();
    }
  }
  onChange($event: any): void {
    //this.log += new Date() + "<br />";
  }
  eventFilterCustomers(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.customerService.getSearchByValueAsync(value, 0).then(
        x => {
          this.customers = [];
          this.customerFilters = [];
          x.data.map(m => this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.customers.map(m => this.customerFilters.push(m.label));
        }
      );
    }
  }
  onSelectShipmentDelay(){
    this.customers.forEach(xCustomer => {
      if (this.customerSelected == xCustomer.label) {
        this.customerId = xCustomer.value;
        this.loadListShipmentDelay();
      }
    });
  }
}

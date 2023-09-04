import {
  Component, 
  OnInit,
  TemplateRef,
  ViewChild,
  ElementRef, 
}from "@angular/core"; 
import {MessageService }from "primeng/components/common/messageservice"; 
import {BaseComponent }from "../../../shared/components/baseComponent"; 
import {PermissionService }from "../../../services/permission.service"; 
import {Router }from "@angular/router"; 
import {Constant }from "../../../infrastructure/constant"; 
import {ShipmentService, UserService, AuthService, UploadService }from "../../../services"; 
import { Shipment } from "../../../models";
import { DaterangePickerHelper } from "../../../infrastructure/daterangePicker.helper";
import { SearchDate } from "../../../infrastructure/searchDate.helper";
import * as moment from "moment";
import { BsModalRef, BsModalService } from "ngx-bootstrap";
import { SelectModel } from "../../../models/select.model";
import { SortUtil } from "../../../infrastructure/sort.util";
import { DomSanitizer } from "@angular/platform-browser";

@Component( {
  selector:"app-management-compensation", 
  templateUrl:"management-compensation.component.html", 
  styles:[]
})
export class ManagementCompensationComponent extends BaseComponent implements OnInit {
  parentPage:string = Constant.pages.shipment.name; 
  currentPage:string = Constant.pages.shipment.children.managementCompensation.name; 
  
  //
  isCompleted:boolean;
  sCanShipmentNumber:string = "";
  formDate:any;
  toDate:any;
  pageSize:number = 20;
  pageNum:number = 1;
  //
  textCompleted: string;
  //
  dataCompenstion: any;
  //
  rowPerPage: number = 20;
  totalRecords: number = 0;
  //
  optionSingleDateFrom: any;
  optionSingleDateTo: any;
  //
  bsModalRef: BsModalRef;
  //
  dataModelRef: any;
  //
  compensationContent:any;
  compensationValue:any;
  compensationValueEmp:any;
  handleEmpFullName:any;
  //
  compensationTypes:SelectModel[] = [];
  compensationType:any;
  //
  feeTypes:SelectModel[] = [];
  feeType:any;
  //
  users: SelectModel[] = [];
  userFilters: string[] = [];
  userSelected: string;
  //
  isDisabledValue:boolean = false;
  isDisabledValueEmp:boolean = true;
  //
  uploadedFiles: any[] = [];
  //
  columns: any[] = [
    { field: "code", header: 'Mã' },
    { field: "compensationContent", header: 'Nội dung' },
    { field: "createdByEmp.fullName", header: 'NV báo' },
    { field: "isCompleted", header: 'Xử lý' },
    { field: "compensationtype.name", header: 'Hình thức đền bù' },
    { field: "compensationValue", header: 'Giá trị đền bù' },
    { field: "feeType.name", header: 'Loại chi phí' },
    { field: "compensationEmp.name", header: 'Nhân viên đền bù' },
    { field: "compensationValueEmp", header: 'Giá trị nhân viên đền bù' },
    { field: "handleEmp.name", header: 'Nhân viên xủ lý' },
  ]
  //
  dataImage = {
    id: null,
    fileName: null,
    fileExtension: null,
    fileBase64String: null
  };
  //
  fileUploadName:any;
  fileUpload:any;
  fileUploadHref:any;
  //
  constructor(
    protected shipmentService:ShipmentService, 
    protected messageService:MessageService, 
    private modalService: BsModalService, 
    private userService: UserService,
    private authService: AuthService,
    private uploadService: UploadService,
    protected sanitizer: DomSanitizer,
    public permissionService:PermissionService, public router:Router) {
      super(messageService, permissionService, router); 
    // dateRangePicker
  }
  ngOnInit() {
    this.initData(); 
    this.initDataRef();
  }
  initData() {
    this.optionSingleDateFrom = DaterangePickerHelper.getOptionSingleDatePickerNoTime(this.optionSingleDateFrom);
    this.optionSingleDateTo = DaterangePickerHelper.getOptionSingleDatePickerNoTime(this.optionSingleDateTo);
    this.textCompleted = "Tất cả";
    this.LoadListCompensation();
  }
  async LoadListCompensation(){
    if (!this.formDate) {// load ngày hiện tại
      this.formDate = moment(new Date()).format("YYYY/MM/DD 00:00");
    }
    if (!this.toDate) {// load ngày hiện tại
      this.toDate = SearchDate.formatToISODate(new Date());
    }
    let includes = [
      "CompensationEmp","HandleEmp","FeeType","CompensationEmp","CompensationType"
    ];
    let results = await this.shipmentService.getListCompensationAsync(this.isCompleted, this.sCanShipmentNumber, this.formDate, this.toDate, this.pageSize, this.pageNum, includes);
    if (results.isSuccess) {
      this.totalRecords = results.dataCount;
      this.dataCompenstion = results.data as Shipment;
    }
  }
  selectedSingleDateFrom(value: any) {
    this.dataCompenstion = [];
    this.formDate = SearchDate.formatToISODate(moment(value.start).toDate());
    this.LoadListCompensation();
  }
  selectedSingleDateTo(value: any) {
    this.dataCompenstion = [];
    this.toDate = SearchDate.formatToISODate(moment(value.end).toDate());
    this.LoadListCompensation();
  }
  onPageChange(event: any) {
    this.pageNum = event.first / event.rows + 1;
    this.pageSize = event.rows;
    setTimeout(() => {
      this.LoadListCompensation();
    }, 0);
  }
  eventEnterShipmentNumber(){
    this.LoadListCompensation(); 
  }
  onChangeIsCompleted(){
    if (this.isCompleted == null) {
      this.textCompleted = "Đã xữ lý";
      this.isCompleted = true;
      this.LoadListCompensation(); 
      return false;
    }
    if (this.isCompleted == true) {
      this.textCompleted = "Chờ xữ lý";
      this.isCompleted = false;
      this.LoadListCompensation(); 
      return false;
    }
    if (this.isCompleted == false) {
      this.textCompleted = "Tất cả";
      this.isCompleted = null;
      this.LoadListCompensation(); 
      return false;
    }
  }
  
  openModel(template: TemplateRef<any>,data: any) {
    this.dataModelRef = null
    this.dataModelRef = data;
    this.compensationContent = this.dataModelRef.compensationContent;
    this.compensationValue = this.dataModelRef.compensationValue;
    this.compensationValueEmp = this.dataModelRef.compensationValueEmp;
    this.compensationType = this.dataModelRef.compensationtypeId;
    this.feeType = this.dataModelRef.feeTypeId;
    this.loadCurrenUser()
    this.userSelected = `${this.dataModelRef.compensationEmp ? this.dataModelRef.compensationEmp.code : ""} ${this.dataModelRef.compensationEmp ? this.dataModelRef.compensationEmp.fullName : ""}`;
    setTimeout(() => {
      this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-lg' });
    }, 500);
  }
  async save(){
    if (!this.validator()) {
      return false;
    }
    this.dataModelRef.compensationContent = this.compensationContent;
    this.dataModelRef.compensationValue = this.compensationValue;
    this.dataModelRef.compensationValueEmp = this.compensationValueEmp;
    this.dataModelRef.compensationtypeId = this.compensationType;
    this.dataModelRef.feeTypeId = this.feeType;
    
    this.users.forEach(uData => {
      let user = uData.data.code + " " + uData.data.name
        if (user == this.userSelected) {
          this.dataModelRef.compensationEmpId = uData.data.id;
        }
    });
    this.dataModelRef.isCompleted = true;

    console.log(this.dataModelRef);
   await this.handleCompensation()
  }
  async handleCompensation(){
    let result = await this.shipmentService.handleCompensationAsync(this.dataModelRef);
    if (result.isSuccess) {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: `Xử lý đền bù thành công!` });
      this.bsModalRef.hide();
      if (this.dataImage) {
        this.uploadDocCompensation();
      }
      this.LoadListCompensation();
    }
  }
  async uploadDocCompensation(){
    await this.uploadService.uploadDocCompensation(this.dataImage);
  }
  initDataRef(){
    this.loadCompensationType();
    this.loadFeeType();
  }
  async loadCompensationType(){
    let results = await this.shipmentService.getCompensationType();
    if (results.isSuccess) {
      results.data = SortUtil.sortAlphanumerical(results.data, -1, "id");
      results.data.map(mCompensationType => this.compensationTypes.push({ value: mCompensationType.id, label: `${mCompensationType.name}` }));
      // this.compensationType = results.data;
    }
  }
  async loadFeeType(){
    let results = await this.shipmentService.getFeeType();
    if (results.isSuccess) {
      results.data = SortUtil.sortAlphanumerical(results.data, -1, "id");
      results.data.map(mFeeType => this.feeTypes.push({ value: mFeeType.id, label: `${mFeeType.name}` }));
      // this.compensationType = results.data;
    }
  }
  async loadCurrenUser(){
    let dataUserInfo = await this.authService.getAccountInfoAsync();
    if (dataUserInfo) {
      this.dataModelRef.handleEmp = dataUserInfo;
      this.dataModelRef.handleEmpId = dataUserInfo.id;
      this.handleEmpFullName = dataUserInfo.fullName;
      // this.compensationType = results.data;
    }
  }
  eventFilterUsers(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.userService.getSearchByValueAsync(value, null).then(
        x => {
          this.users = [];
          this.userFilters = [];
          x.map(m => this.users.push({ value: m.id, label: `${m.code} ${m.name}`, data: m }));
          this.users.map(m => this.userFilters.push(m.label));
        }
      );
    }
  }
  onChangeFeeType(){
    if (this.feeType == 1) {
      this.isDisabledValueEmp = true;
      this.compensationValueEmp = this.compensationValue;
    }
    if (this.feeType == 2) {
      this.isDisabledValueEmp = true;
      this.compensationValueEmp = 0;
    }
    if (this.feeType == 3) {
      this.isDisabledValueEmp = false;
    }
  }
  onChangeValue(){
    this.messageService.clear(); 
    if (this.feeType == 1) {
      this.compensationValueEmp = this.compensationValue;
    }
  }
  onChangeValueEmp(){
    this.messageService.clear(); 
    if (this.feeType == 3) {
      if (Number(this.compensationValueEmp) > this.compensationValue) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Giá trị nhân viên đền bù không được lớn hơn giá trị đền bù!` });
      }
    }
  }
  validator(){
    this.messageService.clear();
    let icheck : boolean = true;
    if (!this.compensationContent) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nội dung đề bù không được để trống!` });
      return icheck = false;
    }
    if (!this.compensationType) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Hình thức đền bù không được để trống!` });
      return icheck = false;
    }
    if (Number(this.compensationValue) <= 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Giá trị đề bù phải lớn hơn 0!` });
      return icheck = false;
    }
    if (!this.userSelected) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhân viên đền bù không được để trống!` });
      return false;
    }
    if (Number(this.compensationValue) < 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Giá trị nhân viên đền bù phải lớn hơn 0!` });
      return icheck = false;
    }
    if (this.feeType == 3) {
      if (Number(this.compensationValueEmp) > this.compensationValue) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Giá trị nhân viên đền bù không được lớn hơn giá trị đền bù!` });
        return icheck = false;
      }
    }
    if (!this.feeType) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Loại chi phí không được để trống!` });
      return icheck = false;
    }
    if (!this.handleEmpFullName) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhân viên xử lý đang không xác định!` });
      return icheck = false;
    }
    return icheck;
  }
  onSelect(event){
    console.log("event: " + JSON.stringify(event));
    let file = event.files[0];
    let fileName = file.name;
    let fileExtension = file.name.split('.')[1];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      let base64 = reader.result as string;
      this.dataImage.id = this.dataModelRef.id;
      this.dataImage.fileName = fileName;
      this.dataImage.fileExtension = fileExtension;
      this.dataImage.fileBase64String = base64.split(',')[1];
      console.log("dataImage: " + JSON.stringify(this.dataImage))
    };
  }

  openModelReview(template: TemplateRef<any>,data: any) {
    this.dataModelRef = null
    this.dataModelRef = data;
    this.loadCurrenUser()
    this.getImageByPathCompensation();
    this.compensationType = this.dataModelRef.compensationtypeId;
    this.feeType = this.dataModelRef.feeTypeId;
    this.userSelected = `${this.dataModelRef.compensationEmp ? this.dataModelRef.compensationEmp.code : ""} ${this.dataModelRef.compensationEmp ? this.dataModelRef.compensationEmp.fullName : ""}`;
    setTimeout(() => {
      this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-lg' });
    }, 1000);
  }
  async getImageByPathCompensation(){
    let result = await this.uploadService.getImageByPathAsync(this.dataModelRef.docAliasPath);
    this.fileUpload = result.data;
    this.fileUploadName = this.fileUpload.fileName;    
    this.fileUploadHref = this.sanitizer.bypassSecurityTrustResourceUrl('data:application/pdf,'+this.fileUpload.fileBase64String);
    console.log(this.fileUploadHref);
  }
  clickDowloadFile(){
    //
    
    // console.log(this.fileUpload)
    // let b:any = new Blob([this.fileUploadHref], { type: 'application/pdf' });
    // console.log(b)
    // var url= window.URL.createObjectURL(b);
    // console.log(url)
    // window.open(url);
  }
}

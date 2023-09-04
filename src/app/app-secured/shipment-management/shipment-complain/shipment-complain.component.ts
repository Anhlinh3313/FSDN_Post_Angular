import { Component, OnInit, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { MessageService } from 'primeng/primeng';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import {  UserService, AuthService, ShipmentService, HubService, CustomerService, UploadService } from '../../../services';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

import * as moment from "moment";
import { SelectModel } from '../../../models/select.model';
import { User, Customer } from '../../../models';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { ComplainFilter } from '../../../models/complainFilter.model';
import { ComplainService } from '../../../services/complain.service';
import { Complain } from '../../../models/complain.model';
import { ComplainHandleFilter } from '../../../models/complainHandleFilter.model';
import { AddComplainHandle } from '../../../models/addComplainHandle.model';
import { ComplainHandle } from '../../../models/complainHandle.model';
import { AddCompensation } from '../../../models/addCompensation.model';
import { ListUpdateStatusViewModel } from '../../../view-model';

@Component({
  selector: 'app-shipment-complain',
  templateUrl: './shipment-complain.component.html',
  styles: []
})
// export class ShipmentComplainComponent extends BaseComponent implements OnInit {
export class ShipmentComplainComponent implements OnInit {

  // Page
  parentPage: string = Constant.pages.shipment.name;
  currentPage: string = Constant.pages.shipment.children.shipmentComplain.name;
  //

  // Data
  currentUserId: number;

  shipmentComplainFilter: ComplainFilter = new ComplainFilter();
  lstData: Complain[] = [];
  totalRecords: number = 0;

  columns = [
    { field: 'createdWhen', header: 'Ngày tạo' },
    { field: 'code', header: 'Mã vận đơn' },
    { field: 'customer.name', header: 'Khách hàng' },
    { field: 'phoneNumber', header: 'SĐT khách hàng' },
    { field: 'complainType.name', header: 'Nguyên nhân sự cố' },
    { field: 'handlingHub.name', header: 'Bưu cục xử lý' },
    { field: 'handlingUser.fullName', header: 'Nhân viên xử lý' },
    { field: 'forwardToHub.name', header: 'Chuyển tiếp đến NV' },
    { field: 'complainStatus.name', header: 'Trạng thái' },
    { field: 'endDate', header: 'Ngày hoàn tất' },
  ]
  //

  configImageViewer = {
    wheelZoom: true
  }

  // Filter
  selectedCustomer: string[] = [];
  cloneSelectedCustomer: SelectModel[] = [];
  lstCustomers: SelectModel[] = [];
  lstSuggestionsCustomer: string[] = [];

  lstHubs: SelectModel[] = [];
  lstComplainStatuses: SelectModel[] = [];

  public eventLog = "";

  employee_2: any;
  employees_2: any;
  filteredEmployees_2: any;
  selectedEmployee_2: number;
  //

  // Modal 
  dataModal: Complain;
  bsModalRef: BsModalRef;

  lstComplainHandle: ComplainHandle[] = [];
  totalCountComplainHandle: number = 0;

  toDate: Date = new Date();

  titleUploadImage: string = "";
  addComplainHandle: AddComplainHandle = new AddComplainHandle();
  dataImage = {
    id: null,
    fileName: null,
    fileExtension: null,
    fileBase64String: null
  };
  imageData: string[];
  isReview = false;
  isCompensation: boolean;
  isAcceptReturn: boolean = false;
  //

  constructor(
    protected messageService: MessageService,
    private daterangepickerOptions: DaterangepickerConfig,
    public permissionService: PermissionService,
    public router: Router,
    private userService: UserService,
    private complainService: ComplainService,
    private customerService: CustomerService,
    private hubService: HubService,
    protected modalService: BsModalService,
    private uploadService: UploadService,
    private authService: AuthService,
    private shipmentService: ShipmentService
  ) {
    // super(messageService, permissionService, router);
    this.currentUserId = this.authService.getUserId();
  }

  ngOnInit() {
    this.loadData();
    this.loadFilter();
  }

  // Data
  async loadData() {
    let res = await this.complainService.getComplainBy(this.shipmentComplainFilter);
    if (res.isSuccess) {
      this.lstData = res.data;
      this.totalRecords = res.dataCount;
    }
  }

  onPageChange(event: any) {
    this.shipmentComplainFilter.pageNum = event.first / event.rows + 1;
    this.shipmentComplainFilter.pageSize = event.rows;
    this.loadData();
  }

  refresh() {
    this.shipmentComplainFilter = new ComplainFilter();
    this.cloneSelectedCustomer = [];
    this.cloneSelectedCustomer = [];
    this.lstCustomers = [];
    this.lstSuggestionsCustomer = [];

    this.loadData();
  }

  changeFilter() {
    this.shipmentComplainFilter.pageNum = 1;
    this.shipmentComplainFilter.pageSize = 20;
    this.loadData();
  }

  loadFilter() {
    this.loadHub();
    this.loadComplainStatus();
  }

  async loadHub() {
    this.lstHubs = await this.hubService.getSelectModelCenterHubMultiSelectAsync();
  }

  async loadComplainStatus() {
    this.lstComplainStatuses = await this.complainService.getSelectModelComplainStatusMultiSelectAsync();
  }
  //

  //#region Filter
  // Calendar
  public mainInput = {
    start: moment().subtract(0, "day"),
    end: moment()
  };

  public selectedDate() {
    this.shipmentComplainFilter.fromDate = SearchDate.formatToISODate(moment(this.shipmentComplainFilter.fromDate).toDate());
    this.shipmentComplainFilter.toDate = SearchDate.formatToISODate(moment(this.shipmentComplainFilter.toDate).toDate());
    this.loadData();
  }

  public calendarEventsHandler(e: any) {
    this.eventLog += "\nEvent Fired: " + e.event.type;
  }
  //

  // filter Employee
  async filterCustomer(event) {
    let value = event.query;
    if (value.length >= 1
      ) {
      let x = await this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null);
      if (x.isSuccess) {
        this.lstCustomers = [];
        this.lstSuggestionsCustomer = [];
        let data = (x.data as Customer[]);
        data.map(m => {
          this.lstCustomers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
          this.lstSuggestionsCustomer.push(`${m.code} ${m.name}`);
        });
      }
    }
  }

  removeCustomer(event) {
    this.cloneSelectedCustomer.map(x => {
      let find = this.selectedCustomer.find(y => y == x.label);
      if (!find) {
        let index = this.cloneSelectedCustomer.findIndex(ele => ele.value == x.value);
        this.cloneSelectedCustomer.splice(index, 1);

        let index_2 = this.shipmentComplainFilter.customerIds.findIndex(ele => ele == x.value);
        this.shipmentComplainFilter.customerIds.splice(index_2, 1);
      }
    })

    this.changeFilter();
  }

  onSelectedCustomer() {
    this.selectedCustomer.map(x => {
      let customer = this.lstCustomers.find(y => y.label == x);
      if (customer) {
        let findSelected = this.shipmentComplainFilter.customerIds.find(id => id == customer.value);
        if (!findSelected) {
          this.shipmentComplainFilter.customerIds.push(customer.value);
          this.cloneSelectedCustomer.push(customer);
        }
      }
    });

    this.changeFilter();
  }

  async keyTabEmployee(event) {
    let value = event.target.value;
    if (value.length >= 1) {
      let x = await this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null);
      if (x.isSuccess) {
        let data = x.data as Customer[];
        if (data.length > 0) {
          let find = data.find(y => value == y.code) || data[0];
          this.selectedCustomer.push(`${find.code} ${find.name}`);
          this.shipmentComplainFilter.customerIds.push(find.id);
          this.cloneSelectedCustomer.push({ value: find.id, label: `${find.code} ${find.name}`, data: find });

          this.changeFilter();
        }
      }
    }
  }
  //
  //#endregion

  //#region Modal
  async openModal(template: TemplateRef<any>, data: Complain, isReceive = false, isReview = false) {

    this.isCompensation = false;
    this.isAcceptReturn = false;
    if (isReceive) {
      let model: AddComplainHandle = new AddComplainHandle();
      model.complainId = data.id;
      model.complainStatusId = 3;
      let res = await this.complainService.addComplainHandle(model);
      if (res) {
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tiếp nhận thành công"
        });
      }
      this.changeFilter();
    }

    this.isReview = isReview;

    this.dataModal = data;

    this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-s" });

    this.dataModal.complainImagePath = await this.loadImage(this.dataModal.complainImagePath);

    let complain = new ComplainHandleFilter();
    complain.complainId = data.id;

    let res = await this.complainService.getComplainHandle(complain);
    if (res.isSuccess) {
      this.lstComplainHandle = res.data;
      this.totalCountComplainHandle = res.dataCount;
      this.lstComplainHandle.map(async m => {
        if (m.handleImagePath) m.imageBase64 = await this.loadImage(m.handleImagePath);
        else m.imageBase64 = null;
      });
    }

  }

  async handling() {
    if (!this.addComplainHandle.handleContent) {
      this.messageService.add({
        severity: Constant.messageStatus.error,
        detail: "Vui lòng nhập nội dung"
      });
      return;
    }

    this.addComplainHandle.complainId = this.dataModal.id;
    this.addComplainHandle.complainStatusId = 5;
    let res = await this.complainService.addComplainHandle(this.addComplainHandle);
    if (res) {

      if (this.dataImage) {
        this.dataImage.id = res.id;
        await this.uploadService.uploadImageComplainHandle(this.dataImage);
      }

      if (this.isCompensation) {
        let model: AddCompensation = new AddCompensation();
        model.shipmentId = this.dataModal.shipmentId;
        model.complainId = this.dataModal.id;
        model.compensationContent = this.addComplainHandle.handleContent;
        model.code = this.dataModal.code;
        model.name = this.dataModal.name;
        // model.compensationHubId = this.dataModal.incidentsByHubId;
        // model.compensationEmpId = this.dataModal.incidentsByEmpId;
        model.isCompleted = false;
        model.compensationValue = 0;
        model.compensationValueEmp = 0;
        let ress = await this.shipmentService.addCompensation(model);
      }

      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Đã xử lý thành công"
      });
      if (this.isAcceptReturn) {
        let dataModal = new ListUpdateStatusViewModel();
        dataModal.empId = this.authService.getUserId();
        dataModal.shipmentStatusId = 38;
        dataModal.note = "Chuyển hoàn theo yều cầu của khách hàng.";
        dataModal.shipmentIds = [this.dataModal.shipmentId];
        this.shipmentService.assignUpdateDeliveryListAsync(dataModal);
        if (res.isSuccess) {
          this.messageService.add({
            severity: Constant.messageStatus.success, detail: "Duyệt chuyển hoàn thành công"
          });
        }
        else {
          this.messageService.add({
            severity: Constant.messageStatus.error, detail: "Duyệt chuyển hoàn thất bại"
          });
        }
      }
    }
    this.bsModalRef.hide();
    this.changeFilter();
  }

  async loadImage(path) {
    if (path) {
      let res = await this.uploadService.getImageByPathAsync(path);
      return 'data:image/png;base64,' + res.data.fileBase64String;
    }
    else {
      return null;
    }
  }

  // Image
  loadFileUploadImage() {
    document.getElementById("fileUploadImage").click();
  }

  changeImage(event) {
    let lstFiles = ["bmp", "jpg", "jpeg", "gif", "png"];
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      let fileName = file.name;
      let fileExtension = file.name.split('.')[1];

      if (!lstFiles.find(x => x == fileExtension)) {
        this.messageService.add({
          severity: Constant.messageStatus.error,
          detail: "Vui lòng chọn file hình ảnh"
        });
      }
      else {
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          let base64 = reader.result as string;
          this.dataImage.id = this.dataModal.id;
          this.dataImage.fileName = fileName;
          this.dataImage.fileExtension = fileExtension;
          this.dataImage.fileBase64String = base64.split(',')[1];
          this.titleUploadImage = fileName;
        };
      }
    }
    else {
      this.dataImage.id = null;
      this.dataImage.fileName = null;
      this.dataImage.fileExtension = null;
      this.dataImage.fileBase64String = null;
      this.titleUploadImage = null;
    }
  }
  //

  openModalImage(template: TemplateRef<any>, path: string) {
    this.imageData = [path];
    this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-1000" });
  }

  // Forward
  // filter Employee
  async filterEmployee_2(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees_2 = [];
      this.filteredEmployees_2 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_2.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedEmployee_2() {
    let cloneSelectedUser = this.employee_2;
    let index = cloneSelectedUser.indexOf(" -");
    let users: any;
    if (index !== -1) {
      users = cloneSelectedUser.substring(0, index);
      cloneSelectedUser = users;
    }
    this.employees_2.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.selectedEmployee_2 = x.value;
        }
      }
    });
  }

  async keyTabEmployee_2(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees_2 = [];
      this.filteredEmployees_2 = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees_2.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees_2.push(`${m.code} ${m.name}`);
      });
      let findCus: SelectModel = null;
      if (this.employees_2.length == 1) {
        findCus = this.employees_2[0];
      } else {
        findCus = this.employees_2.find(f => f.data.code == value || f.label == value);
      }
      if (findCus) {
        this.selectedEmployee_2 = findCus.data.id;
        this.employee_2 = findCus.label;
      }
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
  }
  //

  // forward
  async openModalForward(template: TemplateRef<any>, data: Complain) {
    this.dataModal = data;
    this.bsModalRef = this.modalService.show(template, { class: "inmodal animated bounceInRight modal-s" });
  }

  async forward() {
    if (!this.selectedEmployee_2) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Vui lòng chọn nhân viên.` });
      return;
    }

    this.addComplainHandle.complainId = this.dataModal.id;
    this.addComplainHandle.complainStatusId = 4;
    this.addComplainHandle.forwardToEmpId = this.selectedEmployee_2;

    let res = await this.complainService.addComplainHandle(this.addComplainHandle);
    if (res) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "chuyển tiếp thành công"
      });
    }
    this.bsModalRef.hide();
    this.changeFilter();
  }
  //
  //#endregion
}

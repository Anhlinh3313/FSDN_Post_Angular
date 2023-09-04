import { Component, OnInit, HostListener, OnDestroy, TemplateRef } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { HubService, UserService, CustomerService, ShipmentService, AuthService, UploadService } from '../../../services';
import { MessageService } from '../../../../../node_modules/primeng/components/common/messageservice';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '../../../../../node_modules/@angular/router';
import { environment } from '../../../../environments/environment';
import { SelectModel } from '../../../models/select.model';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Shipment, User } from '../../../models';
import { BsModalRef, BsModalService } from '../../../../../node_modules/ngx-bootstrap';
import { PersistenceService } from '../../../../../node_modules/angular-persistence';
import * as moment from "moment";
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { IncidentsFilter } from '../../../models/incidentsFilter.model';
import { IncidentsService } from '../../../services/incidents.service';
import { DaterangePickerHelper } from '../../../infrastructure/daterangePicker.helper';
import { Incidents } from '../../../models/incidents.model';
import { AddCompensation } from '../../../models/addCompensation.model';

@Component({
  selector: 'app-incident-management',
  templateUrl: './incident-management.component.html',
  styles: []
})
export class IncidentManagementComponent extends BaseComponent implements OnInit, OnDestroy {

  constructor(private hubService: HubService,
    private userService: UserService,
    private customerService: CustomerService,
    protected messageService: MessageService,
    protected permissionService: PermissionService,
    protected router: Router,
    private shipmentService: ShipmentService,
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    private uploadService: UploadService,
    private authService: AuthService,
    private incidentsService: IncidentsService) {
    super(messageService, permissionService, router);
  }

  //Page name
  parentPage: string = Constant.pages.shipment.name;
  currentPage: string = Constant.pages.shipment.children.incidentManagement.name;
  //

  //Enviroment
  envir = environment;
  shortName = environment.centerHubSortName + "/" + environment.poHubSortName + "/" + environment.stationHubSortName;
  //

  //Dropdown
  hubs: SelectModel[] = [];

  users: SelectModel[] = [];

  customers: SelectModel[] = [];

  handles: SelectModel[] = [
    { label: "Đã xử lý", value: 1 },
    { label: "Đã xử lý đền bù", value: 2 }
  ]

  handleResults: SelectModel[] = [
    { label: "Tiếp tục giao hàng", value: 1 },
    { label: "Tiếp tục trả hàng", value: 2 },
    { label: "Hủy giao hàng", value: 3 },
    { label: "Hủy trả hàng", value: 4 },
  ]

  employee: any;
  employees: any;
  filteredEmployees: any;
  selectedEmployee: number;

  employee_2: any;
  employees_2: any;
  filteredEmployees_2: any;
  selectedEmployee_2: number;

  customer: any;
  filteredCustomers: any;

  mainInput = DaterangePickerHelper.mainInput;
  mainInputBK = DaterangePickerHelper.mainInput;
  //

  //Data
  totalRecords = 0;
  pageSize = 20;

  // shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
  lstData: Shipment[] = [];

  filterModel: IncidentsFilter = new IncidentsFilter();

  dataModal: Incidents = new Incidents();
  //

  //Modal
  bsModalRef: BsModalRef;

  lstImages: any[] = [];
  configImageViewer = {
    wheelZoom: true
  }
  //

  public dateRange = {
    start: moment(),
    end: moment()
  }

  ngOnInit() {
    // this.resetModal();
    // this.loadFilter();
    this.filterModel.fromDate = this.dateRange.start.hour(0).minute(0).second(1).format("YYYY/MM/DD HH:mm");
    this.filterModel.toDate = this.dateRange.end.hour(23).minute(59).second(0).format("YYYY/MM/DD HH:mm");

    this.loadData();
    this.setupNumberCount();
  }

  resetPaging() {
    this.filterModel.pageNum = 1;
    this.filterModel.pageSize = 20;
    this.loadData();
  }

  //#region Data
  async loadData() {
    // let res = await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel);
    let res = await this.shipmentService.getListIncidents(this.filterModel);
    this.lstData = res.data;
    this.totalRecords = res.dataCount;
  }

  // loadFilterShipment() {
  //   let cols = [
  //     Constant.classes.includes.shipment.sender,
  //     Constant.classes.includes.shipment.shipmentStatus,
  //     Constant.classes.includes.shipment.receiveHub
  //   ].join(",");

  //   this.shipmentFilterViewModel = new ShipmentFilterViewModel();
  //   this.shipmentFilterViewModel.Cols = cols;
  //   this.shipmentFilterViewModel.Type = ShipmentTypeHelper.incident;
  //   this.shipmentFilterViewModel.PageNumber = 1;
  //   this.shipmentFilterViewModel.PageSize = 20;
  // }
  //#endregion

  //#region Dropdown
  // loadFilter() {
  //   // this.loadFilterShipment();
  //   // this.loadHub();
  //   // this.loadCustomer();
  // }

  // async loadHub() {
  //   this.shipmentFilterViewModel.CurrentHubId = null;
  //   this.hubs = await this.hubService.getSelectModelCenterHubAsync();
  // }

  // async loadUserByHubID() {
  //   this.shipmentFilterViewModel.handlingEmpId = null;
  //   if (this.shipmentFilterViewModel.CurrentHubId) {
  //     this.users = await this.userService.getSelectModelAllEmpByHubIdAsync(this.shipmentFilterViewModel.CurrentHubId);
  //   }
  // }

  // async loadCustomer() {
  //   this.shipmentFilterViewModel.SenderId = null;
  //   this.customers = await this.customerService.getAllSelectModelAsync();
  // }
  //#endregion


  //#region Nút xử lý
  refresh() {
    // this.loadFilter();
    this.filterModel = new IncidentsFilter();
    this.loadData();
  }

  // changeHub() {
  //   this.loadUserByHubID();
  //   this.loadData();
  // }

  // changeEmp() {
  //   this.loadData();
  // }

  // changeCustomer() {
  //   this.loadData();
  // }

  async changeShipmentNumber() {
    this.resetPaging();
  }

  onPageChange(event: any) {
    this.filterModel.pageNum = event.first / event.rows + 1;
    this.filterModel.pageSize = event.rows;
    this.loadData();
  }
  //#endregion

  //#region Modal
  async openModal(template: TemplateRef<any>, rowData: Incidents) {
    // this.resetModal();
    this.dataModal = Object.assign({}, rowData);

    setTimeout(() => {
      this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
    }, 0);

    let images = await this.uploadService.getImageByShipmentId(rowData.shipmentId, 3, rowData.id) || [];
    images.map(x => {
      this.lstImages.push('data:image/png;base64,' + x.fileBase64String);
    })

  }

  openModelImages(template: TemplateRef<any>, data: any[]) {
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-1000' });
  }

  async save() {
    this.dataModal.isCompleted = true;
    let res = await this.shipmentService.handleIncidents(this.dataModal);
    if (res) {
      if (this.dataModal.isCompensation) {
        let model: AddCompensation = new AddCompensation();
        model.shipmentId = this.dataModal.shipmentId;
        model.incidentsId = this.dataModal.id;
        model.compensationContent = this.dataModal.hanldeContent;
        model.code = this.dataModal.code;
        model.name = this.dataModal.name;
        model.compensationHubId = this.dataModal.incidentsByHubId;
        model.compensationEmpId = this.dataModal.incidentsByEmpId;
        model.isCompleted = false;
        model.compensationValue = 0;
        model.compensationValueEmp = 0;
        let ress = await this.shipmentService.addCompensation(model);

        this.messageService.add({
          severity: "success",
          detail: "Cập nhật xử lý thành công"
        });
      }
    }
    this.loadData();
    this.dataModal = new Incidents();
    this.bsModalRef.hide();
  }

  // async save() {
  //   if (!this.isValidData()) return;

  //   let obj = new UpdateStatusCurrentEmp();
  //   obj.id = this.dataModal.id;
  //   obj.shipmentNumber = this.dataModal.shipmentNumber;
  //   obj.note = this.dataModal.note;

  //   if (this.dataModal.selectedHandle == 2) {
  //     obj.compensationValue = this.dataModal.compensationValue;
  //     obj.shipmentStatusId = StatusHelper.Compensation;

  //     let res = await this.shipmentService.updateStatusCurrentEmpAsync(obj);
  //   }

  //   if (this.dataModal.selectedHandleResult == 1) {
  //     obj.shipmentStatusId = this.dataModal.toHubId == this.dataModal.currentHubId ? StatusHelper.readyToDelivery : StatusHelper.waitingToTransfer;
  //   }
  //   else if (this.dataModal.selectedHandleResult == 2) {
  //     obj.shipmentStatusId = this.dataModal.fromhubId == this.dataModal.currentHubId ? StatusHelper.readyToReturn : StatusHelper.readyToTransferReturn;
  //   }
  //   else if (this.dataModal.selectedHandleResult == 3) {
  //     obj.shipmentStatusId = StatusHelper.deliveryCancel;
  //   }
  //   else {
  //     obj.shipmentStatusId = StatusHelper.cancel;
  //   }

  //   let res2 = await this.shipmentService.updateStatusCurrentEmpAsync(obj);
  //   if (res2.isSuccess) {
  //     this.messageService.add({
  //       severity: "success",
  //       detail: "Cập nhật xử lý thành công"
  //     })
  //   }
  //   else {
  //     this.messageService.add({
  //       severity: "warn",
  //       detail: res2.message
  //     })
  //   }

  //   this.resetModal();
  //   this.loadData();
  //   this.bsModalRef.hide();
  // }

  // isValidData() {
  //   let messages: Message[] = [];
  //   let check = true;

  //   if (this.dataModal.selectedHandle == 1 && !this.dataModal.note) {
  //     messages.push({
  //       severity: "warn",
  //       detail: "Vui lòng nhập ghi chú xử lý/xử lý đền bù"
  //     })
  //     check = false;
  //   }

  //   if (this.dataModal.selectedHandle == 2 && !this.dataModal.compensationValue) {
  //     messages.push({
  //       severity: "warn",
  //       detail: "Vui lòng nhập giá trị đền bù"
  //     })
  //     check = false;
  //   }

  //   if (!check) {
  //     this.messageService.addAll(messages);
  //   }

  //   return check;
  // }

  // async resetModal() {
  //   let user = await this.authService.getAccountInfoAsync();

  //   this.dataModal = {
  //     id: null,
  //     shipmentNumber: null,
  //     selectedHandle: 1,
  //     selectedHandleResult: 1,
  //     empId: this.persistenceService.get(Constant.auths.userId, StorageType.LOCAL),
  //     shipmentStatusId: null,
  //     note: null,
  //     compensationValue: null,
  //     fromhubId: null,
  //     toHubId: null,
  //     currentHubId: user.hubId
  //   }
  // }
  //#endregion

  //#region Đếm ngược to refresh
  setInterval = null;

  @HostListener('document:mousemove', ['$event']) onMouseMove(e) {
    this.setupNumberCount();
  };

  @HostListener('document:keypress', ['$event']) onKeypress(e) {
    this.setupNumberCount();
  }

  setupNumberCount() {
    this.clearNumberCount();
    let i = 0;
    this.setInterval = setInterval(() => {
      this.refresh();
    }, 60000)
  }

  clearNumberCount() {
    clearInterval(this.setInterval);
  }
  //#endregion

  // Filter Date
  selectedDateBK() {
    this.filterModel.fromDate = SearchDate.formatToISODate(moment(this.filterModel.fromDate).toDate());
    this.filterModel.toDate = SearchDate.formatToISODate(moment(this.filterModel.toDate).toDate());
    this.resetPaging();
  }

  calendarEventsHandler(e: any) {
    DaterangePickerHelper.calendarEventsHandler(e);
  }
  //

  //#region Filter nv
  // filter Employee
  async filterEmployee(event) {
    let value = event.query;
    if (value.length >= 1) {
      let x = await this.userService.getSearchByValueAsync(value, null)
      this.employees = [];
      this.filteredEmployees = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      });
    }
  }

  onSelectedEmployee() {
    let cloneSelectedUser = this.employee;
    this.employees.forEach(x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.filterModel.empId = x.value;
          this.resetPaging();
        }
      }
    });
  }

  async keyTabEmployee(event) {
    let value = event.target.value;
    if (value && value.length > 0) {
      let x = await this.userService.getSearchByValueAsync(value, null);
      this.employees = [];
      this.filteredEmployees = [];
      let data = (x as User[]);
      data.map(m => {
        this.employees.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
        this.filteredEmployees.push(`${m.code} ${m.name}`);
      });
      let findCus: SelectModel = null;
      if (this.employees.length == 1) {
        findCus = this.employees[0];
      } else {
        findCus = this.employees.find(f => f.data.code == value || f.label == value);
      }
      if (findCus) {
        this.filterModel.empId = findCus.data.id;
        this.employee = findCus.label;
      }
      this.resetPaging();

    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
  }
  //

  // filter Employee 2
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

  async onSelectedEmployee_2() {
    let cloneSelectedUser = this.employee_2;
    this.employees_2.forEach(async x => {
      let obj = x.label;
      if (obj) {
        if (cloneSelectedUser === obj) {
          this.dataModal.incidentsByEmpId = x.value;
          let _user = await this.userService.getAsync(x.value, ["Hub"]);
          this.dataModal.incidentsByHubId = _user.Hub.Id;
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
        this.dataModal.incidentsByEmpId = findCus.data.id;
        let _user = await this.userService.getAsync(findCus.data.id, ["Hub"]);
        this.dataModal.incidentsByHubId = _user.Hub.Id;
        this.employee_2 = findCus.label;
      }
    } else {
      this.messageService.clear();
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã nhân viên.` });
    }
  }
  //
  //#endregion

  //#region Filter cus
  // filterCustomers(event) {
  //   let value = event.query;
  //   if (value.length >= 2) {
  //     this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
  //       x => {
  //         if (x.isSuccess == true) {
  //           this.customers = [];
  //           this.filteredCustomers = [];
  //           let data = (x.data as Customer[]);
  //           data.map(m => {
  //             this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
  //             this.filteredCustomers.push(`${m.code} ${m.name}`);
  //           });
  //         }
  //       }
  //     );
  //   }
  // }

  // onSelectedCustomer() {
  //   let cloneSelectedCustomer = this.customer;
  //   let index = cloneSelectedCustomer.indexOf(" -");
  //   let customers: any;
  //   if (index !== -1) {
  //     customers = cloneSelectedCustomer.substring(0, index);
  //     cloneSelectedCustomer = customers;
  //   }
  //   this.customers.forEach(x => {
  //     let obj = x.data as Customer;
  //     if (obj) {
  //       if (cloneSelectedCustomer === x.label) {
  //         this.filterModel.SenderId = obj.id;
  //         this.loadData();
  //       }
  //     }
  //   });
  // }

  // keyTabSender(event) {
  //   let value = event.target.value;
  //   if (value && value.length > 0) {
  //     this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
  //       x => {
  //         if (x.isSuccess == true) {
  //           this.customers = [];
  //           this.filteredCustomers = [];
  //           let data = (x.data as Customer[]);
  //           data.map(m => {
  //             this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
  //             this.filteredCustomers.push(`${m.code} ${m.name}`);
  //           });
  //           let findCus: SelectModel = null;
  //           if (this.customers.length == 1) {
  //             findCus = this.customers[0];
  //           } else {
  //             findCus = this.customers.find(f => f.data.code == value || f.label == value);
  //           }
  //           if (findCus) {
  //             this.shipmentFilterViewModel.SenderId = findCus.value;
  //             this.customer = findCus.label;
  //           }
  //           else {
  //             this.shipmentFilterViewModel.SenderId = null
  //           }
  //           this.loadData();
  //         } else {
  //           this.shipmentFilterViewModel.SenderId = null;
  //           this.loadData();
  //         }
  //       }
  //     );
  //   } else {
  //     this.messageService.clear();
  //     this.messageService.add({ severity: Constant.messageStatus.warn, detail: `Nhập mã khách gửi.` });
  //   }
  // }
  //#endregion

  ngOnDestroy() {
    this.clearNumberCount();
  }
}

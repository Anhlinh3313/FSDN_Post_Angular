import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
//
import { Constant } from '../../../infrastructure/constant';
import { PriceService, AreaGroup, DeadlinePickupDelivery, Hub, Service } from '../../../models';
import { LazyLoadEvent } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { PriceListService, AreaGroupService, DeadlinePickupDeliveryService, HubService, ServiceService, CustomerService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { InputValue } from '../../../infrastructure/inputValue.helper';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SelectModel } from '../../../models/select.model';
import { KPIShipmentServices } from '../../../services/KPIShipment.service';
import { KPIShipmentModel } from '../../../models/KPIShipment.model';
import { KPIShipmentDetailServices } from '../../../services/KPIShipmentDetail.service';
import { CreateKPIShipmentCusViewModel, UpLoadKPIShipmentDetailViewModel } from '../../../view-model/index';


@Component({
  selector: 'app-deadline-pickup-delivery',
  templateUrl: 'deadline-pickup-delivery.component.html',
  styles: []
})
export class DeadlinePickupDeliveryComponent extends BaseComponent implements OnInit {
  hub = environment;
  first: number = 0;
  cloneCode: string;
  txtFilterGb: any;
  constructor(private modalService: BsModalService, private priceListService: PriceListService,
    protected messageService: MessageService, private deadlinePickupDeliveryService: DeadlinePickupDeliveryService,
    private areaGroupService: AreaGroupService, private hubService: HubService,
    public permissionService: PermissionService,
    public kpiShipmentServices: KPIShipmentServices,
    public kpiShipmentDetailServices: KPIShipmentDetailServices,
    public serviceService: ServiceService,
    public router: Router,
    public customerService: CustomerService,
  ) {
    super(messageService, permissionService, router);
  }
  parentPage: string = Constant.pages.deadline.name;
  currentPage: string = Constant.pages.deadline.children.deadlineManagement.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: KPIShipmentModel;
  selectedData: KPIShipmentModel;
  isNew: boolean;
  listData: KPIShipmentModel[];
  //
  columns: string[] = ["code", "name", "priceList.name", "areaGroup.name", "weightGroup.name", "service.name"];
  datasource: KPIShipmentModel[];
  totalRecords: number;
  rowPerPage: number = 10;
  //
  areaGroups: SelectModel[] = [];
  selectedAreaGroup: number;

  services: SelectModel[] = [];
  selectedService: number;
  //
  selectedIsPublic: boolean;
  //
  selectedDateFrom: any;
  selectedDateTo: any;
  //
  selectedKPIShipment: any;
  listDataUserKPI: any[] = [];
  pageNumberKPIDetail: number = 1;
  pageSizeKPIDetail: number = 20;
  customers: SelectModel[] = [];
  selectedCustomer: number;
  createKPIShipmentCusViewModel: CreateKPIShipmentCusViewModel = new CreateKPIShipmentCusViewModel();
  upLoadKPIShipmentDetailViewModel: UpLoadKPIShipmentDetailViewModel = new UpLoadKPIShipmentDetailViewModel();
  vehicle: string;
  //
  ngOnInit() {
    this.initData();
  }

  initData() {
    let includes = [];
    this.getCustomers();
    this.getService();
    this.getKPIShipment();
    // this.getAreaGroup();
    //

    this.data = null;
    this.selectedData = null;
    this.isNew = true;

    //refresh
    this.txtFilterGb = null;
  }

  async getService() {
    this.services = [];
    this.services = await this.serviceService.getAllServiceSelectModelAsync();
  }
  async getCustomers() {
    this.customers = [];
    this.customers = await this.customerService.getAllSelectModelAsync();
  }

  async getKPIShipment() {
    this.kpiShipmentServices.getAll().subscribe(
      x => {
        this.datasource = x.data as KPIShipmentModel[];
        this.datasource.map(m => {
          m.service = this.services.find(f => f.value === m.serviceId).data;
        })
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
      }
    );
  }

  getAreaGroup() {
    this.areaGroupService.getAll().subscribe(
      x => {
        if (!this.isValidResponse(x)) return;
        this.areaGroups = [];
        this.areaGroups.push({ value: null, label: `-- chọn nhóm --` });
        let datas = x.data as AreaGroup[]
        datas.map(
          m => {
            this.areaGroups.push({
              value: m.id, label: `${m.name}`, data: m
            });
          }
        )
      }
    )
  }

  openModel(template: TemplateRef<any>, data: KPIShipmentModel = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
      this.cloneCode = this.data.code;
      //
      this.selectedDateFrom = new Date(this.data.fromDate);
      this.selectedDateTo = new Date( this.data.toDate);
      this.selectedService = this.data.serviceId;
      //
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new KPIShipmentModel();
      this.selectedAreaGroup = null;
      this.selectedDateFrom = new Date();
      this.selectedDateTo =new Date();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-1000' });
  }

  loadLazy(event: LazyLoadEvent) {
    //in a real application, make a remote request to load data using state metadata from event
    //event.first = First row offset
    //event.rows = Number of rows per page
    //event.sortField = Field name to sort with
    //event.sortOrder = Sort order as number, 1 for asc and -1 for dec
    //filters: FilterMetadata object having field as key and filter value, filter matchMode as value

    //imitate db connection over a network
    setTimeout(() => {
      if (this.datasource) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        // sort data
        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.listData = filterRows.slice(event.first, (event.first + event.rows))
        this.totalRecords = filterRows.length;

        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  refresh() {
    this.initData();
    this.first = 0;
  }

  save() {
    if (!this.isValidPriceService()) return;
    let list = [...this.listData];
    this.data.fromDate = this.selectedDateFrom;
    this.data.toDate = this.selectedDateTo;
    this.data.serviceId = this.selectedService;
    if (this.isNew) {
      this.kpiShipmentServices.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        var obj = (x.data as KPIShipmentModel);
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      });
    }
    else {
      this.kpiShipmentServices.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        var obj = (x.data as KPIShipmentModel);
        this.mapSaveData(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    }

  }

  isValidResponse(x: ResponseModel): boolean {
    if (!x.isSuccess) {
      if (x.message) {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: x.message });
      } else if (x.data) {
        let mess: Message[] = [];

        for (let key in x.data) {
          let element = x.data[key];
          mess.push({ severity: Constant.messageStatus.warn, detail: element });
        }

        this.messageService.addAll(mess);
      }
    }

    return x.isSuccess;
  }

  isValidPriceService(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (this.isNew === true) {
      if (this.data.code) {
        this.datasource.forEach(x => {
          if (this.data.code === x.code) {
            messages.push({ severity: Constant.messageStatus.warn, detail: "Trùng mã, vui lòng nhập Mã khác!" });
            result = false;
          }
        });
      } else {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Mã không được để trống!" });
        result = false;
      }
      if (!this.data.name) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Tên không được để trống!" });
        result = false;
      }
    } else {
      if (!this.data.code) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Mã không được để trống!" });
        result = false;
      } else {
        if (this.data.code !== this.cloneCode) {
          this.datasource.forEach(x => {
            if (this.data.code === x.code) {
              messages.push({ severity: Constant.messageStatus.warn, detail: "Trùng mã, vui lòng nhập Mã khác!" });
              result = false;
            }
          });
        }
      }
      if (!this.data.name) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Tên không được để trống!" });
        result = false;
      }
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  mapSaveData(obj: KPIShipmentModel) {
    if (obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
    }
  }

  saveClient(list: KPIShipmentModel[]) {
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    this.bsModalRef.hide();
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }

  clone(model: KPIShipmentModel): KPIShipmentModel {
    let data = new KPIShipmentModel();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  compareFn(c1: PriceService, c2: PriceService): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  //
  openDeleteModel(template: TemplateRef<any>, data: KPIShipmentModel) {
    this.selectedData = data;
    this.data = this.clone(data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  delete() {
    this.kpiShipmentServices.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;

      let index = this.findSelectedDataIndex();
      this.datasource.splice(this.datasource.indexOf(this.selectedData), 1);
      this.saveClient(this.listData.filter((val, i) => i != index));
    });
  }
  //
  openAddUserModel(template: TemplateRef<any>, data: KPIShipmentModel) {
    this.selectedKPIShipment = data;
    this.getKPIShipmentDetail();
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-1000' });
  }
  async getKPIShipmentDetail() {
    const results = await this.kpiShipmentServices.getKPIShipmentCusByKPIShipemt(this.selectedKPIShipment.id).toPromise();
    this.listDataUserKPI = results.data as any[];
    this.listDataUserKPI.map(m => {
      const fUser = this.customers.find(f => f.value === m.cusId);
      if (fUser) {
        m.customer = fUser.data;
      }
    });
  }
  async createKPIShipmentCus() {
    if (!this.selectedCustomer) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng chọn tài khoản khách hàng!" });
      return;
    }
    // this.upLoadKPIShipmentDetailViewModel.kPIShipmentId = this.selectedKPIShipment.id;
    // this.upLoadKPIShipmentDetailViewModel.code = this.selectedKPIShipment.code;
    // this.upLoadKPIShipmentDetailViewModel.name = this.selectedKPIShipment.name;
    // this.upLoadKPIShipmentDetailViewModel.vehicle = this.vehicle;
    // console.log(this.createKPIShipmentCusViewModel);
    // const result = await this.kpiShipmentDetailServices.upLoadKPIShipmentDetail(this.upLoadKPIShipmentDetailViewModel).toPromise();
    // if (result.isSuccess) {
    //   this.messageService.add({ severity: Constant.messageStatus.success, detail: "Thêm tài khoản khách hàng thành công!" });
    //   this.getKPIShipmentDetail();
    // }
    this.createKPIShipmentCusViewModel.cusId = this.selectedCustomer;
    this.createKPIShipmentCusViewModel.kPIShipmentId = this.selectedKPIShipment.id;
    this.createKPIShipmentCusViewModel.isEnabled = 1;
    const result = await this.kpiShipmentServices.createKPIShipmentCus(this.createKPIShipmentCusViewModel).toPromise();
    if (result.isSuccess) {
      this.messageService.add({ severity: Constant.messageStatus.success, detail: "Thêm tài khoản khách hàng thành công!" });
      this.getKPIShipmentDetail();
    }
  }
}

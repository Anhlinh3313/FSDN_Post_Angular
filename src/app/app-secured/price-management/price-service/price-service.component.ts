import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { PriceList, PriceService, AreaGroup, WeightGroup, Service } from '../../../models';
import { LazyLoadEvent, CalendarModule, Calendar, SelectItem } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { PriceListService, PriceServiceService, AreaGroupService, WeightGroupService, ServiceService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { InputValue } from '../../../infrastructure/inputValue.helper';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/permission.service';
import { environment } from '../../../../environments/environment';
import { SelectModel } from '../../../models/select.model';

declare var jQuery: any;

@Component({
  selector: 'app-price-service',
  templateUrl: 'price-service.component.html',
  styles: []
})
export class PriceServiceComponent extends BaseComponent implements OnInit {
  selectedVatPercent: number;
  selectedFuelPercent : number;
  selectedRemoteAreasPricePercent : number;
  selectedDIM: number;
  hub = environment;

  first: number = 0;
  cloneCode: string;
  txtFilterGb: any;
  constructor(private modalService: BsModalService, private priceListService: PriceListService,
    protected messageService: MessageService, private priceServiceService: PriceServiceService,
    private areaGroupService: AreaGroupService, private weightGroupService: WeightGroupService, private serviceService: ServiceService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);
  }
  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.priceService.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: PriceService;
  selectedData: PriceService;
  isNew: boolean;
  listData: PriceService[];
  //
  columns: string[] = ["code", "name", "priceList.name", "areaGroup.name", "weightGroup.name", "service.name"];
  datasource: PriceService[];
  totalRecords: number;
  rowPerPage: number = 10;
  //
  priceLists: SelectModel[] = [];
  selectedPriceList: number;
  //
  areaGroups: SelectModel[] = [];
  selectedAreaGroup: number;
  //
  weightGroups: SelectModel[] = [];
  selectedWeightGroup: number;
  //
  services: SelectModel[];
  selectedService: number;
  //
  selectedPrice: string;
  price: SelectItem[];
  event: LazyLoadEvent;
  //
  ngOnInit() {
    this.initData();
  }

  async initData() {
    let includes = [];
    includes.push(Constant.classes.includes.priceService.areaGroup);
    includes.push(Constant.classes.includes.priceService.priceList);
    includes.push(Constant.classes.includes.priceService.service);
    includes.push(Constant.classes.includes.priceService.weightGroup);
    this.priceServiceService.getAll(includes).subscribe(
      x => {
        this.datasource = x.data as PriceService[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadPriceList();
      }
    );

    // this.priceListService.getAll().subscribe(
    //   x => this.priceLists = x.data as PriceList[]
    // )
    this.priceLists = await this.priceListService.getAllSelectModelAsync();
    //
    var areaGroups = await this.areaGroupService.getAllSelectModelAsync();
    areaGroups.forEach(x => {
      if (!x.data || !x.data.isAuto) {
        this.areaGroups.push(x)
      }
    })

    //
    var weightGroup = await this.weightGroupService.getAllSelectModelAsync();
    weightGroup.forEach(x => {
      if (!x.data || !x.data.isAuto) {
        this.weightGroups.push(x)
      }
    })
    //
    this.services = await this.serviceService.getAllSelectModelAsync();

    this.data = null;
    this.selectedData = null;
    this.isNew = true;

    //refresh
    this.txtFilterGb = null;
  }


  openModel(template: TemplateRef<any>, data: PriceService = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
      this.selectedPriceList = data.priceListId;
      this.selectedAreaGroup = data.areaGroupId;
      this.selectedWeightGroup = data.weightGroupId;
      this.selectedService = data.serviceId;
      this.cloneCode = this.data.code;
      this.selectedVatPercent = this.data.vatPercent;
      this.selectedFuelPercent = this.data.fuelPercent;
      this.selectedRemoteAreasPricePercent = this.data.remoteAreasPricePercent;
      this.selectedDIM = this.data.dim;
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new PriceService();
      this.selectedPriceList = null;
      this.selectedAreaGroup = null;
      this.selectedWeightGroup = null;
      this.selectedService = null;
      this.selectedVatPercent = 0;
      this.selectedFuelPercent = 0;
      this.selectedRemoteAreasPricePercent = 0;
      this.selectedDIM = 0;
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
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
          filterRows = this.datasource.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.datasource.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));
        //
        //
        if (this.selectedPrice) {
          filterRows = filterRows.filter(
            x => {
              if (x.priceList) {
                return x.priceList.name === this.selectedPrice;
              } else {
                return false;
              }
            });
        }
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

  changePriceListService() {
    if (this.selectedPriceList && this.selectedService) {
      this.data.name =this.priceLists.find(f=>f.value==this.selectedPriceList).data.name+'-'+ this.services.find(x => x.value == this.selectedService).data.name;
    }
    this.data.code = InputValue.removeCharactersVI(this.data.name);
  }

  save() {
    if (!this.isValidPriceService()) return;
    let list = [...this.listData];
    if (this.selectedPriceList) {
      this.data.priceListId = this.selectedPriceList;
    }
    if (this.selectedAreaGroup) {
      this.data.areaGroupId = this.selectedAreaGroup;
    }
    if (this.selectedWeightGroup) {
      this.data.weightGroupId = this.selectedWeightGroup;
    }
    if (this.selectedService) {
      this.data.serviceId = this.selectedService;
    }
    this.data.vatPercent = this.selectedVatPercent ? this.selectedVatPercent : 0;
    this.data.fuelPercent = this.selectedFuelPercent ? this.selectedFuelPercent : 0;
    this.data.remoteAreasPricePercent = this.selectedRemoteAreasPricePercent ? this.selectedRemoteAreasPricePercent : 0;
    this.data.dim = this.selectedDIM ? this.selectedDIM : 0;
    if (this.isNew) {
      this.priceServiceService.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        var obj = (x.data as PriceService);
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      });
    }
    else {
      this.priceServiceService.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as PriceService);
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
      if (!this.selectedPriceList) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Bảng giá không được để trống!" });
        result = false;
      }
      if (!this.selectedService) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Dịch vụ không được để trống!" });
        result = false;
      }
      if (!this.selectedAreaGroup) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Nhóm khu vực không được để trống!" });
        result = false;
      }
      if (!this.selectedWeightGroup) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Nhóm mức cân không được để trống!" });
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

  mapSaveData(obj: PriceService) {
    if (obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
      this.data.priceList = this.priceLists.find(x => x.value == this.selectedPriceList).data;
      this.data.service = this.services.find(x => x.value == this.selectedService).data;
      this.data.areaGroup = this.areaGroups.find(x => x.value == this.selectedAreaGroup).data;
      this.data.weightGroup = this.weightGroups.find(x => x.value == this.selectedWeightGroup).data;
    }
  }

  saveClient(list: PriceService[]) {
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    this.bsModalRef.hide();
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }

  clone(model: PriceService): PriceService {
    let data = new PriceService();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  compareFn(c1: PriceService, c2: PriceService): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  //
  openDeleteModel(template: TemplateRef<any>, data: PriceService) {
    this.selectedData = data;
    this.data = this.clone(data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  delete() {
    this.priceServiceService.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;

      let index = this.findSelectedDataIndex();
      this.datasource.splice(this.datasource.indexOf(this.selectedData), 1);
      this.saveClient(this.listData.filter((val, i) => i != index));
    });
  }
  loadPriceList() {
    this.selectedPrice = null;
    let uniquePrice = [];
    this.price = [];

    this.datasource.forEach(x => {
      if (uniquePrice.length === 0) {
        this.price.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (uniquePrice.indexOf(x.priceListId) === -1 && x.priceListId) {
        uniquePrice.push(x.priceListId);
        this.price.push({
          label: x.priceList.name,
          value: x.priceList.name
        });
      }
    });
  }
  changePriceList() {
    this.loadLazy(this.event);
  }
}

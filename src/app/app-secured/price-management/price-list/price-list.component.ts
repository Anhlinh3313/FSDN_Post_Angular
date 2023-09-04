import { Component, OnInit, TemplateRef, Input } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { PriceList, Hub } from "../../../models";
import { LazyLoadEvent, CalendarModule, Calendar, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import { PriceListService, HubService } from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { InputValue } from "../../../infrastructure/inputValue.helper";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { DaterangepickerConfig } from "ng2-daterangepicker";
import { environment } from "../../../../environments/environment";
import { DateRangeFromTo } from "../../../view-model";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { PriceListDVGT } from "../../../models/priceListDVGT.model";
import { SelectModel } from "../../../models/select.model";
import { PriceListDVGTService } from "../../../services/price-list-dvgt.service";

declare var jQuery: any;

@Component({
  selector: "app-price-list",
  templateUrl: "price-list.component.html",
  styles: []
})
export class PriceListComponent extends BaseComponent implements OnInit {
  @Input("calendarDateTo") calendarDateTo: Calendar;

  hub = environment;

  first: number = 0;
  cloneCode: string;
  txtFilterGb: any;

  // public mainInput = {
  //   start: moment().subtract(0, "day"),
  //   end: moment()
  // };

  selectedDateFrom: string;
  selectedDateTo: string;
  // requestGetPickupHistory: DateRangeFromTo = new DateRangeFromTo();

  constructor(
    private modalService: BsModalService,
    private priceListServicee: PriceListService,
    protected messageService: MessageService,
    private hubService: HubService,
    private daterangepickerOptions: DaterangepickerConfig,
    public permissionService: PermissionService,
    public router: Router,
    private priceListDVGTService: PriceListDVGTService
  ) {
    super(messageService, permissionService, router);
    this.dateFormat = environment.formatDate.toLowerCase().replace("yyyy", "yy");
  }
  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.priceList.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: PriceList;
  dataCopy: PriceList;
  selectedData: PriceList;
  isNew: boolean;
  listData: PriceList[];
  //
  columns: string[] = [
    "code",
    "name",
    "hub.name",
    "fuelSurcharge",
    "remoteSurcharge"
  ];
  datasource: PriceList[];
  totalRecords: number;
  rowPerPage: number = 10;
  //
  numOrders: any[] = [
    { value: 1, name: "1" },
    { value: 2, name: "2" },
    { value: 3, name: "3" },
    { value: 4, name: "4" },
    { value: 5, name: "5" },
  ]
  selectedNumOrder = 5;
  //
  listPriceListDVGT: SelectModel[] = [];
  selectedPriceListDVGT: number;
  //

  dateFormat: any;

  //
  hubs: SelectModel[];
  selectedHub: number;
  //
  hubRadios = [
    { value: "centerHub", name: "Trung tâm" },
    { value: "poHub", name: "Chi nhánh" },
    { value: "stationHub", name: "Trạm" },
  ];
  selectedHubRadio = null;
  //
  selectedCenter: string;
  center: SelectItem[];
  event: LazyLoadEvent;
  //
  ngOnInit() {
    this.initData();
    this.getModelSelectPriceListDVGT();
  }

  async initData() {
    let includes = [];
    includes.push(Constant.classes.includes.priceList.hub);
    includes.push(Constant.classes.includes.priceList.priceListDVGT);

    this.priceListServicee.getAll(includes).subscribe(x => {
      this.datasource = x.data as PriceList[];
      this.totalRecords = this.datasource.length;
      this.listData = this.datasource.slice(0, this.rowPerPage);
      this.loadCenter();
    });

    this.hubs = await this.hubService.getSelectModelPoHubAsync();

    this.data = null;
    this.selectedData = null;
    this.onChangeHubRadios(this.hubRadios[0]);
    this.isNew = true;

    //refresh
    this.txtFilterGb = null;
  }

  async getModelSelectPriceListDVGT() {
    this.listPriceListDVGT = await this.priceListDVGTService.getAllSelectModelAsync();
  }

  openModelCopy(template: TemplateRef<any>, data: PriceList = null) {
    this.modalTitle = "Copy bảng giá: " + data.name;
    this.dataCopy = this.clone(data);
    this.data = this.clone(data);
    this.dataCopy.id = 0;
    this.dataCopy.name += "(copy)";
    this.dataCopy.code += "(COPY)";

    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  openModel(template: TemplateRef<any>, data: PriceList = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
      this.selectedHub = data.hubId;
      this.selectedNumOrder = data.numOrder;
      this.cloneCode = this.data.code;
      this.selectedDateFrom = moment(this.data.publicDateFrom).format(environment.formatDate);
      if (this.data.publicDateTo) {
        this.selectedDateTo = moment(this.data.publicDateTo).format(environment.formatDate);
      } else{
        this.selectedDateTo = null;
      }
      this.selectedPriceListDVGT = this.data.priceListDVGTId;

      if (!this.data.hub.centerHubId) {
        this.changeHubRadios(this.hubRadios[0], false);
      } else if (this.data.hub.centerHubId && !this.data.hub.poHubId) {
        this.changeHubRadios(this.hubRadios[1], false);
      } else {
        this.changeHubRadios(this.hubRadios[2], false);
      }
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new PriceList();
      this.selectedHub = null;
      this.selectedNumOrder = 5;
      this.selectedDateFrom = moment(new Date()).format(environment.formatDate);
      this.selectedDateTo = moment(new Date()).format(environment.formatDate);

      this.changeHubRadios(this.hubRadios[0], true);
    }
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
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
        if (event.filters.length > 0)
          filterRows = this.datasource.filter(x =>
            FilterUtil.filterField(x, event.filters)
          );
        else
          filterRows = this.datasource.filter(x =>
            FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns)
          );
        //
        if (this.selectedCenter) {
          filterRows = filterRows.filter(
            x => {
              if (x.hub) {
                return x.hub.name === this.selectedCenter;
              } else {
                return false;
              }
            });
        }

        // if (this.selectedDateFrom || this.selectedDateTo) {
        //   //
        //   filterRows = filterRows.filter(x =>
        //     moment(x.publicDateFrom).toDate() >= this.selectedDateFrom && moment(x.publicDateTo).toDate() <= this.selectedDateTo
        //   );
        // }

        // else if (this.selectedDateFrom) {
        //   filterRows = filterRows.filter(x =>
        //     moment(x.orderDate).isAfter(this.selectedDateFrom)
        //   );
        // } else if (this.selectedDateTo) {
        //   filterRows = filterRows.filter(x =>
        //     moment(x.orderDate).isBefore(this.selectedDateTo)
        //   );
        //   //
        // }

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

  refresh() {
    this.initData();
    this.first = 0;
  }

  changeHubRadios(entry, isNew: boolean) {
    this.selectedHubRadio = entry;
    this.loadHub(isNew);
  }

  onChangeHubRadios(entry) {
    this.changeHubRadios(entry, true);
  }

  async copy() {
    if (!this.isValidPriceListCopy()) return;



    let res = await this.priceListServicee.createAsync(this.dataCopy);
    if (res.isSuccess) {
      let model = {
        PriceListCopyId: this.data.id,
        PriceListNewId: res.data.id
      }

      this.priceListServicee.CopyPriceList(model).subscribe(x => {
        if (x.isSuccess) {

          this.messageService.add({
            severity: Constant.messageStatus.success,
            detail: "Cập nhật thành công"
          });

          this.datasource.push(res.data);
        }
        else {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: x.message
          });
        }
        this.bsModalRef.hide();
      })
    }

    // this.priceListServicee.CopyPriceList(model).subscribe(x => {
    //   console.log(x);

    //   this.messageService.add({
    //     severity: Constant.messageStatus.success,
    //     detail: "Cập nhật thành công"
    //   });

    //   this.datasource.push(this.dataCopy);
    //   this.dataCopy = null;
    //   this.data = null;
    //   this.bsModalRef.hide();
    // })
  }

  save() {
    if (!this.isValidPriceList()) return;
    let list = [...this.listData];
    if (this.selectedHub) {
      this.data.hubId = this.selectedHub;
    }
    if (this.selectedPriceListDVGT) {
      this.data.priceListDVGTId = this.selectedPriceListDVGT;
    }

    this.data.publicDateFrom = this.selectedDateFrom ? moment(this.selectedDateFrom).format("YYYY/MM/DD") : new Date();
    this.data.publicDateTo = this.selectedDateTo ? moment(this.selectedDateTo).format("YYYY/MM/DD") : null;

    if (this.isNew) {
      // this.data.publicDateFrom = new Date();
      // this.data.PublicDateTo = new Date();
      this.data.numOrder = this.selectedNumOrder;
      this.priceListServicee.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = x.data as PriceList;
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      });
    } else {
      this.data.numOrder = this.selectedNumOrder;

      this.priceListServicee.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = x.data as PriceList;
        this.mapSaveData(obj);
        list[this.findSelectedDataIndex()] = this.data;
        this.datasource[this.datasource.indexOf(this.selectedData)] = this.data;
        this.saveClient(list);
      });
    }
  }

  async loadHub(isNew: boolean) {
    switch (this.selectedHubRadio.value) {
      case "centerHub": {
        this.hubs = await this.hubService.getSelectModelCenterHubAsync();
        if (this.hubs.length > 0 && isNew) {
          this.selectedHub = this.hubs[0].value;
        }
        break;
      }
      case "poHub": {
        this.hubs = await this.hubService.getSelectModelPoHubAsync();
        if (this.hubs.length > 0 && isNew) {
          this.selectedHub = this.hubs[0].value;
        }
        break;
      }
      case "stationHub": {
        this.hubs = await this.hubService.getSelectModelStationHubAsync();
        if (this.hubs.length > 0 && isNew) {
          this.selectedHub = this.hubs[0].value;
        }
        break;
      }
    }
  }

  isValidPriceListCopy(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    this.datasource.forEach(x => {
      if (this.dataCopy.code === x.code) {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "Trùng mã, vui lòng nhập Mã khác!"
        });
        result = false;
      }
    });
    if (!this.dataCopy.name) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Tên không được để trống!"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  isValidPriceList(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (this.isNew === true) {
      if (this.data.code) {
        this.datasource.forEach(x => {
          if (this.data.code === x.code) {
            messages.push({
              severity: Constant.messageStatus.warn,
              detail: "Trùng mã, vui lòng nhập Mã khác!"
            });
            result = false;
          }
        });
      } else {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "Mã không được để trống!"
        });
        result = false;
      }
      if (!this.data.name) {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "Tên không được để trống!"
        });
        result = false;
      }
      if (!this.selectedHub) {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "Trung tâm không được để trống!"
        });
        result = false;
      }
      if (!this.selectedPriceListDVGT) {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "Bảng giá DVGT không được để trống!"
        });
        result = false;
      }
      if (!this.data.fuelSurcharge && this.data.fuelSurcharge !== 0) {
        // console.log(this.data.fuelSurcharge);
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "% Phụ phí xăng dầu không được để trống!"
        });
        result = false;
      }
      if (!this.data.remoteSurcharge && this.data.remoteSurcharge !== 0) {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "% Phụ phí vùng xa không được để trống!"
        });
        result = false;
      }
    } else {
      if (!this.data.code) {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "Mã không được để trống!"
        });
        result = false;
      } else {
        if (this.data.code !== this.cloneCode) {
          this.datasource.forEach(x => {
            if (this.data.code === x.code) {
              messages.push({
                severity: Constant.messageStatus.warn,
                detail: "Trùng mã, vui lòng nhập Mã khác!"
              });
              result = false;
            }
          });
        }
      }
      if (!this.data.name) {
        messages.push({
          severity: Constant.messageStatus.warn,
          detail: "Tên không được để trống!"
        });
        result = false;
      }
    }
    if (!this.selectedPriceListDVGT) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Bảng giá DVGT không được để trống!"
      });
      result = false;
    }
    if (!this.selectedDateFrom) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Ngày bắt đầu sử dụng không được để trống"
      });
      result = false;
    }
    // if (!this.selectedDateTo) {
    //   messages.push({
    //     severity: Constant.messageStatus.warn,
    //     detail: "Ngày hết hạn không được để trống"
    //   });
    //   result = false;
    // }
    if (this.selectedDateFrom && this.selectedDateTo && moment(this.selectedDateFrom).toDate() > moment(this.selectedDateTo).toDate()) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Ngày bắt đầu sử dụng không được lớn hơn ngày hết hạn"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  isValidResponse(x: ResponseModel): boolean {
    if (!x.isSuccess) {
      if (x.message) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: x.message
        });
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

  nameChange() {
    this.data.code = InputValue.removeCharactersVI(this.data.name);
  }

  nameCopyChange() {
    this.dataCopy.code = InputValue.removeCharactersVI(this.dataCopy.name);
  }

  mapSaveData(obj: PriceList) {
    if (obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
      this.data.hub = this.hubs.find(x => x.value == this.selectedHub).data;
    }
  }

  saveClient(list: PriceList[]) {
    this.messageService.add({
      severity: Constant.messageStatus.success,
      detail: "Cập nhật thành công"
    });
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    this.bsModalRef.hide();
    this.initData();
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }

  clone(model: PriceList): PriceList {
    let data = new PriceList();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  compareFn(c1: Hub, c2: Hub): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  //
  openDeleteModel(template: TemplateRef<any>, data: PriceList) {
    this.selectedData = data;
    this.data = this.clone(data);
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }
  delete() {
    this.priceListServicee.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;

      let index = this.findSelectedDataIndex();
      this.datasource.splice(this.datasource.indexOf(this.selectedData), 1);
      this.saveClient(this.listData.filter((val, i) => i != index));
    });
  }
  loadCenter() {
    this.selectedCenter = null;
    let uniqueCenter = [];
    this.center = [];

    this.datasource.forEach(x => {
      if (uniqueCenter.length === 0) {
        this.center.push({ label: "Chọn tất cả", value: null });
      }
      //
      if (uniqueCenter.indexOf(x.hubId) === -1 && x.hubId) {
        uniqueCenter.push(x.hubId);
        this.center.push({
          label: x.hub.name,
          value: x.hub.name
        });
      }
    });
  }
  changeCenter() {
    this.loadLazy(this.event);
  }

  clearSelectedDateTo() {
    this.selectedDateTo = null;
  }
}

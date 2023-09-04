import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { AreaGroup, Hub } from '../../../models';
import { LazyLoadEvent, SelectItem } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { AreaGroupService, HubService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { InputValue } from '../../../infrastructure/inputValue.helper';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

declare var jQuery: any;

@Component({
  selector: 'app-area-group',
  templateUrl: 'area-group.component.html',
  styles: []
})
export class AreaGroupComponent extends BaseComponent implements OnInit {
  hub = environment;

  first: number = 0;
  cloneCode: string;
  txtFilterGb: any;
  constructor(private modalService: BsModalService, private areaGroupService: AreaGroupService,
    protected messageService: MessageService, private hubService: HubService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
  }
  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.areaGroup.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: AreaGroup;
  selectedData: AreaGroup;
  isNew: boolean;
  listData: AreaGroup[];
  //
  columns: string[] = ["code", "name", "hub.name"];
  datasource: AreaGroup[];
  totalRecords: number;
  rowPerPage: number = 10;
  //
  hubs: Hub[];
  selectedHub: Hub;
  //
  selectedCenter:string;
  center: SelectItem[];
  event:LazyLoadEvent;
  //
  ngOnInit() {
    this.initData();
  }

  initData() {
    let includes = [];
    includes.push(Constant.classes.includes.areaGroup.hub);
    this.areaGroupService.getAll(includes).subscribe(
      x => {
        this.datasource = x.data as AreaGroup[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
        this.loadCenter();
      }
    );

    this.hubService.getCenterHub().subscribe(
      x => this.hubs = x.data as Hub[]
    )

    this.data = null;
    this.selectedData = null;
    this.isNew = true;

    //refresh
    this.txtFilterGb = null;
  }


  openModel(template: TemplateRef<any>, data: AreaGroup = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
      this.selectedHub = data.hub;
      this.cloneCode = this.data.code;
    } else {
      this.modalTitle = "Tạo mới";
      this.isNew = true;
      this.data = new AreaGroup();
      this.selectedHub = null;
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
        if (this.selectedCenter) {
          filterRows = filterRows.filter(
            x => {
              if(x.hub){
                return x.hub.name === this.selectedCenter;
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

  nameChange() {
    this.data.code = InputValue.removeCharactersVI(this.data.name);
  }

  save() {
    if (!this.isValidAreaGroup()) return;
    let list = [...this.listData];
    if (this.selectedHub) {
      this.data.hubId = this.selectedHub.id;
    }
    if (this.isNew) {

      this.areaGroupService.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as AreaGroup);
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      });
    }
    else {
      this.areaGroupService.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;

        var obj = (x.data as AreaGroup);
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

  isValidAreaGroup(): boolean {
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
      if (!this.selectedHub) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Trung tâm được để trống!" });
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

  mapSaveData(obj: AreaGroup) {
    if (obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
      this.data.hub = this.selectedHub;
    }
  }

  saveClient(list: AreaGroup[]) {
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    this.bsModalRef.hide();
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }

  clone(model: AreaGroup): AreaGroup {
    let data = new AreaGroup();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  compareFn(c1: Hub, c2: Hub): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }
  //
  openDeleteModel(template: TemplateRef<any>, data: AreaGroup) {
    this.selectedData = data;
    this.data = this.clone(data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  delete() {
    this.areaGroupService.delete(new BaseModel(this.data.id)).subscribe(x => {
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
}

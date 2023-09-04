import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { AreaGroup, Area, Province, District } from '../../../models';
import { DataFilterViewModel } from '../../../view-model';
import { LazyLoadEvent, MultiSelectModule, SelectItem, Dropdown } from 'primeng/primeng';
import { BaseModel } from '../../../models/base.model';
import { AreaService, AreaGroupService, ProvinceService, DistrictService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { Message } from 'primeng/components/common/message';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { InputValue } from '../../../infrastructure/inputValue.helper';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/permission.service';
import { SelectModel } from '../../../models/select.model';

declare var jQuery: any;

@Component({
  selector: 'app-area',
  templateUrl: 'area.component.html',
  styles: []
})
export class AreaComponent extends BaseComponent implements OnInit {
  first: number = 0;
  cloneCode: string;
  txtFilterGb: any;
  constructor(private modalService: BsModalService, private areaService: AreaService,
    protected messageService: MessageService, private areaGroupService: AreaGroupService
    , private provinceService: ProvinceService, private districtService: DistrictService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(messageService, permissionService, router);
  }
  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.area.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: Area;
  selectedData: Area;
  isNew: boolean;
  listData: Area[];
  //
  columns: string[] = ["code", "name", "areaGroup.name"];
  datasource: Area[];
  totalRecords: number;
  rowPerPage: number = 10;
  //
  areaGroups: SelectModel[] = [];
  selectedAreaGroup: number;
  //
  provinces: SelectItem[] = [];
  multiSelectProvinces: string[] = [];
  //
  districts: SelectItem[] = [];
  multiSelectDistricts: string[] = [];
  //
  areaGroupId: number = 0;
  areaId: number = 0;
  selectedProvinces: number[] = [];
  selectedDistricts: number[] = [];
  //
  selectedAreaFilter: string;
  event: LazyLoadEvent;

  ngOnInit() {
    this.initData();
  }

  async initData() {
    this.areaGroups = await this.areaGroupService.getAllSelectModelAsync();
    this.data = null;
    this.selectedData = null;
    this.isNew = true;
    //refresh
    this.txtFilterGb = null;
  }
  loadArea() {
    this.areaService.GetByAreaGroup(this.selectedAreaGroup).subscribe(
      x => {
        this.datasource = x.data as Area[];
        this.totalRecords = this.datasource.length;
        this.listData = this.datasource.slice(0, this.rowPerPage);
      }
    );
  }
  loadProvinceAllowSelect(areaGroupId: number, areaId: number) {
    this.provinces = [];
    this.areaService.GetProvinceAllowSelectByArea(areaGroupId.toString(), areaId + "").subscribe(
      x => {
        let objs = x.data as Province[];
        objs.forEach(element => {
          this.provinces.push({ label: element.code + " - " + element.name, value: element.id })
        });
      }
    )
  }

  loadProvinceSelected(areaGroupId: number, areaId: number) {
    this.multiSelectProvinces = [];
    this.selectedProvinces = [];
    this.multiSelectDistricts = [];
    this.areaService.GetProvinceSelectedByArea(areaGroupId.toString(), areaId + "").subscribe(
      x => {
        let objs = x.data as Province[];
        objs.forEach(element => {
          this.multiSelectProvinces.push(element.id + "");
          this.selectedProvinces.push(element.id);
        });
        this.loadDistrictAllowSelect();
        // this.loadDistrictSelected();
        // this.loadProvinceAllowSelect(areaGroupId,areaId);
      }
    )
  }

  getDataAreaGroupById(id: number): AreaGroup {
    return this.areaGroups.find(x => x.value == id).data;
  }

  nameChange() {
    this.data.code = this.getDataAreaGroupById(this.selectedAreaGroup).code + '-' + InputValue.removeCharactersVI(this.data.name);
  }

  loadDistrictAllowSelect() {
    this.districts = [];
    this.selectedProvinces = [];
    for (var index = 0; index < this.multiSelectProvinces.length; index++) {
      var element = this.multiSelectProvinces[index];
      this.selectedProvinces.push(Number(element));
    }
    let dataFilter: DataFilterViewModel = new DataFilterViewModel;
    if (this.selectedAreaGroup != null) {
      this.areaGroupId = this.selectedAreaGroup;
    }
    dataFilter.typeInt1 = this.areaGroupId;
    dataFilter.typeInt2 = this.areaId;
    dataFilter.arrayInt1 = this.selectedProvinces;
    this.areaService.GetDistrictAllowSelect(dataFilter).subscribe(
      x => {
        let objs = x.data as District[];
        objs.forEach(element => {
          this.districts.push({ label: element.code + " - " + element.name, value: element.id });
        });
        this.loadDistrictSelected();
      }
    );
  }

  areaGroupSelectChange() {
    this.loadProvinceAllowSelect(this.selectedAreaGroup, 0);
    this.loadProvinceSelected(this.selectedAreaGroup, 0);
    this.nameChange();
  }

  loadDistrictSelected() {
    this.multiSelectDistricts = [];
    this.selectedProvinces = [];
    this.multiSelectProvinces.forEach(item => {
      this.selectedProvinces.push(Number(item));
    })
    let dataFilter: DataFilterViewModel = new DataFilterViewModel;
    dataFilter.typeInt1 = this.areaGroupId;
    dataFilter.typeInt2 = this.areaId;
    dataFilter.arrayInt1 = this.selectedProvinces;
    this.areaService.GetDistrictSelected(dataFilter).subscribe(
      x => {
        let objs = x.data as District[];
        objs.forEach(element => {
          this.multiSelectDistricts.push(element.id + "");
        });
        // this.loadDistrictAllowSelect();
        this.multiSelectDistricts = [...this.multiSelectDistricts];
        this.multiSelectProvinces = [...this.multiSelectProvinces];
      }
    )
  }

  openModel(template: TemplateRef<any>, data: Area = null) {
    if (data) {
      this.modalTitle = "Xem chi tiết";
      this.isNew = false;
      this.data = this.clone(data);
      this.selectedData = data;
      this.selectedAreaGroup = data.areaGroupId;
      this.areaGroupId = this.selectedAreaGroup;
      this.areaId = this.data.id;
      this.loadProvinceAllowSelect(this.selectedAreaGroup, this.data.id);
      this.loadProvinceSelected(this.selectedAreaGroup, this.data.id);
      this.cloneCode = this.data.code;
    } else {
      this.modalTitle = "Tạo mới";
      this.refreshNew();
      if (this.selectedAreaGroup) this.areaGroupSelectChange();
    }
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }

  refreshNew() {
    this.isNew = true;
    this.data = new Area();
    this.provinces = null;
    this.selectedProvinces = null;
    this.districts = null;
    this.selectedDistricts = null;
    this.areaId = 0;
    if (this.selectedAreaGroup) this.areaGroupSelectChange();
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
    if (!this.isValidArea()) return;
    let list = [...this.listData];
    if (this.selectedAreaGroup) {
      this.data.areaGroupId = this.selectedAreaGroup;
    }
    if (this.isNew) {
      this.selectedDistricts = [];
      if (this.multiSelectDistricts.length > 0) {
        this.multiSelectDistricts.forEach(
          element => { this.selectedDistricts.push(Number(element)) }
        )
      }
      this.data.districtIds = this.selectedDistricts;
      this.data.concurrencyStamp = null;
      this.areaService.create(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        var obj = (x.data as Area);
        this.mapSaveData(obj);
        list.push(this.data);
        this.datasource.push(this.data);
        this.saveClient(list);
      });
    }
    else {
      this.selectedDistricts = [];
      if (this.multiSelectDistricts.length > 0) {
        this.multiSelectDistricts.forEach(
          element => { this.selectedDistricts.push(Number(element)) }
        )
      }
      this.data.districtIds = this.selectedDistricts;
      this.areaService.update(this.data).subscribe(x => {
        if (!this.isValidResponse(x)) return;
        var obj = (x.data as Area);
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

  isValidArea(): boolean {
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
      if (!this.selectedAreaGroup) {
        messages.push({ severity: Constant.messageStatus.warn, detail: "Nhóm khu vực không được để trống!" });
        result = false;
      } else {
        // if (!this.selectedProvinces) {
        //   messages.push({ severity: Constant.messageStatus.warn, detail: "Tỉnh/thành không được để trống!" });
        //   result = false;
        // } else {
        //   if (!this.selectedDistricts) {
        //     messages.push({ severity: Constant.messageStatus.warn, detail: "Quận/huyện không được để trống!" });
        //     result = false;
        //   }
        // }
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

  mapSaveData(obj: Area) {
    if (obj) {
      this.data.id = obj.id;
      this.data.concurrencyStamp = obj.concurrencyStamp;
      this.data.areaGroup = this.getDataAreaGroupById(this.selectedAreaGroup);
    }
  }

  saveClient(list: Area[]) {
    this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Cập nhật thành công' });
    this.listData = list;
    this.data = null;
    this.selectedData = null;
    if (this.isNew == true)
      this.refreshNew();
    else
      this.bsModalRef.hide();
  }

  findSelectedDataIndex(): number {
    return this.listData.indexOf(this.selectedData);
  }

  clone(model: Area): Area {
    let data = new Area();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  compareFn(c1: Area, c2: Area): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  openDeleteModel(template: TemplateRef<any>, data: Area) {
    this.selectedData = data;
    this.data = this.clone(data);
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
  }
  delete() {
    this.areaService.delete(new BaseModel(this.data.id)).subscribe(x => {
      if (!this.isValidResponse(x)) return;

      let index = this.findSelectedDataIndex();
      this.datasource.splice(this.datasource.indexOf(this.selectedData), 1);
      this.saveClient(this.listData.filter((val, i) => i != index));
    });
  }

  changeArea() {
    this.loadArea();
  }
}

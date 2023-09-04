import { Component, OnInit, TemplateRef, AfterContentChecked, AfterContentInit, Input } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
//
import { Constant } from '../../../infrastructure/constant';
import { PriceService, Area, Weight, PriceList, PriceServiceDetail, Province, AreaGroup, WeightGroup, Customer } from '../../../models';
import { LazyLoadEvent } from 'primeng/primeng';
import { PriceServiceService, AreaGroupService, AreaService, WeightService, PriceServiceDetailService, PriceListService, ServiceService, FormulaService, WeightGroupService, StructureService, DistrictService, ProvinceService, CustomerService, PricingTypeService } from '../../../services';
import { MessageService } from 'primeng/components/common/messageservice';
import { ResponseModel } from '../../../models/response.model';
import { FilterUtil } from '../../../infrastructure/filter.util';
import { DataFilterViewModel } from '../../../view-model/index';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { DataPriceServiceDetails } from '../../../view-model/dataPriceServiceDetails.model';
import { AreaAndPrice } from '../../../models/areaAndPrice.model';
import { AreaAndSelect } from '../../../models/areaAndSelected.model';
import { SearchDate } from '../../../infrastructure/searchDate.helper';
import { SortUtil } from '../../../infrastructure/sort.util';
import { SelectModel } from '../../../models/select.model';
import * as cloneDeep from 'lodash/cloneDeep';
import { environment } from '../../../../environments/environment';
import { CustomerPriceService } from '../../../models/customerPriceService';
import { CustomerPriceServiceService } from '../../../services/customer-price-service.service';
import { CurrencyFormatPipe } from "../../../pipes/currencyFormat.pipe";
declare var jQuery: any;

@Component({
  selector: 'app-price-service-detail',
  templateUrl: 'price-service-detail.component.html',
  styles: []
})
export class PriceServiceDetailComponent extends BaseComponent implements OnInit, AfterContentInit {
  areaAndSelect: AreaAndSelect[] = [];
  areaAndPrice: AreaAndPrice[] = [];
  dataPriceListDetail: DataPriceServiceDetails[] = [];
  first: number = 0;
  txtFilterGb: any;
  isViewPriceListDetail: boolean;
  isAddPS: boolean = true;
  constructor(private modalService: BsModalService,
    protected messageService: MessageService, private priceServiceService: PriceServiceService,
    private areaService: AreaService,
    private areaGroupService: AreaGroupService,
    private weightService: WeightService,
    private weightGroupService: WeightGroupService,
    private priceServiceDetailService: PriceServiceDetailService, private priceListService: PriceListService,
    public permissionService: PermissionService,
    private serviceService: ServiceService,
    private formulaService: FormulaService,
    public router: Router,
    private structureService: StructureService,
    private pricingTypeService: PricingTypeService,
    private districtService: DistrictService,
    private provinceService: ProvinceService,
    private customerService: CustomerService,
    private customerPriceService: CustomerPriceServiceService,
    protected currencyFormat: CurrencyFormatPipe
  ) {
    super(messageService, permissionService, router);
    this.dateFormat = environment.formatDate.toLowerCase().replace("yyyy", "yy");
  }
  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.priceServiceDetail.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: PriceServiceDetail;
  selectedData: PriceServiceDetail;
  isNew: boolean;
  listData: PriceServiceDetail[];
  isSubmit: boolean = false;
  isView: boolean = false;
  //
  newPriceServiceCode: string;
  //
  columns: string[] = ["area.code", "area.name", "weight.code", "weight.weightFrom", "weight.weightTo", "weight.weightPlus", "price"];
  datasource: PriceServiceDetail[] = [];
  rowPerPage: number = 10;
  //
  provinces: Province[] = [];
  //
  formulas: SelectModel[] = [];
  //
  structure: SelectModel[] = [];
  pricingType: SelectModel[] = [];
  //
  priceLists: SelectModel[] = [];
  selectedPriceList: number;
  //
  services: SelectModel[] = [];
  selectedService: number;
  //
  priceServices: SelectModel[] = [];
  selectedPriceService: number;
  //
  lstDistricts: SelectModel[] = [];
  lstSelectedDistrict: any[] = [];
  //
  lstCloneAreaSelect: AreaAndSelect[] = [];
  //
  lstProvinces: SelectModel[] = [];
  listPriceService: PriceService[] = [];
  //
  priceServiceDetails: PriceServiceDetail[] = [];
  selectedPriceServiceDetail: PriceServiceDetail;
  //
  areas: Area[] = [];
  newAreas: Area[] = [];
  selectedArea: Area;
  resultPriceServices: string[] = [];
  //
  weights: Weight[] = [];
  newWeights: Weight[] = [];
  selectedWeight: Weight;
  //
  customers: Customer[] = [];
  selectedCustomer: CustomerPriceService[] = [];
  totalRecords: number;
  customerPriceServiceModel: CustomerPriceService = new CustomerPriceService();
  colsCustomerPriceService = [
    { field: 'code', header: 'Mã' },
    { field: 'customer.name', header: 'Khách hàng' },
    { field: 'vatPercent', header: '%VAT' },
    { field: 'fuelPercent', header: '%PPXD' },
    { field: 'remoteAreasPricePercent', header: '%VSVX' },
    { field: 'dim', header: 'DIM' },
  ]
  //
  dateFormat: any;
  dateFrom: string;
  dateTo: string;
  //
  priceService: PriceService = new PriceService();
  //
  items = [
    { id: 1, name: '123' },
    { id: 2, name: '123' },
    { id: 3, name: '123' },
    { id: 4, name: '123' },
    { id: 5, name: '123' },
    { id: 6, name: '123' },
  ]

  singlePickerOrderDate = {
    singleDatePicker: true,
    timePicker: false,
    showDropdowns: true,
    opens: "left",
    startDate: new Date()
  }

  selectedFromDate(value: any) {
    this.priceService.publicDateFrom = new Date(value.start);
  }

  selectedToDate(value: any) {
    this.priceService.publicDateTo = new Date(value.start);
  }

  async loadCustomerPriceService() {
    if (this.selectedPriceService) {
      let res = await this.customerPriceService.GetByPriceServiceId(this.selectedPriceService);
    }
  }

  changePriceService() {
    this.areaAndSelect = [];
    this.dataPriceListDetail = [];
    this.weights = [];
    this.newAreas = [];
    this.newWeights = [];
    this.dateFrom = null;
    this.dateTo = null;
    this.priceServiceDetails = [];
    if (this.selectedPriceService) {
      let priceService = this.priceServices.find(x => x.value == this.selectedPriceService).data;
      this.dateFrom = priceService.publicDateFrom ? moment(priceService.publicDateFrom).format(environment.formatDate) : null;
      this.dateTo = priceService.publicDateTo ? moment(priceService.publicDateTo).format(environment.formatDate) : null;
      this.priceService.code = priceService.code;
      this.priceService.publicDateFrom = priceService.publicDateFrom;
      this.priceService.publicDateTo = priceService.publicDateTo;
      this.priceService.vatSurcharge = priceService.vatPercent;
      this.priceService.fuelPercent = priceService.fuelPercent;
      this.priceService.remoteAreasPricePercent = priceService.remoteAreasPricePercent;
      this.priceService.dim = priceService.dim;
      this.getCustomerPriceService();
      this.isAddPS = true;
    } else {
      this.selectedPriceService = null;
      this.priceService = new PriceService();
      this.dataPriceListDetail = [];
      this.weights = [];
      this.areas = [];
      this.areaAndPrice = [];
      this.areaAndSelect = [];
      this.selectedPriceService = null;
      this.txtFilterGb = null;
      this.first = 0;
      this.dateFrom = null;
      this.dateTo = null;
      this.priceService.code = this.priceLists.find(f => f.value == this.selectedPriceList).data.code +
        '-' + this.services.find(f => f.value == this.selectedService).data.code;
      this.getCustomerPriceService();
    }
  }

  ngOnInit() {
    this.loadListDistrict();
    this.loadProvice();
    this.initData();
  }

  async searchCustomer(event) {
    if (event.query.length > 4) {
      this.customers = await this.customerService.searchByNamePaging(event.query, 1, 10);
    }
  }

  async getCustomerPriceService() {
    if (this.selectedPriceService) {
      let result = await this.customerPriceService.GetByPriceServiceId(this.selectedPriceService);
      this.selectedCustomer = result;
      this.totalRecords = this.selectedCustomer.length;
    }
    else {
      this.selectedCustomer = [];
    }
  }

  async selectCustomer(event) {
    this.customerPriceServiceModel.customerId = event.id;
    this.customerPriceServiceModel.code = this.customerPriceServiceModel.name = this.priceService.code + "-" + event.code;
    this.customerPriceServiceModel.priceServiceId = this.selectedPriceService;
  }

  async editCustomerPriceService(data: CustomerPriceService) {
    this.customerPriceServiceModel = data;
  }

  async saveCustomerPriceService() {
    if (this.selectedPriceService) {
      if (this.customerPriceServiceModel.customerId) {
        if (!this.customerPriceServiceModel.vatPercent) this.customerPriceServiceModel.vatPercent = 0;
        if (!this.customerPriceServiceModel.fuelPercent) this.customerPriceServiceModel.fuelPercent = 0;
        if (!this.customerPriceServiceModel.remoteAreasPricePercent) this.customerPriceServiceModel.remoteAreasPricePercent = 0;
        if (!this.customerPriceServiceModel.dim) this.customerPriceServiceModel.dim = 0;

        let res: ResponseModel;

        if (!this.customerPriceServiceModel.id) {
          res = await this.customerPriceService.createAsync(this.customerPriceServiceModel);
        }
        else
          res = await this.customerPriceService.updateAsync(this.customerPriceServiceModel);

        if (res.isSuccess) {
          this.getCustomerPriceService();
          this.customerPriceServiceModel = new CustomerPriceService();
        }
        else {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: res.message
          });
        }
      }
      else {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Vui lòng chọn khách hàng"
        });
      }
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn bảng giá dịch vụ"
      });
    }
  }

  async deleteCustomerPriceService(data: CustomerPriceService) {
    let model = { id: data.id }
    let res = await this.customerPriceService.deleteAsync(model);
    if (res.isSuccess) {
      let index = this.selectedCustomer.findIndex(x => x.id == data.id)
      if (index != -1)
        this.selectedCustomer.splice(index, 1);
    }
  }

  clearCustomer(event) {
    // this.selectedCustomer = null;
  }

  async loadListDistrict() {
    this.lstDistricts = await this.districtService.getAllSelectModelAsync();
  }

  async loadProvice() {
    this.lstProvinces = await this.provinceService.getAllSelectModelAsync();
    this.lstProvinces.splice(0, 1);
    this.lstProvinces = SortUtil.sortAlphanumerical(this.lstProvinces, 1, 'label');
  }

  clearSelectedDateTo() {
    this.dateTo = null;
  }
  clearSelectedDateFrom() {
    this.dateFrom = null;
  }

  ngAfterContentInit() {
    jQuery(function () {
      if (jQuery(".ui-table-tbody").height() < 200) {
        jQuery(".ui-table-wrapper").css("padding-bottom", "200px");
      }
      else {
        jQuery(".ui-table-wrapper").css("padding-bottom", "0");
      }
    });
  }

  initData() {
    this.loadPriceListDetail();
    this.loadService();
    this.loadFormula();
    this.loadStructure();
    this.loadPricingType();
    this.data = null;
    this.selectedData = null;
    this.isNew = true;
  }

  async loadStructure() {
    this.structure = await this.structureService.getAllSelectModelAsync();
  }

  async loadPricingType() {
    this.pricingType = await this.pricingTypeService.getSelectModelPricingTypeAsync();
  }

  async loadPriceListDetail() {
    //const data = await this.priceListService.getAllSelectModelAsync();
    // if (data) {
    //   this.priceLists = data;
    // }
  }

  async loadService() {
    const data = await this.serviceService.getAllServiceSelectModelAsync();
    if (data) {
      this.services = data;
    }
  }

  async loadFormula() {
    const data = await this.formulaService.getSelectItemAsync();
    if (data) {
      this.formulas = data;
    }
  }

  async onViewPriceListDetail() {
    this.messageService.clear();
    if (!this.selectedPriceService) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn mã bảng giá cần xem!' });
      this.isView = false;
      return;
    }
    this.priceService = new PriceService();
    this.areaAndSelect = [];
    this.dataPriceListDetail = [];
    this.weights = []
    // this.dateFrom = null;
    // this.dateTo = null;
    this.priceServiceDetails = [];
    this.priceService = this.priceServices.find(f => f.value == this.selectedPriceService).data;
    if (this.priceService) {
      let priceService = this.priceServices.find(f => f.value == this.selectedPriceService).data;
      const data = await this.priceServiceDetailService.getByPriceServiceIdAsync(this.selectedPriceService, priceService ? priceService.areaGroupId : null);
      if (data.priceServiceDetails.length > 0) {
        this.priceServiceDetails = data.priceServiceDetails;
        if (this.priceServiceDetails[0].priceService) {
          this.selectedPriceServiceDetail = this.priceServiceDetails[0];
        }
      }
      if (this.newAreas) {
        await Promise.all(this.newAreas.map(x => {
          if (!data.areas) data.areas = [];
          if (!data.areas.find(f => f.id == x.id))
            data.areas.push(x);
        }));
      }
      if (data.areas.length > 0) {
        this.areaAndSelect = this.areas = data.areas
        this.priceServiceSelectChange(data);
        this.isSubmit = false;
      }
      this.isView = true;
    }
    else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không có dữ liệu"
      });
      this.isView = false;
    }
  }

  async priceServiceSelectChange(data) {
    this.areaAndSelect.map(async x => {
      x.multiSelectProvinces = [];
      x.multiSelectDistrict = [];
      x.districts = [];
      await Promise.all(data.districtSelected.map(dist => {
        if (dist.areaId == x.id) {
          if (x.multiSelectProvinces.indexOf(dist.provinceId) == -1) x.multiSelectProvinces.push(dist.provinceId);
          if (x.multiSelectDistrict.indexOf(dist.districtId) == -1) x.multiSelectDistrict.push(dist.districtId);
        }
      }));
      //
      await Promise.all(this.lstDistricts.map(dist => {
        if (dist.value)
          if (x.multiSelectProvinces.find(pro => pro == dist.data.provinceId))
            x.districts.push(dist);
      }));
      x.districts = SortUtil.sortAlphanumerical(x.districts, 1, 'label');
      //
      let fromProvinceSelected = data.fromProvinces.filter(fpro => fpro.areaId == x.id);
      x.multiSelectFromProvince = fromProvinceSelected.map(x => x.provinceId);
    });

    let weightGroupData = this.priceServices.find(f => f.value == this.selectedPriceService).data;
    let weightGroupId = weightGroupData ? weightGroupData.weightGroupId : null;
    const weights = await this.weightService.getByWeightGroupAsync(weightGroupId, this.selectedPriceService);

    if (weights) {
      this.weights = weights as Weight[];
      // console.log(this.weights);
    }
    this.newWeights.map(x => {
      if (!this.weights.find(f => f.id == x.id))
        this.weights.push(x);
    });
    // get areaAndPrice
    this.areaAndPrice = [];

    let result: DataPriceServiceDetails[] = [];
    for (let i = 0; i < this.weights.length; i++) {
      let obj: DataPriceServiceDetails = new DataPriceServiceDetails;
      let row = this.weights[i] as Weight;
      // lấy ra row theo từng Weight
      obj.weight = row;
      let areaAndPrices = [];
      // lấy ra column area và giá
      //debugger;
      await Promise.all(this.areaAndSelect.map(x => {
        if (this.priceServiceDetails) {
          let priceDetail = this.priceServiceDetails.find(f => f.areaId == x.id && f.weightId == row.id);
          if (priceDetail) {
            let areaAndPrice: AreaAndPrice = new AreaAndPrice;
            areaAndPrice.area = x;
            areaAndPrice.priceBasic = priceDetail;
            areaAndPrices.push(areaAndPrice);
          } else {
            let areaAndPrice: AreaAndPrice = new AreaAndPrice;
            areaAndPrice.area = x;
            let priceDetail = new PriceServiceDetail();
            priceDetail.areaId = x.id;
            priceDetail.area = x;
            priceDetail.weight = row;
            priceDetail.weightId = row.id;
            priceDetail.priceServiceId = this.selectedPriceService;
            priceDetail.price = 0;
            priceDetail.id = 0;
            areaAndPrice.priceBasic = priceDetail;
            this.priceServiceDetails.push(areaAndPrice.priceBasic);
            areaAndPrices.push(areaAndPrice);
          }
        }
      }));
      obj.areaAndPrices = areaAndPrices;
      result.push(obj);
    }
    if (result.length > 0) {
      this.dataPriceListDetail = result;
      // console.log(this.dataPriceListDetail);
    }
    this.lstCloneAreaSelect = [];
    this.lstCloneAreaSelect = cloneDeep(this.areaAndSelect);
    this.bsModalRef.hide();
  }

  async loadPriceService() {
    // this.messageService.clear();
    // this.areaAndSelect = [];
    // this.dataPriceListDetail = [];
    // this.weights = []
    // this.dateFrom = null;
    // this.dateTo = null;
    // this.priceServiceDetails = [];
    // if (!this.selectedPriceList) {
    //   return;
    // }
    // if (!this.selectedService) {
    //   return;
    // }
    // let dataFilterPriceServiceDetail: DataFilterViewModel = new DataFilterViewModel;
    // dataFilterPriceServiceDetail.typeInt1 = this.selectedPriceList;
    // dataFilterPriceServiceDetail.typeInt2 = this.selectedService;

    // await this.priceServiceService.GetByPriceListServiceAsync(this.selectedPriceList, this.selectedService).then(
    //   x => {
    //     if (x.length > 0) {
    //       this.priceServices = [];
    //       this.priceServices.push({ value: null, label: "--- Chọn dữ liệu ---", data: null })
    //       x.map(x => {
    //         this.priceServices.push({ value: x.id, label: x.code + ' - ' + x.name, data: x })
    //       });
    //       this.selectedPriceService = x[0].id;
    //       this.priceService = x[0];
    //       this.dateFrom = this.priceService.publicDateFrom ? moment(this.priceService.publicDateFrom).format(environment.formatDate) : null;
    //       this.dateTo = this.priceService.publicDateTo ? moment(this.priceService.publicDateTo).format(environment.formatDate) : null;

    //       this.getCustomerPriceService();
    //     } else {
    //       this.refresh();
    //       this.priceServices = [];
    //       this.priceServices.push({ value: null, label: "--- Chọn dữ liệu ---", data: null });
    //       this.selectedPriceService = null;
    //       this.priceService = new PriceService();
    //       this.dateFrom = null;
    //       this.dateTo = null;
    //       this.priceService.code = this.priceLists.find(f => f.value == this.selectedPriceList).data.code +
    //         '-' + this.services.find(f => f.value == this.selectedService).data.code;
    //       this.getCustomerPriceService();
    //     }
    //   }
    // );
  }

  showInfo(model: AreaAndSelect) {
    model.showInfo = true;
  }
  hideInfo(model: AreaAndSelect) {
    model.showInfo = false;
  }

  loadLazy(event: LazyLoadEvent) {
    setTimeout(() => {
      if (this.dataPriceListDetail) {
        var filterRows;

        //filter
        if (event.filters.length > 0)
          filterRows = this.dataPriceListDetail.filter(x => FilterUtil.filterField(x, event.filters));
        else
          filterRows = this.dataPriceListDetail.filter(x => FilterUtil.gbFilterFiled(x, event.globalFilter, this.columns));

        // sort data
        filterRows.sort((a, b) => FilterUtil.compareField(a, b, event.sortField) * event.sortOrder);
        this.dataPriceListDetail = filterRows;
        // this.listData = filterRows.slice(event.first, (event.first + event.rows));
      }
    }, 250);
  }

  filterFromProvince(event, item: AreaAndSelect, multiFromProvince) {
    if (event.key == "Enter") {
      let value = event.target.value.toLowerCase();
      if (value) {
        let findPro = this.lstProvinces.filter(x => x.label.toLowerCase().indexOf(value) != -1);
        if (findPro.length > 0) {
          this.lstCloneAreaSelect = [];
          var a = cloneDeep(this.areaAndSelect);
          this.lstCloneAreaSelect = a;
          let fromProvince = findPro[0];
          let indexSelected = item.multiSelectFromProvince.findIndex(x => x == fromProvince.value);
          if (indexSelected != -1) {
            item.multiSelectFromProvince.splice(indexSelected, 1);
          }
          else {
            item.multiSelectFromProvince.push(fromProvince.value);
          }
          event.target.setSelectionRange(0, value.length);
          multiFromProvince.updateLabel();
        }
      }
    }
  }

  filterProvince(event, item: AreaAndSelect, multiProvince, multiDistrict) {
    if (event.key == "Enter") {
      let value = event.target.value.toLowerCase();
      if (value) {
        let findPro = this.lstProvinces.filter(x => x.label.toLowerCase().indexOf(value) != -1);
        if (findPro.length > 0) {
          this.lstCloneAreaSelect = [];
          var a = cloneDeep(this.areaAndSelect);
          this.lstCloneAreaSelect = a;
          let province = findPro[0];
          let indexSelected = item.multiSelectProvinces.findIndex(x => x == province.value);
          if (indexSelected != -1) {
            item.multiSelectProvinces.splice(indexSelected, 1);
          }
          else {
            item.multiSelectProvinces.push(province.value);
          }
          event.target.setSelectionRange(0, value.length);
          this.changeProvince(item, multiProvince, multiDistrict);
          //
        }
      }
    }
  }
  changeProvince(area: AreaAndSelect, multiProvince, multiDistrict) {
    let areaBefore = this.lstCloneAreaSelect.find(x => x.id == area.id);
    let provinceChange = [];

    if (area.multiSelectProvinces.length > areaBefore.multiSelectProvinces.length) {//check
      provinceChange = area.multiSelectProvinces.filter(x => areaBefore.multiSelectProvinces.indexOf(x) == -1)
      provinceChange.map(x => {
        this.lstDistricts.filter(ft => ft.data ? ft.data.provinceId == x : false).map(f => {
          area.districts.push(f);
          area.multiSelectDistrict.push(f.value);
        });
      })
    }
    else {//unCheck
      provinceChange = areaBefore.multiSelectProvinces.filter(x => area.multiSelectProvinces.indexOf(x) == -1)
      provinceChange.map(x => {
        area.districts.filter(f => f.data ? f.data.provinceId == x : false).map(f => {
          area.districts.splice(area.districts.findIndex(i => i.value == f.value), 1);
          area.multiSelectDistrict.splice(area.multiSelectDistrict.findIndex(i => i == f.value), 1);
        });
      })
    }

    this.lstCloneAreaSelect = [];
    this.lstCloneAreaSelect = cloneDeep(this.areaAndSelect);
    //area.districts = SortUtil.sortAlphanumerical(area.districts, 1, 'label');
    multiProvince.updateLabel();
    multiDistrict.updateLabel();
  }

  searchByCode(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.priceServiceService.getByCodeAsync(value).then(
        x => {
          this.listPriceService = x as PriceService[];
          this.resultPriceServices = this.listPriceService.map(f => f.code);
        }
      );
    }
  }

  keyUpEnter(event) {
    if (event.code == 'Enter') {
      let value = event.currentTarget.value;
      this.findFilterByCode(value);
    }
  }

  onSelectedByCode(event) {
    let value = event;
    this.findByCode(value);
  }

  findByCode(code: string) {
    this.isView = false;
    this.messageService.clear();
    this.areaAndSelect = [];
    this.dataPriceListDetail = [];
    this.weights = []
    this.dateFrom = null;
    this.dateTo = null;
    this.priceServices = [];
    this.priceServiceDetails = [];
    if (code.length >= 1) {
      let findPS = this.listPriceService.find(f => f.code.toLocaleUpperCase() == code.toLocaleUpperCase());
      if (findPS) {
        this.priceService = findPS;
        this.priceServices.push({ label: findPS.code + ' - ' + findPS.name, value: findPS.id, data: findPS });
        this.selectedPriceService = findPS.id;
        this.selectedService = findPS.serviceId;
        this.selectedPriceList = findPS.priceListId;
        this.dateFrom = findPS.publicDateFrom ? moment(findPS.publicDateFrom).format(environment.formatDate) : null;
        this.dateTo = findPS.publicDateTo ? moment(findPS.publicDateTo).format(environment.formatDate) : null;
        this.getCustomerPriceService();
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Bảng giá dịch vụ mới" });
        this.priceService = new PriceService();
        this.priceService.fuelPercent = 0;
        this.priceService.vatPercent = 0;
        this.priceService.vatSurcharge = 0;
        this.priceService.dim = 0;
        this.priceService.numOrder = 0;
        this.priceService.pricingTypeId = 1;
        this.priceService.code = code;
        this.priceService.numOrder = 1;
        this.priceServices = [];
        this.selectedPriceService = null;
        this.selectedService = null;
        this.selectedPriceList = null;
        this.dateFrom = null;
        this.dateTo = null;
        this.priceServiceDetails = [];
        this.selectedCustomer = [];
      }
    }
  }

  findFilterByCode(code: string) {
    this.isView = false;
    this.messageService.clear();
    this.areaAndSelect = [];
    this.dataPriceListDetail = [];
    this.weights = []
    this.dateFrom = null;
    this.dateTo = null;
    this.priceServiceDetails = [];
    if (code.length >= 1) {
      let findPS = this.listPriceService.find(f => f.code.toLocaleUpperCase().indexOf(code.toLocaleUpperCase()) > -1);
      if (findPS) {
        this.priceService = findPS;
        this.priceServices = this.listPriceService.map(f => { return { label: f.code + ' - ' + f.name, value: f.id, data: f } });
        this.selectedPriceService = findPS.id;
        this.selectedService = findPS.serviceId;
        this.selectedPriceList = findPS.priceListId;
        this.dateFrom = findPS.publicDateFrom ? moment(findPS.publicDateFrom).format(environment.formatDate) : null;
        this.dateTo = findPS.publicDateTo ? moment(findPS.publicDateTo).format(environment.formatDate) : null;
        this.getCustomerPriceService();
        this.isAddPS = true;
      } else {
        this.priceServiceService.getByCodeAsync(code).then(
          x => {
            this.listPriceService = x as PriceService[];
            let findPSR = this.listPriceService.find(f => f.code.toLocaleUpperCase().indexOf(code.toLocaleUpperCase()) > -1);
            if (findPSR) {
              this.priceService = findPSR;
              this.priceServices = this.listPriceService.map(f => { return { label: f.code + ' - ' + f.name, value: f.id, data: f } });
              this.selectedPriceService = findPSR.id;
              this.selectedService = findPSR.serviceId;
              this.selectedPriceList = findPSR.priceListId;
              this.dateFrom = findPSR.publicDateFrom ? moment(findPSR.publicDateFrom).format(environment.formatDate) : null;
              this.dateTo = findPSR.publicDateTo ? moment(findPSR.publicDateTo).format(environment.formatDate) : null;
              this.getCustomerPriceService();
              this.isAddPS = true;
            } else {
              this.isAddPS = false;
              this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Bảng giá mới" });
              this.priceService = new PriceService();
              this.priceService.code = code;
              this.priceServices = [];
              this.selectedPriceService = null;
              this.selectedService = null;
              this.selectedPriceList = null;
              this.dateFrom = null;
              this.dateTo = null;
              this.priceServiceDetails = [];
              this.selectedCustomer = [];
            }
          }
        );
      }
    }
  }

  changeFromProvince(area: AreaAndSelect, multiFromProvince, event) {
    let itemValue = event.itemValue;
    let value = event.value;
    let isCheck: boolean;
    let selectedItemChange: any[] = [];
    if (itemValue)//check 1
    {
      selectedItemChange.push(itemValue);
      if (value.indexOf(itemValue) > -1)//check
      {
        isCheck = true;
      } else {//uncheck
        isCheck = false;
      }
    } else {//check all
      if (value.length > 0)//check
      {
        isCheck = true;
        selectedItemChange = value;
      } else {//uncheck
        isCheck = false;
        selectedItemChange = area.fromProvinces.map(f => f.value);
      }
    }
  }

  filterDistrict(event, item: AreaAndSelect, multiDistrict, multiProvince) {
    if (event.key == "Enter") {
      let value = event.target.value.toLowerCase();
      if (value) {
        this.lstCloneAreaSelect = [];
        this.lstCloneAreaSelect = cloneDeep(this.areaAndSelect);

        let findDist = item.districts.filter(x => x.label.toLowerCase().indexOf(value) != -1);
        if (findDist.length > 0) {
          let district = findDist[0];
          let indexSelected = item.multiSelectDistrict.findIndex(x => x == district.value);
          if (indexSelected != -1)
            item.multiSelectDistrict.splice(indexSelected, 1);
          else
            item.multiSelectDistrict.push(district.value);
          event.target.setSelectionRange(0, value.length);
        }
      }
    }
  }

  async AddNewPriceService() {
    this.messageService.clear();
    if (this.selectedPriceService) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Bảng giá đã tồn tại, vui lòng kiểm tra lại"
      });
      return;
    }
    if (!this.selectedService) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn dịch vụ"
      });
      return;
    }
    if (!this.priceService.code) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã bảng giá dịch vụ"
      });
      return;
    }
    if (!this.priceService.pricingTypeId) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn tính theo KG/M3/KIEN"
      });
      return;
    }
    let priceList = new PriceList();
    if (this.selectedPriceList) {
      priceList = this.priceLists.find(f => f.value == this.selectedPriceList).data;
    }
    let areaGroup = new AreaGroup();
    if (priceList.id) {
      areaGroup.hubId = priceList.hubId;
      areaGroup.code = priceList.code + this.selectedService;
      areaGroup.name = areaGroup.code;
      areaGroup.isAuto = true;
      await this.areaGroupService.createAsync(areaGroup).then(
        x => {
          if (!this.isValidResponse(x)) return;
          areaGroup = x.data;
        }
      )
    }
    let weightGroup = new WeightGroup();
    if (priceList.id) {
      weightGroup.code = priceList.id + '-' + this.selectedService;
      weightGroup.name = weightGroup.code;
      weightGroup.isAuto = true;
      await this.weightGroupService.createAsync(weightGroup).then(
        x => {
          if (!this.isValidResponse(x)) return;
          weightGroup = x.data;
        }
      );
    }
    let priceService = new PriceService();
    priceService.priceListId = this.selectedPriceList;
    priceService.serviceId = this.selectedService;
    priceService.areaGroupId = areaGroup.id;
    priceService.weightGroupId = weightGroup.id;
    priceService.code = this.priceService.code;
    priceService.name = this.priceService.code;
    priceService.isAuto = true;
    priceService.pricingTypeId = this.priceService.pricingTypeId != null ? this.priceService.pricingTypeId : 1;
    priceService.vatPercent = this.priceService.vatPercent;
    priceService.vatSurcharge = this.priceService.vatSurcharge;
    priceService.fuelPercent = this.priceService.fuelPercent;
    priceService.dim = this.priceService.dim;
    priceService.structureId = this.priceService.structureId;
    priceService.numOrder = this.priceService.numOrder == null ? 0 : this.priceService.numOrder;
    await this.priceServiceService.createAsync(priceService).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.listPriceService.push(x.data as PriceService);
        this.newAreas = [];
        this.newWeights = [];
        this.isAddPS = true;
        this.findByCode(this.priceService.code);
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Tạo bảng giá dịch vụ thành công"
        });
      }
    );
  }

  async AddArea() {
    this.messageService.clear();
    if (!this.selectedPriceService) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn bảng giá dịch vụ"
      });
      this.isSubmit = false;
      return;
    }

    if (this.areas.length > 25) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Bảng giá không được vượt quá 25 cột"
      });
      this.isSubmit = false;
      return;
    }
    let dataFilterPriceServiceDetail: DataFilterViewModel = new DataFilterViewModel;
    dataFilterPriceServiceDetail.typeInt1 = this.selectedPriceList;
    dataFilterPriceServiceDetail.typeInt2 = this.selectedService;

    let area = new Area();
    area.areaGroupId = this.priceService.areaGroupId;
    area.code = null;
    area.name = area.code;
    area.isAuto = true;// this.priceServices.find(f => f.value == this.selectedPriceService).data.isAuto;
    await this.areaService.createAsync(area).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: 'Thêm cột thành công'
        });
        if (!this.newAreas) this.newAreas = [];
        this.newAreas.push(x.data);
        this.onViewPriceListDetail();
      }
    )
  }

  async addWeight() {
    this.messageService.clear();
    if (!this.selectedPriceService) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: 'Vui lòng chọn bảng giá dịch vụ để thêm dòng'
      })
      return;
    }
    if (this.areaAndSelect.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: 'Vui lòng thêm cột trước'
      })
      return;
    }
    //
    let weight = new Weight();
    weight.formulaId = 1;//giá chuẩn
    weight.code = this.priceServices.find(f => f.value == this.selectedPriceService).data.code + '-' + SearchDate.formatToISODate(Date());
    weight.name = weight.code;
    weight.weightFrom = 0;
    weight.weightTo = 0;
    weight.weightGroupId = this.priceServices.find(f => f.value == this.selectedPriceService).data.weightGroupId;
    weight.weightPlus = 0;
    weight.isAuto = this.priceServices.find(f => f.value == this.selectedPriceService).data.isAuto;
    weight.isWeightCal = true;
    await this.weightService.createAsync(weight).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: 'Thêm dòng thành công'
        });
        if (!weight.weightGroupId) {
          if (!this.newWeights) this.newWeights = [];
          this.newWeights.push(x.data);
        }
        this.onViewPriceListDetail();
      }
    )
  }

  confirmDeletePriceService(tempate: TemplateRef<any>) {
    this.messageService.clear();
    if (!this.priceService.id && this.priceService.id != 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn bảng giá cần hủy!!!' });
      return;
    }
    this.bsModalRef = this.modalService.show(tempate, { class: 'inmodal animated bounceInRight modal-s' });
  }

  confirmCopyPriceService(tempate: TemplateRef<any>) {
    this.messageService.clear();
    if (!this.priceService.id && this.priceService.id != 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn bảng giá cần copy!!!' });
      return;
    }
    this.bsModalRef = this.modalService.show(tempate, { class: 'inmodal animated bounceInRight modal-s' });
  }

  openModelConfirm(tempate: TemplateRef<any>) {
    this.messageService.clear();
    this.bsModalRef = this.modalService.show(tempate, { class: 'inmodal animated bounceInRight modal-s' });
  }

  copyPriceService() {
    if (!this.priceService || !this.priceService.id || this.priceService.id == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn bảng giá cần copy."
      });
      this.isSubmit = false;
      return;
    }
    if (!this.newPriceServiceCode) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "vui lòng nhập mã bảng giá để copy."
      });
      this.isSubmit = false;
      return;
    }

    this.priceServiceService.CopyPriceServiceAsync(this.priceService.id, this.newPriceServiceCode).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Copy bảng giá dịch vụ thành công."
        });
        this.refresh();
        this.newPriceServiceCode = null;
        this.priceService = new PriceService();
        this.selectedPriceService = null;
        this.bsModalRef.hide();
        this.isSubmit = false;
      }
    )
  }

  deletePriceService() {
    this.priceServiceService.deleteAsync(this.priceService).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Hủy bảng giá dịch vụ thàng công."
        });
        this.refresh();
        this.priceService = new PriceService();
        this.bsModalRef.hide();
      }
    )
  }

  openDeleteAreaModel(template: TemplateRef<any>, id: number) {
    let area = this.areas.find(f => f.id == id);
    area.priceServiceId = this.selectedPriceService;
    if (area) {
      this.selectedArea = area;
      this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm thấy dữ liệu"
      });
    }
  }

  openDeleteWeightModel(template: TemplateRef<any>, id: number) {
    let weight = this.weights.find(f => f.id == id);
    weight.priceServiceId = this.selectedPriceService;
    if (weight) {
      this.selectedWeight = weight;
      this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Không tìm tháy dữ liệu"
      });
    }
  }

  confirmDeleteWeight() {
    this.weightService.deleteAWeightAsync(this.selectedWeight).then(
      x => {
        this.onViewPriceListDetail();
        this.bsModalRef.hide();
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: 'Xóa dòng thành công'
        });
        if (this.newWeights.find(f => f.id == this.selectedWeight.id)) {
          this.newWeights.splice(this.newWeights.findIndex(f => f.id == this.selectedWeight.id), 1);
        }
        this.selectedWeight = null;
      }
    );
  }

  confirmDeleteArea() {
    this.areaService.deleteAreaAsync(this.selectedArea).then(
      x => {
        this.onViewPriceListDetail();
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: 'Xóa cột thành công'
        });
        this.bsModalRef.hide();
        if (this.newAreas.find(f => f.id == this.selectedArea.id)) {
          this.newAreas.splice(this.newAreas.findIndex(f => f.id == this.selectedArea.id), 1);
        }
        this.selectedArea = null;
      }
    );
  }

  async SavePriceService() {
    this.messageService.clear();
    if (!this.priceService.code) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã dịch vụ"
      });
      return;
    }
    if (!this.priceService.pricingTypeId) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn tính theo KG/M3/KIEN"
      });
      return;
    }
    if (!this.selectedService) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn dịch vụ"
      });
      return;
    }
    this.priceService.serviceId = this.selectedService;
    this.priceService.publicDateFrom = this.dateFrom ? moment(this.dateFrom).format("YYYY/MM/DD") : null;
    this.priceService.publicDateTo = this.dateTo ? moment(this.dateTo).format("YYYY/MM/DD") : null;
    const data = await this.priceServiceService.updateAsync(this.priceService);
    if (data) {
      this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Cập nhật bảng giá dịch vụ thành công"
      });
    }
  }

  async Save() {
    this.messageService.clear();
    if (!this.priceService.code) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập mã dịch vụ"
      });
      return;
    }
    if (!this.priceService.pricingTypeId) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn tính theo KG/M3/KIEN"
      });
      return;
    }
    if (!this.selectedService) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng chọn dịch vụ"
      });
      return;
    }
    if (!this.priceServiceDetails || this.priceServiceDetails.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Giá chi tiết chưa nhập, không thể lưu"
      });
      return;
    }
    if (this.areaAndSelect.length == 0 || this.dataPriceListDetail.length == 0) {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Vui lòng nhập dữ liệu trước khi lưu"
      });
      return;
    }
    if (this.weights) {
      await this.weightService.updateWeightsAsync(this.weights).then(
        x => {
          this.messageService.add({
            severity: Constant.messageStatus.success,
            detail: "Cập nhật mức cân thành công"
          });
        }
      );
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Mức cân lỗi [Thêm dòng lỗi]"
      });
      return;
    }
    if (this.areaAndSelect) {
      await Promise.all(this.areaAndSelect.map(x => x.provinceIds = x.multiSelectProvinces.map(Number)));
      await this.areaService.updateAreasAsync(this.areas).then(
        x => {
          this.messageService.add({
            severity: Constant.messageStatus.success,
            detail: "Cập nhật khu vực thành công"
          });
        }
      );
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Khu vực lỗi [Thêm cột lỗi]"
      });
      return;
    }

    if (this.areas.length > 0) {
      var area = this.areas[0];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 1) {
      var area = this.areas[1];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 2) {
      var area = this.areas[2];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 3) {
      var area = this.areas[3];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 4) {
      var area = this.areas[4];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //    
    if (this.areas.length > 5) {
      var area = this.areas[5];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //    
    if (this.areas.length > 6) {
      var area = this.areas[6];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //    
    if (this.areas.length > 7) {
      var area = this.areas[7];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 8) {
      var area = this.areas[8];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 9) {
      var area = this.areas[9];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 10) {
      var area = this.areas[10];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 11) {
      var area = this.areas[11];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 12) {
      var area = this.areas[12];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 13) {
      var area = this.areas[13];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    //
    if (this.areas.length > 14) {
      var area = this.areas[14];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 15) {
      var area = this.areas[15];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 16) {
      var area = this.areas[16];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 17) {
      var area = this.areas[17];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 18) {
      var area = this.areas[18];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }


    if (this.areas.length > 19) {
      var area = this.areas[19];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }
    if (this.areas.length > 20) {
      var area = this.areas[20];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 21) {
      var area = this.areas[21];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 22) {
      var area = this.areas[22];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 23) {
      var area = this.areas[23];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 24) {
      var area = this.areas[24];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 25) {
      var area = this.areas[25];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.areas.length > 26) {
      var area = this.areas[26];
      await this.areaService.updateAreaDistrictsAsync(area).then(
        r => {
          if (r)
            this.messageService.add({
              severity: Constant.messageStatus.success,
              detail: "Cập nhật thành công cột: " + area.code
            });
        }
      )
    }

    if (this.priceServiceDetails && this.priceServiceDetails.length > 0) {
      await this.priceServiceDetailService.updatePriceServicesAsync(this.priceServiceDetails).then(
        x => {
          this.messageService.add({
            severity: Constant.messageStatus.success,
            detail: "Cập nhật giá thành công"
          });
          this.newAreas = [];
        }
      );
      this.priceService.publicDateFrom = this.dateFrom ? moment(this.dateFrom).format("YYYY/MM/DD") : null;
      this.priceService.publicDateTo = this.dateTo ? moment(this.dateTo).format("YYYY/MM/DD") : null;
      this.priceService.serviceId = this.selectedService;
      const data = await this.priceServiceService.updateAsync(this.priceService);
      if (data) {
        this.messageService.add({
          severity: Constant.messageStatus.success,
          detail: "Cập nhật bảng giá dịch vụ thành công"
        });
        this.bsModalRef.hide();
        this.isSubmit = false;
      }
    } else {
      this.messageService.add({
        severity: Constant.messageStatus.warn,
        detail: "Cập nhật giá chi tiết không thành công!!!"
      });
      this.isSubmit = false;
    }
  }

  refresh() {
    //refresh
    this.dataPriceListDetail = [];
    this.weights = [];
    this.areas = [];
    this.areaAndPrice = [];
    this.areaAndSelect = [];
    this.selectedPriceService = null;
    this.txtFilterGb = null;
    this.priceServices = null;
    this.priceService = new PriceService(); 
    this.first = 0;
    this.dateFrom = null;
    this.dateTo = null;
    this.isSubmit = false;
    this.isView = false;
  }
  checkNumber(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 32) {
      return false;
    }
    if (charCode === 13 || charCode === 9 || charCode === 8 || charCode === 110 || charCode === 190) {
      return true;
    }
    if (isNaN(event.key)) {
      return false;
    }
    return true;
  }
}

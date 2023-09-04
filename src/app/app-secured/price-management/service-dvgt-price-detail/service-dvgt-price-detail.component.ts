import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
//
import { Constant } from "../../../infrastructure/constant";
import { ServiceDVGTPrice, CalculateBy, CustomerPriceListDVGT, Customer } from "../../../models";
import { LazyLoadEvent } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import {
  FormulaService,
  ServiceDVGTPriceService,
  ServiceDVGTService,
  CalculateByService,
  CustomerPriceListDVGTService,
  CustomerService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { SelectModel } from "../../../models/select.model";
import { PriceListDVGTService } from "../../../services/price-list-dvgt.service";
import { PriceListDVGT } from "../../../models/priceListDVGT.model";
declare var jQuery: any;


@Component({
  selector: "app-service-dvgt-price-detail",
  templateUrl: "service-dvgt-price-detail.component.html",
  styles: []
})
export class ServiceDVGTPriceDetailComponent extends BaseComponent implements OnInit {
  priceListDVGT: PriceListDVGT = new PriceListDVGT();
  priceListDVGTCode: string;
  priceListDVGTCodes: string[] = [];
  allPriceListDVGT: PriceListDVGT[] = [];
  filterServiceDVGT: number;
  allServiceDVGTs: SelectModel[];
  first: number = 0;
  txtFilterGb: any;
  isAddPL: string = "none";
  isSavePL: string = "none";
  parentPage: string = Constant.pages.price.name;
  currentPage: string = Constant.pages.price.children.serviceDVGTPriceDetail.name;
  modalTitle: string;
  bsModalRef: BsModalRef;
  displayDialog: boolean;
  data: ServiceDVGTPrice;
  selectedData: ServiceDVGTPrice;
  isNew: boolean;
  listData: ServiceDVGTPrice[];
  customerCodes: string[] = [];
  customerCode: string;
  customers: Customer[] = [];
  customerPriceListDVGTs: CustomerPriceListDVGT[] = [];
  customerPriceListDVGT: CustomerPriceListDVGT = new CustomerPriceListDVGT();
  //
  columns: string[] = [
    "code",
    "valueFrom",
    "valueTo",
    "price",
    "serviceDVGT.name",
    "formula.name"
  ];
  datasource: ServiceDVGTPrice[] = [];
  totalRecords: number;
  rowPerPage: number = 10;
  event: LazyLoadEvent;
  //
  formulas: SelectModel[];
  selectedFormula: number;
  //
  calculateBys: SelectModel[] = [];
  selectedCalculateBy: number;
  //
  listPriceListDVGT: SelectModel[] = [];
  selectedPriceListDVGT: number;
  //
  serviceDVGTs: SelectModel[];
  selectedServiceDVGT: number;
  constructor(
    private modalService: BsModalService,
    private formulaService: FormulaService,
    protected messageService: MessageService,
    private serviceDVGTPriceService: ServiceDVGTPriceService,
    private serviceDVGTService: ServiceDVGTService,
    public permissionService: PermissionService,
    public router: Router,
    private priceListDVGTService: PriceListDVGTService,
    private calculateByService: CalculateByService,
    private customerPriceListDVGTService: CustomerPriceListDVGTService,
    private customerService: CustomerService
  ) {
    super(messageService, permissionService, router);
  }

  ngOnInit() {
    this.initData();
    this.loadDVGT();
  }

  async initData() {
    this.formulas = await this.formulaService.getAllSelectModelAsync();
    this.calculateBys = await this.calculateByService.getAllSelectModelAsync();
  }
  async loadDVGT() {
    // const data = await this.serviceDVGTService.ge();
    // if (data) {
    //   this.allServiceDVGTs = data;
    // }
  }

  searchByCode(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.allPriceListDVGT = [];
      this.priceListDVGTService.getByCodeAsync(value).then(
        x => {
          if (x) {
            this.allPriceListDVGT = x as PriceListDVGT[];
            this.priceListDVGTCodes = this.allPriceListDVGT.map(f => f.code);
          } else {
            this.priceListDVGTCodes = [];
          }
        }
      );
    }
  }

  changePriceListDVGT(event) {
    this.messageService.clear();
    this.allPriceListDVGT = [];
    this.priceListDVGTService.getByCodeAsync(this.priceListDVGTCode).then(
      x => {
        if (x.length > 0) {
          this.allPriceListDVGT = x as PriceListDVGT[];
          this.priceListDVGT = this.allPriceListDVGT[0];
          this.priceListDVGTCode = this.allPriceListDVGT[0].code;
          this.isAddPL = "none";
          this.isSavePL = "block";
          this.getServiceDVGTPrice(this.priceListDVGT.id);
          this.loadCustomerPriceService(this.priceListDVGT.id);
        } else {
          this.priceListDVGT = new PriceListDVGT();
          this.priceListDVGT.code = this.priceListDVGT.name = this.priceListDVGTCode;
          this.priceListDVGT.vatPercent = 0;
          this.priceListDVGT.numOrder = 0;
          this.priceListDVGT.isPublic = false;
          this.datasource = [];
          this.isAddPL = "block";
          this.isSavePL = "none";
        }
      }
    );
  }

  selectPriceListDVGT(event) {
    this.messageService.clear();
    let findPL = this.allPriceListDVGT.find(f => f.code == event);
    if (findPL) {
      this.priceListDVGT = findPL;
      this.isAddPL = "none";
      this.isSavePL = "block";
      this.getServiceDVGTPrice(this.priceListDVGT.id);
      this.loadCustomerPriceService(this.priceListDVGT.id);
    } else {
      this.priceListDVGT = new PriceListDVGT();
      this.priceListDVGT.code = this.priceListDVGT.name = event.query;
      this.priceListDVGT.vatPercent = 0;
      this.priceListDVGT.numOrder = 0;
      this.priceListDVGT.isPublic = false;
      this.isAddPL = "block";
      this.isSavePL = "none";
    }
  }

  async savePriceDVGT() {
    this.messageService.clear();
    if (!this.priceListDVGTCode) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập mã bảng giá DVGT.' });
      return;
    }
    if (!this.priceListDVGT.serviceId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn dịch vụ.' });
      return;
    }
    this.priceListDVGT.name = this.priceListDVGT.code = this.priceListDVGTCode;
    if (!this.priceListDVGT.isPublic) this.priceListDVGT.isPublic = false;
    if (!this.priceListDVGT.vatPercent) this.priceListDVGT.vatPercent = 0;
    if (!this.priceListDVGT.numOrder) this.priceListDVGT.numOrder = 0;
    await this.priceListDVGTService.updateAsync(this.priceListDVGT).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Lưu bảng giá DVGT thành công.' });
        this.priceListDVGT = x.data as PriceListDVGT;
      }
    )
    await this.datasource.forEach(
      async element => {
        if (element.id) {
          await this.serviceDVGTPriceService.updateAsync(element).then(
            x => {
              if (!this.isValidResponse(x)) return;
              this.messageService.add({ severity: Constant.messageStatus.success, detail: `Lưu thành công dòng từ ${element.valueFrom} - ${element.valueTo}.` });
              element = x.data;
            }
          )
        } else {
          await this.serviceDVGTPriceService.createAsync(element).then(
            x => {
              if (!this.isValidResponse(x)) return;
              this.messageService.add({ severity: Constant.messageStatus.success, detail: `Tạo mới thành công dòng từ ${element.valueFrom} - ${element.valueTo}.` });
              element = x.data;
            }
          )
        }
      }
    )
  }

  createPriceDVGT() {
    this.messageService.clear();
    if (!this.priceListDVGTCode) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập mã bảng giá DVGT.' });
      return;
    }
    if (!this.priceListDVGT.serviceId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn dịch vụ.' });
      return;
    }
    this.priceListDVGT.name = this.priceListDVGT.code = this.priceListDVGTCode;
    if (!this.priceListDVGT.isPublic) this.priceListDVGT.isPublic = false;
    if (!this.priceListDVGT.vatPercent) this.priceListDVGT.vatPercent = 0;
    if (!this.priceListDVGT.numOrder) this.priceListDVGT.numOrder = 0;
    this.priceListDVGTService.createAsync(this.priceListDVGT).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Tạo mới bảng giá DVGT thành công.' });
        this.priceListDVGT = x.data as PriceListDVGT;
        this.priceListDVGTCode = this.priceListDVGT.code;
        this.isAddPL = "none";
        this.isSavePL = "block";
      }
    )
  }

  async getServiceDVGTPrice(id: any) {
    if (!this.priceListDVGT.id) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn bảng giá DVGT.' });
      return;
    }
    this.serviceDVGTPriceService.getByPriceListDVGTAsync(this.priceListDVGT.id).then(
      x => {
        if (x.length > 0) {
          this.datasource = x;
        } else {
          this.datasource = [];
          this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Chi tiết bảng giá trống!' });
          return;
        }
      }
    )
  }

  refresh() {
    this.initData();
    this.first = 0;
  }

  //
  openDeleteModel(template: TemplateRef<any>, data: ServiceDVGTPrice) {
    this.selectedData = data;
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s"
    });
  }

  addRoww() {
    this.messageService.clear();
    if (!this.priceListDVGT) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng tạo bảng giá DVGT trước.' });
      return;
    }
    if (!this.priceListDVGT.id) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng lưu bảng giá DVGT trước.' });
      return;
    }
    let serviceDVGTPrice = new ServiceDVGTPrice();
    serviceDVGTPrice.valueFrom = 0;
    serviceDVGTPrice.valueTo = 0;
    serviceDVGTPrice.valuePlus = 0;
    serviceDVGTPrice.price = 0;
    serviceDVGTPrice.priceListDVGTId = this.priceListDVGT.id;
    this.datasource.push(serviceDVGTPrice);
  }

  delete(row: ServiceDVGTPrice) {
    this.messageService.clear();
    if (row.id) {
      this.serviceDVGTPriceService.deleteAsync(row).then(
        x => {
          if (!this.isValidResponse(x)) return;
          this.datasource.splice(this.datasource.findIndex(f => f == row), 1);
          this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Xóa data [dòng] thành công.' });
        }
      )
    } else {
      this.datasource.splice(this.datasource.findIndex(f => f == row), 1);
      this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Xóa data thành công.' });
    }
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
  //
  searchCustomer(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.allPriceListDVGT = [];
      this.customerService.searchByNamePaging(value).then(
        x => {
          if (x) {
            this.customers = x as Customer[];
            this.customerCodes = this.customers.map(f => f.code);
          } else {
            this.customerCodes = [];
          }
        }
      );
    }
  }

  enterCustomer(event) {
    this.messageService.clear();
    if (!this.priceListDVGT) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn bảng giá DVGT.' });
      return;
    }
    this.customerService.searchByNamePaging(this.customerCode).then(
      x => {
        if (x && x.length) {
          let findC = x[0];
          if (!this.customerPriceListDVGTs.find(f => f.customerId == findC.id)) {
            let customerPriceListDVGT = new CustomerPriceListDVGT();
            customerPriceListDVGT.customerId = findC.id;
            customerPriceListDVGT.priceListDVGTId = this.priceListDVGT.id;
            this.customerPriceListDVGTService.createAsync(customerPriceListDVGT).then(
              x => {
                if (!this.isValidResponse(x)) return;
                customerPriceListDVGT = x.data;
                customerPriceListDVGT.customer = findC;
                this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Áp khách hàng thành công.' });
                this.customerPriceListDVGTs.push(x.data);
                this.customerCode = null;
                this.customerCodes = [];
              }
            );
          } else {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Khách hàng này đã được áp trước đó.' });
          }
        } else {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy thông tin khách hàng.' });
        }
      }
    );
  }

  selectCustomer(event) {
    if (!this.priceListDVGT) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng chọn bảng giá DVGT.' });
      return;
    }
    let findC = this.customers.find(f => f.code == event);
    if (findC) {
      if (!this.customerPriceListDVGTs.find(f => f.customerId == findC.id)) {
        let customerPriceListDVGT = new CustomerPriceListDVGT();
        customerPriceListDVGT.customerId = findC.id;
        customerPriceListDVGT.priceListDVGTId = this.priceListDVGT.id;
        this.customerPriceListDVGTService.createAsync(customerPriceListDVGT).then(
          x => {
            if (!this.isValidResponse(x)) return;
            customerPriceListDVGT = x.data;
            customerPriceListDVGT.customer = findC;
            this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Áp khách hàng thành công.' });
            this.customerPriceListDVGTs.push(x.data);
            this.customerCode = null;
          }
        );
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Khách hàng này đã được áp trước đó.' });
      }
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Không tìm thấy thông tin khách hàng.' });
    }
  }

  loadCustomerPriceService(id: number) {
    this.customerPriceListDVGTService.getByPriceListDVGTasync(id, ).then(
      x => {
        if (x) {
          this.customerPriceListDVGTs = x;
        } else {
          this.customerPriceListDVGTs = [];
        }
      }
    );
  }

  deleteCPLDVGT(row: CustomerPriceListDVGT) {
    this.messageService.clear();
    this.customerPriceListDVGTService.deleteAsync(row).then(
      x => {
        if (!this.isValidResponse(x)) return;
        this.customerPriceListDVGTs.splice(this.customerPriceListDVGTs.findIndex(f => f == row), 1);
        this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Hủy áp khách hàng thành công.' });
      }
    )
  }
}

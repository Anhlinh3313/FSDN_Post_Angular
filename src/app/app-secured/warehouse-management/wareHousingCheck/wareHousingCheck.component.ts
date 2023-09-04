import { Component, OnInit, ElementRef, ViewChild, TemplateRef } from "@angular/core";
import {
  ShipmentService,
  CustomerService,
  AuthService,
  ListGoodsService,
  ProvinceService,
  DistrictService,
  WardService,
  ServiceService,
  PackTypeService,
  BoxService,
  PriceService,
  FormPrintService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { environment } from "../../../../environments/environment";
import { SelectModel } from "../../../models/select.model";
import { Shipment, CreateListGoods, Boxes, DataPrint, Customer } from "../../../models";
import { Constant } from "../../../infrastructure/constant";
import { AssignShipmentWarehousing } from "../../../models/assignShipmentWarehousing.model";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { AutoComplete, SelectItem } from "../../../../../node_modules/primeng/primeng";
import { PrintHelper } from "../../../infrastructure/printHelper";
import { PrintFrormServiceInstance } from "../../../services/printTest.serviceInstace";
import { GeneralInfoModel } from "../../../models/generalInfo.model";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { SignalRService } from "../../../services/signalR.service";
import { SeriNumberViewModel } from "../../../view-model/SeriNumber.viewModel";
import { ListGoodsTypeHelper } from "../../../infrastructure/listGoodsType.helper";
import { ListGoods } from "../../../models/listGoods.model";
import { ArrayHelper } from "../../../infrastructure/array.helper";
import { BsModalService } from "ngx-bootstrap";
import { BsModalRef } from "ngx-bootstrap/modal";
import { ShipmentCalculateViewModel, FromPrintViewModel } from "../../../view-model";
import { HubConnection } from "@aspnet/signalr";
//////////////

@Component({
  selector: "app-inventory",
  templateUrl: "wareHousingCheck.component.html",
  styles: [
    ``
  ]
})
export class WareHousingCheckComponent extends BaseComponent implements OnInit {
  //#region params
  textConfiemAndNotPrint: string = "Xác nhận và không in";
  //#endregion
  localStorageListGoods: string = "localStorageListGoods"; // local storage BK NK lấy hàng
  listGoodsCreated: ListGoods;
  hubConnection: HubConnection;
  // [x: string]: any;
  hub = environment;
  itemShipment: any = [];
  checkDeviveryThreeTimes: boolean;
  txtFilterGb: any;
  customers: any[];
  selectedCustomer: number;
  customer: string;
  filteredCustomers: string[] = [];
  shopCode: string;
  shopCodes: string[];
  listShipmentShopCodes: Shipment[];
  shipment: Shipment = new Shipment();
  shipmentNumber: string;
  checkSubmit: boolean;
  isScanShopCode: any = true;
  isScanAccept: any = false;
  isAcceptWeightChange: any = false;
  idPrint: string;
  generalInfo: GeneralInfoModel;
  bsModalRef: BsModalRef;
  //  
  packTypes: SelectItem[];
  selectedPackType: number;
  selectedWeight: number = 0;
  selectedLength: number = 0;
  selectedWidth: number = 0;
  selectedHeight: number = 0;
  DIM = 0;
  //
  localStorageWeightChange: string = "WeightChange";
  localStorageShopCodeChange: string = "ShopCodeChange";
  localStorageScanAcceptChange: string = "ScanAcceptChange";
  //
  parentPage: string = Constant.pages.warehouse.name;
  currentPage: string = Constant.pages.warehouse.children.wareHousingCheck.name;
  //  
  @ViewChild("txtShipment") txtShipmentRef: ElementRef;
  @ViewChild("txtTotalBox") txtTotalBoxRef: ElementRef;
  @ViewChild("txtWeight") txtWeightRef: ElementRef;
  @ViewChild("atcShopCode") atcShopCodeRef: AutoComplete;
  //
  columns: string[] = [];
  //
  toProvinces: SelectModel[] = [];
  toDistricts: SelectModel[] = [];
  toWards: SelectModel[] = [];
  services: SelectModel[] = [];
  totalBoxes: Boxes[] = []; // tổng số box của vận đơn
  boxes: Boxes = new Boxes(); // box
  totalCalWeightBoxes: number = 0; // trong lượng tính cước
  totalWeightBoxes: number = 0; // trong lượng thực tế của Box
  totalDimWeightBoxes: number = 0; // trong lượng thực tế của Box

  constructor(
    private listGoodsService: ListGoodsService,
    protected messageService: MessageService,
    protected serviceService: ServiceService,
    protected packTypeService: PackTypeService,
    protected wardService: WardService,
    protected districtService: DistrictService,
    protected provinceService: ProvinceService,
    protected customerService: CustomerService,
    protected shipmentService: ShipmentService,
    public permissionService: PermissionService,
    private generalInfoService: GeneralInfoService,
    public router: Router,
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected signalRService: SignalRService,
    protected authService: AuthService,
    protected modalService: BsModalService,
    protected boxService: BoxService,
    protected priceService: PriceService,
    protected formPrintService: FormPrintService,
  ) {
    super(messageService, permissionService, router);
  }
  ngOnInit() {
    this.loadGeneralInfo();
    this.initData();
    this.hubConnect();
  }

  async hubConnect() {
    this.hubConnection = await this.signalRService.Connect();

    this.hubConnection.on("WeighingScaleChange", res => {
      let seriNumberViewModel = res.data as SeriNumberViewModel;
      this.authService.getAccountInfoAsync().then(x => {
        let user = x;
        if (seriNumberViewModel.seriNumber == user.seriNumber) {
          this.shipment.weight = seriNumberViewModel.weight;
          this.weightChangeSubmit();
        }
      });
    });
  }

  initData() {
    //
    this.columns.push(Constant.classes.includes.shipment.shipmentStatus);
    this.columns.push(Constant.classes.includes.shipment.toProvince);
    this.columns.push(Constant.classes.includes.shipment.toDistrict);
    this.columns.push(Constant.classes.includes.shipment.toWard);
    this.columns.push(Constant.classes.includes.shipment.service);
    //
    let a = localStorage.getItem(this.localStorageWeightChange);
    if (localStorage.getItem(this.localStorageWeightChange)) {
      this.isAcceptWeightChange = localStorage.getItem(this.localStorageWeightChange);
    } else {
      localStorage.setItem(this.localStorageWeightChange, JSON.stringify(this.isAcceptWeightChange));
    }
    if (localStorage.getItem(this.localStorageShopCodeChange)) {
      this.isScanShopCode = localStorage.getItem(this.localStorageShopCodeChange);
    } else {
      localStorage.setItem(this.localStorageShopCodeChange, JSON.stringify(this.isScanShopCode));
    }
    if (localStorage.getItem(this.localStorageScanAcceptChange)) {
      this.isScanAccept = localStorage.getItem(this.localStorageScanAcceptChange);
    } else {
      localStorage.setItem(this.localStorageScanAcceptChange, JSON.stringify(this.isScanAccept));
    }
    //
    this.loadProvince();
    this.loadService();
    this.loadPackType();
    this.getLocalStorageListGoods();
    this.refresh();
  }

  async loadBoxes(id: number) {
    this.totalBoxes = await this.boxService.getByShipmentIdAsync(id);
  }

  // filterCustomers(event) {
  //   let value = event.query;
  //   if (value.length >= 2) {
  //     this.customerService.getSearchByValue(value, 0).toPromise().then(
  //       x => {
  //         if (x.isSuccess == true) {
  //           this.customers = [];
  //           this.filteredCustomers = [];
  //           x.data.map(m => {
  //             this.customers.push(m)
  //             this.filteredCustomers.push(m.code);
  //           })
  //         }
  //       }
  //     )
  //   }
  // }

  //filter Customers
  filterCustomers(event) {
    let value = event.query;
    if (value.length >= 2) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            let data = (x.data as Customer[]);
            data.map(m => {
              this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
              this.filteredCustomers.push(`${m.code} ${m.name}`);
            });
          }
        }
      );
    }
  }


  keyTabSender(event) {
    let value = event.target.value;
    if (this.customer) {
      this.customerService.getByCustomerCodeAsync(value, null, 10, 1, null).then(
        x => {
          if (x.isSuccess == true) {
            this.customers = [];
            this.filteredCustomers = [];
            let data = (x.data as Customer[]);
            data.map(m => {
              this.customers.push({ value: m.id, label: `${m.code} ${m.name}`, data: m })
              this.filteredCustomers.push(`${m.code} ${m.name}`);
            });
            let findCus: SelectModel = null;
            if (this.customers.length == 1) {
              findCus = this.customers[0];
            } else {
              findCus = this.customers.find(f => f.data.code == value || f.label == value);
            }
            if (findCus) {
              this.selectedCustomer = findCus.value;
              this.customer = findCus.label;
            }
          } else {
            this.selectedCustomer = null;
            this.customer = null;
          }
        }
      );
    }
  }

  onSelectedCustomer() {
    let customer = this.customers.find(f => f.data.code == this.customer || f.label == this.customer);
    if (customer) {
      this.selectedCustomer = customer.value;
    }
  }

  openModelBox(template: TemplateRef<any>) {
    if (!this.shipment.shipmentNumber) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Thông tin vận đơn trống, không thể nhập kiện!" });
      return;
    }
    setTimeout(() => {
      var element = document.getElementById('txtLenght') as HTMLInputElement;
      element.focus();
      element.select();
    }, 0);
    //this.resetBoxs();
    this.bsModalRef = this.modalService.show(template, {
      class: "inmodal animated bounceInRight modal-s width-700"
    });
  }

  async loadDIM() {
    if (this.shipment) {
      this.messageService.clear();
      let model: ShipmentCalculateViewModel = new ShipmentCalculateViewModel();
      model.fromDistrictId = this.shipment.fromDistrictId;
      model.fromWardId = this.shipment.fromWardId;
      model.senderId = this.shipment.senderId;
      model.serviceId = this.shipment.serviceId;
      model.toDistrictId = this.shipment.toDistrictId;
      model.weight = this.shipment.weight;
      model.isAgreementPrice = false;
      model.toWardId = this.shipment.toWardId;
      let price = await this.priceService.calculateAsync(model);
      if (price && price.priceService) {
        this.DIM = price.priceService.dim;
      }
    } else {
      this.DIM = 0;
    }
  }

  resetBoxs() {
    this.shipment.totalBox = this.totalBoxes.length;
    this.totalDimWeightBoxes = 0;
    this.totalWeightBoxes = 0;
    this.totalCalWeightBoxes = 0;
    this.totalBoxes.map(
      m => {
        let dimW = m.calWeight ? m.calWeight : 0;
        let w = m.weight ? m.weight : 0;
        this.totalDimWeightBoxes += Number(dimW);
        this.totalWeightBoxes += Number(w);
        if (w > dimW) this.totalCalWeightBoxes += w;
        else this.totalCalWeightBoxes += dimW;
      }
    )
    //    
    this.totalDimWeightBoxes = Number(this.totalDimWeightBoxes.toFixed(3));
    //
    this.totalCalWeightBoxes = Number(this.totalCalWeightBoxes.toFixed(3));
    this.shipment.calWeight = this.totalCalWeightBoxes;
    //
    this.totalWeightBoxes = Number(this.totalWeightBoxes.toFixed(3));
    this.shipment.weight = this.totalWeightBoxes;
  }

  createBox() {
    if (!this.shipment) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Thông tin vận đơn trống, không thể nhập kiện' });
      return;
    }
    if (!this.boxes.length || !this.boxes.width || !this.boxes.height) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập kích thước kiện' });
      return;
    }
    if (!this.boxes.weight) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Vui lòng nhập trọng lượng kiện' });
      return;
    }
    if (!this.DIM) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Số chia quy đổi không hợp lệ' });
      return;
    }
    this.boxes.shipmentId = this.shipment.id;
    this.boxes.calWeight = Number((this.DIM * this.boxes.length * this.boxes.width * this.boxes.height).toFixed(3));
    this.boxes.packTypeId = this.selectedPackType;
    this.boxService.createAsync(this.boxes).then(x => {
      if (x) {
        this.totalBoxes.unshift(x as Boxes);
        this.resetBoxs();
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Tạo kiện lỗi' });
        return;
      }
    });
  }

  deleteBox(data: Boxes) {
    if (data) {
      this.boxService.deleteAsync(data).then(
        x => {
          if (x) {
            this.resetBoxs();
            this.messageService.add({ severity: Constant.messageStatus.success, detail: 'Xóa kiện thành công' });
            let find = this.totalBoxes.findIndex(f => f.id == x.id);
            if (find || find == 0) {
              if (find >= 0) { this.totalBoxes.splice(find, 1); }
            }
          } else {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Xóa kiện không thành công' });
          }
        }
      )
    }
  }

  async loadPackType() {
    this.packTypes = [];
    this.selectedPackType = null;
    this.packTypes = await this.packTypeService.getAllSelectModelAsync();
    this.selectedPackType = this.packTypes[1].value;
  }

  loadService() {
    this.serviceService.getAllSelectModelAsync().then(
      x => {
        this.services = x;
      }
    )
  }
  loadProvince() {
    this.provinceService.getAllSelectModelAsync().then(
      x => {
        this.toProvinces = x;
      }
    )
  }
  loadDistrict() {
    if (this.shipment.toProvinceId) {
      this.districtService.getDistrictByProvinceIdAsync(this.shipment.toProvinceId).then(
        x => {
          this.toDistricts = [];
          this.toDistricts.push({ value: null, label: `-- Chọn quận/huyện --` });
          x.map(m => { this.toDistricts.push({ value: m.id, label: `${m.code} - ${m.name}` }) });
        }
      )
    }
  }
  loadWard() {
    if (this.shipment.toDistrictId) {
      this.wardService.getWardByDistrictIdAsync(this.shipment.toDistrictId).then(
        x => {
          this.toWards = [];
          this.toWards.push({ value: null, label: `-- Chọn phường/xã --` });
          x.map(m => { this.toWards.push({ value: m.id, label: `${m.code} - ${m.name}` }) });
        }
      )
    }
  }
  onToProvinceChange() {
    this.loadDistrict();
    this.shipment.toDistrictId = null;
  }

  onToDistrictChange() {
    this.loadWard();
    this.shipment.toWardId = null;
  }

  searchShopCode(event) {
    let value = event.query;
    if (value.length >= 1) {
      this.shipmentService.getByShopCodeFirstAsync(value, this.selectedCustomer, this.columns).then(
        x => {
          this.shopCodes = [];
          this.listShipmentShopCodes = x as Shipment[];
          this.listShipmentShopCodes.forEach(element => {
            this.shopCodes.push(element.shopCode);
          });
        }
      );
    }
  }

  async keyUpEnter(event) {
    if (event.code == 'Enter') {
      let value = event.currentTarget.value.toUpperCase();
      if (value.length >= 1) {
        await this.shipmentService.getByShopCodeFirstAsync(value, this.selectedCustomer, this.columns).then(
          x => {
            this.shopCodes = [];
            this.listShipmentShopCodes = x as Shipment[];
            let shipment = this.listShipmentShopCodes.find(f => (f.senderId == this.selectedCustomer || !this.selectedCustomer)
              && f.shopCode.toUpperCase().indexOf(value) >= 0);
            if (shipment) {
              this.shopCode = shipment.shopCode;
              this.shipment = shipment;
              this.shipmentNumber = this.shipment.shipmentNumber;
              this.txtTotalBoxRef.nativeElement.focus();
              this.txtTotalBoxRef.nativeElement.select();
              this.shipment.toDistrictId = shipment.toDistrictId;
              this.shipment.toWardId = shipment.toWardId;
              this.loadDistrict();
              this.loadWard();
              this.loadBoxes(this.shipment.id);
              this.loadDIM();
            } else {
              this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy thông tin theo số tham chiếu!" });
              SoundHelper.getSoundMessage(Constant.messageStatus.warn);
              this.refresh();
              return;
            }
          }
        );
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Số tham chiếu phải ít nhất 5 ký tự!" });
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
        this.refresh();
        return;
      }
    }
  }

  onSelectedShopCode(event) {
    let value = event;
    this.findShipmentNumber(value);
  }

  async findShipmentNumber(value: string) {
    if (!this.listShipmentShopCodes) {
      if (value.length >= 4) {
        await this.shipmentService.getByShopCodeAsync(value, this.selectedCustomer, this.columns).then(
          x => {
            this.shopCodes = [];
            this.listShipmentShopCodes = x as Shipment[];
            this.listShipmentShopCodes.forEach(element => {
              this.shopCodes.push(element.shopCode);
            });
            if (this.shopCodes.length == 0) {
              this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy thông tin theo số tham chiếu!" });
              SoundHelper.getSoundMessage(Constant.messageStatus.warn);
              this.refresh();
              return;
            }
          }
        );
      } else {
        this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Số tham chiếu phải ít nhất 5 ký tự!" });
        SoundHelper.getSoundMessage(Constant.messageStatus.warn);
        this.refresh();
        return;
      }
    }
    let shipment = this.listShipmentShopCodes.find(f => (f.senderId == this.selectedCustomer || !this.selectedCustomer)
      && f.shopCode.toUpperCase().indexOf(value) >= 0);
    if (shipment) {
      this.shopCode = shipment.shopCode;
      this.shipment = shipment;
      this.shipmentNumber = this.shipment.shipmentNumber;
      this.txtTotalBoxRef.nativeElement.focus();
      this.txtTotalBoxRef.nativeElement.select();
      this.loadDistrict();
      this.loadWard();
      this.loadBoxes(this.shipment.id);
      this.loadDIM();
    } else {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy thông tin theo số tham chiếu!" });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.refresh();
      return;
    }
  }

  changeShipmentNumber(event) {
    if (event.code == 'Enter') {
      let value = event.currentTarget.value;
      this.viewShipment(value);
    }
  }

  changeTotalBox() {
    if (!this.shipment.totalBox) this.shipment.totalBox = 1;
    this.txtWeightRef.nativeElement.focus();
    this.txtWeightRef.nativeElement.select();
  }

  viewShipment(shipmentNumber: string) {
    this.shipmentService.getOnlyShipmentAsync(shipmentNumber, this.columns).then(
      x => {
        if (x) {
          this.shipment = x;
          this.shopCode = this.shipment.shopCode;
          this.txtTotalBoxRef.nativeElement.focus();
          this.txtTotalBoxRef.nativeElement.select();
          this.loadDistrict();
          this.loadWard();
          this.loadBoxes(this.shipment.id);
          this.loadDIM();
        } else {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không tìm thấy thông tin vận đơn!" });
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.refresh();
          return;
        }
      }
    );
  }

  async wareHousingShipment() {
    if (this.checkSubmit == true) return;
    this.messageService.clear();
    this.checkSubmit = true;
    if (!this.shipment.shipmentNumber) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Thông tin vận đơn trống, vui lòng kiểm tra lại!" });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.refresh();
      return;
    }
    if (!this.shipment.totalBox || this.shipment.totalBox == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng kiểm tra lại số kiện!" });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.checkSubmit = false;
      return;
    }
    if (!this.shipment.weight || this.shipment.weight == 0) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng kiểm tra lại trọng lượng!" });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.checkSubmit = false;
      return;
    }
    if (!this.shipment.serviceId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng kiểm tra lại dịch vụ!" });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.checkSubmit = false;
      return;
    }
    if (!this.shipment.toProvinceId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng kiểm tra lại tỉnh/thành phát!" });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.checkSubmit = false;
      return;
    }
    if (!this.shipment.toDistrictId) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Vui lòng kiểm tra lại quận/huyện phát!" });
      SoundHelper.getSoundMessage(Constant.messageStatus.warn);
      this.checkSubmit = false;
      return;
    }
    if (!this.listGoodsCreated) {
      let modelListGoods: CreateListGoods = new CreateListGoods();
      modelListGoods.typeWarehousing = ListGoodsTypeHelper.receiptPickup;
      await this.listGoodsService.createListGoodsAsync(modelListGoods).then(
        x => {
          if (x.isSuccess == true) {
            this.listGoodsCreated = x.data as ListGoods;
          } else {
            this.messageService.add({ severity: Constant.messageStatus.warn, detail: 'Tạo bảng kê nhập kho không thành công [BKLH].' });
            return;
          }
        }
      )
    }
    let model: AssignShipmentWarehousing = new AssignShipmentWarehousing();
    model.ShipmentNumber = this.shipment.shipmentNumber;
    model.listGoodsId = this.listGoodsCreated.id;
    model.typeWarehousing = ListGoodsTypeHelper.receiptPickup;
    model.Cols = this.columns.join(",");
    model.totalBox = this.shipment.totalBox;
    model.weight = this.shipment.weight;
    model.calWeight = this.shipment.calWeight;
    model.isCheck = true;
    model.note = this.shipment.note;
    model.toProvinceId = this.shipment.toProvinceId;
    model.toDistrictId = this.shipment.toDistrictId;
    model.toWardId = this.shipment.toWardId;
    model.serviceId = this.shipment.serviceId;
    model.content = this.shipment.content;
    model.cusNote = this.shipment.cusNote;
    model.length = this.shipment.length;
    model.width = this.shipment.width;
    model.height = this.shipment.height;
    model.doc = this.shipment.doc;
    model.boxes = this.shipment.boxes;

    this.shipmentService.receiptWarehousingAsync(model).then
      (async x => {
        if (!this.isValidResponse(x)) {
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.refresh();
          return;
        }
        if (x.message == "RequestShipment") {
          this.messageService.add({
            severity: Constant.messageStatus.warn, detail: `Vận đơn tổng, không cho phép nhập kho`,
          });
          SoundHelper.getSoundMessage(Constant.messageStatus.warn);
          this.refresh();
          return;
        }
        this.messageService.add({
          severity: Constant.messageStatus.success, detail: "Nhập kho kiểm soát thành công",
        });
        // set localStorage
        const timestamp: any = new Date().getTime();
        const dataStore: any = JSON.stringify({
          listGoodsCreated: this.listGoodsCreated,
          timestamp: timestamp
        });
        localStorage.setItem(this.localStorageListGoods, dataStore);
        SoundHelper.getSoundMessage(Constant.messageStatus.success);
        if (this.isScanAccept) {
          //
          var dataSelected: any;
          var dataBox: any;
          let printSelectedData = [];
          if (this.shipment) {
            //printSelectedData.push(this.shipment);
            dataSelected = await this.shipmentService.getShipmentToPrintAsync([this.shipment.id]).then(
              async ship => {
                dataSelected = ship;
                if (dataSelected) {
                  printSelectedData.push(dataSelected);
                  dataBox = await this.shipmentService.getBoxesAsync([this.shipment.id]);
                  if (dataBox) {
                    if (!ArrayHelper.isNullOrZero(dataBox)) {
                      dataSelected.forEach(shipment => {
                        shipment.boxes = [];
                        dataBox.forEach(box => {
                          if (box.shipmentId === shipment.id) {
                            shipment.boxes.push(box);
                          }
                        });
                      });
                    } else {
                      dataSelected.forEach(shipment => {
                        shipment.boxes = [];
                      });
                    }
                  }
                  if (!ArrayHelper.isNullOrZero(dataSelected)) {
                    this.itemShipment = [];
                    dataSelected[0].fakeId = "id" + this.shipment.id;
                    //================
                    this.itemShipment.companyName = this.generalInfo.companyName.toLocaleUpperCase();
                    this.itemShipment.logoUrl = this.generalInfo.logoUrl;
                    this.itemShipment.hotLine = this.generalInfo.hotLine;
                    this.itemShipment.centerHubAddress = this.generalInfo.addressMain;
                    this.itemShipment.website = this.generalInfo.website;
                    this.itemShipment.policy = this.generalInfo.policy;
                    //================
                    this.itemShipment.push(dataSelected[0]);
                  }
                }
              }
            )
          }
          //
          this.idPrint = PrintHelper.printCreateMultiShipment;
          if (this.itemShipment) {
            let dataPrint: DataPrint = new DataPrint();
            dataPrint.dataPrints = this.itemShipment; //this.cloneSelectData;
            await this.formPrintService.getFormPrintA5Async(this.shipment.senderId).then(
              x => {
                if (!this.isValidResponse(x)) return;
                let resultFormPrint = x.data as FromPrintViewModel;
                dataPrint.formPrint = resultFormPrint.formPrintBody;
                setTimeout(() => {
                  this.printFrormServiceInstance.sendCustomEvent(dataPrint);
                }, 0);
              }
            );
          }
          // setTimeout(() => {
          //   this.printFrormServiceInstance.sendCustomEvent(this.itemShipment);
          // }, 0);
        }
        this.refresh();
      });
  }

  async loadGeneralInfo() {
    this.generalInfo = await this.generalInfoService.getAsync();
  }

  refresh() {
    this.shipmentNumber = "";
    this.shopCode = "";
    this.checkSubmit = false;
    this.shipment = new Shipment();
    this.totalBoxes = [];
    this.boxes = new Boxes();
    if (this.isScanShopCode == true) {
      this.atcShopCodeRef.domHandler.findSingle(this.atcShopCodeRef.el.nativeElement, 'input').focus();
      this.atcShopCodeRef.domHandler.findSingle(this.atcShopCodeRef.el.nativeElement, 'input').select();
    } else {
      this.txtShipmentRef.nativeElement.focus();
      this.txtShipmentRef.nativeElement.select();
    }
  }

  changeWeight(event) {
    if (event.code == 'Enter') {
      this.weightChangeSubmit();
    }
  }

  weightChangeSubmit() {
    if (this.isAcceptWeightChange == true) {
      this.wareHousingShipment();
    }
  }

  changeIsShopCode() {
    localStorage.setItem(this.localStorageShopCodeChange, JSON.stringify(this.isScanShopCode));
  }

  changeIsWeight() {
    localStorage.setItem(this.localStorageWeightChange, JSON.stringify(this.isAcceptWeightChange));
  }

  changeScanAccept() {
    localStorage.setItem(this.localStorageScanAcceptChange, JSON.stringify(this.isScanAccept));
  }

  getLocalStorageListGoods() {
    // get localStorage
    const hours: number = 2; // reset when storage is more than 2 hours
    const getLocalStorage: any = localStorage.getItem(this.localStorageListGoods);
    let timestamp: number = 0;
    const now: number = new Date().getTime();
    if (getLocalStorage) {
      const data: any = JSON.parse(getLocalStorage);
      timestamp = data.timestamp as number;
      if ((now - timestamp) >= hours * 60 * 60 * 1000) {
        localStorage.removeItem(this.localStorageListGoods);
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Đã hết phiên nhập kho lấy hàng, quét vận đơn để tạo BK mới!"
        });
      } else {
        this.listGoodsCreated = data.listGoodsCreated;
      }
    }
  }

  keyTabTotalBox() {
    if (!this.shipment.totalBox) this.shipment.totalBox = 1;
  }

  keyTabBoxWeight() {
    if (this.DIM) {
      let cal: number = 0;
      if (!this.shipment.length) this.shipment.length = 0;
      if (!this.shipment.width) this.shipment.width = 0;
      if (!this.shipment.height) this.shipment.height = 0;
      this.shipment.calWeight = parseFloat(this.shipment.length.toString()) * parseFloat(this.shipment.width.toString()) * parseFloat(this.shipment.height.toString()) * this.DIM;
    } else {
      this.shipment.calWeight = 0;
    }
    if (!this.shipment.totalBox) this.shipment.totalBox = 1;
    this.hideBox();
  }

  hideBox() {
    this.txtTotalBoxRef.nativeElement.focus();
    this.txtTotalBoxRef.nativeElement.select();
    this.bsModalRef.hide();
  }

  refreshSessionListGoods() {
    this.listGoodsCreated = null;
    // remove local storage
    localStorage.removeItem(this.localStorageListGoods);
  }

  boxs: Boxes = new Boxes();
  dim: number;

  addBox(isClose: boolean) {
    if (!this.shipment.boxes) this.shipment.boxes = [];
    if ((this.dim || this.dim == 0) && this.boxs.length && this.boxs.width && this.boxs.height) {
      let cal: number = 0;
      if (!this.boxs.length) this.boxs.length = 0;
      if (!this.boxs.width) this.boxs.width = 0;
      if (!this.boxs.height) this.boxs.height = 0;
      var excWeight = parseFloat(this.boxs.length.toString()) * parseFloat(this.boxs.width.toString()) * parseFloat(this.boxs.height.toString()) * this.dim;
      this.boxs.excWeight = this.route(excWeight);
    } else {
      this.boxs.excWeight = 0;
    }
    //
    let findIndexBox = this.shipment.boxes.findIndex(f => f.id == this.boxs.id);
    if (this.boxs.id && findIndexBox >= 0) {
      let box = this.shipment.boxes[findIndexBox];
      box = this.cloneBox(this.boxs);
    } else {
      let box = this.cloneBox(this.boxs);
      this.shipment.boxes.push(box);
    }
    //
    this.boxs = new Boxes();
    this.changeBox();
    if (isClose) {
      this.hideBox();
    } else {
      setTimeout(() => {
        var atcServiceDVGT = $("#txtLenght");
        atcServiceDVGT.focus();
        atcServiceDVGT.select();
      }, 0);
    }
  }

  cloneBox(model: Boxes): Boxes {
    let data = new Boxes();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  changeBox() {
    this.shipment.weight = 0;
    this.shipment.calWeight = 0;
    this.shipment.excWeight = 0;
    this.shipment.totalBox = 1;
    if (this.shipment.boxes && this.shipment.boxes.length > 0) {
      this.shipment.boxes.map(m => {
        this.shipment.weight += parseFloat(m.weight.toString());
        this.shipment.excWeight += parseFloat(m.excWeight.toString());
        if (m.weight > m.excWeight) m.calWeight = parseFloat(m.weight.toString());
        else m.calWeight = parseFloat(m.excWeight.toString());
        this.shipment.calWeight += parseFloat(m.calWeight.toString());
      });
      this.shipment.totalBox = this.shipment.boxes.length;
    }
    this.shipment.weight = this.route(this.shipment.weight);
    this.shipment.calWeight = this.route(this.shipment.calWeight);
    this.shipment.excWeight = this.route(this.shipment.excWeight);
    //
  }

}

import { TemplateRef, Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { BsModalService, ModalDirective } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import { MessageService } from "primeng/components/common/messageservice";
import { Message, SelectItem } from "primeng/primeng";
import { Boxes, Shipment } from "../../../models";
import { SelectModel } from "../../../models/select.model";
import { BoxService, SizeService, PackTypeService, AuthService, PriceService, DeadlinePickupDeliveryService, CustomerService, PriceServiceService, ServiceDVGTService, PriceListService } from "../../../services";
import { Constant } from "../../../infrastructure/constant";
import { GeneralInfoService } from "../../../services/generalInfo.service";
import { BoxServiceInstance } from "../../../services/box.serviceInstance";
import { ServiceComponent } from "./service-helper.component";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";
import { EntryShipment } from "../../../models/abstract/entryShipment.interface";
      
@Component({
  selector: 'app-box-helper',
  templateUrl: './box-helper.component.html',
  styles: []
})

export class BoxComponent extends ServiceComponent implements OnInit {
  @ViewChild('templateBox') templateBox: TemplateRef<any>;

  unit = environment.unit;

  shipmentItem: any;
  packTypes: SelectItem[];
  selectedPackType: number;
  detectDeleteBox: boolean;
  seletedItemBox: Boxes;
  cloneNewEditBoxes: any[];
  cloneTotalBox: any[];
  cloneTotalSelectedCountSK: any;
  totalSelectedCountSK: number;
  selectedCountSK: number;
  selectedContent: any;
  selectedWeight: number = 0;
  selectedWoodWeight: number = 0;
  isCreatedBox: boolean;
  chargeWeight: number;
  sizes: SelectModel[];
  selectedSize: number;
  selectedCalWeight: number;
  selectedHeight: number;
  selectedWidth: number;
  selectedLength: number;
  selectedDeleteBoxes: any[];
  newEditBoxes: any[];
  totalChargeWeightBoxes: number;
  boxes: Boxes[] = [];
  totalBoxes: any[] = [];
  boxesLS: Boxes[];
  bsModalRef: BsModalRef;
  constructor(
    protected modalService: BsModalService,
    protected sizeService: SizeService,
    protected messageService: MessageService,
    protected packTypeService: PackTypeService,
    protected boxServiceInstance: BoxServiceInstance,
    protected priceServiceService: PriceServiceService,
    protected customerService: CustomerService,
    protected deadlinePickupDeliveryService: DeadlinePickupDeliveryService,
    protected priceListService: PriceListService,
    protected serviceDVGTService: ServiceDVGTService,
    protected boxService: BoxService,
    protected priceService: PriceService,
    protected generalInfoService: GeneralInfoService,
    protected authService: AuthService,
    public permissionService: PermissionService,
    public router: Router,
  ) {
    super(priceServiceService, customerService, deadlinePickupDeliveryService, priceListService, serviceDVGTService, boxService, priceService, generalInfoService, authService, messageService,permissionService,router);
  }

  ngOnInit() {
    this.getDataShipment();
    this.loadPackType();
    this.loadSize();
  }

  getDataShipment() {
    this.boxServiceInstance.getEventSubject.subscribe(data => {
      if (data) {
        this.shipmentItem = data;
        this.loadBoxes(data);
        this.openModelBox(this.templateBox, data);
      }
    });
  }

  async loadPackType() {
    this.packTypes = [];
    this.selectedPackType = null;
    this.packTypes = await this.packTypeService.getAllSelectModelAsync();
  }

  async loadSize() {
    this.sizes = [];
    this.selectedSize = null;
    this.sizes = await this.sizeService.getAllSelectModelAsync();
  }

  openModelBox(template: TemplateRef<any>, shipment: any) {
    this.bsModalRef = this.modalService.show(template, {
        class: "inmodal animated bounceInRight modal-s"
    });
  }

  async loadBoxes(shipment: EntryShipment) {
    const id = shipment.id;
    this.resetBox();
    this.boxesLS = await this.boxService.getByShipmentIdAsync(id);
    if (this.boxesLS) {
      if (shipment) {
        this.totalBoxes = this.boxesLS;
        this.totalChargeWeightBoxes = this.totalBoxes.reduce((chargeWeight, item) =>
          chargeWeight + (item.calWeight >= item.weight ? item.calWeight : item.weight), 0
        );
        shipment.calWeight = this.totalChargeWeightBoxes;
        shipment.chargeWeight = this.totalChargeWeightBoxes;
        shipment.totalBox = this.totalBoxes.length;
        shipment.boxes = this.boxesLS;
        this.loadChargeWeight(shipment);
        this.newEditBoxes = [];
        this.selectedDeleteBoxes = [];
      }
    }
  }

  async loadChargeWeight(shipment: EntryShipment) {
    if (!shipment.calWeight) {
      shipment.chargeWeight = shipment.weight;
    } else {
      shipment.chargeWeight =
      shipment.weight >= shipment.calWeight
          ? shipment.weight
          : shipment.calWeight;
    }
    this.loadServiceSP(shipment);
  }

  changeLWH() {
    this.messageService.clear();
    if (!this.shipmentItem.dim) {
      if (!this.shipmentItem.priceListId && !this.shipmentItem.serviceId) {
        this.messageService.add({
          severity: Constant.messageStatus.warn,
          detail: "Chưa chọn bảng giá và dịch vụ"
        });
      } else {
        if (!this.shipmentItem.priceListId) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "Chưa chọn bảng giá"
          });
        }
        if (!this.shipmentItem.serviceId) {
          this.messageService.add({
            severity: Constant.messageStatus.warn,
            detail: "Chưa chọn dịch vụ"
          });
        }
      }
      return;
    }
    if (this.selectedLength && this.selectedWidth && this.selectedHeight) {
      this.selectedCalWeight =
        this.selectedLength *
        this.selectedWidth *
        this.selectedHeight *
        this.shipmentItem.dim;
    } else {
      this.selectedCalWeight = null;
    }
  }

  changeSize() {
    if (this.selectedSize) {
      this.sizes.forEach(x => {
        if (x.data) {
          let size = x.data;
          if (size.id === this.selectedSize) {
            this.selectedLength = size.length;
            this.selectedWidth = size.width;
            this.selectedHeight = size.height;
            this.changeLWH();
          }
        }
      });
    } else {
      this.selectedCalWeight = null;
      this.selectedLength = null;
      this.selectedWidth = null;
      this.selectedHeight = null;
    }
  }

  createBox(shipment: Shipment) {
    if (!this.isValidToCreateBox()) return;
    // add new boxes
    this.boxes = [];
    this.totalChargeWeightBoxes = 0;
    if (
      this.selectedLength &&
      this.selectedWidth &&
      this.selectedHeight &&
      this.selectedWeight &&
      this.selectedPackType
    ) {
      const obj: Boxes = new Boxes();
      if (!this.selectedPackType) {
        obj.packTypeId = null;
      } else {
        obj.packTypeId = this.selectedPackType;
      }
      if (this.selectedContent) {
        obj.content = this.selectedContent as string;
      } else {
        obj.content = null;
      }
      obj.weight = this.selectedWeight ? this.selectedWeight : 0;
      obj.length = this.selectedLength;
      obj.width = this.selectedWidth;
      obj.height = this.selectedHeight;
      obj.calWeight = this.selectedCalWeight;
      obj.woodWeight = this.selectedWoodWeight ? this.selectedWoodWeight : 0;
      if (shipment) {
        obj.shipmentId = shipment.id;
      }
      if (this.selectedCountSK == 0) {
        this.boxes = [];
      } else if (!this.selectedCountSK || this.selectedCountSK == 1) {
        this.boxes.push(obj);
      } else {
        this.boxes = [];
        for (let i = 1; i <= this.selectedCountSK; i++) {
          this.boxes.push(obj);
        }
      }
      if (this.boxes && this.totalBoxes) {
        this.totalBoxes = this.totalBoxes.concat(this.boxes);
      }
      if (this.newEditBoxes) {
        this.newEditBoxes = this.newEditBoxes.concat(this.boxes);
      }
      this.totalSelectedCountSK = this.selectedCountSK;
    }
    this.getTotalBoxes(shipment);
  }
    
  getTotalBoxes(shipment: Shipment) {
    this.totalChargeWeightBoxes = 0;
    this.cloneTotalSelectedCountSK = null;
    if (this.totalBoxes) {
      this.totalChargeWeightBoxes = this.totalBoxes.reduce((chargeWeight, item) =>
        chargeWeight + (item.calWeight >= item.weight ? item.calWeight : item.weight), 0
      );
      this.totalSelectedCountSK = this.totalBoxes.length;
      this.cloneTotalSelectedCountSK = this.totalSelectedCountSK;
    }
  }

  async saveBox(shipment: Shipment) {
    this.editSelectedBoxes(shipment);
    this.upDateBoxes(shipment);
    this.loadServiceSP(shipment);
    this.isCreatedBox = true;
    this.messageService.add({
        severity: Constant.messageStatus.success,
        detail: "Lưu kiện hàng thành công"
    });
    this.resetBox();
    this.bsModalRef.hide();
  }
    
  deleteItemBox(data: Boxes, shipment: Shipment) {
    this.detectDeleteBox = true;
    // delete item boxes
    this.cloneTotalBox = [];
    this.cloneNewEditBoxes = [];
    this.seletedItemBox = data;
    let index = this.totalBoxes.lastIndexOf(this.seletedItemBox);
    this.cloneTotalBox = this.totalBoxes.splice(index, 1);

    if (this.cloneTotalBox[0].code) {
      // arrayBoxes is deleted
      if (this.selectedDeleteBoxes) {
        this.selectedDeleteBoxes = this.selectedDeleteBoxes.concat(this.cloneTotalBox[0]);
      }
    } else {
      if (this.newEditBoxes) {
        let indexDelete = this.newEditBoxes.lastIndexOf(this.cloneTotalBox[0]);
        this.cloneNewEditBoxes = this.newEditBoxes.splice(indexDelete, 1);
        this.cloneNewEditBoxes.forEach(x => {
          this.reloadCloneBoxes(this.newEditBoxes.filter((val, i) => val = x));
        });
      }
    }
    this.cloneTotalBox.forEach(x => {
      this.reloadBoxes(this.totalBoxes.filter((val, i) => (val = x)));
    });
    this.getTotalBoxes(shipment);
  }
    
  upDateBoxes(shipment: Shipment) {
    if (this.totalBoxes) {
      shipment.boxes = this.totalBoxes;
    }
    shipment.calWeight = this.totalChargeWeightBoxes;
    if (shipment.totalBox) {
      shipment.totalBox =
        this.totalSelectedCountSK >= shipment.totalBox
          ? this.totalSelectedCountSK
          : shipment.totalBox;
    } else {
      shipment.totalBox = this.totalSelectedCountSK;
    }
  }
    
  editSelectedBoxes(shipment: Shipment) {
    if (this.newEditBoxes) {
      this.newEditBoxes.forEach(x => {
        this.boxService.createAsync(x);
      });
    }

    if (this.selectedDeleteBoxes) {
      this.selectedDeleteBoxes.forEach(x => {
        this.boxService.deleteAsync(x.id);
      });
    } else {
      // console.log("ERR: this.selectedDeleteBoxes  =  null");
    }
  }
    
  reloadBoxes(list: Boxes[]) {
    this.totalBoxes = list;
  }

  reloadCloneBoxes(list: Boxes[]) {
    this.newEditBoxes = list;
  }    

  isValidToCreateBox(): boolean {
    let result: boolean = true;
    let messages: Message[] = [];

    if (!this.selectedPackType) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa chọn loại đóng gói"
      });
      result = false;
    }

    // if (!this.selectedWeight) {
    //   messages.push({
    //     severity: Constant.messageStatus.warn,
    //     detail: "Chưa nhập trọng lượng"
    //   });
    //   result = false;
    // }

    if (!this.selectedLength) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập chiều dài"
      });
      result = false;
    }

    if (!this.selectedWidth) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập chiều rộng"
      });
      result = false;
    }

    if (!this.selectedHeight) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa nhập chiều cao"
      });
      result = false;
    }

    if (!this.shipmentItem.dim) {
      messages.push({
        severity: Constant.messageStatus.warn,
        detail: "Chưa có DIM tính TLQĐ"
      });
      result = false;
    }

    if (messages.length > 0) {
      this.messageService.addAll(messages);
    }

    return result;
  }

  resetBox() {
    this.selectedPackType = null;
    this.selectedSize = null;
    this.selectedContent = null;
    this.selectedWeight = 0;
    this.selectedWoodWeight = 0;
    this.selectedLength = null;
    this.selectedWidth = null;
    this.selectedHeight = null;
    this.selectedCalWeight = null;
    this.selectedCountSK = null;
    this.totalChargeWeightBoxes = null;
    this.totalSelectedCountSK = null;
    this.boxes = null;
    this.totalBoxes = [];
  }   
  
  exitModal() {
    this.bsModalRef.hide();
  }  

  ngOnDestroy() {
    this.boxServiceInstance.resetEventObserver();
  } 
}
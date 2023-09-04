import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import { Shipment } from '../../models/shipment.model';
import { ShipmentService, RequestShipmentService, UploadService, UserService, HubService, BoxService } from '../../services/index';
import { LadingSchesule, Hub, ListReceiptMoney, Boxes } from '../../models/index';
import { BaseComponent } from '../../shared/components/baseComponent';
import { Constant } from '../../infrastructure/constant';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ListReceiptMoneyService } from '../../services/receiptMoney.service.';
import { ShipmentTracking } from '../../models/abstract/shipmentTracking.interface';
import { environment } from '../../../environments/environment';
import { PermissionService } from '../../services/permission.service';
import { Router } from '@angular/router';
import { ChildRequestShipmentTracking } from '../../models/abstract/childRequestShipmentTracking.interface';
import { StringHelper } from '../../infrastructure/string.helper';
import { Accordion } from 'primeng/primeng';
import { Incidents } from '../../models/incidents.model';

@Component({
  selector: 'app-shipment-detail',
  templateUrl: 'shipment-detail.component.html',
  styles: []
})
export class ShipmentDetailComponent extends BaseComponent implements OnInit {
  //#region param basic
  shipmentName: string = "Vận đơn";
  requestShipmentName: string = "Yêu cầu";
  //#endregion
  totalChildShipments: number = 0;
  hubName = environment;
  receiptCODCode: string;
  receiptPriceCode: string;
  priceEmName: any;
  priceHubName: string;
  codEmName: any;
  codHubName: string;
  shipmentNumber: string;
  selectedShipmentType: boolean = true;
  shipmentData: ShipmentTracking = new Object() as ShipmentTracking;
  shipmentLadingSchedule: LadingSchesule[] = [];
  modalTitle: string;
  updateImagePath: any;

  unit = environment.unit;

  listBillChild: Shipment[] = [];
  listChildRequestShipmentAndShipment: ChildRequestShipmentTracking[] = [];

  cloneParrentShipmentNumber: string;
  cloneChildShipmentNumbers: string[] = [];
  cloneShipmentNumber: string;

  isParrentShipment: boolean = false;
  isChildShipment: boolean = false;
  tabIndex: number = 1;
  @ViewChild("accordion") accordion: Accordion

  boxesLS: Boxes[];
  bsModalRefXemKien: BsModalRef;

  imagesPickup: any[] = [];
  imagesDelivery: any[] = [];
  imagesIncidents: any[] = [];

  dataModalImages: string[] = [];

  dataModal: Incidents;

  configImageViewer = {
    wheelZoom: true
  }

  constructor(private modalService: BsModalService, public bsModalRef: BsModalRef, private persistenceService: PersistenceService, protected messageService: MessageService,
    private shipmentService: ShipmentService, private requestShipmentService: RequestShipmentService, private userService: UserService, private hubService: HubService,
    private uploadService: UploadService, private listReceiptMoneyService: ListReceiptMoneyService, private boxService: BoxService, public permissionService: PermissionService, public router: Router) {
    super(messageService, permissionService, router);
  }

  ngOnInit() {
  }

  resetData() {
    this.shipmentData = new Object() as ShipmentTracking;
    this.shipmentLadingSchedule = [];
    this.priceEmName = null;
    this.priceHubName = null;
    this.codEmName = null;
    this.codHubName = null;
  }

  async loadData(shipment: ShipmentTracking, selectedShipmentType = true, isHeader = false) {
    this.listChildRequestShipmentAndShipment = [];
    this.totalChildShipments = 0;
    this.shipmentData = shipment;
    if (isHeader) {
      this.cloneParrentShipmentNumber = this.shipmentData.parrentShipmentNumber;
      this.cloneChildShipmentNumbers = this.shipmentData.childShipmentNumbers ? this.shipmentData.childShipmentNumbers.split(",") : [];
      this.cloneShipmentNumber = this.shipmentData.shipmentNumber;

      this.isParrentShipment = false;
      this.isChildShipment = false;

      if (this.shipmentData.parrentShipmentNumber)
        this.isParrentShipment = true;
      else
        this.isParrentShipment = false;

      if (this.shipmentData.childShipmentNumbers)
        this.isChildShipment = true;
      else
        this.isChildShipment = false;

      setTimeout(() => {
        // this.accordion.activeIndex = 1;
      }, 0);
    }
    // console.log(this.shipmentData);
    this.shipmentLadingSchedule = this.shipmentData.ladingSchedules;
    this.selectedShipmentType = selectedShipmentType;
    this.loadListReceiptMoney(this.shipmentData);
    this.loadUsers(this.shipmentData);

    this.imagesPickup = await this.uploadService.getImageByShipmentId(this.shipmentData.id, 1) || [];
    this.imagesDelivery = await this.uploadService.getImageByShipmentId(this.shipmentData.id, 2) || [];

    if (!this.selectedShipmentType) {
      if (this.shipmentData.shipmentStatus) {
        this.shipmentData.shipmentStatusName = this.shipmentData.shipmentStatus.name;
      }
      if (this.shipmentData.shipmentStatus) {
        this.shipmentData.shipmentStatusName = this.shipmentData.shipmentStatus.name;
      }
      if (this.shipmentData.paymentType) {
        this.shipmentData.paymentTypeName = this.shipmentData.paymentType.name;
      }
      if (this.shipmentData.service) {
        this.shipmentData.serviceName = this.shipmentData.service.name;
      }
      // from location
      if (this.shipmentData.fromWard) {
        this.shipmentData.fromWardName = this.shipmentData.fromWard.name;
        if (this.shipmentData.fromWard.district) {
          this.shipmentData.fromDistrictName = this.shipmentData.fromWard.district.name;
        }
        if (this.shipmentData.fromWard.district.province) {
          this.shipmentData.fromProvinceName = this.shipmentData.fromWard.district.province.name;
        }
      }
      if (this.shipmentData.fromHub) {
        this.shipmentData.fromHubName = this.shipmentData.fromHub.name;
      }
      this.shipmentData.toWardName = this.shipmentData.toWard ? this.shipmentData.toWard.name : null;
      if (this.shipmentData.toWard) {
        if (this.shipmentData.toWard.district) {
          if (this.shipmentData.toWard.district.province) {
            this.shipmentData.toProvinceName = this.shipmentData.toWard.district.province.name;
          }
        }
      }
      this.shipmentData.toHubName = this.shipmentData.toHub ? this.shipmentData.toHub.name : null;
      this.shipmentData.toHubRoutingName = this.shipmentData.toHubRouting ? this.shipmentData.toHubRouting.name : null;

      let cols = [
        Constant.classes.includes.shipment.fromHub,
        Constant.classes.includes.shipment.fromHubRouting,
        Constant.classes.includes.shipment.shipmentStatus,
        Constant.classes.includes.shipment.pickUser,
        Constant.classes.includes.shipment.fromDistrict,
        Constant.classes.includes.shipment.fromProvince,
        Constant.classes.includes.shipment.deliverUser,
        Constant.classes.includes.shipment.paymentType,
        Constant.classes.includes.shipment.sender,
        Constant.classes.includes.shipment.structure,
        Constant.classes.includes.shipment.serviceDVGT,
        Constant.classes.includes.shipment.boxes,
        Constant.classes.includes.shipment.toHub,
        Constant.classes.includes.shipment.toHubRouting,
        Constant.classes.includes.shipment.toWard,
        Constant.classes.includes.shipment.toDistrict,
        Constant.classes.includes.shipment.toProvince
      ];

      // nếu không phải yêu cầu thì mới lấy column liên quan người nhận
      // if (!((!this.shipmentData.requestShipmentId) && this.shipmentData.shipmentStatusId === StatusHelper.pickupComplete &&
      //   (this.shipmentData.totalChildRequestShipment > 0 || this.shipmentData.totalChildShipment > 0))
      // ) {
      //   const receiverCols: string[] = [
      //     Constant.classes.includes.shipment.toHub,
      //     Constant.classes.includes.shipment.toHubRouting,
      //     Constant.classes.includes.shipment.toWard,
      //     Constant.classes.includes.shipment.toDistrict,
      //     Constant.classes.includes.shipment.toProvince,
      //   ];
      //   // cols = cols.concat(receiverCols);
      // }

      // this.listBillChild = await this.shipmentService.getByRequestShipmentIdAsync(this.shipmentData.id, cols);

      const res = await this.requestShipmentService.getByParentRequestShipmentIdAsync(this.shipmentData.id, cols);
      if (res) {
        this.listChildRequestShipmentAndShipment = res.childRequestShipments as ChildRequestShipmentTracking[];
        this.listChildRequestShipmentAndShipment.forEach(x => {
          if (StringHelper.isNullOrEmpty(x.shipmentNumber)) {
            x.classChildShipment = "col-sm-12";
          } else {
            x.classChildShipment = "col-sm-8";
          }
        });
        this.totalChildShipments = this.listChildRequestShipmentAndShipment.reduce((totalChildShipments, item) =>
          totalChildShipments + ((item.shipments != null) ? item.shipments.length : 0), 0
        );
      }
    }
  }

  loadListReceiptMoney(shipmentData: Shipment) {
    this.listReceiptMoneyService.getListByShipmentId(shipmentData.id).subscribe(x => {
      if (x) {
        const data = x.data as ListReceiptMoney[];
        if (data) {
          if (data.length > 0) {
            if (data[0].totalPrice) {
              this.receiptPriceCode = data[0].code;
            } else {
              this.receiptPriceCode = null;
            }
            if (data[0].totalCOD) {
              this.receiptCODCode = data[0].code;
            } else {
              this.receiptCODCode = null;
            }
          }
        }
      }
    });
  }

  loadUsers(shipmentData: Shipment) {
    const keepingTotalPriceEmpId = shipmentData.keepingTotalPriceEmpId;
    const keepingTotalPriceHubId = shipmentData.keepingTotalPriceHubId;
    const keepingCODEmpId = shipmentData.keepingCODEmpId;
    const keepingCODHubId = shipmentData.keepingCODHubId;

    this.loadPriceEm(keepingTotalPriceEmpId);
    this.loadPriceHub(keepingTotalPriceHubId);
    this.loadCodEm(keepingCODEmpId);
    this.loadCodHub(keepingCODHubId);
  }

  loadPriceEm(id: number) {
    this.userService.get(id).subscribe(x => {
      if (x) {
        const priceEm = x.data as any;
        if (priceEm) {
          this.priceEmName = priceEm.code + " - " + priceEm.fullName;
        }
      }
    });
  }

  loadPriceHub(id: number) {
    this.hubService.get(id).subscribe(x => {
      if (x) {
        const res = x.data as Hub;
        if (res) {
          this.priceHubName = res.name;
        }
      }
    });
  }

  loadCodEm(id: number) {
    this.userService.get(id).subscribe(x => {
      if (x) {
        const codEm = x.data as any;
        if (codEm) {
          this.codEmName = codEm.code + " - " + codEm.fullName;
        }
      }
    });
  }

  loadCodHub(id: number) {
    this.hubService.get(id).subscribe(x => {
      if (x) {
        const res = x.data as Hub;
        if (res) {
          this.codHubName = res.name;
        }
      }
    });
  }

  changeInputSwitch() {
    this.resetData();
  }

  async openModalIncident(template: TemplateRef<any>, rowData: LadingSchesule) {
    // this.resetModal();
    this.dataModal = await this.shipmentService.getIncidentsById(rowData.incidentsId, "HandleByEmp,IncidentsByHub,IncidentsReason,IncidentsByEmp");

    setTimeout(() => {
      this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
    }, 0);

    this.imagesIncidents = await this.uploadService.getImageByShipmentId(rowData.shipmentId, 3, rowData.incidentsId) || [];

  }

  openModel(template: TemplateRef<any>, path: string) {
    this.modalTitle = "Hình ảnh";
    this.uploadService.getImageByPath(path).subscribe(x => {
      if (!super.isValidResponse(x)) return;

      if (x.data["fileBase64String"]) {
        this.updateImagePath = x;
        this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-s' });
      }
    });
  }

  openModelImages(template: TemplateRef<any>, data: any[]) {
    this.dataModalImages = [];
    data.map(x => {
      this.dataModalImages.push('data:image/jpeg;base64,' + x.fileBase64String);
    })
    this.bsModalRef = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-1000' });
  }

  async openModelXemKien(template: TemplateRef<any>, id) {
    this.boxesLS = await this.boxService.getByShipmentIdAsync(id);

    this.bsModalRefXemKien = this.modalService.show(template, { class: 'inmodal animated bounceInRight modal-lg modalXemKien' });
  }

  async onEnterSearchGBDetail(reset = false) {
    if (reset) {
      this.isParrentShipment = false;
      this.isChildShipment = false;
      this.accordion.activeIndex = 1;
    }

    if (this.shipmentNumber) {
      this.resetData();
      let includes = [
        Constant.classes.includes.shipment.sender,
        Constant.classes.includes.shipment.fromHub,
        Constant.classes.includes.shipment.toHub,
        Constant.classes.includes.shipment.fromWard,
        Constant.classes.includes.shipment.fromDistrict,
        Constant.classes.includes.shipment.fromProvince,
        Constant.classes.includes.shipment.fromHub,
        Constant.classes.includes.shipment.toWard,
        Constant.classes.includes.shipment.toDistrict,
        Constant.classes.includes.shipment.toProvince,
        Constant.classes.includes.shipment.shipmentStatus,
        Constant.classes.includes.shipment.paymentType,
        Constant.classes.includes.shipment.service,
        Constant.classes.includes.shipment.serviceDVGT,
        Constant.classes.includes.shipment.listGoods,
      ];

      if (this.selectedShipmentType) {
        const data = await this.shipmentService.getByShipmentNumberAsync(this.shipmentNumber.trim());
        if (data) {
          const ladingSchedule = await this.shipmentService.getGetLadingScheduleAsync(data.id);
          if (ladingSchedule) {
            data.ladingSchedules = ladingSchedule;
          }
          if (reset) {
            this.cloneParrentShipmentNumber = data.parrentShipmentNumber;
            this.cloneChildShipmentNumbers = this.shipmentData.childShipmentNumbers ? data.childShipmentNumbers.split(",") : [];
            this.cloneShipmentNumber = data.shipmentNumber;
          }
          if (!this.isParrentShipment) {
            if (data.parrentShipmentNumber)
              this.isParrentShipment = true;
            else
              this.isParrentShipment = false;
          }

          if (!this.isChildShipment) {
            if (data.childShipmentNumbers)
              this.isChildShipment = true;
            else
              this.isChildShipment = false;
          }

          this.loadData(data, this.selectedShipmentType);
        }
      } else if (!this.selectedShipmentType) {
        this.requestShipmentService.trackingShort(this.shipmentNumber.trim(), includes).subscribe(
          x => {
            if (!super.isValidResponse(x)) return;
            this.loadData(x.data as ShipmentTracking, this.selectedShipmentType);
          }
        );
      }
    }
    this.shipmentNumber = null;
  }
  clone(model: Shipment): Shipment {
    let data = new Shipment();
    for (let prop in model) {
      data[prop] = model[prop];
    }
    return data;
  }

  onTabOpen(event) {
    this.tabIndex = event.index;
    if (event.index == 0) {
      this.shipmentNumber = this.cloneParrentShipmentNumber;
      this.onEnterSearchGBDetail(false);
    }
    else if (event.index == 1) {
      this.shipmentNumber = this.cloneShipmentNumber;
      this.onEnterSearchGBDetail(false);
    }
    else if (event.index > 1) {
      this.shipmentNumber = this.cloneChildShipmentNumbers[event.index - 2];
      this.onEnterSearchGBDetail(false);
    }
  }
}

import { Component, OnInit, NgZone } from '@angular/core';
import { Constant } from '../../../infrastructure/constant';
import { CreateShipmentComponent } from '../create-shipment/create-shipment.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import { ShipmentService, UserService, CustomerService, CustomerInfoLogService, ProvinceService, DistrictService, WardService, HubService, PaymentTypeService, ServiceService, ServiceDVGTService, PackTypeService, SizeService, StructureService, PriceService, AuthService, DeadlinePickupDeliveryService, GeocodingApiService, BoxService, ShipmentVersionService, ShipmentStatusService, UploadService, PriceListService, PriceServiceService, RequestShipmentService, PaymentCODTypeService, FormPrintService, CustomerPaymentToService } from '../../../services';
import { MapsAPILoader } from '@agm/core';
import { GeneralInfoService } from '../../../services/generalInfo.service';
import { DaterangepickerConfig } from 'ng2-daterangepicker';
import { PrintFrormServiceInstance } from '../../../services/printTest.serviceInstace';
import { CusDepartmentService } from '../../../services/cusDepartment.service.';
import { ImagePickupServiceInstance } from '../../../services/imagePickup.serviceInstance';
import { Shipment } from '../../../models';
import { ShipmentDetailComponent } from '../../shipment-detail/shipment-detail.component';
import { CommandService } from '../../../services/command.service';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';
import { SignalRService } from '../../../services/signalR.service';
import { UploadExcelHistoryService } from '../../../services/uploadExcelHistory.service';
import { CurrencyFormatPipe } from '../../../pipes/currencyFormat.pipe';

@Component({
  selector: 'app-cancel-shipment',
  templateUrl: './cancel-shipment.component.html',
  styles: []
})
export class CancelShipmentComponent extends CreateShipmentComponent implements OnInit {
  gbModelRefCancel: BsModalRef;
  parentPage: string = Constant.pages.shipment.name;
  currentPage: string = Constant.pages.shipment.children.cancleShipment.name;

  unit = environment.unit;

  constructor(
    protected uploadExcelHistoryService: UploadExcelHistoryService,
    protected priceServiceService: PriceServiceService,
    protected modalService: BsModalService,
    protected persistenceService: PersistenceService,
    protected messageService: MessageService,
    protected shipmentService: ShipmentService,
    protected requestShipmentService: RequestShipmentService,
    protected userService: UserService,
    protected customerService: CustomerService,
    protected customerInfoLogService: CustomerInfoLogService,
    protected provinceService: ProvinceService,
    protected districtService: DistrictService,
    protected wardService: WardService,
    protected hubService: HubService,
    protected paymentTypeService: PaymentTypeService,
    protected paymentCODTypeService: PaymentCODTypeService,
    protected serviceService: ServiceService,
    protected serviceDVGTService: ServiceDVGTService,
    protected packTypeService: PackTypeService,
    protected sizeService: SizeService,
    protected structureService: StructureService,
    protected priceService: PriceService,
    protected mapsAPILoader: MapsAPILoader,
    protected authService: AuthService,
    protected generalInfoService: GeneralInfoService,
    protected deadlinePickupDeliveryService: DeadlinePickupDeliveryService,
    protected ngZone: NgZone,
    protected geocodingApiService: GeocodingApiService,
    protected daterangepickerOptions: DaterangepickerConfig,
    protected printFrormServiceInstance: PrintFrormServiceInstance,
    protected boxService: BoxService,
    protected shipmentVersionService: ShipmentVersionService,
    protected shipmentStatusService: ShipmentStatusService,
    protected cusDepartmentService: CusDepartmentService,
    protected uploadService: UploadService,
    protected imagePickupServiceInstance: ImagePickupServiceInstance,
    protected commandService: CommandService,
    public permissionService: PermissionService,
    public router: Router,
    protected priceListService: PriceListService,
    protected formPrintService: FormPrintService,
    protected signalRService: SignalRService,
    protected customerPaymentToService: CustomerPaymentToService,
    protected currencyFormat: CurrencyFormatPipe
  ) {
    super(
      uploadExcelHistoryService,
      priceServiceService,
      modalService,
      persistenceService,
      messageService,
      shipmentService,
      requestShipmentService,
      userService,
      customerService,
      customerInfoLogService,
      provinceService,
      districtService,
      wardService,
      hubService,
      paymentTypeService,
      paymentCODTypeService,
      serviceService,
      serviceDVGTService,
      structureService,
      priceService,
      mapsAPILoader,
      authService,
      generalInfoService,
      ngZone,
      geocodingApiService,
      daterangepickerOptions,
      printFrormServiceInstance,
      shipmentVersionService,
      shipmentStatusService,
      cusDepartmentService,
      uploadService,
      boxService,
      imagePickupServiceInstance,
      commandService,
      permissionService,
      router,
      formPrintService,
      signalRService,
      customerPaymentToService,
      currencyFormat
    );
  }

  ngOnInit() {
    this.initData();
  }

  async loadShipmentPaging() {
    this.shipmentFilterViewModel.isEnabled = false;
    //await this.loadShipmentVersion();
    await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel).then(x => {
      if (x) {
        const data = x.data as Shipment[];
        this.datasource = data.reverse();
        this.listData = this.datasource;
        this.totalRecords = x.dataCount;
      }
    });
  }

  refresh() {
    this.initData();
    this.resetFilter();
  }

  async onDetailShipmentCancel(template, data: Shipment) {
    const id = data.id;
    this.gbModelRefCancel = this.modalService.show(ShipmentDetailComponent, {
      class: "inmodal animated bounceInRight modal-xlg"
    });
    let includes = [
      Constant.classes.includes.shipment.shipmentStatus,
      Constant.classes.includes.shipment.service,
      Constant.classes.includes.shipment.fromHub,
      Constant.classes.includes.shipment.toHub,
      Constant.classes.includes.shipment.toHubRouting,
      Constant.classes.includes.shipment.pickUser,
      Constant.classes.includes.shipment.fromWard,
      Constant.classes.includes.shipment.toWard,
      Constant.classes.includes.shipment.fromDistrict,
      Constant.classes.includes.shipment.fromProvince,
      Constant.classes.includes.shipment.toDistrict,
      Constant.classes.includes.shipment.toProvince,
      Constant.classes.includes.shipment.deliverUser,
      Constant.classes.includes.shipment.paymentType,
      Constant.classes.includes.shipment.sender,
      Constant.classes.includes.shipment.structure,
      Constant.classes.includes.shipment.fromHubRouting,
    ];

    const shipment = await this.shipmentService.getAsync(id, includes);
    if (shipment) {
      this.gbModelRefCancel.content.loadData(shipment as Shipment);
    }
  }
}

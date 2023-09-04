import {
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  NgZone
} from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { BsModalRef } from "ngx-bootstrap/modal";
import * as moment from "moment";
//
import { Constant } from "../../../infrastructure/constant";
import { LazyLoadEvent, SelectItem } from "primeng/primeng";
import { BaseModel } from "../../../models/base.model";
import {
  ShipmentService,
  UserService,
  ProvinceService,
  WardService,
  DistrictService,
  HubService,
  RequestShipmentService
} from "../../../services";
import { MessageService } from "primeng/components/common/messageservice";
import { Message } from "primeng/components/common/message";
import { ResponseModel } from "../../../models/response.model";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { Shipment } from "../../../models/shipment.model";
import { User, Province, District, Ward, Hub } from "../../../models/index";
import { PersistenceService, StorageType } from "angular-persistence";
import { PrintModel } from "../../../models/print.model";

import {
  KeyValuesViewModel,
  ListUpdateStatusViewModel
} from "../../../view-model/index";
import { ShipmentStatus } from "../../../models/shipmentStatus.model";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { FormControl } from "@angular/forms";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "@angular/router";

declare var jQuery: any;

@Component({
  selector: "app-print-data-delivery",
  templateUrl: "print-data-delivery.component.html",
  styles: []
})
export class PrintDataDeliveryComponent extends BaseComponent
  implements OnInit {
  @Output() myClick = new EventEmitter();

  constructor(
    private modalService: BsModalService,
    private persistenceService: PersistenceService,
    protected messageService: MessageService,
    private shipmentService: ShipmentService,
    private userService: UserService,
    private provinceService: ProvinceService,
    private districtService: DistrictService,
    private wardService: WardService,
    private hubService: HubService,
    private requestShipmentService: RequestShipmentService,
    private ngZone: NgZone,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);

  }

  ngOnInit() {}

  print(): void {
    setTimeout(() => {
      let printContents, popupWin;
      printContents = document.getElementById("print-section").innerHTML;
      popupWin = window.open(
        "",
        "_blank",
        "top=0,left=0,height=100%,width=auto,time=no"
      );
      popupWin.document.open();
      popupWin.document.write(
        "<!DOCTYPE html><html><head>  " +
          '<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css" ' +
          'media="screen,print">' +
          '<link rel="stylesheet" href="style.css" media="screen,print">' +
          "<style>@page { size: auto;  margin: 0mm; }</style>" +
          '</head><body onload="window.print()"><div class="reward-body">' +
          printContents +
          "</div></html>"
      );
      popupWin.document.close();
    }, 1000);

    this.myClick.emit();
  }
}

import { Component, OnInit, } from '@angular/core';
// import { BsModalRef } from 'ngx-bootstrap/modal';
//
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../shared/components/baseComponent';
import { UserService, AuthService, ShipmentService, HubService, GeocodingApiService } from '../../services/index';
import { Constant } from '../../infrastructure/constant';
import { User } from '../../models/index';
import { Marker } from '../../view-model/index';
import * as moment from 'moment';
import { Subscription, Observable } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { Shipment } from '../../models/shipment.model';
import { ShipmentAllDetailComponent } from '../shipment-all-detail/shipment-all-detail.component';
import { StatusHelper } from '../../infrastructure/statusHelper';
import { PermissionService } from '../../services/permission.service';
import { Router } from '@angular/router';
import { SignalRService } from '../../services/signalR.service';
import { HubConnection } from '@aspnet/signalr';
import { SelectModel } from '../../models/select.model';

declare var jQuery: any;

@Component({
  selector: 'app-gps-location',
  templateUrl: 'gps-location.component.html',
  styles: [`
  agm-map {
    height: 680px;
  }
  `]
})
export class GPSLocationComponent extends BaseComponent implements OnInit {

  constructor(
    protected messageService: MessageService,
    private userService: UserService,
    private modalService: BsModalService,
    private shipmentService: ShipmentService,
    public permissionService: PermissionService,
    public router: Router,
    private signalRService: SignalRService,
    private hubService: HubService,
    private authService: AuthService,
    private geocodingApiService: GeocodingApiService,
  ) {
    super(messageService, permissionService, router);
  }

  hubConnection: HubConnection;

  centerHub: SelectModel[] = [];
  selectedCenterHub: number;

  poHub: SelectModel[] = [];
  selectedPoHub: number;

  hub: SelectModel[] = [];
  selectedHub: number;

  parentPage: string = Constant.pages.gpsLocation.name;
  currentPage: string = Constant.pages.gpsLocation.name;

  street: string = "";

  gbModelRef: BsModalRef;

  markers: Marker[];
  lat: number;
  lng: number;
  zoom: number;
  //
  riders: User[] = [];
  selectedRider: number;
  loading: boolean;
  totalOnline: number;
  totalOffline: number;
  //Timer
  ticks = 0;
  private timer;
  private sub: Subscription;

  async ngOnInit() {
    this.loadInit();

    this.hubConnect();
    // this.initTimer();

    this.zoom = 12;
    this.lat = 21.019614;
    this.lng = 105.841513;
  }

  async hubConnect() {
    this.hubConnection = await this.signalRService.Connect();

    this.hubConnection.on("UpdatePosition", res => {
      let user = res.user as User;

      let findRider = this.riders.find(x => x.id == user.id);

      if (findRider) {
        findRider.currentLat = user.currentLat;
        findRider.currentLng = user.currentLng;
        findRider.lastUpdateLocationTime = user.lastUpdateLocationTime;

        let findMarker = this.markers.find(x => x.id == findRider.id);
        findMarker.lat = user.currentLat;
        findMarker.lng = user.currentLng;

        this.markers = this.markers.filter(x => x.id != findRider.id);
        this.markers.push(findMarker);

        // Map di chuyển theo nhân viên đang chọn
        if (this.selectedRider == findRider.id) {
          this.lat = user.currentLat;
          this.lng = user.currentLng;
        }
      }
    })
  }

  ngOnDestroy() {
    // console.log("Destroy timer");
    // unsubscribe here
    // this.sub.unsubscribe();
    this.signalRService.Disconnect();
  }

  initTimer() {
    this.timer = Observable.timer(2000, 20000);
    // subscribing to a observable returns a subscription object
    this.sub = this.timer.subscribe(t => this.tickerFunc(t));
  }

  tickerFunc(tick) {
    this.ticks = tick;
  }

  async loadInit() {
    this.selectedRider = null;
    this.totalOnline = 0;
    this.totalOffline = 0;
    this.showRiders();
    this.loadRider();
    await this.loadCenter();
    this.loadHubByCurrentUser();
  }

  async loadHubByCurrentUser() {
    let user = await this.authService.getAccountInfoAsync();

    this.selectedCenterHub = user.hub.centerHubId;
    await this.loadPoHub(user.hub.poHubId);
    await this.loadHub(user.hubId);
  }

  async loadRider(hubId: number = null) {
    this.showLoading();

    if (hubId) {
      this.riders = await this.userService.getEmpByHubIdAsync(hubId);
      this.markers = [];

      this.showRiders();
      this.hideLoading();
    }
    else {
      this.userService.getEmpByCurrentHub().subscribe(
        x => {
          if (!super.isValidResponse(x)) return;
          this.riders = x.data as User[];
          this.markers = [];

          this.showRiders();
          this.hideLoading();
        }
      );
    }
  }

  async loadCenter(centerId: number = null) {
    this.centerHub = await this.hubService.getSelectModelCenterHubAsync();
    this.selectedCenterHub = centerId;
  }

  async loadPoHub(poHubId: number = null) {
    this.poHub = await this.hubService.getSelectModelPoHubByCenterIdAsync(this.selectedCenterHub);
    this.selectedPoHub = poHubId;
  }

  async loadHub(hubId: number = null) {
    this.hub = await this.hubService.getSelectModelStationHubByPoIdAsync(this.selectedPoHub);
    this.selectedHub = hubId;
  }

  async changeCenterHub() {
    this.loadPoHub();
    this.loadRider(this.selectedCenterHub);
    let selectModel = this.centerHub.find(x => x.value == this.selectedCenterHub);
    let res: any = await this.geocodingApiService.findFromAddressAsync(selectModel.data.address);
    if (res.geometry.location) {

      this.lat = res.geometry.location.lat;
      this.lng = res.geometry.location.lng;

      this.markers.push({
        id: 0,
        lat: res.geometry.location.lat,
        lng: res.geometry.location.lng,
        label: '',
        draggable: false,
        icon: null,
        isOnline: null,
        data: {
          fullName: selectModel.data.name
        },
      });
      this.street = selectModel.data.address
    }
  }

  async changePoHub() {
    let hubId = this.selectedPoHub ? this.selectedPoHub : this.selectedCenterHub;
    this.loadHub();
    this.loadRider(hubId);

    let selectModel = this.poHub.find(x => x.value == this.selectedPoHub);
    let res: any = await this.geocodingApiService.findFromAddressAsync(selectModel.data.address);
    if (res.geometry.location) {

      this.lat = res.geometry.location.lat;
      this.lng = res.geometry.location.lng;

      this.markers.push({
        id: 0,
        lat: res.geometry.location.lat,
        lng: res.geometry.location.lng,
        label: '',
        draggable: false,
        icon: null,
        isOnline: null,
        data: {
          fullName: selectModel.data.name
        },
      });
      this.street = selectModel.data.address
    }
  }

  async changeHub() {
    let hubId = this.selectedHub ? this.selectedHub : this.selectedPoHub;
    //this.loadHub();
    this.loadRider(hubId);

    let selectModel = this.hub.find(x => x.value == this.selectedHub);
    let res: any = await this.geocodingApiService.findFromAddressAsync(selectModel.data.address);
    if (res.geometry.location) {

      this.lat = res.geometry.location.lat;
      this.lng = res.geometry.location.lng;

      this.markers.push({
        id: 0,
        lat: res.geometry.location.lat,
        lng: res.geometry.location.lng,
        label: '',
        draggable: false,
        icon: null,
        isOnline: null,
        data: {
          fullName: selectModel.data.name
        },
      });
      this.street = selectModel.data.address
    }
  }

  showRiders() {
    this.markers = [];

    this.totalOnline = 0;
    this.totalOffline = 0;
    this.riders.forEach(element => {
      var dateDiff = moment(new Date).diff(element.lastUpdateLocationTime, 'minutes');
      var icon = 'assets/images/maps/user-placeholder-offline.png';
      var isOnline: boolean = false;
      element.typeMap = 0;

      if (0 <= dateDiff && dateDiff <= 2) {
        icon = 'assets/images/maps/user-placeholder-online.png';
        element.typeMap = 1;
        isOnline = true;
        this.totalOnline++;
      } else {
        this.totalOffline++;
      }

      if (element.id === this.selectedRider) {
        icon = 'assets/images/maps/user-placeholder-tracing.png';
        this.zoom = 17;
        this.lat = element.currentLat;
        this.lng = element.currentLng;
        element.typeMap = 2;

        if (!element.currentLat || !element.currentLng) {
          this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Không xác định được vị trí giao nhận" });
          this.street = "";
          this.loadInit();
        }
        else {
          // this.getAddressByLatLng(element.currentLat, element.currentLng);
        }
      }

      this.markers.push({
        id: element.id,
        lat: element.currentLat,
        lng: element.currentLng,
        label: '',
        draggable: false,
        icon: icon,
        isOnline: isOnline,
        data: element,
      });
    });
  }

  ngAfterViewInit() {
    // jQuery(document).ready(function () {
    //   jQuery('.i-checks').iCheck({
    //     checkboxClass: 'icheckbox_square-green',
    //     radioClass: 'iradio_square-green',
    //   });
    //   jQuery('.footable').footable();
    // });
  }

  showLoading() {
    this.loading = true;
  }

  hideLoading() {
    this.loading = false;
  }

  refresh() {
    this.loadInit();
  }

  async clickSelectRider(id: number) {
    this.selectedRider = id;

    let rider = this.riders.find(x => x.id == id);
    if (rider) {
      this.getAddressByLatLng(rider.currentLat, rider.currentLng);
    }

    this.showRiders();
  }

  clickViewDetailUser(template = null, user: User) {
    this.gbModelRef = this.modalService.show(ShipmentAllDetailComponent, { class: 'inmodal animated bounceInRight modal-xlg' });

    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);

    let includes = [
      // Constant.classes.includes.shipment.fromHub,
      // Constant.classes.includes.shipment.toHub,
      // Constant.classes.includes.shipment.fromWard,
      // Constant.classes.includes.shipment.fromDistrict,
      // Constant.classes.includes.shipment.fromProvince,
      // Constant.classes.includes.shipment.toWard,
      // Constant.classes.includes.shipment.toDistrict,
      // Constant.classes.includes.shipment.toProvince,
      // Constant.classes.includes.shipment.shipmentStatus,
      // Constant.classes.includes.shipment.paymentType,
      Constant.classes.includes.shipment.service,
      // Constant.classes.includes.shipment.serviceDVGT,
    ];

    this.shipmentService.getByStatusEmpId(user.id, StatusHelper.picking, firstDay, lastDay, includes).subscribe(
      x => {
        if (!super.isValidResponse(x)) return;
        this.gbModelRef.content.setData(user, x.data as Shipment[]);
      }
    );
  }

  async getAddressByLatLng(lat, lng) {
    if (lat && lng) {
      let res = await this.geocodingApiService.findFirstFromLatLngAsync(lat, lng);
      if (res) {
        res.address_components.map(x => {
          if (x.types.includes("route")) {
            this.street = x.long_name;
          }
        })
      }
    }
  }
}

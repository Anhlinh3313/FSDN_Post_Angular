import { Component, OnInit, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import "jquery-slimscroll";
import { MessageService } from "primeng/components/common/messageservice";
import { PageService, AuthService, NotificationCenterService } from "../../../services/index";
import { Page, User, NotificationCenter } from "../../../models/index";
import { environment } from "../../../../environments/environment";
import { PermissionService } from "../../../services/permission.service";
import { SeriNumberViewModel } from "../../../view-model/SeriNumber.viewModel";
import { SignalRService } from "../../../services/signalR.service";
import { HubConnection } from "@aspnet/signalr";
import { Constant } from "../../../infrastructure/constant";
import { PersistenceService, StorageType } from 'angular-persistence';
declare var jQuery: any;

@Component({
  selector: "app-navigation",
  templateUrl: "navigation.component.html",
  styles: []
})
export class NavigationComponent implements OnInit {

  constructor(
    protected messageService: MessageService,
    private pageService: PageService,
    protected signalRService: SignalRService,
    private notificationCenterService: NotificationCenterService,
    private el: ElementRef,
    public permissionService: PermissionService,
    public router: Router,
    protected authService: AuthService,
    private persistenceService: PersistenceService
  ) {
  }
  styleBackGround: string;
  isToggle: boolean = false;
  saveSelectedIndex: number;
  hubConnection: HubConnection;
  selectNavItemIndex: number = null;
  notificationCenter: NotificationCenter = new NotificationCenter();
  //
  logo: string = environment.urlLogo;
  pages: Page[];
  sideMenu: any;
  ngOnInit() {
    //
    if (environment.namePrint === "Vintrans") {
      this.styleBackGround = "#fff";
    } else {
      this.styleBackGround = "#000000";
    }
    this.sideMenu = jQuery(this.el.nativeElement).find("#side-menu");
    this.pageService.getMenuByModuleId(3).subscribe(x => {
      if (x.isSuccess == false) return;
      this.pages = x.data as Page[];

      this.pages.forEach(element => {
        element.children = this.pages.filter(
          x => x.parentPageId === element.id
        );
      });
      this.sideMenu.metisMenu("dispose");
      if (jQuery("body").hasClass("fixed-sidebar")) {
        jQuery(".sidebar-collapse").slimscroll({
          height: "100%"
        });
      }
      this.pages.forEach(element => {
        element.display = "none";
        element.active = "noactive";
      });
      //check time login
      let datetimeLogin = this.persistenceService.get(Constant.auths.datetimeLogin, StorageType.LOCAL);
      if (datetimeLogin) {
        var timeLogin = new Date(datetimeLogin);
        var timeCurrent = new Date();
        if (timeCurrent.getDay() != timeLogin.getDay()) {
          this.logOut();
        }
      } else {
        this.logOut();
      }
      //
      this.getNotificationMenu();
      this.hubConnect();
    });
  }

  public logOut() {
    this.authService.logout();
  }

  async hubConnect() {
    this.hubConnection = await this.signalRService.Connect();
    this.hubConnection.on("SendNotificationMenu", res => {
      let viewModel = res.data as SeriNumberViewModel;
      this.authService.getAccountInfoAsync().then(x => {
        let user = x as User;
        if (viewModel.userId) {
          if (user.id == viewModel.userId) this.getNotificationMenu();
        } else {
          if (viewModel.hubId) {
            if (viewModel.hubId == user.hubId) {
              this.getNotificationMenu();
            }
          } else {
            this.getNotificationMenu();
          }
        }
      });
    });
  }

  ngOnDestroy() {
    // console.log("Destroy timer");
    // unsubscribe here
    // this.sub.unsubscribe();
    //this.signalRService.Disconnect();
  }

  ngAfterViewInit() {
    jQuery("#side-menu").metisMenu();

    if (jQuery("body").hasClass("fixed-sidebar")) {
      jQuery(".sidebar-collapse").slimscroll({
        height: "100%"
      });
    }
  }

  selectNav(select) {
    if (
      !select.parentPageId &&
      (select.children && select.children.length === 0)
    ) {
      this.pages.forEach(x => {
        if (x != select) {
          let index = this.pages.indexOf(x);
          this.pages[index].display = "none";
          this.pages[index].active = "noactive";
        }
      });
      this.isToggle = false;
    }
    if (
      !select.parentPageId &&
      (select.children && select.children.length > 0)
    ) {
      let index = this.pages.indexOf(select);
      this.saveSelected();
      this.selectNavItemIndex = index;
    }
  }

  saveSelected() {
    this.saveSelectedIndex = this.selectNavItemIndex;
  }

  showItems(event, page) {
    setTimeout(() => {
      if (
        this.saveSelectedIndex == null ||
        this.saveSelectedIndex !== this.selectNavItemIndex
      ) {
        this.isToggle = true;
        this.pages[this.selectNavItemIndex].display = "block";
        this.pages[this.selectNavItemIndex].active = "active";
        if (this.saveSelectedIndex) {
          this.pages[this.saveSelectedIndex].display = "none";
          this.pages[this.saveSelectedIndex].active = "noactive";
        }
      } else {
        this.pages[this.selectNavItemIndex].display = "none";
        this.pages[this.selectNavItemIndex].active = "noactive";
        if (this.saveSelectedIndex) {
          this.pages[this.saveSelectedIndex].display = "none";
          this.pages[this.saveSelectedIndex].active = "noactive";
        }
        //
        this.isToggleItem();
      }
    }, 0);
  }

  isToggleItem() {
    if (this.isToggle == false) {
      this.pages[this.selectNavItemIndex].display = "block";
      this.pages[this.selectNavItemIndex].active = "active";
      this.isToggle = true;
    } else {
      this.pages[this.selectNavItemIndex].display = "none";
      this.pages[this.selectNavItemIndex].active = "noactive";
      this.isToggle = false;
    }
  }

  async getNotificationMenu() {
    var res = await this.notificationCenterService.getNotificationMenuAsync();
    if (res) {
      this.notificationCenter = res;
      //request
      let newReuqest = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.pickupManagement.children.waitAssignPickup.alias) > 0);
      if (newReuqest) newReuqest.notification = this.notificationCenter.countNewRequest;
      //waitingHandle 
      let waitingHandle = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.shipment.children.shipmentAwaiting.alias) > 0);
      if (waitingHandle) waitingHandle.notification = this.notificationCenter.countHandleShipment;
      //complain
      let complain = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.shipment.children.shipmentComplain.alias) > 0);
      if (complain) complain.notification = this.notificationCenter.countComplain;
      //incidents
      let incidents = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.shipment.children.incidentManagement.alias) > 0);
      if (incidents) incidents.notification = this.notificationCenter.countIncidents;
      //incidents
      let compensation = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.shipment.children.managementCompensation.alias) > 0);
      if (compensation) compensation.notification = this.notificationCenter.countCompensation;
      //delay
      let delay = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.shipment.children.managementDelay.alias) > 0);
      if (delay) delay.notification = this.notificationCenter.countShipmentDelay;
      //acceptReturn
      let acceptReturn = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.return.children.waitReturn.alias) > 0);
      if (acceptReturn) acceptReturn.notification = this.notificationCenter.countWaitingAcceptReturn;
      //createReturn
      let createReturn = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.return.children.cancelreturn.alias) > 0);
      if (createReturn) createReturn.notification = this.notificationCenter.countWaitingCreateReturn;
      //warehouse
      let warehouse = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.warehouse.children.inventory.alias) > 0);
      if (warehouse) warehouse.notification = this.notificationCenter.countPrioritize + this.notificationCenter.countShipmentIncidents;
      //awaitAccountingAcceptListReceiptMoney
      let awaitAccountingAcceptListReceiptMoney = this.pages.find(f => f.parentPageId && f.aliasPath.indexOf(Constant.pages.receiptMoney.children.comfirmMoneyFromHub.alias) > 0);
      if (warehouse) awaitAccountingAcceptListReceiptMoney.notification = this.notificationCenter.countPrioritize + this.notificationCenter.countListReceiptMoneyAccept;
      //
      this.pages.filter(f => !f.parentPageId).map(
        m => {
          //m.notification = 0;
          let listChild = this.pages.filter(f => f.parentPageId == m.id && f.notification).map(m => m.notification);
          if (listChild && listChild.length > 0) m.notification = listChild.reduce((s, c) => s + c);
        }
      );
    }
  }
}

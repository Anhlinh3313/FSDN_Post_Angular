import {
    Component,
    OnInit,
    TemplateRef,
    HostListener,
} from "@angular/core";
import { BaseComponent } from "../../../shared/components/baseComponent";
import { MessageService } from "../../../../../node_modules/primeng/components/common/messageservice";
import { PermissionService } from "../../../services/permission.service";
import { Router } from "../../../../../node_modules/@angular/router";
import { Constant } from "../../../infrastructure/constant";
import { SoundHelper } from "../../../infrastructure/sound.helper";
import { SelectItem, LazyLoadEvent } from "../../../../../node_modules/primeng/primeng";
import { UserService, ShipmentService, AuthService, RequestShipmentService, HubService, CustomerService } from "../../../services";
import { BsModalRef, BsModalService } from "../../../../../node_modules/ngx-bootstrap";
import { StatusHelper } from "../../../infrastructure/statusHelper";
import { ShipmentTracking } from "../../../models/abstract/shipmentTracking.interface";
import { ListUpdateStatusViewModel } from "../../../view-model";
import { Shipment, User, Customer } from "../../../models";
import { ShipmentFilterViewModel } from "../../../models/shipmentFilterViewModel";
import { ShipmentTypeHelper } from "../../../infrastructure/shipmentType.helper";
import { FilterUtil } from "../../../infrastructure/filter.util";
import { environment } from "../../../../environments/environment";
import { SignalRService } from "../../../services/signalR.service";
import { PersistenceService, StorageType } from "../../../../../node_modules/angular-persistence";
import { SelectModel } from "../../../models/select.model";

declare var jQuery: any;

@Component({
    selector: 'app-shipment-awaiting',
    templateUrl: 'shipment-awaiting.component.html',
    styles: []
})

export class ShipmentAwaitingComponent extends BaseComponent implements OnInit {
    unit = environment.unit;
    env = environment;
    //
    parentPage: string = Constant.pages.shipment.name;
    currentPage: string = Constant.pages.shipment.children.shipmentAwaiting.name;
    //
    columns: any[] = [
        { field: "id", header: 'ID' },
        { field: "shipmentNumber", header: 'Mã vận đơn' },
        { field: "requestShipmentId", header: 'Mã bill tổng' },
        { field: "cusNote", header: 'Yêu cầu phục vụ' },
        { field: "orderDate", header: 'Ngày gửi' },
        { field: "paymentType.name", header: 'HTTT' },
        { field: "service.name", header: 'Dịch vụ' },

        { field: "shipmentServiceDVGTs", header: 'Dịch vụ gia tăng' },
        { field: "defaultPrice", header: 'Cước chính' },
        { field: "fuelPrice", header: 'PPXD' },
        { field: "remoteAreasPrice", header: 'VSVX' },
        { field: "totalDVGT", header: 'Phí DVGT' },
        { field: "vatPrice", header: 'VAT' },
        { field: "totalPrice", header: 'Tổng cước' },

        { field: "shipmentStatus.name", header: 'Trạng thái' },
        { field: "deliverUser.fullName", header: 'Nhân viên gửi' },
        { field: "senderName", header: 'Tên người gửi' },
        { field: "senderPhone", header: 'Đt gửi' },
        { field: "companyFrom", header: 'CTY gửi' },
        { field: "pickingAddress", header: 'Địa chỉ gửi' },
        { field: "fromWard.district.province.name", header: 'Tỉnh đi' },
        { field: "fromHub.name", header: 'Trạm lấy' },
        { field: "fromHubRouting.name", header: 'Tuyến lấy' },
        { field: "receiverName", header: 'Tên người nhận' },
        { field: "receiverPhone", header: 'Đt nhận' },
        { field: "companyTo", header: 'CTY nhận' },
        { field: "addressNoteTo", header: 'Địa chỉ nhận chi tiết' },
        { field: "shippingAddress", header: 'Địa chỉ nhận' },
        { field: "toWard.district.province.name", header: 'Tỉnh đến' },
        { field: "toHub.name", header: 'Trạm giao' },
        { field: "toHubRouting.name", header: 'Tuyến giao' },
    ];
    //
    constructor(
        protected messageService: MessageService,
        public permissionService: PermissionService,
        public router: Router,
        //ServiceModel
        private userService: UserService,
        private modalService: BsModalService,
        protected authService: AuthService,
        private shipmentService: ShipmentService,
        private requestShipmentService: RequestShipmentService,
        private hubService: HubService,
        private customerService: CustomerService,
        private signalRService: SignalRService,
        private persistenceService: PersistenceService,

    ) {
        super(messageService, permissionService, router);

        let includes: string =
            Constant.classes.includes.shipment.shipmentStatus + "," +
            Constant.classes.includes.shipment.service + "," +
            Constant.classes.includes.shipment.fromHub + "," +
            Constant.classes.includes.shipment.toHub + "," +
            Constant.classes.includes.shipment.toHubRouting + "," +
            Constant.classes.includes.shipment.pickUser + "," +
            Constant.classes.includes.shipment.fromWard + "," +
            Constant.classes.includes.shipment.toWard + "," +
            Constant.classes.includes.shipment.fromDistrict + "," +
            Constant.classes.includes.shipment.fromProvince + "," +
            Constant.classes.includes.shipment.toDistrict + "," +
            Constant.classes.includes.shipment.toProvince + "," +
            Constant.classes.includes.shipment.deliverUser + "," +
            Constant.classes.includes.shipment.paymentType + "," +
            Constant.classes.includes.shipment.sender + "," +
            Constant.classes.includes.shipment.structure + "," +
            Constant.classes.includes.shipment.serviceDVGT + "," +
            Constant.classes.includes.shipment.boxes;

        this.shipmentFilterViewModel.Cols = includes;
        this.shipmentFilterViewModel.Type = ShipmentTypeHelper.waitingHaindling;
        this.shipmentFilterViewModel.PageNumber = this.pageNum;
        this.shipmentFilterViewModel.PageSize = this.rowPerPage;
    }
    //
    pageNum = 1;
    rowPerPage: number = 20;
    //
    shipmentNumberTracking: string;
    shipmentNumber: string;
    shipmentData: Shipment = new Object() as Shipment;
    shipmentDataTracking: ShipmentTracking = new Object() as ShipmentTracking;
    txtNote: string;
    shipmentFilterViewModel: ShipmentFilterViewModel = new ShipmentFilterViewModel();
    datasource: Shipment[];
    //
    selectedTab: number = 1;
    tabIndex: number;
    //
    listUserByCurrentHub: SelectItem[] = [];
    selectedUserByCurrentHub: any;
    //
    currentUserId: number;
    currentHubId: number;
    //
    totalRecords: number = 0;
    event: LazyLoadEvent;
    filterRows: Shipment[];
    listData: Shipment[];
    //
    hubs: SelectItem[];
    selectedHub: number;
    //
    emps: SelectItem[];
    selectedEmp: number;
    //
    senders: SelectItem[];
    selectedSender: number;
    //
    modalTitle: string;
    bsModalRefHandling: BsModalRef;
    shipmetHandling: Shipment;
    txtNoteHandling: string;
    //
    listHandling: SelectItem[] = [
        { label: `Đã xử lý`, value: 1 },
        { label: `Sự cố`, value: 2 },
    ];
    selectedHandling: number = 1;
    listWarehousing: SelectItem[] = [
        { label: `-- Chọn nhập kho`, value: null },
        { label: `Nhập kho đến hàng`, value: 1 },
        { label: `Nhập kho trả hàng`, value: 2 },
    ];
    selectedWarehousing: number;
    empsInHandling: SelectItem[];
    selectedEmpInHandling: number;
    //
    numberSetup: number;
    numberCount: number = 0;
    setInterval = null;

    employee: any;
    employees: any;
    filteredEmployees: any;
    selectedEmployee: number;

    customers: SelectModel[];
    // selectedCustomer: number;
    customer: any;
    filteredCustomers: any;
    //
    ngOnInit() {
        this.getAllUserByCurrentHub();
        this.loadCurrentHub();
        this.loadShipmentPaging();
        this.loadHub();
        this.loadSender();
        this.loadEmp();
        // var refresh = this.refresh();
        // jQuery(function ($) {
        //     var timer, nofixed, scroll;
        //     $(document).bind('mousemove click keydown', function () {
        //         clearTimeout(timer);
        //         preparetosleep();
        //     });
        //     function preparetosleep() {
        //         timer = setTimeout(function () {
        //             $(".btn-refreshTable").trigger('click')
        //         }, 60000);
        //     }
        //     preparetosleep();
        // });
        this.numberSetup = this.persistenceService.get("numberSetup", StorageType.LOCAL);
    }

    selectTab(num) {
        this.selectedTab = num;
    }
    async scaneShipmentNumber() {
        if (this.shipmentNumber) {
            // this.resetData();
            let includes = [
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
            if (this.shipmentNumber) {
                this.shipmentNumberTracking = this.shipmentNumber
            }
            const Shipmentdata = await this.shipmentService.trackingShortAsyncTransferReceive(this.shipmentNumber.trim(), includes);
            if (Shipmentdata) {
                this.loadData(Shipmentdata);
            }
        }
        // this.shipmentNumber = null;
    }
    async loadData(shipment: any) {
        this.shipmentData = null;
        if (this.currentHubId == shipment.currentHubId) {
            if (shipment.shipmentStatusId != StatusHelper.WaitingHaindling && shipment.shipmentStatusId != StatusHelper.Incident && shipment.shipmentStatusId != StatusHelper.Compensation) {
                this.shipmentData = shipment;
                const data = await this.shipmentService.getByShipmentNumberAsync(this.shipmentNumberTracking.trim());
                if (data) {
                    this.shipmentDataTracking = data;
                }
            }
            else {
                this.messageService.add({
                    severity: Constant.messageStatus.warn, detail: "Không thể thây đổi vận đơn này!",
                });
            }
        } else {
            this.messageService.add({
                severity: Constant.messageStatus.warn, detail: "Vận đơn không thuộc thuộc trạm!",
            });
        }
    }
    getAllUserByCurrentHub() {
        this.userService.getAllUserByCurrentHubAsync().then(data => {
            this.listUserByCurrentHub.push({ value: 0, label: "Chọn nhân viên" });
            data.forEach(item => {
                this.listUserByCurrentHub.push({ value: item.id, label: item.code + " - " + item.fullName });
            })
        })
    }
    async loadCurrentHub() {
        const id = this.authService.getUserId();
        this.currentUserId = id;
        const arrCols = ["Hub"];
        const user = await this.userService.getAsync(id, arrCols);
        if (user) {
            if (user.hub) {
                this.currentHubId = user.hub.id;
            }
        }
    }

    async Confirm() {
        this.shipmentData.note = this.txtNote;
        this.shipmentData.shipmentStatusId = StatusHelper.WaitingHaindling;
        // this.shipmentData.shipmentStatus = null;
        if (!this.shipmentData.structureId) {
            this.messageService.add({
                severity: Constant.messageStatus.warn, detail: "Không thể cập nhật vận đơn này!",
            });
            return;
        }
        const ConfirmFinal = await this.shipmentService.assignStatusCurrentEmpAsync(this.shipmentData);
        if (ConfirmFinal) {
            this.messageService.add({
                severity: Constant.messageStatus.success, detail: "Cập nhật vận đơn thành công!",
            });
            SoundHelper.getSoundMessage(Constant.messageStatus.success);
        }
        this.shipmentData = new Shipment;
        this.shipmentDataTracking = new Object() as ShipmentTracking;
        this.shipmentNumber = null;
        this.txtNote = null;
        this.loadShipmentPaging();
    }
    async loadShipmentPaging() {
        await this.shipmentService.postByTypeAsync(this.shipmentFilterViewModel).then(x => {
            if (x) {
                const data = x.data as Shipment[];
                this.datasource = data.reverse();
                this.totalRecords = x.dataCount;
                // return this.datasource;
            }
        });
    }
    onPageChange(event: any) {
        this.shipmentFilterViewModel.PageNumber = event.first / event.rows + 1;
        this.shipmentFilterViewModel.PageSize = event.rows;
        setTimeout(() => {
            this.loadShipmentPaging();
        }, 0);
    }
    loadLazy(event: LazyLoadEvent) {
        this.event = event;
        //imitate db connection over a network
        setTimeout(() => {
            if (this.datasource) {
                this.filterRows = this.datasource;


                // sort data
                this.filterRows.sort(
                    (a, b) =>
                        FilterUtil.compareField(a, b, event.sortField) * event.sortOrder
                );
                this.listData = this.filterRows;
                // this.totalRecords = this.filterRows.length;
            }
        }, 250);
    }
    loadHub() {
        this.hubService.getSelectModelPoHubAsync().then(x => {
            this.hubs = x;
        })
    }
    changeHub() {
        this.shipmentFilterViewModel.CurrentHubId = this.selectedHub;
        this.loadShipmentPaging();
        this.loadEmp();
    }
    loadEmp() {
        this.selectedEmp = null;
        this.emps = [];
        if (this.selectedHub) {
            this.userService.getSelectModelAllRiderInCenterByHubIdAsync(this.selectedHub).then(x => {
                this.emps = x;
            })
        } else {
            this.userService.getSelectModelAllUserByCurrentHubAsync().then(x => {
                this.emps = x;
            })
        }

    }
    changeEmp() {
        this.shipmentFilterViewModel.currentEmpId = this.selectedEmp;
        this.loadShipmentPaging();
    }
    loadSender() {
        this.senders = [];
        this.customerService.getAllSelectModelAsync().then(x => {
            this.senders = x;
        })
    }
    changeSender() {
        this.shipmentFilterViewModel.SenderId = this.selectedSender;
        this.loadShipmentPaging();
    }
    refresh() {
        this.selectedEmp = null;
        this.selectedHub = null;
        this.selectedSender = null;
        this.shipmentFilterViewModel.currentEmpId = null;
        this.shipmentFilterViewModel.CurrentHubId = null;
        this.shipmentFilterViewModel.SenderId = null;
        this.loadShipmentPaging();
    }
    refreshTable() {
        this.loadShipmentPaging();
    }
    handlingPopup(template: TemplateRef<any>, data: Shipment) {
        this.shipmetHandling = null;
        this.selectedHandling = 1;
        this.selectedEmpInHandling = null;
        this.selectedWarehousing = null;
        this.txtNoteHandling = null;
        this.modalTitle = "Xử lý";
        this.bsModalRefHandling = this.modalService.show(template, {
            class: "inmodal animated bounceInRight modal-s"
        });
        this.shipmetHandling = data;
        this.loadEmpInHandling();
    }
    async handlingConfirm() {
        if (this.selectedHandling == 1) {
            if (this.selectedWarehousing == null) {
                this.messageService.add({
                    severity: Constant.messageStatus.warn, detail: "Nhập kho không được để trống!",
                });
            }
            if (this.selectedWarehousing == 1) {
                if (this.shipmetHandling.toHubId == this.currentHubId) {
                    this.shipmetHandling.note = this.txtNoteHandling;
                    this.shipmetHandling.shipmentStatusId = StatusHelper.readyToDelivery;
                    const ConfirmFinal = await this.shipmentService.assignStatusCurrentEmpAsync(this.shipmetHandling);
                    if (ConfirmFinal) {
                        this.messageService.add({
                            severity: Constant.messageStatus.success, detail: "Cập nhật vận đơn thành công!",
                        });
                        SoundHelper.getSoundMessage(Constant.messageStatus.success);
                    }
                    this.loadShipmentPaging();
                    this.bsModalRefHandling.hide();

                } else {
                    this.shipmetHandling.note = this.txtNoteHandling;
                    this.shipmetHandling.shipmentStatusId = StatusHelper.waitingToTransfer;
                    const ConfirmFinal = await this.shipmentService.assignStatusCurrentEmpAsync(this.shipmetHandling);
                    if (ConfirmFinal) {
                        this.messageService.add({
                            severity: Constant.messageStatus.success, detail: "Cập nhật vận đơn thành công!",
                        });
                        SoundHelper.getSoundMessage(Constant.messageStatus.success);
                    }
                    this.loadShipmentPaging();
                    this.bsModalRefHandling.hide();
                }
            } else if (this.selectedWarehousing == 2) {
                if (this.shipmetHandling.fromHubId == this.currentHubId) {
                    this.shipmetHandling.note = this.txtNoteHandling;
                    this.shipmetHandling.shipmentStatusId = StatusHelper.readyToReturn;

                    const ConfirmFinal = await this.shipmentService.assignStatusCurrentEmpAsync(this.shipmetHandling);
                    if (ConfirmFinal) {
                        this.messageService.add({
                            severity: Constant.messageStatus.success, detail: "Cập nhật vận đơn thành công!",
                        });
                        SoundHelper.getSoundMessage(Constant.messageStatus.success);
                    }
                    this.loadShipmentPaging();
                    this.bsModalRefHandling.hide();
                } else {
                    this.shipmetHandling.note = this.txtNoteHandling;
                    this.shipmetHandling.shipmentStatusId = StatusHelper.readyToTransferReturn;

                    const ConfirmFinal = await this.shipmentService.assignStatusCurrentEmpAsync(this.shipmetHandling);
                    if (ConfirmFinal) {
                        this.messageService.add({
                            severity: Constant.messageStatus.success, detail: "Cập nhật vận đơn thành công!",
                        });
                        SoundHelper.getSoundMessage(Constant.messageStatus.success);
                    }
                    this.loadShipmentPaging();
                    this.bsModalRefHandling.hide();
                }
            }
        } else if (this.selectedHandling == 2) {
            this.shipmetHandling.note = this.txtNoteHandling;
            this.shipmetHandling.shipmentStatusId = StatusHelper.Incident;
            this.shipmetHandling.handlingEmpId = this.selectedEmpInHandling;

            const ConfirmFinal = await this.shipmentService.assignStatusCurrentEmpAsync(this.shipmetHandling);
            if (ConfirmFinal) {
                this.messageService.add({
                    severity: Constant.messageStatus.success, detail: "Cập nhật vận đơn thành công!",
                });
                SoundHelper.getSoundMessage(Constant.messageStatus.success);
            }
            this.loadShipmentPaging();
            this.bsModalRefHandling.hide();
        }
    }
    handlingChange() {
        // if (this.selectedHandling == 1) {
        //     this.selectedEmpInHandling = null;
        // }
        // else {
        //     this.selectedWarehousing = null;
        // }
    }
    loadEmpInHandling() {
        this.userService.getSelectModelAllUserByCurrentHubAsync().then(x => {
            this.empsInHandling = x;
        })
    }

    @HostListener('document:mousemove', ['$event']) onMouseMove(e) {
        if (this.numberSetup) {
            this.setupNumberCount();
        }
    };

    @HostListener('document:keypress', ['$event']) onKeypress(e) {
        if (this.numberSetup) {
            this.setupNumberCount();
        }
    }
    setTimeoutToRefresh() {
        if (this.numberSetup <= 0 || this.numberSetup > 60) {
            this.messageService.add({
                severity: Constant.messageStatus.warn,
                detail: "Vui lòng nhập số giây hợp lệ"
            });
        }
        else {
            this.setupNumberCount();
        }
    }
    setupNumberCount() {
        this.clearNumberCount();
        this.persistenceService.set("numberSetup", this.numberSetup, { type: StorageType.LOCAL });
        let numberSetup = this.numberSetup;
        let i = 0;
        this.setInterval = setInterval(() => {
            i++;
            this.numberCount = i;
            if (i == numberSetup) {
                i = 0;
                this.refreshTable();
            }
        }, 1000)
    }
    clearNumberCount() {
        clearInterval(this.setInterval);
    }
    ngOnDestroy() {
        this.signalRService.Disconnect();
        this.clearNumberCount();
    }

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

    onSelectedCustomer() {
        let cloneSelectedCustomer = this.customer;
        let index = cloneSelectedCustomer.indexOf(" -");
        let customers: any;
        if (index !== -1) {
            customers = cloneSelectedCustomer.substring(0, index);
            cloneSelectedCustomer = customers;
        }
        this.customers.forEach(x => {
            let obj = x.data as Customer;
            if (obj) {
                if (cloneSelectedCustomer === x.label) {
                    this.shipmentFilterViewModel.SenderId = obj.id;
                    this.loadShipmentPaging();
                }
            }
        });
    }

    keyTabSender(event) {
        let value = event.target.value;
        if (value && value.length > 0) {
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
                            this.shipmentFilterViewModel.SenderId = findCus.value;
                            this.customer = findCus.label;
                        }
                        else {
                            this.shipmentFilterViewModel.SenderId = null
                        }
                        this.loadShipmentPaging();
                    } else {
                        this.shipmentFilterViewModel.SenderId = null;
                        this.loadShipmentPaging();
                    }
                }
            );
        } else {
            this.shipmentFilterViewModel.SenderId = null;
            this.loadShipmentPaging();
        }
    }
}
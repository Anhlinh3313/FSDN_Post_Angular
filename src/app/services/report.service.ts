import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from "../models/response.model";
import { GeneralService } from "./general.service";
import { PersistenceService } from "angular-persistence";
import { environment } from "../../environments/environment";
import { HttpParams } from '@angular/common/http';
import { MessageService } from "primeng/components/common/messageservice";
import { HubTransfer } from "../models/hubTransfer.model";
import { StringHelper } from "../infrastructure/string.helper";
import { ResponseOfReportModel } from "../models/abstract/responseOfReportModel.interface";
import { ReportPickupDetail } from "../models/reportPickupDetail.model";
import { ReportDeliveryDetail } from "../models/reportDeliveryDetail.model";
import { ReportDeliveryFail } from "../models/reportDeliveryFail.model";
import { ReportResultBusiness } from "../models/reportResultBusiness.model";
import { ReportKPICustomer } from "../models/reportKPICustomer.model";
import { ReportKPIBusiness } from "../models/reportKPIBusiness.model";
import { ReportLadingScheduleFilter } from "../models/reportLadingScheduleFilter.model";
import { ReportLadingSchedule } from "../models/reportLadingSchedule.model";
import { ReportTruckTransferFilter } from "../models/reportTruckTransferFilter.model";
import { ReportTruckTransfer } from "../models/reportTruckTransfer.model";
import { ReportEmpReceiptIssueFilter } from "../models/reportEmpReceiptIssueFilter.model";
import { ReportEmpReceiptIssue } from "../models/reportEmpReceiptIssue.model";
import { ReportIncidents } from "../models/reportIncidents.model";
import { ReportIncidentsFilter } from "../models/ReportIncidentsFilter.model";
import { DashboardFilter } from "../models/dashboardFilter.model";
import { DashboardPickup } from "../models/dashboardPickup.model";
import { DashboardTransfer } from "../models/dashboardTransfer.model";
import { DashboardDeliveryAndReturn } from "../models/dashboardDeliveryAndReturn.model";
import { DashboardService } from "../models/dashboardService.model";
import { ListGoods } from "../models/listGoods.model";
import { ReportByCus } from "../models/reportByCus.model";
import { ReportByCusFilter } from "../models/ReportByCusFilter.model";
import { ReportRevenueMonth } from "../models/reportRevenueMonth.model";
import { ReportRevenueYear } from "../models/reportRevenueYear.model";
import { ReportHanldeEmployee } from "../models/reportHanleEmployee.model";
import { ReportFilterViewModel } from "../models/reportFilterViewModel.model ";
import { ShipmentFilterViewModel } from "../models/shipmentFilterViewModel";
import { ReportCODConfirm } from "../models/reportCODConfirm.model";
import { ReportCODConfirmFilter } from "../models/reportCODConfirmFilter.model";
import { ShipmentVersionFilterModel } from "../models/ShipmentVersionFilterModel.model";
import { ReportExpenseFilterModel } from "../models/reportExpenseFilter.model";

@Injectable()
export class ReportService extends GeneralService {
  constructor(
    protected messageService: MessageService,
    protected httpClient: HttpClient,
    protected persistenceService: PersistenceService
  ) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "Report");
  }
  getReportSumary(fromDate: string = null, toDate: string = null, type?: string, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let params = new HttpParams();
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    params = params.append("type", type);
    return super.getCustomApiPaging("getReportSumary", arrCols, params, pageSize, pageNumber)
  }
  getReportCustomer(type: number = null, customerId: number = null, fromDate: string = null, toDate: string = null, hubId: any) {
    let params = new HttpParams();
    params = params.append("type", type + "");
    params = params.append("customerId", customerId + "");
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    params = params.append("hubId", hubId);
    return super.getCustomApiPaging("getReportCustomer", [], params, null, null)
  }
  getReportShipmentVersion(model: ShipmentVersionFilterModel) { 
    return super.postCustomApi("GetReportShipmentVersion", model)
  } 
  getReportPickupDelivery(hubId: number = null, userId: number = null, fromDate: string = null, toDate: string = null, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let params = new HttpParams();
    params = params.append("hubId", hubId + "");
    params = params.append("userId", userId + "");
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    return super.getCustomApiPaging("GetReportPickupDelivery", arrCols, params, pageSize, pageNumber)
  }
  reportUpdateReceiveInformation(hubId: number = null, userId: number = null, fromDate: string = null, toDate: string = null, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let model = new Object();
    model["hubId"] = hubId;
    model["empId"] = userId;
    model["dateFrom"] = fromDate;
    model["dateTo"] = toDate;
    return super.postCustomApiPaging("GetReportUpdateReceiveInformation", model);
  }
  getReportPaymentEmployees(hubId: number = null, userId: number = null, fromDate: string = null, toDate: string = null, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let model = new Object();
    model["hubId"] = hubId;
    model["empId"] = userId;
    model["dateFrom"] = fromDate;
    model["dateTo"] = toDate;
    return super.postCustomApiPaging("GetReportPaymentEmployees", model);
  }
  async getReportPickupDelaveryAsync(hubId: number = null, userId: number = null, fromDate: string = null, toDate: string = null, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let res = await this.getReportPickupDelivery(hubId, userId, fromDate, toDate, arrCols, pageSize, pageNumber).toPromise();
    return res;
  }
  async reportUpdateReceiveInformationAsync(hubId: number = null, userId: number = null, fromDate: string = null, toDate: string = null, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let res = await this.reportUpdateReceiveInformation(hubId, userId, fromDate, toDate, arrCols, pageSize, pageNumber).toPromise();
    return res;
  }
  async getReportPaymentEmployeesAsync(hubId: number = null, userId: number = null, fromDate: string = null, toDate: string = null, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let res = await this.getReportPaymentEmployees(hubId, userId, fromDate, toDate, arrCols, pageSize, pageNumber).toPromise();
    return res;
  }
  getReportPayablesAndReceivablesByCustomer(type: number = null, customerId: number = null, fromDate: string = null, toDate: string = null, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let params = new HttpParams();
    params = params.append("type", type + "");
    params = params.append("customerId", customerId + "");
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    return super.getCustomApiPaging("getReportPayablesAndReceivablesByCustomer", arrCols, params, pageSize, pageNumber)
  }

  getReportTransfer(isAllowChild: boolean, hubId: number, fromDate?: string, toDate?: string, arrCols?: string[], pageSize?: number, pageNumber?: number) {
    let params = new HttpParams();
    params = params.append("isAllowChild", isAllowChild + "");
    params = params.append("hubId", hubId + "");
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    return super.getCustomApiPaging("GetReportTransfer", arrCols, params, pageSize, pageNumber);
  }

  async getReportTransferAsync(isAllowChild: boolean, hubId: number, fromDate?: string, toDate?: string, arrCols?: string[], pageSize?: number, pageNumber?: number) {
    const res = await this.getReportTransfer(isAllowChild, hubId, fromDate, toDate, arrCols, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as HubTransfer[];
    return data;
  }
  getReportDeliveryByListGoods(fromDate: any = null, toDate: any = null, arrCols: string[] = [], isAllowChild: boolean = false, hubId: number = null, userId: number = null, pageSize: number = null, pageNumber: number = null) {
    let params = new HttpParams();
    params = params.append("isAllowChild", isAllowChild + "");
    params = params.append("hubId", hubId + "");
    params = params.append("userId", userId + "");
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    return super.getCustomApiPaging("GetReportDeliveryByListGoods", arrCols, params, pageSize, pageNumber);
  }

  getReportPrintShipment(hubId?: number, empId?: number, typePrintId?: number, dateFrom?: any, dateTo?: any, searchText?: string, pageSize: number = null, pageNumber: number = null) {
    let params = new HttpParams();
    params = params.append("hubId", hubId + "");
    params = params.append("empId", empId + "");
    params = params.append("typePrintId", typePrintId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    if (StringHelper.isNullOrEmpty(searchText)) {
      searchText = "";
    }
    params = params.append("searchText", searchText);
    return super.getCustomApiPaging("GetReportPrintShipment", [], params, pageSize, pageNumber);
  }

  async getReportPrintShipmentAsync(hubId?: number, empId?: number, typePrintId?: number, dateFrom?: any, dateTo?: any, searchText?: string, pageSize: number = null, pageNumber: number = null): Promise<ResponseModel> {
    const res = await this.getReportPrintShipment(hubId, empId, typePrintId, dateFrom, dateTo, searchText, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  getHistoryPrintShipmentId(shipmentId: number, hubId?: number, empId?: number, typePrintId?: number, dateFrom?: any, dateTo?: any, pageSize: number = null, pageNumber: number = null) {
    let params = new HttpParams();
    params = params.append("shipmentId", shipmentId + "");
    params = params.append("hubId", hubId + "");
    params = params.append("empId", empId + "");
    params = params.append("typePrintId", typePrintId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    return super.getCustomApiPaging("GetHistoryPrintShipmentId", [], params, pageSize, pageNumber);
  }

  async getHistoryPrintShipmentIdAsync(shipmentId: number, hubId?: number, empId?: number, typePrintId?: number, dateFrom?: any, dateTo?: any, pageSize: number = null, pageNumber: number = null): Promise<ResponseModel> {
    const res = await this.getHistoryPrintShipmentId(shipmentId, hubId, empId, typePrintId, dateFrom, dateTo, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  getReportCancelShipment(hubId?: number, empId?: number, senderId?: number, dateFrom?: any, dateTo?: any, searchText?: string, pageSize: number = null, pageNumber: number = null) {
    let params = new HttpParams();
    params = params.append("hubId", hubId + "");
    params = params.append("empId", empId + "");
    params = params.append("senderId", senderId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    if (StringHelper.isNullOrEmpty(searchText)) {
      searchText = "";
    }
    params = params.append("searchText", searchText);
    return super.getCustomApiPaging("GetReportCancelShipment", [], params, pageSize, pageNumber);
  }

  async getReportCancelShipmentAsync(hubId?: number, empId?: number, senderId?: number, dateFrom?: any, dateTo?: any, searchText?: string, pageSize: number = null, pageNumber: number = null): Promise<ResponseModel> {
    const res = await this.getReportCancelShipment(hubId, empId, senderId, dateFrom, dateTo, searchText, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  getReportDebtPriceDetailByCustomer(type?: number, customerId?: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number): Observable<ResponseOfReportModel> {
    let params = new HttpParams();
    params = params.append("type", type + "");
    params = params.append("customerId", customerId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    return super.getCustomApiPaging("getReportDebtPriceDetailByCustomer", [], params, pageSize, pageNumber) as Observable<ResponseOfReportModel>;
  }

  async getReportDebtPriceDetailByCustomerAsync(type?: number, customerId?: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number): Promise<ResponseOfReportModel> {
    const res = await this.getReportDebtPriceDetailByCustomer(type, customerId, dateFrom, dateTo, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async getReportDebtPriceDetailByCustomerDetailAsync(customerId: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number) {
    let params = new HttpParams();
    params = params.append("customerId", customerId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);

    const res = await super.getCustomApiPaging("GetReportDebtPriceDetailByCustomerDetail", [], params, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  getReportDebtCODDetailByCustomer(type?: number, customerId?: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number): Observable<ResponseOfReportModel> {
    let params = new HttpParams();
    params = params.append("type", type + "");
    params = params.append("customerId", customerId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    return super.getCustomApiPaging("getReportDebtCODDetailByCustomer", [], params, pageSize, pageNumber) as Observable<ResponseOfReportModel>;
  }

  async getReportDebtCODDetailByCustomerDetailAsync(customerId: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number): Promise<ResponseOfReportModel> {
    let params = new HttpParams();
    params = params.append("customerId", customerId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);

    const res = await super.getCustomApiPaging("GetReportDebtCODDetailByCustomerDetail", [], params, pageSize, pageNumber).toPromise() as ResponseOfReportModel;
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async getReportDebtCODDetailByCustomerAsync(type?: number, customerId?: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number): Promise<ResponseOfReportModel> {
    const res = await this.getReportDebtCODDetailByCustomer(type, customerId, dateFrom, dateTo, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  getReportListGoodsPriceDetailByCustomer(type?: number, customerId?: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number): Observable<ResponseOfReportModel> {
    let params = new HttpParams();
    params = params.append("type", type + "");
    params = params.append("customerId", customerId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    return super.getCustomApiPaging("GetReportListGoodsPriceDetailByCustomer", [], params, pageSize, pageNumber) as Observable<ResponseOfReportModel>;
  }

  async getReportListGoodsPriceDetailByCustomerAsync(type?: number, customerId?: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number): Promise<ResponseOfReportModel> {
    const res = await this.getReportListGoodsPriceDetailByCustomer(type, customerId, dateFrom, dateTo, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async getReportPickupDetail(userId: any = null, fromDate: any = null, toDate: any = null): Promise<ReportPickupDetail[]> {
    let params = new HttpParams();
    params = params.append("userId", userId);
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);

    const res = await this.getCustomApi("GetReportPickupDetail", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportDeliveryDetail(userId: any = null, fromDate: any = null, toDate: any = null): Promise<ReportDeliveryDetail[]> {
    let params = new HttpParams();
    params = params.append("userId", userId);
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);

    const res = await this.getCustomApi("GetReportDeliveryDetail", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportDeliveryFail(userId: any = null, fromDate: any = null, toDate: any = null): Promise<ReportDeliveryFail[]> {
    let params = new HttpParams();
    params = params.append("userId", userId);
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);

    const res = await this.getCustomApi("GetReportDeliveryFail", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportResultBusiness(dateFrom: any = null, dateTo: any = null, hubId: any = null, fromProvinceId: any = null, userId: any = null): Promise<ReportResultBusiness[]> {
    let params = new HttpParams();
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("hubId", hubId);
    params = params.append("fromProvinceId", fromProvinceId);
    params = params.append("userId", userId);

    const res = await this.getCustomApi("ReportResultBusiness", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportKPIBusiness(dateFrom: any = null, dateTo: any = null, hubId: any = null): Promise<ReportKPIBusiness[]> {
    let params = new HttpParams();
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("hubId", hubId);

    const res = await this.getCustomApi("ReportKPIBusiness", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportKPICustomer(dateFrom: any = null, dateTo: any = null, hubId: any = null, customerId: any = null): Promise<ReportKPICustomer[]> {
    let params = new HttpParams();
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("hubId", hubId);
    params = params.append("customerId", customerId);

    const res = await this.getCustomApi("ReportKPICustomer", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }
  //
  getReportShipmentQuantity(fromHubId?: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number): Observable<ResponseOfReportModel> {
    let params = new HttpParams();
    params = params.append("fromHubId", fromHubId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    return super.getCustomApiPaging("GetReportShipmentQuantity", [], params, pageSize, pageNumber) as Observable<ResponseOfReportModel>;
  }
  async getReportShipmentQuantityAsync(fromHubId?: number, dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number): Promise<ResponseOfReportModel> {
    const res = await this.getReportShipmentQuantity(fromHubId, dateFrom, dateTo, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }
  //
  getReportComplain(dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number, salerId?: number, handleEmpId?: number, isCompensation?: boolean): Observable<ResponseOfReportModel> {
    let params = new HttpParams();

    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("salerId", salerId + "");
    params = params.append("handleEmpId", handleEmpId + "");
    params = params.append("isCompensation", isCompensation + "");
    return super.getCustomApiPaging("ReportComplain", [], params, pageSize, pageNumber) as Observable<ResponseOfReportModel>;
  }
  async getReportComplainAsync(dateFrom?: any, dateTo?: any, pageSize?: number, pageNumber?: number, salerId?: number, handleEmpId?: number, isCompensation?: boolean): Promise<ResponseOfReportModel> {
    const res = await this.getReportComplain(dateFrom, dateTo, pageSize, pageNumber, salerId, handleEmpId, isCompensation).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }
  //
  getReportDiscountCustomer(dateFrom?: any, dateTo?: any, senderId?: number, salerId?: number): Observable<ResponseOfReportModel> {
    let params = new HttpParams();

    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("senderId", senderId + "");
    params = params.append("salerId", salerId + "");
    return super.getCustomApi("ReportDiscountCustomer", params) as Observable<ResponseOfReportModel>;
  }
  async getReportDiscountCustomerAsync(dateFrom?: any, dateTo?: any, senderId?: number, salerId?: number): Promise<ResponseOfReportModel> {
    const res = await this.getReportDiscountCustomer(dateFrom, dateTo, senderId, salerId).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }
  //
  getReportPaymentPickupUser(dateFrom?: any, dateTo?: any, hubId?: any, userId?: any, pageSize?: number, pageNumber?: number): Observable<ResponseOfReportModel> {
    let params = new HttpParams();
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("hubId", hubId + "");
    params = params.append("userId", userId + "");
    return super.getCustomApiPaging("ReportPaymentPickupUser", [], params, pageSize, pageNumber) as Observable<ResponseOfReportModel>;
  }
  async getReportPaymentPickupUserAsync(dateFrom?: any, dateTo?: any, hubId?: any, userId?: any, pageSize?: number, pageNumber?: number): Promise<ResponseOfReportModel> {
    const res = await this.getReportPaymentPickupUser(dateFrom, dateTo, hubId, userId, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }
  //
  getReportShipmentCOD(dateFrom?: any, dateTo?: any, isReturn?: boolean, toHubId?: any, empId?: any, pageSize?: number, pageNumber?: number): Observable<ResponseOfReportModel> {
    let params = new HttpParams();
    params = params.append("fromDate", dateFrom);
    params = params.append("toDate", dateTo);
    params = params.append("isReturn", isReturn + "");
    params = params.append("toHubId", toHubId + "");
    params = params.append("empId", empId + "");
    return super.getCustomApiPaging("ReportShipmentCOD", [], params, pageSize, pageNumber) as Observable<ResponseOfReportModel>;
  }
  async getReportShipmentCODrAsync(dateFrom?: any, dateTo?: any, isReturn?: boolean, toHubId?: any, empId?: any, pageSize?: number, pageNumber?: number): Promise<ResponseOfReportModel> {
    const res = await this.getReportShipmentCOD(dateFrom, dateTo, isReturn, toHubId, empId, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }
  //
  getReportDeadline(dateFrom?: any, dateTo?: any, fromProvinceId?: number, toProvinceId?: number, fromHubId?: number, toHubId?: number, deliveryUserId?: number, senderId?: number, serviceId?: number, pageNumber?: number, pageSize?: number): Observable<ResponseOfReportModel> {
    let params = new HttpParams();
    params = params.append("fromDate", dateFrom);
    params = params.append("toDate", dateTo);
    params = params.append("fromProvinceId", fromProvinceId + "");
    params = params.append("toProvinceId", toProvinceId + "");
    params = params.append("fromHubId", fromHubId + "");
    params = params.append("toHubId", toHubId + "");
    params = params.append("deliveryUserId", deliveryUserId + "");
    params = params.append("senderId", senderId + "");
    params = params.append("serviceId", serviceId + "");
    // params = params.append("pageNumber", pageNumber + "");
    // params = params.append("pageSize", pageSize + "");
    return super.getCustomApi("GetReportDeadline", params) as Observable<ResponseOfReportModel>;
  }
  async getReportDeadlineAsync(dateFrom?: any, dateTo?: any, fromProvinceId?: number, toProvinceId?: number, fromHubId?: number, toHubId?: number, deliveryUserId?: number, senderId?: number, pageNumber?: number, pageSize?: number): Promise<ResponseOfReportModel> {
    const res = await this.getReportDeadline(dateFrom, dateTo, fromProvinceId, toProvinceId, fromHubId, toHubId, deliveryUserId, senderId, pageNumber, pageSize).toPromise();
    if (!this.isValidResponse(res)) return;
    return res;
  }

  async getReportPrioritize(dateFrom?: any, dateTo?: any, fromProvinceId?: number, toProvinceId?: number, fromHubId?: number, toHubId?: number, deliveryUserId?: number, senderId?: number, pageNumber?: number, pageSize?: number) {
    let params = new HttpParams();
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("fromProvinceId", fromProvinceId + "");
    params = params.append("toProvinceId", toProvinceId + "");
    params = params.append("fromHubId", fromHubId + "");
    params = params.append("toHubId", toHubId + "");
    params = params.append("deliveryUserId", deliveryUserId + "");
    params = params.append("senderId", senderId + "");
    return super.getCustomApiPaging("GetReportPrioritize", [], params, pageSize, pageNumber).toPromise();
  }

  async getReportLadingSchedule(model: ReportLadingScheduleFilter): Promise<ReportLadingSchedule[]> {
    let params = new HttpParams();
    params = params.append("fromDate", model.fromDate);
    params = params.append("toDate", model.toDate);
    params = params.append("fromProvinceId", model.fromProvinceId);
    params = params.append("toProvinceId", model.toProvinceId);
    params = params.append("fromHubId", model.fromHubId);
    params = params.append("toHubId", model.toHubId);
    params = params.append("deliveryUserId", model.deliveryUserId);
    params = params.append("pageNumber", model.pageNumber);
    params = params.append("pageSize", model.pageSize);

    const res = await this.getCustomApi("ReportLadingSchedule", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportTruckTransfer(model: ReportTruckTransferFilter): Promise<ReportTruckTransfer[]> {
    let params = new HttpParams();
    params = params.append("fromDate", model.fromDate);
    params = params.append("toDate", model.toDate);
    params = params.append("fromProvinceId", model.fromProvinceId);
    params = params.append("toProvinceId", model.toProvinceId);
    params = params.append("truckId", model.truckId);
    params = params.append("pageNumber", model.pageNumber);
    params = params.append("pageSize", model.pageSize);

    const res = await this.getCustomApi("ReportTruckTransfer", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportEmpReceiptIssue(model: ReportEmpReceiptIssueFilter): Promise<ReportEmpReceiptIssue[]> {
    let params = new HttpParams();
    params = params.append("fromDate", model.fromDate);
    params = params.append("toDate", model.toDate);
    params = params.append("hubId", model.hubId);
    params = params.append("userId", model.userId);

    const res = await this.getCustomApi("ReportEmpReceiptIssue", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportIncidents(model: ReportIncidentsFilter): Promise<ReportIncidents[]> {
    let a = 1;
    let params = new HttpParams();
    params = params.append("dateFrom", model.fromDate);
    params = params.append("dateTo", model.toDate);
    params = params.append("customerId", model.customerId);
    params = params.append("handleEmpId", model.handleEmpId);
    params = params.append("incidentEmpId", model.incidentEmpId);
    params = params.append("isCompensation", model.isCompensation);
    params = params.append("pageNumber", model.pageNumber);
    params = params.append("pageSize", model.pageSize);

    const res = await this.getCustomApi("GetReportIncidents", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  //#region Dashboard
  async getDashboardPickup(model: DashboardFilter): Promise<DashboardPickup> {
    let params = new HttpParams();
    params = params.append("fromDate", model.fromDate);
    params = params.append("toDate", model.toDate);
    params = params.append("hubId", model.hubId);

    let res = await this.getCustomApi("GetDashboardPickup", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getDashboardTransfer(model: DashboardFilter): Promise<DashboardTransfer> {
    let params = new HttpParams();
    params = params.append("fromDate", model.fromDate);
    params = params.append("toDate", model.toDate);
    params = params.append("hubId", model.hubId);

    let res = await this.getCustomApi("GetDashboardTransfer", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getDashboardDeliveryAndReturn(model: DashboardFilter): Promise<DashboardDeliveryAndReturn> {
    let params = new HttpParams();
    params = params.append("fromDate", model.fromDate);
    params = params.append("toDate", model.toDate);
    params = params.append("hubId", model.hubId);

    let res = await this.getCustomApi("GetDashboardDeliveryAndReturn", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getDashboardService(model: DashboardFilter): Promise<DashboardService> {
    let params = new HttpParams();
    params = params.append("fromDate", model.fromDate);
    params = params.append("toDate", model.toDate);
    params = params.append("hubId", model.hubId);

    let res = await this.getCustomApi("GetDashboardService", params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }
  //#endregion

  async getReportListGoodsShipment(typeId?: number, createByHubId?: number, fromHubId?: number, toHubId?: number,
    userId?: number, statusId?: number, transportTypeId?: number, tplId?: number, senderId?: any, dateFrom?: any,
    dateTo?: any, searchText?: string, pageNumber: any = 1, pageSize: any = 20, listGoodsCode?: string): Promise<ListGoods[]> {
    let params = new HttpParams();
    params = params.append("typeId", typeId + "");
    params = params.append("createdByHubId", createByHubId + "");
    params = params.append("fromHubId", fromHubId + "");
    params = params.append("toHubId", toHubId + "");
    params = params.append("userId", userId + "");
    params = params.append("statusId", statusId + "");
    params = params.append("transportTypeId", transportTypeId + "");
    params = params.append("tplId", tplId + "");
    params = params.append("senderId", senderId + "");
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("listGoodsCode", listGoodsCode);
    params = params.append("searchText", searchText);
    params = params.append("pageNumber", pageNumber);
    params = params.append("pageSize", pageSize);

    let res = await super.getCustomApi("GetReportListGoodsShipment", params).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListGoods[];
    return data;
  }
  //
  async getReportByCus(model: ReportByCusFilter): Promise<ReportByCus[]> {
    let params = new HttpParams();
    params = params.append("dateFrom", model.dateFrom);
    params = params.append("dateTo", model.dateTo);
    params = params.append("senderId", model.senderId);
    if (model.listProvinceIds) params = params.append("listProvinceIds", model.listProvinceIds);
    if (model.listDeliveryIds) params = params.append("listDeliveryIds", model.listDeliveryIds);
    let res = await super.getCustomApi("getReportByCus", params).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ReportByCus[];
    return data;
  }
  async getReportRevenueMonth(model: ReportByCusFilter): Promise<ReportRevenueMonth[]> {
    let params = new HttpParams();
    params = params.append("dateFrom", model.dateFrom);
    params = params.append("dateTo", model.dateTo);
    let res = await super.getCustomApi("GetReportByRevenueMonth", params).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ReportRevenueMonth[];
    return data;
  }

  async getReportRevenueYear(year: any): Promise<ReportRevenueYear[]> {
    let params = new HttpParams();
    params = params.append("year", year);
    let res = await super.getCustomApi("GetReportByRevenueYear", params).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ReportRevenueYear[];
    return data;
  }

  async getReportHandleEmployee(hubId?: any, userId?: any, isGroupEmp?: any, groupStatusId?: any,
    timeCompare?: any, dateFrom?: any, dateTo?: any, pageNumber?: any, pageSize?: any): Promise<ReportHanldeEmployee[]> {
    let params = new HttpParams();
    params = params.append("hubId", hubId);
    params = params.append("userId", userId);
    params = params.append("isGroupEmp", isGroupEmp);
    params = params.append("groupStatusId", groupStatusId);
    params = params.append("timeCompare", timeCompare);
    params = params.append("dateFrom", dateFrom);
    params = params.append("dateTo", dateTo);
    params = params.append("pageNumber", pageNumber);
    params = params.append("pageSize", pageSize);
    let res = await super.getCustomApi("GetReportHandleEmployee", params).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ReportHanldeEmployee[];
    return data;
  }

  async getReportCODConfirm(model: ReportCODConfirmFilter): Promise<ReportCODConfirm[]> {
    let res = await super.postCustomApi("GetReportCODConfirm", model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportCODConfirmExcel(model: ReportCODConfirmFilter): Promise<ReportCODConfirm[]> {
    let res = await super.postCustomApi("GetReportCODConfirmExcel", model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getReportExpenseReceiveMoney(model: ReportExpenseFilterModel): Promise<ReportCODConfirm[]> { 
    let res = await super.postCustomApi("GetReportExpenseReceiveMoney", model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async GetReportPaymentEmployeesExportExcel(filterViewModel: ReportFilterViewModel) {
    const res = await super.postAny("GetReportPaymentEmployeesExportExcel", filterViewModel).toPromise();
    this.downLoadFile(res, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filterViewModel.customExportFile.fileNameReport);
  }
  async GetReportUpdateReceiveInformationExportExcel(filterViewModel: ReportFilterViewModel) {
    const res = await super.postAny("GetReportUpdateReceiveInformationExportExcel", filterViewModel).toPromise();
    this.downLoadFile(res, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filterViewModel.customExportFile.fileNameReport);
  }

  downLoadFile(data: any, type: string, fileName: string) {
    if (!fileName) fileName = "EXPORT_BAO_CAO";
    var a = document.createElement("a");
    document.body.appendChild(a);
    //
    let blob = new Blob([data], { type: type });
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    //
  }
  async getReportShipmentVersionExcel(filterViewModel: ShipmentVersionFilterModel)
  {
    const res = await super.postAny("GetReportShipmentVersionExcel", filterViewModel).toPromise();
    this.downLoadFile(res, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filterViewModel.customExportFile.fileNameReport);
  }
  async getReportExpenseReceiveMoneyExcel(filterViewModel: ReportExpenseFilterModel)
  {
    const res = await super.postAny("GetReportExpenseReceiveMoneyExcel", filterViewModel).toPromise();
    this.downLoadFile(res, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filterViewModel.customExportFile.fileNameReport);
  }
}

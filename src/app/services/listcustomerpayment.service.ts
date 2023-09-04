import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { ListCustomerPaymentViewModel } from '../view-model/index';

import { MessageService } from 'primeng/components/common/messageservice';
import { Shipment, ListCustomerPayment, ResponseModel } from '../models';
import { SelectModel } from '../models/select.model';
import { ShipmentTracking } from '../models/abstract/shipmentTracking.interface';


@Injectable()
export class ListCustomerPaymentService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "listCustomerPayment");
  }

  getListByType(type: number, fromDate: string = null, toDate: string = null, arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let params = new HttpParams();
    params = params.append("type", type + "");
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    return super.getCustomApiPaging("getListByType", arrCols, params, pageSize, pageNumber)
  }
  getListByTypeNew(senderId: any) {
    let params = new HttpParams();
    params = params.append("senderId", senderId);
    return super.getCustomApi("getListByTypeNew", params)
  }
  async getListByTypeNewAsync(senderId: any): Promise<SelectModel[]> {
    const res = await this.getListByTypeNew(senderId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListCustomerPayment[];
    let listDatas: SelectModel[] = [];
    data.map(m => listDatas.push({ value: m.id, label: `${m.code}`, data: m }));
    return listDatas;
  }
  getListShipmentToPayment(categoryPaymentId: any, senderId: any, isSuccess: any = null, formDate: any = null, toDate: any = null, searchText: any = null, pageSize: any = null, pageNumber: any = null) {
    let params = new HttpParams();
    params = params.append("categoryPaymentId", categoryPaymentId);
    params = params.append("senderId", senderId);
    params = params.append("isSuccess", isSuccess);
    params = params.append("formDate", formDate);
    params = params.append("toDate", toDate);
    params = params.append("searchText", searchText);
    params = params.append("pageSize", pageSize);
    params = params.append("pageNumber", pageNumber);
    return super.getCustomApi("getListShipmentToPayment", params);
  }
  async getListShipmentToPaymentAsync(categoryPaymentId: any, senderId: any, isSuccess: any = null, formDate: any = null, toDate: any = null, searchText: any = null, pageSize: any = null, pageNumber: any = null): Promise<ShipmentTracking[]> {
    const rs = await this.getListShipmentToPayment(categoryPaymentId, senderId, isSuccess, formDate, toDate, searchText, pageSize, pageNumber).toPromise();
    return rs.isSuccess ? rs.data as ShipmentTracking[] : [];
  }
  
  getShipmentListPaymentCustomer(listPaymentId: any, searchText: any = null, pageSize: any = null, pageNumber: any = null) {
    let params = new HttpParams();
    params = params.append("listPaymentId", listPaymentId);
    params = params.append("searchText", searchText);
    params = params.append("pageSize", pageSize);
    params = params.append("pageNumber", pageNumber);
    return super.getCustomApi("GetShipmentListPaymentCustomer", params);
  }
  async getShipmentListPaymentCustomerAsync(listPaymentId: any, searchText: any = null, pageSize: any = null, pageNumber: any = null): Promise<ShipmentTracking[]> {
    const rs = await this.getShipmentListPaymentCustomer(listPaymentId, searchText, pageSize, pageNumber).toPromise();
    return rs.isSuccess ? rs.data as ShipmentTracking[] : [];
  }
  getCustomerWaitingPayment(type: number) {
    let params = new HttpParams();
    params = params.append("type", type + "");
    return super.getCustomApi("GetCustomerWaitingPayment", params);
  }
  create(model: ListCustomerPaymentViewModel) {
    return super.postCustomApi("create", model);
  }
  lock(model: ListCustomerPaymentViewModel) {
    return super.postCustomApi("lock", model);
  }
  unlock(model: ListCustomerPaymentViewModel) {
    return super.postCustomApi("unlock", model);
  }
  pay(model: ListCustomerPaymentViewModel) {
    return super.postCustomApi("pay", model);
  }
  cancel(model: ListCustomerPaymentViewModel) {
    return super.postCustomApi("cancel", model);
  }
  createNew(model: ListCustomerPaymentViewModel) {
    return super.postCustomApi("createNew", model);
  }  

  getListCustomerPaymentByShipmentNumberAndType(shipmentNumber: string, type: number) {
    let params = new HttpParams();
    params = params.append("shipmentNumber", shipmentNumber);
    params = params.append("type", type + "");
    return super.getCustomApi("getListCustomerPaymentByShipmentNumberAndType", params);
  }

  async getListCustomerPaymentByShipmentNumberAndTypeAsync(shipmentNumber: string, type: number): Promise<ListCustomerPayment[]> {
    const res = await this.getListCustomerPaymentByShipmentNumberAndType(shipmentNumber, type).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListCustomerPayment[];
    return data;
  }

  async getAsync(id: any, arrCols?: string[]): Promise<any> {
    const res = await this.get(id, arrCols).toPromise();
    // if (!this.isValidResponse(res)) return;
    const data = res.data as ListCustomerPayment;
    return data;
  }

  adjustPriceCustomerPayment(model: ListCustomerPaymentViewModel) {
    return super.postCustomApi("adjustPriceCustomerPayment", model);
  }
  
  async addShipmentToPayment(model: ListCustomerPaymentViewModel):Promise<ResponseModel> {
    return await super.postCustomApi("AddShipmentToPayment", model).toPromise();
  }

  async UnInstallAsync(model: any):Promise<ResponseModel> {
    return await super.postCustomApi("UnInstall", model).toPromise();
  }

  async adjustPriceCustomerPaymentAsync(model: ListCustomerPaymentViewModel): Promise<ListCustomerPayment> {
    const res = await this.adjustPriceCustomerPayment(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListCustomerPayment;
    return data;
  }
}

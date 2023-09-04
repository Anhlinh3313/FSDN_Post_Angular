import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { ListReceiptMoneyViewModel } from '../view-model/index';
import { MessageService } from 'primeng/components/common/messageservice';
import { ListReceiptMoney, BaseModel } from '../models';


@Injectable()
export class ListReceiptMoneyService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "listReceiptMoney");
  }
  
  getListByType(type: number, fromDate : string = null, toDate:string = null , arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let params = new HttpParams();
    params = params.append("type", type + "");
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    return super.getCustomApiPaging("getListByType", arrCols, params, pageSize, pageNumber)
  }
  getListToConfirmByType(type: number, fromDate : string = null, toDate:string = null , arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined) {
    let params = new HttpParams();
    params = params.append("type", type + "");
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    return super.getCustomApiPaging("GetListToConfirmByType", arrCols, params, pageSize, pageNumber)
  }
  getListReceiptMoneyFromRider(arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined){
    let params = new HttpParams();
    return super.getCustomApiPaging("getListReceiptMoneyFromRider", arrCols, params, pageSize, pageNumber);
  }
  getListShipmentKeepingByEmployee(empId?:number) {
    let params = new HttpParams();
    params = params.append("empId", empId + "");
    return super.getCustomApi("getListShipmentKeepingByEmployee", params);
  }
  getListShipmentKeepingByHub(otherHubId?: number, listReceitMoneyTypeId?: number) {
    let params = new HttpParams();
    params = params.append("otherHubId", otherHubId + "");
    params = params.append("listReceitMoneyTypeId", listReceitMoneyTypeId + "");
    return super.getCustomApi("getListShipmentKeepingByHub", params);
  }
  createListReceiptMoneyFromRider(model: ListReceiptMoneyViewModel) {
    return super.postCustomApi("createListReceiptMoneyFromRider", model);
  }
  createListReceiptMoneyToHub(model: ListReceiptMoneyViewModel) {
    return super.postCustomApi("CreateListReceiptMoneyToHub", model);
  }
  createListReceiptMoneyToTreasurer(model: ListReceiptMoneyViewModel) {
    return super.postCustomApi("createListReceiptMoneyToTreasurer", model);
  }
  createListReceiptMoneyToHubOther(model: ListReceiptMoneyViewModel) {
    return super.postCustomApi("CreateListReceiptMoneyToHubOther", model);
  }
  lock(model: ListReceiptMoneyViewModel) {
    return super.postCustomApi("lock", model);
  }
  unlock(model: ListReceiptMoneyViewModel) {
    return super.postCustomApi("unlock", model);
  }
  confirm(model: ListReceiptMoneyViewModel) {
    return super.postCustomApi("Confirm", model);
  }
  cancel(model: ListReceiptMoneyViewModel) {
    return super.postCustomApi("Cancel", model);
  }
  pushIncomingPaymentToGSDP(model: BaseModel) {
    return super.postCustomApi("pushIncomingPaymentToGSDP", model);
  }
  //Other
  getListReceiptMoneyShipmentByListReceiptMoney(id?: number, arrCols: string[]=[]) {
    let params = new HttpParams();
    params = params.append("id", id + "");
    return super.getCustomApiPaging("getListReceiptMoneyShipmentByListReceiptMoney", arrCols, params);
  }
  getListEmployeeKeepingMoney(arrCols: string[]=[]) {
    return super.getCustomApiPaging("GetListEmployeeKeepingMoney", arrCols);
  }

  getListByShipmentId(shipmentId: number) {
    let params = new HttpParams();
    params = params.append("shipmentId", shipmentId + "");
    return super.getCustomApi("getListByShipmentId", params);    
  }
  
  async getListByShipmentIdAsync(shipmentId: number): Promise<ListReceiptMoney[]> {
    const res = await this.getListByShipmentId(shipmentId).toPromise();
    // if (!this.isValidResponse(res)) return;
    const data = res.data as ListReceiptMoney[];
    return data;
  }

  getListReceiptByShipmentNumber(shipmentNumber: string) {
    let params = new HttpParams();
    params = params.append("shipmentNumber", shipmentNumber);
    return super.getCustomApi("getListReceiptByShipmentNumber", params);
  }

  async getListReceiptByShipmentNumberAsync(shipmentNumber: string): Promise<ListReceiptMoney[]> {
    const res = await this.getListReceiptByShipmentNumber(shipmentNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ListReceiptMoney[];
    return data;
  }
}

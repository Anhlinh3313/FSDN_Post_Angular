import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { SelectItem } from 'primeng/primeng';
import { Customer } from '../models';
import { SelectModel } from '../models/select.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class CustomerService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiCRMUrl, "customer");
  }

  async getCustomerById(id: number, arrCols: string[] = []): Promise<Customer> {
    const res = await super.get(id, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Customer;
    return data;
  }

  public getByCode(userName: string) {
    let params = new HttpParams();
    params = params.append("code", userName);
    return super.getCustomApi("GetByCode", params);
  }

  async GetCustomerIsPublicAsync(provinceId: any):Promise<ResponseModel> {
    let params = new HttpParams();
    params = params.append("provinceId", provinceId);
    return super.getCustomApi("getCustomerIsPublic", params).toPromise();
  }

  async getByCustomerCodeAsync(code: string, id: any, pageSize: any, pageNum: any, cols: any): Promise<ResponseModel> {
    let params = new HttpParams();
    params = params.append("value", code);
    params = params.append("id", id);
    params = params.append("pageSize", pageSize);
    params = params.append("pageNum", pageNum);
    params = params.append("cols", cols);
    return super.getCustomApi("getByCustomerCode", params).toPromise();
  }

  async getByCodeAsync(userName: string): Promise<Customer> {
    const res = await this.getByCode(userName).toPromise();
    if (!this.isValidResponse(res)) return null;
    const data = res.data as Customer;
    return data;
  }

  getByListCode(listCode: string[]) {
    return super.postCustomUrlApi(environment.apiCRMUrl, "getByListCode", listCode);
  }

  async getByListCodeAsync(listCode: string[]): Promise<Customer[]> {
    const res = await this.getByListCode(listCode).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Customer[];
    return data;
  }

  search(text: any, type: any, arrCols: string[] = []): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("text", text);
    params = params.append("type", type);
    return super.getCustomApiPaging("search", arrCols, params);
  }

  async searchAsync(text: any, type: any, arrCols?: string[]): Promise<Customer> {
    const res = await this.search(text, type, arrCols).toPromise();
    if (res.isSuccess) {
      const data = res.data as Customer;
      return data;
    } else {
      return null;
    }
  }

  searchSenderInfoAsync(senderId: any, text: any): Promise<ResponseModel> {
    let params = new HttpParams();
    params = params.append("senderId", senderId);
    params = params.append("text", text);
    return super.getCustomApiPaging("searchInfoSender", [], params).toPromise();
  }

  async getAllAsync(arrCols?: string[]): Promise<any> {
    const res = await this.getAll(arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Customer[];
    return data;
  }

  async getAllSelectModel2Async(arrCols?: string[]): Promise<SelectModel[]> {
    const res = await this.getAllAsync(arrCols);
    const customers: SelectModel[] = [];
    customers.push({ label: `-- Chọn tất cả --`, value: null });
    if (res) {
      res.forEach(element => {
        customers.push({
          label: element.code,
          value: element.id,
          data: element
        });
      });
      return customers;
    } else {
      return null;
    }
  }

  async getAllSelectModelAsync(arrCols?: string[]): Promise<SelectModel[]> {
    const res = await this.getAllAsync(arrCols);
    const customers: SelectModel[] = [];
    customers.push({ label: `-- Chọn tất cả --`, value: null });
    if (res) {
      res.forEach(element => {
        customers.push({
          label: `${element.code} - ${element.name}- ${element.phoneNumber}`,
          value: element.id,
          data: element
        });
      });
      return customers;
    } else {
      return null;
    }
  }

  async getAllSelectItemAsync(arrCols?: string[]): Promise<SelectItem[]> {
    const res = await this.getAllAsync(arrCols);
    const customers: SelectItem[] = [];
    customers.push({ label: `-- Chọn tất cả --`, value: null });
    if (res) {
      res.forEach(element => {
        customers.push({
          label: `${element.code} - ${element.name}- ${element.phoneNumber}`,
          value: element.id
        });
      });
      return customers;
    } else {
      return null;
    }
  }

  getSearchByValue(value: string, id: any) {
    let params = new HttpParams;
    params = params.append("value", value);
    params = params.append("id", id);
    return super.getCustomUrlApiPaging(environment.apiCRMUrl, "searchByValue", [], params);
  }

  async getSearchByValueAsync(value: string, id: any): Promise<ResponseModel> {
    let res = await this.getSearchByValue(value, id).toPromise();
    return res;
  }
}
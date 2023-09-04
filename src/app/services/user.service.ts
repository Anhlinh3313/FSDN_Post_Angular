import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { AuthService } from './auth/auth.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { SelectModel } from '../models/select.model';
import { User, Hub } from '../models';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/primeng';

@Injectable()
export class UserService extends GeneralService {
  constructor(
    protected messageService: MessageService, 
    protected httpClient: HttpClient, 
    protected persistenceService: PersistenceService, 
    private authService: AuthService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "account");
  }
  get(id: any, cols?: string[]): Observable<ResponseModel> {
    let params = new HttpParams;
    params = params.append("id", id);
    return super.getCustomUrlApiPaging(environment.apiGeneralUrl, "get", cols, params);
  }
  async getAsync(id: any, arrCols?: string[]): Promise<any> {
    const res = await this.get(id, arrCols).toPromise();
    // if (!this.isValidResponse(res)) return;
    const data = res.data as any;
    return data;
  }
  changePassWord(currentPassWord: string, newPassWord: string): Observable<ResponseModel> {
    let model = new Object();
    model["userId"] = this.authService.getUserId();
    model["currentPassWord"] = currentPassWord;
    model["newPassWord"] = newPassWord;
    return super.postCustomUrlApi(environment.apiGeneralUrl, "changePassWord", model);
  }

  getAllRiderInCenterByHubId(id: any) {
    let params = new HttpParams;
    params = params.append("hubId", id);
    return super.getCustomApiPaging("getAllRiderInCenterByHubId", [], params);
  }

  getByCodeAsync(code: any): Promise<ResponseModel> {
    let params = new HttpParams;
    params = params.append("code", code);
    return super.getCustomApiPaging("GetByCode", [], params).toPromise();
  }

  async getAllRiderInCenterByHubIdAsync(id: any): Promise<User[]> {
    const res = await this.getAllRiderInCenterByHubId(id).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as User[];
    return data;
  }

  async getSelectModelAllRiderInCenterByHubIdAsync(id: any): Promise<SelectModel[]> {
    const res = await this.getAllRiderInCenterByHubIdAsync(id);
    const users: SelectModel[] = [];
    users.push({ label: "-- Chọn nhân viên --", value: null });
    if (res) {
      res.forEach(element => {
        users.push({ label: element.code + " - " + element.fullName, value: element.id, data: element });
      });
      return users;
    } else {
      return null;
    }
  }

  getEmpByCurrentHub() {
    return super.getCustomApiPaging("getEmpByCurrentHub");
  }

  async getEmpByCurrentHubAsync(): Promise<User[]> {
    const res = await this.getEmpByCurrentHub().toPromise();
    if (res.isSuccess && res.data) {
      const data = res.data as User[];
      return data;
    } else {
      return null;
    }
  }

  async getSelectModelEmpByCurrentHubAsync(): Promise<SelectModel[]> {
    const res = await this.getEmpByCurrentHubAsync();
    const users: SelectModel[] = [];
    // users.push({ label: "--Chọn dữ liệu--", value: null });
    if (res) {
      res.forEach(element => {
        users.push({ label: element.code + " - " + element.fullName, value: element });
      });
      return users;
    } else {
      return null;
    }
  }

  getSearchByValue(value: string, id: any) {
    let params = new HttpParams;
    params = params.append("value", value);
    params = params.append("id", id);
    return super.getCustomUrlApiPaging(environment.apiPostUrl, "searchByValue", [], params);
  }

  async getSearchByValueAsync(value: string, id: any): Promise<User[]> {
    let res = await this.getSearchByValue(value, id).toPromise();
    return res.data as User[];
  }

  getAllUserByCurrentHub() {
    return super.getCustomApiPaging("GetAllUserByCurrentHub");
  }

  async getAllUserByCurrentHubAsync(): Promise<User[]> {
    const res = await this.getAllUserByCurrentHub().toPromise();
    if (res.isSuccess) {
      const data = res.data as User[];
      return data;
    } else {
      return null;
    }
  }

  async getSelectModelAllUserByCurrentHubAsync(): Promise<SelectModel[]> {
    const res = await this.getAllUserByCurrentHubAsync();
    const users: SelectModel[] = [];
    users.push({ label: "-- Chọn nhân viên --", value: null });
    if (res) {
      res.forEach(element => {
        users.push({ label: element.code + ' - ' + element.fullName, value: element.id });
      });
      return users;
    } else {
      return null;
    }
  }

  getRiderAllHub() {
    let params = new HttpParams;
    return super.getCustomApi("getRiderAllHub", params);
  }

  async getRiderAllHubAsync(): Promise<User[]> {
    const res = await this.getRiderAllHub().toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as User[];
    return data;
  }

  async getSelectModelRiderAllHubAsync(): Promise<SelectModel[]> {
    const res = await this.getRiderAllHubAsync();
    const users: SelectModel[] = [];
    users.push({ label: "--Chọn dữ liệu--", value: null });
    if (res) {
      res.forEach(element => {
        users.push({ label: element.code + " - " + element.fullName, value: element.id, data: element });
      });
      return users;
    } else {
      return null;
    }
  }

  async getMultiselectRiderAllHubAsync(): Promise<SelectModel[]> {
    const res = await this.getRiderAllHubAsync();
    const users: SelectModel[] = [];
    if (res) {
      res.forEach(element => {
        users.push({ label: element.code + " - " + element.fullName, value: element.id, data: element });
      });
      return users;
    } else {
      return null;
    }
  }

  getEmpByHubId(hubId: any) {
    let params = new HttpParams;
    params = params.append("hubId", hubId);
    return super.getCustomApi("getEmpByHubId", params);
  }

  async getEmpByHubIdAsync(hubId?: any): Promise<User[]> {
    const res = await this.getEmpByHubId(hubId).toPromise();
    if (res.isSuccess) {
      const data = res.data as User[];
      return data;
    } else {
      return null;
    }
  }

  async getSelectModelEmpByHubIdAsync(hubId: any): Promise<SelectModel[]> {
    const res = await this.getEmpByHubIdAsync(hubId);
    const users: SelectModel[] = [];
    users.push({ label: "-- Chọn nhân viên --", value: null });
    if (res) {
      res.forEach(element => {
        users.push({ label: element.fullName, value: element.id });
      });
      return users;
    } else {
      return null;
    }
  }

  getCurrentHubAndChildren(cols: string = "") {
    let params = new HttpParams;
    params = params.append("cols", cols);
    return super.getCustomApi("getCurrentHubAndChildren", params);
  }

  getByListCode(listCode: string[]) {
    return super.postCustomUrlApi(environment.apiGeneralUrl, "getByListCode", listCode);
  }

  async getByListCodeAsync(listCode: string[]): Promise<User[]> {
    const res = await this.getByListCode(listCode).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as User[];
    return data;
  }

  getByHubWardId(wardId?: any, districtId?: any, isTruckDelivery?: any, weight?: any, cols?: string[]) {
    let params = new HttpParams;
    if (wardId) params = params.append("wardId", wardId);
    if (districtId) params = params.append("districtId", districtId);
    if (isTruckDelivery) params = params.append("isTruckDelivery", isTruckDelivery);
    if (weight) params = params.append("weight", weight);
    return super.getCustomUrlApiPaging(environment.apiGeneralUrl, "getByHubWardId", cols, params);
  }

  getAllEmpByHubId(hubId: any) {
    let params = new HttpParams;
    params = params.append("hubId", hubId);
    return super.getCustomApi("getAllEmpByHubId", params);
  }

  async getAllEmpByHubIdAsync(hubId: any): Promise<User[]> {
    const res = await this.getAllEmpByHubId(hubId).toPromise();
    if (res.isSuccess) {
      const data = res.data as User[];
      return data;
    } else {
      return null;
    }
  }

  async getSelectModelAllEmpByHubIdAsync(hubId: any): Promise<SelectModel[]> {
    const res = await this.getAllEmpByHubIdAsync(hubId);
    const users: SelectModel[] = [];
    users.push({ label: "--- Chọn tất cả ---", value: null });
    if (res) {
      res.forEach(element => {
        users.push({ label: `${element.code} - ${element.fullName}`, value: element.id });
      });
      return users;
    } else {
      return null;
    }
  }
  async getSelectModelRiderAllHubAsyncTransfer(): Promise<SelectModel[]> {
    const res = await this.getRiderAllHubAsync();
    const users: SelectModel[] = [];
    // users.push({ label: "--Chọn dữ liệu--", value: null });
    if (res) {
      res.forEach(element => {
        users.push({ label: element.code + " - " + element.fullName, value: element });
      });
      return users;
    } else {
      return null;
    }
  }
  async getSelectItemRiderAllHubAsyncTransfer(): Promise<SelectModel[]> {
    const res = await this.getRiderAllHubAsync();
    const users: SelectItem[] = [];
    // users.push({ label: "--Chọn dữ liệu--", value: null });
    if (res) {
      res.forEach(element => {
        users.push({ label: element.code + " - " + element.fullName, value: element.id });
      });
      return users;
    } else {
      return null;
    }
  }

  async getCurrentHub(): Promise<Hub> {
    const id = this.authService.getUserId();
    const arrCols = ["Hub"];
    const user = await this.getAsync(id, arrCols);
    if (user) {
      if (user.hub) {
        return user.hub;
      }
    }
  }
}
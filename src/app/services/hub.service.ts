import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { Hub } from '../models/hub.model';
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { SelectItem } from 'primeng/primeng';
import { SelectModel } from '../models/select.model';
import { MessageService } from 'primeng/components/common/messageservice';
import { InfoLocation } from '../models';

@Injectable()
export class HubService extends GeneralService {
  hubs: SelectModel[];
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "hub");
  }
  get(id: any, cols?: string[]): Observable<ResponseModel> {
    let params = new HttpParams;
    params = params.append("id", id);
    return super.getCustomUrlApiPaging(environment.apiGeneralUrl, "get", cols, params);
  }

  async getAsync(id: any, arrCols?: string[]): Promise<any> {
    const res = await this.get(id, arrCols).toPromise();
    // if (!this.isValidResponse(res)) return;
    const data = res.data as Hub;
    return data;
  }

  async getAllHubSelectModelAsync(): Promise<SelectModel[]> {
    const res = await this.getAllHubAsync();
    if (res.isSuccess) {
      const selectModel = [];
      const datas = res.data as any[];

      selectModel.push({ label: "-- Chọn dữ liệu --", data: null, value: null });
      datas.forEach(element => {
        selectModel.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return selectModel;
    }
  }

  async getAllHubAsync(
    arrCols: string[] = [],
    pageSize: number = undefined,
    pageNumber: number = undefined
  ): Promise<ResponseModel> {
    return await this.getAll(arrCols, pageSize, pageNumber).toPromise();
  }
  getHubManage(arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined): Observable<ResponseModel> {
    return super.getCustomApiPaging("GetHubManage", arrCols);
  }

  getCenterHub(arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined): Observable<ResponseModel> {
    return super.getCustomApiPaging("getCenterHub", arrCols);
  }

  getHubSearchByValue(value: string, id: any) {
    let params = new HttpParams;
    params = params.append("value", value);
    params = params.append("id", id);
    return super.getCustomUrlApiPaging(environment.apiGeneralUrl, "searchByValue", [], params);
  }

  async getHubSearchByValueAsync(value: string, id: any): Promise<Hub[]> {
    let res = await this.getHubSearchByValue(value, id).toPromise();
    return res.data as Hub[];
  }

  async getCenterHubAsync(arrCols?: string[], pageSize?: number, pageNumber?: number): Promise<Hub[]> {
    const res = await this.getCenterHub(arrCols, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub[];
    return data;
  }

  async getSelectModelCenterHubAsync(arrCols?: string[], pageSize?: number, pageNumber?: number): Promise<SelectModel[]> {
    const res = await this.getCenterHub(arrCols, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub[];
    if (data) {
      const centerHubs: SelectModel[] = [];
      centerHubs.push({ label: `-- Chọn trung tâm --`, data: null, value: null });
      data.forEach(element => {
        centerHubs.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return centerHubs;
    }
  }

  async getSelectModelCenterHubMultiSelectAsync(arrCols?: string[], pageSize?: number, pageNumber?: number): Promise<SelectModel[]> {
    const res = await this.getCenterHub(arrCols, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub[];
    if (data) {
      const centerHubs: SelectModel[] = [];
      data.forEach(element => {
        centerHubs.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
      return centerHubs;
    }
  }


  public getPoHub(arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined): Observable<ResponseModel> {
    return super.getCustomApiPaging("getPoHub", arrCols);
  }

  async getPoHubAsync(arrCols?: string[], pageSize?: number, pageNumber?: number): Promise<Hub[]> {
    const res = await this.getPoHub(arrCols, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub[];
    return data;
  }

  async getSelectModelPoHubAsync(): Promise<SelectModel[]> {
    const data = await this.getPoHubAsync();
    if (data) {
      let stationHubs: SelectModel[] = [];
      stationHubs.push({ label: `-- Chọn dữ liệu --`, data: null, value: null });
      data.forEach(element => {
        stationHubs.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return stationHubs;
    } else {
      return null;
    }
  }

  public getPoHubByCenterId(centerId: any, arrCols: string[] = []): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("centerId", centerId);

    return super.getCustomApiPaging("getPoHubByCenterId", arrCols, params);
  }

  async getPoHubByCenterIdAsync(centerId: any, arrCols?: string[]): Promise<Hub[]> {
    const res = await this.getPoHubByCenterId(centerId, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub[];
    return data;
  }

  public getInfoLocation(provinceName: any, districtName: any, wardName: any, provinceId: any, districtId: any, wardId: any, countryId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("provinceName", provinceName);
    params = params.append("districtName", districtName);
    params = params.append("wardName", wardName);
    params = params.append("provinceId", provinceId);
    params = params.append("districtId", districtId);
    params = params.append("wardId", wardId);
    params = params.append("countryId", countryId);
    return super.getCustomApiPaging("GetInfoLocation", [], params);
  }

  async getInfoLocationAsync(provinceName: any, districtName: any, wardName: any, provinceId: any, districtId: any, wardId: any, countryId: any): Promise<InfoLocation> {
    const res = await this.getInfoLocation(provinceName, districtName, wardName, provinceId, districtId, wardId, countryId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as InfoLocation;
    return data;
  }

  async getSelectModelPoHubByCenterIdAsync(centerId: any, arrCols?: string[]): Promise<SelectModel[]> {
    const data = await this.getPoHubByCenterIdAsync(centerId, arrCols);
    if (data) {
      let poHubs: SelectModel[] = [];
      poHubs.push({ label: `-- Chọn bưu cục --`, data: null, value: null });
      data.forEach(element => {
        poHubs.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return poHubs;
    } else {
      return null;
    }
  }

  public getStationHub(arrCols: string[] = [], pageSize: number = undefined, pageNumber: number = undefined): Observable<ResponseModel> {
    return super.getCustomApiPaging("getStationHub", arrCols);
  }

  async getStationHubAsync(arrCols?: string[], pageSize?: number, pageNumber?: number): Promise<Hub[]> {
    const res = await this.getStationHub(arrCols, pageSize, pageNumber).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub[];
    return data;
  }

  async getSelectModelStationHubAsync(): Promise<SelectModel[]> {
    const data = await this.getStationHubAsync();
    if (data) {
      let stationHubs: SelectModel[] = [];
      stationHubs.push({ label: `-- Chọn dữ liệu --`, data: null, value: null });
      data.forEach(element => {
        stationHubs.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return stationHubs;
    } else {
      return null;
    }
  }

  public getStationHubByPoId(poId: any, arrCols: string[] = []): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("poId", poId);

    return super.getCustomApiPaging("getStationHubByPoId", arrCols, params);
  }

  async getStationHubByPoIdAsync(poId: any, arrCols?: string[]): Promise<Hub[]> {
    const res = await this.getStationHubByPoId(poId, arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub[];
    return data;
  }

  async getSelectModelStationHubByPoIdAsync(poId: any, arrCols?: string[]): Promise<SelectModel[]> {
    const data = await this.getStationHubByPoIdAsync(poId, arrCols);
    if (data) {
      let stationHubs: SelectModel[] = [];
      stationHubs.push({ label: `-- Chọn trạm --`, data: null, value: null });
      data.forEach(element => {
        stationHubs.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return stationHubs;
    } else {
      return null;
    }
  }

  public getHubByWardId(wardId: number = 0, arrCols?: string[], districtId: number = 0, proviceId: number = 0): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("proviceId", proviceId + "");
    params = params.append("districtId", districtId + "");
    params = params.append("wardId", wardId + "");

    return super.getCustomApiPaging("getHubByWardId", arrCols, params);
  }

  async getHubByWardIdAsync(wardId?: number, arrCols?: string[], districtId?: number, provinceId?: number): Promise<Hub> {
    const res = await this.getHubByWardId(wardId, arrCols, districtId, provinceId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub;
    return data;
  }

  public getListHubByWardId(wardId: any, arrCols: string[] = []): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("wardId", wardId);

    return super.getCustomApiPaging("getListHubByWardId", arrCols, params);
  }

  getByListWardId(listWardId: number[]) {
    return super.postCustomUrlApi(environment.apiGeneralUrl, "GetByListWardId", listWardId);
  }

  async getByListWardIdAsync(listWardId: any[]): Promise<any[]> {
    const res = await this.getByListWardId(listWardId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as any[];
    return data;
  }

  public getReceiveHubByToHub(hubId: any, arrCols: string[] = []): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("hubId", hubId);

    return super.getCustomApiPaging("getReceiveHubByToHub", arrCols, params);
  }

  async getAllReceiveHubByToHubAsync(hubId: any, arrCols: string[] = []): Promise<Hub[]> {
    const res = await this.getReceiveHubByToHub(hubId, arrCols).toPromise();
    if (res.isSuccess) {
      const data = res.data as Hub[];
      return data;
    } else {
      return null;
    }
  }

  public loadListHubByWard(wardId: any, arrCols: string[] = []) {
    return this.getListHubByWardId(wardId, arrCols).map(x => {
      let data = x.data as Hub[];
      this.hubs = [];
      this.hubs.push({ label: "-- Chọn Trạm --", data: null, value: null });
      if (data) {
        data.forEach((element, index) => {
          this.hubs.push({ label: `${element.code} - ${element.name}`, data: element, value: element.id });
          if (element.centerHub) {
            if (data[index].centerHub) {
              if (data[index].centerHub.id !== element.centerHub.id) {
                this.hubs.push({ label: `${data[index].centerHub.code} - ${data[index].centerHub.name}`, data: data[index].centerHub, value: data[index].centerHub.id });
              }
            }
          }
          if (element.poHub) {
            if (data[index].poHub) {
              if (data[index].poHub.id !== element.poHub.id) {
                this.hubs.push({ label: `${data[index].poHub.code} - ${data[index].poHub.name}`, data: data[index].centerHub, value: data[index].poHub.id });
              }
            }
          }
        });
      } else {
        this.getAll().subscribe(y => {
          let hubs = y.data as Hub[];
          if (hubs) {
            hubs.forEach((element, index) => {
              this.hubs.push({ label: `${element.code} - ${element.name}`, data: element, value: element.id });
              if (element.centerHub) {
                if (hubs[index].centerHub) {
                  if (hubs[index].centerHub.id !== element.centerHub.id) {
                    this.hubs.push({ label: `${hubs[index].centerHub.code} - ${hubs[index].centerHub.name}`, data: hubs[index].centerHub, value: hubs[index].centerHub.id });
                  }
                }
              }
              if (element.poHub) {
                if (hubs[index].poHub) {
                  if (hubs[index].poHub.id !== element.poHub.id) {
                    this.hubs.push({ label: `${hubs[index].poHub.code} - ${hubs[index].poHub.name}`, data: hubs[index].centerHub, value: hubs[index].poHub.id });
                  }
                }
              }
            });
          }
        });
      }
      return this.hubs;
    });
  }

  async getListHubByWardIdAsync(wardId: any, arrCols?: string[]): Promise<Hub[]> {
    const res = await this.getListHubByWardId(wardId, arrCols).toPromise();
    if (res.isSuccess) {
      const data = res.data as Hub[];
      return data;
    } else {
      return null;
    }
  }

  async getInfoLocationByAddressAsync(address: any): Promise<ResponseModel> {
    let params = new HttpParams();
    params = params.append("address", address);
    return super.getCustomApiPaging("GetInfoLocationByAddress", [], params).toPromise<ResponseModel>();
  }

  async getSelectModelgetListHubByWardIdAsync(wardId: any, arrCols?: string[]): Promise<SelectModel[]> {
    const data = await this.getListHubByWardIdAsync(wardId, arrCols);
    if (data) {
      this.hubs = [];
      this.hubs.push({ label: "-- Chọn Trạm --", data: null, value: null });
      if (data) {
        data.forEach((element, index) => {
          this.hubs.push({ label: `${element.code} - ${element.name}`, data: element, value: element.id });
          if (element.centerHub) {
            if (data[index].centerHub) {
              if (data[index].centerHub.id !== element.centerHub.id) {
                this.hubs.push({ label: `${data[index].centerHub.code} - ${data[index].centerHub.name}`, data: data[index].centerHub, value: data[index].centerHub.id });
              }
            }
          }
          if (element.poHub) {
            if (data[index].poHub) {
              if (data[index].poHub.id !== element.poHub.id) {
                this.hubs.push({ label: `${data[index].poHub.code} - ${data[index].poHub.name}`, data: data[index].centerHub, value: data[index].poHub.id });
              }
            }
          }
        });
      } else {
        let res = await this.getAllAsync();
        if (res.isSuccess) {
          const hubs = res.data as Hub[];
          if (hubs) {
            hubs.forEach((element, index) => {
              this.hubs.push({ label: `${element.code} - ${element.name}`, data: element, value: element.id });
              if (element.centerHub) {
                if (hubs[index].centerHub) {
                  if (hubs[index].centerHub.id !== element.centerHub.id) {
                    this.hubs.push({ label: `${hubs[index].centerHub.code} - ${hubs[index].centerHub.name}`, data: hubs[index].centerHub, value: hubs[index].centerHub.id });
                  }
                }
              }
              if (element.poHub) {
                if (hubs[index].poHub) {
                  if (hubs[index].poHub.id !== element.poHub.id) {
                    this.hubs.push({ label: `${hubs[index].poHub.code} - ${hubs[index].poHub.name}`, data: hubs[index].centerHub, value: hubs[index].poHub.id });
                  }
                }
              }
            });
          }
        }
      }
      return this.hubs;
    }
  }

  getAllHubTranfer(arrCols?: string[]): Observable<ResponseModel> {
    return super.getCustomApiPaging("getAllHubTranfer", arrCols);
  }

  async getAllHubTranferAsync(arrCols?: string[]): Promise<Hub[]> {
    const res = await this.getAllHubTranfer(arrCols).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub[];
    return data;
  }

  async getInfoHubRoutingAsync(isTruckdelivery: any, districtId: any, wardId: any, weight: any): Promise<any> {
    let params = new HttpParams();
    params = params.append("isTruckdelivery", isTruckdelivery);
    params = params.append("districtId", districtId);
    params = params.append("wardId", wardId);
    params = params.append("weight", weight);
    let res = await super.getCustomApiPaging("GetInfoHubRouting", [], params).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  async getAllAsync(): Promise<any> {
    const res = await this.getAll().toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Hub[];
    return data;
  }

  async getSelectItemAsync(): Promise<SelectItem[]> {
    const res = await this.getAllAsync();
    if (res) {
      let allHub: SelectItem[] = [];
      allHub.push({ label: `-- Chọn trạm --`, value: null });
      res.forEach(element => {
        allHub.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
      return allHub;
    } else {
      return null;
    }
  }
  public getHubByManageHubId(Id: any, arrCols: string[] = []): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("Id", Id);
    return super.getCustomApiPaging("getHubByManageHubId", arrCols, params);
  }
  
}

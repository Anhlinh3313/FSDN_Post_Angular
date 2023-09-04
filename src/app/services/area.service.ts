import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { Area } from '../models/area.model';
import { ResponseModel } from '../models/response.model';
import { DataFilterViewModel } from '../view-model/dataFilter.viewModel';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/primeng';
import { Province, District } from '../models';
import { SelectModel } from '../models/select.model';

@Injectable()
export class AreaService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "area");
  }

  public GetDistrictAllowSelect(dataFilter: DataFilterViewModel): Observable<ResponseModel> {
    return super.postCustomApi("GetDistrictAllowSelect", dataFilter);
  }

  public GetDistrictSelected(dataFilter: DataFilterViewModel): Observable<ResponseModel> {
    return super.postCustomApi("GetDistrictSelected", dataFilter);
  }

  public GetProvinceAllowSelectByArea(areaGroupId: any, areaId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("areaGroupId", areaGroupId);
    params = params.append("areaId", areaId);
    return super.getCustomApi("GetProvinceAllowSelectByArea", params);
  }

  async getProvinceAllowSelectByAreaAsync(areaGroupId: any, areaId: any): Promise<SelectItem[]> {
    const res = await this.GetProvinceAllowSelectByArea(areaGroupId, areaId).toPromise();
    if (res.isSuccess) {
      const selectModel = [];
      const datas = res.data as any[];

      selectModel.push({ label: "-- Chọn dữ liệu --", data: null, value: null });
      datas.forEach(element => {
        selectModel.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
      return selectModel;
    }
  }

  async getDistrictSelected(areaGroupId: any, areaId: any, provinceIds: any[]): Promise<District[]> {
    let obj = {
      typeInt1: areaGroupId,
      typeInt2: areaId,
      arrayInt1: provinceIds
    }
    const res = await super.postCustomApi("getDistrictSelected", obj).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as District[];
    return data;
  }

  async getDistrictAllowSelect(areaGroupId: any, areaId: any, provinceIds: number[]): Promise<SelectModel[]> {
    let obj = {
      typeInt2: areaGroupId,
      typeInt3: areaId,
      arrayInt1: provinceIds
    }
    const res = await super.postCustomApi("getDistrictAllowSelect", obj).toPromise();
    if (res.isSuccess) {
      const selectModel = [];
      const datas = res.data as any[];

      datas.forEach(element => {
        selectModel.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
      return selectModel;
    }
  }

  public GetProvinceSelectedByArea(areaGroupId: any, areaId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("areaGroupId", areaGroupId);
    params = params.append("areaId", areaId);
    return super.getCustomApi("GetProvinceSelectedByArea", params);
  }

  async GetProvinceSelectedByAreaAsync(areaGroupId: any, areaId: any): Promise<any> {
    const res = await this.GetProvinceSelectedByArea(areaGroupId, areaId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Province[];
    return data;
  }

  public GetByAreaGroup(areaGroupId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("areaGroupId", areaGroupId);
    return super.getCustomApi("GetAreaByAreaGroupId", params);
  }

  async getByAreaGroupAsync(areaGroupId: any): Promise<Area[]> {
    const res = await this.GetByAreaGroup(areaGroupId).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Area[];
    return data;
  }


  updateAreas(model: Area[]) {
    return super.postCustomApi("UpdateAreas", model);
  }

  async updateAreasAsync(model: Area[]): Promise<Area[]> {
    const res = await this.updateAreas(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Area[];
    return data;
  }

  updateAreaDistricts(model: any) {
    return super.postCustomApi("UpdateAreaDistricts", model);
  }

  async updateAreaDistrictsAsync(model: Area): Promise<any> {
    const res = await this.updateAreaDistricts(model).toPromise();
    if (!this.isValidResponse(res)) return null;
    const data = res.data;
    return data;
  }

  deleteArea(model: Area) {
    return super.postCustomApi("DeleteArea", model);
  }

  async deleteAreaAsync(model: Area): Promise<Area> {
    const res = await this.deleteArea(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Area;
    return data;
  }
}
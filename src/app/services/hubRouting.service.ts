import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { HttpParams } from '@angular/common/http';
import { BaseService } from './base.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class HubRoutingService extends BaseService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "hubRouting");
  }

  getHubRoutingByPoHubId(poHubId: any) : Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("poHubId", poHubId);

    return super.getCustomApi("getHubRoutingByPoHubId", params);
  }

  getDatasFromHub(stationHubId: any, hubRoutingId: any) : Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("stationHubId", stationHubId);
    params = params.append("hubRoutingId", hubRoutingId);

    return super.getCustomApi("getDatasFromHub", params);
  }

  create(obj: Object) : Observable<ResponseModel> {
    return super.postCustomApi("create", obj);
  }

  update(obj) : Observable<ResponseModel> {
    return super.postCustomApi("update", obj);
  }

  // async getAllSelectModelAsync(): Promise<SelectItem[]> {
  //   const res = await .toPromise();
  //   if (res.isSuccess) {
  //     const data = res.data as HubRouting[];
  //     if (data) {
  //       const province: SelectItem[] = [];
  //       province.push({ label: `-- Chọn tất cả --`, value: null });
  //       data.forEach(element => {
  //         province.push({
  //           label: `${element.code} - ${element.name}`,
  //           value: element.id
  //         });
  //       });
  //       return province;
  //     }
  //   } else {
  //     return null;
  //   }
  // }
}
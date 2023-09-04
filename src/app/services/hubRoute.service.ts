import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class HubRouteService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "hubRoute");
  }

  public getDatasFromHub(hubId: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("hubId", hubId);

    return super.getCustomApi("getDatasFromHub", params);
  }

  public saveChangeHubRoute(hubId: any, wardIds: number[]): Observable<ResponseModel> {
    let obj = new Object();
    obj["hubId"] = hubId;
    obj["wardIds"] = wardIds;

    return super.postCustomApi("saveChangeHubRoute", obj);
  }
}

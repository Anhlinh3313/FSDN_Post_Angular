import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { ChargedRemote } from '../models/chargedRemote.model';
import { ResponseModel } from '../models/response.model';
import { DataFilterViewModel } from '../view-model/dataFilter.viewModel';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class ChargedRemomteService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "chargedRemote");
  }

  public GetProvinceSelected(): Observable<ResponseModel> {
    let params = new HttpParams();
    return super.getCustomApi("ProvinceSelected", params);
  }

  public GetDistrictAllowSelect(dataFilter: DataFilterViewModel): Observable<ResponseModel> {
    return super.postCustomApi("DistrictAllowSelect", dataFilter);
  }

  public GetDistrictSelected(dataFilter: DataFilterViewModel): Observable<ResponseModel> {
    return super.postCustomApi("DistrictSelected", dataFilter);
  }

  public saveSetup(chargedRemote: ChargedRemote): Observable<ResponseModel> {
    return super.postCustomApi("SaveSetup", chargedRemote);
  }

}

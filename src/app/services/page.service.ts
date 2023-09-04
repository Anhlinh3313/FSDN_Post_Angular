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
export class PageService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "page");
  }

  public getMenuByModuleId(id: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("id", id);

    return super.getCustomApi("getMenuByModuleId", params);
  }

  public getAllByModuleId(id: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("id", id);

    return super.getCustomApi("getAllByModuleId", params);
  }
}
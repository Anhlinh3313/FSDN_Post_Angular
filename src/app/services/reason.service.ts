import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";

import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class ReasonService extends GeneralService {
  isMustInput?: boolean; 
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "reason");
  }

  getByType(type: string) : Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("type", type);
    return super.getCustomApi("getByType", params);
  }
}
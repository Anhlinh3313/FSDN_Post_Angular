import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { ResponseModel } from '../models/response.model';
import { BaseModel } from '../models/base.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class HolidayService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "Holiday");
  }

  public getHolidayByYear(year: any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("year", year);
    return super.getCustomApi("GetHolidayByYear", params);
  }
}
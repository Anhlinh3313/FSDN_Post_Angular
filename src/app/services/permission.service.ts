import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class PermissionService extends GeneralService {
  constructor(protected httpClient: HttpClient, protected persistenceService: PersistenceService, public messageService: MessageService) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "permission");
  }

  public checkPermissionDetail(aliasPath: string, moduleId: any): Observable<ResponseModel> {
    var params = new HttpParams();
    params = params.append("aliasPath", aliasPath);
    params = params.append("moduleId", moduleId);

    return super.getCustomApi("CheckPermissionDetail", params);
  }
}

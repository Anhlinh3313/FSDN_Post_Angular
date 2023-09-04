import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { ServiceDVGT } from '../models/serviceDVGT.model';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectItem } from 'primeng/components/common/selectitem';

@Injectable({
  providedIn: 'root'
})
export class ReasonComplainService  extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "ComplainType");
  }

}

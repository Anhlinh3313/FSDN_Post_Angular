import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class TruckScheduleStatusService extends GeneralService {
    constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
        super(messageService, httpClient, persistenceService, environment.apiPostUrl, "TruckScheduleStatus");
    }
}
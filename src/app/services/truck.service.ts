import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class TruckService extends GeneralService {
    constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
        super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "Truck");
    }

    async searchByTruckNumber(truckNumber: any) {
        let params = new HttpParams();
        params = params.append("truckNumber", truckNumber);

        let res = await this.getCustomApi("SearchByTruckNumber", params).toPromise();
        return res;
    }
}

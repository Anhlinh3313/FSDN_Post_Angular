import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { MessageService } from 'primeng/components/common/messageservice';
import { ChargedCODFilterModel } from '../models/chargeCODFilter.model';

@Injectable()
export class ChangeCODService extends GeneralService {
    constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
        super(messageService, httpClient, persistenceService, environment.apiPostUrl, "changeCOD");
    }
    async GetListChangeCOD(modal: any){
        let res = await this.postCustomApi("GetListChangeCOD",modal).toPromise();
        if(res) return res.data;
    }
    async AcceptChangeCOD(modal: ChargedCODFilterModel){
        let res = await this.postCustomApi("Accept",modal).toPromise();
        if(res) return res.data;
    }
    async CancleChangeCOD(id: number){
        let params = new HttpParams();
        params = params.append("id", id+"");
        let res = await this.getCustomApi('Reject',params).toPromise();
        return res.data;
    }  
}

import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

import { ServiceDVGT } from '../models/serviceDVGT.model';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { GeneralService } from './general.service';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';
import { PriceDVGT, ShipmentPriceDVGT } from '../models';

@Injectable()
export class ServiceDVGTService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "serviceDVGT");
  }

  getByShipmentId(id: any) {
    let params = new HttpParams();
    params = params.append("id", id);
    return super.getCustomApi("getByShipmentId", params);
  }
  
  async getByShipmentIdAsync(id: any): Promise<ServiceDVGT[]> {
    const res = await this.getByShipmentId(id).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as ServiceDVGT[];
    return data;
  }
  
  async getNameByShipmentIdAsync(id: any): Promise<string> {
    const res = await this.getByShipmentIdAsync(id);
    const data = res.map(x => x.name);
    const serviceDVGTNames = data.join(", ");
    return serviceDVGTNames;
  }

  getPriceDVGTByShipmentId(id: any) {
    let params = new HttpParams();
    params = params.append("id", id);
    return super.getCustomApi("GetPriceDVGTByShipmentId", params);
  }

  async getPriceDVGTByShipmentIdAsync(id: any): Promise<ShipmentPriceDVGT[]> {
    const res = await this.getPriceDVGTByShipmentId(id).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as any;
    return data;
  }
}
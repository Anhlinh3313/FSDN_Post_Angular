
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { HttpParams } from '@angular/common/http';
import { PersistenceService, StorageType } from 'angular-persistence';
import { Constant } from '../infrastructure/constant';
import { HandleError } from '../infrastructure/handleError';
import { MessageService } from 'primeng/components/common/messageservice';
import { Options } from "jsbarcode";

//@Injectable()
export class BaseService extends HandleError {
    constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService, protected urlName: string, protected apiName: string) {
        super(messageService);
        let token = this.persistenceService.get(Constant.auths.token, StorageType.LOCAL);
    }

    public getCustomApi(apiMethod: string, params: HttpParams): Observable<ResponseModel> {
        return this.httpClient.get<ResponseModel>(`${this.urlName}/${this.apiName}/${apiMethod}`, { params: params });
    }

    public postCustomApi(apiMethod: string, model: Object): Observable<ResponseModel> {
        return this.httpClient.post<ResponseModel>(`${this.urlName}/${this.apiName}/${apiMethod}`, model);
    }

    public getCustomApiPaging(apiMethod: string, arrCols: string[] = [], params = new HttpParams(), pageSize: number = 0, pageNumber: number = 0): Observable<ResponseModel> {
        let cols = null;

        if (arrCols.length > 0) {
            cols = arrCols.join(',');
        }

        if (!params) params = new HttpParams();

        if (pageSize)
            params = params.append("pageSize", pageSize + "");
        if (pageNumber)
            params = params.append("pageNumber", pageNumber + "");
        if (cols)
            params = params.append("cols", cols);

        return this.httpClient.get<ResponseModel>(`${this.urlName}/${this.apiName}/${apiMethod}`, { params: params });
    }

    public postCustomApiPaging(apiMethod: string, model: object): Observable<ResponseModel> {
        return this.httpClient.post<ResponseModel>(`${this.urlName}/${this.apiName}/${apiMethod}`, model);
    }


    public postCustomUrlApi(urlName: string, apiMethod: string, model: Object): Observable<ResponseModel> {
        return this.httpClient.post<ResponseModel>(`${urlName}/${this.apiName}/${apiMethod}`, model);
    }

    public getCustomUrlApiPaging(urlName: string, apiMethod: string, arrCols: string[] = [], params = new HttpParams(), pageSize: number = 0, pageNumber: number = 0): Observable<ResponseModel> {
        let cols = null;

        if (arrCols.length > 0) {
            cols = arrCols.join(',');
        }

        if (!params) params = new HttpParams();

        if (pageSize)
            params = params.append("pageSize", pageSize + "");
        if (pageNumber)
            params = params.append("pageNumber", pageNumber + "");
        if (cols)
            params = params.append("cols", cols);

        return this.httpClient.get<ResponseModel>(`${urlName}/${this.apiName}/${apiMethod}`, { params: params });
    }

    public postAny(apiMethod: string, model: Object): Observable<any> {
        let options: any = { responseType: "blob" };
        return this.httpClient.post<any>(`${this.urlName}/${this.apiName}/${apiMethod}`, model, options);
    }
}

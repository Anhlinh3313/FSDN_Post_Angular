import { Injectable } from '@angular/core';
import { PersistenceService, StorageType } from 'angular-persistence';
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { Constant } from '../../infrastructure/constant';
import { User } from '../../models/user.model';
import { BaseService } from '../base.service';
import { environment } from '../../../environments/environment';
import { ResponseModel } from '../../models';

@Injectable()
export class AuthService extends BaseService {

  constructor(protected messageService: MessageService, protected persistenceService: PersistenceService, protected httpClient: HttpClient, private router: Router) {
    super(messageService, httpClient, persistenceService, environment.apiGeneralUrl, "Account");
  }

  public isLoggedIn(): boolean {
    var isLogged = this.persistenceService.get(Constant.auths.isLoginIn, StorageType.LOCAL);
    if (isLogged === 'true') {
      return true;
    }
    return false;
  }

  async login(userName: string, password: string): Promise<ResponseModel> {
    var loginObj = new Object();
    loginObj["userName"] = userName;
    loginObj["passWord"] = password;
    let ret = await super.postCustomApi("SignIn", loginObj).toPromise();
    return ret;
  }

  public getEmpByCode(userName: string) {
    let params = new HttpParams();
    params = params.append("username", userName);
    return super.getCustomApi("GetEmpByCode", params);
  }

  public logout() {
    this.persistenceService.remove(Constant.auths.isLoginIn, StorageType.LOCAL);
    this.persistenceService.remove(Constant.auths.token, StorageType.LOCAL);
    this.persistenceService.remove(Constant.auths.userId, StorageType.LOCAL);
    this.persistenceService.remove(Constant.auths.userName, StorageType.LOCAL);
    this.persistenceService.remove(Constant.auths.fullName, StorageType.LOCAL);
    this.persistenceService.remove(Constant.auths.datetimeLogin, StorageType.LOCAL);
    var routing = Constant.pages.login.alias;
    this.router.navigate([routing]);
  }
  public updateHubIdUser(model: User)
  {
    return  this.postCustomApi("UpdateHubIdUser",model);
  }
  public getToken(): string {
    return this.persistenceService.get(Constant.auths.token, StorageType.LOCAL);
  }

  public getUserId(): number {
    return this.persistenceService.get(Constant.auths.userId, StorageType.LOCAL);
  }

  public getUserName(): string {
    return this.persistenceService.get(Constant.auths.userName, StorageType.LOCAL);
  }

  public getFullName(): string {
    return this.persistenceService.get(Constant.auths.fullName, StorageType.LOCAL);
  }

  public getAccountInfo() {
    let cols = [Constant.classes.includes.user.hub, Constant.classes.includes.user.role, Constant.classes.includes.user.department];

    let id = this.persistenceService.get(Constant.auths.userId, StorageType.LOCAL);

    let params = new HttpParams();
    params = params.append("id", id);

    return super.getCustomApiPaging("get", cols, params);
  }

  public async getAccountInfoAsync(): Promise<User> {
    const res = await this.getAccountInfo().toPromise();
    if (res.isSuccess) {
      const data = res.data as User;
      return data;
    } else {
      return new User();
    }
  }

  public UpdateSeriNumber(seriNumber: any) {
    var loginObj = new Object();
    loginObj["seriNumber"] = seriNumber;

    return super.postCustomApi("UpdateSeriNumber", loginObj);
  }
}

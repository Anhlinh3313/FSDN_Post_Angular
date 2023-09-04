import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgProgressModule, NgProgressInterceptor } from 'ngx-progressbar';
import { PersistenceModule } from 'angular-persistence';
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';

//Google Place Module
import { ApiEndpointInterceptor } from './http-interceptor/api-endpoint.interceptor';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from './login/login.component';
import { AuthService } from './services/auth/auth.service';
import { AuthGuard } from './shared/guard/auth.guard';

import { GrowlModule, DialogModule } from 'primeng/primeng';
import { MessageService } from 'primeng/components/common/messageservice';
import { Page404Component } from './404/404.component';
import { Page403Component } from './403/403.component';
import { HotkeyModule } from 'angular2-hotkeys';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { UserService } from './services';
import { PermissionService } from './services/permission.service';
import { VersionCheckService } from './services/version-check.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    Page403Component,
    Page404Component,
  ],
  imports: [
    DialogModule,
    BrowserAnimationsModule,
    CommonModule,
    BrowserModule,
    HttpClientModule,
    HttpModule,
    AppRoutingModule,
    FormsModule,
    PersistenceModule,
    GrowlModule,
    NgProgressModule,
    HotkeyModule.forRoot(),
    ModalModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ApiEndpointInterceptor, multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: NgProgressInterceptor, multi: true }, 
    { provide: APP_BASE_HREF, useValue: "/"},
  AuthService,
  AuthGuard,
  MessageService,
  BsModalService,
  UserService,
  PermissionService,
  VersionCheckService
  ],
  bootstrap: [AppComponent],
  exports: [
  ]
})
export class AppModule { }

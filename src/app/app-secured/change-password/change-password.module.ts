import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//
import { UserService, AuthService, } from '../../services/index';
import { AgmCoreModule } from '@agm/core';
import { AgmCoreConfig } from '../../infrastructure/agmCore.config';
import { ChangePasswordRoutingModule } from './change-password.routing';
import { ChangePassWordComponent } from './change-password.component';
import { ModalModule } from '../../../../node_modules/ngx-bootstrap';
import { CommonModule } from '../../../../node_modules/@angular/common';
// import { DateFormatPipe } from '../../pipes/dateFormat.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ModalModule.forRoot(),
    AgmCoreModule.forRoot(AgmCoreConfig),
    ReactiveFormsModule,
    ChangePasswordRoutingModule,
  ],
  declarations: [
    // DateFormatPipe,
    ChangePassWordComponent
  ],
  providers: [
    UserService,
    AuthService,
  ],
  entryComponents: [
  ],
  exports: [
    // DateFormatPipe
  ],
})
export class ChangePasswordModule { }

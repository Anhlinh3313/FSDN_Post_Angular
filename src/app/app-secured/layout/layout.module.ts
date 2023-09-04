import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { NavigationComponent } from './navigation/navigation.component';
import { HeaderComponent } from './header/header.component';
import { RightSidebarComponent } from './right-sidebar/right-sidebar.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { SharedSecuredModule } from '../shared/shared-secured.module';

import { PopoverModule } from 'ngx-bootstrap/popover';
import { DropdownModule, InputSwitchModule } from 'primeng/primeng';
import { PageService, AuthService, NotificationCenterService, HubService } from '../../services/index';
import { CardComponent } from './card/card.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SharedSecuredModule,
    PopoverModule.forRoot(),
    DropdownModule,
    InputSwitchModule,
  ],
  declarations: [
    FooterComponent,
    NavigationComponent,
    HeaderComponent,
    RightSidebarComponent,
    ChatBoxComponent,
    CardComponent,

  ],
  exports:  [
    FooterComponent,
    NavigationComponent,
    HeaderComponent,
    RightSidebarComponent,
    ChatBoxComponent,
    CardComponent,
  ],
  providers: [
    PageService,
    NotificationCenterService,
    AuthService,
    HubService
  ],
})

export class LayoutModule { }


import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../shared/components/baseComponent';
import { MessageService } from 'primeng/components/common/messageservice';
import { PermissionService } from '../../services/permission.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styles: []
})
export class HelloComponent extends BaseComponent implements OnInit {

  constructor(public messageService: MessageService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
   }

  ngOnInit() {
  }

}

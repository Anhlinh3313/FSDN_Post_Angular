import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../../../shared/components/baseComponent';
import { MessageService } from 'primeng/components/common/messageservice';
import { PermissionService } from '../../../services/permission.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-card',
    templateUrl: 'card.component.html'
})

export class CardComponent implements OnInit {
    constructor(public messageService: MessageService,
        public permissionService: PermissionService,
        public router: Router,
      ) {
     }

    ngOnInit() { }
}
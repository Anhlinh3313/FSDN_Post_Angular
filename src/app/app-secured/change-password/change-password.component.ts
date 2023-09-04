import { Component, OnInit,  } from '@angular/core';
//
import { MessageService } from 'primeng/components/common/messageservice';
import { BaseComponent } from '../../shared/components/baseComponent';
import { UserService, AuthService } from '../../services/index';
import { Constant } from '../../infrastructure/constant';
import { PermissionService } from '../../services/permission.service';
import { Router } from '@angular/router';

declare var jQuery: any;

@Component({
  selector: 'change-password-password',
  templateUrl: 'change-password.component.html',
  styles: []
})
export class ChangePassWordComponent extends BaseComponent implements OnInit {

  constructor(protected messageService: MessageService, protected userService: UserService, protected authService:AuthService, public permissionService: PermissionService, public router: Router) {
    super(messageService, permissionService, router);
  }

  parentPage: string = Constant.pages.changePassWord.name;
  currentPage: string = Constant.pages.changePassWord.name;
  currentPassWord: string;
  newPassWord: string;
  reNewPassWord: string;

  ngOnInit() {
    this.initData();
  }

  initData() {
  }

  ngAfterViewInit() {
    // jQuery(document).ready(function () {
    //   jQuery('.i-checks').iCheck({
    //     checkboxClass: 'icheckbox_square-green',
    //     radioClass: 'iradio_square-green',
    //   });
    //   jQuery('.footable').footable();
    // });
  }

  changePassWord(): any {
    if (!this.isValid()) return;
    return this.userService.changePassWord(this.currentPassWord, this.newPassWord).map(
      x => {
        if (!this.isValidResponse(x)) return;
        this.authService.login(this.authService.getUserName(), this.newPassWord);
        this.messageService.add({severity: Constant.messageStatus.success, detail: "Thay đổi mật khẩu thành công"});
        return true;
      }
    );
  }

  changePassWordAfterLogin() {
    if (!this.isValid()) return;
    
    this.userService.changePassWord(this.currentPassWord, this.newPassWord).subscribe(
      x => {
        if (!this.isValidResponse(x)) return;
        this.messageService.add({severity: Constant.messageStatus.success, detail: "Thay đổi mật khẩu thành công"});
      }
    );
  }

  isValid(): boolean {
    if (!this.currentPassWord) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Chưa nhập mật khẩu hiện tại" });
      return false;
    } else if (!this.newPassWord) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Chưa nhập mật khẩu mới" });
      return false;
    } else if (!this.reNewPassWord) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Chưa xác thực lại mật khẩu mới" });
      return false;
    } else if (this.newPassWord !== this.reNewPassWord) {
      this.messageService.add({ severity: Constant.messageStatus.warn, detail: "Mật khẩu xác thực không khớp" });
      return false;
    }

    return true;
  }
}

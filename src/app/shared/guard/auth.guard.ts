import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from "rxjs/Observable";
import { Constant } from '../../infrastructure/constant';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
    constructor(private authService : AuthService, private router : Router) {
        
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        var isLogged = this.authService.isLoggedIn();
        var result = true;
        if (!isLogged) {
            result = false;
            this.router.navigate([Constant.pages.login.alias]);
        }
        return result;
    }    

    canActivateChild(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
      ): Observable<boolean>|Promise<boolean>|boolean {
        var isLogged = this.authService.isLoggedIn();
        var result = true;
        if (!isLogged) {
            result = false;
            this.router.navigate([Constant.pages.login.alias]);
        }
        return result;
    }
}
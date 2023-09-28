
import { Injectable } from "@angular/core";
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from "@angular/router";
import { LocalStorageService } from "../components/storage/localStorageService";
  
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router) { }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): boolean | Promise<boolean> {
        var isAuthenticated = this.getAuthStatus();
        if (!isAuthenticated) {
            this.router.navigate(['/login']);
        }
        return isAuthenticated;
    }

    private getAuthStatus(): boolean {
      const login = localStorage.getItem(LocalStorageService.LOGIN);
      if (login) {
        return true;
      } else {
        return false;
      }
    }
}
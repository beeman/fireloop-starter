import { Component, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FireLoopRef, Account, SDKToken } from '../shared/sdk/models';
import { RealTime, AccountApi } from '../shared/sdk/services';
import { UiService } from '../ui/ui.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  template: `
    <app-card [icon]="userApi.isAuthenticated() ? 'unlock' : 'lock'" title="Auth Status">
      <app-auth-status></app-auth-status>
    </app-card>
    <div *ngIf="!userApi.isAuthenticated()" class="row">
      <div class="col-lg-6">
        <app-card icon="sign-in" title="Login">
          <app-auth-login (login)="processLogin($event)"></app-auth-login>
        </app-card>
      </div>
      <div class="col-lg-6">
        <app-card icon="registered" title="Register">
          <app-auth-register (register)="processRegistration($event)"></app-auth-register>
        </app-card>
      </div>
    </div>
  `,
  styles: []
})
export class AuthComponent implements OnDestroy {

  private subscriptions: Subscription[] = new Array<Subscription>();
  public user: Account;
  private userRef: FireLoopRef<Account>;
  private token: any;

  constructor(
    private uiService: UiService,
    public userApi: AccountApi
  ) {

  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  processLogin(event: any) {
    this.subscriptions.push(this.userApi.login(event).subscribe(
      (token: SDKToken) => {
        let sidebarNav = this.uiService.getSidebarNav();
        sidebarNav[1].icon = 'unlock';
        this.uiService.setSidebarNav(sidebarNav);
        this.uiService.toastSuccess('Login Success', 'You have logged in successfully.');
      },
      (err: any) => {
        this.uiService.toastError('Login Failed', err.message || err.error.message);
      }));
  }

  processRegistration(event: any) {
    this.subscriptions.push(this.userApi.create(event).subscribe(
      (token: any) => {
        this.uiService.toastSuccess('Registration Success', 'You have registered successfully.');
      },
      (err: any) => {
        this.uiService.toastError('Registration Failed', err.message || err.error.message);
      }));
  }

  processLogout(event: any) {
    this.subscriptions.push(this.userApi.logout().subscribe(
      () => {
        let sidebarNav = this.uiService.getSidebarNav();
        sidebarNav[1].icon = 'lock';
        this.uiService.setSidebarNav(sidebarNav);
        this.uiService.toastSuccess('Logout Success', 'You have logged out successfully');
      },
      (err: any) => {
        this.uiService.toastError('Logout Failed', err.message || err.error.message);
      }));
  }

}

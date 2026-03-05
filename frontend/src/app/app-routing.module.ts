import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AdminRegisterComponent } from './components/auth/admin-register/admin-register.component';
import { AdminLoginComponent } from './components/auth/admin-login/admin-login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NGOMarketplaceComponent } from './components/ngo-marketplace/ngo-marketplace.component';
import { NGODetailsComponent } from './components/ngo-details/ngo-details.component';
import { WishBoxComponent } from './components/wish-box/wish-box.component';
import { EmergencyFundsComponent } from './components/emergency-funds/emergency-funds.component';
import { AdoptADayComponent } from './components/adopt-a-day/adopt-a-day.component';
import { GratitudeWallComponent } from './components/gratitude-wall/gratitude-wall.component';
import { DonationHistoryComponent } from './components/donation-history/donation-history.component';
import { NGODashboardComponent } from './components/ngo-dashboard/ngo-dashboard.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminNGOsComponent } from './components/admin-ngos/admin-ngos.component';
import { AdminDonationsComponent } from './components/admin-donations/admin-donations.component';
import { ImpactStoriesComponent } from './components/impact-stories/impact-stories.component';
import { ImpactStoryDetailComponent } from './components/impact-story-detail/impact-story-detail.component';
import { DiscussionsComponent } from './components/discussions/discussions.component';
import { ProfileComponent } from './components/profile/profile.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'admin-register', component: AdminRegisterComponent },
  { path: 'admin-login', component: AdminLoginComponent },
  { path: 'marketplace', component: NGOMarketplaceComponent },
  { path: 'ngo/:id', component: NGODetailsComponent },
  { path: 'wishes', component: WishBoxComponent },
  { path: 'emergency-funds', component: EmergencyFundsComponent },
  { path: 'adopt-a-day', component: AdoptADayComponent },
  { path: 'gratitude-wall', component: GratitudeWallComponent },
  { path: 'impact-stories', component: ImpactStoriesComponent },
  { path: 'impact-story/:id', component: ImpactStoryDetailComponent },
  { path: 'discussions', component: DiscussionsComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'donation-history',
    component: DonationHistoryComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['donor'] }
  },
  {
    path: 'ngo-dashboard',
    component: NGODashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ngo_admin'] }
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['system_admin'] }
  },
  {
    path: 'admin/users',
    component: AdminUsersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['system_admin'] }
  },
  {
    path: 'admin/ngos',
    component: AdminNGOsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['system_admin'] }
  },
  {
    path: 'admin/donations',
    component: AdminDonationsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['system_admin'] }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }


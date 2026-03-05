import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { registerLocaleData } from '@angular/common';
import localeEnIN from '@angular/common/locales/en-IN';

// Register Indian Locale
registerLocaleData(localeEnIN);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';

// Chart.js
import { NgChartsModule } from 'ng2-charts';

// Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { AdminRegisterComponent } from './components/auth/admin-register/admin-register.component';
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
import { DataPreviewDialogComponent } from './components/data-preview-dialog/data-preview-dialog.component';
import { SystemMaintenanceDialogComponent } from './components/system-maintenance-dialog/system-maintenance-dialog.component';
import { AnalyticsDashboardDialogComponent } from './components/analytics-dashboard-dialog/analytics-dashboard-dialog.component';
import { CreateNGODialogComponent } from './components/create-ngo-dialog/create-ngo-dialog.component';
import { ImpactStoriesComponent } from './components/impact-stories/impact-stories.component';
import { ImpactStoryDetailComponent } from './components/impact-story-detail/impact-story-detail.component';
import { DiscussionsComponent } from './components/discussions/discussions.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ReviewDocsDialogComponent } from './components/review-docs-dialog/review-docs-dialog.component';
import { VerifyEmailComponent } from './components/auth/verify-email/verify-email.component';
import { SafePipe } from './pipes/safe.pipe';

// Services
import { AuthInterceptor } from './services/auth.interceptor';
import { AuthService } from './services/auth.service';
import { NGOService } from './services/ngo.service';
import { DonationService } from './services/donation.service';
import { WishService } from './services/wish.service';
import { EmergencyFundService } from './services/emergency-fund.service';
import { AdoptADayService } from './services/adopt-a-day.service';
import { GratitudeService } from './services/gratitude.service';
import { AnalyticsService } from './services/analytics.service';
import { ImpactStoryService } from './services/impact-story.service';
import { DiscussionService } from './services/discussion.service';
import { AddImpactStoryDialogComponent } from './components/add-impact-story-dialog/add-impact-story-dialog.component';
import { AdminLoginComponent } from './components/auth/admin-login/admin-login.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    AdminRegisterComponent,
    DashboardComponent,
    NGOMarketplaceComponent,
    NGODetailsComponent,
    WishBoxComponent,
    EmergencyFundsComponent,
    AdoptADayComponent,
    GratitudeWallComponent,
    DonationHistoryComponent,
    NGODashboardComponent,
    AdminDashboardComponent,
    AdminUsersComponent,
    AdminNGOsComponent,
    AdminDonationsComponent,
    DataPreviewDialogComponent,
    SystemMaintenanceDialogComponent,
    AnalyticsDashboardDialogComponent,
    CreateNGODialogComponent,
    ImpactStoriesComponent,
    ImpactStoryDetailComponent,
    DiscussionsComponent,
    AddImpactStoryDialogComponent,
    ProfileComponent,
    ReviewDocsDialogComponent,
    VerifyEmailComponent,
    SafePipe,
    AdminLoginComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatCheckboxModule,
    MatStepperModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatExpansionModule,
    NgChartsModule
  ],
  providers: [
    AuthService,
    NGOService,
    DonationService,
    WishService,
    EmergencyFundService,
    AdoptADayService,
    GratitudeService,
    AnalyticsService,
    ImpactStoryService,
    DiscussionService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: LOCALE_ID,
      useValue: 'en-IN'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


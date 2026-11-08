import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmergencyIncidentService } from '../../services/emergency-incident.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-emergency-incidents',
  templateUrl: './emergency-incidents.component.html',
  styleUrls: ['./emergency-incidents.component.scss']
})
export class EmergencyIncidentsComponent implements OnInit {
  incidents: any[] = [];
  selectedIncident: any = null;
  loading = true;
  showCreateForm = false;
  isAdmin = false;
  activeTab = 0;

  incidentForm: FormGroup;
  updateForm: FormGroup;

  incidentColumns = ['title', 'type', 'severity', 'location', 'affectedPeople', 'status', 'actions'];

  typeOptions = ['flood', 'earthquake', 'drought', 'cyclone', 'fire', 'epidemic', 'other'];
  severityOptions = ['low', 'medium', 'high', 'critical'];
  statusOptions = ['reported', 'active', 'contained', 'resolved'];

  constructor(
    private fb: FormBuilder,
    private incidentService: EmergencyIncidentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.incidentForm = this.fb.group({
      title: ['', Validators.required],
      category: ['flood', Validators.required],
      severity: ['high'],
      description: ['', Validators.required],
      affectedArea: ['', Validators.required],
      state: ['', Validators.required],
      estimatedAffected: [0, Validators.min(0)]
    });

    this.updateForm = this.fb.group({
      message: ['', Validators.required],
      status: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = user?.role === 'system_admin' || user?.role === 'ngo_admin';
    this.loadIncidents();
  }

  loadIncidents(): void {
    this.loading = true;
    this.incidentService.getIncidents().subscribe({
      next: (res) => {
        this.incidents = res.data || res.incidents || res || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  createIncident(): void {
    if (this.incidentForm.invalid) return;
    this.incidentService.createIncident(this.incidentForm.value).subscribe({
      next: () => {
        this.showCreateForm = false;
        this.incidentForm.reset({ severity: 'high', category: 'flood', estimatedAffected: 0 });
        this.snackBar.open('Incident reported!', 'Close', { duration: 3000 });
        this.loadIncidents();
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  viewIncident(incident: any): void {
    this.selectedIncident = incident;
    this.activeTab = 1;
  }

  addUpdate(): void {
    if (!this.selectedIncident || this.updateForm.invalid) return;
    this.incidentService.addUpdate(this.selectedIncident._id, this.updateForm.value).subscribe({
      next: () => {
        this.updateForm.reset();
        this.snackBar.open('Update posted!', 'Close', { duration: 3000 });
        this.incidentService.getIncident(this.selectedIncident._id).subscribe({
          next: (res) => { this.selectedIncident = res.data || res.incident || res; }
        });
      },
      error: (err) => this.snackBar.open(err?.error?.message || 'Failed', 'Close', { duration: 3000 })
    });
  }

  getSeverityColor(severity: string): string {
    const c: any = { critical: 'warn', high: 'accent', medium: 'primary', low: '' };
    return c[severity] || 'primary';
  }

  getStatusClass(status: string): string {
    const c: any = { active: 'status-active', reported: 'status-monitoring', contained: 'status-resolved', resolved: 'status-closed' };
    return c[status] || '';
  }
}

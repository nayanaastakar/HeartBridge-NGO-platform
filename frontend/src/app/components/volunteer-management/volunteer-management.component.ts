import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VolunteerService } from '../../services/volunteer.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-volunteer-management',
  templateUrl: './volunteer-management.component.html',
  styleUrls: ['./volunteer-management.component.scss']
})
export class VolunteerManagementComponent implements OnInit {
  tasks: any[] = [];
  volunteers: any[] = [];
  myProfile: any = null;
  isNgoAdmin = false;
  isRegistered = false;
  loading = true;
  taskLoading = false;
  activeTab = 0;

  registerForm: FormGroup;
  taskForm: FormGroup;
  logHoursForm: FormGroup;
  showRegisterForm = false;
  showTaskForm = false;
  selectedTask: any = null;

  skillOptions = ['Teaching', 'Medical', 'Construction', 'IT/Tech', 'Counseling', 'Logistics', 'Fundraising', 'Legal', 'Other'];
  taskStatusOptions = ['open', 'in-progress', 'completed'];

  displayedColumns = ['title', 'category', 'requiredSkills', 'location', 'deadline', 'status', 'actions'];
  volunteerColumns = ['name', 'email', 'skills', 'hoursLogged', 'status'];

  constructor(
    private fb: FormBuilder,
    private volunteerService: VolunteerService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      skills: [[], Validators.required],
      availability: ['weekends'],
      bio: [''],
      emergencyContact: this.fb.group({
        name: [''],
        phone: ['']
      })
    });

    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      requiredSkills: [[]],
      location: [''],
      deadline: [''],
      maxVolunteers: [10, [Validators.min(1)]]
    });

    this.logHoursForm = this.fb.group({
      hours: [1, [Validators.required, Validators.min(0.5)]],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isNgoAdmin = user?.role === 'ngo_admin' || user?.role === 'system_admin';
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.volunteerService.getTasks().subscribe({
      next: (res) => {
        this.tasks = res.tasks || res || [];
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    if (!this.isNgoAdmin) {
      this.volunteerService.getMyProfile().subscribe({
        next: (res) => {
          this.myProfile = res.volunteer || res;
          this.isRegistered = !!this.myProfile;
        },
        error: () => { this.isRegistered = false; }
      });
    } else {
      this.volunteerService.getVolunteers().subscribe({
        next: (res) => { this.volunteers = res.volunteers || res || []; },
        error: () => {}
      });
    }
  }

  registerAsVolunteer(): void {
    if (this.registerForm.invalid) return;
    this.volunteerService.registerVolunteer(this.registerForm.value).subscribe({
      next: (res) => {
        this.myProfile = res.volunteer || res;
        this.isRegistered = true;
        this.showRegisterForm = false;
        this.snackBar.open('Successfully registered as volunteer!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Registration failed', 'Close', { duration: 3000 });
      }
    });
  }

  createTask(): void {
    if (this.taskForm.invalid) return;
    this.taskLoading = true;
    this.volunteerService.createTask(this.taskForm.value).subscribe({
      next: () => {
        this.taskLoading = false;
        this.showTaskForm = false;
        this.taskForm.reset({ maxVolunteers: 10, requiredSkills: [] });
        this.snackBar.open('Task created successfully!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => {
        this.taskLoading = false;
        this.snackBar.open(err?.error?.message || 'Failed to create task', 'Close', { duration: 3000 });
      }
    });
  }

  applyForTask(task: any): void {
    this.volunteerService.applyForTask(task._id).subscribe({
      next: () => {
        this.snackBar.open('Applied successfully!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Application failed', 'Close', { duration: 3000 });
      }
    });
  }

  logHours(task: any): void {
    this.selectedTask = task;
  }

  submitHours(): void {
    if (!this.selectedTask || this.logHoursForm.invalid) return;
    const { hours, notes } = this.logHoursForm.value;
    this.volunteerService.logHours(this.selectedTask._id, hours, notes).subscribe({
      next: () => {
        this.selectedTask = null;
        this.logHoursForm.reset({ hours: 1 });
        this.snackBar.open('Hours logged!', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: (err) => {
        this.snackBar.open(err?.error?.message || 'Failed to log hours', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: any = { open: 'primary', 'in-progress': 'accent', completed: 'warn' };
    return colors[status] || 'primary';
  }
}

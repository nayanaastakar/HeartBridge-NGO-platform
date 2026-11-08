import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AiService } from '../../services/ai.service';
import { AuthService } from '../../services/auth.service';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-ai-intelligence',
  templateUrl: './ai-intelligence.component.html',
  styleUrls: ['./ai-intelligence.component.scss']
})
export class AiIntelligenceComponent implements OnInit {
  chatMessages: { role: 'user' | 'assistant'; content: string; time: Date }[] = [];
  forecastData: any = null;
  anomalies: any[] = [];
  loading = { chat: false, forecast: false, anomaly: false };
  activeTab = 0;

  chatForm: FormGroup;

  // Chart config
  forecastChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { label: 'Predicted Donations (₹)', data: [], borderColor: '#e91e8c', backgroundColor: 'rgba(233,30,140,0.1)', fill: true, tension: 0.4 }
    ]
  };
  forecastChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: true }, title: { display: true, text: 'Donation Forecast (Next 6 Months)' } },
    scales: { y: { beginAtZero: true } }
  };

  anomalyColumns = ['type', 'description', 'severity', 'detectedAt'];

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.chatForm = this.fb.group({
      query: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.addWelcomeMessage();
  }

  addWelcomeMessage(): void {
    this.chatMessages.push({
      role: 'assistant',
      content: 'Hello! I\'m HeartBridge AI Assistant. I can help you with donation forecasts, campaign analysis, impact insights, and more. Ask me anything!',
      time: new Date()
    });
  }

  sendMessage(): void {
    const query = this.chatForm.get('query')?.value?.trim();
    if (!query) return;

    this.chatMessages.push({ role: 'user', content: query, time: new Date() });
    this.chatForm.reset();
    this.loading.chat = true;

    this.aiService.askAssistant(query).subscribe({
      next: (res) => {
        this.loading.chat = false;
        const answer = res.response || res.answer || res.message || 'I processed your request successfully.';
        this.chatMessages.push({ role: 'assistant', content: answer, time: new Date() });
      },
      error: () => {
        this.loading.chat = false;
        this.chatMessages.push({
          role: 'assistant',
          content: 'I encountered an error processing your request. Please ensure the AI service is running and try again.',
          time: new Date()
        });
      }
    });
  }

  runForecast(): void {
    this.loading.forecast = true;
    this.aiService.forecastDonations(6).subscribe({
      next: (res) => {
        this.loading.forecast = false;
        this.forecastData = res;
        if (res.forecast && Array.isArray(res.forecast)) {
          this.forecastChartData = {
            labels: res.forecast.map((f: any) => f.month || f.period || `Month ${f.index + 1}`),
            datasets: [{
              label: 'Predicted Donations (₹)',
              data: res.forecast.map((f: any) => f.predicted || f.amount || 0),
              borderColor: '#e91e8c',
              backgroundColor: 'rgba(233,30,140,0.1)',
              fill: true,
              tension: 0.4
            }]
          };
        }
      },
      error: () => {
        this.loading.forecast = false;
        this.snackBar.open('Forecast service unavailable', 'Close', { duration: 3000 });
      }
    });
  }

  detectAnomalies(): void {
    this.loading.anomaly = true;
    this.aiService.detectAnomalies().subscribe({
      next: (res) => {
        this.loading.anomaly = false;
        this.anomalies = res.anomalies || [];
      },
      error: () => {
        this.loading.anomaly = false;
        this.snackBar.open('Anomaly detection failed', 'Close', { duration: 3000 });
      }
    });
  }

  getSeverityColor(severity: string): string {
    const c: any = { high: 'warn', medium: 'accent', low: 'primary' };
    return c[severity] || 'primary';
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}

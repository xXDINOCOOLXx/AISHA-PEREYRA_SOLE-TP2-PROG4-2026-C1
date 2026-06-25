import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Chart, registerables } from 'chart.js';
import { StatsService } from '../../../core/services/stats.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-stats',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './admin-stats.component.html',
  styleUrl: './admin-stats.component.scss',
})
export class AdminStatsComponent implements OnInit, AfterViewInit {
  private statsService = inject(StatsService);
  private fb = inject(FormBuilder);

  @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];

  filterForm = this.fb.group({
    desde: [''],
    hasta: [''],
  });

  ngOnInit(): void {
    const hasta = new Date();
    const desde = new Date();
    desde.setMonth(desde.getMonth() - 1);
    this.filterForm.patchValue({
      desde: desde.toISOString().slice(0, 10),
      hasta: hasta.toISOString().slice(0, 10),
    });
  }

  ngAfterViewInit(): void {
    this.loadCharts();
  }

  loadCharts(): void {
    const { desde, hasta } = this.filterForm.getRawValue();
    this.charts.forEach((c) => c.destroy());
    this.charts = [];

    this.statsService.publicacionesPorUsuario(desde!, hasta!).subscribe((data) => {
      this.charts.push(
        new Chart(this.barChartRef.nativeElement, {
          type: 'bar',
          data: {
            labels: data.labels,
            datasets: [
              {
                label: 'Publicaciones',
                data: data.data,
                backgroundColor: '#0a66c2',
              },
            ],
          },
          options: { responsive: true, plugins: { legend: { display: false } } },
        }),
      );
    });

    this.statsService.comentarios(desde!, hasta!).subscribe((data) => {
      this.charts.push(
        new Chart(this.lineChartRef.nativeElement, {
          type: 'line',
          data: {
            labels: data.labels,
            datasets: [
              {
                label: 'Comentarios',
                data: data.data,
                borderColor: '#057642',
                backgroundColor: 'rgba(5,118,66,0.1)',
                fill: true,
                tension: 0.3,
              },
            ],
          },
          options: { responsive: true },
        }),
      );
    });

    this.statsService.comentariosPorPublicacion(desde!, hasta!).subscribe((data) => {
      this.charts.push(
        new Chart(this.pieChartRef.nativeElement, {
          type: 'pie',
          data: {
            labels: data.labels,
            datasets: [
              {
                data: data.data,
                backgroundColor: [
                  '#0a66c2',
                  '#057642',
                  '#cc1016',
                  '#f5a623',
                  '#7b61ff',
                  '#00a0b0',
                  '#e67e22',
                  '#2c3e50',
                  '#8e44ad',
                  '#16a085',
                ],
              },
            ],
          },
          options: { responsive: true },
        }),
      );
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import {
  MeasurementService,
  QuantityResult,
  DivisionResult,
  ComparisonResult,
  QuantityMeasurementDto,
} from '../../core/services/measurement.service';

type Tab = 'add' | 'subtract' | 'divide' | 'compare' | 'convert' | 'history';

interface Alert {
  type: 'error' | 'success';
  message: string;
}

interface QuantityResultState {
  value: number;
  unitSymbol: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  activeTab: Tab = 'add';
  quantityTypes: string[] = [];

  // ── Add ──────────────────────────────────────────────
  addQtyType = '';
  addUnits: string[] = [];
  addVal1 = '';
  addVal2 = '';
  addUnit1 = '';
  addUnit2 = '';
  addAlert: Alert | null = null;
  addLoading = false;
  addResult: QuantityResultState | null = null;

  // ── Subtract ─────────────────────────────────────────
  subQtyType = '';
  subUnits: string[] = [];
  subVal1 = '';
  subVal2 = '';
  subUnit1 = '';
  subUnit2 = '';
  subResultUnit = '';
  subAlert: Alert | null = null;
  subLoading = false;
  subResult: QuantityResultState | null = null;

  // ── Divide ───────────────────────────────────────────
  divQtyType = '';
  divUnits: string[] = [];
  divVal1 = '';
  divVal2 = '';
  divUnit1 = '';
  divUnit2 = '';
  divAlert: Alert | null = null;
  divLoading = false;
  divResult: number | null = null;

  // ── Compare ──────────────────────────────────────────
  cmpQtyType = '';
  cmpUnits: string[] = [];
  cmpVal1 = '';
  cmpVal2 = '';
  cmpUnit1 = '';
  cmpUnit2 = '';
  cmpAlert: Alert | null = null;
  cmpLoading = false;
  cmpResult: boolean | null = null;

  // ── Convert ──────────────────────────────────────────
  cvtQtyType = '';
  cvtUnits: string[] = [];
  cvtVal = '';
  cvtSource = '';
  cvtTarget = '';
  cvtAlert: Alert | null = null;
  cvtLoading = false;
  cvtResult: QuantityResultState | null = null;

  // ── History ──────────────────────────────────────────
  historyLoading = false;
  historyAlert: Alert | null = null;
  historyRows: QuantityMeasurementDto[] = [];
  historyLoaded = false;

  constructor(
    private auth: MeasurementService,
    private authService: AuthService,
    private measurement: MeasurementService
  ) {}

  ngOnInit(): void {
    this.quantityTypes = this.measurement.getQuantityTypes();
  }

  // ── Tab switching ────────────────────────────────────
  switchTab(tab: Tab): void {
    this.activeTab = tab;
    if (tab === 'history' && !this.historyLoaded) {
      this.loadHistory();
    }
  }

  // ── Unit population ──────────────────────────────────
  onAddQtyTypeChange(): void {
    this.addUnits = this.measurement.getUnits(this.addQtyType);
    this.addUnit1 = ''; this.addUnit2 = '';
    this.addResult = null; this.addAlert = null;
  }

  onSubQtyTypeChange(): void {
    this.subUnits = this.measurement.getUnits(this.subQtyType);
    this.subUnit1 = ''; this.subUnit2 = ''; this.subResultUnit = '';
    this.subResult = null; this.subAlert = null;
  }

  onDivQtyTypeChange(): void {
    this.divUnits = this.measurement.getUnits(this.divQtyType);
    this.divUnit1 = ''; this.divUnit2 = '';
    this.divResult = null; this.divAlert = null;
  }

  onCmpQtyTypeChange(): void {
    this.cmpUnits = this.measurement.getUnits(this.cmpQtyType);
    this.cmpUnit1 = ''; this.cmpUnit2 = '';
    this.cmpResult = null; this.cmpAlert = null;
  }

  onCvtQtyTypeChange(): void {
    this.cvtUnits = this.measurement.getUnits(this.cvtQtyType);
    this.cvtSource = ''; this.cvtTarget = '';
    this.cvtResult = null; this.cvtAlert = null;
  }

  // ── Add ──────────────────────────────────────────────
  onAdd(): void {
    this.addAlert = null;
    this.addResult = null;

    if (!this.addQtyType || !this.addVal1 || !this.addUnit1 || !this.addVal2 || !this.addUnit2) {
      this.addAlert = { type: 'error', message: 'Please fill in all fields.' };
      return;
    }

    this.addLoading = true;
    this.measurement.add({
      QuantityType: this.addQtyType,
      Value1: parseFloat(this.addVal1),
      Value2: parseFloat(this.addVal2),
      Unit1: this.addUnit1,
      Unit2: this.addUnit2,
    }).subscribe({
      next: (res: QuantityResult) => {
        this.addResult = res;
        this.addLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.addAlert = { type: 'error', message: err.error ?? 'Something went wrong.' };
        this.addLoading = false;
      },
    });
  }

  // ── Subtract ─────────────────────────────────────────
  onSubtract(): void {
    this.subAlert = null;
    this.subResult = null;

    if (!this.subQtyType || !this.subVal1 || !this.subUnit1 || !this.subVal2 || !this.subUnit2 || !this.subResultUnit) {
      this.subAlert = { type: 'error', message: 'Please fill in all fields including Result Unit.' };
      return;
    }

    this.subLoading = true;
    this.measurement.subtract({
      QuantityType: this.subQtyType,
      Value1: parseFloat(this.subVal1),
      Value2: parseFloat(this.subVal2),
      Unit1: this.subUnit1,
      Unit2: this.subUnit2,
      ResultUnit: this.subResultUnit,
    }).subscribe({
      next: (res: QuantityResult) => {
        this.subResult = res;
        this.subLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.subAlert = { type: 'error', message: err.error ?? 'Something went wrong.' };
        this.subLoading = false;
      },
    });
  }

  // ── Divide ───────────────────────────────────────────
  onDivide(): void {
    this.divAlert = null;
    this.divResult = null;

    if (!this.divQtyType || !this.divVal1 || !this.divUnit1 || !this.divVal2 || !this.divUnit2) {
      this.divAlert = { type: 'error', message: 'Please fill in all fields.' };
      return;
    }

    this.divLoading = true;
    this.measurement.divide({
      QuantityType: this.divQtyType,
      Value1: parseFloat(this.divVal1),
      Value2: parseFloat(this.divVal2),
      Unit1: this.divUnit1,
      Unit2: this.divUnit2,
    }).subscribe({
      next: (res: DivisionResult) => {
        this.divResult = res.ratio;
        this.divLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.divAlert = { type: 'error', message: err.error ?? 'Something went wrong.' };
        this.divLoading = false;
      },
    });
  }

  // ── Compare ──────────────────────────────────────────
  onCompare(): void {
    this.cmpAlert = null;
    this.cmpResult = null;

    if (!this.cmpQtyType || !this.cmpVal1 || !this.cmpUnit1 || !this.cmpVal2 || !this.cmpUnit2) {
      this.cmpAlert = { type: 'error', message: 'Please fill in all fields.' };
      return;
    }

    this.cmpLoading = true;
    this.measurement.compare({
      QuantityType: this.cmpQtyType,
      Value1: parseFloat(this.cmpVal1),
      Value2: parseFloat(this.cmpVal2),
      Unit1: this.cmpUnit1,
      Unit2: this.cmpUnit2,
    }).subscribe({
      next: (res: ComparisonResult) => {
        this.cmpResult = res.areEqual;
        this.cmpLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cmpAlert = { type: 'error', message: err.error ?? 'Something went wrong.' };
        this.cmpLoading = false;
      },
    });
  }

  // ── Convert ──────────────────────────────────────────
  onConvert(): void {
    this.cvtAlert = null;
    this.cvtResult = null;

    if (!this.cvtQtyType || !this.cvtVal || !this.cvtSource || !this.cvtTarget) {
      this.cvtAlert = { type: 'error', message: 'Please fill in all fields.' };
      return;
    }

    this.cvtLoading = true;
    this.measurement.convert({
      QuantityType: this.cvtQtyType,
      Value: parseFloat(this.cvtVal),
      SourceUnit: this.cvtSource,
      TargetUnit: this.cvtTarget,
    }).subscribe({
      next: (res: QuantityResult) => {
        this.cvtResult = res;
        this.cvtLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.cvtAlert = { type: 'error', message: err.error ?? 'Something went wrong.' };
        this.cvtLoading = false;
      },
    });
  }

  // ── History ──────────────────────────────────────────
  loadHistory(): void {
    this.historyLoading = true;
    this.historyAlert = null;
    this.historyRows = [];

    this.measurement.getHistory().subscribe({
      next: (res) => {
        this.historyRows = res.measurements ?? [];
        this.historyLoading = false;
        this.historyLoaded = true;
      },
      error: (err: HttpErrorResponse) => {
        this.historyAlert = { type: 'error', message: err.error ?? 'Failed to load history.' };
        this.historyLoading = false;
      },
    });
  }

  // ── Logout ───────────────────────────────────────────
  logout(): void {
    this.authService.logout();
  }

  // ── Template helper ──────────────────────────────────
  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}

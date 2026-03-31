import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuantityResult   { value: number; unitSymbol: string; }
export interface DivisionResult   { ratio: number; }
export interface ComparisonResult { areEqual: boolean; }

export interface QuantityMeasurementDto {
  id: number;
  category: string;
  operation: string;
  value1: number;
  unit1: string;
  value2?: number;
  unit2?: string;
  resultValue: number;
  resultUnit: string;
  createdAt: string;
}

export interface HistoryResponse {
  measurements: QuantityMeasurementDto[];
}

const UNITS_MAP: Record<string, string[]> = {
  Length:      ['Inches', 'Feet', 'Yards', 'Centimeters'],
  Weight:      ['Grams', 'Kilograms', 'Pound'],
  Volume:      ['Litre', 'MilliLiter', 'Gallon'],
  Temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
};

@Injectable({ providedIn: 'root' })
export class MeasurementService {
  private readonly BASE = 'http://localhost:5174/api/quantitymeasurement';

  constructor(private http: HttpClient) {}

  getUnits(quantityType: string): string[] {
    return UNITS_MAP[quantityType] ?? [];
  }

  getQuantityTypes(): string[] {
    return Object.keys(UNITS_MAP);
  }

  add(body: object): Observable<QuantityResult> {
    return this.http.post<QuantityResult>(`${this.BASE}/add`, body);
  }

  subtract(body: object): Observable<QuantityResult> {
    return this.http.post<QuantityResult>(`${this.BASE}/subtract`, body);
  }

  divide(body: object): Observable<DivisionResult> {
    return this.http.post<DivisionResult>(`${this.BASE}/divide`, body);
  }

  compare(body: object): Observable<ComparisonResult> {
    return this.http.post<ComparisonResult>(`${this.BASE}/compare`, body);
  }

  convert(body: object): Observable<QuantityResult> {
    return this.http.post<QuantityResult>(`${this.BASE}/convert`, body);
  }

  getHistory(): Observable<HistoryResponse> {
    return this.http.post<HistoryResponse>(`${this.BASE}/history`, {});
  }
}

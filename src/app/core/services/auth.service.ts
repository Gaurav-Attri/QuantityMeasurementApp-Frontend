import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest  { email: string; password: string; }
export interface SignupRequest  { firstName: string; lastName: string; email: string; password: string; }
export interface LoginResponse  { token: string; }
export interface SignupResponse { [key: string]: unknown; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(body: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.BASE}/api/auth/login`, body);
  }

  signup(body: SignupRequest): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.BASE}/api/auth/signup`, body);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }
}

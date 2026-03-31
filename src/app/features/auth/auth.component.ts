import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

type Tab = 'login' | 'signup';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  activeTab: Tab = 'login';
  loading = false;

  // Login fields
  loginEmail    = '';
  loginPassword = '';
  loginAlert: { type: 'error' | 'success'; message: string } | null = null;
  showLoginPassword = false;

  // Signup fields
  signupFirstName = '';
  signupLastName  = '';
  signupEmail     = '';
  signupPassword  = '';
  signupAlert: { type: 'error' | 'success'; message: string } | null = null;
  showSignupPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  switchTab(tab: Tab): void {
    this.activeTab    = tab;
    this.loginAlert   = null;
    this.signupAlert  = null;
  }

  toggleLoginPassword(): void  { this.showLoginPassword  = !this.showLoginPassword; }
  toggleSignupPassword(): void { this.showSignupPassword = !this.showSignupPassword; }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onLogin(): void {
    this.loginAlert = null;

    if (!this.loginEmail || !this.isValidEmail(this.loginEmail)) {
      this.loginAlert = { type: 'error', message: 'Please enter a valid email address.' };
      return;
    }
    if (!this.loginPassword) {
      this.loginAlert = { type: 'error', message: 'Password is required.' };
      return;
    }

    this.loading = true;

    this.auth.login({ email: this.loginEmail, password: this.loginPassword }).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 404) {
          this.loginAlert = { type: 'error', message: err.error ?? 'No account found with this email.' };
        } else if (err.status === 401) {
          this.loginAlert = { type: 'error', message: err.error ?? 'Incorrect password. Please try again.' };
        } else {
          this.loginAlert = { type: 'error', message: 'Something went wrong. Please try again later.' };
        }
      },
      complete: () => { this.loading = false; },
    });
  }

  onSignup(): void {
    this.signupAlert = null;

    if (!this.signupFirstName.trim()) {
      this.signupAlert = { type: 'error', message: 'First name is required.' };
      return;
    }
    if (!this.signupLastName.trim()) {
      this.signupAlert = { type: 'error', message: 'Last name is required.' };
      return;
    }
    if (!this.signupEmail || !this.isValidEmail(this.signupEmail)) {
      this.signupAlert = { type: 'error', message: 'Please enter a valid email address.' };
      return;
    }
    if (!this.signupPassword || this.signupPassword.length < 8) {
      this.signupAlert = { type: 'error', message: 'Password must be at least 8 characters.' };
      return;
    }

    this.loading = true;

    this.auth.signup({
      firstName: this.signupFirstName,
      lastName:  this.signupLastName,
      email:     this.signupEmail,
      password:  this.signupPassword,
    }).subscribe({
      next: () => {
        this.loading = false;
        this.signupAlert = { type: 'success', message: 'Account created! Redirecting to login…' };
        setTimeout(() => this.switchTab('login'), 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        if (err.status === 409) {
          this.signupAlert = { type: 'error', message: err.error ?? 'An account with this email already exists.' };
        } else {
          this.signupAlert = { type: 'error', message: 'Something went wrong. Please try again later.' };
        }
      },
    });
  }
}

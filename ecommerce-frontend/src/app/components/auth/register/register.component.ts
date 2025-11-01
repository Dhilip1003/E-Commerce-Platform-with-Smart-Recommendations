import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="auth-card">
        <h1>Register</h1>
        <form (ngSubmit)="register()">
          <input type="email" [(ngModel)]="email" name="email" 
                 placeholder="Email" required>
          <input type="password" [(ngModel)]="password" name="password" 
                 placeholder="Password" required>
          <input type="text" [(ngModel)]="firstName" name="firstName" 
                 placeholder="First Name" required>
          <input type="text" [(ngModel)]="lastName" name="lastName" 
                 placeholder="Last Name">
          <input type="text" [(ngModel)]="phoneNumber" name="phoneNumber" 
                 placeholder="Phone Number">
          <button type="submit">Register</button>
          <p>Already have an account? <a routerLink="/login">Login</a></p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      max-width: 400px;
      margin: 50px auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      width: 100%;
      padding: 10px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
  `]
})
export class RegisterComponent {
  email: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  phoneNumber: string = '';
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  register() {
    this.apiService.register({
      email: this.email,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber
    }).subscribe({
      next: (response: any) => {
        if (response.error) {
          alert(response.error);
        } else {
          alert('Registration successful! Please login.');
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        alert('Registration failed: ' + (err.error?.error || 'Unknown error'));
      }
    });
  }
}


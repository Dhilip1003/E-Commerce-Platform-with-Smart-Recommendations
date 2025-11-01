import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="auth-card">
        <h1>Login</h1>
        <form (ngSubmit)="login()">
          <input type="email" [(ngModel)]="email" name="email" 
                 placeholder="Email" required>
          <input type="password" [(ngModel)]="password" name="password" 
                 placeholder="Password" required>
          <button type="submit">Login</button>
          <p>Don't have an account? <a routerLink="/register">Register</a></p>
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
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  login() {
    this.apiService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response: any) => {
          if (response.error) {
            alert(response.error);
          } else {
            localStorage.setItem('currentUser', JSON.stringify(response));
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          alert('Login failed: ' + (err.error?.error || 'Unknown error'));
        }
      });
  }
}


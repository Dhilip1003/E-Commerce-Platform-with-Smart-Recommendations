import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Order History</h1>
      <div *ngFor="let order of orders" class="order-card">
        <div class="order-header">
          <h3>Order #{{ order.orderNumber }}</h3>
          <span class="status">{{ order.status }}</span>
        </div>
        <p>Date: {{ order.createdAt | date }}</p>
        <p>Total: ${{ order.totalAmount }}</p>
        <div class="order-items">
          <div *ngFor="let item of order.orderItems" class="order-item">
            <span>{{ item.product.name }} x{{ item.quantity }}</span>
            <span>${{ item.subtotal }}</span>
          </div>
        </div>
      </div>
      <div *ngIf="orders.length === 0">
        <p>No orders found</p>
      </div>
    </div>
  `,
  styles: [`
    .order-card {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .status {
      padding: 5px 15px;
      background-color: #007bff;
      color: white;
      border-radius: 20px;
      font-size: 0.9em;
    }
    .order-items {
      margin-top: 15px;
      border-top: 1px solid #ddd;
      padding-top: 15px;
    }
    .order-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }
  `]
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  currentUser: any = null;
  
  constructor(private apiService: ApiService) {}
  
  ngOnInit() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      this.loadOrders();
    }
  }
  
  loadOrders() {
    if (this.currentUser) {
      this.apiService.getUserOrders(this.currentUser.id).subscribe({
        next: (data: any) => {
          this.orders = data;
        }
      });
    }
  }
}


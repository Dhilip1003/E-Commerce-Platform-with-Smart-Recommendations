import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = '/api';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  constructor(private http: HttpClient) { }
  
  // Products
  getProducts(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get(`${API_URL}/products?page=${page}&size=${size}`);
  }
  
  getProduct(id: number): Observable<any> {
    return this.http.get(`${API_URL}/products/${id}`);
  }
  
  getProductsByCategory(categoryId: number): Observable<any> {
    return this.http.get(`${API_URL}/products/category/${categoryId}`);
  }
  
  searchProducts(query: string): Observable<any> {
    return this.http.get(`${API_URL}/products/search?q=${query}`);
  }
  
  // Categories
  getCategories(): Observable<any> {
    return this.http.get(`${API_URL}/categories`);
  }
  
  // Cart
  getCart(userId: number): Observable<any> {
    return this.http.get(`${API_URL}/cart/${userId}`);
  }
  
  addToCart(userId: number, productId: number, quantity: number = 1): Observable<any> {
    return this.http.post(`${API_URL}/cart/${userId}/add?productId=${productId}&quantity=${quantity}`, {});
  }
  
  updateCartItem(userId: number, cartItemId: number, quantity: number): Observable<any> {
    return this.http.put(`${API_URL}/cart/${userId}/items/${cartItemId}?quantity=${quantity}`, {});
  }
  
  removeFromCart(userId: number, cartItemId: number): Observable<any> {
    return this.http.delete(`${API_URL}/cart/${userId}/items/${cartItemId}`);
  }
  
  clearCart(userId: number): Observable<any> {
    return this.http.delete(`${API_URL}/cart/${userId}/clear`);
  }
  
  // Orders
  checkout(userId: number, checkoutData: any): Observable<any> {
    return this.http.post(`${API_URL}/orders/${userId}/checkout`, checkoutData);
  }
  
  getUserOrders(userId: number): Observable<any> {
    return this.http.get(`${API_URL}/orders/${userId}`);
  }
  
  getOrder(orderId: number): Observable<any> {
    return this.http.get(`${API_URL}/orders/order/${orderId}`);
  }
  
  // Recommendations
  getRecommendations(userId: number, count: number = 10): Observable<any> {
    return this.http.get(`${API_URL}/recommendations/user/${userId}?count=${count}`);
  }
  
  getGuestRecommendations(count: number = 10): Observable<any> {
    return this.http.get(`${API_URL}/recommendations/guest?count=${count}`);
  }
  
  // Auth
  register(userData: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/register`, userData);
  }
  
  login(credentials: any): Observable<any> {
    return this.http.post(`${API_URL}/auth/login`, credentials);
  }
}


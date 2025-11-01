 E-Commerce Platform with Smart Recommendations
Full-stack e-commerce solution with ML-powered product recommendations, real-time inventory management, and seamless payment integration.

Features
🛍️ Product Management: Complete CRUD operations for products and categories
🤖 ML-Powered Recommendations: Collaborative filtering algorithm for personalized product recommendations
🛒 Shopping Cart: Full cart management with add, update, and remove operations
💳 Payment Integration: Support for Stripe, PayPal, and credit card payments
📦 Order Management: Complete order lifecycle management
📊 Real-time Inventory: Track inventory with automatic low-stock alerts
👥 User Management: Registration, authentication, and user profiles
📈 Analytics: Track user interactions, product views, and purchase patterns
Tech Stack
Backend
Java 17
Spring Boot 3.2.0
Spring Data JPA
MySQL Database
Spring Security (Basic authentication)
ML Algorithms: Collaborative filtering and content-based recommendations
Caffeine Cache for performance optimization
Frontend
Angular 17
TypeScript
RxJS
Material Design inspired styling
Prerequisites
Java 17 or higher
Maven 3.6+
MySQL 8.0+
Node.js 18+ and npm (for frontend)
Angular CLI 17+
Database Setup
Create MySQL Database:

CREATE DATABASE ecommerce_db;
Update application.yml with your MySQL credentials:

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/ecommerce_db
    username: your_username
    password: your_password
Backend Setup
Navigate to backend directory:

cd ecommerce-backend
Build and run:

mvn clean install
mvn spring-boot:run
The backend will be available at http://localhost:8080/api

Frontend Setup
Navigate to frontend directory:

cd ecommerce-frontend
Install dependencies:

npm install
Start development server:

ng serve
The frontend will be available at http://localhost:4200

API Endpoints
Products
GET /api/products - Get all products (paginated)
GET /api/products/{id} - Get product by ID
GET /api/products/category/{categoryId} - Get products by category
GET /api/products/search?q={query} - Search products
POST /api/products - Create product
PUT /api/products/{id} - Update product
DELETE /api/products/{id} - Delete product
Categories
GET /api/categories - Get all categories
GET /api/categories/top-level - Get top-level categories
GET /api/categories/{id} - Get category by ID
Cart
GET /api/cart/{userId} - Get user's cart
POST /api/cart/{userId}/add?productId={id}&quantity={qty} - Add to cart
PUT /api/cart/{userId}/items/{cartItemId}?quantity={qty} - Update cart item
DELETE /api/cart/{userId}/items/{cartItemId} - Remove from cart
DELETE /api/cart/{userId}/clear - Clear cart
Orders
POST /api/orders/{userId}/checkout - Create order from cart
GET /api/orders/{userId} - Get user's orders
GET /api/orders/order/{orderId} - Get order by ID
PUT /api/orders/{orderId}/status?status={status} - Update order status
Recommendations
GET /api/recommendations/user/{userId}?count={count} - Get personalized recommendations
GET /api/recommendations/guest?count={count} - Get guest recommendations
Authentication
POST /api/auth/register - Register new user
POST /api/auth/login - Login user
Inventory
GET /api/inventory/check/{productId}?quantity={qty} - Check stock availability
GET /api/inventory/low-stock?threshold={threshold} - Get low stock products
POST /api/inventory/update - Update inventory
ML Recommendation Algorithm
The recommendation system uses:

Collaborative Filtering: Finds similar users based on interaction patterns (Jaccard similarity)
Content-Based Filtering: Recommends products from preferred categories
Popular Products: Fallback for new users or when no similar users are found
Interaction Weights
Purchase: 5.0
Add to Cart: 2.0
View: 1.0
Rating: 3.0
Payment Integration
Currently simulated. To integrate with real payment gateways:

Stripe: Add Stripe SDK dependency and configure in PaymentService
PayPal: Add PayPal SDK and configure client credentials
Configuration
Edit src/main/resources/application.yml to customize:

Database connection
ML recommendation parameters
Payment gateway credentials
Inventory thresholds
Testing
# Backend tests
cd ecommerce-backend
mvn test

# Frontend tests
cd ecommerce-frontend
ng test
Production Build
# Backend
cd ecommerce-backend
mvn clean package

# Frontend
cd ecommerce-frontend
ng build --configuration production
License
MIT License

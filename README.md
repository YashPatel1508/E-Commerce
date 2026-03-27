# LuxeStore E-Commerce Application

A full-stack E-Commerce application built with Django, Django REST Framework, React (Vite), Tailwind CSS, Framer Motion, and PostgreSQL.

## Features
- **User Authentication**: Secure JWT-based registration and login.
- **Product Storefront**: Dynamic product listing with search functionality.
- **Shopping Cart & Checkout**: Seamless order placement.
- **Order History**: Customers can view past orders and statuses.
- **Admin Dashboard**:
  - Revenue analytics with Recharts graphs.
  - Inventory management.
  - Order management with status updates.
  - CSV Export for sales.

## Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (ensure a local database named `ecommerce_db` exists with user `postgres` and password `postgres`).

## Backend Setup (Django)

1. From the project root, activate your virtual environment (if not already activated):
   ```bash
   # On Windows
   venv\Scripts\activate
   ```
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Run migrations to create database tables (make sure PostgreSQL service is running):
   ```bash
   python manage.py makemigrations
   python manage.py makemigrations users products orders dashboard
   python manage.py migrate
   ```
4. Create an admin superuser:
   ```bash
   python manage.py createsuperuser
   ```
5. Start the development server:
   ```bash
   python manage.py runserver
   ```

## Frontend Setup (React)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and visit `http://localhost:5173`.
   
*(To log in as admin and access the dashboard, use the superuser credentials created during backend setup, then click the Admin button in the navbar.)*

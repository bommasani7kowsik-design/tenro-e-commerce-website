# Tenro E commerce Website

## Overview
A full-featured e-commerce website for the clothing brand Tenro, providing customers with a modern shopping experience and administrators with comprehensive management tools.

## Core Features

### Homepage
- Hero section showcasing the brand
- Featured collections display
- Brand story section
- Navigation to product categories

### Product Catalog
- Product listing pages organized by categories
- Individual product detail pages with:
  - High-quality product images
  - Product descriptions
  - Pricing information
  - Size selection
  - Add to cart functionality
- Search and filtering capabilities

### Shopping Experience
- Shopping cart with item management (add, remove, update quantities)
- Checkout process with order summary
- Stripe payment integration for secure transactions
- Order confirmation and receipt generation

### User Authentication & Accounts
- Internet Identity integration for user authentication
- User account dashboard with:
  - Order history viewing
  - Account information management
  - Admin Access section with clear "Promote to Admin" button
  - Confirmation modal for admin role activation with proper dialog flow
  - Success notification display when admin privileges are granted
  - Visual indication of current admin status with checkmark when promoted
  - Immediate refresh of admin permissions after successful promotion
  - Loading message display until admin rights are confirmed
- Guest checkout option for non-registered users

### Admin Authentication System
- Professional admin login page at `/admin-login` styled similar to modern business websites
- Mobile number input field for admin authentication
- OTP verification system with demo OTP "1234"
- OTP input field for verification
- Clean, professional form design with proper validation
- First successful mobile number authentication (mobile: 7569114467) automatically becomes the sole admin
- Successful admin authentication redirects instantly to Admin Dashboard with full privileges
- "Admin Login" link visible in navigation for all users
- Complete reset of all admin data on system initialization

### Admin Panel
- Product management (create, edit, delete products)
- Image upload and management for products
- Order tracking and management
- Inventory management
- Sales analytics dashboard
- Admin Dashboard link dynamically displayed in navigation for users with admin privileges
- Product and order management tabs immediately visible for authorized admin users
- No "Access Denied" messages for the first authorized admin

### Footer
- Social media links including Instagram link (https://www.instagram.com/tenro_clothing_store?igsh=MWk3Y3RhZjdnNjg4YQ==)
- Company information and contact details
- Navigation links to important pages

### Responsive Design
- Mobile-first responsive design
- Optimized user interface for both mobile and desktop
- Touch-friendly navigation and interactions

## Backend Data Storage
The backend must store and manage:
- Product catalog (names, descriptions, prices, sizes, categories, image references)
- User accounts and profiles
- User permissions and admin roles
- Order history and transaction records
- Shopping cart contents for authenticated users
- Admin user permissions and settings
- Inventory levels and product availability
- Admin mobile numbers and authentication data

## Backend Operations
- Product CRUD operations
- User authentication and session management
- **Complete system reset on initialization**: Clear all existing user data, admin roles, permissions, and authentication records during canister initialization
- **Empty admin list initialization**: Start with completely empty admin list with no pre-existing roles
- **First admin auto-assignment**: Automatically assign the first successfully authenticated mobile number (7569114467) as the sole admin with full privileges
- **Professional admin authentication flow**: Handle mobile number and OTP verification with instant admin dashboard access
- Admin role management and permission granting via AccessControl
- Secure admin role verification and assignment to user Principal
- Admin access control and permission validation for admin-only endpoints
- Order processing and payment handling
- Cart management for authenticated users
- Admin dashboard data retrieval with guaranteed access for the first authorized admin
- Image upload and storage management
- Order status updates and tracking
- OTP verification system (demo OTP "1234")
- **Complete data wipe**: Remove all stored user profiles, admin records, and authentication data at system startup

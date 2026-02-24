# Amazon Style E-Commerce (React + Express + MySQL)

## 1) Database Setup
1. Create DB and tables:
   - Run `schema.sql`
2. Insert dummy data:
   - Run `seed.sql`
3. If your DB already exists and you do not want to recreate it:
   - Run `add_admin_guard_and_order_eta.sql`

Default seeded password for all users: `password`

Seeded users:
- Admin: `admin@amazon.local`
- User (Free): `alice@amazon.local`
- User (Pro): `bob@amazon.local`

Notes:
- Signup only creates `user` role accounts.
- Exactly one `admin` is enforced at DB level (trigger-based guard).

## 2) Backend Setup
1. `cd backend`
2. `npm install`
3. Copy `.env.example` to `.env` and set MySQL/JWT values
4. Optional (admin email alerts for new order requests): set SMTP values in `.env`
5. `npm run dev`

Backend runs on `http://localhost:5000`

## 3) Frontend Setup
1. Open new terminal: `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env`
4. `npm run dev`

Frontend runs on `http://localhost:5173`

## 4) Core Routes
- Auth: `/api/auth/*`
- Products: `/api/products/*`
- Cart: `/api/cart/*`
- Orders: `/api/orders/*`
- Admin: `/api/admin/*`
- Notifications: `/api/notifications/*`

## 5) Role Workflow
- `user` can browse products, add to cart, and place buy requests.
- `admin` can add/edit/delete products.
- `admin` can approve/reject/update order status via `/api/admin/orders/*`.
- Every order status change creates a user notification.
- New user buy requests can trigger email notification to admin (when SMTP is configured).

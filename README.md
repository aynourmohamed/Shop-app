# Luxe Éclat — Mobile Commerce App

A full-featured e-commerce mobile app for a candle brand, built with React Native and Supabase. Covers the full shopping flow — auth, product discovery, cart, checkout, and order history — plus device-level integrations (camera, GPS, notifications, battery, network state).

Built as a solo project for a Mobile Commerce university course; since extended with UI/UX improvements to bring it closer to production quality.


## Tech Stack

- **React Native** (Expo) — cross-platform mobile framework
- **Supabase** — auth, database (Postgres), storage, and realtime subscriptions
- **React Navigation** — stack + bottom tab navigation, with deep linking to specific screens and products
- **AsyncStorage** — local cart persistence
- **expo-file-system** — local product caching for offline browsing

## Features

### Shopping & Catalog
- Browse products with live stock levels via Supabase Realtime — stock updates reflect across all open sessions instantly
- Category filtering and product search
- Barcode scanner (device camera) to look up products in-store
- Wishlist, synced to Supabase and reflected as a filled/outline heart across screens
- Offline browsing — recently fetched products are cached locally and served automatically when the device has no connection

### Cart & Checkout
- Cart with quantity controls, persisted locally via AsyncStorage
- Checkout form with card validation, order saved to Supabase
- PDF receipt auto-generated and shareable after every order
- Push notification confirming order placement

### Account & Orders
- Email/password auth via Supabase Auth
- Order history with pagination and full order detail view
- Product image upload to Supabase Storage (camera or gallery)

### Device & Environment Awareness
- Map view of nearby stores using device GPS
- Offline banner when network connection drops
- Background sync automatically pauses when battery drops below 20%, falling back to cached data
- Currency and language auto-detected from device locale, user-overridable in Profile
- Dark/light mode, toggleable in Profile

## Getting Started

\`\`\`bash
git clone <repo-url>
cd shop-app
npm install
npx expo start
\`\`\`

Requires a \`.env\` file with your Supabase project URL and public key:

\`\`\`
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

## Project Structure

\`\`\`
/screens        — all app screens (Home, Products, ProductDetail, Cart, Checkout, etc.)
/navigation     — bottom tab and stack navigators
/context        — theme, locale, and battery-state context
/lib            — Supabase client setup
\`\`\`
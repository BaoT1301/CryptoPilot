# Coin Base - Frontend

Modern cryptocurrency trading platform frontend built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Real-time Trading**: Live price charts and order book with WebSocket integration
- **Portfolio Dashboard**: Track your holdings with normalized index charts
- **Trading Interface**: Place market and limit orders for BTC, ETH, BNB, SOL
- **Wallet Management**: Deposit and withdraw crypto assets
- **AI Chat Assistant**: Get help with trading and platform features
- **Dark/Light Theme**: Automatic theme switching
- **Responsive Design**: Mobile-friendly interface

## Prerequisites

Before you begin, ensure you have installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

## Installation

1. **Navigate to the frontend directory:**

   ```bash
   cd coin-base-fe
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create environment file:**

   Create a `.env` file in the root directory:

   ```bash
   touch .env
   ```

4. **Configure environment variables:**

   Add the following to your `.env` file:

````env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
VITE_BUNNY_STORAGE_NAME=your-bunny-storage-name
VITE_BUNNY_STORAGE_PASSWORD=your-bunny-password
VITE_BUNNY_PULL_URL=your-bunny-cdn-url
   ```env
   # Backend API URL
   VITE_API_URL=http://localhost:4000/api

   # WebSocket URL (for real-time prices)
   VITE_SOCKET_URL=http://localhost:4000
````

## Running the Application

### Development Mode (with hot reload)

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or another available port if 5173 is in use).

**Note:** Make sure the backend server is running before starting the frontend.

### Build for Production

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Preview the production build:**
   ```bash
   npm run preview
   ```

### Linting

```bash
npm run lint
```

## Using the Application

1. **Start the Backend Server**

   First, ensure the backend is running:

   ```bash
   cd ../coin-base-be
   npm run dev
   ```

2. **Start the Frontend**

   In a new terminal:

   ```bash
   cd coin-base-fe
   npm run dev
   ```

3. **Open Your Browser**

   Navigate to `http://localhost:5173`

4. **Create an Account**

   - Click "Sign Up" in the navigation
   - Enter your email, password, and name
   - You'll automatically receive $100,000 USD starting balance

5. **Start Trading**

   - View real-time prices on the Dashboard
   - Go to Trading page to place orders
   - Check your Wallet for deposits/withdrawals
   - View your transaction History

## Pages Overview

### Home (`/`)

Landing page with platform features, statistics, and call-to-action.

### About (`/about`)

Company information and team members.

### Dashboard (`/dashboard`)

- Real-time portfolio overview
- Normalized price charts (base 100)
- Recent orders
- Holdings summary
- Coin selector for chart viewing
- Fullscreen mode

### Trading (`/trading`)

- Live order book (bids & asks)
- Market and limit order placement
- Order history table
- Real-time price display
- Balance checking

### Wallet (`/wallet`)

- Deposit crypto assets (BTC, ETH, BNB, SOL)
- Withdraw to external addresses
- Transaction history
- Balance overview by asset

### History (`/history`)

- Complete transaction history
- Order history
- Deposit/withdrawal records
- Filterable and sortable

### Profile (`/profile`)

- User information
- Account settings
- Profile picture upload

## Project Structure

```
src/
├── api/                    # API client functions
│   ├── auth.ts
│   ├── order.ts
│   ├── profile.ts
│   └── wallet/
├── components/             # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── wallet/             # Wallet components
│   ├── sections/           # Home page sections
│   └── ...
├── contexts/               # React contexts
│   └── ThemeContext.tsx
├── layouts/                # Layout components
│   └── MainLayout.tsx
├── lib/                    # Utilities and auth
│   ├── AuthContext.tsx
│   ├── RequireAuth.tsx
│   └── utils.ts
├── pages/                  # Page components
│   ├── Home.tsx
│   ├── Dashboard.tsx
│   ├── Trading.tsx
│   ├── Wallet.tsx
│   └── ...
├── types/                  # TypeScript types
├── App.tsx                 # Root component
└── main.tsx                # Entry point
```

## UI Components

Built with [shadcn/ui](https://ui.shadcn.com/) components:

- Card, Button, Input, Label
- Table, Tabs, Badge
- Select, Dialog, Avatar
- And more...

Styling with [Tailwind CSS v4](https://tailwindcss.com/)

## Real-time Features

### WebSocket Connection

Automatic connection to backend WebSocket server for:

- Live price updates (BTC, ETH, BNB, SOL)
- Order matching notifications
- Market data streaming

### Price Charts

- Recharts library for responsive charts
- Normalized index (base 100) for comparison
- Multiple coin selection
- Time-series data visualization

## Authentication

- JWT-based authentication
- Automatic token management
- Protected routes with `RequireAuth` wrapper
- Persistent login sessions

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Routing**: React Router v7
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **WebSocket**: Socket.io Client
- **Forms**: React Hook Form + Zod validation

## Troubleshooting

**Backend Connection Error:**

```
Failed to fetch
```

- Ensure backend is running on `http://localhost:4000`
- Check `VITE_API_URL` in `.env`
- Verify CORS is enabled in backend

**WebSocket Not Connecting:**

```
WebSocket connection failed
```

- Check `VITE_SOCKET_URL` in `.env`
- Ensure backend WebSocket server is running
- Check browser console for errors

**Build Errors:**

```
Error: Cannot find module
```

- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Vite cache: `rm -rf .vite`

**Port Already in Use:**

```
Port 5173 is in use
```

- Vite will automatically use the next available port
- Or specify a different port: `vite --port 3000`

## Key Features Implementation

### Decimal Formatting

All crypto amounts display with 8 decimal places using `.toFixed(8)`:

- Portfolio holdings
- Order amounts
- Wallet balances
- Transaction history

### Balance System

- Starting balance: $100,000 USD
- Crypto balances from deposits and filled orders
- Real-time balance validation before orders
- Reserved balance tracking for open orders

### Order Matching

- Market orders execute immediately or cancel
- Limit orders stay in order book until filled
- Real-time order book updates
- Partial order fills supported

## Current Limitations

### Security & Authentication

- **JWT in localStorage**: Tokens stored in localStorage are vulnerable to XSS attacks
- **No Token Refresh**: Access tokens don't auto-refresh, requiring re-login
- **No Session Timeout Warning**: Users aren't warned before session expires
- **No CSRF Protection**: No CSRF tokens for state-changing operations
- **Weak Password Requirements**: Basic password validation only

### User Experience

- **No Offline Support**: App doesn't work without internet connection
- **No PWA Features**: Not installable as Progressive Web App
- **Limited Error Messages**: Generic error messages that don't guide users
- **No Undo Functionality**: Cannot undo critical actions like order placement
- **No Confirmation Dialogs**: Some destructive actions lack confirmation

### Trading Features

- **No Advanced Order Types**: Only market and limit orders supported
- **No Order Modification**: Cannot edit orders after placement
- **No Price Alerts**: Cannot set alerts for price targets
- **No Stop-Loss UI**: Advanced order types not available
- **Limited Order History**: No filtering by date range, asset, or status
- **No Export Functionality**: Cannot export trade history or reports

### Performance & Optimization

- **No Code Splitting**: All code loads at once (large initial bundle)
- **No Image Optimization**: Images not lazy-loaded or optimized
- **No Virtual Scrolling**: Large lists may cause performance issues
- **WebSocket Reconnection**: Limited retry logic for WebSocket disconnections
- **No Service Worker**: No caching strategy for offline assets
- **Memory Leaks**: Potential WebSocket/subscription cleanup issues

### Data & State Management

- **No Persistent State**: App state cleared on refresh
- **No Optimistic Updates**: All actions wait for server response
- **Stale Data Issues**: No automatic cache invalidation strategy
- **No Real-time Sync**: Changes in another tab not reflected
- **Limited Error Recovery**: Lost data on network errors

### Charts & Visualization

- **Limited Timeframes**: Only real-time data, no historical views
- **No Technical Indicators**: Charts lack RSI, MACD, etc.
- **No Drawing Tools**: Cannot draw trend lines or patterns
- **Single Chart Type**: Only line charts, no candlesticks or bars
- **No Chart Comparison**: Cannot overlay multiple assets

### Accessibility

- **Limited ARIA Labels**: Some components lack accessibility attributes
- **No Keyboard Navigation**: Trading interface not fully keyboard accessible
- **No Screen Reader Support**: Complex tables/charts not optimized
- **Color Contrast Issues**: Some text may fail WCAG standards
- **No Focus Management**: Focus doesn't move logically through modals

### Mobile Experience

- **Not Fully Responsive**: Some pages don't work well on small screens
- **Touch Targets Too Small**: Some buttons/links hard to tap on mobile
- **No Gestures**: Cannot swipe to navigate or perform actions
- **Mobile Performance**: Not optimized for low-end mobile devices

### Testing & Quality

- **No Unit Tests**: Zero test coverage
- **No E2E Tests**: User flows not tested automatically
- **No Visual Regression Tests**: UI changes not tracked
- **No Performance Budgets**: No monitoring of bundle size/performance

### Internationalization

- **English Only**: No multi-language support
- **No Currency Formatting**: Hardcoded USD formatting
- **No Timezone Handling**: All dates in local time without label
- **No Number Localization**: Numbers not formatted per locale

## Future Improvements / Roadmap

### Phase 1: Security & Quality (High Priority)

1. **Implement Comprehensive Testing**

   - Unit tests with Vitest/Jest (target 80% coverage)
   - E2E tests with Playwright or Cypress
   - Visual regression tests with Percy or Chromatic
   - Set up CI/CD pipeline

2. **Security Enhancements**

   - Move JWT to httpOnly cookies
   - Implement token refresh mechanism
   - Add CSRF protection
   - Implement Content Security Policy (CSP)
   - Add rate limiting on client side

3. **Error Handling & UX**

   - Create comprehensive error boundary system
   - Add user-friendly error messages with actions
   - Implement confirmation dialogs for critical actions
   - Add undo functionality for orders
   - Show session timeout warnings

4. **Accessibility Improvements**
   - Add ARIA labels to all interactive elements
   - Implement full keyboard navigation
   - Add screen reader support
   - Ensure WCAG 2.1 AA compliance
   - Add focus management for modals/dialogs

### Phase 2: Performance & UX (High Priority)

5. **Code Splitting & Optimization**

   - Implement route-based code splitting
   - Lazy load heavy components
   - Add image optimization and lazy loading
   - Implement virtual scrolling for large lists
   - Set up bundle size monitoring

6. **PWA Implementation**

   - Add service worker for offline support
   - Make app installable
   - Implement cache-first strategies
   - Add offline indicator and queue
   - Enable push notifications

7. **State Management Improvements**

   - Implement persistent state (localStorage/IndexedDB)
   - Add optimistic updates for better UX
   - Implement automatic cache invalidation
   - Add cross-tab synchronization
   - Better error recovery mechanisms

8. **WebSocket Reliability**
   - Improve reconnection logic with exponential backoff
   - Add connection status indicator
   - Implement message queuing during disconnection
   - Add heartbeat/ping-pong mechanism
   - Graceful degradation to polling

### Phase 3: Trading Features (Medium Priority)

9. **Advanced Order Management**

   - Order modification interface
   - Advanced order types (stop-loss, take-profit)
   - Order templates for quick trading
   - Bulk order operations
   - Order history filtering and search

10. **Price Alerts & Notifications**

    - Price alert creation interface
    - Push notifications for alerts
    - Email notifications
    - Customizable notification preferences
    - Alert history and management

11. **Enhanced Charts**

    - Multiple timeframes (1m, 5m, 1h, 1d, etc.)
    - Technical indicators (RSI, MACD, Bollinger Bands)
    - Drawing tools (trend lines, Fibonacci)
    - Candlestick and bar chart types
    - Chart comparison mode
    - Save chart layouts

12. **Trading Tools**
    - Profit/loss calculator
    - Position size calculator
    - Risk/reward analyzer
    - Trade journal
    - Performance analytics

### Phase 4: Mobile & Responsive (Medium Priority)

13. **Mobile Optimization**

    - Responsive design for all screen sizes
    - Mobile-specific navigation
    - Touch gestures (swipe, pinch-to-zoom)
    - Optimized for low-end devices
    - Larger touch targets

14. **Mobile-First Features**
    - Quick trade buttons
    - One-tap order placement
    - Mobile-optimized charts
    - Simplified mobile navigation
    - Native app feel with animations

### Phase 5: Data & Analytics (Low Priority)

15. **Portfolio Analytics**

    - Portfolio performance charts
    - Profit/loss reports
    - Asset allocation visualization
    - Transaction history export (CSV, PDF)
    - Tax reporting tools
    - ROI calculations

16. **Advanced Filtering & Search**

    - Date range filters for all lists
    - Multi-criteria search
    - Saved filters
    - Quick filters (today, this week, etc.)
    - Sort by multiple columns

17. **Data Visualization**
    - Asset correlation heatmaps
    - Volume analysis charts
    - Market depth visualization
    - Order flow analysis
    - Trading activity heatmap

### Phase 6: Internationalization (Low Priority)

18. **Multi-Language Support**

    - Implement i18n with react-i18next
    - Add language selector
    - Translate all UI strings
    - RTL language support
    - Dynamic locale loading

19. **Localization**
    - Currency formatting per locale
    - Number formatting per locale
    - Date/time formatting with timezone
    - Support multiple fiat currencies

### Phase 7: Advanced Features (Low Priority)

20. **Social & Community**

    - Trading ideas feed
    - Copy trading interface
    - Leaderboards
    - User profiles
    - Social trading features

21. **Customization**

    - Customizable dashboard layouts
    - Widget system
    - Custom themes
    - Hotkey configuration
    - Layout presets

22. **AI Integration**

    - Enhanced AI chat with voice
    - AI trade suggestions
    - Market sentiment analysis
    - Pattern recognition alerts

23. **Educational Content**
    - Trading tutorials
    - Interactive guides
    - Video lessons
    - Glossary
    - FAQ section

### Quick Wins (Can Implement Immediately)

- [ ] Add loading skeletons instead of spinners
- [ ] Implement dark/light mode toggle persistence
- [ ] Add copy-to-clipboard for addresses/IDs
- [ ] Show last updated timestamp for data
- [ ] Add keyboard shortcuts (Ctrl+K for search)
- [ ] Implement breadcrumbs navigation
- [ ] Add success toast notifications
- [ ] Show data refresh indicator
- [ ] Add "Go to top" button on long pages
- [ ] Implement form autosave
- [ ] Add network status indicator
- [ ] Show WebSocket connection status
- [ ] Add print-friendly styles for reports
- [ ] Implement double-click to edit
- [ ] Add context menus for quick actions

## 📚 Learn More

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)

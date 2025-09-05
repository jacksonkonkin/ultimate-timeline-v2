# Stock Trading Simulator - Technical Architecture & Design Specifications

## Current Implementation Status

### 1. Project Architecture - IMPLEMENTED

**Current Foundation:**
```
notes-app/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx ✅ IMPLEMENTED
│   │   │   ├── SignupForm.jsx ✅ IMPLEMENTED
│   │   │   ├── UserMenu.jsx ✅ IMPLEMENTED
│   │   │   ├── UserProfile.jsx ✅ IMPLEMENTED
│   │   │   ├── PrivateRoute.jsx ✅ IMPLEMENTED
│   │   │   └── auth-simplified.css ✅ IMPLEMENTED
│   │   ├── layout/
│   │   │   ├── Header.jsx ✅ IMPLEMENTED
│   │   │   ├── Header.css ✅ IMPLEMENTED
│   │   │   ├── Layout.jsx ✅ IMPLEMENTED
│   │   │   ├── Layout.css ✅ IMPLEMENTED
│   │   │   ├── Sidebar.jsx ✅ IMPLEMENTED
│   │   │   ├── Sidebar.css ✅ IMPLEMENTED
│   │   │   ├── BottomNav.jsx ✅ IMPLEMENTED
│   │   │   ├── BottomNav.css ✅ IMPLEMENTED
│   │   │   ├── Grid.jsx ✅ IMPLEMENTED
│   │   │   └── Grid.css ✅ IMPLEMENTED
│   │   ├── TradingDashboard.jsx ✅ IMPLEMENTED
│   │   ├── TradingDashboard.css ✅ IMPLEMENTED
│   │   └── DatabaseChecker.jsx ✅ IMPLEMENTED
│   ├── context/
│   │   └── AuthContext.jsx ✅ IMPLEMENTED
│   ├── utils/
│   │   └── supabase.js ✅ IMPLEMENTED
│   ├── design-tokens.css ✅ IMPLEMENTED
│   ├── index.css ✅ IMPLEMENTED
│   ├── App.css ✅ IMPLEMENTED
│   ├── App.js ✅ IMPLEMENTED
│   └── router-simplified.jsx ✅ IMPLEMENTED
├── package.json ✅ UPDATED
└── .env ✅ CONFIGURED
```

### 2. Dependencies Analysis - COMPLETED

**Current Dependencies (package.json):**
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15", ✅ INSTALLED
    "@radix-ui/react-dropdown-menu": "^2.1.16", ✅ INSTALLED
    "@radix-ui/react-select": "^2.2.6", ✅ INSTALLED
    "@radix-ui/react-tabs": "^1.1.13", ✅ INSTALLED
    "@radix-ui/react-toast": "^1.2.15", ✅ INSTALLED
    "@radix-ui/react-tooltip": "^1.2.8", ✅ INSTALLED
    "@supabase/supabase-js": "^2.57.2", ✅ CONFIGURED
    "framer-motion": "^12.23.12", ✅ INSTALLED
    "react": "^19.1.1", ✅ UPDATED
    "react-dom": "^19.1.1", ✅ UPDATED
    "react-router-dom": "^7.8.2", ✅ INSTALLED
    "react-scripts": "5.0.1"
  },
  "devDependencies": {
    "@types/node": "^24.3.1", ✅ INSTALLED
    "@types/react": "^19.1.12", ✅ INSTALLED
    "@types/react-dom": "^19.1.9", ✅ INSTALLED
    "typescript": "^5.9.2" ✅ CONFIGURED
  }
}
```

**Missing/Pending Dependencies:**
```json
{
  "lightweight-charts": "^5.0.8", // TODO: Install for stock charts
  "zustand": "^5.0.8", // TODO: Install for state management
  "@tanstack/react-query": "^4.0.0" // TODO: Install for data fetching
}
```

### 3. Implemented Features

#### 3.1 Authentication System ✅ COMPLETE
- **AuthContext**: Full Supabase auth integration with signUp, signIn, signOut, resetPassword
- **LoginForm**: Working login form with validation
- **SignupForm**: Registration with metadata for trading accounts
- **UserProfile**: Modal with profile info, statistics, and settings tabs
- **UserMenu**: Dropdown menu with user info and signout
- **PrivateRoute**: Route protection component
- **Recent Fix**: Corrected signOut functionality and user name display

#### 3.2 Layout System ✅ COMPLETE
- **Header**: Responsive header with search, portfolio summary, user avatar
- **Sidebar**: Collapsible navigation with trading-focused menu items
- **BottomNav**: Mobile bottom navigation
- **Layout**: Master layout component with responsive behavior
- **Grid**: Reusable grid system for responsive layouts

#### 3.3 Design System ✅ COMPLETE
- **design-tokens.css**: Complete CSS custom properties system
  - Color palette optimized for dark trading theme
  - Typography scale (Space Grotesk, Inter, JetBrains Mono)
  - Spacing system (4px base unit)
  - Border radius, shadows, animations
- **Responsive breakpoints**: Mobile-first approach
- **Dark theme**: Professional trading interface colors

#### 3.4 Trading Dashboard ✅ MVP IMPLEMENTED
- **TradingDashboard.jsx**: Main dashboard component with:
  - Portfolio summary cards
  - Recent activity feed
  - Market overview section
  - Quick action buttons
  - Responsive grid layout

#### 3.5 Router System ✅ IMPLEMENTED
- **React Router 7.8.2**: Latest version installed and configured
- **Route protection**: PrivateRoute component working
- **Navigation**: Integrated with layout components

### 4. Current Architecture Patterns

#### 4.1 Component Structure
```javascript
// Modern React patterns implemented:
- Functional components with hooks
- Context API for global state (Auth)
- Compound components (Layout + children)
- Responsive design with CSS custom properties
- Framer Motion for animations
- Radix UI for accessible primitives
```

#### 4.2 Styling System
```css
/* Design tokens approach implemented */
:root {
  /* Colors - Trading optimized dark theme */
  --primary-dark: #0A0E27;
  --primary-surface: #131825;
  --accent-green: #00D4AA;   /* Profit */
  --accent-red: #FF3B69;     /* Loss */
  --accent-gold: #FFB800;    /* Premium */
  --accent-blue: #4A7FFF;    /* Actions */
  
  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing system */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}
```

#### 4.3 Authentication Flow
```javascript
// AuthContext pattern implemented:
const { user, signIn, signUp, signOut, loading } = useAuth();

// Supabase integration with trading metadata:
signUp(email, password, {
  starting_balance: 100000,
  current_balance: 100000,
  total_trades: 0,
  wins: 0,
  losses: 0
});
```

### 5. Next Implementation Priorities

#### 5.1 Missing Core Dependencies
```bash
# Install remaining trading-specific libraries:
npm install lightweight-charts zustand @tanstack/react-query
```

#### 5.2 Stock Data Integration - TODO
- Alpha Vantage API client setup
- Stock search functionality
- Price feed integration
- Real-time data subscriptions

#### 5.3 Chart Components - TODO
- TradingView Lightweight Charts integration
- Price chart component
- Portfolio performance charts
- Mini sparklines for stock cards

#### 5.4 Trading Logic - TODO
- Order form components
- Buy/sell functionality
- Portfolio calculations
- Trade history tracking

#### 5.5 State Management - TODO
- Zustand stores for:
  - Portfolio data
  - Stock prices
  - Trade orders
  - UI state

### 6. Design System Implementation Status

#### 6.1 Color System ✅ COMPLETE
```css
/* Semantic colors for trading */
--profit-color: var(--accent-green);
--loss-color: var(--accent-red);
--neutral-color: #64748B;
--warning-color: #F59E0B;

/* Gradients for interactive elements */
--gradient-profit: linear-gradient(135deg, #00D4AA, #00F5CC);
--gradient-loss: linear-gradient(135deg, #FF3B69, #FF6B8A);
--gradient-primary: linear-gradient(135deg, #4A7FFF, #6B8CFF);
```

#### 6.2 Typography ✅ COMPLETE
- Google Fonts imported (Space Grotesk, Inter, JetBrains Mono)
- Type scale with 8 sizes (xs to 4xl)
- Font weights configured
- Line heights optimized for readability

#### 6.3 Component Tokens ✅ COMPLETE
- Button styles with variants
- Input field styling
- Card layouts
- Loading states
- Animation utilities

### 7. Responsive Design Status ✅ COMPLETE

#### 7.1 Breakpoints Implemented
```css
--mobile: 0-639px;      /* Stack vertically, bottom nav */
--tablet: 640-1023px;   /* Two columns, collapsed sidebar */
--desktop: 1024-1439px; /* Full layout */
--wide: 1440px+;        /* Max width constrained */
```

#### 7.2 Layout Behaviors
- **Mobile**: Bottom navigation, full-width cards, hamburger menu
- **Tablet**: Collapsed sidebar, grid layouts adapt
- **Desktop**: Full sidebar, multi-column layouts
- **Wide**: Centered content with padding

### 8. Authentication & Security ✅ IMPLEMENTED

#### 8.1 Supabase Integration
- Row Level Security (RLS) configured
- User authentication working
- Password reset functionality
- Protected routes implemented

#### 8.2 User Data Structure
```javascript
// User metadata for trading simulation:
{
  email: "user@example.com",
  user_metadata: {
    full_name: "John Doe",
    starting_balance: 100000,
    current_balance: 100000,
    total_trades: 0,
    wins: 0,
    losses: 0
  }
}
```

### 9. Performance Considerations

#### 9.1 Current Optimizations
- React 19 concurrent features
- CSS custom properties for theming
- Modular component architecture
- Efficient re-rendering patterns

#### 9.2 Planned Optimizations
- Code splitting with React.lazy()
- Virtual scrolling for long lists
- Service worker for offline capability
- Image optimization

### 10. Testing Strategy - TODO

#### 10.1 Unit Testing
- Jest + React Testing Library setup available
- Component tests needed
- Hook tests for AuthContext

#### 10.2 Integration Testing
- Trading flow end-to-end tests
- Authentication flow tests
- Responsive design tests

### 11. Deployment Status

#### 11.1 Environment Configuration ✅ COMPLETE
- `.env` file configured with Supabase keys
- Environment variables properly used
- Build configuration working

#### 11.2 Vercel Deployment - READY
- React build optimized
- Static asset handling ready
- Environment variables need to be set in Vercel dashboard

### 12. Accessibility Features ✅ PARTIALLY IMPLEMENTED

#### 12.1 Current Implementation
- Semantic HTML structure
- Radix UI accessible primitives
- Focus management in modals
- Screen reader friendly navigation

#### 12.2 TODO Items
- ARIA labels for dynamic content
- Color contrast validation
- Keyboard navigation testing
- Screen reader testing

### 13. Migration from Notes App - COMPLETE

#### 13.1 Successfully Transformed
- ✅ App structure: Single file → Modular architecture
- ✅ Styling: Basic CSS → Design system with tokens
- ✅ Navigation: None → Full responsive navigation
- ✅ Authentication: Basic → Complete Supabase integration
- ✅ Components: Monolithic → Reusable component library
- ✅ State: Local state → Context API + hooks

#### 13.2 Preserved Patterns
- ✅ Supabase client configuration
- ✅ Error handling patterns
- ✅ Loading state management
- ✅ Form handling approaches
- ✅ Responsive design principles

### 14. Recent Updates (Latest Changes)

#### 14.1 Authentication Fixes (Latest Commit)
- **Fixed signOut functionality**: Corrected function import from AuthContext
- **Fixed user name display**: Updated to use `authUser.user_metadata?.full_name`
- **Added navigation**: Redirect to signin page after logout
- **Updated components**: Both Header and UserProfile components fixed

#### 14.2 Files Modified
- `src/components/layout/Header.jsx`
- `src/components/auth/UserProfile.jsx`

### 15. Implementation Checklist - CURRENT STATUS

#### Foundation ✅ COMPLETE
- [x] Modern React architecture (React 19)
- [x] Component-based structure
- [x] Design system implementation
- [x] Authentication system
- [x] Responsive layout system
- [x] Navigation components
- [x] Supabase integration

#### In Progress 🚧
- [ ] Stock data API integration
- [ ] Chart components (TradingView)
- [ ] Trading logic implementation
- [ ] State management (Zustand)
- [ ] Advanced UI interactions

#### Recently Completed ✅
- [x] **Database Schema Design** (Task 2.1) - COMPLETED
  - Extended user_profiles table with portfolio data (balance, P&L, XP)
  - Created comprehensive trading database schema
  - Added 8 new tables: stocks, trades, positions, watchlists, achievements, market_data
  - Implemented Row Level Security policies
  - Added business logic functions and triggers
  - Seeded with sample stocks and achievements

#### Planned 📅
- [ ] Real-time data feeds
- [ ] Portfolio calculations
- [ ] Gamification features
- [ ] Advanced analytics
- [ ] Performance optimization

### 16. Development Guidelines

#### 16.1 Component Development
```javascript
// Follow established patterns:
import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '../context/AuthContext';

// Use design tokens:
className="trading-card" // Uses CSS custom properties
```

#### 16.2 Styling Guidelines
```css
/* Use design tokens */
.component {
  background: var(--primary-surface);
  color: var(--text-primary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
}
```

#### 16.3 File Organization
```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── utils/              # Utility functions
├── design-tokens.css   # Design system
└── component styles    # Co-located with components
```

---

### 15. Database Schema Implementation ✅ COMPLETE

#### 15.1 Trading Database Schema - IMPLEMENTED
**File**: `notes-app/trading-schema-migration.sql`

**Core Tables Created:**
- **user_profiles** (extended): Portfolio data, balance, P&L, XP system
- **stocks**: Master securities table with current prices and metadata
- **trades**: Complete transaction history with order types (market/limit/stop)
- **positions**: Real-time holdings with P&L calculations
- **watchlists**: User stock tracking and organization
- **watchlist_items**: Many-to-many relationship for watchlist stocks
- **achievements**: Gamification system with flexible criteria
- **user_achievements**: Track earned badges and progress
- **market_data**: Historical price data for charting

#### 15.2 Advanced Features Implemented
- **Row Level Security**: Comprehensive policies for all user data
- **Business Logic Functions**: Automatic position updates via triggers
- **Performance Indexes**: Optimized queries for trading data
- **Order Management**: Support for market, limit, and stop orders
- **Gamification**: Achievement system with XP and levels
- **Seed Data**: 10 popular stocks and sample achievements

#### 15.3 Database Schema Highlights
```sql
-- Extended user profile with trading data
ALTER TABLE user_profiles ADD COLUMN
  current_balance DECIMAL(12,2) DEFAULT 100000.00,
  total_portfolio_value DECIMAL(12,2) DEFAULT 100000.00,
  daily_pnl DECIMAL(12,2) DEFAULT 0.00,
  user_level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0;

-- Comprehensive trades table
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stock_id UUID REFERENCES stocks(id),
  trade_type VARCHAR(10) CHECK (trade_type IN ('buy', 'sell')),
  order_type VARCHAR(10) CHECK (order_type IN ('market', 'limit', 'stop')),
  quantity INTEGER CHECK (quantity > 0),
  price_per_share DECIMAL(10,4),
  status VARCHAR(20) DEFAULT 'pending'
);

-- Automatic position management
CREATE OR REPLACE FUNCTION update_position_after_trade()
RETURNS TRIGGER AS $$
BEGIN
  -- Business logic for updating positions and balances
END;
```

## Next Development Session Priorities

1. **Stock Data API Integration** (Task 2.2) - NEXT PRIORITY
   - Research and choose stock data provider (Alpha Vantage, IEX)
   - Create API client utility functions
   - Implement stock search functionality
   - Add price fetching and caching

2. **Install missing dependencies** (lightweight-charts, zustand)
3. **Create stock data service layer**
4. **Implement basic chart components**
5. **Set up state management with Zustand**

The foundation with complete database schema is now ready for trading-specific feature development.
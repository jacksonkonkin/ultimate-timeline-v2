-- Trading Simulator Database Schema Migration
-- This file extends the existing schema with trading-specific tables

-- ===== EXTEND USER_PROFILES TABLE =====
-- Add portfolio data columns to existing user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS initial_balance DECIMAL(12,2) DEFAULT 100000.00,
ADD COLUMN IF NOT EXISTS current_balance DECIMAL(12,2) DEFAULT 100000.00,
ADD COLUMN IF NOT EXISTS buying_power DECIMAL(12,2) DEFAULT 100000.00,
ADD COLUMN IF NOT EXISTS total_portfolio_value DECIMAL(12,2) DEFAULT 100000.00,
ADD COLUMN IF NOT EXISTS daily_pnl DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_pnl DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS user_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS trading_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS risk_tolerance VARCHAR(10) DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive'));

-- ===== STOCKS TABLE =====
-- Master table for all available stocks
CREATE TABLE IF NOT EXISTS stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  market_cap VARCHAR(20),
  description TEXT,
  current_price DECIMAL(10,4),
  previous_close DECIMAL(10,4),
  volume BIGINT,
  avg_volume BIGINT,
  pe_ratio DECIMAL(8,2),
  dividend_yield DECIMAL(5,4),
  fifty_two_week_high DECIMAL(10,4),
  fifty_two_week_low DECIMAL(10,4),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== TRADES TABLE =====
-- Transaction history for all user trades
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stock_id UUID REFERENCES stocks(id) ON DELETE RESTRICT NOT NULL,
  trade_type VARCHAR(10) NOT NULL CHECK (trade_type IN ('buy', 'sell')),
  order_type VARCHAR(10) DEFAULT 'market' CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_per_share DECIMAL(10,4) NOT NULL CHECK (price_per_share > 0),
  total_amount DECIMAL(12,2) NOT NULL,
  fees DECIMAL(8,2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'partially_filled', 'cancelled', 'rejected')),
  limit_price DECIMAL(10,4), -- For limit orders
  stop_price DECIMAL(10,4),  -- For stop orders
  expires_at TIMESTAMP WITH TIME ZONE, -- Order expiration
  filled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== POSITIONS TABLE =====
-- Current holdings for each user
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stock_id UUID REFERENCES stocks(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  average_cost DECIMAL(10,4) NOT NULL CHECK (average_cost >= 0),
  current_value DECIMAL(12,2),
  unrealized_pnl DECIMAL(12,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_id)
);

-- ===== WATCHLISTS TABLE =====
-- User watchlists for stocks they're tracking
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== WATCHLIST_ITEMS TABLE =====
-- Stocks within each watchlist
CREATE TABLE IF NOT EXISTS watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE NOT NULL,
  stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(watchlist_id, stock_id)
);

-- ===== ACHIEVEMENTS TABLE =====
-- Gamification: Available achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'trading', 'portfolio', 'social', etc.
  type VARCHAR(20) NOT NULL CHECK (type IN ('milestone', 'streak', 'performance')),
  criteria JSONB NOT NULL, -- Flexible criteria storage
  reward_xp INTEGER DEFAULT 0,
  badge_icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== USER_ACHIEVEMENTS TABLE =====
-- Track which achievements users have earned
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress JSONB, -- Track progress toward achievement
  UNIQUE(user_id, achievement_id)
);

-- ===== MARKET_DATA TABLE =====
-- Historical price data for charts and analysis
CREATE TABLE IF NOT EXISTS market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  open_price DECIMAL(10,4) NOT NULL,
  high_price DECIMAL(10,4) NOT NULL,
  low_price DECIMAL(10,4) NOT NULL,
  close_price DECIMAL(10,4) NOT NULL,
  volume BIGINT NOT NULL,
  adjusted_close DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(stock_id, date)
);

-- ===== INDEXES FOR PERFORMANCE =====
-- Trades table indexes
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_stock_id ON trades(stock_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);

-- Positions table indexes
CREATE INDEX IF NOT EXISTS idx_positions_user_id ON positions(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_stock_id ON positions(stock_id);

-- Market data indexes
CREATE INDEX IF NOT EXISTS idx_market_data_stock_date ON market_data(stock_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_date ON market_data(date DESC);

-- Watchlist indexes
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id);

-- ===== ROW LEVEL SECURITY POLICIES =====
-- Enable RLS on all user-specific tables
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Trades policies
CREATE POLICY "Users can view their own trades" ON trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all trades" ON trades
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Positions policies
CREATE POLICY "Users can view their own positions" ON positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own positions" ON positions
  FOR ALL USING (auth.uid() = user_id);

-- Watchlists policies
CREATE POLICY "Users can manage their own watchlists" ON watchlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watchlist items" ON watchlist_items
  FOR ALL USING (
    watchlist_id IN (
      SELECT id FROM watchlists WHERE user_id = auth.uid()
    )
  );

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements" ON user_achievements
  FOR INSERT WITH CHECK (true); -- Allow system to award achievements

-- Public read access for reference tables
CREATE POLICY "Anyone can read stocks" ON stocks FOR SELECT USING (true);
CREATE POLICY "Anyone can read achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can read market data" ON market_data FOR SELECT USING (true);

-- ===== FUNCTIONS FOR BUSINESS LOGIC =====

-- Function to update position after trade
CREATE OR REPLACE FUNCTION update_position_after_trade()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process filled trades
  IF NEW.status = 'filled' AND (OLD.status IS NULL OR OLD.status != 'filled') THEN
    -- Update or create position
    INSERT INTO positions (user_id, stock_id, quantity, average_cost, updated_at)
    VALUES (
      NEW.user_id,
      NEW.stock_id,
      CASE WHEN NEW.trade_type = 'buy' THEN NEW.quantity ELSE -NEW.quantity END,
      NEW.price_per_share,
      NOW()
    )
    ON CONFLICT (user_id, stock_id)
    DO UPDATE SET
      quantity = CASE 
        WHEN NEW.trade_type = 'buy' THEN positions.quantity + NEW.quantity
        ELSE positions.quantity - NEW.quantity
      END,
      average_cost = CASE 
        WHEN NEW.trade_type = 'buy' THEN 
          ((positions.quantity * positions.average_cost) + (NEW.quantity * NEW.price_per_share)) / 
          NULLIF(positions.quantity + NEW.quantity, 0)
        ELSE positions.average_cost
      END,
      updated_at = NOW();

    -- Remove position if quantity becomes 0
    DELETE FROM positions 
    WHERE user_id = NEW.user_id AND stock_id = NEW.stock_id AND quantity <= 0;

    -- Update user balance
    UPDATE user_profiles 
    SET current_balance = CASE
      WHEN NEW.trade_type = 'buy' THEN current_balance - NEW.total_amount - NEW.fees
      ELSE current_balance + NEW.total_amount - NEW.fees
    END,
    buying_power = CASE
      WHEN NEW.trade_type = 'buy' THEN buying_power - NEW.total_amount - NEW.fees
      ELSE buying_power + NEW.total_amount - NEW.fees
    END,
    updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update positions when trades are filled
CREATE OR REPLACE TRIGGER on_trade_filled
  AFTER INSERT OR UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_position_after_trade();

-- Function to create default watchlist for new users
CREATE OR REPLACE FUNCTION create_default_watchlist()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO watchlists (user_id, name, is_default)
  VALUES (NEW.id, 'My Watchlist', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing user creation trigger to also create default watchlist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.user_profiles (id, email, role, status)
  VALUES (
    new.id, 
    new.email,
    CASE 
      WHEN new.email IN ('admin@tradingsim.com', 'admin@localhost.com') THEN 'admin'
      ELSE 'user'
    END,
    CASE 
      WHEN new.email IN ('admin@tradingsim.com', 'admin@localhost.com') THEN 'approved'
      ELSE 'pending'
    END
  );

  -- Create default watchlist
  INSERT INTO public.watchlists (user_id, name, is_default)
  VALUES (new.id, 'My Watchlist', true);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== SEED DATA =====
-- Insert some popular stocks for demo purposes
INSERT INTO stocks (symbol, name, sector, current_price, previous_close) VALUES
('AAPL', 'Apple Inc.', 'Technology', 185.42, 181.98),
('GOOGL', 'Alphabet Inc.', 'Technology', 2845.73, 2867.31),
('MSFT', 'Microsoft Corporation', 'Technology', 378.91, 373.36),
('TSLA', 'Tesla Inc.', 'Automotive', 242.67, 235.15),
('AMZN', 'Amazon.com Inc.', 'Consumer Discretionary', 3127.45, 3098.22),
('NVDA', 'NVIDIA Corporation', 'Technology', 425.33, 412.88),
('META', 'Meta Platforms Inc.', 'Technology', 312.85, 307.92),
('SPY', 'SPDR S&P 500 ETF', 'ETF', 448.23, 445.67),
('QQQ', 'Invesco QQQ Trust', 'ETF', 378.91, 375.44),
('BRK.B', 'Berkshire Hathaway Inc.', 'Financial Services', 345.22, 342.89)
ON CONFLICT (symbol) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (name, description, category, type, criteria, reward_xp, badge_icon) VALUES
('First Trade', 'Complete your first stock trade', 'trading', 'milestone', '{"trades_count": 1}', 100, '🎯'),
('Day Trader', 'Make 10 trades in a single day', 'trading', 'milestone', '{"daily_trades": 10}', 500, '⚡'),
('Portfolio Builder', 'Hold positions in 5 different stocks', 'portfolio', 'milestone', '{"unique_positions": 5}', 250, '📈'),
('Profit Taker', 'Achieve $1000 in total profits', 'performance', 'milestone', '{"total_profit": 1000}', 750, '💰'),
('Trading Streak', 'Make profitable trades 5 days in a row', 'performance', 'streak', '{"profitable_days_streak": 5}', 1000, '🔥')
ON CONFLICT (name) DO NOTHING;
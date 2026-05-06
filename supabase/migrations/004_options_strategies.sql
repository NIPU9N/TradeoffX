-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create option_strategies table
create table if not exists public.option_strategies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  description text,
  underlying_symbol text not null, -- NIFTY, BANKNIFTY, FINNIFTY
  strategy_type text not null, -- BULLISH, BEARISH, NON_DIRECTIONAL, CUSTOM
  entry_spot numeric(12, 2) not null,
  max_profit numeric(15, 2),
  max_loss numeric(15, 2),
  breakevens text, -- JSON array of breakeven prices
  greeks jsonb, -- delta, gamma, theta, vega at entry
  is_template boolean default false,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_archived boolean default false
);

-- Create option_positions table (individual legs in a strategy)
create table if not exists public.option_positions (
  id uuid primary key default uuid_generate_v4(),
  strategy_id uuid not null references public.option_strategies(id) on delete cascade,
  position_type text not null, -- buy_call, sell_call, buy_put, sell_put
  strike_price numeric(12, 2) not null,
  expiry_date date not null,
  premium numeric(10, 4) not null,
  iv numeric(6, 4), -- Implied Volatility
  quantity integer default 1,
  lot_size integer, -- e.g., 65 for NIFTY
  entry_price numeric(12, 2),
  exit_price numeric(12, 2),
  pnl numeric(15, 2),
  status text default 'open', -- open, closed, partially_closed
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create option_trades table (execution history)
create table if not exists public.option_trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  strategy_id uuid references public.option_strategies(id) on delete set null,
  underlying_symbol text not null,
  entry_spot numeric(12, 2) not null,
  entry_time timestamp with time zone not null,
  exit_spot numeric(12, 2),
  exit_time timestamp with time zone,
  realized_pnl numeric(15, 2),
  unrealized_pnl numeric(15, 2),
  status text default 'open', -- open, closed
  notes text,
  mode text default 'practice', -- practice, live
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better query performance
create index if not exists idx_option_strategies_user_id on public.option_strategies(user_id);
create index if not exists idx_option_strategies_created_at on public.option_strategies(created_at desc);
create index if not exists idx_option_positions_strategy_id on public.option_positions(strategy_id);
create index if not exists idx_option_trades_user_id on public.option_trades(user_id);
create index if not exists idx_option_trades_strategy_id on public.option_trades(strategy_id);

-- Enable RLS (Row Level Security)
alter table public.option_strategies enable row level security;
alter table public.option_positions enable row level security;
alter table public.option_trades enable row level security;

-- Create RLS policies
create policy "Users can view their own strategies"
  on public.option_strategies for select
  using (auth.uid() = user_id);

create policy "Users can insert their own strategies"
  on public.option_strategies for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own strategies"
  on public.option_strategies for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own strategies"
  on public.option_strategies for delete
  using (auth.uid() = user_id);

create policy "Users can view positions in their strategies"
  on public.option_positions for select
  using (exists (
    select 1 from public.option_strategies
    where id = strategy_id and user_id = auth.uid()
  ));

create policy "Users can insert positions in their strategies"
  on public.option_positions for insert
  with check (exists (
    select 1 from public.option_strategies
    where id = strategy_id and user_id = auth.uid()
  ));

create policy "Users can view their own trades"
  on public.option_trades for select
  using (auth.uid() = user_id);

create policy "Users can insert their own trades"
  on public.option_trades for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own trades"
  on public.option_trades for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

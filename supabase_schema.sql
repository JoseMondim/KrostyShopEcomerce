-- Create Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  category text,
  stock_status text default 'in_stock', -- 'in_stock', 'out_of_stock'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id), -- Nullable for guest checkout if needed
  total decimal(10,2) not null,
  status text default 'pending', -- 'pending', 'paid', 'failed', 'cancelled'
  binance_prepay_id text,
  merchant_trade_no text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Order Items Table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) not null,
  quantity integer not null,
  price_at_purchase decimal(10,2) not null
);

-- RLS Policies (Row Level Security)
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public read access for products
create policy "Products are viewable by everyone" 
  on products for select 
  using ( true );

-- Users can view their own orders
create policy "Users can view own orders" 
  on orders for select 
  using ( auth.uid() = user_id );

create policy "Users can insert own orders" 
  on orders for insert 
  with check ( auth.uid() = user_id );

-- Order items policies
create policy "Users can view own order items" 
  on order_items for select 
  using ( 
    exists ( select 1 from orders where id = order_items.order_id and user_id = auth.uid() ) 
  );

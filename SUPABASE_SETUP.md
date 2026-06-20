# Supabase 设置指南

## 1. 创建Supabase项目
访问 https://supabase.com 创建项目后，在 Settings > API 中获取：
- Project URL
- anon/public key

## 2. 在SQL Editor中执行以下SQL

```sql
-- 创建用户资料表
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 创建每日记录表
create table records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  income decimal(10,2) not null default 0,
  start_time time not null,
  end_time time not null,
  repair_fee decimal(10,2) default 0,
  hourly_rate decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 启用RLS
alter table records enable row level security;
alter table profiles enable row level security;

-- 创建RLS策略
create policy "Users can CRUD their own records"
  on records for all
  using (auth.uid() = user_id);

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can delete their own profile"
  on profiles for delete
  using (auth.uid() = id);
```

## 3. 更新代码中的配置
在 src/lib/supabase.ts 中替换 YOUR_SUPABASE_URL 和 YOUR_SUPABASE_ANON_KEY 为实际的值。
# DriverFlow - 网约车司机流水宝

一款科技感十足的多端同步流水记录工具，手机电脑都能用。

---

## 一、准备工作

### 1. 注册GitHub账号
- 访问 https://github.com 注册账号
- 账号用于托管代码和部署网站

### 2. 注册Supabase账号
- 访问 https://supabase.com 注册
- 用GitHub账号登录最快

---

## 二、部署到线上（一次配置，永久使用）

### 第一步：创建GitHub仓库

打开 https://github.com/new

```
仓库名: driverflow
可见性: Public（免费）
勾选: Add a README（不需要）
```

```powershell
# 在本地powershell执行（在driverflow目录下）
cd C:\Users\89659\Documents\DeepSeek\driverflow
git remote add origin https://github.com/你的用户名/driverflow.git
git push -u origin main
```

### 第二步：配置GitHub Pages

1. 在浏览器打开仓库页面：https://github.com/你的用户名/driverflow
2. 点击 **Settings** → **Pages**
3. 在 **Source** 选择 **GitHub Actions**
4. 等待1-2分钟，GitHub Actions会自动部署
5. 部署成功后，你的网站地址是：`https://你的用户名.github.io/driverflow`

### 第三步：创建Supabase数据库

1. 打开 https://supabase.com/dashboard/projects
2. 点击 **New project**
3. 填写：
   - Name: `driverflow`
   - Database Password: **记下来！**（后面需要）
   - Region: 选 **Singapore** 或 **Tokyo**（离中国近）
   - Pricing Plan: **Free**（免费）
4. 等待1-2分钟创建完成

5. 创建好后，点击左侧 **SQL Editor**
6. 点击 **New query**
7. **把以下SQL全部复制进去，点击运行：**

```sql
-- 用户资料表
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 每日记录表
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

-- 启用RLS（行级安全）
alter table records enable row level security;
alter table profiles enable row level security;

-- 创建安全策略
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

8. 点击 **Run** 执行，看到绿色勾就成功了

### 第四步：获取API密钥并配置

1. 在Supabase左侧点击 **Project Settings** → **API**
2. 找到这两个值：
   - **Project URL**（类似 `https://xxx.supabase.co`）
   - **anon public key**（一串长字符串）
3. 在GitHub仓库设置环境变量：
   - 打开你的仓库：https://github.com/你的用户名/driverflow
   - 点击 **Settings** → **Secrets and variables** → **Actions**
   - 点击 **New repository secret**
   - Name: `VITE_SUPABASE_URL` → Value: 填入你的Project URL
   - 再创建一个：Name: `VITE_SUPABASE_ANON_KEY` → Value: 填入你的anon key

4. 修改 `.env` 文件（本地开发用）：
   ```
   VITE_SUPABASE_URL=https你的project地址.supabase.co
   VITE_SUPABASE_ANON_KEY=你的anon-key
   ```

5. 同时要修改仓库里的文件，让网站读取这些密钥。打开 `src/lib/supabase.ts`，已经自动读取环境变量，不需要额外修改。

但是需要修改部署流程，让GitHub Pages使用这些密钥。更新 `.github/workflows/deploy.yml`：

```yaml
# 在 - name: Build 这一行的上面添加：
      - name: Create .env file
        run: |
          echo "VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }}" > .env
          echo "VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }}" >> .env
```

完成后，push代码会自动重新部署。

---

## 三、本地开发（可选）

```powershell
cd C:\Users\89659\Documents\DeepSeek\driverflow

# 创建.env文件，填入你的Supabase密钥
cp .env.example .env
# 然后用记事本打开.env，填入实际的值

# 启动开发服务器
npm run dev
```

浏览器打开 http://localhost:5173/driverflow/ 就能看到

---

## 四、使用方法

### 手机端使用
1. 浏览器打开 `https://你的用户名.github.io/driverflow`
2. 注册账号（邮箱+密码）
3. 登录后点击 **记录** 按钮
4. 填写：
   - 日期：今天
   - 流水：今日总流水（元）
   - 出车时间：几点出发
   - 收车时间：几点收车
   - 修车费：如果有的话
5. 自动算出 **时薪**，点击保存
6. 每天收车后花10秒完成记录

### 电脑端使用
**方法一：浏览器**
同手机端，打开同一个网址，登录即可查看所有数据和分析图表

**方法二：本地运行（需要Node.js）**
```powershell
cd C:\Users\89659\Documents\DeepSeek\driverflow
npm run dev
```

### 数据同步原理
- 所有数据存储在 **Supabase云端数据库**
- 手机录入 → 存到云端 → 回家在电脑浏览器打开登录 → 自动同步
- 只要登录同一个账号，数据自动互通

---

## 五、功能介绍

### 首页仪表盘
- **今日卡片**：今日流水、出车时长、时薪、修车费
- **快捷操作**：记录今日 / 查看统计
- **本周汇总**：本周总流水、总时长、平均时薪、修车费
- **最近记录**：最近5天记录列表

### 记录管理
- **新增记录**：填写每日数据，自动计算时薪
- **编辑记录**：点记录列表进入编辑
- **删除记录**：编辑页面底部删除按钮（有确认弹窗）

### 数据分析
- **周报**：本周数据汇总+趋势图
- **月报**：本月数据汇总+趋势图
- **全部**：所有历史数据
- **每月切换**：左右箭头翻看上个月
- **折线图**：每日流水变化 / 时薪变化

---

## 六、数据说明

### 每条记录包含
| 字段 | 说明 |
|------|------|
| 日期 | 出车日期 |
| 流水 | 当日总收入（元） |
| 出车时间 | 几点出发 |
| 收车时间 | 几点收车 |
| 出车时长 | 自动计算 |
| 修车费 | 当日修车支出（元） |
| 时薪 | 自动计算 = 流水 ÷ 时长 |

### 数据安全
- 所有数据存储在Supabase云数据库
- 行级安全策略，每个人只能看到自己的数据
- 登录需要邮箱密码

---

## 七、常见问题

**Q: 手机怎么用？**
A: 手机浏览器打开网站地址即可，不用下载App

**Q: 没有网络能用吗？**
A: 需要网络，数据存云端。有网络的地方都能用

**Q: 数据会丢吗？**
A: Supabase有自动备份，不会丢

**Q: 需要付费吗？**
A: 完全免费。GitHub Pages免费，Supabase免费版够用

**Q: 别人能看到我的数据吗？**
A: 不能，每个人只能看到自己的数据
>>>>>>> acf03c5 (docs: add comprehensive README and update deploy workflow for env vars)

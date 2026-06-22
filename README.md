# DriverFlow · 网约车司机流水宝

> 一款多端同步的流水记录工具，手机、平板、电脑都能用。

🌐 **在线体验：** `https://你的用户名.github.io/driverflow`

---

## 功能

### 📊 首页仪表盘
- **月流水柱状图** — 当月每日流水一目了然，Y 轴自适应刻度
- **跑车区域统计** — 各区域出车天数横向对比

### 📝 记录管理
- **新增记录** — 填写流水、出车/收车时间、区域、修车费，自动算时薪
- **编辑/删除** — 支持修改和删除，删除有确认弹窗

### 📈 数据统计
| 模式 | 范围 | 展示 |
|------|------|------|
| **周** | 日历周（周一~周日） | 7 天柱状图 + 每日明细 |
| **月** | 自然月 | 全月柱状图 + 每日明细 |
| **年** | 所选年份 | 12 个月柱状图 + 每月明细 |

- 四个核心指标卡片：总流水、总时长、时薪、修车费
- 跑车区域统计（始终显示全量数据）
- 左右箭头翻页浏览历史周期

### 🔐 多用户数据隔离
- Supabase Auth 邮箱注册登录
- RLS 行级安全策略，每人只看自己的数据

---

## 技术栈

| 层 | 选型 |
|----|------|
| 前端 | React 18 + TypeScript + Vite |
| 样式 | Tailwind CSS 4 + shadcn/ui（@base-ui/react） |
| 图表 | 手写 SVG（柱状图 + 坐标轴） |
| 后端 | Supabase（Auth + Database） |
| 部署 | GitHub Pages |

---

## 快速开始

```bash
# 安装
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 Supabase URL 和 Anon Key

# 开发
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

> 详细部署指南见 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

---

## 截图

（首页月流水柱状图 + 区域统计 / 统计页周/月/年视图）

---

## License

MIT

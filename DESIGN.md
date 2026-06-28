---
name: DriverFlow
description: 网约车司机流水记录工具的视觉设计系统
colors:
  primary: oklch(0.55 0.18 145)
  primary-foreground: oklch(0.985 0 0)
  background: oklch(0.145 0 0)
  foreground: oklch(0.985 0 0)
  card: oklch(0.205 0 0)
  card-foreground: oklch(0.985 0 0)
  muted: oklch(0.269 0 0)
  muted-foreground: oklch(0.708 0 0)
  destructive: oklch(0.704 0.191 22.216)
  border: oklch(1 0 0 / 10%)
  orange: oklch(0.7 0.17 40)
typography:
  display:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 4vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Variable, Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "calc(0.625rem - 4px)"
  md: "calc(0.625rem - 2px)"
  lg: "0.625rem"
  xl: "calc(0.625rem * 1.4)"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "16px"
---

# Design System: DriverFlow

## 1. Overview

**Creative North Star: "The Reliable Dashboard"**

数据驱动的工具界面，强调清晰度和效率。暗色主题传达专业感，绿色主色调象征收入增长。拒绝花哨的视觉效果，专注于让司机快速掌握关键数据。

**Key Characteristics:**
- 暗色背景减少视觉疲劳，适合长时间使用
- 绿色主色调引导注意力到核心指标
- 响应式布局适配手机、平板、电脑
- 底部导航栏优化移动端单手操作

## 2. Colors

以暗色为基调，绿色为主色，整体色调冷静专业。

### Primary
- **收入绿** (oklch(0.55 0.18 145)): 核心操作按钮、活跃状态、关键指标高亮

### Neutral
- **深空黑** (oklch(0.145 0 0)): 主背景，减少视觉干扰
- **卡片灰** (oklch(0.205 0 0)): 卡片和容器背景
- **边框白** (oklch(1 0 0 / 10%)): 分割线和边框，微妙不抢眼

### Named Rules
**The Focus Rule.** 绿色只用于核心操作和关键数据，不超过屏幕面积的 15%。

## 3. Typography

**Display Font:** Geist Variable (system-ui fallback)
**Body Font:** Geist Variable (system-ui fallback)

**Character:** 现代无衬线字体，清晰易读，适合数据密集型界面。

### Hierarchy
- **Display** (700, clamp(1.5rem, 4vw, 2rem), 1.2): 页面标题、大数字
- **Body** (400, 0.875rem, 1.5): 正文、数据标签
- **Label** (500, 0.75rem, 1.4): 按钮、标签、小字说明

## 4. Elevation

采用分层而非阴影构建深度。卡片和导航栏通过背景色差异区分层级，hover 状态使用微妙的色调变化。

### Shadow Vocabulary
- **导航阴影** (`shadow-xl`): 底部导航栏，提供悬浮感
- **卡片环** (`ring-1 ring-foreground/10`): 卡片边框，微妙的深度暗示

## 5. Components

### Buttons
- **Shape:** 圆角 (0.625rem)
- **Primary:** 绿色背景 + 白色文字，hover 时降低透明度
- **Ghost:** 透明背景，hover 时显示灰色背景

### Cards
- **Corner Style:** 大圆角 (0.625rem * 1.4)
- **Background:** 卡片灰色
- **Border:** 1px 半透明白色边框
- **Internal Padding:** 16px

### Navigation
- **Mobile:** 固定底部，半透明背景 + 模糊效果
- **Desktop:** 底部悬浮胶囊，居中显示
- **Active State:** 绿色背景 + 阴影

### Inputs
- **Style:** 半透明背景，1px 边框
- **Focus:** 绿色环高亮

## 6. Do's and Don'ts

### Do:
- **Do** 使用绿色突出关键数据和操作按钮
- **Do** 保持暗色背景，减少视觉疲劳
- **Do** 使用卡片组织信息，保持呼吸感
- **Do** 底部导航适配移动端单手操作

### Don't:
- **Don't** 使用传统记账软件的密集表格布局
- **Don't** 使用短视频 App 的花哨 UI 和过度动画
- **Don't** 在暗色背景上使用低对比度文字
- **Don️** 使用渐变文字或玻璃拟态效果

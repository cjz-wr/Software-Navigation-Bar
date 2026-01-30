# 软件&网站导航

一个收录各种软件官方网站和优质网站的导航页面，方便快速查找和访问。部署于 GitHub Pages。

## 功能特点

- 🔍 **智能搜索**：支持按名称、描述、标签、分类和类型搜索
- 📂 **双重分类**：按类型（软件/网站）和功能分类双重筛选
- 📱 **响应式设计**：适配各种屏幕尺寸，从手机到桌面
- 🎨 **美观界面**：使用渐变色彩、卡片阴影和悬停效果
- 📊 **数据驱动**：所有数据来自 `data.json` 文件，支持软件和网站
- ⚙️ **管理后台**：提供独立的管理界面进行数据维护
- 👥 **贡献者展示**：自动显示GitHub项目贡献者信息
- 🌐 **GitHub Pages**：完全静态，无需服务器

## 项目结构

```
Software Navigation Bar/
├── index.html          # 主导航页面
├── admin.html          # 管理后台页面
├── styles.css          # 主页面样式文件
├── admin.css           # 管理后台样式文件
├── script.js           # 主页面JavaScript逻辑
├── admin.js            # 管理后台JavaScript逻辑
├── data.json           # 数据文件（软件和网站信息）
└── README.md           # 项目说明文档
```

## 如何添加新软件或网站

### 方法一：通过管理后台（推荐）

1. 打开 `admin.html` 页面
2. 使用表单添加新的软件或网站信息
3. 导出JSON数据并手动更新 `data.json` 文件

### 方法二：直接编辑 data.json

1. Fork 此项目到您的 GitHub 账户
2. 编辑 `data.json` 文件，按照格式添加新的数据
3. 提交 Pull Request，我们会审核并合并

### 方法三：本地编辑

1. 克隆此仓库到本地
2. 编辑 `data.json` 文件
3. 提交更改并推送到 GitHub

## JSON 数据格式

在 `data.json` 文件中添加新的软件或网站数据：

```json
{
  "id": 数字,
  "name": "软件/网站名称",
  "description": "详细描述",
  "url": "https://example.com",
  "category": "分类名称",
  "tags": ["标签1", "标签2"],
  "icon": "fas fa-icon",
  "iconColor": "#颜色代码",
  "popular": false,
  "type": "software" 或 "website"
}
```

### 字段说明

- `id`: 唯一标识符（数字）
- `name`: 软件或网站名称
- `description`: 详细描述信息
- `url`: 官方网站链接
- `category`: 分类名称（如：browser, development, design等）
- `tags`: 标签数组，用于搜索和分类
- `icon`: Font Awesome 图标类名
- `iconColor`: 图标背景颜色（十六进制）
- `popular`: 是否为热门推荐（布尔值）
- `type`: 项目类型（"software" 或 "website"）

### 常用分类

- `browser`: 浏览器
- `design`: 设计工具
- `development`: 开发工具
- `productivity`: 效率办公
- `communication`: 通讯社交
- `media`: 影音媒体
- `utility`: 实用工具
- `security`: 安全软件
- `blog`: 技术博客
- `documentation`: 技术文档
- `social`: 社交媒体

### 常用图标

- `fab fa-chrome`: Chrome浏览器
- `fas fa-code`: 开发工具
- `fas fa-paint-brush`: 设计工具
- `fas fa-video`: 视频会议
- `fas fa-music`: 音乐播放
- `fas fa-file`: 文档处理
- `fas fa-blog`: 博客网站
- `fas fa-book`: 技术文档

## 贡献者展示功能

本项目会在主页底部自动展示GitHub仓库的贡献者信息：

- 🎯 **实时数据**：通过GitHub API获取最新的贡献者列表
- 🏆 **排名展示**：按贡献次数排序显示贡献者排名
- 👤 **头像展示**：显示贡献者的GitHub头像和个人主页链接
- 📊 **贡献统计**：显示每位贡献者的总贡献次数
- 📱 **响应式设计**：适配各种设备屏幕

### 配置说明

在 `script.js` 文件中配置您的GitHub仓库信息：

```javascript
// GitHub API配置
const GITHUB_OWNER = 'yourusername'; // 替换为您的GitHub用户名
const GITHUB_REPO = 'software-navigation'; // 替换为您的仓库名
```

## 开发说明

### 本地运行

```
# 克隆项目
git clone https://github.com/yourusername/software-navigation.git

# 进入项目目录
cd software-navigation

# 启动本地服务器（Python）
python -m http.server 8000

# 或使用 Node.js
npx serve .
```

### 目录结构说明

- **主页面** (`index.html`): 用户浏览界面，支持搜索和分类筛选
- **管理后台** (`admin.html`): 数据管理界面，支持增删改查操作
- **样式文件**: 分别为主页面和管理后台提供独立的样式
- **脚本文件**: 分别处理主页面和管理后台的交互逻辑
- **数据文件**: 统一的数据源，支持软件和网站两种类型

## 贡献指南

欢迎贡献！您可以通过以下方式参与：

1. **添加新资源**：按照格式向 `data.json` 添加优质的软件或网站
2. **改进功能**：优化搜索、筛选或其他功能
3. **美化界面**：改善UI/UX设计
4. **修复bug**：报告和修复发现的问题

## 部署说明

本项目使用 GitHub Pages 部署：

1. 确保所有更改都已提交到 `main` 分支
2. GitHub Actions 会自动构建和部署
3. 访问 `https://yourusername.github.io/software-navigation` 查看效果

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
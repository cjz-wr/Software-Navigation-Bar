# Software Navigation Bar 软件导航栏

一个简洁美观的软件和网站导航页面，帮助你快速访问常用的软件官网和优质网站资源。

## 🌟 特点

- **简洁美观**: 现代化设计，响应式布局
- **分类清晰**: 按不同类别整理软件和网站
- **快速搜索**: 支持按名称、描述、标签搜索
- **移动端适配**: 完美支持手机和平板设备
- **热门推荐**: 突出显示热门项目
- **标签筛选**: 通过标签快速过滤内容
- **类型区分**: 明确标识"软件"或"网站"

## 📁 项目结构

```
software-navigation/
├── index.html          # 主页面
├── admin.html          # 管理后台
├── data.json           # 数据文件
├── script.js           # 主页面脚本
├── admin.js            # 管理后台脚本
├── styles.css          # 主页面样式
├── admin.css           # 管理后台样式
├── test_validation.html # 数据校验测试页面
└── README.md           # 说明文档
```

## 🛠️ 使用方法

### 访问导航页面
直接打开 `index.html` 文件即可使用。

### 管理数据
1. 打开 `admin.html` 进入管理后台
2. 点击"添加项目"按钮添加新项目
3. 点击编辑/删除按钮管理现有项目
4. 使用导入/导出功能批量处理数据

### 数据格式说明

每个项目包含以下字段：

```json
{
  "id": 1,
  "name": "项目名称",
  "url": "https://example.com",
  "description": "项目描述",
  "category": "development",
  "type": "software",
  "icon": "fas fa-code",
  "iconColor": "#3498db",
  "popular": true,
  "tags": ["标签1", "标签2"]
}
```

#### 字段说明：
- `id`: 项目唯一标识符（数字，自动生成）
- `name`: 项目名称（必填）
- `url`: 项目链接（必填，必须是有效的HTTP/HTTPS链接）
- `description`: 项目描述（必填）
- `category`: 项目分类（必填）
- `type`: 项目类型（必填，"software"或"website"）
- `icon`: 图标（Font Awesome类名或图片URL）
- `iconColor`: 图标背景色（十六进制颜色值）
- `popular`: 是否为热门项目（布尔值）
- `tags`: 标签数组（可选）

#### 支持的分类：
- `browser`: 浏览器
- `design`: 设计工具
- `development`: 开发工具
- `productivity`: 效率办公
- `communication`: 通讯社交
- `media`: 影音媒体
- `utility`: 实用工具
- `security`: 安全软件
- `editor`: 编辑器
- `ai`: AI工具
- `cloud`: 云服务
- `blog`: 技术博客
- `documentation`: 技术文档
- `social`: 社交媒体
- `life`: 生活
- `government`: 政府
- `study`: 学习
- `other`: 其他

## 🚀 新增功能

### 🔒 增强数据校验机制
- **双重唯一性检查**: 同时检查项目名称和URL的唯一性
- **智能ID生成**: 自动生成全局唯一的项目ID
- **完整数据验证**: 验证URL格式、必需字段、数据类型
- **自动数据清理**: 自动清理和标准化输入数据
- **详细错误报告**: 提供具体的错误信息和修复建议
- **批量修复功能**: 自动修复ID冲突和重复问题

### 📊 管理后台增强
- **分页显示**: 支持大量数据的分页浏览
- **批量导入**: 支持JSON数据批量导入
- **数据导出**: 一键导出所有数据为JSON格式
- **实时预览**: 添加/编辑时实时预览效果
- **数据同步**: 与主页面数据实时同步

## 🔧 本地运行

### 方法一：使用Python
```bash
python -m http.server 8000
```

### 方法二：使用Node.js
```bash
npx serve
```

然后在浏览器中访问 `http://localhost:8000`

### 自定义配置
- 修改 `styles.css` 调整主题颜色
- 在 `data.json` 中添加您的软件数据
- 扩展 `script.js` 添加新功能

## 贡献指南

欢迎任何形式的贡献！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 添加新软件/网站
请确保提供以下信息：
- 准确的项目名称和官方链接
- 详细的描述信息
- 合适的分类和标签
- 适当的图标和颜色

## 🔒 数据校验机制详解

### 唯一性检查
系统会对每个项目进行双重唯一性检查：
- **名称检查**: 确保项目名称不重复
- **URL检查**: 确保项目链接不重复

### 数据验证规则
- **URL格式**: 必须是有效的HTTP/HTTPS链接
- **必需字段**: name、url、category、type不能为空
- **数据类型**: 各字段必须符合预期的数据类型
- **标签格式**: tags必须是字符串数组

### 自动修复功能
- **ID冲突**: 自动为冲突的项目生成新ID
- **数据清理**: 自动清理空白字符和标准化数据格式
- **类型转换**: 自动将字符串类型的布尔值转换为真正的布尔值

### 错误处理
- **详细报告**: 提供具体的错误位置和原因
- **批量处理**: 支持批量导入时的选择性处理
- **修复建议**: 对可修复的问题提供自动修复选项

## 🌐 部署到GitHub Pages

1. 将项目推送到GitHub仓库
2. 在仓库Settings中启用GitHub Pages
3. 选择主分支作为源
4. 访问生成的页面URL

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License

## 联系方式

- GitHub Issues: [提交问题或建议](https://github.com/yourusername/software-navigation/issues)
- 邮箱: your-email@example.com

---
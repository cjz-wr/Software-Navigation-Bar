// 全局变量
let softwareData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 12;
const categories = new Set(); // 存储所有分类
let currentType = 'all'; // 当前选择的类型

// GitHub配置
const GITHUB_CONFIG = {
    owner: 'cjz-wr',
    repo: 'Software-Navigation-Bar',
    apiUrl: 'https://api.github.com'
};

// 通知配置
const NOTIFICATION_CONFIG = {
    duration: 5000,
    types: {
        success: 'success',
        error: 'error',
        info: 'info',
        warning: 'warning'
    }
};

// DOM元素
const softwareGrid = document.getElementById('softwareGrid');
const categoryList = document.querySelector('.category-list');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearch');
const searchResultsInfo = document.getElementById('searchResultsInfo');
const resultCount = document.getElementById('resultCount');
const emptyState = document.getElementById('emptyState');
const softwareCount = document.getElementById('softwareCount');
const viewJsonBtn = document.getElementById('viewJson');
const exportDataBtn = document.getElementById('exportData');
const resetDataBtn = document.getElementById('resetData');
const jsonModal = document.getElementById('jsonModal');
const closeModalBtn = document.getElementById('closeModal');
const currentYear = document.getElementById('currentYear');

// JSON数据文件路径
const DATA_URL = 'data.json';

// 显示通知函数
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // 自动关闭
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // 手动关闭
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// 获取GitHub贡献者数据
async function fetchContributors() {
    const loadingEl = document.getElementById('contributorsLoading');
    const gridEl = document.getElementById('contributorsGrid');
    const errorEl = document.getElementById('contributorsError');
    
    try {
        // 显示加载状态
        loadingEl.style.display = 'block';
        gridEl.style.display = 'none';
        errorEl.style.display = 'none';
        
        const response = await fetch(
            `${GITHUB_CONFIG.apiUrl}/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contributors`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contributors = await response.json();
        
        // 隐藏加载状态
        loadingEl.style.display = 'none';
        
        if (contributors.length === 0) {
            showError('暂无贡献者数据');
            return;
        }
        
        // 渲染贡献者
        renderContributors(contributors);
        
    } catch (error) {
        console.error('获取贡献者数据失败:', error);
        loadingEl.style.display = 'none';
        showError('获取贡献者数据失败，请稍后重试');
    }
}

// 渲染贡献者列表
function renderContributors(contributors) {
    const gridEl = document.getElementById('contributorsGrid');
    gridEl.style.display = 'grid';
    
    // 只显示前16名贡献者
    const displayContributors = contributors.slice(0, 16);
    
    gridEl.innerHTML = displayContributors.map(contributor => `
        <div class="contributor-card" data-event-bound="false">
            <a href="${contributor.html_url}" 
               target="_blank" 
               rel="noopener noreferrer"
               title="访问 ${contributor.login} 的 GitHub 主页">
                <img src="${contributor.avatar_url}" 
                     alt="${contributor.login}" 
                     class="contributor-avatar"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.login)}&background=0D8ABC&color=fff&size=80'">
                <p class="contributor-name">${contributor.login}</p>
            </a>
        </div>
    `).join('');
    
    // 添加事件监听器
    bindContributorEvents();
}

// 绑定贡献者卡片事件
function bindContributorEvents() {
    const cards = document.querySelectorAll('.contributor-card[data-event-bound="false"]');
    
    cards.forEach(card => {
        const link = card.querySelector('a');
        const avatar = card.querySelector('.contributor-avatar');
        
        // 添加悬停效果
        card.addEventListener('mouseenter', function() {
            avatar.style.transform = 'scale(1.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            avatar.style.transform = 'scale(1)';
        });
        
        // 确保链接可以正常工作
        link.addEventListener('click', function(e) {
            // 允许链接正常跳转
        });
        
        // 标记为已绑定事件
        card.setAttribute('data-event-bound', 'true');
    });
}

// 显示错误信息
function showError(message) {
    const errorEl = document.getElementById('contributorsError');
    const gridEl = document.getElementById('contributorsGrid');
    
    errorEl.style.display = 'block';
    gridEl.style.display = 'none';
    
    errorEl.querySelector('p').textContent = message;
}

// 重新加载贡献者数据
function retryLoadContributors() {
    fetchContributors();
}

// 初始化贡献者展示
function initContributors() {
    // 绑定重新加载按钮事件
    const retryBtn = document.getElementById('retryContributors');
    if (retryBtn) {
        retryBtn.addEventListener('click', retryLoadContributors);
    }
    
    // 延迟加载贡献者数据，避免影响主内容加载
    setTimeout(() => {
        fetchContributors();
    }, 1000);
}

// 加载软件数据
async function loadSoftwareData() {
    try {
        const response = await fetch(DATA_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 检查数据结构
        if (!Array.isArray(data)) {
            throw new Error('数据格式错误：期望一个数组');
        }
        
        // 保存软件数据
        softwareData = data;
        
        // 更新计数
        softwareCount.textContent = softwareData.length;
        
        // 提取所有分类
        categories.clear();
        softwareData.forEach(item => {
            if (item.category && item.category.trim() !== '') {
                categories.add(item.category);
            }
        });
        
        // 渲染分类按钮
        renderCategoryButtons();
        
        // 渲染所有项目
        renderSoftwareCards(softwareData);
        
        console.log(`成功加载 ${softwareData.length} 个项目数据`);
    } catch (error) {
        console.error('加载数据失败:', error);
        showNotification('加载数据失败，请检查 data.json 文件', 'error');
        
        // 显示空状态
        emptyState.style.display = 'flex';
        softwareGrid.innerHTML = '';
    }
}

// 渲染分类按钮
function renderCategoryButtons() {
    // 清空现有按钮（保留"全部"、"软件"、"网站"按钮）
    const allButtons = categoryList.querySelectorAll('[data-category="all"], [data-type]');
    const fragment = document.createDocumentFragment();
    allButtons.forEach(btn => fragment.appendChild(btn));
    
    categoryList.innerHTML = '';
    categoryList.appendChild(fragment);
    
    // 为"全部"按钮添加事件监听（避免重复绑定）
    const allButton = categoryList.querySelector('[data-category="all"]');
    if (allButton && !allButton.hasAttribute('data-event-bound')) {
        allButton.addEventListener('click', function() {
            currentType = 'all';
            
            // 更新活动按钮
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 清空搜索框
            searchInput.value = '';
            
            // 显示所有项目
            renderSoftwareCards(softwareData);
            
            // 隐藏搜索结果提示
            searchResultsInfo.classList.remove('show');
        });
        // 标记已绑定事件
        allButton.setAttribute('data-event-bound', 'true');
    }
    
    // 添加分类按钮
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.setAttribute('data-category', category);
        button.textContent = getCategoryDisplayName(category);
        categoryList.appendChild(button);
        
        // 添加点击事件（避免重复绑定）
        if (!button.hasAttribute('data-event-bound')) {
            button.addEventListener('click', function() {
                // 更新活动按钮
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // 清空搜索框
                searchInput.value = '';
                
                // 根据分类过滤项目
                const category = this.getAttribute('data-category');
                let filteredItems = softwareData;
                
                // 先按类型筛选
                if (currentType !== 'all') {
                    filteredItems = filteredItems.filter(item => item.type === currentType);
                }
                
                // 再按分类筛选
                if (category !== 'all') {
                    filteredItems = filteredItems.filter(item => item.category === category);
                }
                
                // 渲染过滤后的项目
                renderSoftwareCards(filteredItems);
                
                // 隐藏搜索结果提示
                searchResultsInfo.classList.remove('show');
            });
            // 标记已绑定事件
            button.setAttribute('data-event-bound', 'true');
        }
    });
    
    // 为类型按钮添加事件监听（避免重复绑定）
    document.querySelectorAll('[data-type]').forEach(btn => {
        if (!btn.hasAttribute('data-event-bound')) {
            btn.addEventListener('click', function() {
                currentType = this.getAttribute('data-type');
                
                // 更新活动按钮
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // 清空搜索框
                searchInput.value = '';
                
                // 过滤数据
                let filteredItems = softwareData;
                if (currentType !== 'all') {
                    filteredItems = softwareData.filter(item => item.type === currentType);
                }
                
                // 渲染项目
                renderSoftwareCards(filteredItems);
                
                // 隐藏搜索结果提示
                searchResultsInfo.classList.remove('show');
            });
            // 标记已绑定事件
            btn.setAttribute('data-event-bound', 'true');
        }
    });
}

// 获取显示名称（通用函数）
function getDisplayName(value, type) {
    const displayNames = {
        category: {
            'browser': '浏览器',
            'design': '设计工具',
            'development': '开发工具',
            'productivity': '效率办公',
            'communication': '通讯社交',
            'media': '影音媒体',
            'utility': '实用工具',
            'security': '安全软件',
            'editor': '编辑器',
            'ai': 'AI工具',
            'cloud': '云服务',
            'blog': '技术博客',
            'documentation': '技术文档',
            'social': '社交媒体',
            'life': '生活',
            'government': '政府',
            'study': '学习'
        },
        type: {
            'software': '软件',
            'website': '网站'
        }
    };
    
    if (displayNames[type] && displayNames[type][value]) {
        return displayNames[type][value];
    }
    return value;
}

// 获取分类显示名称（兼容原有调用）
function getCategoryDisplayName(category) {
    return getDisplayName(category, 'category');
}

// 获取类型显示名称（兼容原有调用）
function getTypeDisplayName(type) {
    return getDisplayName(type, 'type');
}

// 执行搜索
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // 如果搜索词为空，显示所有项目
        let filteredItems = softwareData;
        
        // 按当前类型筛选
        if (currentType !== 'all') {
            filteredItems = filteredItems.filter(item => item.type === currentType);
        }
        
        renderSoftwareCards(filteredItems);
        searchResultsInfo.classList.remove('show');
        
        // 重置分类按钮
        document.querySelectorAll('.category-btn').forEach(btn => {
            if (btn.getAttribute('data-category') === 'all' || btn.getAttribute('data-type') === currentType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // 隐藏空状态
        emptyState.style.display = 'none';
        
        return;
    }
    
    // 过滤项目
    const filteredItems = softwareData.filter(item => {
        return (
            (item.name && item.name.toLowerCase().includes(searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
            (item.category && item.category.toLowerCase().includes(searchTerm)) ||
            (item.type && item.type.toLowerCase().includes(searchTerm))
        );
    });
    
    // 渲染搜索结果
    renderSoftwareCards(filteredItems);
    
    // 显示搜索结果信息
    resultCount.textContent = filteredItems.length;
    searchResultsInfo.classList.add('show');
    
    // 重置分类按钮
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
}

// 渲染软件卡片
function renderSoftwareCards(itemsList) {
    softwareGrid.innerHTML = '';
    
    if (itemsList.length === 0) {
        emptyState.style.display = 'flex';
        return;
    }
    
    emptyState.style.display = 'none';
    
    itemsList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'software-card';
        card.setAttribute('data-category', item.category || '其他');
        card.setAttribute('data-type', item.type || 'software');
        
        // 生成标签HTML
        let tagsHTML = '';
        if (item.tags && Array.isArray(item.tags)) {
            tagsHTML = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        }
        
        // 生成类型标签
        const typeTag = `<span class="tag ${item.type}-tag">${getTypeDisplayName(item.type)}</span>`;
        
        // 判断图标是URL还是类名
        const iconHTML = getHomepageIconHTML(item.icon, item.iconColor || '#2575fc');
        
        // 生成卡片HTML
        card.innerHTML = `
            <div class="card-header">
                ${iconHTML}
                <div class="software-info">
                    <h3>${item.name || '未命名项目'}</h3>
                    <p>${getCategoryDisplayName(item.category) || '未分类'}</p>
                </div>
            </div>
            <div class="card-body">
                <p>${item.description || '暂无描述'}</p>
                <div class="software-tags">
                    ${typeTag}
                    ${tagsHTML ? tagsHTML : ''}
                </div>
            </div>
            <div class="card-footer">
                <a href="${item.url || '#'}" target="_blank" class="visit-btn">
                    <i class="fas fa-external-link-alt"></i> 访问${item.type === 'website' ? '网站' : '官网'}
                </a>
                ${item.popular ? '<span class="tag" style="background-color: #fef3c7; color: #d97706;">热门</span>' : ''}
            </div>
        `;
        
        softwareGrid.appendChild(card);
    });
}

// 获取主页图标HTML（支持URL和类名）
function getHomepageIconHTML(iconValue, backgroundColor) {
    if (!iconValue) {
        iconValue = 'fas fa-cube';
        backgroundColor = '#2575fc';
    }
    
    // 判断是否为URL（简单判断是否包含http或https）
    if (iconValue.startsWith('http://') || iconValue.startsWith('https://')) {
        return `
            <div class="software-icon software-icon-image" style="background-color: ${backgroundColor}">
                <img src="${iconValue}" alt="图标" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\'fas fa-image\'></i>'">
            </div>
        `;
    } else {
        // Font Awesome 图标类名
        return `
            <div class="software-icon" style="background-color: ${backgroundColor}">
                <i class="${iconValue}"></i>
            </div>
        `;
    }
}

// 导出JSON文件
function exportJsonFile() {
    // 创建JSON字符串
    const jsonString = JSON.stringify(softwareData, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'software-website-navigation-data.json';
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    showNotification(`已导出 ${softwareData.length} 个项目数据`, 'success');
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', performSearch);
    
    // 搜索输入框回车事件
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // 清除搜索按钮
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        performSearch();
    });
    
    // 查看JSON结构按钮
    if (viewJsonBtn) {
        viewJsonBtn.addEventListener('click', function() {
            jsonModal.classList.add('show');
        });
    }
    
    // 关闭模态框
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            jsonModal.classList.remove('show');
        });
    }
    
    // 点击模态框外部关闭
    jsonModal.addEventListener('click', function(event) {
        if (event.target === jsonModal) {
            jsonModal.classList.remove('show');
        }
    });
    
    // 导出数据按钮
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportJsonFile);
    }
    
    // 重置数据按钮
    if (resetDataBtn) {
        resetDataBtn.addEventListener('click', function() {
            if (confirm('确定要重新加载数据吗？这将从 data.json 文件重新加载数据。')) {
                loadSoftwareData();
                showNotification('数据已重新加载', 'success');
            }
        });
    }
}

// 更新当前年份
function updateCurrentYear() {
    currentYear.textContent = new Date().getFullYear();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    loadSoftwareData();
    setupEventListeners();
    updateCurrentYear();
    
    // 初始化贡献者展示
    initContributors();
});
// 软件数据变量
let softwareData = [];
let editMode = false;
let currentEditId = null;

// JSON数据文件路径
const DATA_URL = 'data.json';

// DOM元素
const softwareTableBody = document.getElementById('softwareTableBody');
const emptyTableState = document.getElementById('emptyTableState');
const totalSoftwareEl = document.getElementById('totalSoftware');
const popularSoftwareEl = document.getElementById('popularSoftware');
const totalCategoriesEl = document.getElementById('totalCategories');
const storageStatusEl = document.getElementById('storageStatus');
const addSoftwareBtn = document.getElementById('addSoftwareBtn');
const addFirstSoftwareBtn = document.getElementById('addFirstSoftwareBtn');
const softwareModal = document.getElementById('softwareModal');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModal');
const cancelFormBtn = document.getElementById('cancelFormBtn');
const softwareForm = document.getElementById('softwareForm');
const softwareIdInput = document.getElementById('softwareId');
const softwareNameInput = document.getElementById('softwareName');
const softwareUrlInput = document.getElementById('softwareUrl');
const softwareDescInput = document.getElementById('softwareDescription');
const softwareTypeInput = document.getElementById('softwareType');
const softwareCategoryInput = document.getElementById('softwareCategory');
const softwareIconInput = document.getElementById('softwareIcon');
const softwareIconColorInput = document.getElementById('softwareIconColor');
const softwarePopularInput = document.getElementById('softwarePopular');
const softwareTagsInput = document.getElementById('softwareTags');
const submitFormBtn = document.getElementById('submitFormBtn');

// 导入/导出相关元素
const importJsonBtn = document.getElementById('importJsonBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const exportDataLink = document.getElementById('exportDataLink');
const syncToMainBtn = document.getElementById('syncToMainBtn');
const clearAllDataBtn = document.getElementById('clearAllDataBtn');
const importModal = document.getElementById('importModal');
const closeImportModal = document.getElementById('closeImportModal');
const uploadJsonBtn = document.getElementById('uploadJsonBtn');
const pasteJsonBtn = document.getElementById('pasteJsonBtn');
const pasteJsonArea = document.getElementById('pasteJsonArea');
const jsonTextarea = document.getElementById('jsonTextarea');
const cancelPasteBtn = document.getElementById('cancelPasteBtn');
const confirmPasteBtn = document.getElementById('confirmPasteBtn');
const uploadJsonArea = document.getElementById('uploadJsonArea');
const jsonFileInput = document.getElementById('jsonFileInput');
const cancelUploadBtn = document.getElementById('cancelUploadBtn');
const confirmUploadBtn = document.getElementById('confirmUploadBtn');
const mergeDataCheckbox = document.getElementById('mergeDataCheckbox');

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 加载软件数据
    loadSoftwareData();
    
    // 添加软件按钮事件
    addSoftwareBtn.addEventListener('click', openAddSoftwareModal);
    addFirstSoftwareBtn.addEventListener('click', openAddSoftwareModal);
    
    // 模态框关闭事件
    closeModalBtn.addEventListener('click', closeSoftwareModal);
    cancelFormBtn.addEventListener('click', closeSoftwareModal);
    
    // 表单提交事件
    softwareForm.addEventListener('submit', handleFormSubmit);
    
    // 导入/导出事件
    importJsonBtn.addEventListener('click', openImportModal);
    exportJsonBtn.addEventListener('click', exportJsonFile);
    exportDataLink.addEventListener('click', exportJsonFile);
    syncToMainBtn.addEventListener('click', syncToMainPage);
    clearAllDataBtn.addEventListener('click', clearAllData);
    
    // 导入模态框事件
    closeImportModal.addEventListener('click', closeImportModalFunc);
    uploadJsonBtn.addEventListener('click', showUploadJsonArea);
    pasteJsonBtn.addEventListener('click', showPasteJsonArea);
    cancelPasteBtn.addEventListener('click', hideJsonAreas);
    cancelUploadBtn.addEventListener('click', hideJsonAreas);
    confirmPasteBtn.addEventListener('click', confirmPasteJson);
    confirmUploadBtn.addEventListener('click', confirmUploadJson);
    
    // 点击模态框外部关闭
    softwareModal.addEventListener('click', function(event) {
        if (event.target === softwareModal) {
            closeSoftwareModal();
        }
    });
    
    importModal.addEventListener('click', function(event) {
        if (event.target === importModal) {
            closeImportModalFunc();
        }
    });
});

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
        
        console.log(`成功加载 ${softwareData.length} 个项目数据`);
        storageStatusEl.textContent = '正常';
        
        // 更新统计信息
        updateStats();
        
        // 渲染软件表格
        renderSoftwareTable();
        
    } catch (error) {
        console.error('加载数据失败:', error);
        showNotification('加载数据失败，请检查 data.json 文件: ' + error.message, 'error');
        storageStatusEl.textContent = '错误';
        
        // 显示空状态
        emptyTableState.style.display = 'flex';
        softwareTableBody.innerHTML = '';
    }
}

// 保存数据到data.json文件（模拟保存）
function saveToDataFile() {
    try {
        // 在实际部署中，这里需要通过后端API保存数据
        // 目前我们只是更新内存中的数据并显示通知
        console.log('数据已保存到data.json文件:', softwareData.length);
        storageStatusEl.textContent = '正常';
        return true;
    } catch (error) {
        console.error('保存到data.json失败:', error);
        storageStatusEl.textContent = '保存失败';
        showNotification('保存数据失败: ' + error.message, 'error');
        return false;
    }
}

// 更新统计信息
function updateStats() {
    // 总软件数
    totalSoftwareEl.textContent = softwareData.length;
    
    // 热门软件数
    const popularCount = softwareData.filter(software => software.popular).length;
    popularSoftwareEl.textContent = popularCount;
    
    // 分类数量
    const categories = new Set(softwareData.map(software => software.category));
    totalCategoriesEl.textContent = categories.size;
}

// 渲染软件表格
function renderSoftwareTable() {
    softwareTableBody.innerHTML = '';
    
    if (softwareData.length === 0) {
        emptyTableState.style.display = 'flex';
        return;
    }
    
    emptyTableState.style.display = 'none';
    
    softwareData.forEach((software, index) => {
        const row = document.createElement('tr');
        
        // 生成标签HTML
        let tagsHTML = '';
        if (software.tags && Array.isArray(software.tags)) {
            tagsHTML = software.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        }
        
        // 生成类型标签
        const typeTag = software.type ? `<span class="tag" style="background-color: ${software.type === 'software' ? '#3b82f6' : '#10b981'}; color: white;">${software.type === 'software' ? '软件' : '网站'}</span>` : '';
        
        // 判断图标是URL还是类名
        const iconHTML = getIconHTML(software.icon, software.iconColor || '#2575fc');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="software-icon-cell">
                    ${iconHTML}
                    <div>
                        <div class="software-name">${software.name || '未命名项目'}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 3px;">${software.description?.substring(0, 50) || '无描述'}${software.description && software.description.length > 50 ? '...' : ''}</div>
                    </div>
                </div>
            </td>
            <td>${typeTag}</td>
            <td><span class="software-category">${getCategoryDisplayName(software.category) || '未分类'}</span></td>
            <td><div class="software-tags-cell">${tagsHTML || '<span style="color: #94a3b8; font-size: 12px;">无标签</span>'}</div></td>
            <td>${software.popular ? '<span style="color: #f59e0b;"><i class="fas fa-star"></i> 是</span>' : '否'}</td>
            <td>
                <div class="action-cell">
                    <button class="action-btn action-btn-edit" data-id="${software.id}" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn action-btn-delete" data-id="${software.id}" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        softwareTableBody.appendChild(row);
    });
    
    // 添加编辑和删除按钮事件
    document.querySelectorAll('.action-btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editSoftware(id);
        });
    });
    
    document.querySelectorAll('.action-btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteSoftware(id);
        });
    });
}

// 获取分类显示名称
function getCategoryDisplayName(category) {
    const displayNames = {
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
        'other': '其他'
    };
    
    return displayNames[category] || category;
}

// 打开添加项目模态框
function openAddSoftwareModal() {
    editMode = false;
    modalTitle.textContent = '添加项目';
    
    // 重置表单
    softwareForm.reset();
    softwareIdInput.value = '';
    softwareIconInput.value = 'fas fa-cube';
    softwareIconColorInput.value = '#2575fc';
    softwarePopularInput.checked = false;
    softwareCategoryInput.value = 'other'; // 默认分类
    softwareTypeInput.value = 'software'; // 默认类型为软件
    
    // 打开模态框
    softwareModal.classList.add('show');
}

// 编辑项目
function editSoftware(id) {
    const software = softwareData.find(item => item.id === id);
    
    if (!software) {
        showNotification('未找到要编辑的项目', 'error');
        return;
    }
    
    editMode = true;
    currentEditId = id;
    modalTitle.textContent = '编辑项目';
    
    // 填充表单
    softwareIdInput.value = software.id;
    softwareNameInput.value = software.name || '';
    softwareUrlInput.value = software.url || '';
    softwareDescInput.value = software.description || '';
    softwareCategoryInput.value = software.category || 'other';
    softwareTypeInput.value = software.type || 'software'; // 设置类型字段
    softwareIconInput.value = software.icon || 'fas fa-cube';
    softwareIconColorInput.value = software.iconColor || '#2575fc';
    softwarePopularInput.checked = software.popular || false;
    
    // 处理标签
    if (software.tags && Array.isArray(software.tags)) {
        softwareTagsInput.value = software.tags.join(', ');
    } else {
        softwareTagsInput.value = '';
    }
    
    // 打开模态框
    softwareModal.classList.add('show');
}

// 关闭软件模态框
function closeSoftwareModal() {
    softwareModal.classList.remove('show');
}

// 处理表单提交
function handleFormSubmit(event) {
    event.preventDefault();
    
    // 获取表单数据
    const formData = {
        id: editMode ? currentEditId : generateId(),
        name: softwareNameInput.value.trim(),
        url: softwareUrlInput.value.trim(),
        description: softwareDescInput.value.trim(),
        category: softwareCategoryInput.value,
        type: softwareTypeInput.value, // 添加类型字段
        icon: softwareIconInput.value.trim(),
        iconColor: softwareIconColorInput.value,
        popular: softwarePopularInput.checked,
        tags: softwareTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };
    
    // 验证数据
    if (!formData.name) {
        showNotification('请输入项目名称', 'error');
        return;
    }
    
    if (!formData.url) {
        showNotification('请输入项目链接', 'error');
        return;
    }
    
    if (!formData.description) {
        showNotification('请输入项目描述', 'error');
        return;
    }
    
    if (!formData.category) {
        showNotification('请选择项目分类', 'error');
        return;
    }
    
    if (!formData.type) {
        showNotification('请选择项目类型', 'error');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(formData.url);
    } catch (error) {
        showNotification('请输入有效的URL链接', 'error');
        return;
    }
    
    if (editMode) {
        // 更新现有项目
        const index = softwareData.findIndex(item => item.id === formData.id);
        if (index !== -1) {
            softwareData[index] = formData;
            showNotification('项目更新成功', 'success');
        }
    } else {
        // 添加新项目
        softwareData.push(formData);
        showNotification('项目添加成功', 'success');
    }
    
    // 保存到data.json文件
    saveToDataFile();
    
    // 更新UI
    updateStats();
    renderSoftwareTable();
    
    // 关闭模态框
    closeSoftwareModal();
    
    // 提示用户需要手动更新data.json文件
    showNotification('请手动更新 data.json 文件以保存更改', 'info');
}

// 生成ID
function generateId() {
    if (softwareData.length === 0) {
        return 1;
    }
    
    const maxId = Math.max(...softwareData.map(item => item.id));
    return maxId + 1;
}

// 删除软件
function deleteSoftware(id) {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。\n注意：您需要手动更新 data.json 文件才能永久保存更改。')) {
        return;
    }
    
    const index = softwareData.findIndex(item => item.id === id);
    
    if (index !== -1) {
        softwareData.splice(index, 1);
        saveToDataFile();
        updateStats();
        renderSoftwareTable();
        showNotification('项目删除成功', 'success');
        showNotification('请手动更新 data.json 文件以保存更改', 'info');
    }
}

// 打开导入模态框
function openImportModal() {
    hideJsonAreas();
    importModal.classList.add('show');
}

// 关闭导入模态框
function closeImportModalFunc() {
    importModal.classList.remove('show');
    hideJsonAreas();
}

// 显示上传JSON区域
function showUploadJsonArea() {
    pasteJsonArea.style.display = 'none';
    uploadJsonArea.style.display = 'block';
}

// 显示粘贴JSON区域
function showPasteJsonArea() {
    uploadJsonArea.style.display = 'none';
    pasteJsonArea.style.display = 'block';
}

// 隐藏所有JSON区域
function hideJsonAreas() {
    pasteJsonArea.style.display = 'none';
    uploadJsonArea.style.display = 'none';
}

// 确认粘贴JSON
function confirmPasteJson() {
    const jsonText = jsonTextarea.value.trim();
    
    if (!jsonText) {
        showNotification('请输入JSON数据', 'error');
        return;
    }
    
    try {
        const jsonData = JSON.parse(jsonText);
        processImportedData(jsonData);
    } catch (error) {
        showNotification('JSON格式错误: ' + error.message, 'error');
    }
}

// 确认上传JSON
function confirmUploadJson() {
    const file = jsonFileInput.files[0];
    
    if (!file) {
        showNotification('请选择JSON文件', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            processImportedData(jsonData);
        } catch (error) {
            showNotification('JSON格式错误: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
}

// 处理导入的数据
function processImportedData(jsonData) {
    // 验证数据格式
    if (!Array.isArray(jsonData)) {
        showNotification('导入的数据应该是一个数组', 'error');
        return;
    }
    
    // 验证每个对象
    for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
        if (!item.name || !item.url || !item.category) {
            showNotification(`第 ${i + 1} 个项目缺少必要字段 (name, url 或 category)`, 'error');
            return;
        }
        
        // 确保有ID
        if (!item.id) {
            item.id = generateId();
        }
    }
    
    // 处理数据合并或替换
    if (mergeDataCheckbox.checked && softwareData.length > 0) {
        // 合并数据
        const existingIds = new Set(softwareData.map(item => item.id));
        const newItems = jsonData.filter(item => !existingIds.has(item.id));
        softwareData = softwareData.concat(newItems);
        showNotification(`成功导入 ${newItems.length} 个项目（合并数据）`, 'success');
    } else {
        // 替换数据
        softwareData = jsonData;
        showNotification(`成功导入 ${jsonData.length} 个项目（替换数据）`, 'success');
    }
    
    // 保存到data.json文件
    saveToDataFile();
    
    // 更新UI
    updateStats();
    renderSoftwareTable();
    
    // 关闭模态框
    closeImportModalFunc();
    
    // 提示用户需要手动更新data.json文件
    showNotification('请手动更新 data.json 文件以保存更改', 'info');
}

// 导出JSON文件
function exportJsonFile() {
    if (softwareData.length === 0) {
        showNotification('没有数据可以导出', 'error');
        return;
    }
    
    // 创建JSON字符串
    const jsonString = JSON.stringify(softwareData, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    
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

// 同步到主页面
function syncToMainPage() {
    // 重新加载数据
    loadSoftwareData();
    showNotification('数据已从 data.json 重新加载', 'success');
}

// 清空所有数据
function clearAllData() {
    if (!confirm('确定要清空所有数据吗？此操作不可撤销。\n注意：这只会清空当前页面的数据，不会影响 data.json 文件。')) {
        return;
    }
    
    softwareData = [];
    saveToDataFile();
    updateStats();
    renderSoftwareTable();
    showNotification('所有数据已清空（仅当前页面）', 'success');
    showNotification('请手动清空 data.json 文件以永久删除数据', 'info');
}

// 显示通知
function showNotification(message, type = 'info') {
    // 移除现有通知
    const existingNotification = document.getElementById('notificationContainer');
    if (existingNotification) {
        existingNotification.innerHTML = '';
    }
    
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // 添加到容器
    if (!existingNotification) {
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        document.body.appendChild(notificationContainer);
        notificationContainer.appendChild(notification);
    } else {
        existingNotification.appendChild(notification);
    }
    
    // 关闭按钮事件
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.remove();
    });
    
    // 自动消失
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000); // 延长显示时间到5秒，因为有重要提示信息
}

// 获取图标HTML（支持URL和类名）
function getIconHTML(iconValue, backgroundColor) {
    if (!iconValue) {
        iconValue = 'fas fa-cube';
        backgroundColor = '#2575fc';
    }
    
    // 判断是否为URL（简单判断是否包含http或https）
    if (iconValue.startsWith('http://') || iconValue.startsWith('https://')) {
        return `
            <div class="table-icon table-icon-image" style="background-color: ${backgroundColor}">
                <img src="${iconValue}" alt="图标" onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\'fas fa-image\'></i>'">
            </div>
        `;
    } else {
        // Font Awesome 图标类名
        return `
            <div class="table-icon" style="background-color: ${backgroundColor}">
                <i class="${iconValue}"></i>
            </div>
        `;
    }
}

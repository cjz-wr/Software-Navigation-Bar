// 软件数据变量
let softwareData = [];
let editMode = false;
let currentEditId = null;

// 分页相关变量
let currentPage = 1;
const itemsPerPage = 80;
let totalPages = 1;

// JSON数据文件路径
const DATA_URL = 'data.json';

// 检查项目是否已存在（根据name和url判断）
function isSoftwareExists(name, url, excludeId = null) {
    return softwareData.some(item => 
        (item.name.toLowerCase() === name.toLowerCase() || 
         item.url.toLowerCase() === url.toLowerCase()) && 
        (excludeId === null || item.id !== excludeId)
    );
}

// 获取已存在的项目（根据name或url）
function getExistingSoftware(name, url) {
    return softwareData.find(item => 
        item.name.toLowerCase() === name.toLowerCase() || 
        item.url.toLowerCase() === url.toLowerCase()
    );
}

// 生成唯一ID
function generateUniqueId() {
    if (softwareData.length === 0) return 1;
    
    const existingIds = new Set(softwareData.map(item => item.id));
    let newId = Math.max(...softwareData.map(item => item.id)) + 1;
    
    // 确保ID是唯一的
    while (existingIds.has(newId)) {
        newId++;
    }
    return newId;
}

// 验证URL格式
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// 验证必需字段
function validateRequiredFields(item) {
    const requiredFields = ['name', 'url', 'category', 'type'];
    const missingFields = [];
    
    for (const field of requiredFields) {
        if (!item[field] || item[field].toString().trim() === '') {
            missingFields.push(field);
        }
    }
    
    if (missingFields.length > 0) {
        throw new Error(`缺少必需字段: ${missingFields.join(', ')}`);
    }
    
    return true;
}

// 验证数据格式
function validateDataFormat(item) {
    // 验证名称
    if (typeof item.name !== 'string' || item.name.trim().length === 0) {
        throw new Error('名称必须是有效的字符串');
    }
    
    // 验证URL
    if (typeof item.url !== 'string' || !isValidUrl(item.url)) {
        throw new Error('URL必须是有效的链接');
    }
    
    // 验证描述（可选）
    if (item.description && typeof item.description !== 'string') {
        throw new Error('描述必须是字符串');
    }
    
    // 验证分类
    if (typeof item.category !== 'string') {
        throw new Error('分类必须是字符串');
    }
    
    // 验证类型
    if (!['software', 'website'].includes(item.type)) {
        throw new Error('类型必须是 "software" 或 "website"');
    }
    
    // 验证标签
    if (item.tags) {
        if (!Array.isArray(item.tags)) {
            throw new Error('标签必须是数组');
        }
        for (const tag of item.tags) {
            if (typeof tag !== 'string') {
                throw new Error('每个标签必须是字符串');
            }
        }
    }
    
    // 验证popular字段
    if (item.popular !== undefined && typeof item.popular !== 'boolean') {
        // 尝试转换为布尔值
        if (typeof item.popular === 'string') {
            const normalized = item.popular.toLowerCase();
            if (!['true', 'false', '1', '0'].includes(normalized)) {
                throw new Error('popular字段必须是布尔值或可转换为布尔值的字符串');
            }
        } else if (typeof item.popular === 'number') {
            if (item.popular !== 0 && item.popular !== 1) {
                throw new Error('popular字段必须是0或1');
            }
        } else {
            throw new Error('popular字段必须是布尔值');
        }
    }
    
    return true;
}

// 清理和标准化数据
function cleanAndNormalizeData(item, isImport = false) {
    const cleanedItem = { ...item };
    
    // 清理字符串字段
    cleanedItem.name = cleanedItem.name ? cleanedItem.name.toString().trim() : '';
    cleanedItem.url = cleanedItem.url ? cleanedItem.url.toString().trim() : '';
    cleanedItem.description = cleanedItem.description ? cleanedItem.description.toString().trim() : '';
    cleanedItem.category = cleanedItem.category ? cleanedItem.category.toString().trim() : 'other';
    cleanedItem.type = cleanedItem.type ? cleanedItem.type.toString().trim() : 'website';
    
    // 处理icon和iconColor
    cleanedItem.icon = cleanedItem.icon ? cleanedItem.icon.toString().trim() : 'fas fa-globe';
    cleanedItem.iconColor = cleanedItem.iconColor ? cleanedItem.iconColor.toString().trim() : '#000000';
    
    // 处理popular字段
    if (typeof cleanedItem.popular === 'string') {
        const lower = cleanedItem.popular.toLowerCase();
        cleanedItem.popular = lower === 'true' || lower === '1';
    } else if (typeof cleanedItem.popular === 'number') {
        cleanedItem.popular = cleanedItem.popular === 1;
    } else if (cleanedItem.popular === undefined) {
        cleanedItem.popular = false;
    }
    
    // 处理tags
    if (!cleanedItem.tags || !Array.isArray(cleanedItem.tags)) {
        cleanedItem.tags = [];
    } else {
        // 清理每个标签
        cleanedItem.tags = cleanedItem.tags
            .map(tag => tag.toString().trim())
            .filter(tag => tag.length > 0);
    }
    
    // 如果是导入，确保ID有效
    if (isImport) {
        let id = cleanedItem.id;
        if (!id || typeof id !== 'number' || id <= 0 || !Number.isInteger(id)) {
            id = generateUniqueId();
        }
        cleanedItem.id = id;
    }
    
    return cleanedItem;
}

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
        
        // 验证和清理数据
        const validatedData = [];
        const invalidItems = [];
        
        for (let i = 0; i < data.length; i++) {
            try {
                const item = data[i];
                
                // 验证必需字段
                validateRequiredFields(item);
                
                // 验证数据格式
                validateDataFormat(item);
                
                // 清理和标准化数据
                const cleanedItem = cleanAndNormalizeData(item);
                
                // 检查唯一性（在验证后的数据中）
                const duplicate = validatedData.find(existing => 
                    existing.name.toLowerCase() === cleanedItem.name.toLowerCase() || 
                    existing.url.toLowerCase() === cleanedItem.url.toLowerCase()
                );
                
                if (duplicate) {
                    invalidItems.push({
                        index: i + 1,
                        item: cleanedItem.name,
                        reason: `与"${duplicate.name}"重复（名称或URL相同）`
                    });
                    continue;
                }
                
                validatedData.push(cleanedItem);
            } catch (error) {
                invalidItems.push({
                    index: i + 1,
                    item: data[i]?.name || '未知项目',
                    reason: error.message
                });
            }
        }
        
        // 保存软件数据
        softwareData = validatedData;
        
        console.log(`成功加载 ${softwareData.length} 个项目数据`);
        
        if (invalidItems.length > 0) {
            console.warn(`${invalidItems.length} 个项目验证失败:`, invalidItems);
            showNotification(`加载完成，但有 ${invalidItems.length} 个项目验证失败，已跳过`, 'warning');
        }
        
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
        // 隐藏分页控件
        const paginationControls = document.getElementById('paginationControls');
        if (paginationControls) {
            paginationControls.style.display = 'none';
        }
        return;
    }
    
    emptyTableState.style.display = 'none';
    
    // 计算分页信息
    totalPages = Math.ceil(softwareData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, softwareData.length);
    const paginatedData = softwareData.slice(startIndex, endIndex);
    
    // 渲染当前页的数据
    paginatedData.forEach((software, index) => {
        const actualIndex = startIndex + index;
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
            <td>${actualIndex + 1}</td>
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
    
    // 渲染分页控件
    renderPagination();
}

// 渲染分页控件
function renderPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        // 如果分页容器不存在，创建它
        createPaginationContainer();
        return;
    }
    
    // 如果只有一页，隐藏分页控件
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'block';
    
    let paginationHTML = `
        <div class="pagination-info">
            显示第 ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, softwareData.length)} 条，共 ${softwareData.length} 条记录
        </div>
        <div class="pagination-controls">
    `;
    
    // 上一页按钮
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})"><i class="fas fa-chevron-left"></i> 上一页</button>`;
    } else {
        paginationHTML += `<button class="pagination-btn disabled" disabled><i class="fas fa-chevron-left"></i> 上一页</button>`;
    }
    
    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 调整起始页码
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // 第一页
    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn ${currentPage === 1 ? 'active' : ''}" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // 中间页码
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active" onclick="changePage(${i})">${i}</button>`;
        } else {
            paginationHTML += `<button class="pagination-btn" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // 最后一页
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn ${currentPage === totalPages ? 'active' : ''}" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // 下一页按钮
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">下一页 <i class="fas fa-chevron-right"></i></button>`;
    } else {
        paginationHTML += `<button class="pagination-btn disabled" disabled>下一页 <i class="fas fa-chevron-right"></i></button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// 创建分页容器
function createPaginationContainer() {
    const tableContainer = document.querySelector('.software-table-container');
    if (!tableContainer) return;
    
    const paginationDiv = document.createElement('div');
    paginationDiv.id = 'paginationContainer';
    paginationDiv.className = 'pagination-container';
    tableContainer.parentNode.insertBefore(paginationDiv, tableContainer.nextSibling);
}

// 切换页面
function changePage(page) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    currentPage = page;
    renderSoftwareTable();
    
    // 滚动到表格顶部
    document.querySelector('.software-table-container').scrollIntoView({ behavior: 'smooth' });
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
        'study': '学习',
        'game': '游戏',
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
        showNotification('未找到该项目', 'error');
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
    softwareTypeInput.value = software.type || 'software';
    softwareIconInput.value = software.icon || 'fas fa-cube';
    softwareIconColorInput.value = software.iconColor || '#2575fc';
    
    // 改进popular字段处理
    const normalizedPopular = normalizePopularValue(software.popular);
    softwarePopularInput.checked = normalizedPopular;
    
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
        id: editMode ? currentEditId : generateUniqueId(),
        name: softwareNameInput.value.trim(),
        url: softwareUrlInput.value.trim(),
        description: softwareDescInput.value.trim(),
        category: softwareCategoryInput.value,
        type: softwareTypeInput.value,
        icon: softwareIconInput.value.trim(),
        iconColor: softwareIconColorInput.value,
        popular: softwarePopularInput.checked, // 直接使用复选框状态
        tags: softwareTagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    };
    
    try {
        // 验证数据
        validateRequiredFields(formData);
        validateDataFormat(formData);
        
        if (!isValidUrl(formData.url)) {
            throw new Error('请输入有效的URL链接（必须以http://或https://开头）');
        }
        
        // 检查项目是否已存在
        const existingItem = getExistingSoftware(formData.name, formData.url);
        if (existingItem && (editMode ? existingItem.id !== formData.id : true)) {
            throw new Error(`项目已存在（现有分类：${getCategoryDisplayName(existingItem.category)}）`);
        }
        
        // 清理和标准化数据
        const cleanedData = cleanAndNormalizeData(formData);
        
        if (editMode) {
            // 更新现有项目
            const index = softwareData.findIndex(item => item.id === cleanedData.id);
            if (index !== -1) {
                softwareData[index] = cleanedData;
                showNotification('项目更新成功', 'success');
            }
        } else {
            // 添加新项目
            softwareData.push(cleanedData);
            showNotification('项目添加成功', 'success');
        }
        
        // 保存到data.json文件
        saveToDataFile();
        
        // 更新UI
        updateStats();
        renderSoftwareTable();
        
        // 关闭模态框
        closeSoftwareModal();
        
    } catch (error) {
        showNotification(error.message, 'error');
        return;
    }
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

// 处理导入的数据（改进版）
function processImportedData(jsonData) {
    // 验证数据格式
    if (!Array.isArray(jsonData)) {
        throw new Error('导入的数据应该是一个JSON数组');
    }
    
    const validItems = [];
    const duplicateItems = [];
    const invalidItems = [];
    const fixedItems = [];
    
    // 用于跟踪已使用的ID和URL
    const existingIds = new Set(softwareData.map(item => item.id));
    const existingUrls = new Set(softwareData.map(item => item.url.toLowerCase()));
    const existingNames = new Set(softwareData.map(item => item.name.toLowerCase()));
    
    // 用于跟踪导入数据中的ID，避免内部重复
    const importedIds = new Set();
    
    for (let i = 0; i < jsonData.length; i++) {
        const rawItem = jsonData[i];
        
        try {
            // 验证必需字段
            validateRequiredFields(rawItem);
            
            // 验证数据格式
            validateDataFormat(rawItem);
            
            // 清理和标准化数据
            const cleanedItem = cleanAndNormalizeData(rawItem, true);
            
            // 检查ID唯一性（避免导入数据内部重复）
            if (importedIds.has(cleanedItem.id)) {
                // ID重复，生成新ID
                cleanedItem.id = generateUniqueId();
                fixedItems.push({
                    name: cleanedItem.name,
                    originalId: rawItem.id,
                    newId: cleanedItem.id,
                    reason: 'ID重复'
                });
            }
            importedIds.add(cleanedItem.id);
            
            // 检查是否合并数据
            const isMerging = mergeDataCheckbox.checked;
            
            if (isMerging) {
                // 合并模式：检查是否已存在
                const isDuplicate = softwareData.some(existing => 
                    existing.name.toLowerCase() === cleanedItem.name.toLowerCase() || 
                    existing.url.toLowerCase() === cleanedItem.url.toLowerCase()
                );
                
                if (isDuplicate) {
                    const duplicate = softwareData.find(existing => 
                        existing.name.toLowerCase() === cleanedItem.name.toLowerCase() || 
                        existing.url.toLowerCase() === cleanedItem.url.toLowerCase()
                    );
                    duplicateItems.push({
                        name: cleanedItem.name,
                        reason: duplicate.name === cleanedItem.name ? 
                            `名称与现有项目"${duplicate.name}"重复` : 
                            `URL与现有项目"${duplicate.name}"重复`
                    });
                    continue;
                }
                
                // 检查ID是否冲突
                if (existingIds.has(cleanedItem.id)) {
                    // ID冲突，生成新ID
                    cleanedItem.id = generateUniqueId();
                    fixedItems.push({
                        name: cleanedItem.name,
                        originalId: rawItem.id,
                        newId: cleanedItem.id,
                        reason: '与现有项目ID冲突'
                    });
                }
            }
            
            validItems.push(cleanedItem);
            
        } catch (error) {
            invalidItems.push({
                index: i + 1,
                name: rawItem.name || '未知项目',
                reason: error.message
            });
        }
    }
    
    // 显示验证结果
    if (invalidItems.length > 0) {
        const errorMsg = `${invalidItems.length} 个项目数据无效：\n` + 
            invalidItems.slice(0, 5).map(item => 
                `第 ${item.index} 项 "${item.name}": ${item.reason}`
            ).join('\n');
        if (invalidItems.length > 5) {
            errorMsg += `\n... 还有 ${invalidItems.length - 5} 个错误`;
        }
        showNotification(errorMsg, 'error');
    }
    
    if (duplicateItems.length > 0) {
        const duplicateMsg = `${duplicateItems.length} 个重复项目已跳过：\n` + 
            duplicateItems.slice(0, 5).map(item => 
                `"${item.name}" (${item.reason})`
            ).join('\n');
        if (duplicateItems.length > 5) {
            duplicateMsg += `\n... 还有 ${duplicateItems.length - 5} 个重复项目`;
        }
        showNotification(duplicateMsg, 'warning');
    }
    
    if (fixedItems.length > 0) {
        const fixedMsg = `${fixedItems.length} 个项目已修复：\n` + 
            fixedItems.slice(0, 3).map(item => 
                `"${item.name}": ID ${item.originalId} -> ${item.newId} (${item.reason})`
            ).join('\n');
        if (fixedItems.length > 3) {
            fixedMsg += `\n... 还有 ${fixedItems.length - 3} 个项目已修复`;
        }
        showNotification(fixedMsg, 'info');
    }
    
    if (validItems.length === 0) {
        const totalFailed = invalidItems.length + duplicateItems.length;
        showNotification(`导入失败：所有 ${totalFailed} 个项目都无法导入`, 'error');
        return;
    }
    
    // 处理数据合并或替换
    let importMessage = '';
    if (mergeDataCheckbox.checked && softwareData.length > 0) {
        // 合并数据
        softwareData = softwareData.concat(validItems);
        importMessage = `成功导入 ${validItems.length} 个项目（合并数据）`;
    } else {
        // 替换数据
        softwareData = validItems;
        importMessage = `成功导入 ${validItems.length} 个项目（替换数据）`;
    }
    
    // 添加统计信息
    if (invalidItems.length > 0 || duplicateItems.length > 0 || fixedItems.length > 0) {
        importMessage += `\n处理详情：`;
        if (invalidItems.length > 0) {
            importMessage += ` ${invalidItems.length} 个无效`;
        }
        if (duplicateItems.length > 0) {
            importMessage += ` ${duplicateItems.length} 个重复`;
        }
        if (fixedItems.length > 0) {
            importMessage += ` ${fixedItems.length} 个已修复`;
        }
    }
    
    showNotification(importMessage, 'success');
    
    // 保存到data.json文件
    saveToDataFile();
    
    // 更新UI
    updateStats();
    renderSoftwareTable();
    
    // 关闭模态框
    closeImportModalFunc();
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
        iconValue = 'fas fa-globe';
        backgroundColor = backgroundColor || '#2575fc';
    }
    
    // 处理可能的null或undefined
    backgroundColor = backgroundColor || '#2575fc';
    
    // 判断是否为URL
    if (typeof iconValue === 'string' && 
        (iconValue.startsWith('http://') || iconValue.startsWith('https://'))) {
        return `
            <div class="table-icon table-icon-image" style="background-color: ${backgroundColor}">
                <img src="${iconValue}" alt="图标" 
                     onerror="this.onerror=null; this.style.display='none';
                              this.parentElement.innerHTML='<i class=\"fas fa-image\"></i>'">
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

// 标准化popular字段值
function normalizePopularValue(value) {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    if (value === 1 || value === '1') {
        return true;
    }
    if (value === 0 || value === '0') {
        return false;
    }
    // 默认返回false
    return false;
}
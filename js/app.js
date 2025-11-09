// 主应用逻辑
class NewsApp {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchTerm = '';
        
        this.init();
    }
    
    init() {
        // 初始化数据
        DataManager.initializeMockData();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 加载初始数据
        this.loadNews();
        this.updateStats();
    }
    
    setupEventListeners() {
        // 过滤器变化
        document.getElementById('filter').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.currentPage = 1;
            this.loadNews();
        });
        
        // 页面大小变化
        document.getElementById('pageSize').addEventListener('change', (e) => {
            this.pageSize = parseInt(e.target.value);
            this.currentPage = 1;
            this.loadNews();
        });
        
        // 排序方式变化
        document.getElementById('sortBy').addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.loadNews();
        });
        
        // 搜索功能
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', Utils.debounce((e) => {
            this.searchTerm = e.target.value.trim();
            this.currentPage = 1;
            this.loadNews();
        }, 300));
        
        // 添加新闻按钮
        document.getElementById('add-news-btn').addEventListener('click', () => {
            this.showNewsModal();
        });
        
        // 模态框关闭
        document.getElementById('close-modal').addEventListener('click', () => {
            this.hideNewsModal();
        });
        
        document.getElementById('cancel-news').addEventListener('click', () => {
            this.hideNewsModal();
        });
        
        // 新闻表单提交
        document.getElementById('news-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitNews();
        });
        
        // 点击模态框背景关闭
        document.getElementById('news-modal').addEventListener('click', (e) => {
            if (e.target.id === 'news-modal') {
                this.hideNewsModal();
            }
        });
    }
    
    loadNews() {
        this.showLoading();
        
        // 模拟网络延迟
        setTimeout(() => {
            const allNews = DataManager.getAllNews();
            let filteredNews = this.filterNews(allNews);
            filteredNews = this.sortNews(filteredNews);
            
            const totalItems = filteredNews.length;
            const totalPages = Math.ceil(totalItems / this.pageSize);
            
            // 确保当前页在有效范围内
            if (this.currentPage > totalPages && totalPages > 0) {
                this.currentPage = totalPages;
            }
            
            const startIndex = (this.currentPage - 1) * this.pageSize;
            const paginatedNews = filteredNews.slice(startIndex, startIndex + this.pageSize);
            
            this.displayNews(paginatedNews);
            this.displayPagination(totalPages);
            this.hideLoading();
            
            if (totalItems === 0) {
                this.showEmptyState();
            } else {
                this.hideEmptyState();
            }
        }, 500);
    }
    
    filterNews(news) {
        let filtered = news;
        
        // 应用类型过滤
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(item => item.status === this.currentFilter);
        }
        
        // 应用搜索过滤
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(item => 
                item.topic.toLowerCase().includes(term) ||
                item.shortDetail.toLowerCase().includes(term) ||
                item.fullDetail.toLowerCase().includes(term) ||
                item.reporter.toLowerCase().includes(term)
            );
        }
        
        return filtered;
    }
    
    sortNews(news) {
        const sorted = [...news];
        
        switch (this.currentSort) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'most-votes':
                return sorted.sort((a, b) => b.totalVotes - a.totalVotes);
            default:
                return sorted;
        }
    }
    
    displayNews(newsArray) {
        const newsList = document.getElementById('news-list');
        
        if (newsArray.length === 0) {
            newsList.innerHTML = '';
            return;
        }
        
        const newsHTML = newsArray.map(news => this.createNewsCard(news)).join('');
        newsList.innerHTML = newsHTML;
    }
    
    createNewsCard(news) {
        const statusText = {
            'fake': '❌ 假新闻',
            'not-fake': '✅ 已验证',
            'pending': '⏳ 投票中'
        };
        
        const statusClass = {
            'fake': 'fake',
            'not-fake': 'not-fake',
            'pending': 'pending'
        };
        
        return `
            <div class="news-card">
                <div class="news-card-header">
                    <h3 class="news-topic">
                        <a href="news-detail.html?id=${news.id}">${Utils.escapeHtml(news.topic)}</a>
                    </h3>
                </div>
                <div class="news-card-body">
                    <p class="news-short-detail">${Utils.escapeHtml(news.shortDetail)}</p>
                    <div class="news-meta">
                        <span class="status-badge ${statusClass[news.status]}">
                            ${statusText[news.status]}
                        </span>
                        <span><i class="fas fa-user"></i> 记者: ${Utils.escapeHtml(news.reporter)}</span>
                        <span><i class="fas fa-clock"></i> ${Utils.formatDate(news.date)}</span>
                    </div>
                </div>
                <div class="news-card-footer">
                    <div class="vote-summary">
                        <span class="vote-count not-fake">
                            <i class="fas fa-check"></i> ${news.notFakeVotes}
                        </span>
                        <span class="vote-count fake">
                            <i class="fas fa-times"></i> ${news.fakeVotes}
                        </span>
                    </div>
                    <span class="news-date">${Utils.formatDate(news.date)}</span>
                </div>
            </div>
        `;
    }
    
    displayPagination(totalPages) {
        const pagination = document.getElementById('pagination');
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 上一页按钮
        paginationHTML += `
            <button onclick="app.goToPage(${this.currentPage - 1})" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button onclick="app.goToPage(${i})" 
                            class="${i === this.currentPage ? 'active' : ''}">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<span>...</span>`;
            }
        }
        
        // 下一页按钮
        paginationHTML += `
            <button onclick="app.goToPage(${this.currentPage + 1})" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    goToPage(page) {
        const allNews = DataManager.getAllNews();
        let filteredNews = this.filterNews(allNews);
        const totalPages = Math.ceil(filteredNews.length / this.pageSize);
        
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.loadNews();
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    showNewsModal() {
        document.getElementById('news-modal').classList.remove('hidden');
        document.getElementById('news-form').reset();
    }
    
    hideNewsModal() {
        document.getElementById('news-modal').classList.add('hidden');
    }
    
    submitNews() {
        const formData = {
            topic: document.getElementById('news-topic').value.trim(),
            shortDetail: document.getElementById('news-short-detail').value.trim(),
            fullDetail: document.getElementById('news-full-detail').value.trim(),
            reporter: document.getElementById('news-reporter').value.trim(),
            image: document.getElementById('news-image').value.trim()
        };
        
        // 简单验证
        if (!formData.topic || !formData.shortDetail || !formData.fullDetail || !formData.reporter) {
            Utils.showNotification('请填写所有必填字段', 'error');
            return;
        }
        
        if (formData.image && !Utils.isValidUrl(formData.image)) {
            Utils.showNotification('请输入有效的图片链接', 'error');
            return;
        }
        
        try {
            const newNews = DataManager.addNews(formData);
            Utils.showNotification('新闻提交成功！', 'success');
            this.hideNewsModal();
            this.loadNews();
            this.updateStats();
        } catch (error) {
            Utils.showNotification('提交失败，请重试', 'error');
            console.error('Error submitting news:', error);
        }
    }
    
    updateStats() {
        const stats = DataManager.getStats();
        
        document.getElementById('total-news').textContent = stats.total;
        document.getElementById('verified-news').textContent = stats.verified;
        document.getElementById('fake-news').textContent = stats.fake;
    }
    
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('news-list').classList.add('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('news-list').classList.remove('hidden');
    }
    
    showEmptyState() {
        document.getElementById('empty-state').classList.remove('hidden');
    }
    
    hideEmptyState() {
        document.getElementById('empty-state').classList.add('hidden');
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NewsApp();
});
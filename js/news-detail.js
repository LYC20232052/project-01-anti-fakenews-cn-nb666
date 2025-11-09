// 新闻详情页逻辑
class NewsDetail {
    constructor() {
        this.newsId = Utils.getUrlParam('id');
        this.currentCommentsPage = 1;
        this.commentsPageSize = 5;
        
        if (this.newsId) {
            this.init();
        } else {
            this.showError('未找到指定的新闻');
        }
    }
    
    init() {
        this.loadNewsDetail();
        this.loadComments();
        this.setupEventListeners();
    }
    
    loadNewsDetail() {
        const news = DataManager.getNewsById(this.newsId);
        
        if (!news) {
            this.showError('新闻不存在');
            return;
        }
        
        this.displayNewsDetail(news);
        this.updateVoteLink();
    }
    
    displayNewsDetail(news) {
        const detailContainer = document.getElementById('news-detail');
        
        const statusText = {
            'fake': '❌ 假新闻',
            'not-fake': '✅ 已验证新闻',
            'pending': '⏳ 投票中'
        };
        
        const statusClass = {
            'fake': 'fake',
            'not-fake': 'not-fake',
            'pending': 'pending'
        };
        
        const imageHTML = news.image && Utils.isValidUrl(news.image) 
            ? `<div class="detail-image">
                   <img src="${news.image}" alt="${Utils.escapeHtml(news.topic)}" onerror="this.style.display='none'">
               </div>`
            : '';
        
        detailContainer.innerHTML = `
            <div class="detail-header">
                <h1 class="detail-topic">${Utils.escapeHtml(news.topic)}</h1>
                <div class="detail-meta">
                    <span class="meta-item status-badge ${statusClass[news.status]}">
                        ${statusText[news.status]}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-user"></i> ${Utils.escapeHtml(news.reporter)}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-clock"></i> ${Utils.formatDate(news.date)}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-chart-bar"></i> ${news.totalVotes} 票
                    </span>
                </div>
            </div>
            <div class="detail-body">
                ${imageHTML}
                <div class="detail-full">
                    ${Utils.escapeHtml(news.fullDetail).replace(/\n/g, '<br>')}
                </div>
                <div class="vote-results">
                    <h4><i class="fas fa-poll"></i> 当前投票结果</h4>
                    <div class="results-grid">
                        <div class="result-item real-votes">
                            <div class="result-label">
                                <i class="fas fa-check"></i>
                                <span>真实票数</span>
                            </div>
                            <div class="result-bar">
                                <div class="bar-fill" style="width: ${(news.notFakeVotes / news.totalVotes) * 100 || 0}%"></div>
                            </div>
                            <div class="result-count">${news.notFakeVotes}</div>
                        </div>
                        <div class="result-item fake-votes">
                            <div class="result-label">
                                <i class="fas fa-times"></i>
                                <span>假新闻票数</span>
                            </div>
                            <div class="result-bar">
                                <div class="bar-fill" style="width: ${(news.fakeVotes / news.totalVotes) * 100 || 0}%"></div>
                            </div>
                            <div class="result-count">${news.fakeVotes}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateVoteLink() {
        const voteLink = document.getElementById('vote-link');
        if (voteLink) {
            voteLink.href = `vote-comment.html?id=${this.newsId}`;
        }
    }
    
    loadComments() {
        const comments = DataManager.getComments(this.newsId);
        const totalComments = comments.length;
        
        document.getElementById('comments-count').textContent = `${totalComments} 条评论`;
        
        if (totalComments === 0) {
            this.showNoComments();
            return;
        }
        
        this.hideNoComments();
        
        const totalPages = Math.ceil(totalComments / this.commentsPageSize);
        const startIndex = (this.currentCommentsPage - 1) * this.commentsPageSize;
        const paginatedComments = comments.slice(startIndex, startIndex + this.commentsPageSize);
        
        this.displayComments(paginatedComments);
        this.displayCommentsPagination(totalPages);
    }
    
    displayComments(comments) {
        const commentsList = document.getElementById('comments-list');
        
        const commentsHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-vote ${comment.vote}">
                        <i class="fas fa-${comment.vote === 'not-fake' ? 'check' : 'times'}"></i>
                        ${comment.vote === 'not-fake' ? '认为是真实新闻' : '认为是假新闻'}
                    </span>
                    <span class="comment-date">${Utils.formatDate(comment.date)}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
                ${comment.evidence ? `
                    <div class="comment-evidence">
                        <a href="${comment.evidence}" target="_blank" class="evidence-link">
                            <i class="fas fa-link"></i> 查看证据链接
                        </a>
                    </div>
                ` : ''}
                <div class="comment-author">— ${comment.author}</div>
            </div>
        `).join('');
        
        commentsList.innerHTML = commentsHTML;
    }
    
    displayCommentsPagination(totalPages) {
        const paginationContainer = document.getElementById('comments-pagination');
        
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination">';
        
        // 上一页按钮
        paginationHTML += `
            <button onclick="newsDetail.goToCommentsPage(${this.currentCommentsPage - 1})" 
                    ${this.currentCommentsPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button onclick="newsDetail.goToCommentsPage(${i})" 
                        class="${i === this.currentCommentsPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }
        
        // 下一页按钮
        paginationHTML += `
            <button onclick="newsDetail.goToCommentsPage(${this.currentCommentsPage + 1})" 
                    ${this.currentCommentsPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
    }
    
    goToCommentsPage(page) {
        const comments = DataManager.getComments(this.newsId);
        const totalPages = Math.ceil(comments.length / this.commentsPageSize);
        
        if (page >= 1 && page <= totalPages) {
            this.currentCommentsPage = page;
            this.loadComments();
            
            // 滚动到评论区域
            document.getElementById('comments-list').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    showNoComments() {
        document.getElementById('no-comments').classList.remove('hidden');
        document.getElementById('comments-list').classList.add('hidden');
        document.getElementById('comments-pagination').classList.add('hidden');
    }
    
    hideNoComments() {
        document.getElementById('no-comments').classList.add('hidden');
        document.getElementById('comments-list').classList.remove('hidden');
        document.getElementById('comments-pagination').classList.remove('hidden');
    }
    
    showError(message) {
        const detailContainer = document.getElementById('news-detail');
        detailContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>${message}</h3>
                <p>请返回首页选择其他新闻</p>
                <a href="index.html" class="btn-primary">返回首页</a>
            </div>
        `;
    }
    
    setupEventListeners() {
        // 可以添加其他事件监听器
    }
}

// 初始化新闻详情页
let newsDetail;
document.addEventListener('DOMContentLoaded', () => {
    newsDetail = new NewsDetail();
});
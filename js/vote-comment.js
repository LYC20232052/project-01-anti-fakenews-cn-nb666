// 投票评论页逻辑
class VoteComment {
    constructor() {
        this.newsId = Utils.getUrlParam('id');
        
        if (this.newsId) {
            this.init();
        } else {
            this.showError('未找到指定的新闻');
        }
    }
    
    init() {
        this.loadNewsPreview();
        this.setupEventListeners();
        this.updateCurrentResults();
        
        // 检查用户是否已投票
        if (DataManager.hasUserVoted(this.newsId)) {
            this.disableVoting();
        }
    }
    
    loadNewsPreview() {
        const news = DataManager.getNewsById(this.newsId);
        
        if (!news) {
            this.showError('新闻不存在');
            return;
        }
        
        this.displayNewsPreview(news);
    }
    
    displayNewsPreview(news) {
        const previewContainer = document.getElementById('news-preview');
        
        previewContainer.innerHTML = `
            <h3 class="preview-topic">${Utils.escapeHtml(news.topic)}</h3>
            <div class="preview-detail">${Utils.escapeHtml(news.shortDetail)}</div>
            <div class="preview-meta">
                <span><i class="fas fa-user"></i> 记者: ${Utils.escapeHtml(news.reporter)}</span>
                <span><i class="fas fa-clock"></i> 发布时间: ${Utils.formatDate(news.date)}</span>
                <span><i class="fas fa-chart-bar"></i> 总投票数: ${news.totalVotes}</span>
            </div>
        `;
    }
    
    setupEventListeners() {
        // 表单提交
        document.getElementById('vote-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitVote();
        });
        
        // 评论字符计数
        const commentText = document.getElementById('comment-text');
        const charCounter = document.getElementById('char-counter');
        
        commentText.addEventListener('input', () => {
            const count = commentText.value.length;
            charCounter.textContent = count;
            
            if (count > 500) {
                charCounter.style.color = '#e74c3c';
            } else if (count > 400) {
                charCounter.style.color = '#f39c12';
            } else {
                charCounter.style.color = '#7f8c8d';
            }
        });
        
        // 实时更新字符计数
        commentText.dispatchEvent(new Event('input'));
    }
    
    submitVote() {
        const formData = new FormData(document.getElementById('vote-form'));
        const vote = formData.get('vote');
        const comment = document.getElementById('comment-text').value.trim();
        const evidence = document.getElementById('evidence-link').value.trim();
        
        // 验证投票选择
        if (!vote) {
            Utils.showNotification('请选择您认为这条新闻是真实还是虚假', 'error');
            return;
        }
        
        // 验证评论长度（如果提供了评论）
        if (comment && comment.length < 10) {
            Utils.showNotification('评论内容至少需要10个字符', 'error');
            return;
        }
        
        // 验证证据链接（如果提供了链接）
        if (evidence && !Utils.isValidUrl(evidence)) {
            Utils.showNotification('请输入有效的证据链接', 'error');
            return;
        }
        
        try {
            // 保存用户投票
            DataManager.saveUserVote(this.newsId, vote);
            
            // 添加评论（如果有）
            if (comment || evidence) {
                DataManager.addComment({
                    newsId: this.newsId,
                    vote: vote,
                    text: comment,
                    evidence: evidence
                });
            } else {
                // 如果没有评论，只更新投票数
                DataManager.updateNewsVotes(this.newsId, vote);
            }
            
            Utils.showNotification('投票提交成功！感谢您的参与', 'success');
            this.disableVoting();
            this.updateCurrentResults();
            
            // 3秒后返回新闻详情页
            setTimeout(() => {
                window.location.href = `news-detail.html?id=${this.newsId}`;
            }, 2000);
            
        } catch (error) {
            Utils.showNotification('提交失败，请重试', 'error');
            console.error('Error submitting vote:', error);
        }
    }
    
    updateCurrentResults() {
        const news = DataManager.getNewsById(this.newsId);
        if (!news) return;
        
        const realCount = news.notFakeVotes;
        const fakeCount = news.fakeVotes;
        const totalVotes = news.totalVotes;
        
        // 更新计数显示
        document.getElementById('real-count').textContent = realCount;
        document.getElementById('fake-count').textContent = fakeCount;
        
        // 更新进度条
        const realPercentage = totalVotes > 0 ? (realCount / totalVotes) * 100 : 0;
        const fakePercentage = totalVotes > 0 ? (fakeCount / totalVotes) * 100 : 0;
        
        document.getElementById('real-bar').style.width = `${realPercentage}%`;
        document.getElementById('fake-bar').style.width = `${fakePercentage}%`;
        
        // 更新状态显示
        let statusText = '状态：投票中';
        if (totalVotes >= 10) {
            if (fakeCount / totalVotes > 0.7) {
                statusText = '状态：已被标记为假新闻';
            } else if (realCount / totalVotes > 0.7) {
                statusText = '状态：已被验证为真实新闻';
            }
        }
        
        document.getElementById('current-status').textContent = statusText;
    }
    
    disableVoting() {
        const form = document.getElementById('vote-form');
        const inputs = form.querySelectorAll('input, textarea, button');
        
        inputs.forEach(input => {
            input.disabled = true;
        });
        
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.innerHTML = '<i class="fas fa-check"></i> 已投票';
            submitButton.style.background = '#95a5a6';
        }
        
        Utils.showNotification('您已经对此新闻投过票了', 'info');
    }
    
    showError(message) {
        const container = document.querySelector('.container');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>${message}</h3>
                <p>请返回首页选择其他新闻进行投票</p>
                <a href="index.html" class="btn-primary">返回首页</a>
            </div>
        `;
    }
}

// 初始化投票评论页
let voteComment;
document.addEventListener('DOMContentLoaded', () => {
    voteComment = new VoteComment();
});
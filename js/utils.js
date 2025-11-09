// 工具函数库
class Utils {
    // 格式化日期
    static formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // 秒数差
        
        if (diff < 60) {
            return '刚刚';
        } else if (diff < 3600) {
            return `${Math.floor(diff / 60)}分钟前`;
        } else if (diff < 86400) {
            return `${Math.floor(diff / 3600)}小时前`;
        } else if (diff < 2592000) {
            return `${Math.floor(diff / 86400)}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }
    
    // 生成唯一ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // 安全HTML转义
    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // 验证URL
    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    // 获取URL参数
    static getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }
    
    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // 显示通知
    static showNotification(message, type = 'info') {
        // 移除现有通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation' : 'info'}-circle"></i>
                <span>${message}</span>
            </div>
        `;
        
        // 添加通知样式
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    border-left: 4px solid #3498db;
                    animation: slideIn 0.3s ease;
                }
                .notification-success { border-left-color: #27ae60; }
                .notification-error { border-left-color: #e74c3c; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}

// 数据管理类
class DataManager {
    static STORAGE_KEYS = {
        NEWS: 'newsData',
        COMMENTS: 'commentsData',
        VOTES: 'userVotes'
    };
    
    // 初始化模拟数据
    static initializeMockData() {
        if (!localStorage.getItem(this.STORAGE_KEYS.NEWS)) {
            const mockNews = [
                {
                    id: 'news_001',
                    topic: '科学家发现新型新冠病毒变种，传播速度更快但症状更轻',
                    shortDetail: '国际研究团队发现名为XB-25的新冠病毒新变种，传播力增强但致病性减弱，相关研究已发表于《医学研究杂志》。',
                    fullDetail: '在最近发表于《医学研究杂志》的一项研究中，来自多个国家的科学家团队发现了一种新的新冠病毒变种，命名为XB-25。该变种展现出更强的传播能力，初步数据显示其基本传染数(R0)比当前主要变种高出约30%。然而，令人欣慰的是，现有证据表明XB-25引起的症状相对较轻，住院率显著降低。研究团队对全球15个国家的超过10,000名患者进行了跟踪观察，发现感染XB-25的患者主要出现类似普通感冒的症状。世界卫生组织已将该变种列入监测名单，但强调现有疫苗仍能提供有效保护。专家建议公众继续保持良好的个人卫生习惯，但无需过度恐慌。',
                    status: 'not-fake',
                    reporter: '全球健康观察',
                    date: '2024-01-15T14:30:00',
                    image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800',
                    fakeVotes: 23,
                    notFakeVotes: 156,
                    totalVotes: 179
                },
                {
                    id: 'news_002',
                    topic: '外星飞船降落在纽约中央公园，目击者提供照片证据',
                    shortDetail: '社交媒体流传多张据称显示外星飞船降落在中央公园的照片，但官方迅速否认了这一说法。',
                    fullDetail: '昨日晚间，多个社交媒体平台开始流传声称外星飞船降落在纽约中央公园的帖文。这些帖文附带了模糊的照片和视频，显示公园上空出现异常光点。发布者声称亲眼目睹了银色碟形物体缓慢降落在草坪上。然而，NASA和纽约市政府官员迅速发表声明，否认有任何外星生命访问的证据。官方解释称，这些光点很可能是商业无人机表演或是特殊的大气光学现象。警方表示已对相关区域进行检查，未发现任何异常。天文学家也指出，目前没有可靠的科学证据支持外星生命到访地球的说法。专家提醒公众对网络上的超自然现象报道保持理性判断。',
                    status: 'fake',
                    reporter: '未解之谜探索',
                    date: '2024-01-14T20:15:00',
                    image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
                    fakeVotes: 289,
                    notFakeVotes: 15,
                    totalVotes: 304
                },
                {
                    id: 'news_003',
                    topic: '新型AI技术可在30秒内诊断200种疾病，准确率达98%',
                    shortDetail: '科技公司宣称开发出革命性医疗AI，能够快速准确诊断多种疾病，引发医学界广泛关注。',
                    fullDetail: '一家名为MedTech AI的初创公司近日宣布，他们开发的人工智能系统能够在30秒内诊断出200多种常见疾病，声称准确率高达98%。该系统通过分析患者的症状描述、医疗历史和基本的实验室数据来做出诊断。公司展示了在10,000个测试病例中的表现，结果显示其诊断准确性与资深专科医生相当。然而，多位独立医学专家对此表示谨慎，指出虽然AI在医疗诊断方面确有潜力，但如此高的准确率需要更多独立验证。美国食品药品监督管理局表示正在评估该技术，强调任何医疗诊断工具都必须经过严格的临床验证才能投入使用。医学界普遍认为，AI应该作为医生的辅助工具而非替代品。',
                    status: 'pending',
                    reporter: '科技前沿报道',
                    date: '2024-01-13T09:45:00',
                    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
                    fakeVotes: 67,
                    notFakeVotes: 89,
                    totalVotes: 156
                },
                {
                    id: 'news_004',
                    topic: '研究发现每天喝咖啡可延长寿命，降低心脏病风险',
                    shortDetail: '大规模长期研究显示，适量饮用咖啡与寿命延长和心血管疾病风险降低存在关联。',
                    fullDetail: '一项涉及超过50万名参与者、持续跟踪20年的大规模研究发现，每天饮用2-4杯咖啡的人比不喝咖啡的人死亡风险降低12-18%。研究还发现，咖啡饮用者患心血管疾病、2型糖尿病和某些神经系统疾病的风险也显著降低。科学家认为咖啡中的抗氧化剂和其他生物活性化合物可能发挥了保护作用。然而，研究人员强调相关不等于因果，而且个体对咖啡因的代谢能力存在差异。专家建议，对大多数人来说适量饮用咖啡是安全的，但孕妇和某些特定健康状况的人群应当咨询医生。研究结果已发表在《新英格兰医学杂志》上。',
                    status: 'not-fake',
                    reporter: '健康生活周刊',
                    date: '2024-01-12T11:20:00',
                    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
                    fakeVotes: 34,
                    notFakeVotes: 203,
                    totalVotes: 237
                },
                {
                    id: 'news_005',
                    topic: '政府秘密计划在饮用水中添加追踪芯片控制人口',
                    shortDetail: '网络传言称政府计划在公共供水系统中添加微型芯片，引发民众担忧，官方严正否认。',
                    fullDetail: '近期在社交媒体和某些网站上流传的阴谋论声称，政府正在秘密计划在公共饮用水供应中添加微型追踪芯片，目的是监控和控制人口。这些传言通常引用所谓的"内部文件"和匿名消息来源，但从未提供任何可信证据。卫生部门和水务专家一致驳斥了这一说法，指出从技术角度讲，在庞大的供水系统中均匀分布微型芯片是不可行的，而且现有水处理工艺会过滤掉任何固体颗粒。多个独立事实核查组织已将此说法标记为完全虚假。法律专家提醒，传播此类虚假信息可能涉及法律责任。公众应当通过官方渠道获取信息，避免被不实传言误导。',
                    status: 'fake',
                    reporter: '真相调查员',
                    date: '2024-01-11T16:50:00',
                    image: 'https://images.unsplash.com/photo-1542736705-53e10c66d2e9?w=800',
                    fakeVotes: 312,
                    notFakeVotes: 28,
                    totalVotes: 340
                },
                {
                    id: 'news_006',
                    topic: '全球气温上升1.5°C阈值可能在未来五年内被突破',
                    shortDetail: '世界气象组织警告，全球气温有66%的可能性在2027年前暂时超过1.5°C的升温阈值。',
                    fullDetail: '根据世界气象组织(WMO)发布的最新报告，未来五年内至少有66%的可能性会出现某一年全球平均气温比工业化前水平高出1.5°C的情况。这是历史上首次如此接近《巴黎协定》设定的关键阈值。科学家强调，这并不意味着将永久超过1.5°C的限制，但确实发出了严重警告。报告指出，温室气体浓度持续上升和预期的厄尔尼诺现象共同推动了这一预测。气候专家表示，即使暂时超过阈值也意味着极端天气事件将更加频繁和强烈。各国需要大幅加速减排行动，才能将升温控制在相对安全的范围内。报告呼吁国际社会立即采取更积极的气候行动。',
                    status: 'not-fake',
                    reporter: '环境观察',
                    date: '2024-01-10T08:15:00',
                    image: 'https://images.unsplash.com/photo-1569163139394-de44cb54c05e?w=800',
                    fakeVotes: 45,
                    notFakeVotes: 178,
                    totalVotes: 223
                },
                {
                    id: 'news_007',
                    topic: '某品牌手机被曝会自动监听用户对话推送广告',
                    shortDetail: '网络安全研究人员声称发现某流行手机品牌通过麦克风监听用户对话来个性化广告。',
                    fullDetail: '一位自称网络安全研究员的人在个人博客中声称，通过逆向工程发现某国际知名手机品牌的操作系统会秘密激活麦克风，记录用户对话内容，然后用于推送个性化广告。该说法在社交媒体上迅速传播，引发用户隐私担忧。然而，该手机公司发表严正声明，完全否认这一指控，指出其操作系统有严格的隐私保护机制，任何麦克风访问都会明确提示用户。多位独立安全专家检查后表示，没有发现支持这一指控的技术证据。数据保护监管机构也表示正在关注此事，但截至目前没有发现违法行为。专家建议用户定期检查应用权限，使用正规渠道下载应用。',
                    status: 'pending',
                    reporter: '数字隐私守护者',
                    date: '2024-01-09T13:40:00',
                    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
                    fakeVotes: 134,
                    notFakeVotes: 98,
                    totalVotes: 232
                },
                {
                    id: 'news_008',
                    topic: '新型电池技术实现充电5分钟续航1000公里',
                    shortDetail: '科学家宣布开发出革命性固态电池，充电速度大幅提升，有望彻底改变电动汽车行业。',
                    fullDetail: '某大学研究团队在《自然·能源》杂志上发表论文，宣布开发出一种新型固态锂电池技术，能够在5分钟内充入足够电动汽车行驶1000公里的电量。与传统锂离子电池相比，这种电池使用固态电解质替代液态电解质，大大提高了安全性和能量密度。研究人员表示，实验室测试显示该电池在快速充电条件下仍能保持稳定的性能，循环寿命超过1000次。不过，产业专家指出，从实验室成果到商业化量产通常需要5-10年时间，且面临成本和生产工艺的挑战。主要汽车制造商已表示对此技术感兴趣，但强调需要更多独立验证。如果技术成熟，将极大缓解电动汽车用户的续航焦虑。',
                    status: 'not-fake',
                    reporter: '科技创新日报',
                    date: '2024-01-08T10:05:00',
                    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
                    fakeVotes: 56,
                    notFakeVotes: 145,
                    totalVotes: 201
                }
            ];
            localStorage.setItem(this.STORAGE_KEYS.NEWS, JSON.stringify(mockNews));
        }
        
        if (!localStorage.getItem(this.STORAGE_KEYS.COMMENTS)) {
            const mockComments = {
                'news_001': [
                    {
                        id: 'comment_001_1',
                        newsId: 'news_001',
                        vote: 'not-fake',
                        text: '这篇报道引用了权威期刊和研究数据，信息来源可靠，与当前科学界的认知一致。',
                        evidence: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2208343',
                        date: '2024-01-15T16:20:00',
                        author: '医学研究者'
                    },
                    {
                        id: 'comment_001_2',
                        newsId: 'news_001',
                        vote: 'fake',
                        text: '我觉得这个变种的名字很奇怪，之前没有听说过相关报道，可能是个别媒体的炒作。',
                        evidence: '',
                        date: '2024-01-15T18:45:00',
                        author: '谨慎的读者'
                    }
                ],
                'news_002': [
                    {
                        id: 'comment_002_1',
                        newsId: 'news_002',
                        vote: 'fake',
                        text: '照片明显是PS的，光影效果不自然，而且如果是真的，主流媒体肯定会大规模报道。',
                        evidence: 'https://fotoforensics.com/analysis.php',
                        date: '2024-01-14T21:30:00',
                        author: '图片分析专家'
                    },
                    {
                        id: 'comment_002_2',
                        newsId: 'news_002',
                        vote: 'not-fake',
                        text: '我朋友当时在中央公园，他也看到了奇怪的光点，官方可能在隐瞒真相。',
                        evidence: '',
                        date: '2024-01-15T09:15:00',
                        author: '纽约居民'
                    }
                ]
            };
            localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(mockComments));
        }
        
        if (!localStorage.getItem(this.STORAGE_KEYS.VOTES)) {
            localStorage.setItem(this.STORAGE_KEYS.VOTES, JSON.stringify({}));
        }
    }
    
    // 获取所有新闻
    static getAllNews() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.NEWS) || '[]');
    }
    
    // 根据ID获取新闻
    static getNewsById(id) {
        const news = this.getAllNews();
        return news.find(item => item.id === id);
    }
    
    // 保存新闻
    static saveNews(news) {
        const allNews = this.getAllNews();
        const existingIndex = allNews.findIndex(item => item.id === news.id);
        
        if (existingIndex >= 0) {
            allNews[existingIndex] = news;
        } else {
            allNews.unshift(news);
        }
        
        localStorage.setItem(this.STORAGE_KEYS.NEWS, JSON.stringify(allNews));
        return news;
    }
    
    // 添加新新闻
    static addNews(newsData) {
        const news = {
            ...newsData,
            id: Utils.generateId(),
            date: new Date().toISOString(),
            fakeVotes: 0,
            notFakeVotes: 0,
            totalVotes: 0,
            status: 'pending'
        };
        
        return this.saveNews(news);
    }
    
    // 获取新闻评论
    static getComments(newsId) {
        const allComments = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.COMMENTS) || '{}');
        return allComments[newsId] || [];
    }
    
    // 添加评论
    static addComment(commentData) {
        const { newsId, vote, text, evidence, author = '匿名用户' } = commentData;
        
        const comment = {
            id: Utils.generateId(),
            newsId,
            vote,
            text: Utils.escapeHtml(text),
            evidence: evidence && Utils.isValidUrl(evidence) ? evidence : '',
            author: Utils.escapeHtml(author),
            date: new Date().toISOString()
        };
        
        const allComments = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.COMMENTS) || '{}');
        if (!allComments[newsId]) {
            allComments[newsId] = [];
        }
        allComments[newsId].push(comment);
        
        localStorage.setItem(this.STORAGE_KEYS.COMMENTS, JSON.stringify(allComments));
        
        // 更新新闻投票数
        this.updateNewsVotes(newsId, vote);
        
        return comment;
    }
    
    // 更新新闻投票数
    static updateNewsVotes(newsId, vote) {
        const news = this.getNewsById(newsId);
        if (!news) return;
        
        if (vote === 'fake') {
            news.fakeVotes++;
        } else if (vote === 'not-fake') {
            news.notFakeVotes++;
        }
        
        news.totalVotes = news.fakeVotes + news.notFakeVotes;
        
        // 更新新闻状态（基于投票比例）
        const fakeRatio = news.fakeVotes / news.totalVotes;
        const notFakeRatio = news.notFakeVotes / news.totalVotes;
        
        if (news.totalVotes >= 10) {
            if (fakeRatio > 0.7) {
                news.status = 'fake';
            } else if (notFakeRatio > 0.7) {
                news.status = 'not-fake';
            } else {
                news.status = 'pending';
            }
        } else {
            news.status = 'pending';
        }
        
        this.saveNews(news);
    }
    
    // 获取用户投票记录
    static getUserVotes() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.VOTES) || '{}');
    }
    
    // 保存用户投票
    static saveUserVote(newsId, vote) {
        const userVotes = this.getUserVotes();
        userVotes[newsId] = vote;
        localStorage.setItem(this.STORAGE_KEYS.VOTES, JSON.stringify(userVotes));
    }
    
    // 检查用户是否已投票
    static hasUserVoted(newsId) {
        const userVotes = this.getUserVotes();
        return !!userVotes[newsId];
    }
    
    // 获取统计数据
    static getStats() {
        const allNews = this.getAllNews();
        const total = allNews.length;
        const verified = allNews.filter(news => news.status === 'not-fake').length;
        const fake = allNews.filter(news => news.status === 'fake').length;
        const pending = allNews.filter(news => news.status === 'pending').length;
        
        return { total, verified, fake, pending };
    }
}
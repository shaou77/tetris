// 滚动动画控制器
const animationController = {
    init() {
        // 初始化所有动画元素
        this.setupRevealElements();
        this.setupParallaxElements();
        this.setupScrollIndicator();
        
        // 绑定滚动事件
        window.addEventListener('scroll', () => this.onScroll());
        window.addEventListener('resize', () => this.onResize());
        
        // 初始触发一次滚动事件
        this.onScroll();
    },
    
    setupRevealElements() {
        // 获取所有需要显示的元素
        this.revealElements = document.querySelectorAll('.reveal');
    },
    
    setupParallaxElements() {
        // 设置视差滚动元素
        this.parallaxElements = document.querySelectorAll('.parallax');
        
        // 为每个视差元素添加初始样式
        this.parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.2;
            el.setAttribute('data-speed', speed);
            el.style.transition = 'transform 0.2s ease-out';
        });
    },
    
    setupScrollIndicator() {
        // 获取滚动指示器
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        
        // 添加点击事件，点击滚动到下一部分
        if (this.scrollIndicator) {
            this.scrollIndicator.addEventListener('click', () => {
                const nextSection = document.querySelector('section:nth-of-type(2)');
                if (nextSection) {
                    window.scrollTo({
                        top: nextSection.offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        }
    },
    
    onScroll() {
        // 处理元素显示动画
        this.handleRevealElements();
        
        // 处理视差滚动
        this.handleParallaxElements();
        
        // 处理滚动指示器
        this.handleScrollIndicator();
    },
    
    handleRevealElements() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        this.revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
                
                // 如果元素有延迟属性，应用延迟
                if (el.dataset.delay) {
                    el.style.transitionDelay = `${el.dataset.delay}s`;
                }
            }
        });
    },
    
    handleParallaxElements() {
        this.parallaxElements.forEach(el => {
            const scrollPosition = window.pageYOffset;
            const speed = parseFloat(el.dataset.speed);
            const yPos = -(scrollPosition * speed);
            
            el.style.transform = `translateY(${yPos}px)`;
        });
    },
    
    handleScrollIndicator() {
        if (!this.scrollIndicator) return;
        
        // 当页面滚动超过一定距离时隐藏滚动指示器
        if (window.pageYOffset > window.innerHeight * 0.5) {
            this.scrollIndicator.style.opacity = '0';
        } else {
            this.scrollIndicator.style.opacity = '1';
        }
    },
    
    onResize() {
        // 窗口大小改变时重新计算
        this.onScroll();
    }
};

// 图表控制器
const chartController = {
    init() {
        // 初始化图表
        this.initMainChart();
        this.initPopulationChart();
    },
    
    initMainChart() {
        const chartDom = document.getElementById('chart-container');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);
        
        const option = {
            backgroundColor: 'transparent',
            title: {
                text: '长沙近年发展数据',
                left: 'center',
                textStyle: {
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['GDP(亿元)', '城市人口(万人)', '游客数量(万人次)'],
                top: 30,
                textStyle: {
                    color: '#fff'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['2018', '2019', '2020', '2021', '2022'],
                axisLine: {
                    lineStyle: {
                        color: '#FF6B00'
                    }
                },
                axisLabel: {
                    color: '#fff'
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#FF6B00'
                    }
                },
                axisLabel: {
                    color: '#fff'
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(255, 107, 0, 0.1)'
                    }
                }
            },
            series: [
                {
                    name: 'GDP(亿元)',
                    type: 'bar',
                    data: [10535, 11574, 12142, 13497, 14450],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            {offset: 0, color: '#FF6B00'},
                            {offset: 1, color: 'rgba(255, 107, 0, 0.5)'}
                        ])
                    }
                },
                {
                    name: '城市人口(万人)',
                    type: 'line',
                    data: [815, 830, 842, 860, 878],
                    itemStyle: {
                        color: 'rgba(255, 107, 0, 0.7)'
                    },
                    lineStyle: {
                        color: 'rgba(255, 107, 0, 0.7)',
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                },
                {
                    name: '游客数量(万人次)',
                    type: 'line',
                    data: [15200, 16700, 12300, 14500, 16800],
                    itemStyle: {
                        color: '#fff'
                    },
                    lineStyle: {
                        color: '#fff',
                        width: 3
                    },
                    symbol: 'circle',
                    symbolSize: 8
                }
            ],
            // 添加动画效果
            animationEasing: 'elasticOut',
            animationDelayUpdate: function (idx) {
                return idx * 100;
            }
        };
        
        myChart.setOption(option);
        
        // 响应窗口大小变化
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    },
    
    initPopulationChart() {
        const chartDom = document.getElementById('population-chart');
        if (!chartDom) return;
        
        const myChart = echarts.init(chartDom);
        
        const option = {
            backgroundColor: 'transparent',
            title: {
                text: '长沙人口结构',
                left: 'center',
                textStyle: {
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            color: ['#FF6B00', 'rgba(255, 107, 0, 0.8)', 'rgba(255, 107, 0, 0.6)', 'rgba(255, 107, 0, 0.4)', '#ffffff'],
            series: [
                {
                    name: '人口结构',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderColor: '#000',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '18',
                            fontWeight: 'bold',
                            color: '#fff'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        {value: 38, name: '0-14岁'},
                        {value: 65, name: '15-44岁'},
                        {value: 30, name: '45-59岁'},
                        {value: 15, name: '60岁以上'},
                        {value: 2, name: '其他'}
                    ],
                    // 添加动画效果
                    animationType: 'scale',
                    animationEasing: 'elasticOut',
                    animationDelay: function (idx) {
                        return Math.random() * 200;
                    }
                }
            ]
        };
        
        myChart.setOption(option);
        
        // 响应窗口大小变化
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化动画控制器
    animationController.init();
    
    // 初始化图表控制器
    chartController.init();
    
    // 添加导航栏滚动效果
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
        });
    }
    
    // 为所有网格项添加鼠标悬停效果
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 10px 30px rgba(255, 107, 0, 0.3)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
});
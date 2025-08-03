// FachowiecApp - Kompletna aplikacja PWA z wszystkimi funkcjonalnościami
class FachowiecApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentDateRange = 'week';
        this.customDateFrom = null;
        this.customDateTo = null;
        this.charts = {};
        this.data = null;
        this.filteredData = null;
        this.orders = [];
        this.clients = [];
        this.photos = [];
        this.calculationHistory = [];
        this.timeLog = [];
        this.currentTheme = 'auto';
        this.editingOrderId = null;
        this.editingClientId = null;
        this.currentTimer = null;
        this.timerInterval = null;
        this.timerStartTime = null;
        this.timerPausedTime = 0;
        
        // Dane firmowe dla faktur
        this.companySettings = {
            name: "Fachowiec Pro",
            address: "ul. Budowlana 15, 00-001 Warszawa",
            phone: "+48 123 456 789",
            email: "kontakt@fachowiecpro.pl",
            nip: "PL1234567890",
            hourlyRate: 80
        };
        
        // Dane testowe z JSON
        this.sampleData = {
            orders: [
                {id: 1, clientId: "client_1", description: "Malowanie pokoju", date: "2025-01-15", cost: 300, price: 500, hours: 8, status: "completed", rating: 5, paid: true, paymentDate: "2025-01-15", invoiceNumber: "INV-20250115-001", category: "Malowanie", notes: "Pokój dzienny"},
                {id: 2, clientId: "client_2", description: "Tapetowanie salonu", date: "2025-01-20", cost: 150, price: 350, hours: 6, status: "completed", rating: 4, paid: false, paymentDate: null, invoiceNumber: null, category: "Malowanie", notes: "Salon główny"},
                {id: 3, clientId: "client_3", description: "Renowacja kuchni", date: "2025-01-25", cost: 400, price: 700, hours: 12, status: "in-progress", rating: null, paid: false, paymentDate: null, invoiceNumber: null, category: "Remont", notes: "Kompleksowy remont"},
                {id: 4, clientId: "client_4", description: "Malowanie fasady", date: "2025-01-28", cost: 200, price: 400, hours: 5, status: "completed", rating: 5, paid: true, paymentDate: "2025-01-28", invoiceNumber: "INV-20250128-001", category: "Malowanie", notes: "Fasada zewnętrzna"}
            ],
            clients: [
                {id: "client_1", name: "Jan Kowalski", phone: "+48 123 456 789", email: "jan@example.com", address: "ul. Kwiatowa 15, 00-001 Warszawa", note: "Preferuje kontakt po 17:00", createdAt: "2024-12-01"},
                {id: "client_2", name: "Anna Nowak", phone: "+48 987 654 321", email: "anna@example.com", address: "ul. Słoneczna 8, 30-020 Kraków", note: "Bardzo wymagająca", createdAt: "2024-11-15"},
                {id: "client_3", name: "Piotr Wiśniewski", phone: "+48 555 777 999", email: "piotr@example.com", address: "ul. Przemysłowa 45, 80-180 Gdańsk", note: "Duże zamówienia", createdAt: "2024-10-20"},
                {id: "client_4", name: "Maria Kowalczyk", phone: "+48 444 333 222", email: "maria@example.com", address: "ul. Różana 3, 50-500 Wrocław", note: "Bardzo miła", createdAt: "2025-01-10"}
            ],
            monthlyRevenue: [
                {"month": "2024-08", "revenue": 8500, "orders": 19},
                {"month": "2024-09", "revenue": 9200, "orders": 22},
                {"month": "2024-10", "revenue": 8800, "orders": 21},
                {"month": "2024-11", "revenue": 10500, "orders": 25},
                {"month": "2024-12", "revenue": 11200, "orders": 26},
                {"month": "2025-01", "revenue": 12800, "orders": 28}
            ]
        };

        // Kalkulatory
        this.calculatorTypes = {
            painting: {
                name: 'Kalkulator farby',
                fields: [
                    {name: 'width', label: 'Szerokość (m)', type: 'number'},
                    {name: 'height', label: 'Wysokość (m)', type: 'number'},
                    {name: 'coats', label: 'Liczba warstw', type: 'number', default: 2},
                    {name: 'coverage', label: 'Wydajność farby (m²/l)', type: 'number', default: 8}
                ],
                calculate: (data) => {
                    const area = data.width * data.height;
                    const totalArea = area * data.coats;
                    const liters = Math.ceil(totalArea / data.coverage);
                    return {
                        area: area.toFixed(2),
                        liters: liters,
                        unit: 'litrów farby'
                    };
                }
            },
            flooring: {
                name: 'Kalkulator podłóg',
                fields: [
                    {name: 'length', label: 'Długość (m)', type: 'number'},
                    {name: 'width', label: 'Szerokość (m)', type: 'number'},
                    {name: 'waste', label: 'Zapas (%)', type: 'number', default: 10}
                ],
                calculate: (data) => {
                    const area = data.length * data.width;
                    const totalArea = area * (1 + data.waste / 100);
                    return {
                        area: area.toFixed(2),
                        totalArea: totalArea.toFixed(2),
                        unit: 'm² powierzchni'
                    };
                }
            },
            tiles: {
                name: 'Kalkulator płytek',
                fields: [
                    {name: 'tileWidth', label: 'Szerokość płytki (cm)', type: 'number'},
                    {name: 'tileHeight', label: 'Wysokość płytki (cm)', type: 'number'},
                    {name: 'surfaceArea', label: 'Powierzchnia do pokrycia (m²)', type: 'number'}
                ],
                calculate: (data) => {
                    const tileArea = (data.tileWidth * data.tileHeight) / 10000;
                    const tilesNeeded = Math.ceil(data.surfaceArea / tileArea);
                    const tilesWithWaste = Math.ceil(tilesNeeded * 1.1);
                    return {
                        tilesNeeded: tilesNeeded,
                        tilesWithWaste: tilesWithWaste,
                        unit: 'płytek'
                    };
                }
            }
        };
    }

    async init() {
        console.log('Initializing FachowiecApp...');
        this.loadStoredData();
        this.setupTheme();
        this.setupCamera();
        
        await this.loadData();
        
        setTimeout(() => {
            this.setupEventListeners();
            this.updateDateRange('week');
            this.showToast('FachowiecApp gotowa do pracy!', 'success');
        }, 100);
    }

    // Theme Management
    setupTheme() {
        const savedTheme = this.getStoredItem('fachowiec-theme', 'auto');
        this.currentTheme = savedTheme;
        this.applyTheme(savedTheme);
    }

    toggleTheme() {
        const themes = ['auto', 'light', 'dark'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const nextTheme = themes[nextIndex];
        
        this.currentTheme = nextTheme;
        this.applyTheme(nextTheme);
        this.storeItem('fachowiec-theme', nextTheme);
        
        this.showToast(`Motyw: ${this.getThemeLabel(nextTheme)}`, 'success');
    }

    applyTheme(theme) {
        const html = document.documentElement;
        const themeIcon = document.getElementById('themeIcon');
        
        html.removeAttribute('data-color-scheme');
        
        if (theme === 'light') {
            html.setAttribute('data-color-scheme', 'light');
            if (themeIcon) themeIcon.textContent = '☀️';
        } else if (theme === 'dark') {
            html.setAttribute('data-color-scheme', 'dark');
            if (themeIcon) themeIcon.textContent = '🌙';
        } else {
            if (themeIcon) themeIcon.textContent = '🌓';
        }
    }

    getThemeLabel(theme) {
        const labels = { auto: 'automatyczny', light: 'jasny', dark: 'ciemny' };
        return labels[theme] || theme;
    }

    // Data Management with error handling
    getStoredItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error getting stored item ${key}:`, error);
            return defaultValue;
        }
    }

    storeItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error storing item ${key}:`, error);
        }
    }

    loadStoredData() {
        this.clients = this.getStoredItem('fachowiec-clients', [...this.sampleData.clients]);
        this.orders = this.getStoredItem('fachowiec-orders', [...this.sampleData.orders]);
        this.photos = this.getStoredItem('fachowiec-photos', []);
        this.calculationHistory = this.getStoredItem('fachowiec-calc-history', []);
        this.timeLog = this.getStoredItem('fachowiec-time-log', []);
        this.companySettings = {...this.companySettings, ...this.getStoredItem('fachowiec-company-settings', {})};
        
        // Ensure IDs are correct types
        this.orders.forEach(order => {
            if (typeof order.id === 'string') order.id = parseInt(order.id);
        });
    }

    saveClients() { this.storeItem('fachowiec-clients', this.clients); }
    saveOrders() { this.storeItem('fachowiec-orders', this.orders); }
    savePhotos() { this.storeItem('fachowiec-photos', this.photos); }
    saveCalculationHistory() { this.storeItem('fachowiec-calc-history', this.calculationHistory); }
    saveTimeLog() { this.storeItem('fachowiec-time-log', this.timeLog); }
    saveCompanySettings() { this.storeItem('fachowiec-company-settings', this.companySettings); }

    async loadData() {
        this.showLoading(true);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        this.data = {
            orders: this.orders,
            clients: this.clients,
            monthlyRevenue: this.sampleData.monthlyRevenue
        };
        
        this.showLoading(false);
    }

    getClientById(clientId) {
        return this.clients.find(client => client.id === clientId);
    }

    getClientOrders(clientId) {
        return this.orders.filter(order => order.clientId === clientId);
    }

    // Event Listeners Setup
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleTheme();
            });
        }
        
        // Navigation
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        navItems.forEach(item => {
            const section = item.getAttribute('data-section');
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(section);
            });
        });

        this.setupDashboardEvents();
        this.setupOrdersEvents();
        this.setupFinancesEvents();
        this.setupTimeTrackingEvents();
        this.setupClientsEvents();
        this.setupCalculatorEvents();
        this.setupGalleryEvents();
        this.setupModalEvents();
    }

    showSection(sectionName) {
        console.log('Showing section:', sectionName);
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeItem) activeItem.classList.add('active');
        
        // Show section
        document.querySelectorAll('.app-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) targetSection.classList.add('active');
        
        this.currentSection = sectionName;
        
        // Initialize section content
        setTimeout(() => {
            switch(sectionName) {
                case 'dashboard':
                    this.updateDashboard();
                    break;
                case 'orders':
                    this.renderOrdersList();
                    this.populateClientFilter();
                    break;
                case 'finances':
                    this.renderFinancialData();
                    break;
                case 'time-tracking':
                    this.renderTimeLog();
                    break;
                case 'clients':
                    this.renderClientsList();
                    break;
                case 'calculators':
                    this.renderCalculationHistory();
                    break;
                case 'gallery':
                    this.renderPhotoGallery();
                    break;
            }
        }, 100);
    }

    // Dashboard Events
    setupDashboardEvents() {
        // Date range buttons
        const dateButtons = document.querySelectorAll('.date-btn[data-range]');
        dateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const range = btn.getAttribute('data-range');
                this.updateDateRange(range);
            });
        });

        // Custom date range
        const applyBtn = document.getElementById('applyCustomRange');
        if (applyBtn) {
            applyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyCustomDateRange();
            });
        }

        // KPI cards
        const kpiCards = document.querySelectorAll('.kpi-card[data-kpi]');
        kpiCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const kpiType = card.getAttribute('data-kpi');
                this.showKPIDetails(kpiType);
            });
        });
    }

    updateDateRange(range) {
        this.currentDateRange = range;
        
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-range="${range}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        const customRange = document.getElementById('customDateRange');
        if (customRange) {
            if (range === 'custom') {
                customRange.classList.remove('hidden');
                this.setDefaultCustomDates();
            } else {
                customRange.classList.add('hidden');
                this.filterDataByRange(range);
            }
        }
        
        this.updateSelectedPeriodDisplay();
    }

    setDefaultCustomDates() {
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const dateFrom = document.getElementById('dateFrom');
        const dateTo = document.getElementById('dateTo');
        
        if (dateFrom && dateTo) {
            dateFrom.value = this.formatDateForInput(weekAgo);
            dateTo.value = this.formatDateForInput(today);
        }
    }

    applyCustomDateRange() {
        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');
        
        if (!dateFromInput || !dateToInput) return;
        
        const dateFrom = dateFromInput.value;
        const dateTo = dateToInput.value;
        
        if (!dateFrom || !dateTo) {
            this.showToast('Wybierz obie daty', 'warning');
            return;
        }
        
        if (new Date(dateFrom) > new Date(dateTo)) {
            this.showToast('Data początkowa nie może być późniejsza niż końcowa', 'error');
            return;
        }
        
        this.customDateFrom = dateFrom;
        this.customDateTo = dateTo;
        
        const customRange = document.getElementById('customDateRange');
        if (customRange) customRange.classList.add('hidden');
        
        this.filterDataByCustomRange(dateFrom, dateTo);
        this.updateSelectedPeriodDisplay();
        this.showToast('Zastosowano niestandardowy zakres dat', 'success');
    }

    filterDataByRange(range) {
        const today = new Date();
        let startDate;
        
        switch(range) {
            case 'today':
                startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                break;
            case 'week':
                startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        
        this.filteredData = {
            ...this.data,
            orders: this.data.orders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= startDate && orderDate <= today;
            })
        };
        
        this.updateDashboard();
    }

    filterDataByCustomRange(dateFrom, dateTo) {
        const startDate = new Date(dateFrom);
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        
        this.filteredData = {
            ...this.data,
            orders: this.data.orders.filter(order => {
                const orderDate = new Date(order.date);
                return orderDate >= startDate && orderDate <= endDate;
            })
        };
        
        this.updateDashboard();
    }

    updateSelectedPeriodDisplay() {
        const selectedPeriod = document.getElementById('selectedPeriod');
        if (!selectedPeriod) return;
        
        if (this.currentDateRange === 'custom' && this.customDateFrom && this.customDateTo) {
            const fromDate = new Date(this.customDateFrom).toLocaleDateString('pl-PL');
            const toDate = new Date(this.customDateTo).toLocaleDateString('pl-PL');
            selectedPeriod.textContent = `${fromDate} - ${toDate}`;
        } else {
            const ranges = {
                today: 'Dziś',
                week: 'Ostatnie 7 dni',
                month: 'Ostatnie 30 dni',
                quarter: 'Ostatnie 90 dni'
            };
            selectedPeriod.textContent = ranges[this.currentDateRange] || 'Ostatnie 7 dni';
        }
    }

    updateDashboard() {
        this.calculateKPIs();
        this.updateCharts();
    }

    calculateKPIs() {
        if (!this.filteredData) return;
        
        const orders = this.filteredData.orders;
        const completedOrders = orders.filter(o => o.status === 'completed');
        
        // Total Orders
        const totalOrders = completedOrders.length;
        this.updateElement('totalOrders', totalOrders);
        
        // Revenue
        const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
        const avgRevenue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
        
        this.updateElement('totalRevenue', `${totalRevenue.toLocaleString('pl-PL')} zł`);
        this.updateElement('avgRevenue', `${avgRevenue.toLocaleString('pl-PL')} zł`);
        
        // Payment status
        const paidOrders = completedOrders.filter(o => o.paid);
        const unpaidOrders = completedOrders.filter(o => !o.paid);
        const paidRevenue = paidOrders.reduce((sum, o) => sum + (o.price || 0), 0);
        const unpaidRevenue = unpaidOrders.reduce((sum, o) => sum + (o.price || 0), 0);
        
        this.updateElement('paidRevenue', `${paidRevenue.toLocaleString('pl-PL')} zł`);
        this.updateElement('unpaidRevenue', `${unpaidRevenue.toLocaleString('pl-PL')} zł`);
        
        // Clients
        const uniqueClients = new Set(orders.map(o => o.clientId)).size;
        this.updateElement('totalClients', uniqueClients);
        
        // Rating
        const ratingsOrders = completedOrders.filter(o => o.rating !== null);
        const avgRating = ratingsOrders.length > 0 ? 
            (ratingsOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratingsOrders.length).toFixed(1) : '0.0';
        this.updateElement('avgRating', avgRating);
        
        // Active Orders
        const activeOrders = orders.filter(o => o.status === 'in-progress').length;
        this.updateElement('activeOrders', activeOrders);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    updateCharts() {
        this.createRevenueChart();
        this.createPaymentChart();
        this.createStatusChart();
        this.createMonthlyChart();
    }

    createRevenueChart() {
        const canvas = document.getElementById('revenueChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }
        
        const monthlyData = this.prepareMonthlyData();
        
        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Przychody (zł)',
                    data: monthlyData.revenue,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    createPaymentChart() {
        const canvas = document.getElementById('paymentChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.payment) {
            this.charts.payment.destroy();
        }
        
        const orders = this.filteredData?.orders || [];
        const completedOrders = orders.filter(o => o.status === 'completed');
        const paidOrders = completedOrders.filter(o => o.paid);
        const unpaidOrders = completedOrders.filter(o => !o.paid);
        
        const labels = ['Opłacone', 'Nieopłacone'];
        const data = [paidOrders.length, unpaidOrders.length];
        const colors = ['#4CAF50', '#FF9800'];
        
        this.charts.payment = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
        
        this.updateLegend('paymentLegend', labels, colors, data);
    }

    createStatusChart() {
        const canvas = document.getElementById('statusChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.status) {
            this.charts.status.destroy();
        }
        
        const orders = this.filteredData?.orders || [];
        const statusCounts = {
            'completed': orders.filter(o => o.status === 'completed').length,
            'in-progress': orders.filter(o => o.status === 'in-progress').length,
            'pending': orders.filter(o => o.status === 'pending').length
        };
        
        const labels = ['Zakończone', 'W trakcie', 'Oczekujące'];
        const data = [statusCounts.completed, statusCounts['in-progress'], statusCounts.pending];
        const colors = ['#B4413C', '#FFC185', '#ECEBD5'];
        
        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
        
        this.updateLegend('statusLegend', labels, colors, data);
    }

    createMonthlyChart() {
        const canvas = document.getElementById('monthlyChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }
        
        const monthlyData = this.prepareMonthlyData();
        
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Przychody miesięczne',
                    data: monthlyData.revenue,
                    backgroundColor: '#D2BA4C'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    updateLegend(elementId, labels, colors, data) {
        const legend = document.getElementById(elementId);
        if (legend) {
            legend.innerHTML = labels.map((label, index) => 
                `<div class="legend-item">
                    <div class="legend-color" style="background-color: ${colors[index]}"></div>
                    <span>${label}: ${data[index]}</span>
                </div>`
            ).join('');
        }
    }

    prepareMonthlyData() {
        const monthlyRevenue = this.data.monthlyRevenue || [];
        const last6Months = monthlyRevenue.slice(-6);
        
        return {
            labels: last6Months.map(item => {
                const date = new Date(item.month + '-01');
                return date.toLocaleDateString('pl-PL', { month: 'short', year: '2-digit' });
            }),
            revenue: last6Months.map(item => item.revenue),
            orders: last6Months.map(item => item.orders)
        };
    }

    showKPIDetails(kpiType) {
        const orders = this.filteredData?.orders || [];
        const completedOrders = orders.filter(o => o.status === 'completed');
        
        let message = '';
        switch(kpiType) {
            case 'orders':
                message = `Zrealizowano ${completedOrders.length} zleceń w wybranym okresie.`;
                break;
            case 'revenue':
                const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
                message = `Łączne przychody: ${totalRevenue.toLocaleString('pl-PL')} zł`;
                break;
            case 'paid':
                const paidOrders = completedOrders.filter(o => o.paid);
                const paidRevenue = paidOrders.reduce((sum, o) => sum + (o.price || 0), 0);
                message = `Opłacono ${paidRevenue.toLocaleString('pl-PL')} zł z ${paidOrders.length} zleceń.`;
                break;
            case 'clients':
                const uniqueClients = new Set(orders.map(o => o.clientId)).size;
                message = `Współpraca z ${uniqueClients} klientami w wybranym okresie.`;
                break;
            default:
                message = 'Szczegóły wskaźnika';
        }
        
        this.showToast(message, 'info');
    }

    // Orders Management
    setupOrdersEvents() {
        const addOrderBtn = document.getElementById('addOrderBtn');
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showOrderModal();
            });
        }

        const searchInput = document.getElementById('searchOrders');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterOrders(e.target.value);
            });
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filterOrdersByStatus(e.target.value);
            });
        }

        const clientFilter = document.getElementById('clientFilter');
        if (clientFilter) {
            clientFilter.addEventListener('change', (e) => {
                this.filterOrdersByClient(e.target.value);
            });
        }
    }

    populateClientFilter() {
        const clientFilter = document.getElementById('clientFilter');
        if (!clientFilter) return;

        clientFilter.innerHTML = '<option value="">Wszyscy klienci</option>';
        
        this.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientFilter.appendChild(option);
        });
    }

    populateOrderClientSelect() {
        const clientSelect = document.getElementById('orderClient');
        if (!clientSelect) return;
        
        clientSelect.innerHTML = '<option value="">Wybierz klienta</option>';
        
        this.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
    }

    renderOrdersList() {
        const container = document.getElementById('ordersList');
        if (!container) return;

        if (this.orders.length === 0) {
            container.innerHTML = '<div class="empty-state">Brak zleceń. Dodaj pierwsze zlecenie.</div>';
            return;
        }

        container.innerHTML = this.orders.map(order => this.createOrderHTML(order)).join('');
    }

    createOrderHTML(order) {
        const statusLabels = {
            pending: 'Oczekujące',
            'in-progress': 'W trakcie',
            completed: 'Zakończone'
        };

        const client = this.getClientById(order.clientId);
        const clientName = client ? client.name : 'Nieznany klient';

        return `
            <div class="order-item" data-order-id="${order.id}">
                <div class="order-header">
                    <h3 class="order-client">${clientName}</h3>
                    <span class="order-status ${order.status}">${statusLabels[order.status]}</span>
                </div>
                <p class="order-description">${order.description}</p>
                <div class="order-details">
                    <div class="order-detail">
                        <div class="order-detail-label">Data</div>
                        <div class="order-detail-value">${new Date(order.date).toLocaleDateString('pl-PL')}</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Cena</div>
                        <div class="order-detail-value">${order.price.toLocaleString('pl-PL')} zł</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Czas</div>
                        <div class="order-detail-value">${order.hours}h</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Kategoria</div>
                        <div class="order-detail-value">${order.category || 'Inne'}</div>
                    </div>
                    ${order.rating ? `
                        <div class="order-detail">
                            <div class="order-detail-label">Ocena</div>
                            <div class="order-detail-value">${'⭐'.repeat(order.rating)}</div>
                        </div>
                    ` : ''}
                </div>
                <div class="order-actions">
                    <button class="btn btn--outline btn--sm" onclick="window.app.editOrder(${order.id})">Edytuj</button>
                    <button class="btn btn--error btn--sm" onclick="window.app.deleteOrder(${order.id})">Usuń</button>
                </div>
            </div>
        `;
    }

    filterOrders(searchTerm) {
        const orderItems = document.querySelectorAll('.order-item');
        orderItems.forEach(item => {
            const client = item.querySelector('.order-client').textContent.toLowerCase();
            const description = item.querySelector('.order-description').textContent.toLowerCase();
            const matches = client.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    filterOrdersByStatus(status) {
        const orderItems = document.querySelectorAll('.order-item');
        orderItems.forEach(item => {
            if (!status) {
                item.style.display = 'block';
                return;
            }
            const orderStatus = item.querySelector('.order-status').classList.contains(status);
            item.style.display = orderStatus ? 'block' : 'none';
        });
    }

    filterOrdersByClient(clientId) {
        if (!clientId) {
            document.querySelectorAll('.order-item').forEach(item => {
                item.style.display = 'block';
            });
            return;
        }

        const clientOrders = this.orders.filter(order => order.clientId === clientId);
        const orderItems = document.querySelectorAll('.order-item');
        
        orderItems.forEach(item => {
            const orderId = parseInt(item.getAttribute('data-order-id'));
            const shouldShow = clientOrders.some(order => order.id === orderId);
            item.style.display = shouldShow ? 'block' : 'none';
        });
    }

    showOrderModal(orderId = null) {
        const modal = document.getElementById('orderModal');
        const title = document.getElementById('orderModalTitle');
        const form = document.getElementById('orderForm');
        
        if (!modal || !title || !form) return;

        const isEdit = orderId !== null;
        this.editingOrderId = orderId;
        title.textContent = isEdit ? 'Edytuj zlecenie' : 'Dodaj zlecenie';
        
        if (isEdit) {
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                this.populateOrderForm(order);
            }
        } else {
            form.reset();
            document.getElementById('orderDate').value = new Date().toISOString().split('T')[0];
        }

        this.populateOrderClientSelect();
        this.toggleRatingField();
        
        modal.classList.remove('hidden');
    }

    populateOrderForm(order) {
        this.populateOrderClientSelect();
        
        document.getElementById('orderClient').value = order.clientId || '';
        document.getElementById('orderDescription').value = order.description || '';
        document.getElementById('orderCategory').value = order.category || 'Inne';
        document.getElementById('orderCost').value = order.cost || '';
        document.getElementById('orderPrice').value = order.price || '';
        document.getElementById('orderHours').value = order.hours || '';
        document.getElementById('orderDate').value = order.date || '';
        document.getElementById('orderStatus').value = order.status || 'pending';
        document.getElementById('orderNotes').value = order.notes || '';
        if (order.rating) {
            document.getElementById('orderRating').value = order.rating;
        }
    }

    toggleRatingField() {
        const statusSelect = document.getElementById('orderStatus');
        const ratingGroup = document.getElementById('ratingGroup');
        
        if (statusSelect && ratingGroup) {
            const showRating = statusSelect.value === 'completed';
            ratingGroup.classList.toggle('hidden', !showRating);
        }
    }

    editOrder(orderId) {
        this.showOrderModal(orderId);
    }

    deleteOrder(orderId) {
        if (confirm('Czy na pewno chcesz usunąć to zlecenie?')) {
            this.orders = this.orders.filter(o => o.id !== orderId);
            this.saveOrders();
            this.renderOrdersList();
            this.showToast('Zlecenie zostało usunięte', 'success');
            
            this.loadData().then(() => {
                if (this.currentSection === 'dashboard') {
                    this.filterDataByRange(this.currentDateRange);
                }
            });
        }
    }

    saveOrder(formData) {
        const isEdit = this.editingOrderId !== null;
        
        if (isEdit) {
            const index = this.orders.findIndex(o => o.id === this.editingOrderId);
            if (index !== -1) {
                const existingOrder = this.orders[index];
                this.orders[index] = { 
                    ...existingOrder, 
                    ...formData, 
                    profit: (formData.price || 0) - (formData.cost || 0)
                };
            }
        } else {
            const newOrder = {
                id: Date.now(),
                profit: (formData.price || 0) - (formData.cost || 0),
                paid: false,
                paymentDate: null,
                invoiceNumber: null,
                ...formData
            };
            this.orders.push(newOrder);
        }
        
        this.saveOrders();
        this.renderOrdersList();
        this.showToast(isEdit ? 'Zlecenie zaktualizowane' : 'Zlecenie dodane', 'success');
        
        this.loadData().then(() => {
            if (this.currentSection === 'dashboard') {
                this.filterDataByRange(this.currentDateRange);
            }
        });
        
        this.editingOrderId = null;
    }

    // Finances Events
    setupFinancesEvents() {
        const paymentStatusFilter = document.getElementById('paymentStatusFilter');
        if (paymentStatusFilter) {
            paymentStatusFilter.addEventListener('change', (e) => {
                this.filterInvoicesByPaymentStatus(e.target.value);
            });
        }

        const searchInvoices = document.getElementById('searchInvoices');
        if (searchInvoices) {
            searchInvoices.addEventListener('input', (e) => {
                this.filterInvoices(e.target.value);
            });
        }
    }

    renderFinancialData() {
        this.updateFinancialSummary();
        this.renderInvoicesList();
    }

    updateFinancialSummary() {
        const completedOrders = this.orders.filter(o => o.status === 'completed');
        const paidOrders = completedOrders.filter(o => o.paid);
        const unpaidOrders = completedOrders.filter(o => !o.paid);

        const totalPaid = paidOrders.reduce((sum, o) => sum + (o.price || 0), 0);
        const totalUnpaid = unpaidOrders.reduce((sum, o) => sum + (o.price || 0), 0);
        const totalAmount = totalPaid + totalUnpaid;

        this.updateElement('totalPaidAmount', `${totalPaid.toLocaleString('pl-PL')} zł`);
        this.updateElement('totalUnpaidAmount', `${totalUnpaid.toLocaleString('pl-PL')} zł`);
        this.updateElement('totalFinancialAmount', `${totalAmount.toLocaleString('pl-PL')} zł`);
    }

    renderInvoicesList() {
        const container = document.getElementById('invoicesList');
        if (!container) return;

        const completedOrders = this.orders.filter(o => o.status === 'completed');

        if (completedOrders.length === 0) {
            container.innerHTML = '<div class="empty-state">Brak zakończonych zleceń do fakturowania.</div>';
            return;
        }

        container.innerHTML = completedOrders.map(order => this.createInvoiceHTML(order)).join('');
    }

    createInvoiceHTML(order) {
        const client = this.getClientById(order.clientId);
        const clientName = client ? client.name : 'Nieznany klient';

        return `
            <div class="invoice-item" data-order-id="${order.id}">
                <div class="invoice-header">
                    <h3 class="invoice-client">${clientName}</h3>
                    <span class="payment-status ${order.paid ? 'paid' : 'unpaid'}">
                        ${order.paid ? '✅ Opłacone' : '⏳ Nieopłacone'}
                    </span>
                </div>
                <p class="invoice-description">${order.description}</p>
                <div class="invoice-details">
                    <div class="invoice-detail">
                        <div class="invoice-detail-label">Data</div>
                        <div class="invoice-detail-value">${new Date(order.date).toLocaleDateString('pl-PL')}</div>
                    </div>
                    <div class="invoice-detail">
                        <div class="invoice-detail-label">Kwota</div>
                        <div class="invoice-detail-value">${order.price.toLocaleString('pl-PL')} zł</div>
                    </div>
                    <div class="invoice-detail">
                        <div class="invoice-detail-label">Kategoria</div>
                        <div class="invoice-detail-value">${order.category || 'Inne'}</div>
                    </div>
                    ${order.invoiceNumber ? `
                        <div class="invoice-detail">
                            <div class="invoice-detail-label">Nr faktury</div>
                            <div class="invoice-detail-value">${order.invoiceNumber}</div>
                        </div>
                    ` : ''}
                    ${order.paymentDate ? `
                        <div class="invoice-detail">
                            <div class="invoice-detail-label">Data płatności</div>
                            <div class="invoice-detail-value">${new Date(order.paymentDate).toLocaleDateString('pl-PL')}</div>
                        </div>
                    ` : ''}
                </div>
                <div class="invoice-actions">
                    ${!order.paid ? `
                        <button class="btn btn--primary btn--sm" onclick="window.app.markAsPaid(${order.id})">
                            ✅ Oznacz jako opłacone
                        </button>
                    ` : `
                        <button class="btn btn--secondary btn--sm" onclick="window.app.markAsUnpaid(${order.id})">
                            ❌ Oznacz jako nieopłacone
                        </button>
                    `}
                    <button class="btn btn--outline btn--sm" onclick="window.app.generateInvoicePDF(${order.id})">
                        📄 Generuj PDF
                    </button>
                </div>
            </div>
        `;
    }

    markAsPaid(orderId) {
        try {
            const order = this.orders.find(o => o.id === orderId);
            if (!order) {
                this.showToast('Nie znaleziono zlecenia', 'error');
                return;
            }

            if (order.paid) {
                this.showToast('Zlecenie jest już oznaczone jako opłacone', 'warning');
                return;
            }

            if (!order.invoiceNumber) {
                order.invoiceNumber = this.generateInvoiceNumber();
            }

            order.paid = true;
            order.paymentDate = new Date().toISOString().split('T')[0];

            this.saveOrders();
            this.renderFinancialData();
            
            if (this.currentSection === 'dashboard') {
                this.updateDashboard();
            }

            this.showToast(`Zlecenie oznaczone jako opłacone. Nr faktury: ${order.invoiceNumber}`, 'success');
        } catch (error) {
            console.error('Error marking as paid:', error);
            this.showToast('Błąd podczas oznaczania jako opłacone', 'error');
        }
    }

    markAsUnpaid(orderId) {
        try {
            const order = this.orders.find(o => o.id === orderId);
            if (!order) {
                this.showToast('Nie znaleziono zlecenia', 'error');
                return;
            }

            if (!order.paid) {
                this.showToast('Zlecenie już jest oznaczone jako nieopłacone', 'warning');
                return;
            }

            order.paid = false;
            order.paymentDate = null;

            this.saveOrders();
            this.renderFinancialData();
            
            if (this.currentSection === 'dashboard') {
                this.updateDashboard();
            }

            this.showToast('Zlecenie oznaczone jako nieopłacone', 'success');
        } catch (error) {
            console.error('Error marking as unpaid:', error);
            this.showToast('Błąd podczas oznaczania jako nieopłacone', 'error');
        }
    }

    async generateInvoicePDF(orderId) {
        try {
            if (typeof window.jsPDF === 'undefined') {
                this.showToast('Błąd: Biblioteka jsPDF nie została załadowana', 'error');
                return;
            }

            const order = this.orders.find(o => o.id === orderId);
            if (!order) {
                this.showToast('Nie znaleziono zlecenia', 'error');
                return;
            }

            const client = this.getClientById(order.clientId);
            if (!client) {
                this.showToast('Nie znaleziono danych klienta', 'error');
                return;
            }

            this.showLoading(true);

            if (!order.invoiceNumber) {
                order.invoiceNumber = this.generateInvoiceNumber();
                this.saveOrders();
            }

            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text(this.companySettings.name, 20, 20);
            
            doc.setFontSize(12);
            doc.text(this.companySettings.address, 20, 30);
            doc.text(`Tel: ${this.companySettings.phone}`, 20, 40);
            doc.text(`Email: ${this.companySettings.email}`, 20, 50);
            doc.text(`NIP: ${this.companySettings.nip}`, 20, 60);

            // Invoice details
            doc.setFontSize(16);
            doc.text(`FAKTURA ${order.invoiceNumber}`, 20, 80);
            
            doc.setFontSize(12);
            doc.text(`Data wystawienia: ${new Date().toLocaleDateString('pl-PL')}`, 20, 90);
            doc.text(`Data realizacji: ${new Date(order.date).toLocaleDateString('pl-PL')}`, 20, 100);

            // Client data
            doc.text('NABYWCA:', 20, 120);
            doc.text(client.name, 20, 130);
            if (client.address) {
                doc.text(client.address, 20, 140);
            }
            if (client.phone) {
                doc.text(`Tel: ${client.phone}`, 20, 150);
            }
            if (client.email) {
                doc.text(`Email: ${client.email}`, 20, 160);
            }

            // Order details
            doc.text('SZCZEGOLY ZLECENIA:', 20, 180);
            doc.text(`Opis: ${order.description}`, 20, 190);
            doc.text(`Kategoria: ${order.category || 'Inne'}`, 20, 200);
            if (order.notes) {
                doc.text(`Uwagi: ${order.notes}`, 20, 210);
            }

            // Financial details
            const yPos = order.notes ? 230 : 220;
            doc.text('ROZLICZENIE:', 20, yPos);
            doc.text(`Koszt materialow: ${order.cost.toLocaleString('pl-PL')} zl`, 20, yPos + 10);
            doc.text(`Robocizna: ${(order.price - order.cost).toLocaleString('pl-PL')} zl`, 20, yPos + 20);
            doc.text(`Czas pracy: ${order.hours}h`, 20, yPos + 30);
            
            doc.setFontSize(14);
            doc.text(`LACZNA KWOTA: ${order.price.toLocaleString('pl-PL')} zl`, 20, yPos + 50);

            // Payment status
            doc.setFontSize(12);
            const paymentStatus = order.paid ? 'OPLACONE' : 'NIEOPLACONE';
            const paymentColor = order.paid ? [0, 128, 0] : [255, 0, 0];
            doc.setTextColor(...paymentColor);
            doc.text(`Status platnosci: ${paymentStatus}`, 20, yPos + 70);
            
            if (order.paid && order.paymentDate) {
                doc.text(`Data platnosci: ${new Date(order.paymentDate).toLocaleDateString('pl-PL')}`, 20, yPos + 80);
            }

            doc.setTextColor(0, 0, 0);

            const fileName = `Faktura_${order.invoiceNumber}_${client.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
            doc.save(fileName);

            this.showLoading(false);
            this.showToast(`Faktura PDF została wygenerowana: ${fileName}`, 'success');

        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showLoading(false);
            this.showToast(`Błąd podczas generowania PDF: ${error.message}`, 'error');
        }
    }

    generateInvoiceNumber() {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = today.getHours().toString().padStart(2, '0') + today.getMinutes().toString().padStart(2, '0');
        return `INV-${dateStr}-${timeStr}`;
    }

    filterInvoicesByPaymentStatus(status) {
        const invoiceItems = document.querySelectorAll('.invoice-item');
        invoiceItems.forEach(item => {
            if (!status) {
                item.style.display = 'block';
                return;
            }
            const isPaid = item.querySelector('.payment-status').classList.contains('paid');
            const shouldShow = (status === 'paid' && isPaid) || (status === 'unpaid' && !isPaid);
            item.style.display = shouldShow ? 'block' : 'none';
        });
    }

    filterInvoices(searchTerm) {
        const invoiceItems = document.querySelectorAll('.invoice-item');
        invoiceItems.forEach(item => {
            const client = item.querySelector('.invoice-client').textContent.toLowerCase();
            const description = item.querySelector('.invoice-description').textContent.toLowerCase();
            const matches = client.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    // Time Tracking Events
    setupTimeTrackingEvents() {
        const startTimerBtn = document.getElementById('startTimerBtn');
        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTimerModal();
            });
        }

        const pauseTimerBtn = document.getElementById('pauseTimerBtn');
        if (pauseTimerBtn) {
            pauseTimerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.pauseTimer();
            });
        }

        const stopTimerBtn = document.getElementById('stopTimerBtn');
        if (stopTimerBtn) {
            stopTimerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.stopTimer();
            });
        }
    }

    showTimerModal() {
        const modal = document.getElementById('timerModal');
        if (!modal) return;

        this.populateTimerOrderSelect();
        modal.classList.remove('hidden');
    }

    populateTimerOrderSelect() {
        const select = document.getElementById('timerOrderId');
        if (!select) return;

        select.innerHTML = '<option value="">Brak powiązania</option>';
        
        const activeOrders = this.orders.filter(o => o.status !== 'completed');
        activeOrders.forEach(order => {
            const client = this.getClientById(order.clientId);
            const option = document.createElement('option');
            option.value = order.id;
            option.textContent = `${client ? client.name : 'Nieznany klient'} - ${order.description}`;
            select.appendChild(option);
        });
    }

    startTimer(taskName, orderId = null) {
        if (this.currentTimer) {
            this.showToast('Timer jest już aktywny. Zatrzymaj obecny timer przed rozpoczęciem nowego.', 'warning');
            return;
        }

        this.currentTimer = {
            taskName: taskName,
            orderId: orderId,
            startTime: new Date(),
            isPaused: false
        };

        this.timerStartTime = Date.now();
        this.timerPausedTime = 0;

        const activeTimer = document.getElementById('activeTimer');
        const startBtn = document.getElementById('startTimerBtn');
        
        if (activeTimer) activeTimer.classList.remove('hidden');
        if (startBtn) startBtn.style.display = 'none';

        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);

        const timerTask = document.getElementById('timerTask');
        if (timerTask) timerTask.textContent = taskName;

        this.showToast(`Timer rozpoczęty: ${taskName}`, 'success');
    }

    pauseTimer() {
        if (!this.currentTimer || this.currentTimer.isPaused) return;

        this.currentTimer.isPaused = true;
        this.timerPausedTime += Date.now() - this.timerStartTime;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const pauseBtn = document.getElementById('pauseTimerBtn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '▶️ Wznów';
            pauseBtn.onclick = () => this.resumeTimer();
        }

        this.showToast('Timer wstrzymany', 'info');
    }

    resumeTimer() {
        if (!this.currentTimer || !this.currentTimer.isPaused) return;

        this.currentTimer.isPaused = false;
        this.timerStartTime = Date.now();

        this.timerInterval = setInterval(() => {
            this.updateTimerDisplay();
        }, 1000);

        const pauseBtn = document.getElementById('pauseTimerBtn');
        if (pauseBtn) {
            pauseBtn.innerHTML = '⏸️ Pauza';
            pauseBtn.onclick = () => this.pauseTimer();
        }

        this.showToast('Timer wznowiony', 'success');
    }

    stopTimer() {
        if (!this.currentTimer) return;

        if (confirm('Czy na pewno chcesz zakończyć obecną sesję pracy?')) {
            let totalTime = this.timerPausedTime;
            if (!this.currentTimer.isPaused) {
                totalTime += Date.now() - this.timerStartTime;
            }

            const hours = Math.floor(totalTime / (1000 * 60 * 60));
            const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

            const timeEntry = {
                id: Date.now(),
                taskName: this.currentTimer.taskName,
                orderId: this.currentTimer.orderId,
                startTime: this.currentTimer.startTime.toISOString(),
                endTime: new Date().toISOString(),
                duration: totalTime,
                durationFormatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            };

            this.timeLog.unshift(timeEntry);
            this.saveTimeLog();

            this.currentTimer = null;
            this.timerStartTime = null;
            this.timerPausedTime = 0;

            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }

            const activeTimer = document.getElementById('activeTimer');
            const startBtn = document.getElementById('startTimerBtn');
            
            if (activeTimer) activeTimer.classList.add('hidden');
            if (startBtn) startBtn.style.display = 'flex';

            const pauseBtn = document.getElementById('pauseTimerBtn');
            if (pauseBtn) {
                pauseBtn.innerHTML = '⏸️ Pauza';
                pauseBtn.onclick = () => this.pauseTimer();
            }

            this.renderTimeLog();
            this.showToast(`Sesja pracy zakończona: ${timeEntry.durationFormatted}`, 'success');
        }
    }

    updateTimerDisplay() {
        if (!this.currentTimer) return;

        let totalTime = this.timerPausedTime;
        if (!this.currentTimer.isPaused) {
            totalTime += Date.now() - this.timerStartTime;
        }

        const hours = Math.floor(totalTime / (1000 * 60 * 60));
        const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((totalTime % (1000 * 60)) / 1000);

        const display = document.getElementById('timerDisplay');
        if (display) {
            display.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    renderTimeLog() {
        const container = document.getElementById('timeLog');
        if (!container) return;

        if (this.timeLog.length === 0) {
            container.innerHTML = '<div class="empty-state">Brak zapisanych sesji pracy</div>';
            return;
        }

        container.innerHTML = this.timeLog.map(entry => {
            const order = entry.orderId ? this.orders.find(o => o.id == entry.orderId) : null;
            const client = order ? this.getClientById(order.clientId) : null;

            return `
                <div class="time-entry">
                    <div class="time-entry-info">
                        <div class="time-entry-task">${entry.taskName}</div>
                        <div class="time-entry-meta">
                            ${new Date(entry.startTime).toLocaleDateString('pl-PL')} • 
                            ${new Date(entry.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })} - 
                            ${new Date(entry.endTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                            ${client ? ` • ${client.name}` : ''}
                        </div>
                    </div>
                    <div class="time-entry-duration">${entry.durationFormatted}</div>
                </div>
            `;
        }).join('');
    }

    // Clients Events
    setupClientsEvents() {
        const addClientBtn = document.getElementById('addClientBtn');
        if (addClientBtn) {
            addClientBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showClientModal();
            });
        }

        const searchInput = document.getElementById('searchClients');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterClients(e.target.value);
            });
        }

        const sortSelect = document.getElementById('sortClients');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortClients(e.target.value);
            });
        }
    }

    renderClientsList() {
        const container = document.getElementById('clientsList');
        if (!container) return;

        if (this.clients.length === 0) {
            container.innerHTML = '<div class="empty-state">Brak klientów. Dodaj pierwszego klienta.</div>';
            return;
        }

        container.innerHTML = this.clients.map(client => this.createClientHTML(client)).join('');
    }

    createClientHTML(client) {
        const clientOrders = this.getClientOrders(client.id);
        const completedOrders = clientOrders.filter(o => o.status === 'completed');
        const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);

        return `
            <div class="client-item" data-client-id="${client.id}" onclick="window.app.showClientDetails('${client.id}')">
                <div class="client-header">
                    <h3 class="client-name">${client.name}</h3>
                    <div class="client-stats">
                        <span>${clientOrders.length} zleceń</span>
                        <span>${totalRevenue.toLocaleString('pl-PL')} zł</span>
                    </div>
                </div>
                
                <div class="client-contact">
                    ${client.phone ? `
                        <div class="client-contact-item">
                            📞 <a href="tel:${client.phone}" class="client-contact-link" onclick="event.stopPropagation()">${client.phone}</a>
                        </div>
                    ` : ''}
                    ${client.email ? `
                        <div class="client-contact-item">
                            ✉️ <a href="mailto:${client.email}" class="client-contact-link" onclick="event.stopPropagation()">${client.email}</a>
                        </div>
                    ` : ''}
                </div>
                
                ${client.address ? `<div class="client-address">📍 ${client.address}</div>` : ''}
                
                ${client.note ? `<div class="client-note">"${client.note}"</div>` : ''}
                
                <div class="client-actions" onclick="event.stopPropagation()">
                    <button class="btn btn--primary btn--sm" onclick="window.app.createOrderForClient('${client.id}')">Nowe zlecenie</button>
                    <button class="btn btn--outline btn--sm" onclick="window.app.editClient('${client.id}')">Edytuj</button>
                    <button class="btn btn--error btn--sm" onclick="window.app.deleteClient('${client.id}')">Usuń</button>
                </div>
            </div>
        `;
    }

    showClientModal(clientId = null) {
        const modal = document.getElementById('clientModal');
        const title = document.getElementById('clientModalTitle');
        const form = document.getElementById('clientForm');
        
        if (!modal || !title || !form) return;

        const isEdit = clientId !== null;
        this.editingClientId = clientId;
        title.textContent = isEdit ? 'Edytuj klienta' : 'Dodaj klienta';
        
        if (isEdit) {
            const client = this.clients.find(c => c.id === clientId);
            if (client) {
                this.populateClientForm(client);
            }
        } else {
            form.reset();
        }
        
        modal.classList.remove('hidden');
    }

    populateClientForm(client) {
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientPhone').value = client.phone || '';
        document.getElementById('clientEmail').value = client.email || '';
        document.getElementById('clientAddress').value = client.address || '';
        document.getElementById('clientNote').value = client.note || '';
    }

    editClient(clientId) {
        this.showClientModal(clientId);
    }

    deleteClient(clientId) {
        const clientOrders = this.getClientOrders(clientId);
        if (clientOrders.length > 0) {
            if (!confirm(`Ten klient ma ${clientOrders.length} zleceń. Czy na pewno chcesz go usunąć? Zlecenia zostaną zachowane, ale klient będzie oznaczony jako "Nieznany klient".`)) {
                return;
            }
        } else {
            if (!confirm('Czy na pewno chcesz usunąć tego klienta?')) {
                return;
            }
        }
        
        this.clients = this.clients.filter(c => c.id !== clientId);
        this.saveClients();
        this.renderClientsList();
        this.showToast('Klient został usunięty', 'success');
        
        this.loadData().then(() => {
            if (this.currentSection === 'dashboard') {
                this.filterDataByRange(this.currentDateRange);
            }
        });
    }

    saveClient(formData) {
        const isEdit = this.editingClientId !== null;
        
        if (isEdit) {
            const index = this.clients.findIndex(c => c.id === this.editingClientId);
            if (index !== -1) {
                this.clients[index] = { ...this.clients[index], ...formData };
            }
        } else {
            const newClient = {
                id: `client_${Date.now()}`,
                createdAt: new Date().toISOString().split('T')[0],
                ...formData
            };
            this.clients.push(newClient);
        }
        
        this.saveClients();
        this.renderClientsList();
        this.showToast(isEdit ? 'Klient zaktualizowany' : 'Klient dodany', 'success');
        
        this.loadData().then(() => {
            if (this.currentSection === 'dashboard') {
                this.filterDataByRange(this.currentDateRange);
            }
        });
        
        this.editingClientId = null;
    }

    createOrderForClient(clientId) {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        this.showOrderModal();
        
        setTimeout(() => {
            const clientSelect = document.getElementById('orderClient');
            if (clientSelect) {
                clientSelect.value = clientId;
            }
        }, 100);
    }

    showClientDetails(clientId) {
        const modal = document.getElementById('clientDetailsModal');
        const title = document.getElementById('clientDetailsTitle');
        const content = document.getElementById('clientDetailsContent');
        
        if (!modal || !title || !content) return;

        const client = this.getClientById(clientId);
        if (!client) return;

        title.textContent = `${client.name} - Szczegóły`;
        content.innerHTML = this.generateClientDetailsHTML(client);
        
        modal.classList.remove('hidden');
    }

    generateClientDetailsHTML(client) {
        const clientOrders = this.getClientOrders(client.id);
        const completedOrders = clientOrders.filter(o => o.status === 'completed');
        const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.price || 0), 0);
        const avgRating = completedOrders.filter(o => o.rating).length > 0 ? 
            (completedOrders.filter(o => o.rating).reduce((sum, o) => sum + o.rating, 0) / completedOrders.filter(o => o.rating).length).toFixed(1) : 'Brak ocen';

        return `
            <div class="client-details">
                <div class="client-info-section">
                    <h4>Dane kontaktowe</h4>
                    <div class="client-info-grid">
                        <div class="client-info-item">
                            <div class="client-info-label">Telefon</div>
                            <div class="client-info-value">
                                ${client.phone ? `<a href="tel:${client.phone}">${client.phone}</a>` : 'Brak'}
                            </div>
                        </div>
                        <div class="client-info-item">
                            <div class="client-info-label">Email</div>
                            <div class="client-info-value">
                                ${client.email ? `<a href="mailto:${client.email}">${client.email}</a>` : 'Brak'}
                            </div>
                        </div>
                        <div class="client-info-item">
                            <div class="client-info-label">Adres</div>
                            <div class="client-info-value">${client.address || 'Brak'}</div>
                        </div>
                        <div class="client-info-item">
                            <div class="client-info-label">Data dodania</div>
                            <div class="client-info-value">${new Date(client.createdAt).toLocaleDateString('pl-PL')}</div>
                        </div>
                    </div>
                    ${client.note ? `
                        <div class="client-info-item">
                            <div class="client-info-label">Notatki prywatne</div>
                            <div class="client-info-value" style="font-style: italic; background: var(--color-bg-2); padding: 12px; border-radius: 8px;">"${client.note}"</div>
                        </div>
                    ` : ''}
                </div>

                <div class="client-orders-section">
                    <div class="client-orders-header">
                        <h4>Historia współpracy</h4>
                        <button class="btn btn--primary btn--sm" onclick="window.app.createOrderForClient('${client.id}'); window.app.closeClientDetailsModal();">
                            + Nowe zlecenie
                        </button>
                    </div>
                    
                    <div class="client-orders-stats">
                        <div class="client-stat">
                            <div class="client-stat-value">${clientOrders.length}</div>
                            <div class="client-stat-label">Wszystkie zlecenia</div>
                        </div>
                        <div class="client-stat">
                            <div class="client-stat-value">${completedOrders.length}</div>
                            <div class="client-stat-label">Zakończone</div>
                        </div>
                        <div class="client-stat">
                            <div class="client-stat-value">${totalRevenue.toLocaleString('pl-PL')} zł</div>
                            <div class="client-stat-label">Łączne przychody</div>
                        </div>
                        <div class="client-stat">
                            <div class="client-stat-value">${avgRating}</div>
                            <div class="client-stat-label">Średnia ocena</div>
                        </div>
                    </div>

                    <div class="client-orders-list">
                        ${clientOrders.length > 0 ? clientOrders.map(order => `
                            <div class="client-order-item">
                                <div class="client-order-info">
                                    <div class="client-order-description">${order.description}</div>
                                    <div class="client-order-meta">
                                        ${new Date(order.date).toLocaleDateString('pl-PL')} • 
                                        ${order.status === 'completed' ? 'Zakończone' : 
                                          order.status === 'in-progress' ? 'W trakcie' : 'Oczekujące'}
                                        ${order.rating ? ` • ${'⭐'.repeat(order.rating)}` : ''}
                                    </div>
                                </div>
                                <div class="client-order-price">${order.price.toLocaleString('pl-PL')} zł</div>
                            </div>
                        `).join('') : '<div class="empty-state">Brak zleceń dla tego klienta</div>'}
                    </div>
                </div>
            </div>
        `;
    }

    closeClientDetailsModal() {
        const modal = document.getElementById('clientDetailsModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    filterClients(searchTerm) {
        const clientItems = document.querySelectorAll('.client-item');
        clientItems.forEach(item => {
            const name = item.querySelector('.client-name').textContent.toLowerCase();
            const matches = name.includes(searchTerm.toLowerCase());
            item.style.display = matches ? 'block' : 'none';
        });
    }

    sortClients(sortBy) {
        const container = document.getElementById('clientsList');
        if (!container) return;

        let sortedClients = [...this.clients];
        
        switch(sortBy) {
            case 'name':
                sortedClients.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'date':
                sortedClients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'orders':
                sortedClients.sort((a, b) => {
                    const aOrders = this.getClientOrders(a.id).length;
                    const bOrders = this.getClientOrders(b.id).length;
                    return bOrders - aOrders;
                });
                break;
        }
        
        container.innerHTML = sortedClients.map(client => this.createClientHTML(client)).join('');
    }

    // Calculator Events
    setupCalculatorEvents() {
        const calcButtons = document.querySelectorAll('.calc-btn');
        calcButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.calculator-card');
                const type = card.getAttribute('data-type');
                this.showCalculatorModal(type);
            });
        });
    }

    showCalculatorModal(type) {
        const modal = document.getElementById('calculatorModal');
        const title = document.getElementById('calculatorModalTitle');
        const content = document.getElementById('calculatorContent');
        
        if (!modal || !title || !content) return;

        const calculator = this.calculatorTypes[type];
        if (!calculator) return;

        title.textContent = calculator.name;
        content.innerHTML = this.createCalculatorForm(type, calculator);
        
        modal.classList.remove('hidden');
        modal.setAttribute('data-calc-type', type);
    }

    createCalculatorForm(type, calculator) {
        return `
            <form class="calculator-form" onsubmit="window.app.calculateResult(event, '${type}')">
                ${calculator.fields.map(field => `
                    <div class="form-group">
                        <label class="form-label">${field.label}</label>
                        <input 
                            type="${field.type}" 
                            name="${field.name}" 
                            class="form-control" 
                            ${field.default ? `value="${field.default}"` : ''}
                            required
                        >
                    </div>
                `).join('')}
                <div class="form-actions">
                    <button type="button" class="btn btn--secondary" onclick="window.app.closeCalculatorModal()">Anuluj</button>
                    <button type="submit" class="btn btn--primary">Oblicz</button>
                </div>
            </form>
            <div id="calculationResult" style="display: none;"></div>
        `;
    }

    calculateResult(event, type) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = parseFloat(value) || 0;
        }

        const calculator = this.calculatorTypes[type];
        const result = calculator.calculate(data);
        
        this.showCalculationResult(result, type);
        this.saveCalculationToHistory(type, data, result);
    }

    showCalculationResult(result, type) {
        const resultDiv = document.getElementById('calculationResult');
        if (!resultDiv) return;

        let resultHTML = '<div class="calculation-result">';
        
        Object.keys(result).forEach(key => {
            if (key !== 'unit') {
                const label = this.getResultLabel(key);
                resultHTML += `<p><strong>${label}:</strong> ${result[key]}</p>`;
            }
        });
        
        resultHTML += `<div class="result-value">${result[Object.keys(result)[Object.keys(result).length - 2]]} ${result.unit}</div>`;
        resultHTML += '</div>';
        
        resultDiv.innerHTML = resultHTML;
        resultDiv.style.display = 'block';
    }

    getResultLabel(key) {
        const labels = {
            area: 'Powierzchnia',
            totalArea: 'Powierzchnia z zapasem',
            liters: 'Potrzebne litry',
            tilesNeeded: 'Podstawowa liczba płytek',
            tilesWithWaste: 'Z zapasem'
        };
        return labels[key] || key;
    }

    saveCalculationToHistory(type, data, result) {
        const historyItem = {
            id: Date.now(),
            type: type,
            typeName: this.calculatorTypes[type].name,
            data: data,
            result: result,
            date: new Date().toISOString()
        };
        
        this.calculationHistory.unshift(historyItem);
        
        if (this.calculationHistory.length > 50) {
            this.calculationHistory = this.calculationHistory.slice(0, 50);
        }
        
        this.saveCalculationHistory();
        this.showToast('Obliczenie zapisane w historii', 'success');
    }

    renderCalculationHistory() {
        const container = document.getElementById('calculationHistory');
        if (!container) return;

        if (this.calculationHistory.length === 0) {
            container.innerHTML = '<div class="empty-state">Brak zapisanych obliczeń</div>';
            return;
        }

        container.innerHTML = this.calculationHistory.map(item => `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-type">${item.typeName}</div>
                    <div class="history-date">${new Date(item.date).toLocaleDateString('pl-PL')}</div>
                </div>
                <div class="history-result">
                    ${item.result[Object.keys(item.result)[Object.keys(item.result).length - 2]]} ${item.result.unit}
                </div>
            </div>
        `).join('');
    }

    closeCalculatorModal() {
        const modal = document.getElementById('calculatorModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Gallery Events
    setupGalleryEvents() {
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        if (takePhotoBtn) {
            takePhotoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openCamera();
            });
        }

        const captureBtn = document.getElementById('captureBtn');
        if (captureBtn) {
            captureBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.capturePhoto();
            });
        }

        const closeCameraBtn = document.getElementById('closeCameraBtn');
        if (closeCameraBtn) {
            closeCameraBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeCamera();
            });
        }
    }

    setupCamera() {
        this.stream = null;
        this.canvas = document.getElementById('photoCanvas');
        this.video = document.getElementById('cameraStream');
    }

    async openCamera() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' },
                audio: false 
            });
            
            this.video.srcObject = this.stream;
            
            const cameraSection = document.getElementById('cameraSection');
            if (cameraSection) {
                cameraSection.classList.remove('hidden');
            }
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showToast('Nie można uzyskać dostępu do kamery', 'error');
        }
    }

    capturePhoto() {
        if (!this.stream || !this.video || !this.canvas) return;

        const context = this.canvas.getContext('2d');
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        
        context.drawImage(this.video, 0, 0);
        
        const dataURL = this.canvas.toDataURL('image/jpeg', 0.8);
        
        const photo = {
            id: Date.now(),
            dataURL: dataURL,
            caption: '',
            date: new Date().toISOString()
        };
        
        this.photos.push(photo);
        this.savePhotos();
        this.renderPhotoGallery();
        this.closeCamera();
        
        this.showToast('Zdjęcie zostało zapisane', 'success');
    }

    closeCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        const cameraSection = document.getElementById('cameraSection');
        if (cameraSection) {
            cameraSection.classList.add('hidden');
        }
    }

    renderPhotoGallery() {
        const container = document.getElementById('photoGallery');
        if (!container) return;

        if (this.photos.length === 0) {
            container.innerHTML = '<div class="empty-state">Brak zdjęć. Zrób pierwsze zdjęcie używając kamery.</div>';
            return;
        }

        container.innerHTML = this.photos.map(photo => `
            <div class="photo-item" onclick="window.app.showPhotoModal(${photo.id})">
                <img src="${photo.dataURL}" alt="Zdjęcie z ${new Date(photo.date).toLocaleDateString('pl-PL')}">
                ${photo.caption ? `<div class="photo-caption">${photo.caption}</div>` : ''}
            </div>
        `).join('');
    }

    showPhotoModal(photoId) {
        const photo = this.photos.find(p => p.id === photoId);
        if (!photo) return;

        const modal = document.getElementById('photoModal');
        const title = document.getElementById('photoModalTitle');
        const image = document.getElementById('photoModalImage');
        const caption = document.getElementById('photoCaption');
        
        if (!modal || !title || !image || !caption) return;

        title.textContent = `Zdjęcie z ${new Date(photo.date).toLocaleDateString('pl-PL')}`;
        image.src = photo.dataURL;
        caption.value = photo.caption;
        
        modal.classList.remove('hidden');
        modal.setAttribute('data-photo-id', photoId);
    }

    savePhotoCaption() {
        const modal = document.getElementById('photoModal');
        const photoId = parseInt(modal.getAttribute('data-photo-id'));
        const caption = document.getElementById('photoCaption').value;
        
        const photo = this.photos.find(p => p.id === photoId);
        if (photo) {
            photo.caption = caption;
            this.savePhotos();
            this.renderPhotoGallery();
            this.showToast('Opis zdjęcia został zapisany', 'success');
        }
    }

    deletePhoto() {
        const modal = document.getElementById('photoModal');
        const photoId = parseInt(modal.getAttribute('data-photo-id'));
        
        if (confirm('Czy na pewno chcesz usunąć to zdjęcie?')) {
            this.photos = this.photos.filter(p => p.id !== photoId);
            this.savePhotos();
            this.renderPhotoGallery();
            this.closePhotoModal();
            this.showToast('Zdjęcie zostało usunięte', 'success');
        }
    }

    closePhotoModal() {
        const modal = document.getElementById('photoModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Modal Events
    setupModalEvents() {
        const orderForm = document.getElementById('orderForm');
        if (orderForm) {
            orderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderFormSubmit(e);
            });
        }

        const clientForm = document.getElementById('clientForm');
        if (clientForm) {
            clientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleClientFormSubmit(e);
            });
        }

        const timerForm = document.getElementById('timerForm');
        if (timerForm) {
            timerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTimerFormSubmit(e);
            });
        }

        // Cancel buttons
        const cancelOrderBtn = document.getElementById('cancelOrderBtn');
        if (cancelOrderBtn) {
            cancelOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeOrderModal();
            });
        }

        const cancelClientBtn = document.getElementById('cancelClientBtn');
        if (cancelClientBtn) {
            cancelClientBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeClientModal();
            });
        }

        const cancelTimerBtn = document.getElementById('cancelTimerBtn');
        if (cancelTimerBtn) {
            cancelTimerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeTimerModal();
            });
        }

        // Add client from order form
        const addClientFromOrderBtn = document.getElementById('addClientFromOrder');
        if (addClientFromOrderBtn) {
            addClientFromOrderBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeOrderModal();
                this.showClientModal();
            });
        }

        // Order form status change
        const orderStatusSelect = document.getElementById('orderStatus');
        if (orderStatusSelect) {
            orderStatusSelect.addEventListener('change', () => {
                this.toggleRatingField();
            });
        }

        // Photo modal actions
        const savePhotoCaptionBtn = document.getElementById('savePhotoCaption');
        if (savePhotoCaptionBtn) {
            savePhotoCaptionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.savePhotoCaption();
            });
        }

        const deletePhotoBtn = document.getElementById('deletePhoto');
        if (deletePhotoBtn) {
            deletePhotoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deletePhoto();
            });
        }

        // Modal close buttons
        const modalCloses = document.querySelectorAll('.modal-close');
        modalCloses.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = btn.closest('.modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Close modals on backdrop click
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        });
    }

    handleOrderFormSubmit(event) {
        const formData = new FormData(event.target);
        
        const orderData = {
            clientId: formData.get('orderClient'),
            description: formData.get('orderDescription'),
            category: formData.get('orderCategory'),
            cost: parseFloat(formData.get('orderCost')),
            price: parseFloat(formData.get('orderPrice')),
            hours: parseFloat(formData.get('orderHours')),
            date: formData.get('orderDate'),
            status: formData.get('orderStatus'),
            rating: formData.get('orderRating') ? parseInt(formData.get('orderRating')) : null,
            notes: formData.get('orderNotes')
        };

        if (!orderData.clientId) {
            this.showToast('Wybierz klienta', 'warning');
            return;
        }

        this.saveOrder(orderData);
        this.closeOrderModal();
    }

    handleClientFormSubmit(event) {
        const formData = new FormData(event.target);
        
        const clientData = {
            name: formData.get('clientName'),
            phone: formData.get('clientPhone'),
            email: formData.get('clientEmail'),
            address: formData.get('clientAddress'),
            note: formData.get('clientNote')
        };

        this.saveClient(clientData);
        this.closeClientModal();
    }

    handleTimerFormSubmit(event) {
        const formData = new FormData(event.target);
        
        const taskName = formData.get('timerTaskName');
        const orderId = formData.get('timerOrderId') || null;

        if (!taskName.trim()) {
            this.showToast('Wprowadź nazwę zadania', 'warning');
            return;
        }

        this.startTimer(taskName, orderId);
        this.closeTimerModal();
    }

    closeOrderModal() {
        const modal = document.getElementById('orderModal');
        if (modal) modal.classList.add('hidden');
        this.editingOrderId = null;
    }

    closeClientModal() {
        const modal = document.getElementById('clientModal');
        if (modal) modal.classList.add('hidden');
        this.editingClientId = null;
    }

    closeTimerModal() {
        const modal = document.getElementById('timerModal');
        if (modal) modal.classList.add('hidden');
    }

    // Utility functions
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            if (show) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${this.getToastTitle(type)}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 4000);
    }

    getToastTitle(type) {
        const titles = {
            success: 'Sukces',
            error: 'Błąd',
            warning: 'Ostrzeżenie',
            info: 'Informacja'
        };
        return titles[type] || 'Powiadomienie';
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing FachowiecApp...');
    window.app = new FachowiecApp();
    window.app.init();
});
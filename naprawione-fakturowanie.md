# Naprawione Fakturowanie - FachowiecApp

## Identyfikacja problemów

### 1. Problemy z generowaniem PDF
- jsPDF nie była poprawnie zaimportowana
- Brak obsługi błędów przy generowaniu PDF
- Problemy z polskimi znakami w PDF
- Nieprawidłowa struktura danych

### 2. Problemy z integracją modułu
- Brak właściwej integracji FinanceModule
- Niedziałające eventy dla operacji finansowych
- Problemy z zapisem do LocalStorage

### 3. Problemy UI/UX
- Brak wizualnych wskaźników statusu płatności
- Niedziałające przyciski akcji
- Brak feedbacku dla użytkownika

## Naprawione rozwiązanie

### 1. Poprawiony import jsPDF

```html
<!-- W sekcji <head> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

### 2. Naprawiony FinanceModule

```javascript
class FinanceModule {
    constructor(orderService) {
        this.orderService = orderService;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFinanceData();
    }

    setupEventListeners() {
        // Event listener dla oznaczania jako opłacone
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mark-paid-btn')) {
                const orderId = parseInt(e.target.dataset.orderId);
                this.markOrderAsPaid(orderId);
            }
            
            if (e.target.classList.contains('generate-pdf-btn')) {
                const orderId = parseInt(e.target.dataset.orderId);
                this.generateInvoicePDF(orderId);
            }
        });
    }

    markOrderAsPaid(orderId) {
        try {
            const orders = this.orderService.getAll();
            const order = orders.find(o => o.id === orderId);
            
            if (order && !order.paid) {
                order.paid = true;
                order.paymentDate = new Date().toISOString().slice(0, 10);
                order.invoiceNumber = `INV-${Date.now()}`;
                
                this.orderService.update(order);
                this.showToast('Zlecenie oznaczone jako opłacone!', 'success');
                this.renderFinanceList();
            }
        } catch (error) {
            console.error('Error marking order as paid:', error);
            this.showToast('Błąd podczas oznaczania jako opłacone', 'error');
        }
    }

    generateInvoicePDF(orderId) {
        try {
            const orders = this.orderService.getAll();
            const order = orders.find(o => o.id === orderId);
            
            if (!order) {
                this.showToast('Nie znaleziono zlecenia', 'error');
                return;
            }

            // Sprawdź czy jsPDF jest dostępne
            if (typeof window.jsPDF === 'undefined') {
                this.showToast('Biblioteka PDF nie jest załadowana', 'error');
                return;
            }

            const { jsPDF } = window;
            const doc = new jsPDF();

            // Konfiguracja dla polskich znaków
            doc.setFont('helvetica');
            
            // Nagłówek faktury
            doc.setFontSize(18);
            doc.text('FAKTURA', 20, 30);
            
            doc.setFontSize(12);
            doc.text(`Numer: ${order.invoiceNumber || 'INV-' + order.id}`, 20, 50);
            doc.text(`Data: ${order.paymentDate || order.date}`, 20, 60);
            
            // Dane klienta
            doc.text('KLIENT:', 20, 80);
            doc.text(order.client, 20, 90);
            
            // Szczegóły zlecenia
            doc.text('SZCZEGÓŁY ZLECENIA:', 20, 110);
            doc.text(`Opis: ${order.description || 'Usługa fachowa'}`, 20, 120);
            doc.text(`Data realizacji: ${order.date}`, 20, 130);
            doc.text(`Czas realizacji: ${order.hours || 0}h`, 20, 140);
            
            // Koszty
            doc.text('ROZLICZENIE:', 20, 160);
            doc.text(`Koszt materiałów: ${(order.cost || 0).toFixed(2)} zł`, 20, 170);
            doc.text(`Robocizna: ${((order.price || 0) - (order.cost || 0)).toFixed(2)} zł`, 20, 180);
            doc.text(`RAZEM: ${(order.price || 0).toFixed(2)} zł`, 20, 190);
            
            // Status płatności
            const status = order.paid ? 'OPŁACONE' : 'DO ZAPŁATY';
            doc.text(`Status: ${status}`, 20, 210);
            
            // Stopka
            doc.setFontSize(10);
            doc.text('Dziękujemy za skorzystanie z naszych usług!', 20, 250);
            
            // Zapisz PDF
            const fileName = `Faktura-${order.client.replace(/\s+/g, '-')}-${order.id}.pdf`;
            doc.save(fileName);
            
            this.showToast('Faktura została wygenerowana!', 'success');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showToast('Błąd podczas generowania faktury', 'error');
        }
    }

    renderFinanceList() {
        const container = document.getElementById('financeContainer');
        if (!container) return;

        const orders = this.orderService.getAll();
        
        const html = `
            <div class="finance-section">
                <h3>Zarządzanie finansami</h3>
                <div class="finance-stats">
                    <div class="stat-card">
                        <h4>Przychody opłacone</h4>
                        <span class="stat-value">${this.calculatePaidRevenue(orders)} zł</span>
                    </div>
                    <div class="stat-card">
                        <h4>Należności</h4>
                        <span class="stat-value">${this.calculateUnpaidRevenue(orders)} zł</span>
                    </div>
                </div>
                
                <div class="orders-list">
                    ${orders.map(order => this.renderOrderRow(order)).join('')}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    renderOrderRow(order) {
        const statusClass = order.paid ? 'paid' : 'unpaid';
        const statusText = order.paid ? 'Opłacone' : 'Należność';
        
        return `
            <div class="order-row">
                <div class="order-info">
                    <strong>${order.client}</strong>
                    <span class="order-date">${order.date}</span>
                    <span class="order-amount">${order.price} zł</span>
                </div>
                <div class="order-status">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="order-actions">
                    <button class="btn btn--sm generate-pdf-btn" data-order-id="${order.id}">
                        📄 PDF
                    </button>
                    ${!order.paid ? `
                        <button class="btn btn--sm btn--primary mark-paid-btn" data-order-id="${order.id}">
                            ✓ Oznacz jako opłacone
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    calculatePaidRevenue(orders) {
        return orders
            .filter(o => o.paid && o.status === 'completed')
            .reduce((sum, o) => sum + (o.price || 0), 0)
            .toFixed(2);
    }

    calculateUnpaidRevenue(orders) {
        return orders
            .filter(o => !o.paid && o.status === 'completed')
            .reduce((sum, o) => sum + (o.price || 0), 0)
            .toFixed(2);
    }

    showToast(message, type = 'info') {
        // Implementacja toast notifications
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span>${message}</span>
                <button class="toast-close">×</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
        
        // Manual close
        toast.querySelector('.toast-close').onclick = () => toast.remove();
    }
}
```

### 3. Poprawione style CSS

```css
/* Statusy płatności */
.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.status-badge.paid {
    background-color: rgba(34, 197, 94, 0.1);
    color: #059669;
    border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.unpaid {
    background-color: rgba(239, 68, 68, 0.1);
    color: #dc2626;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Finance section */
.finance-section {
    padding: 20px;
    background: var(--color-surface);
    border-radius: 12px;
    margin-bottom: 24px;
}

.finance-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    background: var(--color-background);
    padding: 16px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
}

.stat-card h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: var(--color-text-secondary);
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--color-primary);
}

/* Order rows */
.order-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    margin-bottom: 8px;
    background: var(--color-background);
}

.order-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.order-date {
    font-size: 12px;
    color: var(--color-text-secondary);
}

.order-amount {
    font-weight: bold;
    color: var(--color-primary);
}

.order-actions {
    display: flex;
    gap: 8px;
}

/* Toast notifications */
.toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
}

.toast--success {
    border-left: 4px solid #059669;
}

.toast--error {
    border-left: 4px solid #dc2626;
}

.toast-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.toast-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--color-text-secondary);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
```

### 4. Integracja z główną aplikacją

```javascript
// W app.js - dodać inicjalizację FinanceModule
class FachowiecApp {
    constructor() {
        this.orderService = new OrderService();
        this.financeModule = new FinanceModule(this.orderService); // Dodane
        this.init();
    }
    
    // ... reszta kodu
}

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FachowiecApp();
});
```

### 5. Dodanie HTML dla sekcji finansów

```html
<!-- Dodać do głównego HTML -->
<section id="financeSection" class="section hidden">
    <div class="container">
        <h2>Finanse i Fakturowanie</h2>
        <div id="financeContainer">
            <!-- Zawartość będzie generowana dynamicznie -->
        </div>
    </div>
</section>
```

## Instrukcja testowania

1. **Sprawdź import jsPDF** - otwórz konsolę przeglądarki i wpisz `window.jsPDF` - powinno zwrócić obiekt
2. **Testuj oznaczanie jako opłacone** - kliknij przycisk "Oznacz jako opłacone" przy zleceniu
3. **Testuj generowanie PDF** - kliknij przycisk "PDF" przy zleceniu
4. **Sprawdź statusy** - opłacone zlecenia powinny mieć zielony status
5. **Sprawdź notyfikacje** - powinny pojawiać się toast notifications

## Dodatkowe usprawnienia

### Walidacja danych przed generowaniem PDF
```javascript
validateOrderForPDF(order) {
    const errors = [];
    
    if (!order.client) errors.push('Brak nazwy klienta');
    if (!order.price || order.price <= 0) errors.push('Nieprawidłowa cena');
    if (!order.date) errors.push('Brak daty zlecenia');
    
    return errors;
}
```

### Eksport danych do CSV
```javascript
exportToCSV() {
    const orders = this.orderService.getAll();
    const csvContent = this.generateCSVContent(orders);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finanse_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
}
```

To naprawione rozwiązanie powinno w pełni działać i pozwolić na:
- Oznaczanie zleceń jako opłacone/nieopłacone
- Generowanie faktur PDF z polskimi znakami
- Wyświetlanie statusów płatności
- Zarządzanie finansami z przejrzystym interfejsem
# FachowiecApp - Pełna Dokumentacja Projektu

## Spis treści
1. [Wprowadzenie](#wprowadzenie)
2. [Architektura aplikacji](#architektura-aplikacji)
3. [Funkcjonalności](#funkcjonalności)
4. [Struktura projektu](#struktura-projektu)
5. [Moduły aplikacji](#moduły-aplikacji)
6. [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
7. [Przewodnik użytkownika](#przewodnik-użytkownika)
8. [API i integracje](#api-i-integracje)
9. [Rozwój i rozszerzenia](#rozwój-i-rozszerzenia)
10. [Rozwiązywanie problemów](#rozwiązywanie-problemów)

---

## Wprowadzenie

**FachowiecApp** to kompletna aplikacja webowa typu PWA (Progressive Web App) przeznaczona dla fachowców wykonujących usługi remontowo-budowlane. Aplikacja umożliwia kompleksowe zarządzanie zleceniami, śledzenie czasu pracy, generowanie kosztorysów, dokumentację fotograficzną oraz zarządzanie finansami i fakturowaniem.

### Główne cele projektu
- **Digitalizacja procesów** pracy fachowca
- **Zwiększenie efektywności** zarządzania zleceniami
- **Automatyzacja** dokumentacji i rozliczeń
- **Mobilność** - dostęp z dowolnego urządzenia
- **Offline-first** - działanie bez połączenia internetowego

### Kluczowe korzyści
- ⏱️ **Oszczędność czasu** - automatyzacja procesów administracyjnych
- 💰 **Lepsza rentowność** - precyzyjne śledzenie kosztów i czasu
- 📊 **Analityka biznesowa** - raporty i KPI
- 📱 **Mobilność** - dostęp z telefonu, tabletu i komputera
- 🔒 **Bezpieczeństwo danych** - lokalne przechowywanie danych

---

## Architektura aplikacji

### Typ architektury
**Single Page Application (SPA)** z architekturą modułową opartą na wzorcu **MVC (Model-View-Controller)**.

### Technologie główne
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: LocalStorage, IndexedDB, Cache API
- **UI Framework**: Custom Design System (oparty na Perplexity Design System)
- **Charts**: Chart.js
- **PDF Generation**: jsPDF
- **PWA**: Service Worker, Web App Manifest

### Warstwa danych
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   LocalStorage  │    │     IndexedDB    │    │    Cache API    │
│                 │    │                  │    │                 │
│ • Zlecenia      │    │ • Zdjęcia        │    │ • Assets        │
│ • Ustawienia    │    │ • Logi czasu     │    │ • HTML/CSS/JS   │
│ • Konfiguracja  │    │ • Historia       │    │ • Manifest      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Architektura modułowa
```
FachowiecApp (Core)
├── OrderService (Zarządzanie zleceniami)
├── TimeTrackingModule (Śledzenie czasu)
├── FinanceModule (Finanse i fakturowanie)
├── PhotoService (Dokumentacja fotograficzna)
├── CalculatorService (Kalkulatory kosztów)
├── ReportsModule (Raporty i analityka)
├── ThemeManager (Zarządzanie motywami)
└── StorageService (Zarządzanie danymi)
```

---

## Funkcjonalności

### 1. Dashboard i KPI
**Opis**: Główny panel z kluczowymi wskaźnikami wydajności
**Funkcje**:
- Widok KPI w czasie rzeczywistym
- Wykresy trendów przychodów i zleceń
- Analiza rentowności
- Porównanie okresów
- Eksport danych do CSV/PDF

**KPI Metrics**:
- Liczba zrealizowanych zleceń
- Łączne przychody i średni przychód na zlecenie
- Średni czas realizacji
- Średnia ocena klienta
- Liczba aktywnych zleceń
- Współczynnik rentowności

### 2. Zarządzanie zleceniami
**Opis**: Kompleksowe zarządzanie cyklem życia zlecenia
**Funkcje**:
- Tworzenie nowych zleceń
- Edycja i aktualizacja statusów
- Przypisywanie kategorii i tagów
- Historia zmian
- Powiadomienia o terminach

**Statusy zleceń**:
- `pending` - Oczekujące
- `in-progress` - W realizacji
- `completed` - Zakończone
- `cancelled` - Anulowane

**Model danych zlecenia**:
```javascript
{
  id: Number,
  client: String,
  description: String,
  cost: Number,          // Koszty materiałów
  price: Number,         // Cena dla klienta
  hours: Number,         // Planowane godziny
  actualHours: Number,   // Rzeczywiste godziny (z time tracking)
  date: String,          // Data rozpoczęcia
  deadline: String,      // Termin realizacji
  status: String,        // Status zlecenia
  rating: Number,        // Ocena klienta (1-5)
  paid: Boolean,         // Czy opłacone
  paymentDate: String,   // Data płatności
  invoiceNumber: String, // Numer faktury
  category: String,      // Kategoria usługi
  address: String,       // Adres realizacji
  notes: String,         // Notatki
  photos: Array,         // ID zdjęć
  timeLogs: Array        // Logi czasu pracy
}
```

### 3. Śledzenie czasu pracy (Time Tracking)
**Opis**: Precyzyjne mierzenie czasu poświęconego na każde zlecenie
**Funkcje**:
- Stoper per zlecenie (Start/Pause/Stop)
- Obsługa wielu sesji pracy
- Dodawanie ręcznych wpisów czasu
- Historia sesji z notatkami
- Eksport logów czasu do CSV
- Integracja z analizą rentowności

**Model danych time log**:
```javascript
{
  id: String,
  orderId: Number,
  startTime: String,     // ISO datetime
  endTime: String,       // ISO datetime
  durationSeconds: Number,
  note: String,
  type: String,          // 'automatic' | 'manual'
  status: String         // 'running' | 'paused' | 'stopped'
}
```

**Algorytm trackingu**:
1. Sprawdzenie czy istnieje już aktywna sesja dla zlecenia
2. Utworzenie nowego logu z statusem 'running'
3. Obsługa pauz - zapis endTime, utworzenie nowego logu przy wznowieniu
4. Zakończenie - ustawienie endTime i status 'stopped'
5. Aktualizacja actualHours w zleceniu

### 4. Finanse i fakturowanie
**Opis**: Zarządzanie płatnościami i generowanie dokumentów
**Funkcje**:
- Oznaczanie zleceń jako opłacone/nieopłacone
- Generowanie faktur PDF
- Śledzenie należności
- Analiza rentowności
- Raporty finansowe za okresy
- Eksport danych księgowych

**Proces fakturowania**:
1. Oznaczenie zlecenia jako opłacone
2. Automatyczne wygenerowanie numeru faktury
3. Zapisanie daty płatności
4. Możliwość wygenerowania PDF faktury
5. Aktualizacja statystyk finansowych

**Struktura faktury PDF**:
- Nagłówek z numerem i datą
- Dane firmy i klienta
- Szczegóły zlecenia
- Rozliczenie kosztów (materiały + robocizna)
- Status płatności
- Stopka z danymi kontaktowymi

### 5. Dokumentacja fotograficzna
**Opis**: Zarządzanie zdjęciami przed, w trakcie i po realizacji
**Funkcje**:
- Dodawanie zdjęć z kamery lub galerii
- Automatyczna kompresja obrazów
- Kategoryzacja zdjęć (przed/po/problem/rozwiązanie)
- Geolokalizacja (opcjonalna)
- Galeria projektów
- Eksport zdjęć do PDF

**Typy zdjęć**:
- `before` - Przed rozpoczęciem prac
- `progress` - W trakcie realizacji
- `after` - Po zakończeniu prac
- `issue` - Problemy/usterki
- `solution` - Rozwiązania

### 6. Kalkulatory kosztów
**Opis**: Narzędzia do szybkiego wyliczania kosztów materiałów
**Funkcje**:
- Kalkulator farb (powierzchnia → litry → koszt)
- Kalkulator płytek (powierzchnia → sztuki → koszt)
- Kalkulator materiałów budowlanych
- Historia obliczeń
- Zapisywanie do zlecenia
- Szablony często używanych materiałów

**Typy kalkulatorów**:
1. **Kalkulator farb**:
   - Powierzchnia do malowania (m²)
   - Wydajność farby (m²/L)
   - Cena za litr
   - Liczba warstw

2. **Kalkulator płytek**:
   - Wymiary pomieszczenia
   - Rozmiar płytki
   - Cena za m² lub sztukę
   - Margines na straty (%)

3. **Kalkulator uniwersalny**:
   - Dowolne jednostki miary
   - Przeliczniki
   - Marże handlowe

### 7. Raporty i analityka
**Opis**: Szczegółowe raporty biznesowe i analizy
**Funkcje**:
- Raporty miesięczne/kwartalne/roczne
- Analiza rentowności per typ zlecenia
- Porównanie planowanego vs rzeczywistego czasu
- Top klienci i najbardziej zyskowne projekty
- Trendy sezonowe
- Prognozy przychodów

### 8. Ustawienia i konfiguracja
**Opis**: Personalizacja aplikacji
**Funkcje**:
- Dane firmy (logo, adres, NIP, REGON)
- Stawki godzinowe
- Kategorie zleceń
- Szablony faktur
- Motyw jasny/ciemny
- Kopie zapasowe danych
- Import/eksport ustawień

---

## Struktura projektu

```
fachowiec-app/
│
├── index.html                 # Główny plik HTML
├── app.js                     # Główna logika aplikacji
├── style.css                  # Style CSS
├── manifest.json              # Web App Manifest (PWA)
├── sw.js                      # Service Worker
│
├── modules/                   # Moduły aplikacji
│   ├── orders/
│   │   ├── OrderService.js
│   │   ├── OrderListView.js
│   │   └── OrderDetailView.js
│   │
│   ├── time-tracking/
│   │   ├── TimeTrackingModule.js
│   │   ├── TimerWidget.js
│   │   └── TimeLogService.js
│   │
│   ├── finance/
│   │   ├── FinanceModule.js
│   │   ├── InvoiceGenerator.js
│   │   └── PaymentTracker.js
│   │
│   ├── photos/
│   │   ├── PhotoService.js
│   │   ├── CameraWidget.js
│   │   └── GalleryView.js
│   │
│   ├── calculator/
│   │   ├── CalculatorService.js
│   │   ├── PaintCalculator.js
│   │   └── TileCalculator.js
│   │
│   ├── reports/
│   │   ├── ReportsModule.js
│   │   ├── KPIDashboard.js
│   │   └── ChartsService.js
│   │
│   ├── theme/
│   │   └── ThemeManager.js
│   │
│   └── storage/
│       ├── StorageService.js
│       ├── IndexedDBAdapter.js
│       └── LocalStorageAdapter.js
│
├── assets/                    # Zasoby statyczne
│   ├── icons/
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── favicon.ico
│   │
│   ├── images/
│   │   ├── logo.png
│   │   └── placeholders/
│   │
│   └── fonts/
│       └── FKGroteskNeue.woff2
│
├── docs/                      # Dokumentacja
│   ├── api-reference.md
│   ├── user-guide.md
│   ├── developer-guide.md
│   └── changelog.md
│
├── tests/                     # Testy
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── build/                     # Pliki produkcyjne
    ├── index.html
    ├── app.min.js
    ├── style.min.css
    └── assets/
```

---

## Moduły aplikacji

### OrderService
**Odpowiedzialność**: Zarządzanie zleceniami
**Główne metody**:
```javascript
class OrderService {
  getAll()                    // Pobiera wszystkie zlecenia
  getById(id)                 // Pobiera zlecenie po ID
  create(order)               // Tworzy nowe zlecenie
  update(order)               // Aktualizuje zlecenie
  delete(id)                  // Usuwa zlecenie
  getByStatus(status)         // Filtruje po statusie
  getByDateRange(from, to)    // Filtruje po dacie
  calculateStats()            // Oblicza statystyki
}
```

### TimeTrackingModule
**Odpowiedzialność**: Śledzenie czasu pracy
**Główne metody**:
```javascript
class TimeTrackingModule {
  startTimer(orderId)         // Rozpoczyna pomiar czasu
  pauseTimer(orderId)         // Pauzuje pomiar
  stopTimer(orderId)          // Kończy pomiar
  addManualEntry(log)         // Dodaje ręczny wpis
  getTimeLogs(orderId)        // Pobiera logi czasu
  calculateTotalHours(orderId) // Oblicza całkowity czas
  exportTimeLogs(format)      // Eksportuje logi
}
```

### FinanceModule
**Odpowiedzialność**: Zarządzanie finansami
**Główne metody**:
```javascript
class FinanceModule {
  markOrderAsPaid(orderId)    // Oznacza jako opłacone
  generateInvoicePDF(orderId) // Generuje fakturę PDF
  calculateRevenue(period)    // Oblicza przychody
  getUnpaidOrders()          // Pobiera nieopłacone zlecenia
  exportFinanceData(format)   // Eksportuje dane finansowe
  calculateProfitability()    // Oblicza rentowność
}
```

### PhotoService
**Odpowiedzialność**: Zarządzanie zdjęciami
**Główne metody**:
```javascript
class PhotoService {
  capturePhoto(orderId, type) // Robi zdjęcie
  uploadPhoto(file, orderId)  // Upload zdjęcia
  getPhotos(orderId, type)    // Pobiera zdjęcia
  deletePhoto(photoId)        // Usuwa zdjęcie
  compressImage(file)         // Kompresuje obraz
  exportPhotos(orderId, format) // Eksportuje zdjęcia
}
```

### CalculatorService
**Odpowiedzialność**: Kalkulatory kosztów
**Główne metody**:
```javascript
class CalculatorService {
  calculatePaint(area, coats, efficiency) // Kalkulator farb
  calculateTiles(width, height, tileSize)  // Kalkulator płytek
  saveCalculation(calc, orderId)           // Zapisuje obliczenie
  getCalculationHistory()                  // Historia obliczeń
  getTemplates()                           // Szablony materiałów
}
```

---

## Instalacja i uruchomienie

### Wymagania systemowe
- Przeglądarka z obsługą ES6+ (Chrome 60+, Firefox 60+, Safari 12+)
- Obsługa Service Workers
- Dostęp do kamery (opcjonalnie)
- 50MB wolnego miejsca na dane offline

### Instalacja deweloperska

1. **Klonowanie repozytorium**:
```bash
git clone https://github.com/your-repo/fachowiec-app.git
cd fachowiec-app
```

2. **Instalacja serwera deweloperskiego**:
```bash
# Opcja 1: Python
python -m http.server 3000

# Opcja 2: Node.js serve
npm install -g serve
serve . -p 3000

# Opcja 3: PHP
php -S localhost:3000
```

3. **Otwarcie w przeglądarce**:
```
http://localhost:3000
```

### Instalacja produkcyjna

1. **Deploy na serwerze statycznym**:
```bash
# Skopiuj pliki na serwer
rsync -av fachowiec-app/ user@server:/var/www/html/

# Lub użyj GitHub Pages, Netlify, Vercel
```

2. **Konfiguracja HTTPS** (wymagane dla PWA):
```nginx
server {
    listen 443 ssl;
    server_name fachowiec-app.example.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        root /var/www/html/fachowiec-app;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

3. **Instalacja jako PWA**:
- Otwórz aplikację w przeglądarce
- Kliknij "Zainstaluj aplikację" lub użyj menu przeglądarki
- Aplikacja będzie dostępna jako natywna aplikacja

---

## Przewodnik użytkownika

### Pierwsze uruchomienie

1. **Ekran powitalny**:
   - Wprowadzenie do aplikacji
   - Ustawienie danych firmy
   - Wybór stawki godzinowej
   - Konfiguracja kategorii usług

2. **Utworzenie pierwszego zlecenia**:
   - Kliknij "Dodaj zlecenie"
   - Wypełnij dane klienta
   - Opisz zakres prac
   - Ustaw cenę i koszty materiałów
   - Zapisz zlecenie

3. **Rozpoczęcie pracy**:
   - Otwórz szczegóły zlecenia
   - Kliknij "▶️ Start timer"
   - Rozpocznij realizację
   - Rób zdjęcia postępu

### Codzienne użytkowanie

1. **Rano**:
   - Sprawdź dashboard z KPI
   - Przejrzyj aktywne zlecenia
   - Zaplanuj dzień pracy

2. **W trakcie pracy**:
   - Włącz timer dla bieżącego zlecenia
   - Dokumentuj postęp zdjęciami
   - Dodawaj notatki

3. **Po zakończeniu**:
   - Zatrzymaj timer
   - Zrób zdjęcia "po"
   - Zaktualizuj status zlecenia
   - Wygeneruj fakturę

### Zarządzanie danymi

1. **Kopie zapasowe**:
   - Menu → Ustawienia → Eksport danych
   - Wybierz format (JSON/CSV)
   - Zapisz plik w bezpiecznym miejscu

2. **Import danych**:
   - Menu → Ustawienia → Import danych
   - Wybierz plik kopii zapasowej
   - Potwierdź import

3. **Synchronizacja między urządzeniami**:
   - Eksportuj dane z pierwszego urządzenia
   - Zaimportuj na drugim urządzeniu
   - Regularne kopie zapasowe

---

## API i integracje

### Wewnętrzne API

#### StorageService API
```javascript
// Operacje CRUD
StorageService.create(tableName, data)
StorageService.read(tableName, id)
StorageService.update(tableName, id, data)
StorageService.delete(tableName, id)
StorageService.query(tableName, filter)

// Bulk operations
StorageService.bulkCreate(tableName, dataArray)
StorageService.bulkDelete(tableName, ids)

// Schema management
StorageService.createTable(tableName, schema)
StorageService.migrateTable(tableName, newSchema)
```

#### EventSystem API
```javascript
// Event handling
EventSystem.on(eventName, callback)
EventSystem.off(eventName, callback)
EventSystem.emit(eventName, data)

// Built-in events
'order:created', 'order:updated', 'order:deleted'
'timer:started', 'timer:paused', 'timer:stopped'
'photo:added', 'photo:deleted'
'payment:marked', 'invoice:generated'
```

### Zewnętrzne integracje (przyszłe rozszerzenia)

1. **Synchronizacja w chmurze**:
   - Google Drive API
   - Dropbox API
   - Firebase Firestore

2. **Płatności online**:
   - Stripe API
   - PayPal API
   - Przelewy24 API

3. **Księgowość**:
   - Fakturownia API
   - InFakt API
   - WFirma API

4. **Komunikacja**:
   - SMS API (np. SMSapi.pl)
   - Email API (np. SendGrid)
   - Push notifications

---

## Rozwój i rozszerzenia

### Roadmapa rozwoju

#### Wersja 2.0 (Q3 2025)
- [ ] Synchronizacja w chmurze
- [ ] Współpraca zespołowa
- [ ] Zaawansowane raporty
- [ ] Integracja z systemami księgowymi
- [ ] Aplikacja mobilna (React Native)

#### Wersja 2.1 (Q4 2025)
- [ ] AI-powered insights
- [ ] Automatyczne kategoryzowanie
- [ ] Predykcja kosztów
- [ ] OCR dla dokumentów
- [ ] Voice commands

#### Wersja 3.0 (2026)
- [ ] Multi-tenant architecture
- [ ] White-label solutions
- [ ] Marketplace integracji
- [ ] Advanced analytics
- [ ] IoT devices integration

### Architektura przyszłych rozszerzeń

#### Backend API (Node.js + Express)
```javascript
// Przykładowa struktura API
/api/v1/
├── /auth           # Autoryzacja i uwierzytelnienie
├── /users          # Zarządzanie użytkownikami
├── /companies      # Dane firm
├── /orders         # Zlecenia
├── /time-logs      # Logi czasu
├── /photos         # Zdjęcia
├── /invoices       # Faktury
├── /reports        # Raporty
└── /sync           # Synchronizacja
```

#### Database Schema (PostgreSQL)
```sql
-- Główne tabele
users (id, email, password_hash, company_id, role, created_at)
companies (id, name, address, tax_id, settings, created_at)
orders (id, company_id, client_data, description, cost, price, status, created_at)
time_logs (id, order_id, user_id, start_time, end_time, duration, note)
photos (id, order_id, user_id, file_path, type, metadata, created_at)
invoices (id, order_id, invoice_number, issue_date, due_date, status)
```

### Wkład społeczności

1. **Proces kontrybuowania**:
   - Fork repozytorium
   - Utwórz feature branch
   - Implementuj zmiany
   - Dodaj testy
   - Utwórz Pull Request

2. **Standardy kodowania**:
   - ESLint configuration
   - Prettier formatting
   - JSDoc documentation
   - Unit tests coverage > 80%

3. **Zgłaszanie błędów**:
   - Użyj GitHub Issues
   - Opisz kroki reprodukcji
   - Dodaj screenshoty
   - Podaj informacje o przeglądarce

---

## Rozwiązywanie problemów

### Najczęstsze problemy

#### 1. Aplikacja nie ładuje się
**Przyczyny**:
- Brak obsługi Service Workers
- Problemy z HTTPS
- Nieaktualna przeglądarka

**Rozwiązania**:
```javascript
// Sprawdź obsługę Service Workers
if ('serviceWorker' in navigator) {
  console.log('Service Worker jest obsługiwany');
} else {
  console.error('Service Worker nie jest obsługiwany');
}

// Wymuś odświeżenie cache
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

#### 2. Dane nie zapisują się
**Przyczyny**:
- Brak miejsca w LocalStorage
- Błędy w IndexedDB
- Tryb prywatny przeglądarki

**Rozwiązania**:
```javascript
// Sprawdź dostępne miejsce
navigator.storage.estimate().then(estimate => {
  console.log('Quota:', estimate.quota);
  console.log('Usage:', estimate.usage);
});

// Wyczyść stare dane
StorageService.cleanup();
```

#### 3. Timer nie działa poprawnie
**Przyczyny**:
- Przeglądarka w tle
- Problemy z timestamps
- Błędy w logice

**Rozwiązania**:
```javascript
// Użyj Web Workers dla timera
const worker = new Worker('timer-worker.js');
worker.postMessage({action: 'start', orderId: 123});

// Synchronizuj czas przy wznowieniu
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    TimeTrackingModule.syncTimers();
  }
});
```

#### 4. PDF nie generuje się
**Przyczyny**:
- Brak biblioteki jsPDF
- Problemy z polskimi znakami
- Zbyt duże dane

**Rozwiązania**:
```javascript
// Sprawdź dostępność jsPDF
if (typeof window.jsPDF === 'undefined') {
  console.error('jsPDF nie jest załadowane');
  // Załaduj dynamicznie
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
  document.head.appendChild(script);
}

// Obsługa polskich znaków
doc.setFont('helvetica');
doc.setLanguage('pl');
```

### Debugowanie

#### 1. Włączenie debug mode
```javascript
// W console przeglądarki
localStorage.setItem('debug', 'true');
location.reload();
```

#### 2. Monitoring wydajności
```javascript
// Performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(entry.name, entry.duration);
  }
});
observer.observe({entryTypes: ['navigation', 'resource']});
```

#### 3. Error tracking
```javascript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Wyślij do systemu logowania
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

### Optymalizacja wydajności

#### 1. Lazy loading modułów
```javascript
// Dynamiczny import modułów
async function loadModule(moduleName) {
  const module = await import(`./modules/${moduleName}/${moduleName}.js`);
  return module.default;
}
```

#### 2. Kompresja danych
```javascript
// Kompresja danych w LocalStorage
function compressData(data) {
  return LZString.compress(JSON.stringify(data));
}

function decompressData(compressed) {
  return JSON.parse(LZString.decompress(compressed));
}
```

#### 3. Background processing
```javascript
// Web Workers dla ciężkich operacji
const worker = new Worker('background-processor.js');
worker.postMessage({
  action: 'generateReport',
  data: largeDataset
});
```

---

## Licencja i Copyright

**FachowiecApp** © 2025 - MIT License

Aplikacja została stworzona z myślą o wspieraniu polskich fachowców w cyfryzacji ich działalności. Kod źródłowy jest dostępny na licencji MIT, co oznacza swobodę używania, modyfikowania i dystrybucji.

### Używane biblioteki
- Chart.js - MIT License
- jsPDF - MIT License
- Perplexity Design System - MIT License

### Kontakt
- Email: support@fachowiecapp.pl
- GitHub: https://github.com/fachowiecapp
- Dokumentacja: https://docs.fachowiecapp.pl

---

*Dokumentacja ostatnio aktualizowana: 2 sierpnia 2025*
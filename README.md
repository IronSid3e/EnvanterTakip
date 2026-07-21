# Şua Tarım Envanter Takip Sistemi

Herhangi bir satış firmasının barkodla ürün takibi yapabileceği genel bir envanter yönetim sistemidir.

## Yapılan İşler

- Barkod ile ürün ekleme ve arama
- Stok takibi ve otomatik güncelleme (satışta stok azalır)
- Satış kaydı oluşturma ve listeleme
- Dashboard istatistikleri (toplam ürün, satış, gelir, stok durumu)
- Çoklu kategori desteği
- Arama, filtreleme ve sıralama (ürünler ve satışlar)
- Sayfalama (pagination)
- Hata yakalama middleware'i (global exception handler)
- FluentValidation ile input doğrulama

## Proje Yapısı

```
EnvanterTakip/
├── EnvanterTakip.API/        # ASP.NET Core 10 REST API
├── EnvanterTakip.Admin/      # React 19 + Vite 8 admin paneli (WIP)
├── EnvanterTakip.mobile/     # Expo SDK 54 + React Native mobil uygulama
└── EnvanterTakip.sln         # .NET solution dosyası
```

### Sub-projeler

| Dizin | Stack | Komut | Port |
|---|---|---|---|
| `EnvanterTakip.API/` | ASP.NET Core 10, C#, EF Core, PostgreSQL | `dotnet run` | 5279 |
| `EnvanterTakip.Admin/` | React 19, Vite 8, TypeScript 6, ESLint | `npm run dev` | 5173 |
| `EnvanterTakip.mobile/` | Expo SDK 54, React Native 0.81, expo-router | `npm start` | 8081 |

## Kurulum

### Ön Gereksinimler

- .NET 10 SDK
- Node.js 18+
- PostgreSQL
- Expo CLI (`npm install -g expo-cli`)

### Backend (API)

```bash
cd EnvanterTakip.API

# Veritabanı bağlantısını User Secrets'a kaydet
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=EnvanterDb;Username=postgres;Password=SENIN_SIFREN"

# Migration'ları uygula
dotnet ef database update

# Çalıştır
dotnet run
```

API varsayılan olarak `http://localhost:5279` adresinde çalışır. OpenAPI dokümantasyonu `/openapi/v1.json` adresinde mevcuttur.

### Mobil Uygulama

```bash
cd EnvanterTakip.mobile

npm install
npm start
```

Gerçek cihaz testi için `config/api.ts` dosyasındaki `API_IP` değişkenini bilgisayarınızın yerel IP adresi olarak ayarlayın.

### Admin Paneli

```bash
cd EnvanterTakip.Admin

npm install
npm run dev
```

## API Endpoints

### Ürünler

| Method | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/products` | Ürünleri listele (sayfalı, filtreli) |
| `GET` | `/api/products/{id}` | Ürün detayı |
| `GET` | `/api/products/barcode/{barcode}` | Barkod ile ürün ara |
| `GET` | `/api/products/categories` | Kategorileri listele |
| `POST` | `/api/products` | Yeni ürün oluştur |
| `PUT` | `/api/products/{id}` | Ürün güncelle |
| `DELETE` | `/api/products/{id}` | Ürün sil (satış yoksa) |

### Satışlar

| Method | Endpoint | Açıklama |
|---|---|---|
| `GET` | `/api/sales` | Satışları listele (sayfalı, filtreli) |
| `GET` | `/api/sales/{id}` | Satış detayı |
| `POST` | `/api/sales` | Satış oluştur (stok otomatik güncellenir) |
| `GET` | `/api/sales/dashboard` | Dashboard istatistikleri |

## Mimari

API katmanlı mimari ile geliştirilmiştir:

```
Controllers/     → API endpoint'leri
Services/        → İş mantığı
Interfaces/      → Servis sözleşmeleri
Models/          → Veri modelleri (EF Core entities)
DTOs/            → Veri transfer nesneleri
Validators/      → FluentValidation kuralları
Data/            → AppDbContext (EF Core)
Middlewares/     → Global hata yakalayıcı
Migrations/      → EF Core migration'ları
```

## Teknoloji Detayları

- **ORM:** Entity Framework Core (code-first, PostgreSQL)
- **Validasyon:** FluentValidation
- **API Dokümantasyonu:** OpenAPI (ASP.NET Core 10 built-in)
- **JSON:** System.Text.Json (camelCase)
- **Mobil Routing:** expo-router (file-based)
- **Mobil State:** React hooks (useState, useEffect)

## Notlar

- `ios/` ve `android/` dizinleri `.gitignore`'dadır, `expo prebuild` ile oluşturulur.
- Veritabanı credential'ları User Secrets'ta tutulur (`dotnet user-secrets`).

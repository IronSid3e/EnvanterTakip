# Plan: appsettings, root package.json, README güncellemeleri

## Görev 1: Password=NULL bug + User Secrets'a taşıma

**Durum:** `appsettings.json:10` → `Password=NULL` literal string olarak okunuyor.
Proje User Secrets destekliyor (`UserSecretsId` csproj'da mevcut).

### Adımlar

1. `dotnet user-secrets set` ile User Secrets'a taşı:
   - `ConnectionStrings__DefaultConnection` = `"Host=localhost;Database=EnvanterDb;Username=postgres;Password=envanter6612"`

2. `appsettings.json`'dan `ConnectionStrings` bloğunu tamamen kaldır.

3. `README.md:49-50`'deki "# Veritabanı bağlantısını ayarla (appsettings.json)" açıklamasını güncelle:
   - Artık User Secrets kullanıldığını belirt.
   - Setup komutunu göster.

## Görev 2: Root package.json

**Durum:** Root'ta `package.json` bulunamadı. Zaten temiz.
AGENTS.md'deki "Root `package.json` is a leftover" notu artık geçersiz.
Hiçbir değişiklik gerekmez (dosya yok).

## Görev 3: README güncelleme

**Değişiklik:** `README.md:3`'teki cümleyi değiştir:
- **ESKİ:** "Çiftlik ve şube arasındaki stok akışını manuel takipten kurtarıp dijital ortama taşır."
- **YENİ:** "Herhangi bir satış firmasının barkodla ürün takibi yapabileceği genel bir envanter yönetim sistemidir."

Ayrıca `README.md:131`'deki not satırını da kaldır (root package.json artık yok, gereksiz).

## Doğrulama

- `dotnet build` ile API derlenmeli.
- `appsettings.json`'da artık `ConnectionStrings` olmamalı.
- User Secrets'ın doğru çalıştığını doğrulamak için API başlatılabilir.

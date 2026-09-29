# Hexa Nut Sort - Android APK wrapper

Bu proje, `index.html` içindeki Hexa Nut Sort oyununu Android WebView içinde çalıştırır.

## Özellikler
- Portre moduna kilitli.
- JavaScript ve WebAudio açık.
- `localStorage` destekli: bölüm/altın/joker ilerlemesi cihazda saklanır.
- İnternet izni vardır çünkü mevcut HTML Tailwind CDN ve Google Fonts kullanır.
- Kaynak oyun `app/src/main/assets/index.html` içindedir.

## Android Studio ile APK alma
1. Android Studio'da bu klasörü aç.
2. Gradle senkronizasyonunun bitmesini bekle.
3. `Build > Build App Bundle(s) / APK(s) > Build APK(s)` seç.
4. APK: `app/build/outputs/apk/debug/app-debug.apk`

## GitHub Actions ile APK alma
Projeyi bir GitHub deposuna koyup `main` dalına gönder. `Build Android APK` workflow'u çalışır.
Actions sayfasındaki `hexa-nut-sort-debug-apk` artifact'ından APK indirilebilir.

## Not
Tamamen çevrimdışı APK istenirse Tailwind CSS'in derlenip yerel dosyaya alınması ve uzaktaki fontların kaldırılması/değiştirilmesi gerekir.

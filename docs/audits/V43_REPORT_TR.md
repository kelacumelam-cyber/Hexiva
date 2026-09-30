# Hexiva V43 sonuç raporu

30 Eylül 2026. Başlangıç: `main` / `55ca8e3`.

## Kök neden

43. bölümün gerçek ekran görüntüsündeki beşli yukarı-sol sıra, `(0,-1)` → `(4,-1)` hücreleriyle birebir eşleşti. Eski audit bunu zaten görüyordu; ancak `bestCompliant || best` seçimi kurala uymayan bölümü yine yayımlıyordu. Eski radius-2 audit'inde 1000 bölümün 817'si ihlalliydi.

Engellerin rotaları yön atamasında yasaklanıyor, swap/cycle ise gerekli olmadan yerleştiriliyordu. Katkı kontrolünü 340 engelin 339'u, 240 swap'ın 239'u, 200 cycle'ın tamamı, 429 redirect'in 198'i ve 114 linked pair'in 113'ü geçemedi. Sabit engel, sabit oklu ve yalnız taş kaldırılan bir düzende geçici bağımlılık yaratamaz; gerçek rota değişikliği için yer değiştirmeyle birlikte kurulmalıdır.

## Ne değişti?

- Yönler, çözülebilen rotalar içinden **görsel sınır gözetilerek** atanıyor. Sonradan rastgele ok çevirme yok.
- Ekran geometrisi, boşluklar üzerinden hizalanmış sıralar ve geçişli görsel gruplar ölçülüyor. Swap/cycle'ın bütün tam düzenleri de sınırı geçmek zorunda.
- Swap/cycle çözülmüş durumdan ters geçişle kuruluyor ve çıkarıldığında çözümün kalmadığı doğrulanıyor. Engel gerçek bir rotanın açıklığını değiştiriyor; redirect ve linked pair'in katkısı da sınanıyor.
- Gerçek şekil değişiklikleri üretiliyor; son sekiz bölümde aynı aile, eş şekil ve %84'ten yüksek dönüşüm/öteleme eşdeğeri örtüşme reddediliyor.
- Uygun aday yoksa üretim duruyor; kötü adayla devam etmiyor. Oyun, önceden üretilmiş ve denetlenmiş sabit kataloğu okuyor. Telefon aday aramıyor.
- Önceki 1–34 tasarımları da yeniden kuruldu. Kayıtlı bölüm/altın/booster/ilerleme korunuyor; V43 içinde yeniden başlatma aynı düzeni getiriyor.

## 1–1000 bağımsız audit

| Kontrol | Sonuç |
| --- | --- |
| Çözülen bölüm | 1000 / 1000 |
| Aynı-yön görsel grup ihlali | 0; en büyük grup 2 |
| Yakın sekiz bölümde eş/yakın şekil veya aynı V2 ailesi | 0 |
| Fazla bedava açılış / fazla doğrudan uçurum çıkışı | 0 / 0, tanımlı sınırlar içinde |
| İşlevsiz mekanik | 0 |
| Hiçbir rotayı etkilemeyen engel | 0 / 248 |
| Gerçek oyun fonksiyonuyla hareket karşılaştırması | 1.419.150; hepsi eşleşti |
| Çözüm bütçesi nedeniyle belirsiz açılış sonucu | 0 |
| Kaybettiren erken açılış hamlesi bulunan bölüm | 397 |
| En uzun zorunlu dizi | 4; ilk dört bölümde en fazla 2 |
| İlk dört bölümün bağımlılık derinlikleri | 3, 5, 5, 5 |

Mekanik adetleri: 248 redirect, 372 swap, 248 cycle, 124 linked pair ve 248 engel. 38 engel birden fazla ayrı taşı etkiliyor; diğer 210 engel bir taşı etkiliyor. Tek etkili rota dekoratif kabul edilmedi; birden fazla rota tercihi tüm engeller için zorunlu tutulmadı.

Üretimde 402.955 aday değerlendirildi. Aday başına birden çok ret nedeni bulunabileceğinden ret sayıları toplanarak aday sayısı elde edilmez. Ret kayıtları `v43-generation.json` içinde.

## Temsilci ve sınırdaki örnekler

Aşağıdaki örnekler otomatik çözüldü ve gerçek hareket fonksiyonuyla karşılaştırıldı. **Web üzerinden oynandıkları iddia edilmiyor.**

| Bölüm | Taş | Açılış kaldırması | Bağımlılık derinliği | En uzun zorunlu dizi | Mekanik |
| --- | --- | --- | --- | --- | --- |
| 1 | 7 | 2 | 3 | 1 | — |
| 13 | 12 | 2 | 4 | 1 | swap, obstacle |
| 15 | 10 | 3 | 5 | 2 | cycle, obstacle |
| 19 | 13 | 2 | 4 | 1 | linked |
| 20 | 16 | 2 | 7 | 1 | cycle |
| 24 | 20 | 4 | 6 | 2 | — |
| 43 | 19 | 3 | 6 | 1 | linked |
| 163 | 23 | 2 | 15 | 4 | linked |
| 863 | 22 | 7 | 6 | 1 | cycle, obstacle |
| 936 | 15 | 3 | 5 | 1 | — |
| 1000 | 22 | 4 | 9 | 1 | — |

Özellikle 13/15 engel + yer değiştirme, 19/20/24/43 önceki oynanış şikayetleri, 163 en derin bağımlılık, 863 en geniş açılış ve 936 en yakın eş-şekil tekrarı için seçildi.

## Kalan sınırlar ve web durumu

- Uzak mesafede 14 eş şekil tekrarı var; en kısa aralık 14 bölüm. Yakın tekrar kuralını ihlal etmiyorlar. “1000 şeklin hepsi eşsiz” iddiası yok.
- Açılış sınırı normal bölümlerde %32; doğrudan ilk-adım uçurum çıkışı sınırı %22. Tutorial sınırları ayrı. Bunlar açıklanmış mühendislik eşikleri, oyuncu zevkinin bilimsel ölçümü değil.
- Bazı bölümlerde dört zorunlu hamle hâlâ var; bunlar raporda görünür. Sıradan kaldırma bulmacalarında doğru kaldırma sırası diğer taşları zorlaştırmaz. Gerçek sıra riski gerekli swap/cycle kollarını erken kaldırınca oluşur.
- Mevcut kombinasyonlar engel+swap, engel+cycle ve redirect+swap. Bu katalogda linked pair ile yer değiştirme birleşmiyor; mevcut bağın hücre koordinatlarına bağlı davranışı daha geniş kombinasyonlarda ayrıca ele alınmalıdır.
- Bu ortamın Chrome'u, eski değişmemiş oyunda bile `Error creating WebGL context` veriyor. Bir yeniden yüklemeyle tekrarlandı. Bu nedenle V43'ün gerçek web oynanışı ve oyuncunun ekranında +100 görünmesi burada doğrulanamadı. Bütün 1000 bölümü kullanıcıya manuel oynatma planı yok; yukarıdaki temsilciler web kabulü için yeterli bir hedef kümesi.

12 otomatik test, 1000 bölümün gerçek Three.js geometrisiyle kurulup temizlenmesi (renderer taklidi), kaynak doğrulaması ve offline web build'i geçti. Renderer taklidi GPU/görsel oynanış testi değildir.

Yeni tek kullanımlık QA anahtarı `hexiva-qa-v43-20260930-c74f9e21` mevcut kayıtlı altına +100 ekliyor; tekrar açılışta vermiyor. Eski +500/V42.6 anahtarları yeniden çalıştırılmıyor. APK/offline çıktısından QA kredisi kaldırılıyor.

## Dosyalar

- `docs/GENERATOR_V43.md`: mimari, gerçek ekran/hex karşılaştırması ve eşikler.
- `docs/audits/v42-baseline.json`: eski sorunların sayısal kanıtı.
- `docs/audits/v43-summary.json`: tam audit özeti, tekrar mesafeleri ve temsilciler.
- `docs/audits/v43-levels.json`: her bölümün bağımlılık kenarları, çözüm dalgaları, katkı ölçümleri ve açılış sonuçları.
- `docs/audits/v43-generation.json`: aday ve ret kayıtları.

Tekrar doğrulama: `npm test`, `npm run audit:catalog`, `npm run verify:source`, `npm run build:web`. Kataloğu yeniden üretmek için `npm run catalog:build`.


## Yayın doğrulaması

Kod/katalog `50b4519` ile `main`e yayımlandı. GitHub Pages'ten gelen HTML, katalog ve hareket motoru HTTP 200 döndü ve test edilen dosyalarla byte byte eşleşti. Tarayıcıda yeni script adresleri ve tek kullanımlık V43 QA anahtarı görüldü. Yeni V43 sayfasında da bu ortamın WebGL context hatası doğrulandı: yayın tamam, gerçek web oynanışı ve görünen altın kredisi bu tarayıcıda doğrulanamadı.

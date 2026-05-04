# ALKAM MALİ İstasyON - Supabase Bağlantı ve Anahtar Kuralları v10

Bu dosya Supabase bağlantı bilgilerinin güvenli kullanım kurallarını belirler.

## Ana Kural

Frontend içine yalnızca public / publishable anahtar yazılabilir. Secret key kesinlikle frontend dosyalarına, GitHub Pages / Cloudflare Pages tarafına veya tarayıcı koduna yazılmayacak.

## Kullanılabilecek Bilgiler

Frontend için kullanılabilir:

- Supabase URL
- Supabase anon / publishable key

Frontend için yasak:

- service role key
- secret key
- database password
- JWT secret
- kişisel erişim tokenları

## Dosya Kuralları

### Güvenli

```text
supabase-config.example.js
.env.example
```

Bu dosyalarda gerçek anahtar değil örnek değer bulunur.

### Yasak

```text
supabase-secret.js
.env
service-role-key.txt
```

Bu tür dosyalar repoya koyulmayacak.

## Cloudflare / Pages Kuralı

Cloudflare tarafında gizli değer gerekiyorsa dashboard üzerinden environment variable olarak tanımlanır. Kod içine yazılmaz.

## GitHub Kuralı

GitHub repo içine secret key girilmez.

Yanlışlıkla girilirse:

1. Anahtar hemen Supabase panelinden iptal edilir.
2. Yeni anahtar üretilir.
3. Git geçmişi ayrıca incelenir.
4. Sistem Manifestosu ve Güvenilirlik Raporu notuna işlenir.

## Supabase Client Kullanımı

Tarayıcı tarafı sadece şu mantıkla bağlanacak:

```js
const supabaseUrl = 'PUBLIC_SUPABASE_URL';
const supabaseKey = 'PUBLIC_ANON_OR_PUBLISHABLE_KEY';
```

Bu anahtar kullanıcı güvenliği için RLS ile sınırlandırılır.

## RLS Olmadan Yazma Yok

Supabase yazma işlemleri açılmadan önce:

- RLS aktif olacak.
- user_profiles tablosunda admin tanımlanacak.
- operator / viewer / auditor rolleri test edilecek.
- Yazma test ortamında doğrulanacak.

## Canlı Yazma Açma Şartı

Canlı yazma açılmadan önce:

- LocalStorage yedeği alınmış olacak.
- Supabase şema kurulmuş olacak.
- RLS kurulmuş olacak.
- İlk admin kullanıcı çalışacak.
- Karşılaştırma raporu kritik fark vermeyecek.
- Moka kuralı test edilecek.
- Banka onaysız işleme testi temiz çıkacak.

## Sonraki Teknik Dosya

Bir sonraki adım frontend için örnek Supabase config dosyası hazırlamaktır:

```text
supabase-config.example.js
```

Gerçek anahtar içermeyecek.

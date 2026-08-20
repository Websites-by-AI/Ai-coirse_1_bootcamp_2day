# AI Music Providers for Persian Songs — VibeLab

هدف: پیدا کردن APIهایی شبیه Suno برای تولید موسیقی با شعر فارسی، اتصال با token/API، و استفاده داخل VibeLab.

## خلاصه پیشنهادی

| اولویت | Provider | نوع اتصال | مناسب فارسی؟ | توضیح |
|---:|---|---|---|---|
| 1 | ACE-Step 1.5 via Hugging Face / self-host | Open-source / HF / GPU | نیازمند تست، multilingual | بهترین گزینه برای کنترل و ریسک حقوقی کمتر، ولی نیازمند GPU یا inference provider |
| 2 | WaveSpeed ACE-Step | REST API | نیازمند تست | ساده برای اتصال سریع، تولید آهنگ با lyrics و style tags |
| 3 | fal.ai ACE-Step | REST/API client | نیازمند تست | ارزان، مناسب prototype و پرداخت به‌ازای ثانیه |
| 4 | MiniMax Music | REST API | احتمالاً قابل تست با lyrics فارسی | API مستند برای موسیقی/lyrics، اما وضعیت دسترسی برای کاربران جدید باید بررسی شود |
| 5 | AIMLAPI MiniMax Music 01 | REST API | نیازمند reference voice/instrumental | wrapper/API aggregator؛ برای تست سریع خوب است |
| 6 | Mureka / useapi | REST / official enterprise یا third-party | نیازمند تست | شبیه Suno/Udio، lyrics و سبک، ولی official API گران/enterprise است |
| 7 | ElevenLabs Music | API/platform | نامشخص برای فارسی | کیفیت و ریسک حقوقی بهتر، اما باید availability و vocal Persian تست شود |
| 8 | Suno unofficial wrappers | Third-party wrappers | ممکن است | ریسک حقوقی/پایداری/اکانت؛ برای production پیشنهاد نمی‌شود |

---

## 1. ACE-Step 1.5 — Open Source / Hugging Face

### چرا مهم است؟
- مدل open-source برای text-to-music و lyrics-to-song.
- در docs نوشته شده variable-length stereo audio از ۱۰ ثانیه تا ۱۰ دقیقه تولید می‌کند.
- lyrics ساختارمند با tagهایی مثل `[verse]`, `[chorus]` پشتیبانی می‌شود.
- برای VibeLab می‌تواند بهترین گزینه self-host یا HF endpoint باشد.

### ریسک/نکته
- docs زبان‌های زیادی را نام می‌برد، اما فارسی را صراحتاً تضمین نکرده؛ باید تست شود.
- برای کیفیت خوب، GPU لازم است.

### Env پیشنهادی
```env
HF_TOKEN=...
AI_MUSIC_PROVIDER=ace_step_hf
```

### تست شعر فارسی
```txt
prompt: Persian pop, emotional, modern arrangement, warm male vocal, daf and electric guitar, cinematic chorus
lyrics:
[verse]
تو مسیر تازه‌ای، من کنار تو میام
با یه رویا توی دل، از شبامون رد می‌شم
[chorus]
بساز با نور امید، صداتو بالا ببر
VibeLab کنارته، تا برسی به اثر
```

---

## 2. WaveSpeed AI — ACE-Step REST API

### چرا مهم است؟
- API آماده برای ACE-Step.
- ورودی‌های ساده: `tags`, `lyrics`, `duration`, `seed`.
- برای prototype سریع از self-host راحت‌تر است.

### Env پیشنهادی
```env
WAVESPEED_API_KEY=...
AI_MUSIC_PROVIDER=wavespeed_ace_step
```

### Use case
- ساخت آهنگ نمونه فارسی برای تمرین کاربر.
- ساخت jingle یا intro برای کسب‌وکار.
- تولید background music برای ویدیوهای AI.

---

## 3. fal.ai — ACE-Step

### چرا مهم است؟
- API آماده برای ACE-Step.
- هزینه بر اساس ثانیه تولید.
- مناسب MVP و تست‌های کم‌حجم.

### Env پیشنهادی
```env
FAL_KEY=...
AI_MUSIC_PROVIDER=fal_ace_step
```

### ورودی‌های مهم
```txt
tags: Persian pop, cinematic, uplifting, male vocal
lyrics: متن فارسی ساختارمند
```

---

## 4. MiniMax Music 3.0 / 2.x

### چرا مهم است؟
- endpoint مستند برای `music_generation` و `lyrics_generation`.
- از prompt + lyrics یا instrumental پشتیبانی می‌کند.
- مناسب توسعه‌دهنده‌ها، اگر API access فعال باشد.

### نکته مهم
برخی منابع اشاره کرده‌اند که دسترسی paid/free برای کاربران جدید ممکن است محدود یا تغییر کرده باشد؛ قبل از اتصال production باید اکانت و دسترسی API بررسی شود.

### Env پیشنهادی
```env
MINIMAX_API_KEY=...
AI_MUSIC_PROVIDER=minimax
```

### endpoint معمول
```txt
POST https://api.minimax.io/v1/music_generation
Authorization: Bearer MINIMAX_API_KEY
```

---

## 5. AIMLAPI — MiniMax Music 01

### چرا مهم است؟
- API aggregator با Bearer token.
- endpoint برای upload reference voice/instrumental و generate.
- برای تست سریع خوب است، ولی dependency روی aggregator دارد.

### Env پیشنهادی
```env
AIMLAPI_KEY=...
AI_MUSIC_PROVIDER=aimlapi_minimax
```

### نکته
برای بعضی workflowها به reference voice یا instrumental نیاز دارد.

---

## 6. Mureka / useapi

### چرا مهم است؟
- Mureka شبیه Suno/Udio است و lyrics/style/vocals دارد.
- useapi.net یک API غیررسمی/واسط برای Mureka ارائه می‌دهد.
- API رسمی Mureka ظاهراً enterprise/گران است.

### Env پیشنهادی
```env
MUREKA_API_KEY=...
USEAPI_TOKEN=...
AI_MUSIC_PROVIDER=mureka
```

### ریسک
- اگر از واسط غیررسمی استفاده شود، پایداری و شرایط استفاده باید دقیق بررسی شود.

---

## 7. ElevenLabs Music

### چرا مهم است؟
- ElevenLabs از نظر licensing/داده‌های مجاز معمولاً قابل دفاع‌تر از بعضی رقبا معرفی می‌شود.
- باید بررسی شود که Music API برای حساب شما فعال است یا از طریق partner مثل fal در دسترس است.

### Env پیشنهادی
```env
ELEVENLABS_API_KEY=...
AI_MUSIC_PROVIDER=elevenlabs_music
```

### تست لازم
- vocal فارسی
- تلفظ فارسی
- commercial rights

---

## 8. Suno unofficial wrappers

### چرا با احتیاط؟
- Suno public self-serve API رسمی و پایدار ندارد.
- wrapperها ممکن است به cookie، session، captcha یا حساب کاربری وابسته باشند.
- برای prototype ممکن است کار کنند، ولی برای VibeLab production پیشنهاد نمی‌شود.

---

# معیار انتخاب برای VibeLab

## برای MVP سریع
1. fal.ai ACE-Step
2. WaveSpeed ACE-Step
3. AIMLAPI MiniMax

## برای کنترل و برند بلندمدت
1. ACE-Step self-host / Hugging Face endpoint
2. MiniMax official if accessible
3. ElevenLabs Music if Persian vocals acceptable

## برای کیفیت شبیه Suno
1. Mureka / MiniMax / ElevenLabs را تست A/B کنید.
2. Suno wrapper فقط برای تست غیر production.

---

# پیشنهاد معماری اتصال در VibeLab

## جدول D1 پیشنهادی
```sql
CREATE TABLE ai_music_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL,
  label TEXT NOT NULL,
  api_key_ciphertext TEXT,
  environment_variable TEXT,
  base_url TEXT,
  model TEXT,
  status TEXT DEFAULT 'not_tested',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_music_generations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  provider TEXT NOT NULL,
  prompt TEXT NOT NULL,
  lyrics TEXT,
  style_tags TEXT,
  output_url TEXT,
  status TEXT DEFAULT 'queued',
  error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## UI پیشنهادی
- Admin → AI Music Providers
  - Add provider
  - Test Persian song
  - View generated samples
- User Panel → AI Music Lab
  - Generate jingle
  - Generate intro/outro
  - Generate Persian song from lyrics
  - Download MP3/WAV

## اولین تست فارسی پیشنهادی
```txt
Style: Persian pop, cinematic, upbeat, male vocal, daf, electric guitar, modern drums
Lyrics:
[verse]
از دل شب رد می‌شم، با یه رویا توی دست
هر قدم یه قصه‌ست، هر نفس یه فرصت
[chorus]
بساز، بساز، صداتو بالا ببر
با نور امید، دنیا رو تازه‌تر
```

---

# قدم بعدی

1. یک provider انتخاب کن: `fal.ai`, `WaveSpeed`, `HuggingFace`, `MiniMax`, یا `AIMLAPI`.
2. API token را به‌صورت امن در Cloudflare Secret بگذار؛ در چت نفرست.
3. من endpoint تست فارسی و پنل Admin اتصال provider را اضافه می‌کنم.

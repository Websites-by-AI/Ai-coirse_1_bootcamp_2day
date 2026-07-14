'use client';

import { useMemo, useState } from "react";

type AvatarStyle = '3d-cartoon' | 'minimalist' | 'cyberpunk' | 'watercolor' | 'pixel-art' | 'neon-glow';
type ColorTheme = 'purple-blue' | 'orange-coral' | 'green-teal' | 'pink-rose' | 'gold-amber' | 'monochrome';

const styles: { id: AvatarStyle; label: string }[] = [
  { id: '3d-cartoon', label: '۳D کارتونی' },
  { id: 'minimalist', label: 'مینیمال' },
  { id: 'cyberpunk', label: 'سایبرپانک' },
  { id: 'watercolor', label: 'آبرنگی' },
  { id: 'pixel-art', label: 'پیکسلی' },
  { id: 'neon-glow', label: 'نئون درخشان' },
];

const colorThemes: { id: ColorTheme; label: string; bg1: string; bg2: string; accent: string; text: string }[] = [
  { id: 'purple-blue', label: 'بنفش-آبی', bg1: '#1a1a2e', bg2: '#16213e', accent: '#a29bfe', text: '#dfe6e9' },
  { id: 'orange-coral', label: 'نارنجی-مرجانی', bg1: '#2d1b1b', bg2: '#3d2418', accent: '#fab1a0', text: '#ffeaa7' },
  { id: 'green-teal', label: 'سبز-فیروزه‌ای', bg1: '#0d2b25', bg2: '#143d33', accent: '#55efc4', text: '#dfe6e9' },
  { id: 'pink-rose', label: 'صورتی-رز', bg1: '#2b1a2d', bg2: '#3d1f35', accent: '#fd79a8', text: '#ffeaa7' },
  { id: 'gold-amber', label: 'طلایی-کهربا', bg1: '#2d2510', bg2: '#3d3214', accent: '#fdcb6e', text: '#ffeaa7' },
  { id: 'monochrome', label: ' تک‌رنگ', bg1: '#1e1e1e', bg2: '#2d2d2d', accent: '#b2bec3', text: '#dfe6e9' },
];

const niches = [
  { id: 'tech', label: 'تکنولوژی و برنامه‌نویسی', emoji: '💻' },
  { id: 'gaming', label: 'گیمینگ', emoji: '🎮' },
  { id: 'education', label: 'آموزش و یادگیری', emoji: '📚' },
  { id: 'lifestyle', label: 'سبک زندگی', emoji: '🌿' },
  { id: 'business', label: 'کسب‌وکار و استارتاپ', emoji: '🚀' },
  { id: 'art', label: 'هنر و طراحی', emoji: '🎨' },
];

function getPrompt(channel: string, niche: string, style: AvatarStyle, theme: ColorTheme) {
  const styleMap: Record<AvatarStyle, string> = {
    '3d-cartoon': '3D cartoon avatar, glossy render, soft lighting, friendly expression, Pixar-style character design',
    'minimalist': 'minimalist flat vector avatar, clean lines, solid shapes, modern geometric design, no gradients',
    'cyberpunk': 'cyberpunk avatar, neon accents, futuristic visor, holographic details, dark sci-fi atmosphere',
    'watercolor': 'watercolor painted avatar, soft brush strokes, artistic texture, paper grain, dreamy colors',
    'pixel-art': 'pixel art avatar, 64-bit retro style, crisp pixels, dithering, nostalgic game aesthetic',
    'neon-glow': 'neon glow avatar, fluorescent outline, synthwave colors, dark background, electric aura',
  };
  const nicheMap: Record<string, string> = {
    tech: 'tech creator, coding environment, circuit patterns, futuristic workspace',
    gaming: 'gamer avatar, headset, controller elements, dynamic pose, energy effects',
    education: 'friendly teacher avatar, books and knowledge symbols, warm approachable vibe',
    lifestyle: 'relaxed casual avatar, nature elements, wellness aesthetic, calm expression',
    business: 'professional entrepreneur avatar, confident pose, modern office elements, sharp suit details',
    art: 'creative artist avatar, paint splashes, brush and pencil tools, colorful studio background',
  };
  const themeMap: Record<ColorTheme, string> = {
    'purple-blue': 'deep purple and electric blue color palette, cosmic atmosphere',
    'orange-coral': 'warm orange and coral palette, sunset vibes, energetic mood',
    'green-teal': 'fresh green and teal palette, nature tech fusion, organic feel',
    'pink-rose': 'soft pink and rose gold palette, elegant and modern aesthetic',
    'gold-amber': 'rich gold and amber palette, premium luxury feel, warm lighting',
    'monochrome': 'black white and gray monochrome palette, high contrast, sleek modern look',
  };

  const base = `YouTube channel avatar for "${channel || 'My Channel'}", ${styleMap[style]}, ${nicheMap[niche] || niche}, ${themeMap[theme]}, centered composition, high quality, 4k, transparent background or solid dark background, suitable for circular crop`;
  const persian = `آواتار یوتیوب برای کانال "${channel || 'کانال من'}"، سبک ${styles.find(s => s.id === style)?.label}، ${niches.find(n => n.id === niche)?.label}، پالت رنگ ${colorThemes.find(t => t.id === theme)?.label}، کیفیت بالا، پس‌زمینه شفاف یا تیره، مناسب برش دایره‌ای`;
  return { english: base, persian };
}

function AvatarSVG({ channel, style, theme }: { channel: string; style: AvatarStyle; theme: ColorTheme }) {
  const t = colorThemes.find(c => c.id === theme) || colorThemes[0];
  const initials = (channel || 'VC').slice(0, 2).toUpperCase();

  const shape = useMemo(() => {
    switch (style) {
      case '3d-cartoon':
        return (
          <g>
            <circle cx="70" cy="70" r="50" fill={t.accent} opacity="0.15" />
            <circle cx="70" cy="65" r="38" fill={t.accent} opacity="0.25" />
            <circle cx="70" cy="60" r="28" fill={t.accent} opacity="0.4" />
            <text x="70" y="68" textAnchor="middle" fill={t.text} fontSize="22" fontWeight="800" fontFamily="Arial">{initials}</text>
            <circle cx="95" cy="45" r="8" fill={t.accent} opacity="0.6" />
          </g>
        );
      case 'minimalist':
        return (
          <g>
            <rect x="25" y="25" width="90" height="90" rx="22" fill={t.accent} opacity="0.12" />
            <rect x="35" y="35" width="70" height="70" rx="16" fill={t.accent} opacity="0.25" />
            <text x="70" y="75" textAnchor="middle" fill={t.accent} fontSize="28" fontWeight="800" fontFamily="Arial">{initials}</text>
          </g>
        );
      case 'cyberpunk':
        return (
          <g>
            <polygon points="70,15 120,55 100,115 40,115 20,55" fill={t.accent} opacity="0.12" />
            <polygon points="70,30 105,58 90,100 50,100 35,58" fill={t.accent} opacity="0.25" />
            <text x="70" y="78" textAnchor="middle" fill={t.accent} fontSize="20" fontWeight="800" fontFamily="monospace">{initials}</text>
            <rect x="45" y="55" width="50" height="4" rx="2" fill={t.accent} opacity="0.7" />
          </g>
        );
      case 'watercolor':
        return (
          <g>
            <circle cx="70" cy="70" r="48" fill={t.accent} opacity="0.15" />
            <circle cx="60" cy="60" r="30" fill={t.accent} opacity="0.2" />
            <circle cx="85" cy="80" r="22" fill={t.accent} opacity="0.15" />
            <text x="70" y="76" textAnchor="middle" fill={t.text} fontSize="24" fontWeight="700" fontFamily="Georgia,serif" fontStyle="italic">{initials}</text>
          </g>
        );
      case 'pixel-art':
        return (
          <g>
            <rect x="20" y="20" width="100" height="100" rx="4" fill={t.accent} opacity="0.15" />
            <rect x="35" y="35" width="70" height="70" rx="2" fill={t.accent} opacity="0.3" />
            <rect x="45" y="45" width="50" height="50" fill={t.accent} opacity="0.5" />
            <text x="70" y="78" textAnchor="middle" fill={t.text} fontSize="18" fontWeight="800" fontFamily="monospace">{initials}</text>
          </g>
        );
      case 'neon-glow':
        return (
          <g>
            <circle cx="70" cy="70" r="50" fill="none" stroke={t.accent} strokeWidth="3" opacity="0.3" />
            <circle cx="70" cy="70" r="40" fill="none" stroke={t.accent} strokeWidth="2" opacity="0.5" />
            <circle cx="70" cy="70" r="30" fill={t.accent} opacity="0.15" />
            <text x="70" y="76" textAnchor="middle" fill={t.accent} fontSize="22" fontWeight="800" fontFamily="Arial">{initials}</text>
          </g>
        );
    }
  }, [style, t, initials]);

  return (
    <svg className="avatar-svg" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
      {shape}
    </svg>
  );
}

export default function AvatarTool() {
  const [channel, setChannel] = useState('');
  const [niche, setNiche] = useState('tech');
  const [style, setStyle] = useState<AvatarStyle>('3d-cartoon');
  const [theme, setTheme] = useState<ColorTheme>('purple-blue');
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(() => getPrompt(channel, niche, style, theme), [channel, niche, style, theme]);
  const activeTheme = colorThemes.find(t => t.id === theme)!;

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.english + '\n\n' + prompt.persian);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const downloadSVG = () => {
    const svg = document.querySelector('.avatar-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${channel || 'avatar'}-vibelab.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="avatar-studio">
      <div className="avatar-workspace">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"/><path d="M16 4h2a2 2 0 0 1 2 2v2"/></svg>
          تنظیمات آواتار
        </h3>

        <div className="avatar-field">
          <label>نام کانال یوتیوب</label>
          <input value={channel} onChange={e => setChannel(e.target.value)} placeholder="مثلاً: VibeLab Academy" />
        </div>

        <div className="avatar-field">
          <label>حوزه فعالیت</label>
          <select value={niche} onChange={e => setNiche(e.target.value)}>
            {niches.map(n => <option key={n.id} value={n.id}>{n.emoji} {n.label}</option>)}
          </select>
        </div>

        <div className="avatar-field">
          <label>سبک طراحی</label>
          <select value={style} onChange={e => setStyle(e.target.value as AvatarStyle)}>
            {styles.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        <div className="avatar-field">
          <label>پالت رنگی</label>
          <div className="avatar-colors">
            {colorThemes.map(t => (
              <button
                key={t.id}
                className={`avatar-color-btn ${theme === t.id ? 'active' : ''}`}
                style={{ background: `linear-gradient(135deg, ${t.bg1}, ${t.accent})` }}
                onClick={() => setTheme(t.id)}
                title={t.label}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="avatar-preview">
        <div className="avatar-canvas" style={{ '--avatar-bg-1': activeTheme.bg1, '--avatar-bg-2': activeTheme.bg2 } as React.CSSProperties}>
          <AvatarSVG channel={channel} style={style} theme={theme} />
        </div>

        <div className="avatar-prompt-box">
          <label>پرامپت AI (انگلیسی برای Midjourney / DALL-E / Leonardo)</label>
          <pre>{prompt.english}</pre>
        </div>

        <div className="avatar-prompt-box">
          <label>توضیح فارسی برای ویرایشگر یا طراح</label>
          <pre>{prompt.persian}</pre>
        </div>

        <div className="avatar-actions">
          <button onClick={copyPrompt} className={copied ? 'primary' : ''}>{copied ? '✓ کپی شد' : 'کپی پرامپت'}</button>
          <button onClick={downloadSVG}>دانلود پیش‌نمایش SVG</button>
        </div>
      </div>
    </div>
  );
}

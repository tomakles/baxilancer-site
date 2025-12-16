(() => {
  const STORAGE_KEY = '3lancer_lang_preference';
  const DISMISS_UNTIL_KEY = '3lancer_lang_dismiss_until';

  const supported = {
    en: { path: '/', label: 'English' },
    de: { path: '/de/', label: 'Deutsch' },
    es: { path: '/es/', label: 'Español' },
    pl: { path: '/pl/', label: 'Polski' },
    sk: { path: '/sk/', label: 'Slovenčina' }
  };

  const suggestedCopy = {
    en: (label) => `We detected ${label}. Switch language?`,
    de: (label) => `Wir haben ${label} erkannt. Sprache wechseln?`,
    es: (label) => `Hemos detectado ${label}. ¿Cambiar de idioma?`,
    pl: (label) => `Wykryliśmy ${label}. Przełączyć język?`,
    sk: (label) => `Zistili sme, že preferujete ${label}. Prepnúť jazyk?`
  };

  const switchLabel = {
    en: 'Switch',
    de: 'Wechseln',
    es: 'Cambiar',
    pl: 'Przełącz',
    sk: 'Prepnúť'
  };

  const stayLabel = {
    en: 'Stay here',
    de: 'Hier bleiben',
    es: 'Quedarme aquí',
    pl: 'Zostań tutaj',
    sk: 'Zostať tu'
  };

  const closeLabel = {
    en: 'Not now',
    de: 'Nicht jetzt',
    es: 'Ahora no',
    pl: 'Nie teraz',
    sk: 'Teraz nie'
  };

  const safeGet = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const safeSet = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors (e.g., Safari private mode)
    }
  };

  const baseLang = (lang) => (lang || '').toLowerCase().split('-')[0];

  const getCurrentLang = () => {
    const htmlLang = baseLang(document.documentElement.lang);
    if (supported[htmlLang]) return htmlLang;

    const path = window.location.pathname;
    for (const lang of ['sk', 'de', 'es', 'pl']) {
      if (path === `/${lang}/` || path.startsWith(`/${lang}/`)) return lang;
    }
    return 'en';
  };

  const stripLangPrefix = (path) => {
    for (const lang of ['sk', 'de', 'es', 'pl']) {
      const prefix = `/${lang}`;
      if (path === prefix || path === `${prefix}/`) return '/';
      if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length) || '/';
    }
    return path || '/';
  };

  const buildPathForLang = (targetLang, basePath) => {
    if (!supported[targetLang]) return basePath;
    if (targetLang === 'en') return basePath;
    if (basePath === '/' || basePath === '/index.html') return supported[targetLang].path;
    return `/${targetLang}${basePath}`;
  };

  const getBrowserLang = () => {
    const langs = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language];

    for (const lang of langs) {
      const base = baseLang(lang);
      if (supported[base]) return base;
    }
    return 'en';
  };

  const isRootPath = () => {
    const path = window.location.pathname;
    return path === '/' || path === '/index.html';
  };

  const isDismissed = () => {
    const raw = safeGet(DISMISS_UNTIL_KEY);
    if (!raw) return false;
    const until = Number.parseInt(raw, 10);
    if (!Number.isFinite(until)) return false;
    return Date.now() < until;
  };

  const dismissForDays = (days) => {
    const ms = days * 24 * 60 * 60 * 1000;
    safeSet(DISMISS_UNTIL_KEY, String(Date.now() + ms));
  };

  const redirectTo = (lang) => {
    const target = supported[lang];
    if (!target) return;
    window.location.assign(target.path);
  };

  const preferred = baseLang(safeGet(STORAGE_KEY));
  const current = getCurrentLang();

  if (preferred && supported[preferred] && isRootPath() && preferred !== current) {
    redirectTo(preferred);
    return;
  }

  if (isDismissed()) return;

  const browser = getBrowserLang();
  if (!supported[browser] || browser === current) return;

  const messageLang = supported[browser] ? browser : 'en';
  const message = (suggestedCopy[messageLang] || suggestedCopy.en)(supported[browser].label);

  const basePath = stripLangPrefix(window.location.pathname);
  const targetHref = `${buildPathForLang(browser, basePath)}${window.location.search || ''}${window.location.hash || ''}`;

  const style = document.createElement('style');
  style.textContent = `
#lang-notice{
  position:fixed;
  left:50%;
  bottom:14px;
  transform:translateX(-50%);
  width:calc(100% - 28px);
  max-width:960px;
  background:#ffffff;
  border:1px solid var(--border-grey, #D7D7D7);
  border-radius:14px;
  padding:12px 14px;
  box-shadow:0 10px 25px rgba(15, 23, 42, 0.12);
  z-index:9999;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
#lang-notice p{
  margin:0;
  color:var(--text-main, #111827);
  font-size:14px;
  line-height:1.4;
}
#lang-notice .actions{
  display:flex;
  gap:10px;
  align-items:center;
  flex-wrap:wrap;
  justify-content:flex-end;
}
#lang-notice .btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:999px;
  padding:8px 14px;
  font-weight:700;
  font-size:13px;
  text-decoration:none;
  border:1px solid var(--border-grey, #D7D7D7);
  background:#ffffff;
  color:var(--text-main, #111827);
  cursor:pointer;
}
#lang-notice .btn.primary{
  background:var(--primary-green, #3D642D);
  border-color:var(--primary-green, #3D642D);
  color:#ffffff;
}
#lang-notice .btn.primary:hover{
  background:var(--primary-green-dark, #304F23);
  border-color:var(--primary-green-dark, #304F23);
}
#lang-notice .btn:hover{
  border-color:var(--primary-green, #3D642D);
  color:var(--primary-green, #3D642D);
}
@media (max-width: 520px){
  #lang-notice{
    align-items:flex-start;
    flex-direction:column;
  }
  #lang-notice .actions{
    width:100%;
    justify-content:flex-start;
  }
}
`;
  document.head.appendChild(style);

  const notice = document.createElement('div');
  notice.id = 'lang-notice';
  notice.setAttribute('role', 'dialog');
  notice.setAttribute('aria-label', 'Language suggestion');

  const text = document.createElement('p');
  text.textContent = message;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const switchBtn = document.createElement('a');
  switchBtn.className = 'btn primary';
  switchBtn.href = targetHref;
  switchBtn.textContent = switchLabel[messageLang] || switchLabel.en;
  switchBtn.addEventListener('click', () => {
    safeSet(STORAGE_KEY, browser);
  });

  const stayBtn = document.createElement('button');
  stayBtn.type = 'button';
  stayBtn.className = 'btn';
  stayBtn.textContent = stayLabel[messageLang] || stayLabel.en;
  stayBtn.addEventListener('click', () => {
    safeSet(STORAGE_KEY, current);
    dismissForDays(180);
    notice.remove();
  });

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'btn';
  closeBtn.textContent = closeLabel[messageLang] || closeLabel.en;
  closeBtn.addEventListener('click', () => {
    dismissForDays(14);
    notice.remove();
  });

  actions.appendChild(switchBtn);
  actions.appendChild(stayBtn);
  actions.appendChild(closeBtn);

  notice.appendChild(text);
  notice.appendChild(actions);

  document.body.appendChild(notice);
})();

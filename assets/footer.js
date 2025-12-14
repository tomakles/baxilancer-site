(() => {
  const ensureMetaPixel = () => {
    const src = '/assets/meta-pixel.js';
    if (document.querySelector(`script[src="${src}"]`)) return;
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
  };

  ensureMetaPixel();

  const supported = {
    en: { path: '/' },
    de: { path: '/de/' },
    es: { path: '/es/' },
    pl: { path: '/pl/' },
    sk: { path: '/sk/' }
  };

  const labels = {
    en: {
      home: 'Home',
      gps: 'GPS',
      receipts: 'Receipts',
      reports: 'Reports',
      guides: 'Guides',
      privacy: 'Privacy',
      contact: 'Contact'
    },
    de: {
      home: 'Start',
      gps: 'GPS',
      receipts: 'Belege',
      reports: 'Berichte',
      guides: 'Leitfäden',
      privacy: 'Datenschutz',
      contact: 'Kontakt'
    },
    es: {
      home: 'Inicio',
      gps: 'GPS',
      receipts: 'Recibos',
      reports: 'Informes',
      guides: 'Guías',
      privacy: 'Privacidad',
      contact: 'Contacto'
    },
    pl: {
      home: 'Start',
      gps: 'GPS',
      receipts: 'Paragony',
      reports: 'Raporty',
      guides: 'Poradniki',
      privacy: 'Prywatność',
      contact: 'Kontakt'
    },
    sk: {
      home: 'Domov',
      gps: 'GPS',
      receipts: 'Bločky',
      reports: 'Reporty',
      guides: 'Návody',
      privacy: 'Súkromie',
      contact: 'Kontakt'
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

  const year = new Date().getFullYear();
  const lang = getCurrentLang();
  const t = labels[lang] || labels.en;
  const homePath = supported[lang]?.path || '/';

  const items = [
    { key: 'home', href: homePath },
    { key: 'gps', href: `${homePath}gps-time-tracking/` },
    { key: 'receipts', href: `${homePath}receipt-scanner/` },
    { key: 'reports', href: `${homePath}reports/` },
    { key: 'guides', href: `${homePath}guides/` },
    { key: 'privacy', href: `${homePath}privacy/` }
  ];

  const isActive = (href) => {
    const path = window.location.pathname;
    if (href === '/' || Object.values(supported).some((v) => v.path === href)) {
      return path === href || path === `${href}index.html`;
    }
    return path === href || path.startsWith(href);
  };

  let footer = document.querySelector('footer');
  if (!footer) {
    footer = document.createElement('footer');
    document.body.appendChild(footer);
  }

  footer.classList.add('site-footer');

  const navLinks = items
    .map((item, idx) => {
      const label = t[item.key] || labels.en[item.key] || item.key;
      const activeClass = isActive(item.href) ? 'active' : '';
      const sep = idx === 0 ? '' : '<span class="footer-sep" aria-hidden="true">•</span>';
      return `${sep}<a href="${item.href}" class="${activeClass}">${label}</a>`;
    })
    .join('');

  const email = 'threelancer.customer@gmail.com';
  footer.innerHTML = `
    <div class="footer-inner">
      <nav class="footer-nav" aria-label="Footer">
        ${navLinks}
      </nav>
      <div class="footer-meta">
        <span>© ${year} 3LANCER</span>
      </div>
      <div class="footer-contact">
        <span>${t.contact}:</span>
        <a href="mailto:${email}">${email}</a>
      </div>
    </div>
  `.trim();
})();

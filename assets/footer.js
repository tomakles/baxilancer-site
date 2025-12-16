(() => {
  const GA_MEASUREMENT_ID = "G-Y7LM47GKKD";
  const ANALYTICS_CONSENT_KEY = "3lancer_analytics_consent_v1"; // 'granted' | 'denied'

  const supported = {
    en: { path: "/" },
    de: { path: "/de/" },
    es: { path: "/es/" },
    pl: { path: "/pl/" },
    sk: { path: "/sk/" },
  };

  const labels = {
    en: {
      home: "Home",
      gps: "GPS",
      receipts: "Receipts",
      reports: "Reports",
      guides: "Guides",
      privacy: "Privacy",
      cookies: "Cookies",
      contact: "Contact",
    },
    de: {
      home: "Start",
      gps: "GPS",
      receipts: "Belege",
      reports: "Berichte",
      guides: "Leitfäden",
      privacy: "Datenschutz",
      cookies: "Cookies",
      contact: "Kontakt",
    },
    es: {
      home: "Inicio",
      gps: "GPS",
      receipts: "Recibos",
      reports: "Informes",
      guides: "Guías",
      privacy: "Privacidad",
      cookies: "Cookies",
      contact: "Contacto",
    },
    pl: {
      home: "Start",
      gps: "GPS",
      receipts: "Paragony",
      reports: "Raporty",
      guides: "Poradniki",
      privacy: "Prywatność",
      cookies: "Pliki cookie",
      contact: "Kontakt",
    },
    sk: {
      home: "Domov",
      gps: "GPS",
      receipts: "Bločky",
      reports: "Prehľady",
      guides: "Návody",
      privacy: "Súkromie",
      cookies: "Súbory cookie",
      contact: "Kontakt",
    },
  };

  const cookieBannerLabels = {
    en: {
      title: "Cookies",
      text: "We use optional cookies for anonymous analytics (Google Analytics) to improve the website.",
      accept: "Accept",
      decline: "Decline",
      learnMore: "Privacy policy",
    },
    de: {
      title: "Cookies",
      text: "Wir verwenden optionale Cookies für anonyme Analysen (Google Analytics), um die Website zu verbessern.",
      accept: "Akzeptieren",
      decline: "Ablehnen",
      learnMore: "Datenschutz",
    },
    es: {
      title: "Cookies",
      text: "Usamos cookies opcionales de analítica anónima (Google Analytics) para mejorar el sitio web.",
      accept: "Aceptar",
      decline: "Rechazar",
      learnMore: "Privacidad",
    },
    pl: {
      title: "Cookies",
      text: "Używamy opcjonalnych plików cookie do anonimowej analityki (Google Analytics), aby ulepszać stronę.",
      accept: "Akceptuję",
      decline: "Odrzuć",
      learnMore: "Prywatność",
    },
    sk: {
      title: "Cookies",
      text: "Používame voliteľné súbory cookie na anonymnú analytiku (Google Analytics), aby sme zlepšovali web.",
      accept: "Súhlasím",
      decline: "Odmietnuť",
      learnMore: "Súkromie",
    },
  };

  const safeLocalStorageGet = (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const safeLocalStorageSet = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore storage errors (e.g., private mode)
    }
  };

  const getAnalyticsConsent = () => {
    const raw = safeLocalStorageGet(ANALYTICS_CONSENT_KEY);
    if (raw === "granted" || raw === "denied") return raw;
    return null;
  };

  const setAnalyticsConsent = (value) => {
    if (value !== "granted" && value !== "denied") return;
    safeLocalStorageSet(ANALYTICS_CONSENT_KEY, value);
  };

  const doNotTrackEnabled = () => {
    const dnt =
      navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
    return dnt === "1" || dnt === "yes";
  };

  const ensurePreconnect = (href) => {
    if (document.querySelector(`link[rel="preconnect"][href="${href}"]`))
      return;
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = href;
    link.crossOrigin = "anonymous";
    document.head.appendChild(link);
  };

  const expireCookie = (name, domain) => {
    const domainPart = domain ? `; domain=${domain}` : "";
    document.cookie = `${name}=; Max-Age=0; path=/${domainPart}`;
  };

  const clearGoogleAnalyticsCookies = () => {
    if (!GA_MEASUREMENT_ID) return;
    const suffix = GA_MEASUREMENT_ID.replace(/^G-/, "");
    const cookieNames = ["_ga", `_ga_${suffix}`, "_gid", "_gat"];

    const host = window.location.hostname;
    const domains = [null, host];
    if (host.includes(".")) domains.push(`.${host}`);

    for (const name of cookieNames) {
      for (const domain of domains) expireCookie(name, domain);
    }
  };

  const enableGoogleAnalytics = () => {
    if (!GA_MEASUREMENT_ID) return;

    window[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    ensurePreconnect("https://www.googletagmanager.com");

    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }

    const gaSrc = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      GA_MEASUREMENT_ID
    )}`;
    if (!document.querySelector(`script[src="${gaSrc}"]`)) {
      const script = document.createElement("script");
      script.async = true;
      script.src = gaSrc;
      document.head.appendChild(script);
    }

    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  };

  const disableGoogleAnalytics = () => {
    if (!GA_MEASUREMENT_ID) return;
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
    clearGoogleAnalyticsCookies();
  };

  const baseLang = (lang) => (lang || "").toLowerCase().split("-")[0];

  const getCurrentLang = () => {
    const htmlLang = baseLang(document.documentElement.lang);
    if (supported[htmlLang]) return htmlLang;

    const path = window.location.pathname;
    for (const lang of ["sk", "de", "es", "pl"]) {
      if (path === `/${lang}/` || path.startsWith(`/${lang}/`)) return lang;
    }
    return "en";
  };

  const year = new Date().getFullYear();
  const lang = getCurrentLang();
  const t = labels[lang] || labels.en;
  const cookieT = cookieBannerLabels[lang] || cookieBannerLabels.en;
  const homePath = supported[lang]?.path || "/";

  const privacyHref = `${homePath}privacy/`;

  const getOrCreateCookieBanner = () => {
    const existing = document.getElementById("cookie-banner");
    if (existing) return existing;

    const banner = document.createElement("div");
    banner.id = "cookie-banner";
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.hidden = true;

    banner.innerHTML = `
      <div class="cookie-inner">
        <div class="cookie-text">
          <strong>${cookieT.title}</strong>
          <span>
            ${cookieT.text}
            <a href="${privacyHref}">${cookieT.learnMore}</a>
          </span>
        </div>
        <div class="cookie-actions">
          <button type="button" class="cookie-btn secondary" data-cookie-decline>${cookieT.decline}</button>
          <button type="button" class="cookie-btn primary" data-cookie-accept>${cookieT.accept}</button>
        </div>
      </div>
    `.trim();

    const acceptBtn = banner.querySelector("[data-cookie-accept]");
    const declineBtn = banner.querySelector("[data-cookie-decline]");

    acceptBtn?.addEventListener("click", () => {
      setAnalyticsConsent("granted");
      enableGoogleAnalytics();
      banner.hidden = true;
    });

    declineBtn?.addEventListener("click", () => {
      setAnalyticsConsent("denied");
      disableGoogleAnalytics();
      banner.hidden = true;
    });

    document.body.appendChild(banner);
    return banner;
  };

  const openCookieBanner = () => {
    if (!GA_MEASUREMENT_ID) return;
    const banner = getOrCreateCookieBanner();
    banner.hidden = false;
  };

  const initAnalyticsConsent = () => {
    if (!GA_MEASUREMENT_ID) return;
    const consent = getAnalyticsConsent();
    if (consent === "granted") {
      enableGoogleAnalytics();
      return;
    }
    if (consent === "denied") {
      disableGoogleAnalytics();
      return;
    }
    if (!doNotTrackEnabled()) openCookieBanner();
  };

  initAnalyticsConsent();

  const items = [
    { key: "home", href: homePath },
    { key: "gps", href: `${homePath}gps-time-tracking/` },
    { key: "receipts", href: `${homePath}receipt-scanner/` },
    { key: "reports", href: `${homePath}reports/` },
    { key: "guides", href: `${homePath}guides/` },
    { key: "privacy", href: privacyHref },
    { key: "cookies", href: "#", action: "cookie-settings" },
  ];

  const isActive = (href) => {
    const path = window.location.pathname;
    if (href === "/" || Object.values(supported).some((v) => v.path === href)) {
      return path === href || path === `${href}index.html`;
    }
    return path === href || path.startsWith(href);
  };

  const stripLangPrefix = (path) => {
    for (const lang of ["sk", "de", "es", "pl"]) {
      const prefix = `/${lang}`;
      if (path === prefix || path === `${prefix}/`) return "/";
      if (path.startsWith(`${prefix}/`))
        return path.slice(prefix.length) || "/";
    }
    return path || "/";
  };

  const buildPathForLang = (targetLang, basePath) => {
    if (!supported[targetLang]) return basePath;
    if (targetLang === "en") return basePath;
    if (basePath === "/" || basePath === "/index.html")
      return supported[targetLang].path;
    return `/${targetLang}${basePath}`;
  };

  const getHreflangPaths = () => {
    const paths = {};
    const links = document.querySelectorAll(
      'link[rel="alternate"][hreflang][href]'
    );
    for (const link of links) {
      const raw = (link.getAttribute("hreflang") || "").toLowerCase();
      if (!raw || raw === "x-default") continue;
      const langKey = baseLang(raw);
      if (!supported[langKey]) continue;
      if (paths[langKey]) continue;
      try {
        const url = new URL(link.getAttribute("href"), window.location.href);
        paths[langKey] = url.pathname;
      } catch {
        // ignore invalid URLs
      }
    }
    return paths;
  };

  const ensureLangSwitcher = () => {
    if (document.querySelector(".lang-switcher")) return;
    const header = document.querySelector("header");
    if (!header) return;

    const headerInner = header.querySelector(".header-inner") || header;

    const currentLang = getCurrentLang();
    const suffix = `${window.location.search || ""}${
      window.location.hash || ""
    }`;

    const hreflangPaths = getHreflangPaths();
    const basePath = stripLangPrefix(window.location.pathname);

    const labels = {
      en: "🇬🇧 EN",
      de: "🇩🇪 DE",
      es: "🇪🇸 ES",
      pl: "🇵🇱 PL",
      sk: "🇸🇰 SK",
    };

    const langOrder = ["en", "de", "es", "pl", "sk"];

    const makeHref = (langKey) => {
      const path =
        hreflangPaths[langKey] || buildPathForLang(langKey, basePath);
      return `${path}${suffix}`;
    };

    const switcher = document.createElement("div");
    switcher.className = "lang-switcher site-lang-switcher";
    switcher.setAttribute("aria-label", "Language");
    switcher.innerHTML = langOrder
      .map((langKey) => {
        const active = langKey === currentLang;
        const activeClass = active ? "active" : "";
        const ariaCurrentAttr = active ? ' aria-current="page"' : "";
        return `<a href="${makeHref(
          langKey
        )}" class="lang-link ${activeClass}"${ariaCurrentAttr}>${
          labels[langKey]
        }</a>`;
      })
      .join("");

    const brand = headerInner.querySelector(".brand");
    let headerTop =
      headerInner.querySelector(".header-top") ||
      headerInner.querySelector(".top");
    if (!headerTop) {
      headerTop = document.createElement("div");
      headerTop.className = "header-top site-header-top";
      headerInner.insertAdjacentElement("afterbegin", headerTop);
    }

    if (brand && brand.parentElement !== headerTop)
      headerTop.appendChild(brand);
    headerTop.appendChild(switcher);
  };

  const ensureTopNav = () => {
    if (document.getElementById("site-topnav")) return;

    const topNavItems = items.filter((item) => item.key !== "cookies");

    const navLinks = topNavItems
      .map((item) => {
        const label = t[item.key] || labels.en[item.key] || item.key;
        const active = isActive(item.href);
        const activeClass = active ? "active" : "";
        const actionAttr = item.action ? ` data-action="${item.action}"` : "";
        const ariaCurrentAttr = active ? ' aria-current="page"' : "";
        return `<a href="${item.href}" class="${activeClass}"${actionAttr}${ariaCurrentAttr}>${label}</a>`;
      })
      .join("");

    const wrapper = document.createElement("div");
    wrapper.id = "site-topnav";
    wrapper.className = "site-topnav";
    wrapper.innerHTML = `
      <nav class="topnav-pill" aria-label="Primary">
        ${navLinks}
      </nav>
    `.trim();

    const header = document.querySelector("header");
    if (header?.parentElement) {
      header.insertAdjacentElement("afterend", wrapper);
    } else {
      document.body.insertAdjacentElement("afterbegin", wrapper);
    }

    const cookieSettingsLink = wrapper.querySelector(
      '[data-action="cookie-settings"]'
    );
    cookieSettingsLink?.addEventListener("click", (e) => {
      e.preventDefault();
      openCookieBanner();
    });
  };

  ensureLangSwitcher();
  ensureTopNav();

  let footer = document.querySelector("footer");
  if (!footer) {
    footer = document.createElement("footer");
    document.body.appendChild(footer);
  }

  footer.classList.add("site-footer");

  const navLinks = items
    .map((item, idx) => {
      const label = t[item.key] || labels.en[item.key] || item.key;
      const active = isActive(item.href);
      const activeClass = active ? "active" : "";
      const ariaCurrentAttr = active ? ' aria-current="page"' : "";
      const sep =
        idx === 0 ? "" : '<span class="footer-sep" aria-hidden="true">•</span>';
      const actionAttr = item.action ? ` data-action="${item.action}"` : "";
      return `${sep}<a href="${item.href}" class="${activeClass}"${actionAttr}${ariaCurrentAttr}>${label}</a>`;
    })
    .join("");

  const email = "threelancer.customer@gmail.com";
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

  const cookieSettingsLink = footer.querySelector(
    '[data-action="cookie-settings"]'
  );
  cookieSettingsLink?.addEventListener("click", (e) => {
    e.preventDefault();
    openCookieBanner();
  });
})();

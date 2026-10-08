(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;

  const $ = (selector, scope = doc) => scope.querySelector(selector);
  const $$ = (selector, scope = doc) => [...scope.querySelectorAll(selector)];

  // Keys used to remember the visitor's choices between visits.
  const LANG_KEY = "pozzo-lang";
  const THEME_KEY = "pozzo-theme";

  // Supported languages: the dictionary file and the value set on <html lang>.
  const languages = {
    en: {
      file: "./i18n/EN.json",
      htmlLang: "en-US"
    },
    es: {
      file: "./i18n/ES.json",
      htmlLang: "es-419"
    }
  };

  let translations = {};
  let currentLanguage = "en";

  // Returns the translated text for a key, or the fallback when it is missing.
  const t = (key, fallback = "") => {
    return translations[key] ?? fallback;
  };

  // Replaces {placeholders} in a translated string with the given values.
  const interpolate = (text, values = {}) => {
    return text.replace(/\{(\w+)\}/g, (_, key) => {
      return values[key] ?? `{${key}}`;
    });
  };

  const renderConsent = (element) => {
    const template = t(
      "join.consent",
      "I accept the {terms} and the {privacy}."
    );

    const termsText = t(
      "footer.terms",
      "Terms and Conditions"
    );

    const privacyText = t(
      "footer.privacy",
      "Privacy Policy"
    );

    const parts = template.split(/(\{terms\}|\{privacy\})/g);

    element.replaceChildren();

    parts.forEach((part) => {
      if (part === "{terms}") {
        const link = doc.createElement("a");
        link.href = "./terms.html";
        link.textContent = termsText;
        element.appendChild(link);
        return;
      }

      if (part === "{privacy}") {
        const link = doc.createElement("a");
        link.href = "./privacy.html";
        link.textContent = privacyText;
        element.appendChild(link);
        return;
      }

      element.appendChild(doc.createTextNode(part));
    });
  };

  const translatePage = () => {
    $$("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;

      if (key === "join.consent") {
        renderConsent(element);
        return;
      }

      const value = translations[key];

      if (typeof value === "string") {
        element.textContent = value;
      }
    });

    $$("[data-i18n-aria-label]").forEach((element) => {
      const key = element.dataset.i18nAriaLabel;
      const value = translations[key];

      if (typeof value === "string") {
        element.setAttribute("aria-label", value);
      }
    });

    $$("[data-i18n-alt]").forEach((element) => {
      const key = element.dataset.i18nAlt;
      const value = translations[key];

      if (typeof value === "string") {
        element.alt = value;
      }
    });

    $$("[data-i18n-template]").forEach((element) => {
      const key = element.dataset.i18nTemplate;
      const value = translations[key];

      if (typeof value !== "string") {
        return;
      }

      const date =
        currentLanguage === "es"
          ? element.dataset.dateEs
          : element.dataset.dateEn;

      element.textContent = interpolate(value, {
        date: date || "",
        email: element.dataset.email || "",
        name: element.dataset.name || ""
      });
    });

    const page = doc.body.dataset.page || "home";

    const metaKeys = {
      home: {
        title: "meta.title",
        description: "meta.description"
      },
      terms: {
        title: "meta.terms.title",
        description: "meta.terms.description"
      },
      privacy: {
        title: "meta.privacy.title",
        description: "meta.privacy.description"
      }
    };

    const meta = metaKeys[page] || metaKeys.home;

    if (translations[meta.title]) {
      doc.title = translations[meta.title];
    }

    const description = $('meta[name="description"]');

    if (description && translations[meta.description]) {
      description.content = translations[meta.description];
    }

    root.lang = languages[currentLanguage].htmlLang;

    $$("[data-lang]").forEach((button) => {
      if (button.dataset.lang === currentLanguage) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    const themeButton = $("[data-theme-toggle]");

    if (themeButton) {
      const theme =
        root.getAttribute("data-theme") ||
        getInitialTheme();

      themeButton.setAttribute(
        "aria-label",
        theme === "dark"
          ? t("nav.theme.dark", "Theme: dark")
          : t("nav.theme.light", "Theme: light")
      );
    }
  };

  const setLanguage = async (lang) => {
    if (!languages[lang]) {
      lang = "en";
    }

    try {
      const response = await fetch(languages[lang].file, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      translations = await response.json();
      currentLanguage = lang;

      try {
        localStorage.setItem(LANG_KEY, lang);
      } catch {}

      translatePage();
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  $$("[data-lang]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setLanguage(button.dataset.lang);
    });
  });

  const getInitialLanguage = () => {
    try {
      const savedLanguage = localStorage.getItem(LANG_KEY);

      if (savedLanguage === "en" || savedLanguage === "es") {
        return savedLanguage;
      }
    } catch {}

    return navigator.language.toLowerCase().startsWith("es")
      ? "es"
      : "en";
  };

  const getInitialTheme = () => {
    try {
      const saved = localStorage.getItem(THEME_KEY);

      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch {}

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // Theme: saved choice first, then the system preference.
  const themeButton = $("[data-theme-toggle]");
  let theme = getInitialTheme();

  const applyTheme = () => {
    root.setAttribute("data-theme", theme);

    if (themeButton) {
      themeButton.dataset.state = theme;

      themeButton.setAttribute(
        "aria-label",
        theme === "dark"
          ? t("nav.theme.dark", "Theme: dark")
          : t("nav.theme.light", "Theme: light")
      );
    }

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  };

  applyTheme();

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      theme = theme === "light" ? "dark" : "light";
      applyTheme();
    });
  }

  // App bar: marks it as scrolled so it can show a shadow.
  const appBar = $("[data-app-bar]");

  const updateAppBar = () => {
    if (!appBar) {
      return;
    }

    appBar.dataset.scrolled = String(window.scrollY > 20);
  };

  updateAppBar();

  window.addEventListener("scroll", updateAppBar, {
    passive: true
  });

  // Mobile navigation menu.
  const menu = $("[data-menu]");
  const menuButton = $("[data-menu-toggle]");

  const closeMenu = () => {
    if (!menu || !menuButton) {
      return;
    }

    menu.dataset.open = "false";
    menuButton.setAttribute("aria-expanded", "false");
  };

  if (menu && menuButton) {
    menuButton.addEventListener("click", () => {
      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      menu.dataset.open = String(!isOpen);
      menuButton.setAttribute("aria-expanded", String(!isOpen));
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    doc.addEventListener("click", (event) => {
      if (
        menuButton.getAttribute("aria-expanded") === "true" &&
        !event.target.closest("[data-menu]") &&
        !event.target.closest("[data-menu-toggle]")
      ) {
        closeMenu();
      }
    });
  }

  // In-page links scroll smoothly unless the visitor prefers reduced motion.
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  doc.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');

    if (!link || link.hasAttribute("data-lang")) {
      return;
    }

    const href = link.getAttribute("href");

    if (!href || href === "#") {
      return;
    }

    const target = doc.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();

    target.scrollIntoView({
      behavior: reduceMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  });

  // Hides the sticky call to action while the join section is on screen.
  const stickyCta = $("[data-sticky-cta]");
  const joinSection = $("#join");

  if (
    stickyCta &&
    joinSection &&
    "IntersectionObserver" in window
  ) {
    new IntersectionObserver(([entry]) => {
      stickyCta.dataset.hidden = String(entry.isIntersecting);
    }).observe(joinSection);
  }

  // Keeps the footer year current.
  $$("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  // Waitlist form: validation and submission.
  const form = $("[data-waitlist]");

  if (form) {
    const nameInput = $("#join-name", form);
    const contactInput = $("#join-contact", form);
    const consentInput = $("#join-consent", form);

    const nameError = $("#join-name-error", form);
    const contactError = $("#join-contact-error", form);
    const consentError = $("#join-consent-error", form);

    const submit = $("[data-submit]", form);
    const submitLabel = $("[data-submit-label]", form);
    const alertBox = $("[data-form-alert]", form);
    const alertText = $("[data-alert-text]", form);

    const success = $("[data-join-success]");
    const successText = $("[data-success-text]");
    const successTitle = $("[data-success-title]");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phonePattern = /^(?:\+?51)?9\d{8}$/;

    const parseContact = (raw) => {
      const value = raw.trim();

      if (emailPattern.test(value)) {
        return {
          type: "email",
          value: value.toLowerCase()
        };
      }

      const compact = value.replace(/\s+/g, "");

      if (phonePattern.test(compact)) {
        return {
          type: "phone",
          value: `+51${compact.slice(-9)}`
        };
      }

      return null;
    };

    const setError = (input, container, message) => {
      if (!input || !container) {
        return;
      }

      const text = $("[data-error-text]", container);

      if (message) {
        if (text) {
          text.textContent = message;
        }

        container.hidden = false;
        input.setAttribute("aria-invalid", "true");
      } else {
        if (text) {
          text.textContent = "";
        }

        container.hidden = true;
        input.removeAttribute("aria-invalid");
      }
    };

    const validateName = () => {
      if (nameInput?.value.trim()) {
        setError(nameInput, nameError, "");
        return true;
      }

      setError(
        nameInput,
        nameError,
        t("join.error.name.required", "Enter your name.")
      );

      return false;
    };

    const validateContact = () => {
      const value = contactInput?.value.trim() || "";

      if (!value) {
        setError(
          contactInput,
          contactError,
          t(
            "join.error.contact.required",
            "Enter an email or a mobile number."
          )
        );

        return false;
      }

      if (!parseContact(value)) {
        setError(
          contactInput,
          contactError,
          t(
            "join.error.contact.invalid",
            "Enter a valid email or mobile number."
          )
        );

        return false;
      }

      setError(contactInput, contactError, "");
      return true;
    };

    const validateConsent = () => {
      if (consentInput?.checked) {
        setError(consentInput, consentError, "");
        return true;
      }

      setError(
        consentInput,
        consentError,
        t(
          "join.error.consent.required",
          "Accept the terms to continue."
        )
      );

      return false;
    };

    nameInput?.addEventListener("blur", validateName);
    contactInput?.addEventListener("blur", validateContact);
    consentInput?.addEventListener("change", validateConsent);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (alertBox) {
        alertBox.hidden = true;
      }

      const validName = validateName();
      const validContact = validateContact();
      const validConsent = validateConsent();

      if (!validName || !validContact || !validConsent) {
        form.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }

      const honeypot = form.querySelector('input[name="company"]');

      if (honeypot?.value) {
        return;
      }

      const name = nameInput.value.trim();
      const contact = parseContact(contactInput.value);
      const endpoint = form.dataset.endpoint;

      if (!endpoint) {
        const subject = encodeURIComponent(
          t("join.mailto.subject", "Pozzo waitlist")
        );

        const body = encodeURIComponent(
          `${t("join.name.label", "Name")}: ${name}\n${t(
            "join.contact.label",
            "Email or mobile number"
          )}: ${contact.value}`
        );

        window.location.href =
          `mailto:${form.dataset.email}?subject=${subject}&body=${body}`;

        return;
      }

      if (submit) {
        submit.disabled = true;
      }

      if (submitLabel) {
        submitLabel.textContent = t("join.sending", "Sending...");
      }

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            name,
            contact: contact.value,
            type: contact.type,
            locale: root.lang,
            consent: true
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        form.hidden = true;

        if (success) {
          success.hidden = false;
        }

        if (successText) {
          successText.textContent = interpolate(
            t(
              "join.success.text",
              "Thanks, {name}. We will send you a notice when Pozzo is available."
            ),
            { name }
          );
        }

        successTitle?.focus();
      } catch {
        if (submit) {
          submit.disabled = false;
        }

        if (submitLabel) {
          submitLabel.textContent = t(
            "join.submit",
            "Join the waitlist"
          );
        }

        if (alertBox) {
          alertBox.hidden = false;
        }

        if (alertText) {
          alertText.textContent = t(
            "join.error.network",
            "We could not send your details. Check your connection and try again."
          );
        }
      }
    });
  }

  setLanguage(getInitialLanguage());
})();
(() => {
  "use strict";

  const doc = document;
  const root = doc.documentElement;

  /**
   * Selects a single DOM element matching the CSS selector.
   * @param {string} selector - CSS selector to match.
   * @param {ParentNode} [scope=doc] - Scope element to search within.
   * @returns {Element|null} The matching element or null if not found.
   */
  const $ = (selector, scope = doc) => scope.querySelector(selector);

  /**
   * Selects all DOM elements matching the CSS selector as an array.
   * @param {string} selector - CSS selector to match.
   * @param {ParentNode} [scope=doc] - Scope element to search within.
   * @returns {Element[]} Array of matching elements.
   */
  const $$ = (selector, scope = doc) => [...scope.querySelectorAll(selector)];

  // Keys used to remember the visitor's choices between visits in localStorage.
  const LANG_KEY = "pozzo-lang";
  const THEME_KEY = "pozzo-theme";

  // Supported languages: configuration mapping to dictionary files and HTML lang attributes.
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

  /**
   * Returns the translated text for a key, or the fallback when it is missing.
   * @param {string} key - Translation dictionary key.
   * @param {string} [fallback=""] - Fallback string if key is not found.
   * @returns {string} The localized string or fallback.
   */
  const t = (key, fallback = "") => {
    return translations[key] ?? fallback;
  };

  /**
   * Replaces {placeholders} in a translated string with the given values.
   * @param {string} text - Template text containing {key} tokens.
   * @param {Record<string, string>} [values={}] - Key-value map of replacement values.
   * @returns {string} Interpolated text.
   */
  const interpolate = (text, values = {}) => {
    return text.replace(/\{(\w+)\}/g, (_, key) => {
      return values[key] ?? `{${key}}`;
    });
  };

  /**
   * Renders the waitlist consent checkbox label with interactive links
   * to the Terms and Conditions and Privacy Policy pages.
   * @param {HTMLElement} element - Label container element to populate.
   */
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

  /**
   * Iterates through all DOM elements with internationalization attributes
   * and updates their textContent, ARIA labels, alt text, page titles,
   * and meta tags based on the active dictionary.
   */
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

  /**
   * Asynchronously fetches the translation dictionary JSON for the requested
   * language, updates application state and localStorage, and triggers a full DOM translation.
   * @param {string} lang - Target language code ('en' or 'es').
   * @returns {Promise<void>}
   */
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

  // Attach click event listeners to language selector links/buttons.
  $$("[data-lang]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      setLanguage(button.dataset.lang);
    });
  });

  /**
   * Resolves the initial language preference by checking localStorage first,
   * then falling back to browser navigator.language ('es' or 'en').
   * @returns {string} Detected language code ('en' or 'es').
   */
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

  /**
   * Resolves the initial theme by checking localStorage first, then falling
   * back to the system prefers-color-scheme media query.
   * @returns {string} Detected theme mode ('dark' or 'light').
   */
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

  // Theme initialization: saved choice first, then system preference.
  const themeButton = $("[data-theme-toggle]");
  let theme = getInitialTheme();

  /**
   * Applies the current theme mode to the root <html> element, updates
   * the toggle button's state and accessibility label, and persists to localStorage.
   */
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

  // Attach click listener to toggle between light and dark themes.
  if (themeButton) {
    themeButton.addEventListener("click", () => {
      theme = theme === "light" ? "dark" : "light";
      applyTheme();
    });
  }

  // App bar scroll watcher: marks header with data-scrolled when scrolled down.
  const appBar = $("[data-app-bar]");

  /**
   * Updates the app bar's 'data-scrolled' attribute based on vertical scroll offset
   * to toggle shadow/elevation styling.
   */
  const updateAppBar = () => {
    if (!appBar) {
      return;
    }

    appBar.dataset.scrolled = String(window.scrollY > 20);
  };

  updateAppBar();

  // Listen for scroll events with passive flag for high performance.
  window.addEventListener("scroll", updateAppBar, {
    passive: true
  });

  // Mobile navigation drawer controls.
  const menu = $("[data-menu]");
  const menuButton = $("[data-menu-toggle]");

  /**
   * Closes the mobile navigation drawer and resets ARIA state attributes.
   */
  const closeMenu = () => {
    if (!menu || !menuButton) {
      return;
    }

    menu.dataset.open = "false";
    menuButton.setAttribute("aria-expanded", "false");
  };

  if (menu && menuButton) {
    // Toggle menu open/closed state on hamburger button click.
    menuButton.addEventListener("click", () => {
      const isOpen =
        menuButton.getAttribute("aria-expanded") === "true";

      menu.dataset.open = String(!isOpen);
      menuButton.setAttribute("aria-expanded", String(!isOpen));
    });

    // Close menu when any navigational link inside the drawer is clicked.
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    // Close menu when the Escape key is pressed.
    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    // Close menu when a click occurs outside the menu and toggle button.
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

  // Smooth scroll for internal hash links with reduced-motion accessibility preference check.
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

  // Sticky Call to Action (CTA) observer: hides floating CTA when waitlist section is visible.
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

  // Footer: populate current calendar year automatically across all footer notices.
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

    /**
     * Normalizes raw contact input and validates whether it matches an email format
     * or a Peruvian mobile phone format (9 digits, optional +51 prefix).
     * @param {string} raw - Raw input string from the user.
     * @returns {{type: 'email'|'phone', value: string}|null} Parsed contact object or null if invalid.
     */
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

    /**
     * Displays or clears a validation error message for a form input field,
     * toggling container visibility and accessibility attributes.
     * @param {HTMLElement|null} input - Input element being validated.
     * @param {HTMLElement|null} container - Error container element.
     * @param {string} message - Error message text to display, or empty string to clear.
     */
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

    /**
     * Validates that the visitor has entered their name.
     * @returns {boolean} True if name is provided, false otherwise.
     */
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

    /**
     * Validates that the contact field contains a valid email address or mobile phone.
     * @returns {boolean} True if contact format is valid, false otherwise.
     */
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

    /**
     * Validates that the user has accepted the terms and conditions and privacy policy.
     * @returns {boolean} True if consent checkbox is checked, false otherwise.
     */
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

    // Attach inline validation listeners on blur and change events.
    nameInput?.addEventListener("blur", validateName);
    contactInput?.addEventListener("blur", validateContact);
    consentInput?.addEventListener("change", validateConsent);

    // Form submission handler: validates fields, enforces honeypot, and sends data or triggers mailto fallback.
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

  // Bootstrap initialization: detect user preferred language and initialize page localization.
  setLanguage(getInitialLanguage());
})();

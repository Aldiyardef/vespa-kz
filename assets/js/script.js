document.addEventListener("DOMContentLoaded", () => {
    const translations = {
    en: {
      "Мы в Instagram": "Follow us on Instagram",
      "О клубе": "About the club",
      "История": "History",
      "События": "Events",
      "Галерея": "Gallery",
      "Дни рождения": "Birthdays",
      "Устав": "Charter",
      "Контакты": "Contacts",

      "Свобода": "Freedom",
      "в движении": "in motion",

      "Официальное сообщество любителей итальянских скутеров Vespa в Казахстане.":
        "The official community of Italian Vespa scooter enthusiasts in Kazakhstan.",

      "Листайте вниз": "Scroll down",
      "Присоединиться": "Join us",
      "Стать частью клуба": "Become part of the club",

      "Итальянский": "Italian",
      "характер.": "character.",
      "Казахстанские": "Kazakh",
      "дороги.": "roads.",

      "С апреля 2021 года": "Since April 2021",
      "История клуба": "Club history",

      "Календарь клуба": "Club calendar",
      "Встречи, поездки, конкурсы и мероприятия для участников клуба и друзей Vespa.":
        "Meetings, rides, contests and events for club members and Vespa friends.",

      "Наши поездки": "Our rides",
      "Фотографии с поездок, встреч и международных мероприятий.":
        "Photos from rides, meetings and international events.",

      "Сообщество": "Community",
      "Наши друзья": "Our friends",
      "Дни рождения": "Birthdays",
      "Календарь участников": "Members' calendar",

      "Устав клуба": "Club charter",
      "Поехали вместе": "Let's ride together",
      "Связаться с нами": "Contact us",
      "Готовы": "Ready",
      "к поездке?": "for a ride?",
      "Instagram": "Instagram",
      "Almaty, Kazakhstan": "Almaty, Kazakhstan"
    }
  };

  const originalTexts = new Map();

  function translatePage(language) {
    document.documentElement.lang = language;

    document.querySelectorAll("body *").forEach(element => {
      if (element.closest("#intro-loader")) return;
      if (element.children.length === 0) {
        const original = originalTexts.get(element) || element.textContent.trim();

        if (!originalTexts.has(element)) {
          originalTexts.set(element, original);
        }

        if (language === "en" && translations.en[original]) {
          element.textContent = translations.en[original];
        } else if (language === "ru") {
          element.textContent = originalTexts.get(element);
        }
      }
    });

    document.querySelectorAll(".lang-button").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.language === language
      );
    });

    localStorage.setItem("vespa-language", language);
  }

  document.querySelectorAll(".lang-button").forEach(button => {
    button.addEventListener("click", () => {
      translatePage(button.dataset.language);
    });
  });

  const savedLanguage = localStorage.getItem("vespa-language") || "ru";
  translatePage(savedLanguage);
  /*
  =====================================================
  ДНИ РОЖДЕНИЯ
  =====================================================
  */

  const birthdays = [
    {
      name: "Александр Керимов",
      date: "27 февраля",
      month: 2,
      day: 27,
      image: "Александр Керимов.jpeg"
    },
    {
      name: "Кира Шляфер",
      date: "12 марта",
      month: 3,
      day: 12,
      image: "Кира Шляфер.jpeg"
    },
    {
      name: "Канат Аубакиров",
      date: "18 марта",
      month: 3,
      day: 18,
      image: "Канат Аубакиров.jpg"
    },
    {
      name: "Азамат Жарылкасын",
      date: "11 апреля",
      month: 4,
      day: 11,
      image: "Азамат Жарылкасын.jpeg"
    },
    {
      name: "Алексей Сосновский",
      date: "26 апреля",
      month: 4,
      day: 26,
      image: "Алексей Сосновский.jpeg"
    },
    {
      name: "Алмас Рахманкул",
      date: "28 апреля",
      month: 4,
      day: 28,
      image: "Алмас Рахманкул.jpeg"
    },
    {
      name: "Николай Марков",
      date: "1 мая",
      month: 5,
      day: 1,
      image: "Николай Марков.jpeg"
    },
    {
      name: "Atıl Avcı",
      date: "21 мая",
      month: 5,
      day: 21,
      image: "Atıl Avcı.jpeg"
    },
    {
      name: "Елдар Жанабаев",
      date: "7 июня",
      month: 6,
      day: 7,
      image: "Елдар Жанабаев.jpeg"
    },
    {
      name: "Асыл Ибрагимов",
      date: "26 июня",
      month: 6,
      day: 26,
      image: "Асыл Ибрагимов.jpeg"
    },
    {
      name: "Сергей Крылов",
      date: "1 августа",
      month: 8,
      day: 1,
      image: "Сергей Крылов.jpeg"
    },
    {
      name: "Гиги",
      date: "6 августа",
      month: 8,
      day: 6,
      image: "Гиги.jpeg"
    },
    {
      name: "Александр Бугаенко",
      date: "5 сентября",
      month: 9,
      day: 5,
      image: "Александр Бугаенко.jpeg"
    },
    {
      name: "Петр Маслов",
      date: "17 сентября",
      month: 9,
      day: 17,
      image: "Петр Маслов.jpeg"
    },
    {
      name: "Владимир Буренко",
      date: "9 октября",
      month: 10,
      day: 9,
      image: "Владимир Буренко.jpeg"
    },
    {
      name: "Алдияр Муканов",
      date: "9 октября",
      month: 10,
      day: 9,
      image: "Алдияр Муканов.jpeg"
    },
    {
      name: "Иван Керимов",
      date: "5 декабря",
      month: 12,
      day: 5,
      image: "Иван Керимов.jpeg"
    }
  ];

  birthdays.sort((a, b) => {
    if (a.month !== b.month) {
      return a.month - b.month;
    }

    return a.day - b.day;
  });

  const birthdaysContainer =
    document.querySelector("#birthdays-grid") ||
    document.querySelector(".birthdays-grid");

  if (birthdaysContainer) {
    birthdaysContainer.innerHTML = "";

    birthdays.forEach(person => {
      const card = document.createElement("article");
      card.className = "birthday-card";

      const image = document.createElement("img");
      image.src = `assets/birthdays/${encodeURIComponent(person.image)}`;
      image.alt = person.name;
      image.loading = "lazy";

      image.onerror = () => {
        image.src = "assets/images/vespa-logo.png";
      };

      const info = document.createElement("div");
      info.className = "birthday-info";

      const name = document.createElement("h3");
      name.textContent = person.name;

      const date = document.createElement("p");
      date.textContent = person.date;

      info.appendChild(name);
      info.appendChild(date);

      card.appendChild(image);
      card.appendChild(info);

      birthdaysContainer.appendChild(card);
    });
  }


  /*
  =====================================================
  СОБЫТИЯ
  =====================================================
  */

  const events = [
    {
      title: "Vespa Среды",
      image: "wednesday.jpeg"
    },
    {
      title: "Поездка на Arbawine",
      image: "arbawine.jpg"
    },
    {
      title: "Фотоконкурс 2026",
      image: "contest2026.png"
    },
    {
      title: "Distinguished Gentleman's Ride",
      image: "dgr.jpg"
    },
    {
      title: "Поездка на Иссык-Куль",
      image: "issykkul.jpg"
    },
    {
      title: "Поездка на Катон-Карагай",
      image: "katon.jpg"
    },
    {
      title: "Открытие и закрытие мотосезона",
      image: "season.jpg"
    },
    {
      title: "SIP Open Days",
      image: "sipopependy.jpg"
    },
    {
      title: "Поездка на Сокол",
      image: "sokol.jpg"
    },
    {
      title: "VWD 2025",
      image: "vwd2025.jpg"
    }
  ];

  const eventsContainer =
    document.querySelector("#events-grid") ||
    document.querySelector(".events-grid");

  if (eventsContainer) {
    eventsContainer.innerHTML = "";

    events.forEach(event => {
      const card = document.createElement("article");
      card.className = "event-card";

      const image = document.createElement("img");
      image.src = `assets/events/${encodeURIComponent(event.image)}`;
      image.alt = event.title;
      image.loading = "lazy";

      image.onerror = () => {
        image.style.display = "none";
      };

      const content = document.createElement("div");
      content.className = "event-info";

      const title = document.createElement("h3");
      title.textContent = event.title;

      content.appendChild(title);

      card.appendChild(image);
      card.appendChild(content);

      eventsContainer.appendChild(card);
    });
  }


  /*
  =====================================================
  ГАЛЕРЕЯ — 144 ФОТОГРАФИИ
  =====================================================
  */

  const galleryContainer =
    document.querySelector("#gallery-grid") ||
    document.querySelector(".gallery-grid");

  if (galleryContainer) {
    const galleryViewport = galleryContainer.closest(".gallery-viewport");
    const previousButton = galleryViewport?.querySelector(".gallery-nav--prev");
    const nextButton = galleryViewport?.querySelector(".gallery-nav--next");
    let scrollFrame = 0;

    galleryContainer.innerHTML = "";

    for (let number = 1; number <= 144; number++) {
      const fileNumber = String(number).padStart(3, "0");
      const image = document.createElement("img");
      image.src = `assets/gallery/photo-${fileNumber}.jpg`;
      image.alt = `Фото из галереи ${number}`;
      image.loading = "lazy";

      image.onerror = () => {
        image.remove();
        updateGalleryNav();
      };

      image.addEventListener("click", () => {
        openLightbox(image.src, image.alt);
      });

      galleryContainer.appendChild(image);
    }

    function getGalleryStep() {
      const firstImage = galleryContainer.querySelector("img");
      if (!firstImage) return 1;

      const styles = getComputedStyle(galleryContainer);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const itemWidth = firstImage.getBoundingClientRect().width + gap;
      return Math.max(1, Math.floor((galleryContainer.clientWidth + gap) / itemWidth));
    }

    function updateGalleryNav() {
      const maxScroll = galleryContainer.scrollWidth - galleryContainer.clientWidth;
      const atStart = galleryContainer.scrollLeft <= 1;
      const atEnd = galleryContainer.scrollLeft >= maxScroll - 1;
      const hasOverflow = maxScroll > 1;

      [[previousButton, atStart || !hasOverflow], [nextButton, atEnd || !hasOverflow]]
        .forEach(([button, hidden]) => {
          if (!button) return;
          button.classList.toggle("is-hidden", hidden);
          button.disabled = hidden;
          button.setAttribute("aria-hidden", String(hidden));
        });
    }

    function scrollGallery(direction) {
      const firstImage = galleryContainer.querySelector("img");
      if (!firstImage) return;

      const styles = getComputedStyle(galleryContainer);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const stride = firstImage.getBoundingClientRect().width + gap;
      const maxScroll = galleryContainer.scrollWidth - galleryContainer.clientWidth;
      const target = Math.max(0, Math.min(
        maxScroll,
        galleryContainer.scrollLeft + direction * getGalleryStep() * stride
      ));
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      galleryContainer.scrollTo({ left: target, behavior: reducedMotion ? "auto" : "smooth" });
    }

    previousButton?.addEventListener("click", () => scrollGallery(-1));
    nextButton?.addEventListener("click", () => scrollGallery(1));

    galleryContainer.addEventListener("scroll", () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        updateGalleryNav();
      });
    }, { passive: true });

    galleryContainer.addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      const maxScroll = galleryContainer.scrollWidth - galleryContainer.clientWidth;
      const canScroll = direction < 0
        ? galleryContainer.scrollLeft > 1
        : galleryContainer.scrollLeft < maxScroll - 1;
      if (!canScroll) return;
      event.preventDefault();
      scrollGallery(direction);
    });

    galleryContainer.addEventListener("wheel", event => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const direction = event.deltaY < 0 ? -1 : 1;
      const maxScroll = galleryContainer.scrollWidth - galleryContainer.clientWidth;
      const canScroll = direction < 0
        ? galleryContainer.scrollLeft > 1
        : galleryContainer.scrollLeft < maxScroll - 1;
      if (!canScroll) return;
      event.preventDefault();
      galleryContainer.scrollBy({ left: event.deltaY, behavior: "auto" });
    }, { passive: false });

    const resizeObserver = new ResizeObserver(updateGalleryNav);
    resizeObserver.observe(galleryContainer);
    galleryContainer.addEventListener("load", updateGalleryNav, true);
    window.addEventListener("resize", updateGalleryNav, { passive: true });
    updateGalleryNav();
  }


  /*
  =====================================================
  ДРУЗЬЯ
  =====================================================
  */

const friends = [
  "ducati.png",
  "E_Lavrmoto_Logo_1080.png",
  "f77bafb0da099212271dfb55685dd2980dfd07a6.png",
  "gc.jpg",
  "giginova.png",
  "hd.jpg",
  "husqvarna.png",
  "KCF.jpg",
  "ktm.jpg",
  "motovoz.jpg",
  "qarshyga.png",
  "sip.jpg"
];

const friendsContainer = document.querySelector("#friends-grid");

if (friendsContainer) {
  friendsContainer.innerHTML = "";

  friends.forEach((fileName) => {
    const card = document.createElement("div");
    card.className = "friend-card";

    const image = document.createElement("img");
    image.src = `./assets/friends/${encodeURIComponent(fileName)}`;
    image.alt = "Друг клуба";
    image.loading = "lazy";

    image.onerror = () => {
      console.error(`Не найден файл: ${fileName}`);
      card.remove();
    };

    card.appendChild(image);
    friendsContainer.appendChild(card);
  });
}


  /*
  =====================================================
  LIGHTBOX
  =====================================================
  */

  function openLightbox(src, alt) {
    let lightbox = document.querySelector(".lightbox");

    if (!lightbox) {
      lightbox = document.createElement("div");
      lightbox.className = "lightbox";

      lightbox.innerHTML = `
        <button class="lightbox-close" aria-label="Закрыть">×</button>
        <img src="" alt="">
      `;

      document.body.appendChild(lightbox);

      lightbox
        .querySelector(".lightbox-close")
        .addEventListener("click", () => {
          lightbox.classList.remove("is-visible");
        });

      lightbox.addEventListener("click", event => {
        if (event.target === lightbox) {
          lightbox.classList.remove("is-visible");
        }
      });
    }

    lightbox.querySelector("img").src = src;
    lightbox.querySelector("img").alt = alt;
    lightbox.classList.add("is-visible");
  }


    /*
  =====================================================
  МОБИЛЬНОЕ МЕНЮ
  =====================================================
  */

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");
      menuButton.classList.toggle("is-active", isOpen);
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Закрыть меню" : "Открыть меню"
      );
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navigation.classList.remove("is-open");
        menuButton.classList.remove("is-active");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Открыть меню");
      });
    });
  }

  /*
  =====================================================
  КНОПКА ENGLISH
  =====================================================
  */

  const englishBtn = document.getElementById("englishBtn");

  if (englishBtn) {
    englishBtn.addEventListener("click", (e) => {
      e.preventDefault();
      alert(
        "If you want to view the website in English, use your browser’s built‑in page translation feature (for example, in Chrome: right‑click → “Translate to English”)."
      );
    });
  }
});
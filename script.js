document.addEventListener("DOMContentLoaded", () => {
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
      image: "Канат Аубакиров.jpeg"
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
      name: "Ельдар Жанабаев",
      date: "7 июня",
      month: 6,
      day: 7,
      image: "Ельдар Жанабаев.jpeg"
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
      title: "Arbawine",
      image: "arbawine.jpg"
    },
    {
      title: "Club Day",
      image: "club day.jpeg"
    },
    {
      title: "Contest 2026",
      image: "contest2026.png"
    },
    {
      title: "DGR",
      image: "dgr.jpg"
    },
    {
      title: "Issyk Kul",
      image: "issyk-kul.jpg"
    },
    {
      title: "Katon",
      image: "katon.jpg"
    },
    {
      title: "Season",
      image: "season.jpg"
    },
    {
      title: "Sipopopendy",
      image: "sipопопendy.jpg.avif"
    },
    {
      title: "Sokol",
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
    galleryContainer.innerHTML = "";

    for (let number = 1; number <= 144; number++) {
      const fileNumber = String(number).padStart(3, "0");

      const image = document.createElement("img");
      image.src = `assets/gallery/photo-${fileNumber}.jpg`;
      image.alt = `Фото из галереи ${number}`;
      image.loading = "lazy";

      image.onerror = () => {
        image.remove();
      };

      image.addEventListener("click", () => {
        openLightbox(image.src, image.alt);
      });

      galleryContainer.appendChild(image);
    }
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

  const friendsContainer =
    document.querySelector("#friends-grid") ||
    document.querySelector(".friends-grid");

  if (friendsContainer) {
    friendsContainer.innerHTML = "";

    friends.forEach(fileName => {
      const image = document.createElement("img");

      image.src = `assets/friends/${encodeURIComponent(fileName)}`;
      image.alt = "Друг клуба";
      image.loading = "lazy";

      image.onerror = () => {
        image.remove();
      };

      friendsContainer.appendChild(image);
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
      navigation.classList.toggle("is-open");
      menuButton.classList.toggle("is-active");
      menuButton.setAttribute("aria-expanded", navigation.classList.contains("is-open"));
    });

    navigation.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        navigation.classList.remove("is-open");
        menuButton.classList.remove("is-active");
        menuButton.setAttribute("aria-expanded", "false");
      });
    });
  }

  /*
  =====================================================
  RU / EN
  =====================================================
  */
  const translations = {
    ru: {
      navAbout: "О клубе", navHistory: "История", navEvents: "События", navGallery: "Галерея", navContacts: "Контакты",
      menuOpen: "Открыть меню", heroTitle: "Свобода<br>в движении", heroDescription: "Официальное сообщество любителей итальянских скутеров Vespa<br>в Казахстане.",
      aboutClub: "О клубе", join: "Присоединиться", aboutLabel: "О клубе", aboutTitle: "Итальянский<br>характер.<br>Казахстанские<br>дороги.", becomeMember: "Стать частью клуба",
      historyLabel: "С апреля 2021 года", historyTitle: "История<br>клуба", historyLead: "От небольшой встречи двух энтузиастов<br>до большого сообщества Vespa в Казахстане.",
      eventsLabel: "Календарь клуба", eventsTitle: "События", eventsLead: "Встречи, поездки, конкурсы и мероприятия<br>для участников клуба и друзей Vespa.", weekly: "Каждую среду, 19:00", vespaWednesday: "Vespa<br>Среда", details: "Узнать детали",
      galleryLabel: "Наши поездки", galleryTitle: "Галерея", galleryLead: "Фотографии с поездок, встреч и международных мероприятий.",
      friendsLabel: "Сообщество", friendsTitle: "Наши<br>друзья", friendsLead: "Клуб развивается благодаря участникам,<br>партнёрам и друзьям мотосообщества.",
      reportTitle: "История<br>только начинается.", reportText: "Присоединяйтесь к нам и становитесь частью сообщества,<br>которое выбирает двигаться красиво.", rideTogether: "Поехали вместе",
      contactLabel: "Связаться с нами", contactTitle: "Готовы<br>к поездке?", contactText: "Напишите нам, чтобы узнать о ближайшей встрече<br>или присоединиться к Vespa Kazakhstan Club.", almaty: "Almaty, Kazakhstan"
    },
    en: {
      navAbout: "About", navHistory: "History", navEvents: "Events", navGallery: "Gallery", navContacts: "Contacts",
      menuOpen: "Open menu", heroTitle: "Freedom<br>in motion", heroDescription: "The official community of Italian Vespa scooter enthusiasts<br>in Kazakhstan.",
      aboutClub: "About the club", join: "Join us", aboutLabel: "About the club", aboutTitle: "Italian<br>character.<br>Kazakh<br>roads.", becomeMember: "Become a member",
      historyLabel: "Since April 2021", historyTitle: "Club<br>history", historyLead: "From a small meeting of two enthusiasts<br>to a large Vespa community in Kazakhstan.",
      eventsLabel: "Club calendar", eventsTitle: "Events", eventsLead: "Meetups, rides, contests and events<br>for club members and Vespa friends.", weekly: "Every Wednesday, 19:00", vespaWednesday: "Vespa<br>Wednesday", details: "Discover more",
      galleryLabel: "Our rides", galleryTitle: "Gallery", galleryLead: "Photos from rides, meetups and international events.",
      friendsLabel: "Community", friendsTitle: "Our<br>friends", friendsLead: "The club grows thanks to members,<br>partners and friends of the motor community.",
      reportTitle: "The story<br>has just begun.", reportText: "Join us and become part of a community<br>that chooses to move beautifully.", rideTogether: "Ride with us",
      contactLabel: "Get in touch", contactTitle: "Ready<br>to ride?", contactText: "Write to us to learn about the next meetup<br>or join Vespa Kazakhstan Club.", almaty: "Almaty, Kazakhstan"
    }
  };

  const languageButtons = document.querySelectorAll("[data-language]");
  const setLanguage = language => {
    const dictionary = translations[language] || translations.ru;
    document.documentElement.lang = language;
    document.querySelectorAll("[data-i18n]").forEach(element => {
      const value = dictionary[element.dataset.i18n];
      if (value) element.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(element => {
      const value = dictionary[element.dataset.i18nAriaLabel];
      if (value) element.setAttribute("aria-label", value);
    });
    languageButtons.forEach(button => {
      const active = button.dataset.language === language;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    try { localStorage.setItem("vespa-language", language); } catch (error) { /* storage may be unavailable */ }
  };

  languageButtons.forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  let savedLanguage = "ru";
  try { savedLanguage = localStorage.getItem("vespa-language") || "ru"; } catch (error) { /* storage may be unavailable */ }
  setLanguage(savedLanguage);
});
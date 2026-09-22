import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_LOCALE,
  INTL_LOCALES,
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  resolveLocale,
} from "../src/i18n/config";
import { createDisplay } from "../src/i18n/display";
import { localizedPageTitle } from "../src/i18n/metadata";
import { messageGroups, messages } from "../src/i18n/messages";
import { translate } from "../src/i18n/translate";
import * as fixtures from "../src/lib/data";
import { addDays, today } from "../src/lib/dates";

const placeholders = (value: string) =>
  [
    ...new Set([...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1])),
  ].sort();

test("first visits and invalid saved preferences use Georgian; supported preferences survive", () => {
  assert.equal(DEFAULT_LOCALE, "ka");
  assert.deepEqual([...SUPPORTED_LOCALES].sort(), ["en", "ka", "ru"]);
  assert.deepEqual(LOCALE_NAMES, {
    ka: "ქართული",
    en: "English",
    ru: "Русский",
  });
  for (const value of [
    undefined,
    null,
    "",
    "fr",
    "en-US",
    "KA",
    1,
    {},
    false,
  ]) {
    assert.equal(resolveLocale(value), "ka");
  }
  for (const locale of SUPPORTED_LOCALES) {
    assert.equal(resolveLocale(locale), locale);
  }
});

test("every translation namespace has complete, nonempty, matching dictionaries and placeholders", () => {
  const seen = new Set<string>();
  for (const group of messageGroups) {
    const expected = Object.keys(group.en).sort();
    assert.ok(expected.length > 0, "an empty namespace must not silently ship");
    for (const locale of SUPPORTED_LOCALES) {
      assert.deepEqual(Object.keys(group[locale]).sort(), expected);
      for (const key of expected) {
        assert.ok(group[locale][key].trim(), `${locale}:${key} is empty`);
        assert.deepEqual(
          placeholders(group[locale][key]),
          placeholders(group.en[key]),
          `${locale}:${key} changed interpolation fields`,
        );
      }
    }
    for (const key of expected) {
      assert.ok(!seen.has(key), `duplicate translation key: ${key}`);
      seen.add(key);
    }
  }
  for (const locale of SUPPORTED_LOCALES) {
    assert.deepEqual(Object.keys(messages[locale]).sort(), [...seen].sort());
  }
});

test("critical customer and barber journeys contain real translations in all three languages", () => {
  const keys = [
    "navigation.discover",
    "navigation.join",
    "home.title1",
    "discovery.filtersTitle",
    "booking.confirmDemo",
    "booking.confirmation.confirmed",
    "auth.titleLogin",
    "account.title.appointments",
    "account.cancelAppointment",
    "dashboard.nav.schedule",
    "workspace.addLook",
    "reviews.post",
    "portfolio.allWork",
    "errors.slotUnavailable",
    "validation.required",
  ];
  for (const key of keys) {
    assert.match(translate("ka", key), /[\u10A0-\u10FF]/u, key);
    assert.match(translate("ru", key), /[\u0400-\u04FF]/u, key);
    assert.match(translate("en", key), /[a-z]/i, key);
  }
  assert.equal(translate(DEFAULT_LOCALE, "navigation.discover"), "აღმოაჩინე");
  assert.equal(translate("en", "navigation.discover"), "Discover");
  assert.equal(translate("ru", "navigation.discover"), "Найти");
});

test("interpolation preserves canonical names and references while formatting displayed numbers", () => {
  for (const locale of SUPPORTED_LOCALES) {
    const welcome = translate(locale, "auth.welcomeNamed.customer", {
      name: "Giorgi Kapanadze",
    });
    assert.ok(welcome.includes("Giorgi Kapanadze"));
    assert.ok(!welcome.includes("{name}"));
    const reference = translate(locale, "booking.confirmation.reference", {
      reference: "EA459C45",
    });
    assert.ok(reference.includes("EA459C45"));
    assert.ok(!reference.includes("{reference}"));
    const count = translate(locale, "reviews.count", { count: 1234 });
    assert.ok(
      count.includes(new Intl.NumberFormat(INTL_LOCALES[locale]).format(1234)),
    );
    assert.ok(!count.includes("{count}"));
  }
});

test("plural selection uses singular wording when appropriate and valid base wording otherwise", () => {
  assert.equal(translate("en", "reviews.count", { count: 1 }), "1 review");
  assert.equal(translate("en", "reviews.count", { count: 2 }), "2 reviews");
  assert.equal(translate("en", "reviews.count", { count: 0 }), "0 reviews");
  assert.equal(translate("ru", "reviews.count", { count: 1 }), "1 отзыв");
  assert.equal(translate("ru", "reviews.count", { count: 21 }), "21 отзыв");
  assert.equal(translate("ru", "reviews.count", { count: 2 }), "Отзывов: 2");
  assert.equal(translate("ru", "reviews.count", { count: 5 }), "Отзывов: 5");
  assert.equal(translate("ka", "reviews.count", { count: 1 }), "1 შეფასება");
  assert.equal(translate("ka", "reviews.count", { count: 2 }), "2 შეფასება");
});

test("missing translations use English or an explicit fallback without crashing", () => {
  const key = "test.englishFallback";
  assert.equal(Object.hasOwn(messages.en, key), false);
  messages.en[key] = "Hello, {name}.";
  try {
    for (const locale of ["ka", "ru"] as const) {
      assert.equal(
        translate(locale, key, { name: "Alex" }, "Backup: {name}"),
        "Hello, Alex.",
      );
    }
  } finally {
    delete messages.en[key];
  }
  assert.equal(
    translate("ka", "test.unknown", { name: "Alex" }, "Hello, {name}."),
    "Hello, Alex.",
  );
  assert.equal(translate("ru", "test.unknown", {}, ""), "");
});

test("localized entity displays preserve canonical records, names, IDs, prices, relationships and reviews", () => {
  const canonical = {
    shops: fixtures.shops,
    barbers: fixtures.barbers,
    services: fixtures.services,
    styles: fixtures.styles,
    portfolio: fixtures.portfolio,
    customers: fixtures.customers,
    appointments: fixtures.appointments,
    availability: fixtures.availability,
    reviews: fixtures.reviews,
  };
  const before = structuredClone(canonical);
  for (const locale of SUPPORTED_LOCALES) {
    const display = createDisplay(locale);
    for (const shop of canonical.shops) {
      assert.ok(display.shopDescription(shop));
      assert.equal(display.label(shop.name), shop.name);
      display.label(shop.neighborhood);
    }
    for (const barber of canonical.barbers) {
      assert.ok(display.barberTitle(barber));
      assert.ok(display.barberBio(barber));
      assert.equal(display.label(barber.name), barber.name);
    }
    for (const service of canonical.services) {
      assert.ok(display.serviceName(service));
      assert.ok(display.serviceDescription(service));
      display.money(service.price);
    }
    for (const style of canonical.styles) {
      assert.ok(display.styleName(style));
      assert.ok(display.styleDescription(style));
    }
    for (const item of canonical.portfolio) {
      assert.ok(display.portfolioTitle(item));
      assert.ok(display.portfolioDescription(item));
    }
    for (const customer of canonical.customers) {
      assert.equal(display.label(customer.name), customer.name);
    }
    for (const appointment of canonical.appointments) {
      display.date(appointment.date);
      display.relativeDate(appointment.date);
      display.money(appointment.price);
      display.label(appointment.status);
    }
    for (const review of canonical.reviews) {
      assert.equal(display.label(review.text), review.text);
    }
    assert.deepEqual(canonical, before, `${locale} changed canonical data`);
  }
  assert.equal(
    createDisplay("ka").serviceName(fixtures.services[0]),
    "თმის შეჭრა",
  );
  assert.equal(
    createDisplay("ru").serviceName(fixtures.services[1]),
    "Скин-фейд",
  );
  assert.equal(
    createDisplay("en").serviceName(fixtures.services[0]),
    fixtures.services[0].name,
  );
});

test("custom and edited display text stays verbatim, including newly created entities", () => {
  for (const locale of SUPPORTED_LOCALES) {
    const display = createDisplay(locale);
    const service = {
      ...fixtures.services[0],
      name: "Hot towel finish",
      description: "My custom service description.",
    };
    assert.equal(display.serviceName(service), service.name);
    assert.equal(display.serviceDescription(service), service.description);
    const newService = {
      ...fixtures.services[0],
      id: "customer-created-service",
    };
    assert.equal(display.serviceName(newService), newService.name);
    assert.equal(
      display.serviceDescription(newService),
      newService.description,
    );
    const barber = {
      ...fixtures.barbers[0],
      role: "Independent artist",
      bio: "A personal biography, as written by its author.",
    };
    assert.equal(display.barberTitle(barber), barber.role);
    assert.equal(display.barberBio(barber), barber.bio);
    const shop = {
      ...fixtures.shops[0],
      description: "Our own shop description.",
    };
    assert.equal(display.shopDescription(shop), shop.description);
    const style = {
      ...fixtures.styles[0],
      name: "The Saturday Cut",
      description: "A deliberately named custom style.",
    };
    assert.equal(display.styleName(style), style.name);
    assert.equal(display.styleDescription(style), style.description);
    const item = {
      ...fixtures.portfolio[0],
      title: "A considered pompadour",
      description: "The author's original description.",
    };
    assert.equal(display.portfolioTitle(item), item.title);
    assert.equal(display.portfolioDescription(item), item.description);
    const newItem = {
      ...fixtures.portfolio[0],
      id: "customer-created-portfolio",
    };
    assert.equal(display.portfolioTitle(newItem), newItem.title);
    assert.equal(display.portfolioDescription(newItem), newItem.description);
  }
});

test("generic seeded portfolio categories localize while named works remain untouched", () => {
  const item = fixtures.portfolio.find((entry) =>
    fixtures.styles.some(
      (style) => style.id === entry.styleIds[0] && style.name === entry.title,
    ),
  )!;
  assert.ok(item, "fixture must exercise a generic portfolio category");
  const style = fixtures.styles.find((entry) => entry.id === item.styleIds[0])!;
  for (const locale of SUPPORTED_LOCALES) {
    const display = createDisplay(locale);
    assert.equal(display.portfolioTitle(item), display.styleName(style));
    if (locale !== "en")
      assert.notEqual(display.portfolioTitle(item), item.title);
    const namedWork = { ...item, title: "The Vera Collection" };
    assert.equal(display.portfolioTitle(namedWork), "The Vera Collection");
  }
});

test("dates and GEL formatting follow the selected language without changing internal date values", () => {
  const source = { date: "2026-09-16", price: 35.5, time: "14:30" };
  const before = structuredClone(source);
  const monthWords = { ka: /სექტემბ/, en: /September/, ru: /сентябр/ };
  for (const locale of SUPPORTED_LOCALES) {
    const display = createDisplay(locale);
    assert.equal(display.money(35), "₾35");
    assert.match(display.money(source.price), /^₾/u);
    assert.ok(!/[$€₽]/u.test(display.money(source.price)));
    assert.equal(
      display.money(source.price),
      `₾${display.number(source.price)}`,
    );
    const formatted = display.date(source.date, {
      month: "long",
      year: "numeric",
    });
    assert.match(formatted, monthWords[locale]);
    assert.match(formatted, /16/);
    assert.match(formatted, /2026/);
    assert.equal(
      display.relativeDate(today()),
      translate(locale, "common.today"),
    );
    assert.equal(
      display.relativeDate(addDays(1)),
      translate(locale, "common.tomorrow"),
    );
    assert.deepEqual(source, before);
  }
  assert.equal(createDisplay("en").number(35.5), "35.5");
  assert.equal(createDisplay("ru").number(35.5), "35,5");
});

test("known domain errors localize and unknown error details are replaced with a safe generic message", () => {
  for (const locale of SUPPORTED_LOCALES) {
    const display = createDisplay(locale);
    assert.equal(
      display.errorText(new Error("errors.slotUnavailable")),
      translate(locale, "errors.slotUnavailable"),
    );
    assert.equal(
      display.errorText("errors.barberShop"),
      translate(locale, "errors.barberShop"),
    );
    assert.equal(
      display.errorText(new Error("Unknown internal implementation detail")),
      translate(locale, "errors.unexpected"),
    );
  }
});

test("invalid route shapes and workspace sections keep the localized not-found title", () => {
  const invalidPaths = [
    "/account/appointments/extra",
    `/barbers/${fixtures.barbers[0].slug}/extra`,
    `/shops/${fixtures.shops[0].slug}/extra`,
    `/styles/${fixtures.styles[0].slug}/extra`,
    "/barber/booking",
    "/barber/appointments",
    "/account/schedule",
    "/account/dashboard",
    "/appointments",
    "/profile",
    "/barber",
    "/booking/extra",
    "/barbers/unknown-barber",
    "/shops/unknown-shop",
    "/styles/unknown-style",
  ];
  for (const locale of SUPPORTED_LOCALES) {
    const expected = `${translate(locale, "metadata.notFound")} | CHAIR.`;
    for (const path of invalidPaths) {
      assert.equal(
        localizedPageTitle(path, locale),
        expected,
        `${locale}:${path}`,
      );
    }
  }
});

test("valid page titles still localize and preserve canonical business and barber names", () => {
  for (const locale of SUPPORTED_LOCALES) {
    assert.equal(
      localizedPageTitle("/", locale),
      `CHAIR. — ${translate(locale, "metadata.home")}`,
    );
    for (const [path, key] of [
      ["/booking", "booking"],
      ["/account", "account"],
      ["/account/appointments", "appointments"],
      ["/barber/schedule", "schedule"],
      ["/barber/dashboard", "dashboard"],
    ]) {
      assert.equal(
        localizedPageTitle(path, locale),
        `${translate(locale, `metadata.${key}`)} | CHAIR.`,
      );
    }
    assert.equal(
      localizedPageTitle(`/barbers/${fixtures.barbers[0].slug}`, locale),
      `${fixtures.barbers[0].name} | CHAIR.`,
    );
    assert.equal(
      localizedPageTitle(`/shops/${fixtures.shops[0].slug}`, locale),
      `${fixtures.shops[0].name} | CHAIR.`,
    );
    const style = fixtures.styles[0];
    assert.equal(
      localizedPageTitle(`/styles/${style.slug}`, locale),
      `${translate(locale, "metadata.style", { style: createDisplay(locale).styleName(style) })} | CHAIR.`,
    );
  }
});

test("date formatting keeps native Intl behavior when the requested locale is supported", () => {
  const value = "2026-09-12";
  const date = new Date(`${value}T12:00:00Z`);
  const options: Intl.DateTimeFormatOptions[] = [
    { day: "numeric", month: "short" },
    { day: "numeric", month: "long", year: "numeric", weekday: "long" },
    { day: "2-digit", month: "2-digit", year: "2-digit" },
    { weekday: "short", day: undefined, month: undefined },
  ];
  for (const locale of SUPPORTED_LOCALES) {
    for (const settings of options) {
      const native = new Intl.DateTimeFormat(INTL_LOCALES[locale], {
        ...settings,
        timeZone: "Asia/Tbilisi",
      });
      if (native.resolvedOptions().locale.split("-")[0] !== locale) continue;
      assert.equal(
        createDisplay(locale).date(value, settings),
        native.format(date),
      );
    }
  }
});

test("browsers missing Georgian Intl data use Georgian calendar names for every date display", (context) => {
  const DateTimeFormat = Intl.DateTimeFormat;
  context.mock.method(
    Intl,
    "DateTimeFormat",
    function (
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ) {
      const requested = String(
        Array.isArray(locales) ? locales[0] : (locales ?? ""),
      );
      return new DateTimeFormat(
        requested?.startsWith("ka") ? "en-US" : locales,
        options,
      );
    },
  );
  assert.equal(
    new Intl.DateTimeFormat("ka-GE").resolvedOptions().locale,
    "en-US",
  );
  const original = { date: "2026-09-12", time: "14:30", price: 35 };
  const before = structuredClone(original);
  const display = createDisplay("ka");
  const cases: Array<[Intl.DateTimeFormatOptions | undefined, string]> = [
    [undefined, "12 სექ"],
    [{ year: "numeric" }, "12 სექ. 2026"],
    [{ weekday: "long", year: "numeric" }, "შაბათი, 12 სექ. 2026"],
    [{ month: "long", year: "numeric" }, "12 სექტემბერი, 2026"],
    [{ weekday: "short", day: undefined, month: undefined }, "შაბ"],
    [{ weekday: "narrow", day: undefined, month: undefined }, "შ"],
    [{ month: "short", day: undefined }, "სექ"],
    [{ month: "long", day: undefined }, "სექტემბერი"],
    [{ month: "narrow", day: undefined }, "ს"],
    [{ day: "numeric", month: undefined }, "12"],
    [{ day: undefined, month: "numeric" }, "9"],
    [{ day: undefined, month: "2-digit" }, "09"],
    [{ day: undefined, month: undefined, year: "numeric" }, "2026"],
    [{ day: undefined, month: undefined, year: "2-digit" }, "26"],
    [{ day: undefined, month: undefined }, "12.9.2026"],
    [{ day: "2-digit", month: "2-digit", year: "2-digit" }, "12.09.26"],
  ];
  for (const [options, expected] of cases) {
    const actual = display.date(original.date, options);
    assert.equal(actual, expected, JSON.stringify(options));
    assert.doesNotMatch(actual, /[A-Za-z]/u);
  }
  assert.equal(
    display.date("2026-01-02", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }),
    "02.01.26",
  );
  for (let month = 1; month <= 12; month++) {
    const date = `2026-${String(month).padStart(2, "0")}-12`;
    for (const width of ["long", "short", "narrow"] as const) {
      const actual = display.date(date, {
        month: width,
        weekday: width,
        year: "numeric",
      });
      assert.match(actual, /[\u10A0-\u10FF]/u);
      assert.doesNotMatch(actual, /[A-Za-z]/u);
    }
  }
  assert.equal(
    createDisplay("en").date(original.date, { year: "numeric" }),
    "12 Sept 2026",
  );
  assert.equal(
    createDisplay("ru").date(original.date, { year: "numeric" }),
    new DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Tbilisi",
    }).format(new Date(`${original.date}T12:00:00Z`)),
  );
  assert.deepEqual(original, before);
});

test("number presentation preserves supported native locales and numeric options", () => {
  const cases: Array<[number, Intl.NumberFormatOptions | undefined]> = [
    [1042, undefined],
    [10425.5, undefined],
    [5, { minimumFractionDigits: 1, maximumFractionDigits: 1 }],
    [-12345.678, { maximumFractionDigits: 2, signDisplay: "always" }],
    [0.1234, { style: "percent", maximumFractionDigits: 1 }],
    [1042, { useGrouping: true }],
    [10425.5, { useGrouping: false }],
    [42, { minimumIntegerDigits: 5 }],
  ];
  for (const locale of SUPPORTED_LOCALES) {
    for (const [value, options] of cases) {
      const native = new Intl.NumberFormat(INTL_LOCALES[locale], options);
      if (native.resolvedOptions().locale.split("-")[0] !== locale) continue;
      assert.equal(
        createDisplay(locale).number(value, options),
        native.format(value),
      );
    }
  }
});

test("unsupported Georgian number locales keep Georgian decimals and grouping in labels, prices, and interpolation", (context) => {
  const NumberFormat = Intl.NumberFormat;
  context.mock.method(
    Intl,
    "NumberFormat",
    function (
      locales?: Intl.LocalesArgument,
      options?: Intl.NumberFormatOptions,
    ) {
      const requested = String(
        Array.isArray(locales) ? locales[0] : (locales ?? ""),
      );
      return new NumberFormat(
        requested.startsWith("ka") ? "en-US" : locales,
        options,
      );
    },
  );
  assert.equal(
    new Intl.NumberFormat("ka-GE").resolvedOptions().locale,
    "en-US",
  );
  const display = createDisplay("ka");
  const cases: Array<[number, Intl.NumberFormatOptions | undefined, string]> = [
    [1042, undefined, "1042"],
    [10425.5, undefined, "10\u00a0425,5"],
    [1234567.89, undefined, "1\u00a0234\u00a0567,89"],
    [5, { minimumFractionDigits: 1, maximumFractionDigits: 1 }, "5,0"],
    [
      -12345.678,
      { maximumFractionDigits: 2, signDisplay: "always" },
      "-12\u00a0345,68",
    ],
    [42.5, { signDisplay: "always" }, "+42,5"],
    [0, { signDisplay: "exceptZero" }, "0"],
    [0.1234, { style: "percent", maximumFractionDigits: 1 }, "12,3%"],
    [1042, { useGrouping: true }, "1\u00a0042"],
    [1042, { useGrouping: "always" }, "1\u00a0042"],
    [1042, { useGrouping: "auto" }, "1042"],
    [1042, { useGrouping: "min2" }, "1042"],
    [10425.5, { useGrouping: false }, "10425,5"],
    [42, { minimumIntegerDigits: 5 }, "00\u00a0042"],
    [1234.5, { notation: "scientific", maximumFractionDigits: 1 }, "1,2E3"],
  ];
  for (const [value, options, expected] of cases)
    assert.equal(
      display.number(value, options),
      expected,
      `${value}: ${JSON.stringify(options)}`,
    );
  assert.equal(display.money(10425.5), "₾10\u00a0425,5");
  assert.equal(
    translate("ka", "reviews.count", { count: 10425 }),
    "10\u00a0425 შეფასება",
  );
  assert.equal(
    translate("ka", "reviews.outOfFive", { value: 4.9 }),
    "4,9 ვარსკვლავი 5-დან",
  );
  for (const locale of ["en", "ru"] as const) {
    assert.equal(
      createDisplay(locale).number(10425.5),
      new NumberFormat(INTL_LOCALES[locale]).format(10425.5),
    );
  }
});

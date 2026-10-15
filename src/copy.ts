// Every UI string in one place. Personal strings (names, notes) live in config.ts;
// trip content lives in data/trips.bg.json and photo captions in data/captions.bg.json.
import { PET_NAME, TAG_LINE } from "./config";
import type { Trip } from "./types";

export const copy = {
  documentTitle: `За ${PET_NAME} ♡`,

  sealed: {
    hint: "Отвори ме",
    boxLabel: `${TAG_LINE}. Натисни, за да отвориш подаръка`,
    skipLabel: "Пропусни анимацията",
  },

  reveal: {
    next: "Покажи ми ги",
  },

  choose: {
    title: "Избери си приключение",
    sub: "Разопаковай и четирите, а после избери любимото.",
    progress: (n: number, total: number) => `Отворени: ${n} от ${total}`,
    allOpen: "И четирите са отворени. Кое ти грабна сърцето?",
    unwrapLabel: (i: number, total: number, hint: string) => `Разопаковай подарък ${i} от ${total}: ${hint}`,
    chooseThis: "Избирам това",
  },

  card: {
    tapHint: "Виж цялото пътуване",
    label: (t: Trip) => `${t.name}, ${t.country}. ${t.length}. ${t.tagline}. Виж цялото пътуване`,
  },

  modal: {
    close: "Затвори описанието на пътуването",
    sea: "Море",
    why: "Защо ще се влюбиш",
    animals: "Животни",
    /** Palawan's food is all local cuisine, with no wine in it */
    food: (t: Trip) => (/вин/i.test(t.why.food) ? "Храна и вино" : "Местна кухня"),
    adventure: "Приключения",
    highlights: "Най-хубавото",
    dayByDay: "Ден по ден",
    gallery: "Галерия",
    goodToKnow: "Добре е да знаеш",
    keepExploring: "Разгледай и другите",
    chooseTrip: (name: string) => `Избирам ${name}`,
    enlarge: (alt: string) => `Увеличи снимката: ${alt}`,
  },

  journey: {
    heading: "Пътят ни",
    days: (range: string) => (range.includes("–") ? `Дни ${range}` : `Ден ${range}`),
    enlarge: (alt: string) => `Увеличи снимката: ${alt}`,
  },

  timeline: {
    day: (n: number) => `Ден ${n}`,
    animal: "Животинки",
    taste: "Хапки и глътки",
    enlargeDay: (n: number) => `Увеличи снимката към ден ${n}`,
  },

  lightbox: {
    label: "Преглед на снимките",
    prev: "Предишна снимка",
    next: "Следваща снимка",
    close: "Затвори снимката",
    credit: "Снимка",
    announce: (i: number, n: number, caption: string) => `Снимка ${i} от ${n}: ${caption}`,
  },

  confirm: {
    finalAnswer: "Последна дума?",
    yes: "Да, точно това!",
    no: "Чакай, ще погледна пак",
  },

  final: {
    /** "Лилинце, отиваме" + the trip's preposition ("на" / "в"); the trip name follows on the next line. */
    lead: (t: Trip) => `${PET_NAME}, отиваме${t.prep ? ` ${t.prep}` : ""}`,
    withLove: "с любов,",
    stampsLabel: "Най-хубавото, което ни чака",
    changeMind: "размислих",
  },


  sound: {
    label: "Звук",
    on: "Звукът е включен",
    off: "Звукът е изключен",
  },

  resetToast: "Отново опаковани ♡",
};

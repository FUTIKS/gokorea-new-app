// src/data/universities.ts
interface University {
  name: string;
  command: string;
  shahar: string;
  kontrakt: string;
  image: string;
  details: string;
}

export const universities: University[] = [
  {
    name: "Woosuk Universiteti",
    command: "CMD_UNI_WOOSUK",
    shahar: "Jeonju (Wanju County)",
    kontrakt: "$2,200 - $2,500 / semestr",
    image: "/images/woosuk.jpg",
    details: `
    Tashkil topgan: 1979 | Talabalar soni: ~12,000

    ✨ **Asosiy Yo'nalishlar:** Biznes va Menejment, Turizm va Mehmondo'stlik, Xalqaro Munosabatlar, IT va Kompyuter Fanlari, Muhandislik, Farmatsevtika.

    🏠 **Yotoqxona:** $380 - $620 / semestr

    ⭐ **Afzalliklari:**
    - Past narx va qulay yashash sharoiti
    - 3 yillik Turizm dasturi mavjud
    - Part-time ish imkoniyati

    **Qabul:** Standart hujjat (Intervyu yo'q)

    📌 **Universitet manzili:** 66 Daehak-ro, Wanju-gun, Jeollabuk-do, South Korea
  `
  },
  {
    name: "BUFS (Busan Xorijiy Tillar Universiteti)",
    command: "CMD_UNI_BUFS",
    shahar: "Busan",
    kontrakt: "$2,400 - $2,600 / semestr",
    image: "/images/bufs.jpg",
    details: `
    Tashkil topgan: 1981 | Talabalar soni: ~8,500

    ✨ **Asosiy Yo'nalishlar:** Xorijiy Tillar (20+ til), Xalqaro Munosabatlar, Tarjimonlik va Tarjima, Xalqaro Biznes, IT va Dasturlash, Turizm va Mehmondo'stlik.

    🏠 **Yotoqxona:** $800 - $1,200 / semestr

    ⭐ **Afzalliklari:**
    - **20+ til kurslari** mavjud
    - Dengiz bo'yida joylashgan go'zal shahar
    - **Intervyu asosida qabul** (imtihon yo'q)
    - 94 ta universitetlar bilan hamkorlik dasturlari

    **Qabul:** Intervyu asosida qabul (Imtihon yo'q)

    📌 **Universitet manzili:** 65 Geumsaem-ro 485beon-gil, Geumjeong-gu, Busan, South Korea
  `
  },
  {
    name: "Baekseok Universiteti",
    command: "CMD_UNI_BAEKSEOK",
    shahar: "Cheonan",
    kontrakt: "$2,500 - $2,700 / semestr",
    image: "/images/baekseok.jpg",
    details: `
    Tashkil topgan: 1994 | Talabalar soni: ~14,000

    ✨ **Asosiy Yo'nalishlar:** Biznes Administratsiya, Muhandislik (Mexanika, Elektr), Ijtimoiy Fanlar, Pedagogika, Musiqiy Ta'lim, Kompyuter Injiniring.

    🏠 **Yotoqxona:** $600 - $900 / semestr

    ⭐ **Afzalliklari:**
    - Seulga 1 soat masofada
    - Zamonaviy kampus va laboratoriyalar
    - Arzon yashash xarajatlari

    **Qabul:** Standart hujjat

    📌 **Universitet manzili:** 76 Munam-ro, Dongnam-gu, Cheonan-si, Chungcheongnam-do, South Korea
  `
  },
  {
    name: "Daeshin Universiteti",
    command: "CMD_UNI_DAESHIN",
    shahar: "Gyeongsan (Daegu yaqinida)",
    kontrakt: "$2,600 - $2,800 / semestr",
    image: "/images/daeshin.jpg",
    details: `
    Tashkil topgan: 1991 | Talabalar soni: ~3,500

    ✨ **Asosiy Yo'nalishlar:** Ijtimoiy Fanlar, Teologiya, Musiqiy Ta'lim, Bolalar Rivojlanishi, Sport va Jismoniy Tarbiya, Ofisiant va Mehmondo'stlik.

    🏠 **Yotoqxona:** $500 - $750 / semestr

    ⭐ **Afzalliklari:**
    - Tinch shahar, yashash arzon
    - Kichik kampus, individual e'tibor
    - **Intervyu asosida qabul**
    - Qulay yotoqxona narxlari

    **Qabul:** Intervyu asosida qabul

    📌 **Universitet manzili:** 39 Daeshin-ro, Gyeongsan-si, Gyeongsangbuk-do, South Korea
  `
  },
  {
    name: "Sungkyul Universiteti",
    command: "CMD_UNI_SUNGKYUL",
    shahar: "Anyang",
    kontrakt: "$2,600 - $2,800 / semestr",
    image: "/images/sungkyul.jpg",
    details: `
    Tashkil topgan: 1962 | Talabalar soni: ~7,000

    ✨ **Asosiy Yo'nalishlar:** Koreys Tili va Adabiyoti, Xalqaro Munosabatlar, Biznes va Iqtisod, Ijtimoiy Ish, Tarix va Madaniyat, Media va Kommunikatsiya.

    🏠 **Yotoqxona:** $700 - $1,000 / 1 semestr

    ⭐ **Afzalliklari:**
    - Kichik kampus, shaxsiy yondashuv
    - Arzon turar joylar atrofida
    - Yaxshi transport aloqasi

    **Qabul:** Standart hujjat

    📌 **Universitet manzili:** 53 Sungkyuldaehak-ro, Manan-gu, Anyang-si, Gyeonggi-do, South Korea
  `
  },
  {
    name: "Singyeongju Universiteti",
    command: "CMD_UNI_SINGYEONGJU",
    shahar: "Gyeongju",
    kontrakt: "$2,800 - $3,000 / semestr",
    image: "/images/singyeongju.jpg",
    details: `
    Tashkil topgan: 1994 | Talabalar soni: ~4,000

    ✨ **Asosiy Yo'nalishlar:** Tarix va Arxeologiya, Turizm va Madaniyat, Hotel Menejment, Koreys Madaniyati, Biznes Administratsiya, Sport Menejmenti.

    🏠 **Yotoqxona:** $600 - $850 / semestr

    ⭐ **Afzalliklari:**
    - Tarixiy shahar (**UNESCO merosi**)
    - Madaniyat va an'analarni o'rganish
    - Qulay yashash narxlari
    - Tinch va xavfsiz muhit
    - Turizm yo'nalishi kuchli

    **Qabul:** Standart hujjat

    📌 **Universitet manzili:** 188 Taejong-ro, Gyeongju-si, Gyeongsangbuk-do, South Korea
  `
  },
  {
    name: "Hansung Universiteti",
    command: "CMD_UNI_HANSUNG",
    shahar: "Seoul",
    kontrakt: "$3,200 - $3,400 / semestr",
    image: "/images/hansung.jpg",
    details: `
    Tashkil topgan: 1972 | Talabalar soni: ~6,500

    ✨ **Asosiy Yo'nalishlar:** Dizayn va San'at, IT va Dasturlash, Fashion Dizayn, Biznes va Marketing, Muhandislik, Media va Jurnalistika.

    🏠 **Yotoqxona:** $900 - $1.200 / 1 semestr

    ⭐ **Afzalliklari:**
    - **Seul markazida** joylashgan
    - Dizayn va IT yo'nalishlari kuchli
    - **Intervyu asosida qabul**
    - Zamonaviy kampus va laboratoriyalar

    **Qabul:** Intervyu asosida qabul

    📌 **Universitet manzili:** 116 Samseongyoro-16-gil, Seongbuk-gu, Seoul, South Korea
  `
  },
];
import type { MenuEdit, BranchItemEdit } from "./menuStore";

export const DEPLOYED_EDITS: Record<string, MenuEdit> = {
  "food::SƏHƏR YEMƏYİ::Tavada yumurta": {
    "price": "8",
    "name_az": "Tavada yumurta",
    "name_ru": "Яичница",
    "name_en": "Fried eggs",
    "name_tr": "Tavada yumurta",
    "is_new": true,
    "is_meat": true,
    "is_fish": true,
    "is_vegetarian": true,
    "is_halal": true,
    "is_active": true,
    "image_url": "/assets/menu-item-seed.jpg",
    "is_snack": true
  },
  "food::SƏHƏR YEMƏYİ::Pomidor-yumurta": {
    "price": "10",
    "name_az": "Pomidor-yumurta",
    "name_ru": "Яичница с помидорами",
    "name_en": "Eggs with tomato",
    "name_tr": "Pomidor-yumurta",
    "is_new": false,
    "is_meat": false,
    "is_fish": false,
    "is_vegetarian": false,
    "is_halal": false,
    "is_snack": true,
    "is_active": true
  },
  "food::SƏHƏR YEMƏYİ::Kükü": {
    "price": "10 AZN",
    "desc_az": "Yumurta, göyərti, kərə yağı, qatıq",
    "desc_ru": "Яйцо, зелень, сливочное масло, йогурт",
    "desc_en": "Egg, herbs, butter, yogurt"
  },
  "food::SƏHƏR YEMƏYİ::Pankelər, karamelizə banan, duzlu karamel dondurma": {
    "price": "10 AZN"
  },
  "food::SƏHƏR YEMƏYİ::İspanaqlı brunch omleti": {
    "price": "10 AZN",
    "desc_az": "Pendir, baguette, konfi pomidor",
    "desc_ru": "Сыр, багет, конфи из помидоров",
    "desc_en": "Cheese, baguette, confit tomato"
  },
  "food::SƏHƏR YEMƏYİ::Yoğurt bowl": {
    "price": "15 AZN",
    "desc_az": "Xama, sadə yoğurt, banan, granola, çiyələk",
    "desc_ru": "Сметана, йогурт, банан, гранола, клубника",
    "desc_en": "Sour cream, yogurt, banana, granola, strawberry"
  },
  "food::SƏHƏR YEMƏYİ::Ənənəvi şəhər yeməyi seti": {
    "price": "18 AZN",
    "desc_az": "Mürəbbə, pendir dipi, zeytun, lavaş, yerli pendirlər",
    "desc_ru": "Варенье, сырный дип, оливки, лаваш, местные сыры",
    "desc_en": "Jam, cheese dip, olives, lavash, local cheeses"
  },
  "food::SƏHƏR YEMƏYİ::İngilis şəhər yeməyi": {
    "price": "18 AZN",
    "desc_az": "Göbələk, yumurta, kərə yağı, sosis",
    "desc_ru": "Грибы, яйцо, сливочное масло, сосиски",
    "desc_en": "Mushrooms, egg, butter, sausages"
  },
  "food::SƏHƏR YEMƏYİ::Kəsmikli pankeklər": {
    "price": "14 AZN",
    "desc_az": "Pankek, kəsmik, giləmeyvə",
    "desc_ru": "Панкейки, творог, ягоды",
    "desc_en": "Pancakes, curd, berries"
  },
  "food::SƏHƏR YEMƏYİ::Giləmeyvə mürəbbəsi ilə fransız tostu": {
    "price": "14 AZN",
    "desc_az": "Tost çörəyi, yumurta, süd, giləmeyvə mürəbbəsi",
    "desc_ru": "Тостовый хлеб, яйцо, молоко, ягодное варенье",
    "desc_en": "Toast bread, egg, milk, berry jam"
  },
  "food::SƏHƏR YEMƏYİ::Marinad edilmiş qızılbalıq Benedikt": {
    "price": "27 AZN",
    "desc_az": "Marinad edilmiş qızılbalıq, poached egg, hollandaise sous",
    "desc_ru": "Маринованный лосось, яйцо пашот, соус голландез",
    "desc_en": "Marinated salmon, poached egg, hollandaise sauce"
  },
  "food::SƏHƏR YEMƏYİ::Xurcun şəhər ləzzətləri": {
    "price": "18 AZN",
    "desc_az": "Su samlı simit, kartof samosası, spring roll, qril sucuk",
    "desc_ru": "Бублик с кунжутом, картофельные самосы, спринг-ролл, гриль-суджук",
    "desc_en": "Sesame bagel, potato samosas, spring roll, grilled sucuk"
  },
  "food::ŞORBALAR::Dovğa": {
    "price": "7 AZN",
    "desc_az": "Sadə qatıq, quru nanə, təzə nanə, zəfəran, zeytun yağı",
    "desc_ru": "Йогурт, сухая мята, свежая мята, шафран, оливковое масло",
    "desc_en": "Yogurt, dried mint, fresh mint, saffron, olive oil"
  },
  "food::ŞORBALAR::Qaymaqlı pomidor şorbası": {
    "price": "8 AZN",
    "desc_az": "Pomidor, soğan, kəklikotu, qaymaq",
    "desc_ru": "Помидоры, лук, чабрец, сливки",
    "desc_en": "Tomato, onion, thyme, cream"
  },
  "food::ŞORBALAR::Bakü əriştə şorbası": {
    "price": "10 AZN",
    "desc_az": "Xəmir, quzu əti, lobya, quzu bulyonu",
    "desc_ru": "Тесто, баранина, фасоль, бараний бульон",
    "desc_en": "Dough, lamb, beans, lamb broth"
  },
  "food::ŞORBALAR::Düşbərə şorbası": {
    "price": "10 AZN",
    "desc_az": "Xırda düşbərə, quzu əti, bulyon, sirkə",
    "desc_ru": "Мелкие дюшбары, баранина, бульон, уксус",
    "desc_en": "Small dumplings, lamb, broth, vinegar"
  },
  "food::SALATLAR::Tərəvəzli yay salatı": {
    "price": "10 AZN",
    "desc_az": "Balqabaq, pomidor, xiyar, avokado, qırmızı soğan, zeytun, turp",
    "desc_ru": "Тыква, помидоры, огурцы, авокадо, красный лук, оливки, редис",
    "desc_en": "Pumpkin, tomato, cucumber, avocado, red onion, olives, radish"
  },
  "food::SALATLAR::Rukkola və balqabaq salatı": {
    "price": "15 AZN",
    "desc_az": "Rukkola, konfi balqabaq, mövsümi tərəvəzlər",
    "desc_ru": "Руккола, конфи из тыквы, сезонные овощи",
    "desc_en": "Arugula, confit pumpkin, seasonal vegetables"
  },
  "food::SALATLAR::\"Healthy\" salat": {
    "price": "15 AZN",
    "desc_az": "Avokado, əzilmiş qırmızı kələm, alma, qarışıq kahı, blue cheese, çuğundur marmeladı",
    "desc_ru": "Авокадо, красная капуста, яблоко, салат, сыр с плесенью, мармелад из свеклы",
    "desc_en": "Avocado, red cabbage, apple, mixed lettuce, blue cheese, beetroot marmalade"
  },
  "food::SALATLAR::Qril toyuq Sezar salatı": {
    "price": "21 AZN",
    "desc_az": "Avokado, yavaş bişmiş toyuq, kahı, ev üsulu mayon sousu",
    "desc_ru": "Авокадо, курица гриль, салат, домашний майонез",
    "desc_en": "Avocado, slow-cooked chicken, lettuce, house mayonnaise"
  },
  "food::SALATLAR::Burrata və hisə verilmiş çuğundur": {
    "price": "20 AZN",
    "desc_az": "Burrata, hisə verilmiş çuğundur, nar, sarımsaqlı yoğurt sousu",
    "desc_ru": "Буррата, копченая свекла, гранат, йогуртовый соус с чесноком",
    "desc_en": "Burrata, smoked beetroot, pomegranate, garlic yogurt sauce"
  },
  "food::SALATLAR::Yay ləzzətli krevet salatı": {
    "price": "24 AZN",
    "desc_az": "Rukkola, avokado, brokoli, keşniş, portağal, zirə pomidoru, sərt pendir, qaragilə",
    "desc_ru": "Руккола, авокадо, брокколи, кинза, апельсин, помидоры, твердый сыр, черника",
    "desc_en": "Arugula, avocado, broccoli, coriander, orange, tomatoes, hard cheese, blueberry"
  },
  "food::BAŞLANĞICLAR::Yerli pendir çeşidləri": {
    "price": "8 AZN",
    "desc_az": "Yerli pendir çeşidləri, göyərti, zeytun yağı",
    "desc_ru": "Местные сыры, зелень, оливковое масло",
    "desc_en": "Local cheeses, herbs, olive oil"
  },
  "food::BAŞLANĞICLAR::Xarici pendir çeşidləri": {
    "price": "15 AZN",
    "desc_az": "Xarici pendir çeşidləri, göyərti, zeytun yağı",
    "desc_ru": "Импортные сыры, зелень, оливковое масло",
    "desc_en": "Imported cheeses, herbs, olive oil"
  },
  "food::BAŞLANĞICLAR::Turşu çeşidləri": {
    "price": "11 AZN",
    "desc_az": "Mövsümi turşu tərəvəzləri",
    "desc_ru": "Сезонные соленые овощи",
    "desc_en": "Seasonal pickled vegetables"
  },
  "food::BAŞLANĞICLAR::Quzu ətindən qutab (3 ədəd)": {
    "price": "10 AZN",
    "desc_az": "Quzu əti ilə hazırlanmış Corat qutabı",
    "desc_ru": "Кутаб с бараниной по-чоратски",
    "desc_en": "Corat-style qutab with lamb"
  },
  "food::BAŞLANĞICLAR::Mini quzu qutabı (10 ədəd)": {
    "price": "11 AZN",
    "desc_az": "Quzu əti ilə mini qutablar",
    "desc_ru": "Мини кутаб с бараниной",
    "desc_en": "Mini qutab with lamb"
  },
  "food::BAŞLANĞICLAR::Teriyaki balıq topları": {
    "price": "22 AZN"
  },
  "food::BAŞLANĞICLAR::Portağal veluté-də tempura krevetləri": {
    "price": "22 AZN"
  },
  "food::BAŞLANĞICLAR::Qızardılmış dəniz məhsulları": {
    "price": "22 AZN",
    "desc_az": "Xırtıldayan kalmar, krevetlər, limon-mayo sousu",
    "desc_ru": "Хрустящий кальмар, креветки, лимонный майонез",
    "desc_en": "Crispy calamari, prawns, lemon-mayo sauce"
  },
  "food::BAŞLANĞICLAR::Laym ilə marinadlanmış toyuq filesi": {
    "price": "14 AZN",
    "desc_az": "Mövsümi tərəvəzlər, laym-balı sous, portağal",
    "desc_ru": "Сезонные овощи, лаймовый медовый соус, апельсин",
    "desc_en": "Seasonal vegetables, lime-honey sauce, orange"
  },
  "food::BAŞLANĞICLAR::Yerli məzə boşqabı": {
    "price": "16 AZN",
    "desc_az": "Yer məzələrindən seçmə boşqab",
    "desc_ru": "Ассорти местных мезе",
    "desc_en": "Selection of local mezes"
  },
  "food::BAŞLANĞICLAR::Toyuqlu tərəvəz bükməsi": {
    "price": "18 AZN",
    "desc_az": "Toyuq, tərəvəz, spring roll xəmiri",
    "desc_ru": "Курица, овощи, рисовая бумага",
    "desc_en": "Chicken, vegetables, spring roll wrapper"
  },
  "food::ƏSAS YEMƏKLƏR::Üzüm yarpağından dolma": {
    "price": "16 AZN",
    "desc_az": "Üzüm yarpağı, düyü, göyərti, ət, qatıq sousu",
    "desc_ru": "Виноградные листья, рис, зелень, мясо, йогуртовый соус",
    "desc_en": "Grape leaves, rice, herbs, meat, yogurt sauce"
  },
  "food::ƏSAS YEMƏKLƏR::Toyuq rulet levengisi": {
    "price": "20 AZN",
    "desc_az": "Toyuq ruleti, qoz, şallot, sous",
    "desc_ru": "Куриный рулет, грецкий орех, лук-шалот, соус",
    "desc_en": "Chicken roll, walnut, shallot, sauce"
  },
  "food::ƏSAS YEMƏKLƏR::Mal əti burger": {
    "price": "20 AZN",
    "desc_az": "Mal əti, pendir, kartof fri",
    "desc_ru": "Говядина, сыр, картофель фри",
    "desc_en": "Beef, cheese, french fries"
  },
  "food::ƏSAS YEMƏKLƏR::Mal əti fisincan": {
    "price": "21 AZN",
    "desc_az": "Mal əti, qoz, soğan, yerli ədviyyatlar",
    "desc_ru": "Говядина, грецкий орех, лук, местные специи",
    "desc_en": "Beef, walnut, onion, local spices"
  },
  "food::ƏSAS YEMƏKLƏR::Quzu qolundan buğlama": {
    "price": "25 AZN",
    "desc_az": "Bişmiş quzu budu, sous, kartof əzməsi",
    "desc_ru": "Тушеная баранья нога, соус, картофельное пюре",
    "desc_en": "Braised lamb shank, sauce, mashed potato"
  },
  "food::ƏSAS YEMƏKLƏR::Xüsusi quzu döyməsi": {
    "price": "22 AZN",
    "desc_az": "Quzu əti, soğan, pomidor, yerli ədviyyatlar",
    "desc_ru": "Баранина, лук, помидоры, местные специи",
    "desc_en": "Lamb, onion, tomato, local spices"
  },
  "food::ƏSAS YEMƏKLƏR::Kajun ədviyyatlı böyük krevetlər": {
    "price": "28 AZN",
    "desc_az": "Kajun ədviyyatı ilə hazırlanmış krevetlər",
    "desc_ru": "Креветки с кайенской приправой",
    "desc_en": "Prawns with cajun seasoning"
  },
  "food::ƏSAS YEMƏKLƏR::Qızıl balıq meunière": {
    "price": "38 AZN",
    "desc_az": "Qızıl balıq, kərə yağı, limon, göyərti",
    "desc_ru": "Лосось, сливочное масло, лимон, зелень",
    "desc_en": "Salmon, butter, lemon, herbs"
  },
  "food::ƏSAS YEMƏKLƏR::Qril sudak balığı": {
    "price": "21 AZN",
    "desc_az": "Quru zoğal, kərə yağı, soğan, sarıkök",
    "desc_ru": "Сухой барбарис, сливочное масло, лук, куркума",
    "desc_en": "Dried barberry, butter, onion, turmeric"
  },
  "food::ƏSAS YEMƏKLƏR::Qızıl balıq cravlaksı": {
    "price": "24 AZN",
    "desc_az": "Marinad edilmiş qızıl balıq, göyərti, sous",
    "desc_ru": "Маринованный лосось, зелень, соус",
    "desc_en": "Marinated salmon, herbs, sauce"
  },
  "food::ƏSAS YEMƏKLƏR::Quzu ətindən basdırma": {
    "price": "21 AZN",
    "desc_az": "Quzu əti, quzu jus sousu, kərəviz püresi, buxarda tərəvəzlər",
    "desc_ru": "Баранина, соус из баранины, пюре из сельдерея, овощи на пару",
    "desc_en": "Lamb, lamb jus sauce, celery puree, steamed vegetables"
  },
  "food::ƏSAS YEMƏKLƏR::File minyon, trüf sousu ilə": {
    "price": "50 AZN",
    "desc_az": "File minyon, trüf madeyra sousu",
    "desc_ru": "Филе миньон, трюфельный мадейра соус",
    "desc_en": "Filet mignon, truffle madeira sauce"
  },
  "food::ƏSAS YEMƏKLƏR::Ribay steyk 350 qr": {
    "price": "80 AZN",
    "desc_az": "350 qr ribay steyk, sous və qarnir ilə",
    "desc_ru": "Рибай стейк 350 г, соус и гарнир",
    "desc_en": "Ribeye steak 350g, sauce and garnish"
  },
  "food::ƏSAS YEMƏKLƏR::Laym və qril olunmuş can əti salatı": {
    "price": "22 AZN",
    "desc_az": "Marinadlı xiyar, pomidor, kahı, susam, cəfəri, kök",
    "desc_ru": "Маринованные огурцы, помидоры, салат, кунжут, петрушка, морковь",
    "desc_en": "Marinated cucumber, tomato, lettuce, sesame, parsley, carrot"
  },
  "food::QARNAİRLƏR::Sarımsaq ilə kartof": {
    "price": "6 AZN"
  },
  "food::QARNAİRLƏR::Kartof fri": {
    "price": "6 AZN"
  },
  "food::QARNAİRLƏR::Buxarda bişmiş mövsümi tərəvəzlər": {
    "price": "7 AZN"
  },
  "food::QARNAİRLƏR::Buxarda zəfəranlı düyü": {
    "price": "6 AZN"
  },
  "food::QARNAİRLƏR::Yunan üslubunda zeytinli kartof": {
    "price": "9 AZN"
  },
  "food::QARNAİRLƏR::Qril toyuq filesi": {
    "price": "10 AZN"
  },
  "food::QARNAİRLƏR::Tempura krevetlər (5 ədəd)": {
    "price": "15 AZN"
  },
  "food::PASTA & RİZOTTO::Pomidorlu spagetti": {
    "price": "16 AZN",
    "desc_az": "Pomidor sousu, sarımsaq, reyhan, parmesan",
    "desc_ru": "Томатный соус, чеснок, базилик, пармезан",
    "desc_en": "Tomato sauce, garlic, basil, parmesan"
  },
  "food::PASTA & RİZOTTO::Can əti penne": {
    "price": "18 AZN",
    "desc_az": "Can əti, qaymaq, sarımsaq, parmesan, quru pomidor, cəfəri, kərəviz",
    "desc_ru": "Мясо, сливки, чеснок, пармезан, вяленые помидоры, петрушка, сельдерей",
    "desc_en": "Meat, cream, garlic, parmesan, sun-dried tomato, parsley, celery"
  },
  "food::PASTA & RİZOTTO::Sarımsaqlı kərə yağında toyuq Alfredo": {
    "price": "18 AZN",
    "desc_az": "Toyuq, qaymaq, sarımsaq, parmesan, göbələk",
    "desc_ru": "Курица, сливки, чеснок, пармезан, грибы",
    "desc_en": "Chicken, cream, garlic, parmesan, mushroom"
  },
  "food::PASTA & RİZOTTO::Krevetli risotto": {
    "price": "28 AZN",
    "desc_az": "Krevet, risotto düyüsü, parmesan, zəfəran yağı",
    "desc_ru": "Креветки, рис для ризотто, пармезан, шафрановое масло",
    "desc_en": "Prawn, risotto rice, parmesan, saffron oil"
  },
  "food::PASTA & RİZOTTO::Qızıl balıq və ispanıqlı tagliatelle": {
    "price": "28 AZN",
    "desc_az": "Qızıl balıq, sarımsaq, ispanaq, limon qabığı və suyu, qaymaq",
    "desc_ru": "Лосось, чеснок, шпинат, цедра и сок лимона, сливки",
    "desc_en": "Salmon, garlic, spinach, lemon zest and juice, cream"
  },
  "food::ŞİRNİYYATLAR::Gündəlik təzə şirniyyatlar": {
    "desc_az": "Personalımızdan müxtəlif təzə desertlər haqqında soruşa bilərsiniz",
    "desc_ru": "Уточняйте у персонала о свежих десертах дня",
    "desc_en": "Please ask our staff about today's fresh desserts"
  },
  "beverage::İMZA KOKTEYLLƏR::Chica & Jimador": {
    "price": "13 AZN"
  },
  "beverage::İMZA KOKTEYLLƏR::City Fizz": {
    "price": "13 AZN"
  },
  "beverage::İMZA KOKTEYLLƏR::Pie Tai": {
    "price": "13 AZN"
  },
  "beverage::İMZA KOKTEYLLƏR::Woody": {
    "price": "13 AZN"
  },
  "beverage::İMZA KOKTEYLLƏR::Bitter Crunch": {
    "price": "15 AZN"
  },
  "beverage::İMZA KOKTEYLLƏR::Dr. Fashion": {
    "price": "15 AZN"
  },
  "beverage::İMZA KOKTEYLLƏR::Jackie-Pookie": {
    "price": "15 AZN"
  },
  "beverage::İMZA KOKTEYLLƏR::Lily Spritz": {
    "price": "15 AZN"
  },
  "beverage::İMZA KOKTEYLLƏR::Spoted Mai Tai": {
    "price": "15 AZN"
  },
  "beverage::KLASSIK KOKTEYLLƏR::Mango espresso martini": {
    "price": "13 AZN"
  },
  "beverage::KLASSIK KOKTEYLLƏR::Pornstar martini": {
    "price": "13 AZN"
  },
  "beverage::KLASSIK KOKTEYLLƏR::Aperol Spritz": {
    "price": "15 AZN"
  },
  "beverage::KLASSIK KOKTEYLLƏR::Negroni": {
    "price": "15 AZN"
  },
  "beverage::KLASSIK KOKTEYLLƏR::Long Island iced tea": {
    "price": "18 AZN"
  },
  "beverage::İMZA MOKTEYLLƏR::Cucu Hugo Collins": {
    "price": "11 AZN"
  },
  "beverage::İMZA MOKTEYLLƏR::Donna Sour": {
    "price": "11 AZN"
  },
  "beverage::İMZA MOKTEYLLƏR::Tahiti Tonic": {
    "price": "11 AZN"
  },
  "beverage::İMZA MOKTEYLLƏR::Virgin Pornstar": {
    "price": "11 AZN"
  },
  "beverage::PİVƏ::Asahi Beer Super Dry 330ml": {
    "price": "11 AZN"
  },
  "beverage::PİVƏ::Paulaner 0.0% 500ml": {
    "price": "13 AZN"
  },
  "beverage::PİVƏ::Heineken Original 330ml": {
    "price": "14 AZN"
  },
  "beverage::PİVƏ::Paulaner Naturtrub 500ml": {
    "price": "14 AZN"
  },
  "beverage::ŞAMPAN::Bottega Brut (125ml)": {
    "price": "15 AZN"
  },
  "beverage::ŞAMPAN::Bottega Brut": {
    "price": "60 AZN"
  },
  "beverage::ŞAMPAN::FA Valley, Petnat, Xaçmaz": {
    "price": "80 AZN"
  },
  "beverage::ŞAMPAN::Doudet Naudin": {
    "price": "210 AZN"
  },
  "beverage::ŞAMPAN::Mumm Cordon": {
    "price": "250 AZN"
  },
  "beverage::ŞAMPAN::Moet & Chandon": {
    "price": "375 AZN"
  },
  "beverage::ŞAMPAN::Moet & Chandon Rose": {
    "price": "445 AZN"
  },
  "beverage::AĞ VƏ ROZE ŞƏRAB::FA Valley, Amore, Rose (125ml)": {
    "price": "15 AZN"
  },
  "beverage::AĞ VƏ ROZE ŞƏRAB::Meysari Sedef (125ml)": {
    "price": "15 AZN"
  },
  "beverage::AĞ VƏ ROZE ŞƏRAB::Meysari Sedef": {
    "price": "60 AZN"
  },
  "beverage::AĞ VƏ ROZE ŞƏRAB::Whalebone Sauvignon Blanc": {
    "price": "110 AZN"
  },
  "beverage::AĞ VƏ ROZE ŞƏRAB::Marrone Moscato DOCG": {
    "price": "250 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::FA Valley, Amore, Xaçmaz, Rose": {
    "price": "60 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::Meysari Billuri": {
    "price": "60 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::Meysari Marjan": {
    "price": "60 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::Meysari Innabi": {
    "price": "60 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::Meysari Makhmari (125ml)": {
    "price": "15 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::Meysari Makhmari": {
    "price": "70 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::Marrone, Barbaresco DOCG": {
    "price": "125 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::FA Valley, Fratello 2020, Red Dry": {
    "price": "170 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::FA Valley, Nessun Dorma 2022, Red Dry": {
    "price": "170 AZN"
  },
  "beverage::QIRMIZI ŞƏRAB::Brunello di Montalcino": {
    "price": "420 AZN"
  },
  "beverage::VİSKİ (40ml)::Jack Daniel's No 7": {
    "price": "12 AZN"
  },
  "beverage::VİSKİ (40ml)::Jack Daniel's Apple": {
    "price": "13 AZN"
  },
  "beverage::VİSKİ (40ml)::Jack Daniel's Honey": {
    "price": "13 AZN"
  },
  "beverage::VİSKİ (40ml)::Bulleit Bourbon": {
    "price": "14 AZN"
  },
  "beverage::VİSKİ (40ml)::Jameson": {
    "price": "14 AZN"
  },
  "beverage::VİSKİ (40ml)::Wild Turkey 81": {
    "price": "14 AZN"
  },
  "beverage::VİSKİ (40ml)::JW Black Label": {
    "price": "14 AZN"
  },
  "beverage::VİSKİ (40ml)::Jack Daniel's Single Barrel": {
    "price": "16 AZN"
  },
  "beverage::VİSKİ (40ml)::Singleton of Dufftown": {
    "price": "16 AZN"
  },
  "beverage::VİSKİ (40ml)::Glenfiddich 12 YO": {
    "price": "18 AZN"
  },
  "beverage::VİSKİ (40ml)::JW Gold Label Reserve": {
    "price": "18 AZN"
  },
  "beverage::VİSKİ (40ml)::Monkey Shoulder": {
    "price": "18 AZN"
  },
  "beverage::VİSKİ (40ml)::Glenfiddich 15 YO": {
    "price": "22 AZN"
  },
  "beverage::VİSKİ (40ml)::Chivas Regal 18 YO": {
    "price": "25 AZN"
  },
  "beverage::VİSKİ (40ml)::Macallan Double Cask 15 YO": {
    "price": "60 AZN"
  },
  "beverage::VİSKİ (40ml)::JW Blue Label": {
    "price": "66 AZN"
  },
  "beverage::ROM (40ml)::Bacardi Carta Blanca": {
    "price": "8 AZN"
  },
  "beverage::ROM (40ml)::Bacardi Carta Negra": {
    "price": "8 AZN"
  },
  "beverage::ROM (40ml)::Captain Morgan Dark": {
    "price": "12 AZN"
  },
  "beverage::ROM (40ml)::Captain Morgan Spiced Gold": {
    "price": "12 AZN"
  },
  "beverage::ROM (40ml)::Captain Morgan White": {
    "price": "12 AZN"
  },
  "beverage::VODKA (40ml)::Finlandia": {
    "price": "10 AZN"
  },
  "beverage::VODKA (40ml)::Graddau 54": {
    "price": "10 AZN"
  },
  "beverage::VODKA (40ml)::Ciroc": {
    "price": "15 AZN"
  },
  "beverage::VODKA (40ml)::Grey Goose": {
    "price": "17 AZN"
  },
  "beverage::VODKA (40ml)::Beluga Noble": {
    "price": "18 AZN"
  },
  "beverage::VODKA (40ml)::Belvedere": {
    "price": "19 AZN"
  },
  "beverage::CİN (40ml)::Tanqueray London Dry": {
    "price": "13 AZN"
  },
  "beverage::CİN (40ml)::Tanqueray No Ten": {
    "price": "13 AZN"
  },
  "beverage::CİN (40ml)::Gin Mare": {
    "price": "17 AZN"
  },
  "beverage::CİN (40ml)::Hendrick's": {
    "price": "18 AZN"
  },
  "beverage::TEKİLA (40ml)::Patron Reposado": {
    "price": "21 AZN"
  },
  "beverage::TEKİLA (40ml)::Patron Blanco": {
    "price": "21 AZN"
  },
  "beverage::TEKİLA (40ml)::Don Julio Reposado": {
    "price": "25 AZN"
  },
  "beverage::TEKİLA (40ml)::Don Julio Blanco": {
    "price": "25 AZN"
  },
  "beverage::TEKİLA (40ml)::Don Julio 1942": {
    "price": "70 AZN"
  },
  "beverage::KONYAK (40ml)::Hennessy VSOP": {
    "price": "35 AZN"
  },
  "beverage::KONYAK (40ml)::Hennessy XO": {
    "price": "100 AZN"
  },
  "beverage::LİKÖR (40ml)::Kahlua": {
    "price": "8 AZN"
  },
  "beverage::LİKÖR (40ml)::Aperol": {
    "price": "9 AZN"
  },
  "beverage::LİKÖR (40ml)::Campari": {
    "price": "9 AZN"
  },
  "beverage::LİKÖR (40ml)::Baileys Original": {
    "price": "11 AZN"
  },
  "beverage::LİKÖR (40ml)::Jagermeister": {
    "price": "11 AZN"
  },
  "beverage::LİKÖR (40ml)::Martini Bianco": {
    "price": "11 AZN"
  },
  "beverage::LİKÖR (40ml)::Martini Extra Dry": {
    "price": "11 AZN"
  },
  "beverage::LİKÖR (40ml)::Martini Fierro": {
    "price": "11 AZN"
  },
  "beverage::LİKÖR (40ml)::Martini Rosso": {
    "price": "11 AZN"
  },
  "beverage::LİKÖR (40ml)::Jagermeister Manifest": {
    "price": "15 AZN"
  },
  "beverage::QƏHVƏ::Espresso": {
    "price": "4.5 AZN"
  },
  "beverage::QƏHVƏ::Türk qəhvəsi": {
    "price": "5.5 AZN"
  },
  "beverage::QƏHVƏ::Americano": {
    "price": "7 AZN"
  },
  "beverage::QƏHVƏ::Double espresso": {
    "price": "7 AZN"
  },
  "beverage::QƏHVƏ::Cappuccino": {
    "price": "8 AZN"
  },
  "beverage::QƏHVƏ::Flat White": {
    "price": "8 AZN"
  },
  "beverage::QƏHVƏ::Latte": {
    "price": "8 AZN"
  },
  "beverage::QƏHVƏ::Spanish Latte": {
    "price": "8 AZN"
  },
  "beverage::QƏHVƏ::Raff Classic": {
    "price": "9 AZN"
  },
  "beverage::ÇAY::Çay stəkanda": {
    "price": "7 AZN"
  },
  "beverage::ÇAY::Lənkəran çayı": {
    "price": "18 AZN"
  },
  "beverage::ÇAY::Chouchou & Loulou": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Douce Nuit": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::La Tete dans les Etoiles": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Le Temps Present Bio": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Les Cloches Sonnent": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Cascara Tea": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Marcel de Provence": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Mon Beau Sapin": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Pain d'Epice": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Pomme Verte": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Rouge Ananas": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Si T'es Sage": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::The de la Chance": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Toujours La": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Vachement Sympa": {
    "price": "20 AZN"
  },
  "beverage::ÇAY::Coco Givrees": {
    "price": "25 AZN"
  },
  "beverage::ÇAY::Rose en Sucre": {
    "price": "25 AZN"
  },
  "beverage::ÇAY::Energie du Yogi Bio": {
    "price": "30 AZN"
  },
  "beverage::ÇAY::Jardin Emeraude Bio": {
    "price": "30 AZN"
  },
  "beverage::ÇAY::Le Temps des Cerises": {
    "price": "30 AZN"
  },
  "beverage::ÇAY::Ma Bonne Etoile": {
    "price": "30 AZN"
  },
  "beverage::ÇAY::Sucre d'Orge": {
    "price": "30 AZN"
  },
  "beverage::SOYUQ İÇKİLƏR::Coca-Cola / Coca-Cola Zero / Fanta / Sprite 330ml": {
    "price": "5.5 AZN"
  },
  "beverage::SOYUQ İÇKİLƏR::Schweppes Tonic": {
    "price": "5.5 AZN"
  },
  "beverage::SOYUQ İÇKİLƏR::Red Bull": {
    "price": "8 AZN"
  },
  "beverage::SOYUQ İÇKİLƏR::Sirab Premium Qazsız / Qazlı": {
    "price": "4 AZN"
  },
  "beverage::SOYUQ İÇKİLƏR::Istisu Qazlı": {
    "price": "5.5 AZN"
  },
  "beverage::SOYUQ İÇKİLƏR::Evian Qazsız": {
    "price": "6.5 AZN"
  },
  "beverage::SOYUQ İÇKİLƏR::San Pellegrino Qazlı": {
    "price": "6.5 AZN"
  },
  "shisha::Qəlyan cihazları::Wookah": {
    "price": "100 AZN"
  },
  "shisha::Qəlyan cihazları::Hooky": {
    "price": "85 AZN"
  },
  "shisha::Qəlyan cihazları::Quasar": {
    "price": "75 AZN"
  },
  "food::CATLAYOUT::SƏHƏR YEMƏYİ": {
    "qr_layout_mode": "card"
  }
};

export const DEPLOYED_BRANCH_EDITS: Record<string, BranchItemEdit> = {
  "food::BRANCH::white-city::SƏHƏR YEMƏYİ::Tavada yumurta": {
    "is_available": true,
    "branch_price": "8"
  },
  "food::BRANCH::seabreeze-marina::SƏHƏR YEMƏYİ::Tavada yumurta": {
    "is_available": true,
    "branch_price": "9"
  },
  "food::BRANCH::white-city::SƏHƏR YEMƏYİ::Pomidor-yumurta": {
    "is_available": true,
    "branch_price": "10"
  },
  "food::BRANCH::seabreeze-marina::SƏHƏR YEMƏYİ::Pomidor-yumurta": {
    "is_available": true,
    "branch_price": "10"
  }
};

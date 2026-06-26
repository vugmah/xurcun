export type Language = 'az' | 'ru' | 'en' | 'tr' | 'ar'

export const translations = {
  az: {
    // Navigation
    nav_menu: 'MENYU',
    nav_about: 'HAQQIMIZDA',
    nav_gallery: 'QALEREYA',
    nav_events: 'TƏDBİRLƏR',
    nav_find_us: 'BİZİ TAPI',
    nav_contact: 'ƏLAQƏ',
    nav_reserve: 'REZERVASİYA',

    // Hero
    hero_label: 'BAKI · AZƏRBAYCAN',
    hero_subline: 'Restaurant & Lounge',
    hero_cta_menu: 'Menyunu kəşf et',
    hero_cta_reserve: 'Rezervasiya et',
    marquee_text: 'LƏZZƏT · ATMOSFER · AZƏRBAYCAN MƏTBƏXİ · AVROPA LƏZZƏTLƏRİ · İMZA KOKTEYLLƏR · PREMIUM QƏLYAN · ',

    // About
    about_label: 'HAQQIMIZDA',
    about_title: 'Xurcun White City-də ləzzət, rahatlıq və premium təcrübə bir arada',
    about_cta: 'Daha ətraflı',

    // Concept
    concept_restaurant: 'RESTORAN',
    concept_restaurant_desc: 'Müasir Azərbaycan mətbəxi və seçilmiş Avropa ləzzətləri',
    concept_bar: 'BAR',
    concept_bar_desc: 'İmza kokteyllər, zəngin içki seçimi və xüsusi hazırlanmış içkilər',
    concept_lounge: 'LOUNGE',
    concept_lounge_desc: 'Rahat atmosfer, premium servis və zövqlü axşamlar',
    concept_events: 'XÜSUSİ TƏDBİRLƏR',
    concept_events_desc: 'Ad günləri, korporativ tədbirlər və xüsusi dəvətlər üçün seçilmiş menyular',

    // Menu
    menu_label: 'MENYU',
    menu_title: 'Ləzzət səyahəti',
    menu_subtitle: 'Hər zövqə uyğun, xüsusi hazırlanmış menyu seçimləri',
    menu_view_all: 'Bütün menyuya bax',
    menu_categories: 'Kateqoriyalar',
    menu_alacarte: 'Yemək menyusu',
    menu_beverages: 'İçki menyusu',
    menu_shisha: 'Qəlyan menyusu',

    // Menu card items (MenuPreview)
    menu_card_food_items: 'Səhər yeməyi · Şorbalar · Salatlar · Başlanğıclar · Əsas yeməklər · Pasta · Desertlər',
    menu_card_bev_items: 'İmza kokteyllər · Klassik kokteyllər · Şərab · Viski · Tekila · Qəhvə · Çay',
    menu_card_shisha_items: 'Wookah · Quasar · Premium tütün · Klassik tütün · Xüsusi aroma',

    // Gallery
    gallery_label: 'QALEREYA',
    gallery_title: 'Məkanımızdan görüntülər',
    gallery_close: 'Bağla',

    // Events
    events_label: 'TƏDBİRLƏR',
    events_title: 'Xüsusi Tədbirlər',
    events_intro: 'XURCUN həm sosial, həm də korporativ tədbirlər üçün ideal məkan təqdim edir. Fərdi tədbir həlləri və çevik oturma planları ilə xidmətinizdəyik.',
    events_capacity_restaurant_label: 'RESTORAN',
    events_capacity_restaurant_title: 'XURCUN Restoranı',
    events_capacity_restaurant_desc: 'Müasir dəbdəbə və zərif atmosferi bir araya gətirən restoran hissəsi həm sosial, həm də korporativ tədbirlər üçün ideal məkan təqdim edir. Komfortlu, premium səviyyəli xidmət konsepti ilə fəaliyyət göstərir.',
    events_capacity_restaurant_guests: '55 qonağa qədər tutum',
    events_capacity_lounge_label: 'LOUNGE',
    events_capacity_lounge_title: 'XURCUN Lounge',
    events_capacity_lounge_desc: 'Şəhərin dinamik atmosferini zərif interyer və premium lounge konsepti ilə birləşdirir. Sosial görüşlər, qapalı tədbirlər, networking gecələri və eksklüziv günləriniz üçün uyğun məkandır.',
    events_capacity_lounge_guests: '60 nəfərlik dining tutumuna malikdir',
    events_seating_title: 'Oturma Planı Seçimləri',
    events_seating_ushape: 'U-Shape düzülüş',
    events_seating_theatre: 'Teatral düzülüş',
    events_seating_banquet: 'Banket düzülüşü',
    events_seating_cocktail: 'Kokteyl formatı',
    events_tech_title: 'Texniki və Audio-Visual İmkanlar',
    events_tech_displays: 'Böyük ölçülü yüksək keyfiyyətli ekranlar',
    events_tech_hdmi: 'HDMI bağlantısı — təqdimat və video playback',
    events_tech_bose: 'BOSE Professional səs sistemi',
    events_tech_infra: 'Korporativ görüşlər və tədbirlər üçün uyğun infrastruktur',
    events_types_title: 'Tədbir və Özəl Görüş İmkanları',
    events_type_corporate: 'Korporativ görüşlər',
    events_type_presentations: 'Biznes təqdimatları',
    events_type_dining: 'Özəl nahar və şam yeməkləri',
    events_type_birthday: 'Ad günü tədbirləri',
    events_type_cocktail: 'Kokteyl qəbulları',
    events_type_networking: 'Networking tədbirləri',
    events_type_exclusive: 'Xüsusi sosial görüşlər',
    events_reserve: 'Tədbir üçün əlaqə saxlayın',
    events_cta_text: 'Tədbiriniz üçün fərdi həllər və çevik planlaşdırma təklif edirik.',

    // Contact / Footer
    contact_brand: 'Xurcun White City Restaurant & Lounge',
    contact_address: '1-ci Yaşıl Ada küçəsi, Bakı, Azərbaycan',
    contact_hours: 'B.e.–Bazar: 10:00 – 00:00',
    contact_quicklinks: 'Sürətli keçidlər',
    contact_phone: 'Telefon',
    contact_email: 'E-poçt',
    contact_copyright: '© 2026 Xurcun White City Restaurant & Lounge',
    contact_location: 'BAKİ · AZƏRBAYCAN',
    contact_follow: 'Bizi izləyin',

    // Social & Google Reviews
    social_follow: 'Bizi izləyin',
    social_instagram: 'Instagram',
    social_facebook: 'Facebook',
    google_review_title: 'Rəyiniz bizim üçün önəmlidir',
    google_review_text: 'Bizi bəyəndiniz? Google-da rəy yazaraq dəstək olun.',
    google_review_button: 'Google-da rəy yazın',
    maps_open_button: 'Xəritədə aç',

    // Menu page notes
    service_note: 'Qeyd: 10% xidmət haqqı hesabınıza əlavə olunacaq',
    allergy_note: 'Zəhmət olmasa, qida allergiyası ilə bağlı məlumat üçün personalımıza müraciət edin.',
    currency: 'AZN',

    // Shisha note
    shisha_note: 'Menyuda göstərilməyən tütün çeşidləri üçün qəlyançımızdan məlumat ala bilərsiniz. İstəyinizə uyğun olaraq fərqli tütün qarışıqları ilə xüsusi qəlyan hazırlaya bilərik.',

    // Item tags
    tag_new: 'NEW',
    tag_meat: 'Ət',
    tag_fish: 'Balıq',
    tag_vegetarian: 'Vegetarian',
    tag_halal: 'Halal',
  },
  ru: {
    // Navigation
    nav_menu: 'МЕНЮ',
    nav_about: 'О НАС',
    nav_gallery: 'ГАЛЕРЕЯ',
    nav_events: 'СОБЫТИЯ',
    nav_find_us: 'НАЙТИ НАС',
    nav_contact: 'КОНТАКТЫ',
    nav_reserve: 'БРОНЬ',

    // Hero
    hero_label: 'БАКУ · АЗЕРБАЙДЖАН',
    hero_subline: 'Restaurant & Lounge',
    hero_cta_menu: 'Посмотреть меню',
    hero_cta_reserve: 'Забронировать',
    marquee_text: 'ВКУС · АТМОСФЕРА · АЗЕРБАЙДЖАНСКАЯ КУХНЯ · ЕВРОПЕЙСКИЕ БЛЮДА · ФИРМЕННЫЕ КОКТЕЙЛИ · ПРЕМИАЛЬНЫЙ КАЛЬЯН · ',

    // About
    about_label: 'О НАС',
    about_title: 'Xurcun White City — вкус, комфорт и премиальный опыт',
    about_cta: 'Подробнее',

    // Concept
    concept_restaurant: 'РЕСТОРАН',
    concept_restaurant_desc: 'Современная азербайджанская кухня и избранные европейские блюда',
    concept_bar: 'БАР',
    concept_bar_desc: 'Фирменные коктейли, широкий выбор напитков и авторская подача',
    concept_lounge: 'LOUNGE',
    concept_lounge_desc: 'Уютная атмосфера, премиальный сервис и приятные вечера',
    concept_events: 'ЧАСТНЫЕ МЕРОПРИЯТИЯ',
    concept_events_desc: 'Дни рождения, корпоративы и особые события с индивидуальным меню',

    // Menu
    menu_label: 'МЕНЮ',
    menu_title: 'Путешествие вкуса',
    menu_subtitle: 'Изысканные позиции меню для любого вкуса',
    menu_view_all: 'Посмотреть всё меню',
    menu_categories: 'Категории',
    menu_alacarte: 'Меню блюд',
    menu_beverages: 'Напитки',
    menu_shisha: 'Кальянное меню',

    // Menu card items
    menu_card_food_items: 'Завтраки · Супы · Салаты · Закуски · Основные блюда · Паста · Десерты',
    menu_card_bev_items: 'Фирменные коктейли · Классические коктейли · Вино · Виски · Текила · Кофе · Чай',
    menu_card_shisha_items: 'Wookah · Quasar · Премиальный табак · Классический табак · Особые ароматы',

    // Gallery
    gallery_label: 'ГАЛЕРЕЯ',
    gallery_title: 'Атмосфера Xurcun',
    gallery_close: 'Закрыть',

    // Events
    events_label: 'СОБЫТИЯ',
    events_title: 'Особые мероприятия',
    events_intro: 'XURCUN — идеальное место для как социальных, так и корпоративных мероприятий. Мы предлагаем индивидуальные решения для мероприятий и гибкие планы рассадки.',
    events_capacity_restaurant_label: 'РЕСТОРАН',
    events_capacity_restaurant_title: 'Ресторан XURCUN',
    events_capacity_restaurant_desc: 'Ресторан, сочетающий современную роскошь и изысканную атмосферу, предлагает идеальное место для проведения как социальных, так и корпоративных мероприятий. Работает с концепцией комфортного премиального обслуживания.',
    events_capacity_restaurant_guests: 'Вместимость до 55 гостей',
    events_capacity_lounge_label: 'LAUNGE',
    events_capacity_lounge_title: 'Lounge XURCUN',
    events_capacity_lounge_desc: 'Сочетает динамичную атмосферу города с элегантным интерьером и премиальной lounge-концепцией. Идеальное место для социальных встреч, закрытых мероприятий, вечеров нетворкинга и эксклюзивных событий.',
    events_capacity_lounge_guests: 'Вместимость до 60 гостей для dining',
    events_seating_title: 'Варианты рассадки',
    events_seating_ushape: 'U-Shape рассадка',
    events_seating_theatre: 'Театральный стиль',
    events_seating_banquet: 'Банкетная рассадка',
    events_seating_cocktail: 'Коктейльный прием',
    events_tech_title: 'Технические и Audio-Visual возможности',
    events_tech_displays: 'Большие HD-экраны высокого качества',
    events_tech_hdmi: 'HDMI-подключение — презентации и видео',
    events_tech_bose: 'BOSE Professional звуковая система',
    events_tech_infra: 'Инфраструктура для корпоративных встреч и мероприятий',
    events_types_title: 'Мероприятия и возможности частных встреч',
    events_type_corporate: 'Корпоративные встречи',
    events_type_presentations: 'Бизнес-презентации',
    events_type_dining: 'Частные обеды и ужины',
    events_type_birthday: 'Празднование дней рождения',
    events_type_cocktail: 'Коктейльные приемы',
    events_type_networking: 'Мероприятия для нетворкинга',
    events_type_exclusive: 'Эксклюзивные социальные встречи',
    events_reserve: 'Свяжитесь с нами для мероприятия',
    events_cta_text: 'Мы предлагаем индивидуальные решения и гибкое планирование для вашего мероприятия.',

    // Contact / Footer
    contact_brand: 'Xurcun White City Restaurant & Lounge',
    contact_address: 'ул. 1-я Яшыл Ада, Баку, Азербайджан',
    contact_hours: 'Пн–Вс: 10:00 – 00:00',
    contact_quicklinks: 'Быстрые ссылки',
    contact_phone: 'Телефон',
    contact_email: 'E-mail',
    contact_copyright: '© 2026 Xurcun White City Restaurant & Lounge',
    contact_location: 'БАКУ · АЗЕРБАЙДЖАН',
    contact_follow: 'Мы в соцсетях',

    // Social & Google Reviews
    social_follow: 'Мы в соцсетях',
    social_instagram: 'Instagram',
    social_facebook: 'Facebook',
    google_review_title: 'Ваш отзыв важен для нас',
    google_review_text: 'Вам понравилось у нас? Оставьте отзыв в Google.',
    google_review_button: 'Оставить отзыв в Google',
    maps_open_button: 'Открыть на карте',

    // Menu page notes
    service_note: 'Примечание: к счету добавляется 10% сервисный сбор',
    allergy_note: 'Пожалуйста, сообщите персоналу о любых пищевых аллергиях.',
    currency: 'AZN',

    // Shisha note
    shisha_note: 'Если вы не нашли нужный табак в меню, уточните наличие у нашего кальянного мастера. Мы можем приготовить кальян с различными табачными миксами по вашему вкусу.',

    // Item tags
    tag_new: 'NEW',
    tag_meat: 'Мясо',
    tag_fish: 'Рыба',
    tag_vegetarian: 'Вегетарианское',
    tag_halal: 'Халяль',
  },
  en: {
    // Navigation
    nav_menu: 'MENU',
    nav_about: 'ABOUT',
    nav_gallery: 'GALLERY',
    nav_events: 'EVENTS',
    nav_find_us: 'FIND US',
    nav_contact: 'CONTACT',
    nav_reserve: 'RESERVATION',

    // Hero
    hero_label: 'BAKU · AZERBAIJAN',
    hero_subline: 'Restaurant & Lounge',
    hero_cta_menu: 'Explore menu',
    hero_cta_reserve: 'Book a table',
    marquee_text: 'FLAVOR · ATMOSPHERE · AZERBAIJANI CUISINE · EUROPEAN DISHES · SIGNATURE COCKTAILS · PREMIUM SHISHA · ',

    // About
    about_label: 'ABOUT',
    about_title: 'Xurcun White City — where flavor, comfort and premium experience meet',
    about_cta: 'Read more',

    // Concept
    concept_restaurant: 'RESTAURANT',
    concept_restaurant_desc: 'Modern Azerbaijani cuisine and selected European dishes',
    concept_bar: 'BAR',
    concept_bar_desc: 'Signature cocktails, a curated beverage selection and crafted drinks',
    concept_lounge: 'LOUNGE',
    concept_lounge_desc: 'Comfortable atmosphere, premium service and refined evenings',
    concept_events: 'PRIVATE EVENTS',
    concept_events_desc: 'Birthdays, corporate events and private gatherings with special menus',

    // Menu
    menu_label: 'MENU',
    menu_title: 'A journey of taste',
    menu_subtitle: 'Carefully curated menu selections for every taste',
    menu_view_all: 'View full menu',
    menu_categories: 'Categories',
    menu_alacarte: 'Food menu',
    menu_beverages: 'Beverage menu',
    menu_shisha: 'Shisha menu',

    // Menu card items
    menu_card_food_items: 'Breakfast · Soups · Salads · Starters · Main dishes · Pasta · Desserts',
    menu_card_bev_items: 'Signature cocktails · Classic cocktails · Wine · Whisky · Tequila · Coffee · Tea',
    menu_card_shisha_items: 'Wookah · Quasar · Premium tobacco · Classic tobacco · Special aroma',

    // Gallery
    gallery_label: 'GALLERY',
    gallery_title: 'Moments at Xurcun',
    gallery_close: 'Close',

    // Events
    events_label: 'EVENTS',
    events_title: 'Private Events',
    events_intro: 'XURCUN offers the perfect venue for both social and corporate events. We are at your service with customized event solutions and flexible seating plans.',
    events_capacity_restaurant_label: 'RESTAURANT',
    events_capacity_restaurant_title: 'XURCUN Restaurant',
    events_capacity_restaurant_desc: 'The restaurant area, combining modern luxury and refined atmosphere, offers an ideal venue for both social and corporate events. Operates with a comfortable, premium-level service concept.',
    events_capacity_restaurant_guests: 'Capacity for up to 55 guests',
    events_capacity_lounge_label: 'LOUNGE',
    events_capacity_lounge_title: 'XURCUN Lounge',
    events_capacity_lounge_desc: 'Combines the city\'s dynamic atmosphere with elegant interiors and a premium lounge concept. A suitable venue for social gatherings, private events, networking evenings and exclusive occasions.',
    events_capacity_lounge_guests: 'Dining capacity for up to 60 guests',
    events_seating_title: 'Seating Layout Options',
    events_seating_ushape: 'U-Shape Setup',
    events_seating_theatre: 'Theatre Style',
    events_seating_banquet: 'Banquet Arrangement',
    events_seating_cocktail: 'Cocktail Reception',
    events_tech_title: 'Technology & Audio-Visual Features',
    events_tech_displays: 'Large high-definition display screens',
    events_tech_hdmi: 'HDMI connectivity for presentations and video playback',
    events_tech_bose: 'BOSE Professional sound system',
    events_tech_infra: 'Infrastructure suitable for corporate meetings and events',
    events_types_title: 'Event & Private Gathering Options',
    events_type_corporate: 'Corporate Meetings',
    events_type_presentations: 'Business Presentations',
    events_type_dining: 'Private Dining',
    events_type_birthday: 'Birthday Celebrations',
    events_type_cocktail: 'Cocktail Receptions',
    events_type_networking: 'Networking Events',
    events_type_exclusive: 'Exclusive Social Gatherings',
    events_reserve: 'Contact us for your event',
    events_cta_text: 'We offer customized solutions and flexible planning for your event.',

    // Contact / Footer
    contact_brand: 'Xurcun White City Restaurant & Lounge',
    contact_address: '1st Yashil Ada Street, Baku, Azerbaijan',
    contact_hours: 'Mon–Sun: 10:00 – 00:00',
    contact_quicklinks: 'Quick links',
    contact_phone: 'Phone',
    contact_email: 'Email',
    contact_copyright: '© 2026 Xurcun White City Restaurant & Lounge',
    contact_location: 'BAKU · AZERBAIJAN',
    contact_follow: 'Follow us',

    // Social & Google Reviews
    social_follow: 'Follow us',
    social_instagram: 'Instagram',
    social_facebook: 'Facebook',
    google_review_title: 'Your feedback matters',
    google_review_text: 'Enjoyed your time? Leave a review on Google to support us.',
    google_review_button: 'Write a review on Google',
    maps_open_button: 'Open in Google Maps',

    // Menu page notes
    service_note: 'Note: A 10% service charge will be added to your bill',
    allergy_note: 'Please inform our staff about any food allergies.',
    currency: 'AZN',

    // Shisha note
    shisha_note: 'For tobacco options not listed on the menu, please ask our shisha team. We can prepare a custom shisha with different tobacco blends according to your taste.',

    // Item tags
    tag_new: 'NEW',
    tag_meat: 'Meat',
    tag_fish: 'Fish',
    tag_vegetarian: 'Vegetarian',
    tag_halal: 'Halal',
  },
  tr: {
    // Navigation
    nav_menu: 'MENÜ',
    nav_about: 'HAKKIMIZDA',
    nav_gallery: 'GALERİ',
    nav_events: 'ETKİNLİKLER',
    nav_find_us: 'BİZİ BUL',
    nav_contact: 'İLETİŞİM',
    nav_reserve: 'REZERVASYON',

    // Hero
    hero_label: 'BAKÜ · AZERBAYCAN',
    hero_subline: 'Restaurant & Lounge',
    hero_cta_menu: 'Menüyü keşfet',
    hero_cta_reserve: 'Rezervasyon yap',
    marquee_text: 'LEZZET · ATMOSFER · AZERBAYCAN MUTFAĞI · AVRUPA YEMEKLERİ · İMZA KOKTEYLLERİ · PREMIUM NARGİLE · ',

    // About
    about_label: 'HAKKIMIZDA',
    about_title: 'Xurcun White City — lezzet, konfor ve premium deneyimin bir araya geldiği yer',
    about_cta: 'Daha fazla bilgi',

    // Concept
    concept_restaurant: 'RESTORAN',
    concept_restaurant_desc: 'Modern Azerbaycan mutfağı ve seçilmiş Avrupa lezzetleri',
    concept_bar: 'BAR',
    concept_bar_desc: 'İmza kokteyller, zengin içki seçimi ve özel hazırlanmış içecekler',
    concept_lounge: 'LOUNGE',
    concept_lounge_desc: 'Rahat atmosfer, premium servis ve keyifli akşamlar',
    concept_events: 'ÖZEL ETKİNLİKLER',
    concept_events_desc: 'Doğum günleri, kurumsal etkinlikler ve özel davetler için özel menüler',

    // Menu
    menu_label: 'MENÜ',
    menu_title: 'Lezzet yolculuğu',
    menu_subtitle: 'Her zevke uygun, özenle hazırlanmış menü seçenekleri',
    menu_view_all: 'Tüm menüyü gör',
    menu_categories: 'Kategoriler',
    menu_alacarte: 'Yemek menüsü',
    menu_beverages: 'İçecek menüsü',
    menu_shisha: 'Nargile menüsü',

    // Menu card items
    menu_card_food_items: 'Kahvaltı · Çorbalar · Salatalar · Başlangıçlar · Ana yemekler · Makarna · Tatlılar',
    menu_card_bev_items: 'İmza kokteyller · Klasik kokteyller · Şarap · Viski · Tekila · Kahve · Çay',
    menu_card_shisha_items: 'Wookah · Quasar · Premium tütün · Klasik tütün · Özel aroma',

    // Gallery
    gallery_label: 'GALERİ',
    gallery_title: 'Xurcun anları',
    gallery_close: 'Kapat',

    // Events
    events_label: 'ETKİNLİKLER',
    events_title: 'Özel Etkinlikler',
    events_intro: 'XURCUN hem sosyal hem de kurumsal etkinlikler için ideal bir mekan sunar. Kişiselleştirilmiş etkinlik çözümleri ve esnek oturma planları ile hizmetinizdeyiz.',
    events_capacity_restaurant_label: 'RESTORAN',
    events_capacity_restaurant_title: 'XURCUN Restoranı',
    events_capacity_restaurant_desc: 'Modern lüks ve zarif atmosferi bir araya getiren restoran bölümü hem sosyal hem de kurumsal etkinlikler için ideal mekan sunar. Konforlu, premium seviyede hizmet konsepti ile faaliyet gösterir.',
    events_capacity_restaurant_guests: '55 misafirine kadar kapasite',
    events_capacity_lounge_label: 'LOUNGE',
    events_capacity_lounge_title: 'XURCUN Lounge',
    events_capacity_lounge_desc: 'Şehrin dinamik atmosferini zarif iç mekanlar ve premium lounge konseptiyle birleştirir. Sosyal buluşmalar, özel etkinlikler, networking akşamları ve özel davetler için uygun mekandır.',
    events_capacity_lounge_guests: '60 misafirlik dining kapasitesine sahiptir',
    events_seating_title: 'Oturma Düzeni Seçenekleri',
    events_seating_ushape: 'U-Shape Düzen',
    events_seating_theatre: 'Tiyatro Tarzı',
    events_seating_banquet: 'Banket Düzeni',
    events_seating_cocktail: 'Kokteyl Resepsiyonu',
    events_tech_title: 'Teknik ve Audio-Visual Olanaklar',
    events_tech_displays: 'Büyük boyutlu yüksek çözünürlüklü ekranlar',
    events_tech_hdmi: 'HDMI bağlantısı — sunumlar ve video playback',
    events_tech_bose: 'BOSE Professional ses sistemi',
    events_tech_infra: 'Kurumsal toplantılar ve etkinlikler için uygun altyapı',
    events_types_title: 'Etkinlik ve Özel Buluşma Seçenekleri',
    events_type_corporate: 'Kurumsal Toplantılar',
    events_type_presentations: 'İş Sunumları',
    events_type_dining: 'Özel Yemekler',
    events_type_birthday: 'Doğum Günü Kutlamaları',
    events_type_cocktail: 'Kokteyl Resepsiyonları',
    events_type_networking: 'Networking Etkinlikleri',
    events_type_exclusive: 'Özel Sosyal Buluşmalar',
    events_reserve: 'Etkinliğiniz için bize ulaşın',
    events_cta_text: 'Etkinliğiniz için kişiselleştirilmiş çözümler ve esnek planlama sunuyoruz.',

    // Contact / Footer
    contact_brand: 'Xurcun White City Restaurant & Lounge',
    contact_address: '1. Yeşil Ada Sokağı, Bakü, Azerbaycan',
    contact_hours: 'Pzt–Paz: 10:00 – 00:00',
    contact_quicklinks: 'Hızlı bağlantılar',
    contact_phone: 'Telefon',
    contact_email: 'E-posta',
    contact_copyright: '© 2026 Xurcun White City Restaurant & Lounge',
    contact_location: 'BAKÜ · AZERBAYCAN',
    contact_follow: 'Bizi takip edin',

    // Social & Google Reviews
    social_follow: 'Bizi takip edin',
    social_instagram: 'Instagram',
    social_facebook: 'Facebook',
    google_review_title: 'Görüşleriniz bizim için önemli',
    google_review_text: 'Keyif aldınız mı? Bizi desteklemek için Google yorumu yazın.',
    google_review_button: 'Google yorumu yaz',
    maps_open_button: 'Haritada aç',

    // Menu page notes
    service_note: 'Not: Faturanıza %10 servis ücreti eklenecektir',
    allergy_note: 'Lütfen herhangi bir gıda alerjiniz hakkında personelimizi bilgilendirin.',
    currency: 'AZN',

    // Shisha note
    shisha_note: 'Menüde görmediğiniz tütün çeşitleri için nargile ekibimizden bilgi alabilirsiniz. İsteğinize uygun farklı tütün karışımlarıyla özel nargile hazırlayabiliriz.',

    // Item tags
    tag_new: 'NEW',
    tag_meat: 'Et',
    tag_fish: 'Balık',
    tag_vegetarian: 'Vejetaryen',
    tag_halal: 'Helal',
  },
  ar: {
    // Navigation
    nav_menu: 'القائمة',
    nav_about: 'من نحن',
    nav_gallery: 'المعرض',
    nav_events: 'المناسبات',
    nav_find_us: 'موقعنا',
    nav_contact: 'اتصل بنا',
    nav_reserve: 'الحجز',

    // Hero
    hero_label: 'باكو · أذربيجان',
    hero_subline: 'مطعم وصالة',
    hero_cta_menu: 'استكشف القائمة',
    hero_cta_reserve: 'احجز طاولة',
    marquee_text: 'النكهة · الأجواء · المطبخ الأذربيجاني · الأطباق الأوروبية · كوكتيلات مميزة · شيشة فاخرة · ',

    // About
    about_label: 'من نحن',
    about_title: 'شوركون وايت سيتي — حيث تلتقي النكهة والراحة والتجربة الفاخرة',
    about_cta: 'اقرأ المزيد',

    // Concept
    concept_restaurant: 'المطعم',
    concept_restaurant_desc: 'مطبخ أذربيجاني حديث وأطباق أوروبية مختارة',
    concept_bar: 'البار',
    concept_bar_desc: 'كوكتيلات مميزة وتشكيلة مشروبات منتقاة',
    concept_lounge: 'الصالة',
    concept_lounge_desc: 'أجواء مريحة وخدمة فاخرة وأمسيات راقية',
    concept_events: 'المناسبات الخاصة',
    concept_events_desc: 'أعياد الميلاد والفعاليات المؤسسية والتجمعات الخاصة بقوائم مخصصة',

    // Menu
    menu_label: 'القائمة',
    menu_title: 'رحلة من الذوق',
    menu_subtitle: 'اختيارات قائمة منتقاة بعناية لكل ذوق',
    menu_view_all: 'عرض القائمة كاملة',
    menu_categories: 'الفئات',
    menu_alacarte: 'قائمة الطعام',
    menu_beverages: 'قائمة المشروبات',
    menu_shisha: 'قائمة الشيشة',

    // Menu card items
    menu_card_food_items: 'فطور · شوربات · سلطات · مقبلات · أطباق رئيسية · معكرونة · حلويات',
    menu_card_bev_items: 'كوكتيلات مميزة · كوكتيلات كلاسيكية · نبيذ · ويسكي · تيكيلا · قهوة · شاي',
    menu_card_shisha_items: 'ووكا · كوازار · تبغ فاخر · تبغ كلاسيكي · نكهات خاصة',

    // Gallery
    gallery_label: 'المعرض',
    gallery_title: 'لحظات في شوركون',
    gallery_close: 'إغلاق',

    // Events
    events_label: 'المناسبات',
    events_title: 'المناسبات الخاصة',
    events_intro: 'يوفر شوركون المكان المثالي للفعاليات الاجتماعية والمؤسسية. نحن في خدمتكم بحلول مخصصة وخطط جلوس مرنة.',
    events_capacity_restaurant_label: 'المطعم',
    events_capacity_restaurant_title: 'مطعم شوركون',
    events_capacity_restaurant_desc: 'تجمع منطقة المطعم بين الفخامة العصرية والأجواء الراقية، وتوفر مكانًا مثاليًا للفعاليات الاجتماعية والمؤسسية بمستوى خدمة فاخر ومريح.',
    events_capacity_restaurant_guests: 'تتسع لما يصل إلى 55 ضيفًا',
    events_capacity_lounge_label: 'الصالة',
    events_capacity_lounge_title: 'صالة شوركون',
    events_capacity_lounge_desc: 'تمزج بين أجواء المدينة الحيوية والتصاميم الأنيقة ومفهوم الصالة الفاخرة. مكان مناسب للتجمعات والفعاليات الخاصة وأمسيات التواصل والمناسبات الحصرية.',
    events_capacity_lounge_guests: 'تتسع لتناول الطعام لما يصل إلى 60 ضيفًا',
    events_seating_title: 'خيارات ترتيب الجلوس',
    events_seating_ushape: 'ترتيب على شكل U',
    events_seating_theatre: 'ترتيب مسرحي',
    events_seating_banquet: 'ترتيب مأدبة',
    events_seating_cocktail: 'حفل كوكتيل',
    events_tech_title: 'التقنية والميزات السمعية البصرية',
    events_tech_displays: 'شاشات عرض كبيرة عالية الدقة',
    events_tech_hdmi: 'اتصال HDMI للعروض التقديمية وتشغيل الفيديو',
    events_tech_bose: 'نظام صوت BOSE احترافي',
    events_tech_infra: 'بنية مناسبة للاجتماعات والفعاليات المؤسسية',
    events_types_title: 'خيارات الفعاليات والتجمعات الخاصة',
    events_type_corporate: 'الاجتماعات المؤسسية',
    events_type_presentations: 'العروض التقديمية للأعمال',
    events_type_dining: 'تناول الطعام الخاص',
    events_type_birthday: 'احتفالات أعياد الميلاد',
    events_type_cocktail: 'حفلات الكوكتيل',
    events_type_networking: 'فعاليات التواصل',
    events_type_exclusive: 'تجمعات اجتماعية حصرية',
    events_reserve: 'تواصل معنا لمناسبتك',
    events_cta_text: 'نقدم حلولًا مخصصة وتخطيطًا مرنًا لمناسبتك.',

    // Contact / Footer
    contact_brand: 'شوركون وايت سيتي — مطعم وصالة',
    contact_address: 'شارع ياشيل آدا 1، باكو، أذربيجان',
    contact_hours: 'الإثنين–الأحد: 10:00 – 00:00',
    contact_quicklinks: 'روابط سريعة',
    contact_phone: 'الهاتف',
    contact_email: 'البريد الإلكتروني',
    contact_copyright: '© 2026 شوركون وايت سيتي — مطعم وصالة',
    contact_location: 'باكو · أذربيجان',
    contact_follow: 'تابعنا',

    // Social & Google Reviews
    social_follow: 'تابعنا',
    social_instagram: 'إنستغرام',
    social_facebook: 'فيسبوك',
    google_review_title: 'رأيك يهمنا',
    google_review_text: 'استمتعت بوقتك؟ اترك تقييمًا على Google لدعمنا.',
    google_review_button: 'اكتب تقييمًا على Google',
    maps_open_button: 'افتح في خرائط Google',

    // Menu page notes
    service_note: 'ملاحظة: ستتم إضافة رسوم خدمة بنسبة 10% إلى فاتورتك',
    allergy_note: 'يرجى إبلاغ موظفينا بأي حساسية تجاه الطعام.',
    currency: 'AZN',

    // Shisha note
    shisha_note: 'للحصول على خيارات تبغ غير مدرجة في القائمة، يرجى سؤال فريق الشيشة لدينا. يمكننا تحضير شيشة مخصصة بخلطات تبغ مختلفة حسب ذوقك.',

    // Item tags
    tag_new: 'جديد',
    tag_meat: 'لحم',
    tag_fish: 'سمك',
    tag_vegetarian: 'نباتي',
    tag_halal: 'حلال',
  }
} as const

export type Translations = typeof translations

import { useLanguage } from "@/lib/LanguageContext";
import { getTrackingSettings } from "@/lib/trackingSettings";
import { getActiveBranches } from "@/lib/generalSettings";
import { MapPin, Phone, ArrowLeft } from "lucide-react";
import SEO from "@/sections/SEO";

function getBranches() {
  return getActiveBranches().map((b) => ({
    slug: b.slug,
    name: b.name,
    phone: b.whatsapp,
    address: b.address,
  }));
}

function getWhatsappUrl(phone: string, branchName: string, lang: string): string {
  const messages: Record<string, string> = {
    az: `Salam, ${branchName} üçün rezervasiya etmək istəyirəm.`,
    tr: `Merhaba, ${branchName} için rezervasyon yapmak istiyorum.`,
    ru: `Здравствуйте, я хочу забронировать столик в ${branchName}.`,
    en: `Hello, I would like to make a reservation at ${branchName}.`,
  };
  const text = encodeURIComponent(messages[lang] || messages.en);
  return `https://wa.me/${phone}?text=${text}`;
}

export default function ReservationPage() {
  const { lang } = useLanguage();
  const settings = getTrackingSettings();
  const seabreezePhone = settings.seabreezeWhatsapp?.trim();

  const branches = getBranches().map((b) => ({
    ...b,
    phone: b.slug === "seabreeze-marina" ? seabreezePhone : b.phone,
  }));

  return (
    <>
      <SEO page="reservation" />
    <div className="min-h-screen bg-[#F6F2E9] text-[#2E2A25]">
      {/* Header */}
      <div className="border-b border-[#D8CFB9]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="text-[#6B6457] hover:text-[#2E2A25] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="text-lg text-[#7E6228]" style={{ fontFamily: 'Rufolo, "Cormorant Garamond", serif', fontWeight: 600 }}>
            {lang === "az" ? "Rezervasiya" : lang === "tr" ? "Rezervasyon" : lang === "ru" ? "Бронирование" : "Reservation"}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <p className="text-[#6B6457] text-sm text-center mb-8">
          {lang === "az"
            ? "Rezervasiya üçün filial seçin və WhatsApp üzərən bizimlə əlaqə saxlayın."
            : lang === "tr"
            ? "Rezervasyon için şube seçin ve WhatsApp üzerinden bize ulaşın."
            : lang === "ru"
            ? "Выберите филиал и свяжитесь с нами через WhatsApp для бронирования."
            : "Select a branch and contact us via WhatsApp for reservation."}
        </p>

        <div className="space-y-4">
          {branches.map((branch) => (
            <div
              key={branch.slug}
              className="bg-white border border-[#D8CFB9] rounded-xl p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#9D7C38]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#7E6228]" />
                </div>
                <div>
                  <h3 className="text-[#2E2A25] font-medium">{branch.name}</h3>
                  <p className="text-[#6B6457] text-xs">{branch.address}</p>
                </div>
              </div>

              {branch.phone ? (
                <a
                  href={getWhatsappUrl(branch.phone, branch.name, lang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#1F4A34] rounded-lg text-[#eaf3ec] text-sm font-medium hover:brightness-110 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp — {branch.phone}
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full py-3 bg-[#F1ECE0] border border-[#D8CFB9] rounded-lg text-[#6B6457] text-sm">
                  <Phone className="w-4 h-4" />
                  {lang === "az"
                    ? "WhatsApp nömrəsi quraşdırılmayıb"
                    : lang === "tr"
                    ? "WhatsApp numarası yapılandırılmamış"
                    : lang === "ru"
                    ? "Номер WhatsApp не настроен"
                    : "WhatsApp not configured"}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[#D8CFB9] text-center">
          <p className="text-sm text-[#7E6228] tracking-[0.1em]" style={{ fontFamily: 'Rufolo, "Cormorant Garamond", serif', fontWeight: 600 }}>XURCUN</p>
          <p className="text-[10px] text-[#6B6457]/70 mt-1">
            {lang === "az" ? "Hər iki filialda xidmətinizdəyik" : lang === "tr" ? "Her iki şubede hizmetinizdeyiz" : lang === "ru" ? "Мы работаем в обоих филиалах" : "Serving you at both branches"}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

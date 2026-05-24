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
  const { t, lang } = useLanguage();
  const settings = getTrackingSettings();
  const seabreezePhone = settings.seabreezeWhatsapp?.trim();

  const branches = getBranches().map((b) => ({
    ...b,
    phone: b.slug === "seabreeze-marina" ? seabreezePhone : b.phone,
  }));

  return (
    <>
      <SEO page="reservation" />
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header */}
      <div className="border-b border-[#222]">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <a href="/" className="text-white/40 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <h1 className="font-display text-lg text-[#C9A96E]">
            {lang === "az" ? "Rezervasiya" : lang === "tr" ? "Rezervasyon" : lang === "ru" ? "Бронирование" : "Reservation"}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        <p className="text-white/60 text-sm text-center mb-8">
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
              className="bg-[#111] border border-[#222] rounded-xl p-5"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#C9A96E]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#C9A96E]" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{branch.name}</h3>
                  <p className="text-white/40 text-xs">{branch.address}</p>
                </div>
              </div>

              {branch.phone ? (
                <a
                  href={getWhatsappUrl(branch.phone, branch.name, lang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  WhatsApp — {branch.phone}
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-[#222] rounded-lg text-white/30 text-sm">
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

        <div className="mt-8 pt-6 border-t border-[#222] text-center">
          <p className="font-display text-sm text-[#C9A96E]/40 tracking-[0.1em]">XURCUN</p>
          <p className="text-[10px] text-white/20 mt-1">
            {lang === "az" ? "Hər iki filialda xidmətinizdəyik" : lang === "tr" ? "Her iki şubede hizmetinizdeyiz" : lang === "ru" ? "Мы работаем в обоих филиалах" : "Serving you at both branches"}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}

import { Link } from "react-router";
import { Check } from "lucide-react";
import { trpc } from "@/providers/trpc";

const card = "bg-[#1d1915] border border-[#352d24] rounded-xl";

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className={card + " p-4"}>
      <div className="text-[10.5px] uppercase tracking-wider text-[#928876]">{label}</div>
      <div className="text-[30px] font-bold mt-1.5" style={{ fontFamily: "Rufolo, serif", color: "#ECE6DA" }}>{value}</div>
      {note && <div className="text-[10.5px] text-[#5bbd86] mt-1">{note}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const catsQ = trpc.menu.adminGetCategories.useQuery();
  const branchesQ = trpc.branch.getBranches.useQuery();

  const cats = (catsQ.data ?? []).filter((c) => (c as { menuType?: string }).menuType === "catalog");
  const productCount = cats.reduce((s, c) => s + ((c as { itemCount?: number }).itemCount ?? 0), 0);
  const branchCount = branchesQ.data?.length ?? 0;

  return (
    <div className="text-[#ECE6DA]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "Rufolo, serif" }}>İdarə paneli</h1>
        <p className="text-xs text-[#928876] mt-1">Xurcun · Fond of Quality</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <Stat label="Məhsullar" value={productCount} note={productCount === 0 ? "Kataloqdan əlavə edin" : undefined} />
        <Stat label="Kateqoriyalar" value={cats.length} />
        <Stat label="Mağazalar" value={branchCount} note="Bakı" />
        <Stat label="Dillər" value="5" note="AZ · RU · EN · TR · AR" />
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
        <div className={card + " overflow-hidden"}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2a241d]">
            <h3 className="text-[17px] font-semibold" style={{ fontFamily: "Rufolo, serif" }}>Kateqoriyalar</h3>
            <Link to="/admin/catalog" className="text-xs text-[#928876] hover:text-[#C2A05A]">Kataloq →</Link>
          </div>
          <table className="w-full text-[13px]">
            <tbody>
              {cats.length === 0 && (
                <tr><td className="px-5 py-6 text-xs text-[#928876]">Hələ katalog kateqoriyası yoxdur. Kataloq → + Yeni ilə başlayın.</td></tr>
              )}
              {cats.slice(0, 6).map((c) => (
                <tr key={(c as { id: number }).id} className="border-b border-[#221d17] last:border-0">
                  <td className="px-5 py-2.5 text-[#d7cfbe]">{(c as { titleAz: string }).titleAz}</td>
                  <td className="px-5 py-2.5 text-right text-[#928876]">{(c as { itemCount?: number }).itemCount ?? 0} məhsul</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={card + " overflow-hidden"}>
          <div className="px-5 py-3.5 border-b border-[#2a241d]">
            <h3 className="text-[17px] font-semibold" style={{ fontFamily: "Rufolo, serif" }}>Sistem vəziyyəti</h3>
          </div>
          <table className="w-full text-[13px]">
            <tbody>
              {[
                "Veritabanı (MySQL)",
                "Çoxdilli (5 dil + RTL)",
                "QR menyu sistemi",
                "SEO (11 mağaza şeması)",
              ].map((label) => (
                <tr key={label} className="border-b border-[#221d17] last:border-0">
                  <td className="px-5 py-2.5 text-[#d7cfbe]">{label}</td>
                  <td className="px-5 py-2.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[10.5px] px-2.5 py-1 rounded-full" style={{ background: "#16291f", color: "#5bbd86" }}><Check className="w-3 h-3" />Aktiv</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

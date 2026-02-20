"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function Footer() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";

  return (
    <footer className="bg-gray-800 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image src="/images/logo.svg" alt="Bazary" width={32} height={32} className="rounded-lg" />
              <span className="text-white font-bold text-lg">{t("common.siteName")}</span>
            </div>
            <p className="text-sm leading-relaxed">{t("footer.aboutText")}</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">{t("footer.links")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}`} className="hover:text-white transition-colors">
                  {t("nav.buySell")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}`} className="hover:text-white transition-colors">
                  {t("footer.help")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">{t("footer.contact")}</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: contact@bazary.mg</li>
              <li>Tel: +261 34 00 000 00</li>
              <li>Antananarivo, Madagascar</li>
            </ul>
            {/* Madagascar flag colors */}
            <div className="flex gap-1 mt-4">
              <div className="w-8 h-5 bg-white rounded-sm"></div>
              <div className="w-8 h-5 bg-secondary rounded-sm"></div>
              <div className="w-8 h-5 bg-accent rounded-sm"></div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; 2026 Bazary. {t("footer.rights")}.</p>
        </div>
      </div>
    </footer>
  );
}

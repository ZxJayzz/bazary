#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fpdf import FPDF
import os

W = 190  # content width

class PDF(FPDF):
    def __init__(self):
        super().__init__()
        self.set_auto_page_break(auto=True, margin=25)
        self.add_font("KR", "", "/Library/Fonts/Arial Unicode.ttf")
        self.f = "KR"

    def header(self):
        self.set_font(self.f, "", 9)
        self.set_text_color(180, 180, 180)
        self.cell(W, 8, "Bazary - Madagascar E-Commerce Legal Guide", new_x="LMARGIN", new_y="NEXT", align="R")
        self.set_draw_color(255, 111, 15)
        self.set_line_width(0.5)
        self.line(10, 14, 200, 14)
        self.ln(4)

    def footer(self):
        self.set_y(-20)
        self.set_font(self.f, "", 8)
        self.set_text_color(150, 150, 150)
        self.cell(W, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def h1(self, t):
        self.ln(3)
        self.set_font(self.f, "", 16)
        self.set_text_color(255, 111, 15)
        self.multi_cell(w=W, h=9, text=t)
        y = self.get_y() + 1
        self.set_draw_color(255, 111, 15)
        self.set_line_width(0.3)
        self.line(10, y, 200, y)
        self.ln(5)

    def h2(self, t):
        self.ln(2)
        self.set_font(self.f, "", 13)
        self.set_text_color(60, 60, 60)
        self.multi_cell(w=W, h=8, text=t)
        self.ln(2)

    def h3(self, t):
        self.ln(1)
        self.set_font(self.f, "", 11)
        self.set_text_color(255, 111, 15)
        self.multi_cell(w=W, h=7, text=t)
        self.ln(1)

    def kr(self, t):
        self.set_font(self.f, "", 10)
        self.set_text_color(51, 51, 51)
        self.multi_cell(w=W, h=6, text=t)
        self.ln(1)

    def fr(self, t):
        self.set_font(self.f, "", 10)
        self.set_text_color(110, 110, 110)
        self.multi_cell(w=W, h=6, text=t)
        self.ln(3)

    def item(self, k, f):
        self.set_font(self.f, "", 10)
        self.set_text_color(51, 51, 51)
        self.multi_cell(w=W, h=6, text=f"  \u2022  {k}")
        self.set_text_color(110, 110, 110)
        self.multi_cell(w=W, h=6, text=f"     {f}")
        self.ln(2)

    def warn(self, k, f):
        self.ln(2)
        self.set_font(self.f, "", 10)
        self.set_text_color(200, 50, 50)
        self.multi_cell(w=W, h=6, text=k)
        self.multi_cell(w=W, h=6, text=f)
        self.ln(2)

    def trow(self, cols, widths, hdr=False):
        if hdr:
            self.set_fill_color(255, 111, 15)
            self.set_text_color(255, 255, 255)
        else:
            self.set_fill_color(248, 248, 248)
            self.set_text_color(51, 51, 51)
        self.set_font(self.f, "", 9)
        for i, c in enumerate(cols):
            self.cell(widths[i], 8, c, border=1, fill=True, align="C" if hdr else "L")
        self.ln()


def main():
    pdf = PDF()
    pdf.alias_nb_pages()

    # COVER
    pdf.add_page()
    pdf.ln(35)
    pdf.set_font(pdf.f, "", 36)
    pdf.set_text_color(255, 111, 15)
    pdf.cell(W, 18, "BAZARY", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(5)
    pdf.set_font(pdf.f, "", 15)
    pdf.set_text_color(51, 51, 51)
    pdf.cell(W, 10, "\ub9c8\ub2e4\uac00\uc2a4\uce74\ub974 \uc911\uace0\uac70\ub798 \ud50c\ub7ab\ud3fc", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(W, 10, "Plateforme de Vente d'Occasion - Madagascar", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(8)
    pdf.set_draw_color(255, 111, 15)
    pdf.set_line_width(1)
    pdf.line(65, pdf.get_y(), 145, pdf.get_y())
    pdf.ln(8)
    pdf.set_font(pdf.f, "", 20)
    pdf.cell(W, 12, "\ubc95\ub960 \ubc0f \uaddc\uc81c \uac00\uc774\ub4dc", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font(pdf.f, "", 15)
    pdf.set_text_color(100, 100, 100)
    pdf.cell(W, 10, "Guide Juridique et R\u00e9glementaire", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(25)
    pdf.set_font(pdf.f, "", 11)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(W, 7, "\uc791\uc131\uc77c: 2026\ub144 2\uc6d4 22\uc77c | R\u00e9dig\u00e9 le : 22 f\u00e9vrier 2026", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(W, 7, "\ud55c\uad6d\uc5b4 / Fran\u00e7ais (\uc774\uc911 \uc5b8\uc5b4 / Bilingue)", new_x="LMARGIN", new_y="NEXT", align="C")

    # TOC
    pdf.add_page()
    pdf.h1("\ubaa9\ucc28 | Table des mati\u00e8res")
    toc = [
        ("1", "\uac1c\uc694 - \ub9c8\ub2e4\uac00\uc2a4\uce74\ub974 E-Commerce \ud604\ud669", "Aper\u00e7u - Situation du E-Commerce \u00e0 Madagascar"),
        ("2", "\uad00\ub828 \ubc95\ub960 \uc815\ub9ac", "Cadre Juridique Applicable"),
        ("3", "\uc0ac\uc5c5\uc790 \ub4f1\ub85d \uc694\uac74", "Conditions d'Enregistrement des Entreprises"),
        ("4", "\uc678\uad6d\uc778 \ud22c\uc790\uc790 \uc694\uac74", "Conditions pour les Investisseurs \u00c9trangers"),
        ("5", "\uc0ac\uc774\ud2b8 \uc6b4\uc601 \uc758\ubb34\uc0ac\ud56d", "Obligations li\u00e9es \u00e0 l'Exploitation du Site"),
        ("6", "\uc138\uae08 \ubc0f \uc7ac\uc815", "Fiscalit\u00e9 et Finances"),
        ("7", "\ub3c4\uba54\uc778 \ub4f1\ub85d \uc815\ubcf4", "Informations sur l'Enregistrement du Domaine"),
        ("8", "\ucd94\ucc9c \uc811\uadfc \uc804\ub7b5", "Strat\u00e9gie d'Approche Recommand\u00e9e"),
        ("9", "\ucd9c\ucc98 \ubc0f \ucc38\uace0\uc790\ub8cc", "Sources et R\u00e9f\u00e9rences"),
    ]
    for n, k, f in toc:
        pdf.set_font(pdf.f, "", 11)
        pdf.set_text_color(51, 51, 51)
        pdf.multi_cell(w=W, h=7, text=f"{n}. {k}")
        pdf.set_font(pdf.f, "", 10)
        pdf.set_text_color(120, 120, 120)
        pdf.multi_cell(w=W, h=6, text=f"    {f}")
        pdf.ln(2)

    # SEC 1
    pdf.add_page()
    pdf.h1("1. \uac1c\uc694 - \ub9c8\ub2e4\uac00\uc2a4\uce74\ub974 E-Commerce \ud604\ud669")
    pdf.h2("    Aper\u00e7u - Situation du E-Commerce \u00e0 Madagascar")
    pdf.kr("\ub9c8\ub2e4\uac00\uc2a4\uce74\ub974\uc758 \uc804\uc790\uc0c1\uac70\ub798\ub294 \uc544\uc9c1 \ucd08\uae30 \ub2e8\uacc4\uc5d0 \uc788\uc2b5\ub2c8\ub2e4. \uc628\ub77c\uc778 \uac70\ub798\uc758 78%\uac00 Facebook\uc744 \ud1b5\ud574 \uc774\ub8e8\uc5b4\uc9c0\uace0 \uc788\uc73c\uba70(\uc57d 200\ub9cc \uc0ac\uc6a9\uc790, 2020\ub144 \uae30\uc900), \uc804\ubb38 \uc804\uc790\uc0c1\uac70\ub798 \ud50c\ub7ab\ud3fc\uc740 \ub9e4\uc6b0 \uc81c\ud55c\uc801\uc785\ub2c8\ub2e4. \ubc95\uc801 \ud2c0\uc740 2014\ub144\ubd80\ud130 \ub9c8\ub828\ub418\uc5b4 \uc788\uc73c\ub098, \uc2dc\ud589\ub839\uc774 \ubbf8\ube44\ud558\uc5ec \uc2e4\uc9c8\uc801 \uaddc\uc81c \uc9d1\ud589\uc740 \ub290\uc2a8\ud55c \ud3b8\uc785\ub2c8\ub2e4.")
    pdf.fr("Le commerce \u00e9lectronique \u00e0 Madagascar en est encore \u00e0 ses d\u00e9buts. 78% des achats en ligne se font via Facebook (environ 2 millions d'utilisateurs, 2020), et les plateformes d\u00e9di\u00e9es sont tr\u00e8s limit\u00e9es. Le cadre juridique existe depuis 2014, mais l'absence de d\u00e9crets d'application rend l'application plut\u00f4t souple.")
    pdf.h2("\uaddc\uc81c \uae30\uad00 | Autorit\u00e9s R\u00e9gulatrices")
    pdf.item("MICC (\uc0c1\uacf5\uc0b0\uc5c5\uc18c\ube44\ubd80) - \uc804\uc790\uc0c1\uac70\ub798 \uad00\ub9ac \ucd1d\uad04",
             "MICC (Minist\u00e8re du Commerce) - Supervision g\u00e9n\u00e9rale du e-commerce")
    pdf.item("ARTEC (\uc804\uc790\ud1b5\uc2e0\uaddc\uc81c\uc704\uc6d0\ud68c) - \ub370\uc774\ud130 \ubcf4\ud638, \uc18c\ube44\uc790 \uad8c\ub9ac \uac10\ub3c5",
             "ARTEC - Protection des donn\u00e9es, droits des consommateurs")

    # SEC 2
    pdf.add_page()
    pdf.h1("2. \uad00\ub828 \ubc95\ub960 \uc815\ub9ac | Cadre Juridique Applicable")
    laws = [
        ("Loi n\u00b02014-024", "\uc804\uc790\uac70\ub798\ubc95 (2014.12.10) - \uc804\uc790\uc0c1\uac70\ub798\uc758 \uae30\ubcf8\ubc95. \uc628\ub77c\uc778 \uac70\ub798\uc758 \uc815\uc758, \uc870\uac74, \uad8c\ub9ac\uc640 \uc758\ubb34\ub97c \uaddc\uc815",
         "Loi sur les transactions \u00e9lectroniques (10/12/2014) - Loi fondamentale du e-commerce."),
        ("Loi n\u00b02014-006", "\uc0ac\uc774\ubc84\ubc94\uc8c4 \ubc29\uc9c0\ubc95 (2014.07.19) - \uc628\ub77c\uc778 \uc0ac\uae30, \ud574\ud0b9, \ubd88\ubc95 \uc811\uadfc \ub4f1 \ucc98\ubc8c \uaddc\uc815",
         "Loi sur la cybercriminalit\u00e9 (19/07/2014) - Fraude en ligne, piratage, acc\u00e8s ill\u00e9gal."),
        ("Loi n\u00b02014-025", "\uc804\uc790\uc11c\uba85\ubc95 (2014.12.10) - \uc804\uc790\uc11c\uba85\uc758 \ubc95\uc801 \ud6a8\ub825\uacfc \uc0ac\uc6a9 \uc870\uac74",
         "Loi sur la signature \u00e9lectronique (10/12/2014)."),
        ("Loi n\u00b02014-026", "\ud589\uc815\uc808\ucc28 \ub514\uc9c0\ud138\ud654\ubc95 (2014.11.05) - \ud589\uc815 \uc808\ucc28\uc758 \uc804\uc790\ud654 \uc6d0\uce59",
         "Loi sur la d\u00e9mat\u00e9rialisation des proc\u00e9dures administratives (05/11/2014)."),
        ("Loi n\u00b02014-038", "\uac1c\uc778\uc815\ubcf4 \ubcf4\ud638\ubc95 (2015.01.09) - \uac1c\uc778 \ub370\uc774\ud130 \ucc98\ub9ac\uc758 \ubc94\uc704, \uc81c\ud55c, \ucc45\uc784 \uaddc\uc815",
         "Loi sur la protection des donn\u00e9es personnelles (09/01/2015)."),
        ("Loi n\u00b02015-014", "\uc18c\ube44\uc790 \ubcf4\ud638\ubc95 (2015.08.10) - \uc18c\ube44\uc790 \ubcf4\ud638 \ubc0f \ubcf4\uc99d. \uc804\uc790\uc0c1\uac70\ub798\uc5d0\ub3c4 \uc801\uc6a9",
         "Loi sur les garanties et la protection des consommateurs (10/08/2015)."),
    ]
    for name, k, f in laws:
        pdf.h3(name)
        pdf.kr(k)
        pdf.fr(f)
    pdf.warn(
        "\u26a0 \uc8fc\uc758: \ubc95\ub960\uc740 \uc874\uc7ac\ud558\ub098 \uc2dc\ud589\ub839(d\u00e9cret d'application)\uc774 \uc544\uc9c1 \ubbf8\ube44\ud558\uc5ec \uc2e4\uc9c8\uc801 \uc9d1\ud589\uc774 \ubd80\uc871\ud569\ub2c8\ub2e4.",
        "\u26a0 Attention : Les d\u00e9crets d'application sont encore en attente.")

    # SEC 3
    pdf.add_page()
    pdf.h1("3. \uc0ac\uc5c5\uc790 \ub4f1\ub85d \uc694\uac74 | Conditions d'Enregistrement")
    pdf.h2("\ud544\uc218 \ub4f1\ub85d \ud56d\ubaa9 | \u00c9l\u00e9ments Obligatoires")
    regs = [
        ("NIF (Num\u00e9ro d'Identification Fiscale)", "\uc138\uae08\uc2dd\ubcc4\ubc88\ud638 - \ubaa8\ub4e0 \uc0ac\uc5c5\uccb4 \ud544\uc218. \uccad\uad6c\uc11c\uc640 \uc138\uae08\uc2e0\uace0\uc5d0 \uc0ac\uc6a9",
         "Obligatoire pour toute entreprise. Utilis\u00e9 sur factures et d\u00e9clarations fiscales."),
        ("RCS (Registre du Commerce)", "\uc0c1\uc5c5\ub4f1\uae30\ubd80 \ub4f1\ub85d - \uc0c1\uc5c5\ud65c\ub3d9\uc744 \uc704\ud55c \uacf5\uc2dd \ub4f1\ub85d",
         "Enregistrement officiel pour les activit\u00e9s commerciales."),
        ("EDBM", "\uacbd\uc81c\uac1c\ubc1c\uc704\uc6d0\ud68c - \uc0ac\uc5c5\uc790 \ub4f1\ub85d \ucc98\ub9ac \uae30\uad00 (Antaninarenina, Antananarivo)",
         "Economic Development Board of Madagascar - Organisme d'enregistrement."),
        ("INSTAT", "\ud1b5\uacc4\uccad \ub4f1\ub85d - \ud1b5\uacc4 \ubaa9\uc801",
         "Institut National de la Statistique - Enregistrement statistique."),
    ]
    for name, k, f in regs:
        pdf.h3(name)
        pdf.kr(k)
        pdf.fr(f)

    pdf.h2("\ud68c\uc0ac \ud615\ud0dc | Formes Juridiques")
    pdf.item("Entreprise Individuelle (\uac1c\uc778\uc0ac\uc5c5\uc790) - \uc18c\uaddc\ubaa8, \uc124\ub9bd \uac04\ud3b8",
             "Adapt\u00e9e aux petites entreprises. Cr\u00e9ation simple.")
    pdf.item("SARL (\uc720\ud55c\ud68c\uc0ac) - \uc911\uaddc\ubaa8, \ucc45\uc784 \uc81c\ud55c",
             "Soci\u00e9t\u00e9 \u00e0 Responsabilit\u00e9 Limit\u00e9e.")
    pdf.item("SA (\uc8fc\uc2dd\ud68c\uc0ac) - \ub300\uaddc\ubaa8, \uc8fc\uc2dd \ubc1c\ud589 \uac00\ub2a5",
             "Soci\u00e9t\u00e9 Anonyme - \u00c9mission d'actions possible.")
    pdf.kr("\uc628\ub77c\uc778 \ub4f1\ub85d: \uc815\ubd80 Orinasa \ud50c\ub7ab\ud3fc, \ucd5c\uc885 \ud655\uc778 EDBM. \uc18c\uc694 \uae30\uac04: \uc57d 3\uc8fc")
    pdf.fr("Enregistrement via Orinasa. Validation \u00e0 l'EDBM. D\u00e9lai : ~3 semaines.")

    # SEC 4
    pdf.add_page()
    pdf.h1("4. \uc678\uad6d\uc778 \ud22c\uc790\uc790 \uc694\uac74 | Investisseurs \u00c9trangers")
    pdf.h2("\uc678\uad6d\uc778 \uc9c0\ubd84 100% \ud5c8\uc6a9")
    pdf.kr("\ubaa8\ub4e0 \ud68c\uc0ac \ud615\ud0dc\uc5d0\uc11c 100% \uc678\uad6d\uc778 \uc18c\uc720 \uac00\ub2a5. \uc218\uc775 \uc1a1\uae08\uc5d0\ub3c4 \uae08\uc561 \uc81c\ud55c \uc5c6\uc74c.")
    pdf.fr("Participation \u00e9trang\u00e8re \u00e0 100% autoris\u00e9e. Aucune limite sur le rapatriement des revenus.")
    pdf.h2("\ud604\uc9c0 \ub300\ud45c \ud544\uc694 | Repr\u00e9sentant Local")
    pdf.kr("\ub9c8\ub2e4\uac00\uc2a4\uce74\ub974 \uac70\uc8fc\uc790 1\uba85 \ud544\uc694 (\uc9c0\ubd84 \ubd88\ud544\uc694). \ub9c8\ub2e4\uac00\uc2a4\uce74\ub974 \uad6d\uc801 \ub610\ub294 \uac70\uc8fc \uc678\uad6d\uc778 \uac00\ub2a5.")
    pdf.fr("Un r\u00e9sident requis (sans parts). Malgache ou \u00e9tranger r\u00e9sident.")
    pdf.h2("\ud544\uc694 \uc11c\ub958 | Documents Requis")
    pdf.item("\uc5ec\uad8c \uc0ac\ubcf8 + \uc7a5\uae30\ube44\uc790", "Copie du passeport + visa long s\u00e9jour")
    pdf.item("\ubaa8\ud68c\uc0ac RCS \ucd94\ucd9c\ubcf8 (3\uac1c\uc6d4 \uc774\ub0b4, \ubd88\uc5b4)", "Extrait RCS < 3 mois, version fran\u00e7aise")
    pdf.item("\ud604\uc9c0 \ub4f1\ub85d \uc8fc\uc18c (\uc784\ub300 \uac00\ub2a5)", "Adresse locale (location possible)")

    # SEC 5
    pdf.add_page()
    pdf.h1("5. \uc0ac\uc774\ud2b8 \uc6b4\uc601 \uc758\ubb34\uc0ac\ud56d | Obligations du Site")
    obls = [
        ("\ubcf4\uc548 \uc6f9\uc0ac\uc774\ud2b8 \ud544\uc218 (HTTPS/SSL)", "Site s\u00e9curis\u00e9 obligatoire (HTTPS/SSL)"),
        ("\ud310\ub9e4\uc790-\uad6c\ub9e4\uc790 \uac04 \uc11c\uba74 \ub3d9\uc758 \uc808\ucc28", "Accord \u00e9crit vendeur-acheteur requis"),
        ("\uace0\uac1d \ubcf4\ud638 \uc11c\uc57d \uc758\ubb34", "Engagement de protection des clients"),
        ("\uac1c\uc778\uc815\ubcf4 \ucc98\ub9ac \uaddc\uc815 \uc900\uc218 (Loi 2014-038)", "Conformit\u00e9 protection des donn\u00e9es"),
        ("\uc2e0\uc6a9\uce74\ub4dc \uacb0\uc81c \uc2dc 24\uc2dc\uac04 \uc740\ud589 \uc2b9\uc778 \ud504\ub85c\uc138\uc2a4", "Approbation bancaire 24h/24 pour carte"),
        ("2025\ub144\ubd80\ud130 \uc804\uc790 \uccad\uad6c\uc11c(e-invoicing) \uc758\ubb34\ud654 \ucd94\uc9c4", "E-invoicing obligatoire en cours depuis 2025"),
    ]
    for k, f in obls:
        pdf.item(k, f)

    pdf.h2("\uccad\uad6c\uc11c \ud544\uc218 \ud3ec\ud568 | \u00c9l\u00e9ments sur Factures")
    inv = [
        ("NIF (\uc138\uae08\uc2dd\ubcc4\ubc88\ud638)", "NIF"),
        ("\uc0ac\uc5c5\uc790\uba85/\uc8fc\uc18c", "Nom/adresse entreprise"),
        ("\uace0\uac1d\uba85/\uc8fc\uc18c", "Nom/adresse client"),
        ("\uccad\uad6c\uc11c \ubc88\ud638, \ub0a0\uc9dc", "N\u00b0 facture, date"),
        ("\uc0c1\ud488 \uc124\uba85, \ub2e8\uac00, \ucd1d\uc561", "Description, prix, total"),
        ("VAT \uad6c\uc131\uc694\uc18c (\ud574\ub2f9 \uc2dc)", "TVA (le cas \u00e9ch\u00e9ant)"),
    ]
    for k, f in inv:
        pdf.item(k, f)

    # SEC 6
    pdf.add_page()
    pdf.h1("6. \uc138\uae08 \ubc0f \uc7ac\uc815 | Fiscalit\u00e9 et Finances")
    pdf.h2("\uc138\uae08 \uccb4\uacc4 | R\u00e9gime Fiscal")
    pdf.kr("\ub9e4\ucd9c 1\uc5b5 MGA \ubbf8\ub9cc (~$22,000):")
    pdf.kr("- \uc77c\ubc18 \uc18c\ub4dd\uc138 (IR) \ub610\ub294 \uac04\uc774\uacfc\uc138 (Imp\u00f4t Synth\u00e9tique) \uc120\ud0dd \uac00\ub2a5")
    pdf.fr("CA < 100M MGA : Choix entre IR ou Imp\u00f4t Synth\u00e9tique")
    pdf.kr("\ub9e4\ucd9c 1\uc5b5 MGA \uc774\uc0c1:")
    pdf.kr("- \uc77c\ubc18 \uc18c\ub4dd\uc138 (IR) \uc758\ubb34 \uc801\uc6a9")
    pdf.fr("CA > 100M MGA : R\u00e9gime normal IR obligatoire")
    pdf.h2("VAT (\ubd80\uac00\uac00\uce58\uc138) | TVA")
    pdf.kr("\uc911\uace0\uac70\ub798 \ud50c\ub7ab\ud3fc\uc758 \uacbd\uc6b0, \ud50c\ub7ab\ud3fc \uc218\uc218\ub8cc(\uc911\uac1c \uc218\uc218\ub8cc)\uc5d0 \ub300\ud574 VAT\uac00 \uc801\uc6a9\ub420 \uc218 \uc788\uc2b5\ub2c8\ub2e4.")
    pdf.fr("La TVA peut s'appliquer aux frais de commission de la plateforme.")

    # SEC 7
    pdf.add_page()
    pdf.h1("7. \ub3c4\uba54\uc778 \ub4f1\ub85d \uc815\ubcf4 | Domaine")
    pdf.kr("bazary.mg \ub3c4\uba54\uc778 \ud655\uc778 \uacb0\uacfc: \ud604\uc7ac \ubbf8\ub4f1\ub85d, \uad6c\ub9e4 \uac00\ub2a5!")
    pdf.fr("bazary.mg : Non enregistr\u00e9, disponible \u00e0 l'achat!")
    pdf.kr("\ub4f1\ub85d \uc870\uac74: \ub204\uad6c\ub098 \uac00\ub2a5(\uad6d\uc801 \ubb34\uad00), 2~63\uc790, 1~5\ub144 \ub2e8\uc704")
    pdf.fr("Ouvert \u00e0 tous, 2-63 caract\u00e8res, 1-5 ans")
    pdf.h2("\uac00\uaca9 \ube44\uad50 | Comparaison des Prix")
    cw = [48, 48, 48, 46]
    pdf.trow(["Registraire", "Enregistrement", "Renouvellement", "Note"], cw, hdr=True)
    pdf.trow(["Gandi.net", "\u20ac90/an (~$97)", "\u20ac180/an (~$194)", "Recommand\u00e9"], cw)
    pdf.trow(["DomainTyper", "$122~/an", "-", ""], cw)
    pdf.trow(["INWX", "\u20ac126/an (~$136)", "-", "Allemagne"], cw)
    pdf.trow(["OVHcloud", "$130/an", "-", "France"], cw)

    # SEC 8
    pdf.add_page()
    pdf.h1("8. \ucd94\ucc9c \uc811\uadfc \uc804\ub7b5 | Strat\u00e9gie Recommand\u00e9e")
    stages = [
        ("1\ub2e8\uacc4 - \ud14c\uc2a4\ud2b8 \ub7f0\uce6d | \u00c9tape 1 - Test",
         "\uc0ac\uc5c5\uc790 \ub4f1\ub85d \uc5c6\uc774 \uc0ac\uc774\ud2b8 \ub7f0\uce6d, \uc720\uc800 \ubc18\uc751 \ud655\uc778. Facebook 78% \uc2dc\uc7a5\uc5d0\uc11c \uc804\ubb38 \ud50c\ub7ab\ud3fc \uc218\uc694 \uac80\uc99d. Vercel \ubb34\ub8cc + MongoDB Atlas \ubb34\ub8cc.",
         "Lancer sans enregistrement. V\u00e9rifier la demande. Vercel gratuit + MongoDB Atlas gratuit."),
        ("2\ub2e8\uacc4 - \uc815\uc2dd\ud654 | \u00c9tape 2 - Formalisation",
         "\uc720\uc800 \ud655\ubcf4 \ud6c4 Entreprise Individuelle \ub610\ub294 SARL \ub4f1\ub85d. NIF \ucde8\ub4dd \ubc0f \uc138\uae08 \uccb4\uacc4 \uad6c\ucd95.",
         "Enregistrer EI ou SARL. Obtenir NIF. Syst\u00e8me fiscal."),
        ("3\ub2e8\uacc4 - \ud655\uc7a5 | \u00c9tape 3 - Expansion",
         "\uc218\uc775 \ubaa8\ub378 \uad6c\uccb4\ud654 (\ud504\ub9ac\ubbf8\uc5c4, \ud504\ub85c\ubaa8\uc158). \ud638\uc2a4\ud305 \uc5c5\uadf8\ub808\uc774\ub4dc. bazary.mg \ub3c4\uba54\uc778 \ub4f1\ub85d.",
         "Mod\u00e8le de revenus. Mise \u00e0 niveau h\u00e9bergement. Domaine bazary.mg."),
    ]
    for t, k, f in stages:
        pdf.h2(t)
        pdf.kr(k)
        pdf.fr(f)

    # SEC 9
    pdf.add_page()
    pdf.h1("9. \ucd9c\ucc98 \ubc0f \ucc38\uace0\uc790\ub8cc | Sources et R\u00e9f\u00e9rences")

    cats = [
        ("\ubc95\ub960 | Juridique", [
            "Loi n\u00b02014-024 sur les transactions \u00e9lectroniques\n  https://www.assemblee-nationale.mg",
            "Loi n\u00b02014-006 sur la cybercriminalit\u00e9",
            "Loi n\u00b02014-038 sur la protection des donn\u00e9es personnelles",
            "Loi n\u00b02015-014 sur la protection des consommateurs",
        ]),
        ("\uacf5\uc2dd \uae30\uad00 | Officiels", [
            "U.S. Trade Gov - Madagascar eCommerce\n  https://www.trade.gov/country-commercial-guides/madagascar-ecommerce",
            "EDBM - https://edbm.mg",
            "NIC.mg - https://www.nic.mg",
        ]),
        ("\uc0ac\uc5c5 \ub4f1\ub85d | Enregistrement", [
            "Madagascar Invest\n  https://madagascarinvest.com/company-registration/",
            "Africa2Trust\n  https://www.africa2trust.com/how-to-start-a-business/?l=1&c=41",
            "Deel - Sole Proprietorship\n  https://www.deel.com/blog/sole-proprietorship-madagascar/",
        ]),
        ("\uc138\uae08 | Fiscalit\u00e9", [
            "Madagascar Services - Tax 2024\n  https://www.madagascar-services.com/blog/en/2024/09/16/key-changes-to-tax-procedures-in-madagascar-in-2024/",
            "TaxDo - NIF Guide\n  https://taxdo.com/resources/global-tax-id-validation-guide/madagascar",
        ]),
        ("\ub3c4\uba54\uc778 | Domaine", [
            "Gandi.net - https://www.gandi.net/en/domain/tld/mg",
            "OVHcloud - https://www.ovhcloud.com/en/domains/tld/mg/",
            "INWX - https://www.inwx.com/en/mg-domain",
        ]),
        ("\uae30\ud0c0 | Autres", [
            "Generis Online - E-Commerce Regulations Madagascar\n  https://generisonline.com/understanding-internet-and-e-commerce-regulations-in-madagascar/",
            "L'Express de Madagascar\n  https://lexpress.mg/16/02/2023/commerce-electronique",
            "Madagascar Television\n  https://matv.mg/commerce-electronique-renforcement-du-cadre-juridique/",
        ]),
    ]

    for cat, items in cats:
        pdf.h2(cat)
        for s in items:
            pdf.set_font(pdf.f, "", 9)
            pdf.set_text_color(80, 80, 80)
            pdf.multi_cell(w=W, h=5, text=f"  \u2022  {s}")
            pdf.ln(2)

    pdf.ln(8)
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(4)
    pdf.set_font(pdf.f, "", 8)
    pdf.set_text_color(150, 150, 150)
    pdf.multi_cell(w=W, h=5, text="\uba74\ucc45\uc0ac\ud56d: \ubcf8 \ubb38\uc11c\ub294 \uc815\ubcf4 \uc81c\uacf5 \ubaa9\uc801\uc73c\ub85c \uc791\uc131\ub418\uc5c8\uc73c\uba70, \ubc95\ub960 \uc790\ubb38\uc744 \ub300\uccb4\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4. \uc2e4\uc81c \uc0ac\uc5c5 \uc9c4\ud589 \uc2dc \ud604\uc9c0 \ubc95\ub960 \uc804\ubb38\uac00\uc640 \uc0c1\ub2f4\ud558\uc2dc\uae30 \ubc14\ub78d\ub2c8\ub2e4.")
    pdf.multi_cell(w=W, h=5, text="Avertissement : Document informatif, ne remplace pas un conseil juridique professionnel.")

    out = os.path.join("/Users/joonkim/\uc790\ub3d9\ucc28 \ubd80\ud488 \uac70\ub798 \uc0ac\uc774\ud2b8", "bazary", "Bazary_Legal_Guide_KR_FR.pdf")
    pdf.output(out)
    print(f"PDF saved: {out}")
    print(f"Pages: {pdf.pages_count}")

if __name__ == "__main__":
    main()

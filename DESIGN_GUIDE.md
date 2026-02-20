# Bazary Design Guide

> Design system et guide UX pour la plateforme Bazary - Marketplace Madagascar
> Reference UX : Daangn (Karrot) - https://www.daangn.com

---

## 1. Palette de couleurs

### Couleurs principales

| Nom             | HEX       | Usage                                      |
| --------------- | --------- | ------------------------------------------ |
| **Primary**     | `#FF6F0F` | Boutons CTA, accents, logo, liens actifs   |
| **Primary Hover** | `#E5630D` | Hover sur boutons primaires               |
| **Accent**      | `#007E3A` | Succes, validation, badges "Disponible"    |
| **Accent Hover** | `#006B31` | Hover sur elements accent                 |
| **Secondary**   | `#FC3D32` | Alertes, erreurs, badge "Vendu", coeur     |

### Couleurs neutres (Gris)

| Nom        | HEX       | Usage                                  |
| ---------- | --------- | -------------------------------------- |
| Gray 50    | `#F8F9FA` | Fond de page, arriere-plans subtils    |
| Gray 100   | `#F1F3F5` | Fond de sections, cartes inactives     |
| Gray 200   | `#E9ECEF` | Bordures, separateurs                  |
| Gray 300   | `#DEE2E6` | Bordures de champs de formulaire       |
| Gray 400   | `#ADB5BD` | Texte placeholder, icones inactives    |
| Gray 500   | `#868E96` | Texte secondaire, metadonnees          |
| Gray 600   | `#495057` | Texte de corps, labels                 |
| Gray 700   | `#343A40` | Texte important                        |
| Gray 800   | `#212529` | Titres, texte fort                     |

### Couleurs fonctionnelles

| Contexte          | Fond          | Bordure        | Texte         |
| ----------------- | ------------- | -------------- | ------------- |
| Succes            | `bg-green-50` | `border-green-200` | `text-green-700` |
| Erreur            | `bg-red-50`   | `border-red-200`   | `text-red-600`   |
| Avertissement     | `bg-orange-50`| `border-orange-100`| `text-orange-800`|
| Info              | `bg-blue-50`  | `border-blue-200`  | `text-blue-700`  |

---

## 2. Typographie

- **Police principale** : Geist Sans (via `next/font/google`)
- **Fallback** : Arial, Helvetica, sans-serif
- **Anti-aliasing** : `antialiased` (Tailwind)

### Echelle typographique

| Element           | Classe Tailwind                      | Usage                    |
| ----------------- | ------------------------------------ | ------------------------ |
| H1 (hero)         | `text-4xl md:text-5xl font-extrabold`| Page d'accueil hero      |
| H1 (page)         | `text-3xl font-bold`                 | Titres de pages          |
| H2 (section)      | `text-2xl font-bold`                 | Titres de sections       |
| H3 (card)         | `text-lg font-semibold`              | Sous-titres, titres card |
| Body              | `text-sm text-gray-600`              | Texte de corps           |
| Caption           | `text-xs text-gray-500`              | Metadonnees, timestamps  |
| Prix              | `text-base font-bold text-gray-900`  | Affichage prix           |
| Bouton            | `text-sm font-medium`                | Texte de boutons         |

---

## 3. Composants de base

### 3.1 Boutons

```
// Bouton principal (CTA)
className="px-3.5 py-1.5 bg-primary text-white text-sm font-medium rounded-lg
           hover:bg-primary-hover transition-colors"

// Bouton principal large
className="w-full py-3 bg-primary text-white font-medium rounded-xl
           hover:bg-primary-hover transition-colors text-sm"

// Bouton secondaire (outline)
className="px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg
           hover:bg-gray-50 transition-colors"

// Bouton danger
className="px-2 py-1 text-xs text-red-500 border border-red-200 rounded-md
           hover:bg-red-50"

// Bouton avec icone
className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white
           text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors"
```

### 3.2 Champs de formulaire

```
// Input standard
className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"

// Select
className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"

// Textarea
className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
           focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
```

### 3.3 Cartes

```
// Carte produit
className="group block bg-white rounded-xl overflow-hidden border border-gray-200
           hover:shadow-lg hover:border-gray-300 transition-all duration-200"

// Carte contenu (profil, formulaire)
className="bg-white rounded-2xl border border-gray-200 p-6"

// Carte info (alerte)
className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700"
```

### 3.4 Badges

```
// Badge disponible
className="bg-accent text-white px-2 py-0.5 rounded-md text-xs font-medium"

// Badge reserve
className="bg-yellow-500 text-white px-2 py-0.5 rounded-md text-xs font-medium"

// Badge vendu
className="bg-gray-500 text-white px-2 py-0.5 rounded-md text-xs font-medium"
```

---

## 4. Analyse UX Daangn - Chat UI

### 4.1 Architecture du chat (reference Daangn/Karrot)

L'interface de chat Daangn suit un pattern split-view classique avec quelques specificites notables :

#### Layout general

```
+----------------------------------------------------------+
| Navbar (sticky top)                                       |
+----------------------------------------------------------+
|                    |                                       |
|  Liste des         |  Zone de messages                     |
|  conversations     |                                       |
|  (320px)           |  +-------------------------------+   |
|                    |  | Header: Avatar + Nom + Statut  |   |
|  +--------------+  |  +-------------------------------+   |
|  | Conversation |  |  |                               |   |
|  | active       |  |  | Message recu (gris, gauche)   |   |
|  +--------------+  |  |                               |   |
|  | Conversation |  |  |   Message envoye (orange,     |   |
|  |              |  |  |          droite)               |   |
|  +--------------+  |  |                               |   |
|  | Conversation |  |  | Message recu (gris, gauche)   |   |
|  |              |  |  |                               |   |
|  +--------------+  |  +-------------------------------+   |
|                    |  | Input: [Message...] [Envoyer]  |   |
|                    |  +-------------------------------+   |
+----------------------------------------------------------+
```

#### Liste des conversations (panneau gauche)

```
+---------------------------------------------------+
|  Conversations                      [Tout | Non lu]|
+---------------------------------------------------+
|  +----------------------------------------------+ |
|  | [Avatar 40px]  NomUtilisateur     14:32      | |
|  |                Dernier message...  [Badge 2]  | |
|  |                [Miniature produit 48x48]      | |
|  +----------------------------------------------+ |
|  | [Avatar 40px]  NomUtilisateur     Hier       | |
|  |                Dernier message...             | |
|  |                [Miniature produit 48x48]      | |
|  +----------------------------------------------+ |
+---------------------------------------------------+
```

**Specifications :**
- Largeur panneau : `w-80` (320px) en desktop, plein ecran en mobile
- Avatar : `w-10 h-10 rounded-full` avec initiale si pas de photo
- Nom : `text-sm font-medium text-gray-800`
- Dernier message : `text-xs text-gray-500 line-clamp-1`
- Timestamp : `text-xs text-gray-400`
- Badge non lu : `w-5 h-5 bg-primary rounded-full text-white text-xs flex items-center justify-center`
- Conversation active : `bg-orange-50 border-l-2 border-primary`
- Miniature produit : `w-12 h-12 rounded-lg object-cover` dans chaque conversation
- Hover : `hover:bg-gray-50 transition-colors`

#### Zone de messages (panneau droit)

```
+------------------------------------------------------+
|  [<] NomUtilisateur              [Signaler] [...]    |
|  En ligne / Hors ligne                                |
+------------------------------------------------------+
|  +--------------------------------------------------+|
|  | [Carte produit integree]                          ||
|  | [Image 60x60] Titre - 150 000 Ar  [Voir]         ||
|  +--------------------------------------------------+|
|                                                       |
|     [Bulle grise - message recu]        14:30         |
|                                                       |
|                  [Bulle orange - message envoye] 14:32 |
|                                            ✓✓ Lu      |
|                                                       |
|     [Bulle grise - message recu]        14:35         |
|                                                       |
+------------------------------------------------------+
| [+] [                Message...              ] [>]    |
+------------------------------------------------------+
```

**Specifications des bulles de messages :**

```
// Message recu (gauche)
className="max-w-[70%] bg-gray-100 rounded-2xl rounded-bl-md px-4 py-2.5
           text-sm text-gray-800"

// Message envoye (droite)
className="max-w-[70%] bg-primary text-white rounded-2xl rounded-br-md px-4 py-2.5
           text-sm ml-auto"

// Timestamp sous le message
className="text-xs text-gray-400 mt-1"

// Indicateur de lecture (double check)
className="text-xs text-primary"  // Lu
className="text-xs text-gray-400" // Envoye mais pas lu
```

**Header de conversation :**
```
// Container header
className="px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between"

// Info utilisateur
className="flex items-center gap-3"

// Statut en ligne
className="w-2.5 h-2.5 bg-accent rounded-full" // en ligne
className="w-2.5 h-2.5 bg-gray-300 rounded-full" // hors ligne
```

**Barre d'envoi :**
```
// Container
className="px-4 py-3 bg-white border-t border-gray-200 flex items-center gap-2"

// Bouton "+"  (photo/fichier)
className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
           text-gray-500 hover:bg-gray-200 transition-colors shrink-0"

// Input message
className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm
           focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20
           border border-transparent focus:border-primary"

// Bouton envoyer
className="w-9 h-9 rounded-full bg-primary flex items-center justify-center
           text-white hover:bg-primary-hover transition-colors shrink-0
           disabled:opacity-40 disabled:cursor-not-allowed"
```

**Carte produit en haut de conversation :**
```
// Container carte produit dans le chat
className="mx-4 mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200
           flex items-center gap-3 hover:bg-gray-100 transition-colors cursor-pointer"

// Image produit
className="w-14 h-14 rounded-lg object-cover shrink-0"

// Info produit
className="flex-1 min-w-0"
// Titre: text-sm font-medium text-gray-800 line-clamp-1
// Prix: text-sm font-bold text-gray-900
// Statut: text-xs (couleur selon statut)
```

#### Mobile responsive

```
// Mobile : navigation entre liste et conversation
// - Liste conversations = ecran entier
// - Clic sur conversation = slide vers zone messages
// - Bouton retour (<) pour revenir a la liste

// Breakpoint
// < md (768px) : vue unique (liste OU conversation)
// >= md : split-view (liste + conversation)
```

---

## 5. Analyse UX Daangn - Upload d'images

### 5.1 Composant d'upload

#### Layout du composant

```
+--------------------------------------------------------------+
|  Photos (max 5)                                               |
+--------------------------------------------------------------+
|                                                               |
|  +----------+  +----------+  +----------+  +----------+      |
|  |          |  |          |  |          |  |          |      |
|  |   + Add  |  | [Image1] |  | [Image2] |  | [Image3] |      |
|  |  Photo   |  |    [X]   |  |    [X]   |  |    [X]   |      |
|  |          |  | ★ Cover  |  |          |  |          |      |
|  +----------+  +----------+  +----------+  +----------+      |
|                                                               |
|  Glissez-deposez vos images ou cliquez pour parcourir        |
|  JPG, PNG, WebP - max 5MB par image                           |
+--------------------------------------------------------------+
```

#### Specifications du composant

```
// Container principal
className="space-y-3"

// Label
className="block text-sm font-medium text-gray-700 mb-1"
// Texte: "Photos (max 5)" / "Sary (5 farafahabetsany)"

// Zone de drop (quand 0 images)
className="border-2 border-dashed border-gray-300 rounded-xl p-8
           text-center hover:border-primary hover:bg-orange-50/30
           transition-all cursor-pointer"
// Active drop:
className="border-2 border-dashed border-primary rounded-xl p-8
           text-center bg-orange-50/50"

// Grille de previews
className="grid grid-cols-5 gap-3"
// Mobile: "grid grid-cols-3 gap-2"

// Bouton "Ajouter" (premier slot)
className="aspect-square rounded-xl border-2 border-dashed border-gray-300
           flex flex-col items-center justify-center gap-2 cursor-pointer
           hover:border-primary hover:bg-orange-50/30 transition-all"
// Icone: w-6 h-6 text-gray-400
// Texte: text-xs text-gray-500

// Preview image
className="relative aspect-square rounded-xl overflow-hidden border border-gray-200
           group"

// Image dans preview
className="w-full h-full object-cover"

// Overlay au hover
className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100
           transition-opacity"

// Bouton supprimer (X)
className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full
           flex items-center justify-center text-white opacity-0
           group-hover:opacity-100 transition-opacity hover:bg-black/80"

// Badge "Couverture" (premiere image)
className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-primary text-white
           text-xs font-medium rounded-md"
// Texte: "Couverture" / "Sary voalohany"

// Compteur
className="text-xs text-gray-500 mt-1"
// Texte: "2/5 photos" / "2/5 sary"
```

#### Drag and Drop - Etats visuels

```
// Etat normal
border-2 border-dashed border-gray-300

// Etat drag over (fichier au-dessus)
border-2 border-dashed border-primary bg-orange-50/50
// + icone de telechargement animee (bounce)

// Etat uploading (chargement)
// Overlay sur l'image avec spinner
className="absolute inset-0 bg-white/70 flex items-center justify-center"
// Spinner: "w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"

// Etat erreur
border-2 border-dashed border-secondary bg-red-50/30
// Message: "Format non supporte" en rouge
```

#### Upload process

```
1. Utilisateur clique sur "+" ou drag-and-drop
2. Validation cote client:
   - Format: JPG, PNG, WebP
   - Taille: max 5MB par image
   - Nombre: max 5 images
3. Preview immediate (URL.createObjectURL)
4. Compression cote client si necessaire (canvas resize)
5. Upload vers le serveur (avec barre de progression)
6. Remplacement de l'URL locale par l'URL serveur
7. Possibilite de reorganiser (drag-and-drop entre images)
8. Premiere image = couverture (badge visible)
```

---

## 6. Analyse UX Daangn - Bouton Favori (찜/관심)

### 6.1 Placement et style

#### Sur la carte produit (ProductCard)

```
+---------------------------+
|                           |
|      [Image produit]      |
|                     [♡]   |  <-- Position: absolute, bottom-2, right-2
|                           |
+---------------------------+
| Titre du produit          |
| 150 000 Ar                |
| Antananarivo    il y a 2h |
+---------------------------+
```

**Specifications du bouton coeur sur la carte :**

```
// Bouton coeur sur la carte produit
className="absolute bottom-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm
           rounded-full flex items-center justify-center shadow-sm
           hover:bg-white transition-all z-10"

// Icone coeur non favori
className="w-5 h-5 text-gray-400 hover:text-secondary transition-colors"
// SVG: stroke only, fill="none"

// Icone coeur favori (active)
className="w-5 h-5 text-secondary"
// SVG: fill="currentColor" + animation scale
```

#### Sur la page detail du produit

```
+------------------------------------------------------+
|  [Images produit - Carousel]                          |
+------------------------------------------------------+
|  Titre du produit                                     |
|  150 000 Ar                                           |
|  Antananarivo, Analakely              il y a 2 heures |
+------------------------------------------------------+
|  [Contacter le vendeur]  [♡ Favori]  [Partager]       |
+------------------------------------------------------+
```

**Specifications du bouton favori sur la page detail :**

```
// Bouton favori (page detail) - non actif
className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300
           rounded-xl text-sm font-medium text-gray-600
           hover:border-secondary hover:text-secondary transition-all"

// Bouton favori (page detail) - actif
className="inline-flex items-center gap-2 px-4 py-2.5 border border-secondary
           rounded-xl text-sm font-medium text-secondary bg-red-50
           hover:bg-red-100 transition-all"
```

#### Icone SVG du coeur

```tsx
// Coeur vide (non favori)
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
</svg>

// Coeur rempli (favori actif)
<svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
</svg>
```

#### Animation de transition

```css
/* Animation coeur lors du clic */
@keyframes heartBeat {
  0%   { transform: scale(1); }
  25%  { transform: scale(1.3); }
  50%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.heart-animation {
  animation: heartBeat 0.4s ease-in-out;
}
```

```
// Classe Tailwind equivalent
className="active:scale-125 transition-transform duration-200"
```

### 6.2 Page "Mes Favoris"

```
+------------------------------------------------------+
| Navbar                                                |
+------------------------------------------------------+
|                                                       |
|  Mes favoris (12)                                     |
|                                                       |
|  +----------+  +----------+  +----------+             |
|  | [Image]  |  | [Image]  |  | [Image]  |             |
|  |    [♥]   |  |    [♥]   |  |    [♥]   |             |
|  | Titre    |  | Titre    |  | Titre    |             |
|  | Prix     |  | Prix     |  | Prix     |             |
|  | Lieu     |  | Lieu     |  | Lieu     |             |
|  +----------+  +----------+  +----------+             |
|                                                       |
|  // Grille identique a la page buy-sell               |
|  // Avec ProductCard standard + coeur rempli          |
+------------------------------------------------------+
```

---

## 7. Layouts des pages

### 7.1 Layout general

```
+------------------------------------------------------+
| Navbar (sticky top, h-14, bg-white, border-b)         |
+------------------------------------------------------+
|                                                       |
|  <main className="flex-1">                            |
|    max-w-7xl mx-auto px-4                             |
|    {children}                                         |
|  </main>                                              |
|                                                       |
+------------------------------------------------------+
| Footer (bg-gray-800, text-gray-300)                   |
+------------------------------------------------------+
```

### 7.2 Grille des produits

```
// ProductGrid
className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
```

### 7.3 Page detail produit

```
+------------------------------------------------------+
| [Breadcrumb: Bazary > Categorie > Produit]            |
+------------------------------------------------------+
|                          |                             |
|  [Carrousel images]      |  Titre du produit          |
|  [1/5] [< >]            |  150 000 Ar                |
|                          |  Disponible                 |
|                          |                             |
|  aspect-square           |  Vendeur: [Avatar] Nom     |
|  max-w-lg               |  Antananarivo, Analakely    |
|                          |  Publie il y a 2 heures    |
|                          |                             |
|                          |  [Contacter] [♡] [Partager]|
|                          |                             |
|                          |  Description:               |
|                          |  Lorem ipsum dolor sit...   |
+------------------------------------------------------+
```

---

## 8. Responsive breakpoints

| Breakpoint | Largeur | Usage                              |
| ---------- | ------- | ---------------------------------- |
| Default    | < 640px | Mobile - 2 colonnes produits       |
| `sm`       | 640px   | Petit tablet - 3 colonnes          |
| `md`       | 768px   | Tablet - chat split view           |
| `lg`       | 1024px  | Desktop - navbar etendu           |
| `xl`       | 1280px  | Grand desktop - 5 colonnes         |

---

## 9. Espacements standards

| Usage                | Classe Tailwind    |
| -------------------- | -------------------|
| Padding page         | `px-4 py-8`        |
| Padding carte        | `p-3` (petite), `p-6` (grande) |
| Gap grille produits  | `gap-4`            |
| Margin section       | `mb-8`             |
| Gap entre elements   | `gap-2` (petit), `gap-4` (moyen) |
| Max width contenu    | `max-w-7xl` (listing), `max-w-3xl` (contenu texte), `max-w-2xl` (formulaire) |

---

## 10. Bordures et ombres

```
// Bordure standard
className="border border-gray-200"

// Bordure focus
className="focus:ring-2 focus:ring-primary/20 focus:border-primary"

// Rayon de bordure
rounded-md    // badges, petits elements
rounded-lg    // boutons, inputs
rounded-xl    // cartes, images
rounded-2xl   // grandes cartes, formulaires
rounded-full  // avatars, boutons circulaires

// Ombres
shadow-sm     // elements subtils
shadow-lg     // hover sur les cartes (hover:shadow-lg)
```

---

## 11. Animations et transitions

```
// Transition standard
className="transition-colors"       // couleur (boutons, liens)
className="transition-all duration-200" // multiple proprietes (cartes)
className="transition-transform duration-300" // images au hover

// Hover image zoom
className="group-hover:scale-105 transition-transform duration-300"

// Loading skeleton
className="animate-pulse bg-gray-200 rounded-xl"

// Spinner
className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"
```

---

## 12. Icones

Le projet utilise des icones SVG inline (pas de librairie externe).
Taille standard : `w-5 h-5` pour les icones, `w-4 h-4` pour les petites.

```tsx
// Pattern standard pour les icones
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
</svg>
```

Icones couramment utilisees :
- Recherche (loupe)
- Plus (+) pour "Vendre"
- Localisation (pin)
- Fleche (chevron)
- Fermer (X)
- Menu (hamburger)
- Coeur (favori)
- Message (chat)
- Photo (camera)

---

## 13. Pattern composant (reference code)

### Structure "use client" avec i18n

```tsx
"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function MonComposant() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "fr";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {t("maSection.titre")}
      </h1>
      {/* ... */}
    </div>
  );
}
```

### Structure bilingue inline (sans cle i18n)

```tsx
<h1>
  {locale === "mg"
    ? "Texte en malagasy"
    : "Texte en francais"
  }
</h1>
```

---

## 14. Couleurs drapeau Madagascar

Reference pour les elements decoratifs :

```
Blanc   : bg-white    (#FFFFFF)
Rouge   : bg-secondary (#FC3D32)
Vert    : bg-accent    (#007E3A)
```

Utilise dans le Footer comme bande decorative :
```tsx
<div className="flex gap-1 mt-4">
  <div className="w-8 h-5 bg-white rounded-sm"></div>
  <div className="w-8 h-5 bg-secondary rounded-sm"></div>
  <div className="w-8 h-5 bg-accent rounded-sm"></div>
</div>
```

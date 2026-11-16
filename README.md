# 🐭 Myšák – Malé etudy pro myš a klávesnici II.

Offline verze dětských cvičení na **myš a klávesnici** (původně web `zsvltava.cz/mysak`), upravená tak, aby fungovala **bez internetu** a byla přívětivější pro děti.

> 16 cvičení: klikání, drag & drop, barvy, šipky, psaní, počítání, logika…

---

## ▶️ Jak spustit

**Nejjednodušeji (bez instalace, bez serveru):**

1. Stáhni / rozbal tento repozitář.
2. Dvojklik na **`Spustit hru.bat`** – otevře se úvodní stránka v prohlížeči.
   (Nebo dvojklik přímo na `index.html`.)

**Volitelně přes lokální server** (např. když prohlížeč blokuje soubory):

```bash
python -m http.server 8080
# → http://localhost:8080/index.html
```

**Online (GitHub Pages):** po zapnutí Pages v nastavení repozitáře běží hra na
`https://<uživatel>.github.io/<repozitář>/`.

---

## ✨ Co bylo vylepšeno

| Úprava | Popis |
|---|---|
| 🎨 Dětský vzhled | Větší dlaždice, zaoblené rohy, barevné menu, hravá hlavička (`theme/kids.css`) |
| 🔊 Zvuky | Web Audio efekty pro úspěch/chybu, přepínač zvuku |
| ⭐ Postup | Pamatování dokončených cvičení (`localStorage`), odznak „⭐ X / 16“ |
| 🎉 Odměny | Konfety a závěrečné okno po vyřešení |
| 🛡️ Pojistka | Odkazy ven z aplikace jsou zablokované s hláškou, aby dítě neodešlo |
| 🖼️ Opravy | Rozbité náhledy a cesty ve cvičení 2 (Skládanka), chybějící zavírací tagy, PHP chyby |
| 📱 Mobil | Responzivní rozvržení, větší dotykové plochy |

---

## 🎮 Seznam cvičení

| # | Cvičení | # | Cvičení |
|---|---|---|---|
| 1 | Klik a dvojklik | 9 | Mozaika |
| 2 | Skládanka (drag & drop) | 10 | Řazení |
| 3 | Barevné dvojice | 11 | Letopočty |
| 4 | RGB | 12 | Matrix |
| 5 | Šipky | 13 | Psaní |
| 6 | Čísla | 14 | Závod |
| 7 | Znaky | 15 | ASCII Art |
| 8 | Symboly | 16 | Typografie |

---

## 📁 Struktura

```
index.html                  ← úvodní stránka s dlaždicemi (funguje i z disku)
Spustit hru.bat             ← spouštěč pro Windows (dvojklik)
www.zsvltava.cz/mysak/
  index.html                ← rozcestník her
  index*.html               ← jednotlivá cvičení
  js/                       ← herní logika, jQuery, doplňky (kids.js)
  theme/                    ← styly, fonty, obrázky (kids.css)
  cviceni/                  ← data cvičení (obrázky, dlaždice)
```

---

## 🛠️ Technologie

- Čisté HTML + CSS + JavaScript, žádné sestavování ani instalace
- jQuery + jQuery UI (drag & drop)
- Web Audio API, `localStorage`, CSS Grid/Flexbox
- Nevyžaduje internet ani server

---

## 📜 Původ a licence

Herní obsah pochází z původního webu **zsvltava.cz/mysak** („Malé etudy pro myš a klávesnici II.“)
a byl offline zrcadlen nástrojem HTTrack. Práva k původnímu obsahu náleží jeho autorům.
Vylepšení (vzhled, zvuky, postup, opravy) jsou volně k použití.

Pokud jsi autorem původního obsahu a licenci chceš upravit, otevři issue.

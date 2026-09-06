# Microsoft Store Publishing Guide for Water Sort Puzzle

This document details how to package and publish **Water Sort Puzzle: Color Liquid Master** to the **Microsoft Store** on Windows 10 & 11.

---

## 1. Generated Assets & Ready Files

All necessary Windows Store assets and configuration files have been prepared:
- **App Icons & Logos** located in `public/icons/` & `public/`:
  - `StoreLogo.png` & scales (50x50, 100x100, 200x200)
  - `Square44x44Logo.png` & scales (44x44, 88x88, 176x176)
  - `Square71x71Logo.png` & scales (71x71, 142x142)
  - `Square150x150Logo.png` & scales (150x150, 300x300, 600x600)
  - `Square310x310Logo.png` & scales (310x310, 620x620)
  - `Wide310x150Logo.png` & scales (310x150, 620x300)
  - `SplashScreen.png` & scales (620x300, 1240x600)
  - `icon-512x512.png`, `icon-192x192.png`, `favicon.png`
- **Manifest Files**:
  - `public/manifest.json`: Web App & Windows PWA Manifest
  - `package.appxmanifest`: Windows 10/11 UWP/MSIX App Manifest
- **In-App Purchases Engine**:
  - `src/lib/microsoftStoreIAP.ts`: Native `Windows.Services.Store` API bridge with web fallback.

---

## 2. In-App Purchase (Add-on) Product IDs in Partner Center

When submitting to [Microsoft Partner Center](https://partner.microsoft.com/dashboard), create these **Add-ons** (In-App Products):

| Product ID | Product Name | Type | Price (USD) | Description |
|---|---|---|---|---|
| `hints_pack_1` | 1 Hint | Consumable | **$0.10** | 1 puzzle move hint |
| `hints_pack_10` | 10 Hints Mega Pack | Consumable | **$0.99** | 10 puzzle hints (Best Value) |
| `undos_pack_1` | 1 Undo | Consumable | **$0.10** | 1 move rewind |
| `undos_pack_10` | 10 Undos Mega Pack | Consumable | **$0.99** | 10 move rewinds |
| `vip_master_pass` | VIP Master Pass | Durable | **$2.99** | All themes & bottles unlocked forever |

*(Rare bottles `$0.99` and atmospheric backgrounds `$0.49` can also be added as durables: `bottle_skin_<id>` and `bg_theme_<id>`)*.

---

## 3. Recommended Publishing Method: PWABuilder (Official Microsoft Tool)

Microsoft officially recommends using **PWABuilder** (built by Microsoft) to generate the MSIX package for Microsoft Store:

1. Deploy or host your built `dist/public` folder (e.g. via Vercel, Netlify, Cloudflare Pages, or Azure Static Web Apps).
2. Visit **[PWABuilder.com](https://www.pwabuilder.com/)**.
3. Enter your game URL and click **Start**.
4. PWABuilder will automatically read `manifest.json` and all generated icons in `public/icons/`.
5. Click **Package for Stores** -> **Windows (Microsoft Store)**.
6. Enter your Publisher ID from your Microsoft Partner Center account.
7. Click **Generate Package**.
8. Download the signed `.msix` / `.msixbundle` file.
9. In Microsoft Partner Center -> **New Submission** -> **Packages**, upload the generated `.msixbundle` file.

---

## 4. Alternative Method: Local MSIX Packaging with CLI

If building locally using Windows SDK `MakeAppx.exe`:
```powershell
# In Windows PowerShell (requires Windows 10/11 SDK installed):
makeappx pack /d "C:\water sort\Liquid-Sort-Master\artifacts\water-sort\dist\public" /p "WaterSortPuzzle.msix"
```

---

## 5. Privacy Policy URL for Store Submission

Microsoft Store requires a Privacy Policy URL. 
- You can host the Privacy Policy page or point it to your deployed domain (e.g. `https://your-domain.com/privacy`), which reflects the updated policy inside `PrivacyPolicyModal.tsx` (100% compliant: zero third-party telemetry, Microsoft Store Commerce billing, local client-side progress).

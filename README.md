# 🥊 Colosseum Fight Club — Offline Mobile Finance & Workflow Manager

A standalone, **100% offline-first** mobile application built with **React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI, Dexie.js (IndexedDB), and SheetJS (`.xlsx`)**.

Designed specifically for **Colosseum Fight Club (Sri Lanka)** with a custom **Dark & Gladiator Gold** theme, strict **LKR (`Rs.`)** Double-Entry Bookkeeping, Daily Task Workflow Tracking, and one-tap **Excel (`.xlsx`)** backup exports.

---

## 📱 How to Install & Run on Your Android Phone

You have **3 ways** to install and use this app on your phone as a standalone application. Once installed, **all data is stored locally on your phone** and works **100% offline without internet**.

---

### Method 1: Easiest 1-Tap PWA Install (Free Static Hosting) — *Recommended*

Because PWAs require `HTTPS` to show the native Android **"Install App"** prompt, deploying the built `dist` folder once to a free static host lets you install the app onto your phone in 30 seconds:

1. **Build the production bundle on your PC:**
   ```powershell
   npm.cmd run build
   ```
   *(This creates the `dist/` folder in your project directory).*

2. **Host the `dist/` folder for free (takes 30 seconds):**
   - Go to **[Netlify Drop](https://app.netlify.com/drop)** (or Vercel / GitHub Pages).
   - Drag and drop the **`dist`** folder from `c:\Users\Tharusha\Downloads\cfc ac\dist` into the browser window.
   - Netlify will give you an `https://...netlify.app` link.

3. **Install on your Android Phone:**
   - Open that `https://...` link in **Google Chrome** on your Android phone.
   - Tap the **three-dot menu (`⋮`)** in the top-right corner of Chrome.
   - Tap **"Install app"** (or **"Add to Home screen"**).
   - The **Colosseum FC (`CFC`)** gold icon will appear in your app drawer and home screen.
   - Open it! It runs **full-screen** (no browser bar) and works **100% offline** even if you turn on Airplane Mode.

---

### Method 2: Run Over Local Wi-Fi (PC to Phone, No Hosting Needed)

If your PC and Android phone are connected to the **same Wi-Fi network** (or mobile hotspot):

1. **Start the server on your PC with network access enabled:**
   Open PowerShell in `c:\Users\Tharusha\Downloads\cfc ac` and run:
   ```powershell
   npm.cmd run build
   npm.cmd run preview -- --host
   ```
2. **Copy the Network URL:**
   The terminal will display a `Network:` URL such as:
   ```text
   ➜  Local:   http://localhost:4173/
   ➜  Network: http://192.168.1.XX:4173/
   ```
3. **Open on your Phone:**
   - Open **Chrome** on your Android phone and type the `http://192.168.1.XX:4173/` address.
   - *(Optional: To enable full offline PWA installation over a local `http://` IP in Chrome Android, open `chrome://flags/#unsafely-treat-insecure-origin-as-secure` on your phone, enter `http://192.168.1.XX:4173`, set it to **Enabled**, relaunch Chrome, and tap **Menu `⋮` → Install app**).*

---

### Method 3: Build a Standalone Native Android `.apk` File (via Capacitor)

If you want a physical `.apk` file that you can copy to your phone via USB or WhatsApp and install directly:

#### Prerequisites on PC:
- Install **[Android Studio](https://developer.android.com/studio)** (includes the Android SDK).

#### Step-by-Step Commands:
Open PowerShell in `c:\Users\Tharusha\Downloads\cfc ac`:

```powershell
# 1. Install the Capacitor Android platform package
npm.cmd install @capacitor/android

# 2. Build the latest web & offline assets
npm.cmd run build

# 3. Initialize the native Android project folder
npx.cmd cap add android

# 4. Copy the built web assets into the Android project
npx.cmd cap sync android

# 5. Open the project in Android Studio
npx.cmd cap open android
```

#### Inside Android Studio:
1. Wait for Gradle sync to finish (bottom status bar).
2. In the top menu bar, click **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. Once completed, click **Locate** in the notification popup to find `app-debug.apk` (located at `android/app/build/outputs/apk/debug/app-debug.apk`).
4. Send `app-debug.apk` to your Android phone and tap it to install **Colosseum FC** natively!

---

## 💻 Local Development Commands (PC)

| Action | Command (PowerShell) |
| :--- | :--- |
| **Install Dependencies** | `npm.cmd install` |
| **Start Dev Server** | `npm.cmd run dev` |
| **Build Production PWA** | `npm.cmd run build` |
| **Preview Production Build** | `npm.cmd run preview -- --host` |

> **Note for Windows PowerShell Users:** If `npm` gives a script execution policy warning, use `npm.cmd` and `npx.cmd` instead of `npm` and `npx`.

---

## 📊 Key Features & Usage Guide

1. **Overview (Dashboard Tab):**
   - View your live **Liquid Cash & Bank Balance (`LKR`)**, **Total Debits (`Dr`)**, **Total Credits (`Cr`)**, **Gym Revenue**, **Gym Expenses**, and **Net Operating Profit**.
   - Check the **Double-Entry Ledger Status** badge (`BALANCED` vs. `CHECK DR/CR`) at a glance.
2. **Double-Entry Ledger (Ledger Tab):**
   - **Single Line Mode:** Record an individual `Debit` or `Credit` posting to any account in the Chart of Accounts.
   - **Paired Dr/Cr Mode:** Tap the **`Single Line / Paired Dr/Cr`** toggle in the top-right of the form to select both a **Debit Account** and **Credit Account** simultaneously—automatically keeping your Trial Balance 100% balanced.
   - **Trial Balance View:** Switch to the **Trial Balance & Accounts** sub-tab to inspect closing balances for every account in `LKR`.
3. **Daily Workflow (Workflow Tab):**
   - Add daily gym tasks tied to specific dates with `High`, `Medium`, or `Low` priority.
   - Tap `Todo`, `In Progress`, or `Done` on any task card to update its status with one thumb.
4. **Excel Backup (`.XLSX` Export):**
   - Tap the **`.XLSX`** button in the top header (or open the **Export** tab) at any time to download a formatted Excel workbook (`Colosseum_Fight_Club_LKR_YYYY-MM-DD.xlsx`) containing 3 sheets:
     - `Double_Entry_Ledger`
     - `Trial_Balance_LKR`
     - `Workflow_Tasks`

A React Native mobile application designed to help Concordia University students navigate campus safely during disruptions such as protests, construction, and emergencies.

---

## Prerequisites

Make sure you have the following installed before starting:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [Git](https://git-scm.com/)
- Either:
    - **Expo Go** app on your physical device ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
    - **Android Emulator** via [Android Studio](https://developer.android.com/studio)
      - https://docs.expo.dev/workflow/android-studio-emulator/
    - **iOS Simulator** via Xcode (macOS only)
      - https://docs.expo.dev/workflow/ios-simulator/
---


## Supabase Database Setup

The app requires a Supabase project with the following table. Find the schema.sql file in the supabase folder and paste the content in the **Supabase SQL Editor**.

## Setup

**1. Clone the repository**
```bash
git clone https://github.com/luantran/concordia-safe-path.git
cd concordia-safe-path
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the project root:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
```

Get these values from the Supabase dashboard:
1. Go to https://supabase.com and open your project
2. On the home page, you'll have a url, it should look like (https://****.supabase.co), that's the one, replace that in your env file  → paste as EXPO_PUBLIC_SUPABASE_URL
2. Click **Project Settings** (gear icon, bottom of left sidebar)
3. Click **API** under the Configuration section
5. Copy **publishable** key under Project API keys → paste as EXPO_PUBLIC_SUPABASE_KEY
**4. Start the app**
```bash
npx expo start
```

Make sure your phones and computers are on the same wifi and that your computer "trusts" this wifi (choose "I trust this wifi" in your wifi setting). Anti-virus can complicate things. Also

---

## Running the App

| Platform | Command | Notes |
|---|---|---|
| Android Emulator | Press `a` in terminal | Emulator must be running first |
| iOS Simulator | Press `i` in terminal | macOS only |
| Physical device | Scan QR code with Expo Go | Must be on same WiFi network |
Not sure about the iOS one, tbh
---


---

## Project Structure

```
app/
├── (auth)/           ← Login & Register screens
├── (dashboard)/      ← Main app tabs
│   ├── incidents/    ← Incident feed + detail
│   │   ├── index.jsx
│   │   └── [id].jsx
│   ├── create.jsx    ← Report an incident
│   ├── map.jsx       ← Campus map with incident pins
│   └── profile.jsx   ← User profile + logout
├── _layout.jsx       ← Root layout + providers

components/           ← Reusable themed components
contexts/             ← React context (User, Incidents)
hooks/                ← useUser, useIncidents
lib/                  ← Supabase client
constants/            ← Colors/theme
```

---

## Common Pitfalls

**Environment variables not loading**
- Make sure the file is named exactly `.env` (not `.env.local`)
- All variables must start with `EXPO_PUBLIC_`
- Restart the bundler completely after editing: `npx expo start --clear`

**`supabaseUrl is required` error**
- Your `.env` file isn't being read — see above

**Blank screen on emulator**
- Press `a` in the terminal to explicitly open on Android
- Make sure the emulator is fully booted before running `expo start`

**Location not working on emulator**
- Set a mock location in the emulator: **⋮ → Location** and enter coordinates manually
- Concordia SGW campus: `45.4972, -73.5789`

**Map not showing / slow to load**
- This is normal on first load — map tiles need to download
- On emulator, map performance is slower than a real device

**Incidents not updating in real time**
- Make sure Realtime is enabled for the `incidents` table in Supabase: **Database → Publications → supabase_realtime**

**`Cannot read property 'filter' of null`**
- Initial state for incidents must be `[]` not `null` in `IncidentsContext.jsx`

**Rules of Hooks error on `ThemedView`**
- `useSafeAreaInsets` must always be called unconditionally at the top of the component — never after an early return

---

## Tech Stack

- [Expo](https://expo.dev/) + [Expo Router](https://expo.github.io/router/) — React Native framework & file-based routing
- [Supabase](https://supabase.com/) — Backend, authentication, and real-time database
- [react-native-maps](https://github.com/react-native-maps/react-native-maps) — Map rendering
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/) — Device GPS

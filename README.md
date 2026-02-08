# Alarm

React Native + Expo app for iOS and Android, with Supabase backend and NativeWind (Tailwind) styling.

## Project setup (already done)

- **Expo** – React Native with managed workflow
- **NativeWind** – Tailwind-style `className` styling
- **Supabase** – Client in `lib/supabase.js`; add your project keys in `.env`

## Machine setup

### iOS (macOS)

- **Xcode** – Install from the Mac App Store. You already have Xcode 26.2.
- **Command Line Tools** – In Xcode: **Xcode → Settings → Locations** and set **Command Line Tools**.
- **Simulator** – Included with Xcode. Run the app with `npm run ios`.

### Android

1. **Android Studio** – Install from [developer.android.com/studio](https://developer.android.com/studio).
2. **SDK** – In Android Studio: **Settings → Appearance & Behavior → System Settings → Android SDK**. Install:
   - Android SDK Platform (e.g. latest and one older)
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android Emulator
3. **Environment** – Add to `~/.zshrc` (or your shell config):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
   Then run `source ~/.zshrc` or open a new terminal.
4. **Emulator** – In Android Studio: **Device Manager → Create Device**, pick a device and system image, then create.
5. Run the app with `npm run android`.

## Supabase setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard) (or [database.new](https://database.new)).
2. In the dashboard: **Project Settings → API** – copy **Project URL** and **anon public** key.
3. In this repo root, copy the example env file and add your values:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Use the client in your app:
   ```js
   import { supabase } from './lib/supabase';
   const { data } = await supabase.from('your_table').select();
   ```

## Initial setup (one-time)

Run the setup script to install Watchman and configure Android env vars:

```bash
./scripts/setup-immediate.sh
```

Then edit `.env` with your Supabase credentials.

## Run the app

```bash
npm install
npm run ios      # iOS simulator
npm run android  # Android emulator
npm run web      # Web browser
```

Start the dev server with `npm start`, then press `i` for iOS or `a` for Android.

## Demo mode

For demos without OAuth setup, use fake parent/child accounts with pre-seeded data.

1. Add to `.env` (from Supabase Dashboard → Project Settings):
   - **API** → service_role key → `SUPABASE_SERVICE_ROLE_KEY=...`
   - **Database** → Connection string (URI) → `DATABASE_URL=...`

2. Run the setup script:
   ```bash
   npm run setup:demo
   ```

3. Set `EXPO_PUBLIC_DEMO_MODE=true` in `.env`.

4. Sign in with Apple or Google (uses demo parent). In **Settings**, use the **Demo mode** switch to toggle parent/child view.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm start`    | Start Expo dev server    |
| `npm run ios`  | Run on iOS simulator     |
| `npm run android` | Run on Android emulator |
| `npm run web`  | Run in web browser       |

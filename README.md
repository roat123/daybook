# Daybook

A private journal for iOS and Android with **email sign-in** and a **paid Pro plan**.

Free accounts can keep 10 entries. Pro (monthly or yearly) unlocks unlimited entries, search and export. The app shows the full flow a paid app needs: sign up, sign in, protected screens, paywall, purchase, restore, cancel, sign out and account deletion.

## Features

- **Sign up / sign in** with email and password, clear error messages, the session stays after restart
- **Protected screens** with Expo Router `Stack.Protected`: signed-out users see only the sign-in screens
- **Journal:** entries with a mood, edit, delete, newest first
- **Free limit:** 10 entries, checked on the list and again on save
- **Paywall:** monthly and yearly plans, "Save 44%" counted from the prices, loading and error states
- **Subscription life cycle:** auto-renew, cancel (Pro stays until the end of the paid period), restore purchases
- **Pro features:** search across all entries, export the journal as text (system share sheet)
- **Account:** plan status and renewal date, sign out, delete account with all data
- **Light and dark mode**

## Demo mode (free, no accounts)

The app runs fully on the phone, so anyone can try it without keys or paid services:

- Accounts are stored on the phone; the password is saved only as a salted hash.
- Payments are simulated: no money is charged, the app says so on the paywall.
- **Continue with a demo account** on the sign-in screen opens a ready account.

## How it works

```
screens ──▶ stores (zustand) ──▶ services/index.ts ──▶ AuthProvider     ──▶ demo: accounts on the phone
                                                       BillingProvider  ──▶ demo: purchases on the phone
```

- Screens never talk to a login or payment service directly. They use two small interfaces: `AuthProvider` (sign up, sign in, delete) and `BillingProvider` (purchase, restore, cancel).
- `src/services/index.ts` is the only place that picks the providers. Going live means adding a real provider there (for example Supabase or Firebase for login, RevenueCat for App Store / Google Play subscriptions). Screens, stores and tests stay the same.
- A purchase belongs to the account, not the phone: signing in again restores Pro.
- Sign-in gives the same error for an unknown email and a wrong password, so nobody can check which emails have accounts.

## Tech

Expo SDK 57 · React Native · TypeScript · Expo Router (protected routes) · Zustand · expo-sqlite · expo-crypto · Jest

## Project structure

```
src/
  app/              screens: sign-in, sign-up, journal, entry, paywall, account
  components/       UI parts (button, field, chips, demo note)
  lib/              logic without UI: plans and renewals, limits, search, export, validation
  services/         AuthProvider and BillingProvider + demo implementations
  store/            session (user + plan) and entries
tests/              unit tests: validation, plans, renewals, search, export, demo auth and billing
```

## Run it

1. `npm install`
2. `npx expo start`, then open the app in **Expo Go** on your phone (scan the QR code)

## Checks

```bash
npm test            # unit tests
npm run typecheck   # TypeScript
npm run lint        # ESLint
```

## Known limits

- Demo mode is for showing the flow. Real accounts must live on a server, and passwords must be hashed there with a slow hash (bcrypt, scrypt, Argon2), not on the phone.
- Real in-app purchases need App Store and Google Play developer accounts and a billing provider; the `BillingProvider` interface is ready for it.
- Entries are not synced between devices and are not encrypted on the phone.

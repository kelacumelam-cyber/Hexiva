# Hexiva Physical Android Test

This is the final device test after a debug APK is produced.

## Build

First time only:

```bash
npm install
npm run android:add
```

For a fresh debug APK:

```bash
npm run android:debug
```

Expected output:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Minimum real-device pass

Use a portrait Android phone and play naturally for at least 15-20 minutes.

Check:
- app stays portrait,
- no UI is cut by notch/status/navigation areas,
- all three boosters fit and are easy to tap,
- large boards remain fully readable,
- edge gaps cause immediate falls,
- pits and grey floor cells remain visually/behaviorally distinct,
- redirect, swap, cycle, obstacle and linked-pair mechanics still behave normally,
- bomb removes only the selected playable block,
- restart/home/shop/daily gift work repeatedly,
- several level transitions do not progressively slow down,
- returning to the menu reduces heat/load rather than continuing full rendering,
- background does not make the board harder to read,
- app survives background -> foreground,
- progress survives force close and relaunch,
- airplane-mode launch works for the packaged build.

## Thermal / stability note

A warm phone is not automatically a failure. Flag:
- obvious frame degradation over time,
- touch latency that grows during the session,
- repeated WebGL recovery overlay,
- crash/reload,
- rapidly increasing heat while sitting on the main menu.

Record the phone model and Android version with any failure.

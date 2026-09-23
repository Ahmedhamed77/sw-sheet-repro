# Repro: closed `ModalBottomSheet` commits a state update on every frame (Android, Fabric)

Minimal React Native app for an issue in
[`@swmansion/react-native-bottom-sheet`](https://github.com/software-mansion-labs/react-native-bottom-sheet).

On Android (New Architecture), each mounted sheet sends a Fabric state update on
every vsync. This also occurs when the sheet is closed (`index={0}`) and the app
is idle. The main thread and the JS thread stay busy, but no frame is drawn.

## What the app contains

- React Native **0.86.3** (bare, `@react-native-community/cli`), React 19.2.3,
  New Architecture, Hermes.
- `@swmansion/react-native-bottom-sheet` **0.16.2**, no patches.
- Native bottom tabs (`createNativeBottomTabNavigator` from
  `@react-navigation/bottom-tabs/unstable`) with 4 tabs. Each tab has a native
  stack.
- The first screen of each tab mounts a closed `ModalBottomSheet`
  (portal mode) with a searchable country list (`@shopify/flash-list`).
- `src/config.ts` → `SHEET_TAB_COUNT` sets how many tabs mount the sheet
  (`4` by default, `0` for a control build).

Other versions: `@react-navigation/native` 7.3.14, `bottom-tabs` 7.18.14,
`native-stack` 7.18.6, `elements` 2.9.36, `react-native-screens` 4.27.0,
`react-native-safe-area-context` 5.8.0, `@shopify/flash-list` 2.3.2.

## Steps

1. Install and build a release APK:

   ```sh
   bun install
   cd android
   ./gradlew :app:assembleRelease -PreactNativeArchitectures=arm64-v8a
   adb install -r app/build/outputs/apk/release/app-release.apk
   ```

2. Start the app and do not touch it for about 6 seconds.
3. Record an idle trace, then open it in [ui.perfetto.dev](https://ui.perfetto.dev):

   ```sh
   cat perfetto/idle.pbtx | adb shell perfetto --txt -c - -o /data/misc/perfetto-traces/idle.pftrace
   adb pull /data/misc/perfetto-traces/idle.pftrace
   ```

4. Optional: get the numbers with
   [`trace_processor_shell`](https://perfetto.dev/docs/analysis/trace-processor):

   ```sh
   trace_processor_shell -q perfetto/idle.sql idle.pftrace
   ```

## Expected

When the app is idle and every sheet is closed, the app does no Fabric mounts
and the JS thread is idle.

## Actual

On the app main thread, `MountItemDispatcher::mountViews` runs on every vsync
with `UPDATE_STATE` mount instructions, but FrameTimeline shows 0 frames drawn.
The JS thread commits the shadow tree in a loop
(`EventQueue::flushStateUpdates` → `ShadowTree::commit`).

## Results

Samsung Galaxy A24 (SM-A245F), Android 15, 90 Hz display. Release build,
cold start, then a 5.2 s idle window. Median (min–max) of 5 runs per build:

| `SHEET_TAB_COUNT` | Mounts | `UPDATE_STATE` | Frames drawn | Main thread running | JS thread running |
|---|---|---|---|---|---|
| 0 (control) | 0 | 0 | 0 | 733 ms (673–771) | 0 ms |
| 1 | 465 (463–467) | 465 (463–467) | 0 | 1247 ms (1210–1271) | 559 ms (530–577) |
| 4 | 466 (463–471) | 4629 (4610–4669) | 0 | 2184 ms (1969–2222) | 2285 ms (2134–2334) |

- With 1 sheet: one mount per vsync (90 per second), and each mount has one `UPDATE_STATE`.
- With 4 sheets: still one mount per vsync, but each one has about 10 `UPDATE_STATE`
  instructions. The JS thread is about 44% busy while the app is idle.
- The sheets are portaled to the root `BottomSheetProvider`, so all 4 are mounted
  at cold start, also before their tabs are opened.

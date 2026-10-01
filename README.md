# GymLog

GymLog is a personal workout tracking web app. You log your lifts day by day, organized by muscle groups, and the app keeps everything synced across your devices.

## What it does

The app is organized around a weekly calendar. Each day can either be a workout day or a rest day. On workout days, you create muscle groups (like Chest or Legs), add exercises inside each group, and then log your sets with weight and reps. When you complete a set, you tap the checkmark to mark it done.

A few things that make it useful in practice:

- It remembers what you lifted last time for each exercise and shows it underneath the input, so you always know what to beat. Tap the hint to fill the set with those numbers.
- Starter routines (Push, Pull, Legs, Upper, Lower, Full Body) can be applied to any day in one tap. You can also save your own routines as collections, and share a collection with someone by link.
- If you do the same routine every week, you can copy last week's workout for that day in one tap.
- Exercise names are suggested as you type, from your own history and a list of common lifts.
- When a set beats your previous best for that exercise it is marked as a PR. Finishing every set of the day opens a summary you can share as an image.
- Bodyweight exercises (no weight entered, e.g. pull-ups) count by reps for PRs, charts and summaries.
- Muscle groups and exercises can be reordered with up/down arrows while editing a day or a collection.
- The Progress tab shows workouts this week, your weekly streak, a strength chart per exercise (3M / 6M / 1Y / All), a body weight log with its own chart, and your latest progress photos. The Photos page shows every photo grouped by month, loads them 12 at a time, and lets you compare any two side by side.
- Weights can be labelled in kg or lb (Settings). This changes the label only; logged numbers are not converted.
- You can export all your data as a JSON file from Settings.
- Works as a Progressive Web App: install it from the browser and use it like a native app. It opens and logs sets with no signal, and syncs when you are back online.

## Tech stack

- Pure HTML, CSS, and JavaScript. No build step, no framework.
- Firebase Authentication for Google Sign-In and email/password sign-in.
- Firestore for storing workout data and progress photos (photos are stored as base64-encoded JPEG directly in Firestore documents). Firestore's persistent local cache keeps a copy on the device for offline use.
- Firebase Analytics for a small set of usage events.
- A service worker (`sw.js`) that caches the app shell and the Firebase modules.
- Hosted on Render as a static site.

## Firebase setup

The app uses Firebase v10 loaded directly from the CDN. The config is already embedded in `index.html`.

These are set in the Firebase console, not in this repo:

- [ ] **Authentication > Sign-in method**: enable Google and **Email/Password**.
- [ ] **Authentication > Settings > Authorized domains**: include the domain the app is served from.
- [ ] **Firestore > Rules**: publish the contents of `firestore.rules`. Sharing a collection by link does not work until these rules are live.
- [ ] **Analytics**: enabled for the project (the `measurementId` in the config must belong to it).

If you change the Firebase version in `index.html`, change it in `sw.js` too and bump `CACHE` there.

## Data structure

```
users/
  {uid}                <- profile: tutorialDone, unit
    days/
      {YYYY-MM-DD}/    <- one document per day
    templates/
      {id}/            <- one document per collection
    photos/
      {timestamp}/     <- one document per photo (stores base64 JPEG)
    body/
      {YYYY-MM-DD}/    <- one body weight entry per day: { weight }
shared/
  {id}/                <- snapshot of a collection shared by link: owner, name, groups, unit
```

A share link is `/?c={id}`. Any signed-in user with the link can read that one document and copy it into their own collections.

## Account and data

Users can delete their account from the Settings screen inside the app. This permanently removes all workout data, collections, photos, body weight entries and shared collections from Firestore and deletes the Firebase Auth account.

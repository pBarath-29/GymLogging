# GymLog

GymLog is a personal workout tracking web app. You log your lifts day by day, organized by muscle groups, and the app keeps everything synced across your devices using your Google account.

## What it does

The app is organized around a weekly calendar. Each day can either be a workout day or a rest day. On workout days, you create muscle groups (like Chest or Legs), add exercises inside each group, and then log your sets with weight and reps. When you complete a set, you tap the checkmark to mark it done.

A few things that make it useful in practice:

- It remembers what you lifted last time for each exercise and shows it as a hint underneath the input, so you always know what to beat.
- If you do the same routine every week, you can copy last week's workout for that day in one tap.
- There is a built-in rest timer with presets (30s, 1 min, 2 min, 3 min, 5 min). It vibrates and plays a sound when time is up.
- The Progress tab lets you upload photos to track your physique over time. Photos are compressed and stored in your account.
- Works as a Progressive Web App, so you can install it on your phone from the browser and use it like a native app.

## Tech stack

- Pure HTML, CSS, and JavaScript. No build step, no framework.
- Firebase Authentication for Google Sign-In.
- Firestore for storing workout data and progress photos (photos are stored as base64-encoded JPEG directly in Firestore documents).
- Hosted on Render as a static site.

## Hosting on Render

1. Push this repo to GitHub.
2. In Render, create a new Static Site and connect your repository.
3. Set the publish directory to `.` (the root, since `index.html` is at the top level).
4. No build command needed.

## Firebase setup

The app uses Firebase v10 loaded directly from the CDN. The config is already embedded in `index.html`. If you want to run your own instance, replace the `firebaseConfig` object with your own project credentials.

Make sure your Firestore security rules restrict access so each user can only read and write their own data. See the rules section below.

## Firestore security rules

Use these rules in your Firebase console under Firestore Database > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This ensures that authenticated users can only access documents under their own user ID, and unauthenticated requests are rejected entirely.

## Data structure

```
users/
  {uid}/
    days/
      {YYYY-MM-DD}/    <- one document per day
    photos/
      {timestamp}/     <- one document per photo (stores base64 JPEG)
```

## Account and data

Users can delete their account from the Settings screen inside the app. This permanently removes all workout data and photos from Firestore and deletes the Firebase Auth account.

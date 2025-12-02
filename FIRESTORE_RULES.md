# Firestore Security Rules

Your Firestore might be blocking writes. Go to Firebase Console and set these rules:

## Option 1: Open Access (Development Only)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## Option 2: Authenticated Users Only (Recommended)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## How to Update:

1. Go to https://console.firebase.google.com
2. Select your project: `echo-bots`
3. Click **Firestore Database** in the left menu
4. Click **Rules** tab
5. Paste one of the rules above
6. Click **Publish**

Then test again!

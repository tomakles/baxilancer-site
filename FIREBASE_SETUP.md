# Firebase Setup Guide for 3LANCER Watchlist

This guide explains how to set up Firebase Firestore to store email watchlist submissions.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `3lancer-watchlist` (or your preferred name)
4. Click **Create project** (disable Google Analytics if you don't need it)
5. Wait for the project to be created

## Step 2: Get Your Firebase Config

1. In the Firebase Console, click the **gear icon** ⚙️ → **Project Settings**
2. Scroll down to **Your apps** section
3. Click **`</>` (Web)** to add a web app
4. Enter app name: `3lancer-web`
5. Check **"Also set up Firebase Hosting for this app"** (optional)
6. Click **Register app**
7. Copy the Firebase config object that appears - it looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};
```

## Step 3: Update index.html with Your Config

1. Open `index.html` in your editor
2. Find the Firebase configuration section (around line 15-27)
3. Replace the placeholder config with your actual Firebase config from Step 2
4. Save the file

## Step 4: Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose location (closest to your users)
4. Select **Start in production mode** (recommended so nothing is accidentally public)
   - If you choose **test mode**, replace the rules immediately before going live (test mode allows public access for a limited time).
5. Click **Create**

## Step 5: Set Firestore Security Rules (for production)

Once you're ready for production, update your security rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with (this blocks ALL reads; only allows creating valid watchlist signups):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /watchlist/{docId} {
      // IMPORTANT: emails must NOT be publicly readable
      allow read: if false;

      // Use the (normalized) email as document id to prevent duplicates.
      allow create: if docId == request.resource.data.email
        && isValidSignup(request.resource.data);
      allow update, delete: if false;

      function isValidSignup(data) {
        return data.keys().hasOnly(['email', 'timestamp', 'source', 'context'])
          && data.keys().hasAll(['email', 'timestamp', 'source', 'context'])
          && data.email is string
          && data.email.size() <= 320
          && data.email.matches('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$')
          // Enforce server-side timestamp (FieldValue.serverTimestamp())
          && data.timestamp == request.time
          && data.source is string
          && data.source.size() <= 20
          && data.context is map
          && data.context.keys().hasOnly(['lang', 'page', 'src', 'utm', 'referrer', 'userLang'])
          && data.context.keys().hasAll(['lang', 'page', 'src', 'utm', 'referrer', 'userLang'])
          && data.context.lang is string
          && data.context.lang in ['en', 'sk', 'de', 'es', 'pl']
          && data.source == 'web-' + data.context.lang
          && data.context.page is string
          && data.context.page.size() <= 200
          && data.context.page.matches('^/.*$')
          && (data.context.src == null || (data.context.src is string && data.context.src.size() <= 120))
          && (data.context.referrer == null || (data.context.referrer is string && data.context.referrer.size() <= 255))
          && (data.context.userLang == null || (data.context.userLang is string && data.context.userLang.size() <= 35))
          && validUtm(data.context.utm);
      }

      function validUtm(utm) {
        return utm == null || (
          utm is map
          && utm.keys().hasOnly(['source', 'medium', 'campaign', 'term', 'content'])
          && utm.keys().hasAll(['source', 'medium', 'campaign', 'term', 'content'])
          && (utm.source == null || (utm.source is string && utm.source.size() <= 120))
          && (utm.medium == null || (utm.medium is string && utm.medium.size() <= 120))
          && (utm.campaign == null || (utm.campaign is string && utm.campaign.size() <= 120))
          && (utm.term == null || (utm.term is string && utm.term.size() <= 120))
          && (utm.content == null || (utm.content is string && utm.content.size() <= 120))
        );
      }
    }

    // Default deny for everything else in the database
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

Note: you (as project owner) can still view/export the emails in Firebase Console; the rules only block public/client reads.

## Optional (recommended): Protect against abuse with Firebase App Check

Because the watchlist endpoint allows anonymous `create`, a bot can spam writes (and costs). App Check helps ensure requests come from your site.

1. In Firebase Console, go to **Build** → **App Check**
2. Register your Web app and choose **reCAPTCHA v3** (copy the site key)
3. Enable **enforcement** for **Firestore**
4. In your site (`index.html`, `sk/index.html`, `de/index.html`, `es/index.html`, `pl/index.html`), set `APP_CHECK_SITE_KEY` in the Firebase `<script type="module">` block.

## Step 6: Test Your Setup

1. Refresh your local website (`localhost:8000`)
2. Submit an email through the watchlist form
3. In Firebase Console, go to **Firestore Database** → **watchlist** collection
4. You should see your email entry with timestamp

## Step 7: View Submitted Emails

### In Firebase Console:

1. Go to **Firestore Database**
2. Click on **watchlist** collection
3. View all submitted emails

### Export Emails (CSV):

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Run: `firebase firestore:export ./exports`
3. Emails will be in the generated files

### Send Emails to Subscribers (when launching):

Use a service like:

- **Firebase Extensions** - Email Trigger
- **Mailchimp** - Import contacts and send campaign
- **SendGrid** - API integration
- **Gmail** - Manual sending (small list only)

## Fallback: Local Storage

If Firebase isn't configured, emails automatically store in browser's `localStorage` as fallback. You can access them in browser console:

```javascript
JSON.parse(localStorage.getItem("watchlist"));
```

## Deployment

When deploying to production:

1. Update your Firebase security rules (see Step 5)
2. Deploy your website with the Firebase config in place
3. Test the form from the live URL
4. Firebase will validate and store emails automatically

## Cost Considerations

Firebase Firestore free tier includes:

- ✅ 1 GB storage
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 20,000 deletes/day

This is more than enough for a watchlist! You'll only pay if you exceed these limits.

## Support

For more info:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Pricing](https://firebase.google.com/pricing)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)

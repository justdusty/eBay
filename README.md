# eBay AI Lister

A single-file web app that uses Claude AI to analyze product photos and automatically create eBay listings.

## What it does

1. You upload photos of an item
2. Claude analyzes them and suggests a title, description, category, condition, and price
3. You review and edit the details
4. One click posts the listing to eBay

## Setup

### 1. Get your Anthropic API key
- Go to [console.anthropic.com](https://console.anthropic.com)
- Create an account and generate an API key
- You'll be charged a small amount per analysis (typically < $0.05 per listing)

### 2. Get your eBay developer credentials
- Register at [developer.ebay.com](https://developer.ebay.com) (free)
- Go to Application Keys and create a keyset
- Start with Sandbox for testing, switch to Production when ready

### 3. Get your eBay OAuth user token
This is the most important step. The token lets the app post on your behalf.

**In the eBay Developer Console:**
1. Go to API Explorer → Sell APIs → Inventory API
2. Select your environment (Sandbox or Production)
3. Click "Get OAuth User Token"
4. Log in with your eBay account and grant permission
5. Copy the token — it starts with `v^1.1#i^1...`

**Note:** User tokens expire. You'll need to refresh them periodically.
For a production app, implement the full OAuth refresh flow.

### 4. Set up fulfillment, payment, and return policies
Before posting live listings, create business policies in your eBay seller account:
- Go to your eBay account → Account → Business policies
- Create at least one Shipping, Payment, and Return policy
- Copy the policy IDs and update the code in `postListing()` where it says `__PLACEHOLDER__`

## Hosting

Since this is a single HTML file, you can host it anywhere:

**Netlify (easiest):**
1. Go to [netlify.com](https://netlify.com) and sign up free
2. Drag and drop the `index.html` file onto the Netlify dashboard
3. Done — you get a live URL instantly

**Vercel:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in this folder
3. Follow the prompts

**Any web server:**
Just copy `index.html` to your server's public folder.

## Important notes

### API keys are stored in your browser session only
Credentials are never saved to disk or sent anywhere except directly to Anthropic and eBay's APIs.

### Image uploading
The current version sends images to Claude for analysis but does not upload them to eBay's image hosting. For production use, you'll want to:
1. Upload images to eBay's EPS (eBay Picture Services) or a CDN
2. Pass the hosted image URLs in the inventory item payload

eBay's picture upload endpoint: `POST /sell/media/v1/video` (or use legacy `UploadSiteHostedPictures` in the Trading API)

### CORS note
eBay's API allows direct browser calls for most endpoints when using a valid OAuth token. The Anthropic API requires the `anthropic-dangerous-direct-browser-access: true` header which is included. For a production app, consider routing API calls through your own backend to keep credentials server-side.

### Category IDs
Claude will suggest an eBay category ID based on the photos. These may not always be perfect. You can look up the correct ID at:
https://developer.ebay.com/devzone/finding/callref/Enums/GlobalIdList.html

Or use the eBay Taxonomy API:
`GET /commerce/taxonomy/v1/category_tree/{category_tree_id}/get_category_suggestions?q={query}`

## File structure

```
ebay-lister/
└── index.html    ← entire app, self-contained
```

## Customization

All logic is in the `<script>` tag at the bottom of `index.html`.

- **Change the AI prompt**: Find `const prompt = ...` in `analyzePhotos()`
- **Add more fields**: Add inputs to the review form and include them in `offerPayload`
- **Change the model**: Replace `claude-opus-4-6` with `claude-sonnet-4-6` for faster/cheaper analysis
- **Add bulk listing**: Extend the upload flow to loop through multiple items

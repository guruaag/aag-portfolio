# Logo Setup

Place your fire logo image file in this directory (`/public/`) as `logo.png`.

## Supported Formats
- PNG (recommended)
- SVG
- JPG/JPEG

## Recommended Size
- Minimum: 48x48px
- Recommended: 96x96px or larger (will be automatically scaled to 48px in header)

## How to Add
1. Rename your fire logo image to `logo.png`
2. Place it in the `/public/` folder
3. The logo will automatically appear in the header

## Alternative Location
You can also upload the logo to Supabase Storage:
- Bucket: `public-assets`
- Path: `authors/logo.png`
- Then update the Header component to fetch from Supabase URL


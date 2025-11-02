# Content Population Guide

This document outlines the exact table structure and fields needed to populate the site with authentic content via the Admin Panel.

## Admin Panel Access

**URL:** `http://localhost:3000/admin` (local) or `https://yourdomain.com/admin` (production)

**Default Credentials:**
- **Username:** `aag`
- **Password:** `1234`

*Note: These can be changed via environment variables `VITE_ADMIN_USER` and `VITE_ADMIN_PASSWORD`*

---

## Table Structure & Fields

### 1. `about_content` Table

**Purpose:** Stores the main biographical content for the "About" section.

**Fields to Update:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | text | No | Main heading for About section | "About Gurupratap Sharma" |
| `body_text` | text | Yes | Full biographical text (supports **Markdown**) | Full biography with formatting |
| `truncated_preview` | text | Yes | Short preview shown on home page (150-200 chars) | "Gurupratap Sharma is a distinguished poet..." |

**Markdown Support:**
- **Bold:** `**text**` or `__text__`
- **Italics:** `*text*` or `_text_`
- **Line breaks:** Use double space + Enter or empty line
- **Links:** `[text](url)`
- **Headers:** `# H1`, `## H2`, etc.

**Admin Panel:** Navigate to Admin Dashboard → "About" tab

---

### 2. `publications` Table

**Purpose:** Stores book/publication information with cover images.

**Fields to Update:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | text | Yes | Publication title | "My First Book" |
| `subtitle` | text | No | Optional subtitle | "A Collection of Poems" |
| `description` | text | No | Brief description | "This book explores themes of..." |
| `image_path` | text | Yes | Path in Supabase Storage | `publications/book-1/cover.jpg` |
| `image_alt` | text | No | Alt text for accessibility | "Cover of My First Book" |
| `sort_order` | integer | Yes | Display order (lower = first) | 1, 2, 3... |

**Image Upload Process:**
1. Upload image to Supabase Storage bucket `public-assets`
2. Create folder structure: `publications/{book-id}/cover.jpg`
3. Copy the full path and paste into `image_path` field
4. Example path: `publications/7d3f9bee-1234-5678/cover.jpg`

**Admin Panel:** Navigate to Admin Dashboard → "Publications" tab

---

### 3. `poems` Table

**Purpose:** Stores individual poems/writings with Hindi text and English descriptions.

**Fields to Update:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `heading` | text | Yes | Poem title/heading | "Poem Heading 1" |
| `description` | text | No | Short description or English summary | "A beautiful poem about life and nature" |
| `full_text` | text | Yes | Complete poem text (Hindi/Devanagari) | Full poem in Hindi |
| `language` | text | No | Language identifier | "mixed", "hindi", "english" |
| `sort_order` | integer | Yes | Display order for Prev/Next navigation | 1, 2, 3... |

**Important Notes:**
- `full_text` supports line breaks (use `\n` or actual line breaks)
- `sort_order` determines the order for "Previous Poem" and "Next Poem" buttons
- Prev/Next navigation loops: last poem → first, first poem → last

**Admin Panel:** Navigate to Admin Dashboard → "Poems" tab

---

### 4. `categories` Table

**Purpose:** Defines the three main content categories.

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name_en` | text | Yes | English category name |
| `name_display` | text | No | Display name (if different) |
| `content_type` | text | Yes | Must be: `about`, `publications`, or `writings` |
| `sort_order` | integer | Yes | Display order on home page |

**Pre-seeded Categories:**
- About Gurupratap Sharma (`content_type: 'about'`)
- My Publications (`content_type: 'publications'`)
- My Writings (`content_type: 'writings'`)

**Admin Panel:** Navigate to Admin Dashboard → "Categories" tab

---

### 5. `settings` Table

**Purpose:** Stores site-wide configuration values.

**Fields:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `key` | text (PK) | Yes | Setting identifier | `phone`, `whatsapp`, `default_accent` |
| `value` | text | Yes | Setting value | `+917676885989` |
| `display_label` | text | No | Human-readable label | "Call me" |

**Pre-seeded Settings:**
- `phone`: `+917676885989` (Call me number)
- `whatsapp`: `https://wa.me/917676885989` (WhatsApp link)
- `default_accent`: `#964B00` (Default theme color)
- `site_title`: `Gurupratap Sharma | AAG`

**Update via SQL (if needed):**
```sql
UPDATE settings 
SET value = '+917676885989' 
WHERE key = 'phone';
```

---

## Step-by-Step Content Population

### Step 1: Update About Content
1. Go to `/admin` → Login
2. Click "About" tab
3. Update `title`, `body_text` (Markdown), and `truncated_preview`
4. Click "Save"

### Step 2: Add Publications
1. Upload book cover images to Supabase Storage:
   - Go to Supabase Dashboard → Storage → `public-assets`
   - Create folder: `publications/{publication-id}/`
   - Upload `cover.jpg` inside that folder
2. In Admin Panel → "Publications" tab:
   - Click "Create Publication"
   - Fill in all fields
   - Set `image_path` to: `publications/{publication-id}/cover.jpg`
   - Set `sort_order` (1 = first, 2 = second, etc.)
   - Click "Create Publication"

### Step 3: Add Poems
1. In Admin Panel → "Poems" tab:
   - Click "Create Poem"
   - Enter `heading` (title)
   - Enter `description` (optional English summary)
   - Enter `full_text` (complete poem in Hindi)
   - Set `sort_order` (determines Prev/Next order)
   - Click "Create Poem"

### Step 4: Verify Content
1. Go to home page (`/`)
2. Check all categories display correctly
3. Click "View more" links to see full content
4. Test Prev/Next navigation on poem pages

---

## Removing Placeholder Content

To remove the seed/placeholder data:

```sql
-- Remove placeholder publications
DELETE FROM publications WHERE title LIKE 'Book%';

-- Remove placeholder poems
DELETE FROM poems WHERE heading LIKE 'Poem Heading%';

-- Keep categories and settings as they are needed
```

Or delete via Admin Panel: Navigate to each item → Click "Delete"

---

## Image Guidelines

**Publication Covers:**
- **Recommended size:** 600x900px (2:3 aspect ratio)
- **Format:** JPG or PNG
- **File size:** Under 2MB for faster loading
- **Naming:** `cover.jpg` or `cover.png`

**Storage Structure:**
```
public-assets/
  └── publications/
      ├── {publication-id-1}/
      │   └── cover.jpg
      ├── {publication-id-2}/
      │   └── cover.jpg
      └── ...
```

---

## Validation Rules

**Publications:**
- `title` is required
- `image_path` is required
- `sort_order` must be a number

**Poems:**
- `heading` is required
- `full_text` is required
- `sort_order` must be a number

**About:**
- `body_text` is required
- `truncated_preview` should be 150-200 characters

---

## Troubleshooting

**Images not displaying:**
- Verify bucket `public-assets` is set to **Public**
- Check `image_path` matches exact storage path
- Ensure image file exists in Supabase Storage

**Content not updating:**
- Refresh browser after saving
- Check browser console for errors
- Verify Supabase connection in `.env`

**Admin panel not working:**
- Verify credentials match environment variables
- Clear localStorage: `localStorage.clear()` in browser console
- Check `/admin` route is accessible

---

**Need Help?** Call +917676885989 or WhatsApp: https://wa.me/917676885989


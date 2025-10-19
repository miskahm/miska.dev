# Miska.dev - Security & Software Engineering Blog

Personal portfolio and blog built with Hugo and Blowfish theme.

## Tech Stack

- **Hugo Extended** (v0.141.0+) - Static site generator
- **Blowfish Theme** - Responsive, performance-focused theme
- **GitHub Pages** - Hosting
- **GitHub Actions** - CI/CD deployment

## Live Site

- **Production**: https://miska.dev (custom domain)
- **GitHub Pages**: https://miskahm.github.io/miska.dev/

## Local Development

### Prerequisites
- Hugo Extended (v0.141.0+)
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/miskahm/miska.dev.git
cd miska.dev

# Initialize submodules (Blowfish theme)
git submodule update --init --recursive

# Run development server
hugo server --buildDrafts
```

Visit http://localhost:1313

### Create New Blog Post

```bash
hugo new blog/post-title/index.md
```

Edit the file in `content/blog/post-title/index.md` and set `draft: false` when ready to publish.

## Project Structure

```
miska.dev/
├── .github/workflows/    # GitHub Actions CI/CD
├── archetypes/           # Content templates
├── config/_default/      # Hugo configuration
│   ├── hugo.toml        # Main config
│   ├── params.toml      # Theme parameters
│   ├── menus.toml       # Navigation menus
│   └── languages.en.toml # Language settings
├── content/             # Markdown content
│   ├── blog/           # Blog posts
│   ├── projects/       # Project portfolio
│   └── about/          # About page
├── layouts/partials/    # Custom partials
│   ├── sidebar.html    # Custom sidebar navigation with icons
│   ├── header/basic.html # Modified header (theme toggle + search)
│   ├── home/profile.html # Custom homepage layout
│   ├── extend-head-uncached.html # JavaScript integration
│   └── favicons.html   # Custom favicon config
├── static/             # Static assets
│   ├── css/custom.css  # Purple theme & sidebar styles
│   ├── img/           # Images
│   ├── favicon.png    # Site favicon
│   └── CNAME          # Custom domain config
└── themes/blowfish/    # Theme (git submodule)
```

## Deployment

Deployment is automatic via GitHub Actions on push to `master` branch.

### Workflow Steps:
1. Push to `master` branch
2. GitHub Actions builds site with Hugo
3. Deploys to GitHub Pages
4. Site available at custom domain (miska.dev)

## Customization

### Custom Sidebar Navigation
The site features a custom left sidebar with:
- **GitHub Profile Image** - Auto-fetched from GitHub username
- **Author Info** - Name and headline moved from center to sidebar
- **Social Links** - Email, GitHub, LinkedIn (with 24px spacing)
- **Navigation Menu** - Home, Blog, Projects, About with icons:
  - 🔥 Home (fire icon)
  - ✏️ Blog (pencil icon)
  - 💻 Projects (code icon)
  - ℹ️ About (circle-info icon)

### Header Layout
Compact header with:
- **Theme Toggle** - Dark/light mode switcher (left side)
- **Search Bar** - Compact 192px width search (right side)
- Clean spacing with 16px gap between elements

Files:
- `layouts/partials/sidebar.html` - Sidebar structure with icons
- `layouts/partials/extend-head-uncached.html` - JavaScript integration
- `layouts/partials/header/basic.html` - Header with theme toggle + search
- `layouts/partials/home/profile.html` - Custom homepage (no center author info)
- `static/css/custom.css` - Purple theme and sidebar styles

### Theme Settings
Edit `config/_default/params.toml` to customize:
- Color scheme (currently purple)
- Homepage layout
- Author information
- Social links

### Site Configuration
Edit `hugo.toml` for:
- Site title and URL
- Language settings
- Markup options

### Navigation
Edit `config/_default/menus.toml` to modify:
- Sidebar navigation menu
- Footer links

## Content Management

### Blog Posts
- Location: `content/blog/`
- Format: Markdown with YAML frontmatter
- Create with: `hugo new blog/post-name/index.md`

### Projects
- Location: `content/projects/`
- Showcase portfolio projects
- Include images in same directory

### Pages
- About: `content/about/_index.md`
- Custom pages: Create in `content/`

## Performance

Hugo generates pure static HTML for maximum performance:
- Zero JavaScript by default
- Minimal CSS
- Optimized for Lighthouse scores 90+
- Fast CDN delivery via GitHub Pages

## Theme Documentation

[Blowfish Theme Docs](https://blowfish.page/docs/)

## DNS Configuration

Custom domain configured with:
- **A Records** → GitHub Pages IPs (185.199.108-111.153)
- **CNAME Record** (www) → miskahm.github.io

## Color Customization

This site uses a custom purple theme instead of the default ocean blue. The customization is done via CSS variable overrides in `assets/css/custom.css`.

### Color Variable Groups

Blowfish theme uses three color variable groups:

1. **`--color-neutral-*`** - Backgrounds, text, borders (grays)
2. **`--color-primary-*`** - Main accent colors (buttons, links, hovers)
3. **`--color-secondary-*`** - Secondary accents (tags, badges)

### How to Customize Theme Colors

To override theme colors, use `:root:root` selector for higher specificity:

```css
:root:root {
  /* Neutral grays - backgrounds and text */
  --color-neutral-800: 38, 38, 38;  /* Dark mode background */
  --color-neutral-50: 250, 250, 250; /* Light mode background */

  /* Primary colors - main accent */
  --color-primary-500: 168, 85, 247; /* Purple */
  --color-primary-600: 147, 51, 234; /* Darker purple */
}
```

**Important:** Use `RGB` values without `rgb()` wrapper (e.g., `168, 85, 247` not `rgb(168, 85, 247)`)

### Why :root:root?

The ocean color scheme uses `:root` (specificity: 0,0,1,0). To guarantee our custom colors override it, we use `:root:root` (specificity: 0,0,2,0).

## Troubleshooting Custom Styles

### Issue: Custom CSS Not Loading

**Symptoms:**
- Color theme changes don't appear
- Spacing modifications have no effect
- Sidebar styling is missing

**Root Cause:**
Blowfish v3 uses Hugo's asset pipeline which reads from `assets/` folder, NOT `static/` folder.

**Solution:**
1. Place custom CSS in `assets/css/custom.css` (not `static/css/custom.css`)
2. The theme automatically bundles it via `themes/blowfish/layouts/partials/head.html:105`
3. Delete any old files in `static/css/` to avoid confusion

**Why It Happens:**
- Hugo's `resources.Get "css/custom.css"` looks in `assets/` folder
- Files in `static/` are served as-is but NOT bundled with theme CSS
- The old Blowfish v2 `customCSS` parameter in `params.toml` is obsolete in v3

### Issue: Tailwind Utilities Not Working

**Symptoms:**
- HTML has classes like `space-x-12`, `gap-x-10` but spacing doesn't change
- Browser DevTools shows classes but no CSS rules

**Root Cause:**
Blowfish theme pre-compiles Tailwind CSS and purges unused utilities. Custom layouts using new utility classes won't have corresponding CSS rules.

**Solution:**
Add missing utilities manually to `assets/css/custom.css`:

```css
/* Add Tailwind utilities not in pre-compiled theme CSS */
.space-x-12 > :not([hidden]) ~ :not([hidden]) {
  margin-left: 3rem !important; /* 48px */
}

.gap-x-10 {
  column-gap: 2.5rem !important; /* 40px */
}

.ml-8 {
  margin-left: 2rem !important; /* 32px */
}
```

Use `!important` to ensure they override bundled CSS.

### Issue: Changes Deploy But Don't Appear

**Symptoms:**
- GitHub Actions shows successful deployment
- Changes work locally with `hugo server`
- Changes don't appear on live site

**Solutions:**
1. **Hard refresh browser:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear browser cache:** DevTools → Network tab → Disable cache
3. **Wait for CDN:** GitHub Pages CDN can take 2-5 minutes to update
4. **Check CSS bundle:** Inspect page source, find `main.bundle.min.*.css` link, verify fingerprint changed

### Issue: Sidebar Layout Not Visible

**Symptoms:**
- Sidebar content appears but no styling
- Border separator missing
- Social icons have no spacing

**Root Cause:**
Custom CSS in wrong location (see "Custom CSS Not Loading" above).

**Additional Checks:**
1. Verify `layouts/partials/sidebar.html` exists
2. Check sidebar is injected via `<template id=sidebar-template>` in head
3. Ensure `@media (min-width: 1024px)` body margin is applied

### Debugging Checklist

When custom styles don't work:

1. **Check file location:**
   - ✅ `assets/css/custom.css`
   - ❌ `static/css/custom.css`

2. **Verify CSS loads:**
   ```bash
   curl -s https://miska.dev/ | grep -o 'main.bundle.min.[^"]*'
   curl https://miska.dev/css/main.bundle.min.[hash].css | grep "your-custom-class"
   ```

3. **Test locally:**
   ```bash
   hugo server --buildDrafts
   # Visit http://localhost:1313
   ```

4. **Check git status:**
   ```bash
   git status  # Ensure files are committed
   gh run list --limit 1  # Verify deployment succeeded
   ```

5. **Hard refresh browser:**
   - Chrome/Edge/Firefox: Ctrl+Shift+R
   - Safari: Cmd+Shift+R

## License

Content: © 2025 Miska Hämäläinen
Code: MIT License

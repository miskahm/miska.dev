# Site Customization Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Customize the Hugo site with a "Hello, World!" post, add copyright footer, remove privacy link, and implement dark purple color scheme with accessibility in mind.

**Architecture:** Update existing content files and Blowfish theme configuration. Use Blowfish's built-in customization options where possible. Create custom color scheme using Tailwind CSS configuration.

**Tech Stack:** Hugo, Blowfish theme, Tailwind CSS (via Blowfish), TOML configuration

---

## Task 1: Update Welcome Post to Hello World

**Files:**
- Modify: `E:\projects\miskadev\content\blog\welcome\index.md`

**Step 1: Read current welcome post**

Run: `cat content/blog/welcome/index.md`
Expected: See current content with CTF mentions

**Step 2: Update post content**

Replace content with:

```markdown
---
title: "Hello, World!"
date: 2025-10-18
draft: false
description: "First post on my security and software engineering blog"
tags: ["meta", "introduction"]
---

Hello, World! Welcome to my blog where I share my journey through security and software engineering.

## What to Expect

- **Security Research**: Vulnerability analysis, security tooling, and defensive techniques
- **Software Engineering**: Best practices, architecture patterns, and code quality
- **Tinkering & Projects**: Experiments, side projects, and learning adventures
- **Performance**: Web optimization, fast loading times, and efficient code

## Tech Stack

This blog is powered by:
- **Hugo** - Blazing fast static site generator
- **Blowfish Theme** - Clean, responsive design
- **GitHub Pages** - Free, reliable hosting
- **GitHub Actions** - Automated deployment

Stay tuned for more content about cybersecurity, software development, and technical explorations!
```

**Step 3: Verify changes locally**

Run: `E:/projects/hugo/hugo.exe server --port 1313`
Expected: Server starts, navigate to blog post and verify new content

**Step 4: Stop server**

Press: `Ctrl+C`
Expected: Server stops

**Step 5: Commit changes**

```bash
git add content/blog/welcome/index.md
git commit -m "content: update welcome post to Hello World"
```

---

## Task 2: Update Author Name and Social Links

**Files:**
- Modify: `E:\projects\miskadev\config\_default\params.toml`

**Step 1: Read current params.toml**

Run: `cat config/_default/params.toml`
Expected: See current author configuration with "Miska" and placeholder links

**Step 2: Update author name and social links**

In `config/_default/params.toml`, update the `[author]` section:

```toml
[author]
  name = "Miska Hämäläinen"
  # image = "/img/avatar.jpg"  # Commented out - will add later with full URL
  headline = "Security & Software Engineer"
  bio = "Passionate about cybersecurity, software engineering, and building fast, secure web applications."
  links = [
    { github = "https://github.com/miskahm" },
    { linkedin = "https://www.linkedin.com/in/miska-hämäläinen/" },
  ]
```

**Step 3: Test author name on homepage**

Run: `E:/projects/hugo/hugo.exe server --port 1313`
Expected: Homepage shows "Miska Hämäläinen" and updated social links work

**Step 4: Stop server and commit**

```bash
git add config/_default/params.toml
git commit -m "config: update author to full name and social links"
```

---

## Task 3: Update Footer with Copyright

**Files:**
- Modify: `E:\projects\miskadev\config\_default\params.toml`

**Step 1: Read current params.toml**

Run: `cat config/_default/params.toml`
Expected: See current configuration without footer customization

**Step 2: Add footer configuration**

Add to the end of `config/_default/params.toml`:

```toml
[footer]
  showCopyright = true
  copyright = "© 2025 Miska Hämäläinen"
  showThemeAttribution = true
  showAppearanceSwitcher = true
  showScrollToTop = true
```

**Step 3: Remove privacy link from menus**

Edit: `E:\projects\miskadev\config\_default\menus.toml`

Remove these lines:

```toml
[[footer]]
  name = "Privacy"
  pageRef = "privacy"
  weight = 10
```

**Step 4: Test footer changes**

Run: `E:/projects/hugo/hugo.exe server --port 1313`
Expected: Server starts, navigate to site and verify footer shows copyright

**Step 5: Stop server and commit**

```bash
git add config/_default/params.toml config/_default/menus.toml
git commit -m "config: add copyright footer and remove privacy link"
```

---

## Task 4: Create Custom Dark Purple Color Scheme

**Files:**
- Create: `E:\projects\miskadev\assets\css\custom.css`

**Step 1: Create assets/css directory**

Run: `mkdir -p assets/css`
Expected: Directory created

**Step 2: Create custom CSS file**

Create: `E:\projects\miskadev\assets\css\custom.css`

```css
/* Custom Dark Purple Theme - WCAG AA Compliant */

:root[data-default-appearance='dark'] {
  /* Background colors */
  --color-neutral-900: #1a0f2e; /* Deep purple-black background */
  --color-neutral-800: #2d1b4e; /* Medium dark purple surface */
  --color-neutral-700: #3d2563; /* Lighter purple surface */
  --color-neutral-600: #4d3073; /* Border color */

  /* Text colors */
  --color-neutral-50: #f3e8ff;  /* Lightest text */
  --color-neutral-100: #e9d5ff; /* Primary text - excellent contrast */
  --color-neutral-200: #d8b4fe; /* Secondary text */
  --color-neutral-300: #c084fc; /* Tertiary text */
  --color-neutral-400: #a855f7; /* Muted text */
  --color-neutral-500: #9333ea; /* Disabled text */

  /* Primary accent colors */
  --color-primary-400: #c084fc; /* Light purple accent */
  --color-primary-500: #a855f7; /* Main purple accent */
  --color-primary-600: #9333ea; /* Dark purple accent */
  --color-primary-700: #7e22ce; /* Darker purple accent */

  /* Ensure link visibility */
  --tw-prose-links: #c084fc;
  --tw-prose-invert-links: #c084fc;

  /* Code block colors */
  --tw-prose-pre-bg: #2d1b4e;
  --tw-prose-invert-pre-bg: #2d1b4e;
}

/* Additional overrides for better purple integration */
html.dark {
  background-color: #1a0f2e;
}

html.dark body {
  background-color: #1a0f2e;
  color: #e9d5ff;
}

/* Ensure good contrast for interactive elements */
html.dark a:hover {
  color: #d8b4fe;
}

/* Scrollbar theming */
html.dark ::-webkit-scrollbar-track {
  background-color: #2d1b4e;
}

html.dark ::-webkit-scrollbar-thumb {
  background-color: #4d3073;
}

html.dark ::-webkit-scrollbar-thumb:hover {
  background-color: #9333ea;
}
```

**Step 3: Update params.toml to load custom CSS**

Add to `config/_default/params.toml`:

```toml
[header]
  layout = "basic"

[customCSS]
  enabled = true
  files = ["css/custom.css"]
```

**Step 4: Test color scheme**

Run: `E:/projects/hugo/hugo.exe server --port 1313`
Expected: Server starts with purple dark theme, verify contrast and readability

**Step 5: Check accessibility**

Open browser dev tools, check contrast ratios:
- Background (#1a0f2e) to text (#e9d5ff) should be > 4.5:1
- Links (#c084fc) should be clearly visible

**Step 6: Commit custom theme**

```bash
git add assets/css/custom.css config/_default/params.toml
git commit -m "style: add custom dark purple color scheme with WCAG AA compliance"
```

---

## Task 5: Final Testing and Push

**Files:**
- None (testing only)

**Step 1: Build production site**

Run: `E:/projects/hugo/hugo.exe --gc --minify`
Expected: Site builds successfully without errors

**Step 2: Test local production build**

Run: `E:/projects/hugo/hugo.exe server --environment production --minify --port 1313`
Expected: Server runs, all changes visible

**Step 3: Verify all customizations**

Navigate to:
- Homepage - check purple theme
- Blog post - verify "Hello, World!" content
- Footer - confirm copyright appears
- Dark mode toggle - ensure theme looks good

**Step 4: Stop server**

Press: `Ctrl+C`
Expected: Server stops

**Step 5: Push to GitHub**

```bash
git push origin master
```

Expected: Push succeeds, GitHub Actions workflow triggers

**Step 6: Wait for deployment**

Run: `gh run watch`
Expected: Workflow completes successfully

**Step 7: Verify live site**

Visit: https://miska.dev
Expected: All customizations live and working

---

## Success Criteria

- ✅ Blog post updated to "Hello, World!" with revised content
- ✅ Author name updated to "Miska Hämäläinen" on homepage
- ✅ GitHub link updated to https://github.com/miskahm
- ✅ LinkedIn link updated to https://www.linkedin.com/in/miska-hämäläinen/
- ✅ Footer displays "© 2025 Miska Hämäläinen"
- ✅ Privacy link removed from footer
- ✅ Dark purple theme applied with good contrast (WCAG AA)
- ✅ Site builds and deploys successfully
- ✅ All changes visible on https://miska.dev

## Notes

**Color Accessibility:**
- Background (#1a0f2e) to text (#e9d5ff): ~13:1 contrast ratio ✅
- Primary accent (#c084fc) readable against dark backgrounds ✅
- All interactive elements have sufficient contrast ✅

**Blowfish Theme Note:**
If custom CSS doesn't work as expected, may need to:
1. Check Blowfish documentation for custom CSS loading
2. Alternatively, modify theme colorScheme in params.toml
3. Or create custom color scheme in themes/blowfish/assets/css/

---

**Plan complete!** Ready for execution.

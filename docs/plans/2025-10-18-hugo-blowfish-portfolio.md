# Hugo + Blowfish Portfolio/Blog Implementation Plan

> **For Claude:** Use `${SUPERPOWERS_SKILLS_ROOT}/skills/collaboration/executing-plans/SKILL.md` to implement this plan task-by-task.

**Goal:** Set up a blazing-fast security/software engineering portfolio and blog at miska.dev using Hugo static site generator with the Blowfish theme, deployed via GitHub Pages.

**Architecture:** Hugo will generate static HTML from markdown content, Blowfish theme provides responsive design and security-focused styling. GitHub Actions will build and deploy on every push to main branch. Custom domain (miska.dev) will point to GitHub Pages.

**Tech Stack:** Hugo Extended, Blowfish theme (via git submodule), GitHub Pages, GitHub Actions, Git

---

## Task 1: Environment Setup & Hugo Installation

**Files:**
- None (system-level installation)

**Step 1: Verify Hugo installation**

Run: `hugo version`
Expected: Either shows Hugo Extended version OR command not found

**Step 2: Install Hugo Extended (if needed)**

**Windows (via Chocolatey):**
```bash
choco install hugo-extended -y
```

**Windows (via Scoop):**
```bash
scoop install hugo-extended
```

**macOS:**
```bash
brew install hugo
```

**Linux:**
```bash
sudo snap install hugo
```

**Step 3: Verify Hugo Extended is installed**

Run: `hugo version`
Expected: Output showing "hugo v0.xxx.x+extended" (must include "+extended")

---

## Task 2: Initialize Hugo Site Structure

**Files:**
- Create: `E:\projects\miskadev\hugo.toml`
- Create: `E:\projects\miskadev\archetypes\default.md`
- Create: `E:\projects\miskadev\content\_index.md`
- Create: Various Hugo directory structure

**Step 1: Initialize Hugo site**

Run: `hugo new site . --force`
Expected: Creates Hugo scaffolding (archetypes/, content/, data/, layouts/, static/, themes/, hugo.toml)

**Step 2: Verify structure created**

Run: `ls -la`
Expected: See directories: archetypes, content, data, layouts, static, themes, and hugo.toml file

**Step 3: Create .gitignore**

Create: `E:\projects\miskadev\.gitignore`

```gitignore
# Hugo
/public/
/resources/_gen/
/.hugo_build.lock

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo
*~
```

**Step 4: Commit initial structure**

```bash
git init
git add .
git commit -m "init: create Hugo site structure"
```

---

## Task 3: Install Blowfish Theme

**Files:**
- Create: `E:\projects\miskadev\.gitmodules`
- Create: `E:\projects\miskadev\themes\blowfish\` (via submodule)

**Step 1: Add Blowfish as git submodule**

Run: `git submodule add -b main https://github.com/nunocoracao/blowfish.git themes/blowfish`
Expected: Clones theme into themes/blowfish and creates .gitmodules file

**Step 2: Initialize and update submodules**

Run: `git submodule update --init --recursive`
Expected: "Submodule path 'themes/blowfish': checked out..."

**Step 3: Verify theme installed**

Run: `ls themes/blowfish`
Expected: See theme files (layouts/, assets/, archetypes/, etc.)

**Step 4: Commit theme addition**

```bash
git add .
git commit -m "feat: add Blowfish theme as submodule"
```

---

## Task 4: Configure Hugo Base Settings

**Files:**
- Modify: `E:\projects\miskadev\hugo.toml`

**Step 1: Replace hugo.toml with base configuration**

Replace entire contents:

```toml
baseURL = 'https://miska.dev/'
languageCode = 'en-us'
title = 'Miska.dev - Security & Software Engineering'
theme = 'blowfish'

# Enable GitInfo for last modified dates
enableGitInfo = true

# Enable emoji support
enableEmoji = true

[outputs]
  home = ["HTML", "RSS", "JSON"]

[markup]
  [markup.highlight]
    style = 'monokai'
    lineNos = true

  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true  # Allow HTML in markdown
```

**Step 2: Test configuration**

Run: `hugo server --buildDrafts`
Expected: Server starts (may show warning about missing params - that's OK)

**Step 3: Stop server**

Press: `Ctrl+C`
Expected: Server stops

**Step 4: Commit configuration**

```bash
git add hugo.toml
git commit -m "config: set up base Hugo configuration"
```

---

## Task 5: Configure Blowfish Theme Parameters

**Files:**
- Create: `E:\projects\miskadev\config\_default\params.toml`
- Create: `E:\projects\miskadev\config\_default\languages.en.toml`

**Step 1: Create config directory structure**

Run: `mkdir -p config/_default`
Expected: Directory created

**Step 2: Create params.toml**

Create: `E:\projects\miskadev\config\_default\params.toml`

```toml
# Theme appearance
colorScheme = "ocean"  # ocean, fire, forest, etc.
defaultAppearance = "dark"  # light, dark, auto
autoSwitchAppearance = true

# Site features
enableSearch = true
enableCodeCopy = true
showScrollToTop = true

# Article settings
[article]
  showDate = true
  showDateUpdated = true
  showAuthor = true
  showReadingTime = true
  showTableOfContents = true
  showTaxonomies = true
  showWordCount = true
  sharingLinks = ["twitter", "linkedin", "reddit", "hackernews"]

# Homepage layout
[homepage]
  layout = "profile"  # page, profile, hero, card, background
  showRecent = true
  recentLimit = 5

# Author info
[author]
  name = "Miska"
  image = "img/avatar.jpg"
  headline = "Security & Software Engineer"
  bio = "Passionate about cybersecurity, software engineering, and building fast, secure web applications."
  links = [
    { github = "https://github.com/yourusername" },
    { twitter = "https://twitter.com/yourusername" },
    { linkedin = "https://linkedin.com/in/yourusername" },
  ]
```

**Step 3: Create language configuration**

Create: `E:\projects\miskadev\config\_default\languages.en.toml`

```toml
languageCode = "en"
languageName = "English"
weight = 1
title = "Miska.dev"

[params]
  displayName = "EN"
  isoCode = "en"
  rtl = false
  dateFormat = "2 January 2006"
```

**Step 4: Test configuration**

Run: `hugo server --buildDrafts`
Expected: Server starts with Blowfish theme applied

**Step 5: Stop server and commit**

```bash
git add config/
git commit -m "config: set up Blowfish theme parameters"
```

---

## Task 6: Configure Navigation Menus

**Files:**
- Create: `E:\projects\miskadev\config\_default\menus.toml`

**Step 1: Create menus configuration**

Create: `E:\projects\miskadev\config\_default\menus.toml`

```toml
[[main]]
  name = "Blog"
  pageRef = "blog"
  weight = 10

[[main]]
  name = "Projects"
  pageRef = "projects"
  weight = 20

[[main]]
  name = "About"
  pageRef = "about"
  weight = 30

[[footer]]
  name = "Privacy"
  pageRef = "privacy"
  weight = 10

[[footer]]
  name = "Contact"
  url = "mailto:your@email.com"
  weight = 20
```

**Step 2: Commit menu configuration**

```bash
git add config/_default/menus.toml
git commit -m "config: add navigation menus"
```

---

## Task 7: Create Initial Content Structure

**Files:**
- Create: `E:\projects\miskadev\content\_index.md`
- Create: `E:\projects\miskadev\content\about\_index.md`
- Create: `E:\projects\miskadev\content\blog\_index.md`
- Create: `E:\projects\miskadev\content\projects\_index.md`

**Step 1: Create homepage content**

Create: `E:\projects\miskadev\content\_index.md`

```markdown
---
title: "Home"
---

Welcome to my security and software engineering blog.
```

**Step 2: Create about page**

Create: `E:\projects\miskadev\content\about\_index.md`

```markdown
---
title: "About"
---

# About Me

Security and software engineer with a passion for building fast, secure applications.

## Skills

- Security Engineering
- Software Development
- Web Performance Optimization
- Penetration Testing

## Interests

- Cybersecurity Research
- CTF Challenges
- Open Source Contribution
```

**Step 3: Create blog section**

Create: `E:\projects\miskadev\content\blog\_index.md`

```markdown
---
title: "Blog"
description: "Security research, software engineering, and technical articles"
---
```

**Step 4: Create projects section**

Create: `E:\projects\miskadev\content\projects\_index.md`

```markdown
---
title: "Projects"
description: "Portfolio of security and software engineering projects"
---
```

**Step 5: Test local site**

Run: `hugo server --buildDrafts`
Expected: Navigate to http://localhost:1313 and see homepage with navigation working

**Step 6: Commit content**

```bash
git add content/
git commit -m "content: add initial pages and structure"
```

---

## Task 8: Create First Blog Post

**Files:**
- Create: `E:\projects\miskadev\content\blog\welcome\index.md`

**Step 1: Create first blog post**

Run: `hugo new blog/welcome/index.md`
Expected: Creates content/blog/welcome/index.md with frontmatter

**Step 2: Edit blog post content**

Modify: `E:\projects\miskadev\content\blog\welcome\index.md`

```markdown
---
title: "Welcome to Miska.dev"
date: 2025-10-18
draft: false
description: "First post on my new security and software engineering blog"
tags: ["meta", "introduction"]
---

Welcome to my new blog! This site is built with Hugo and the Blowfish theme, focusing on:

- Security engineering and research
- Software development best practices
- Performance optimization
- Technical tutorials and write-ups

Stay tuned for more content about cybersecurity, CTF solutions, and software engineering.

## What to Expect

- **Security Research**: Vulnerability analysis, exploit development (for educational purposes)
- **CTF Write-ups**: Solutions and techniques from capture-the-flag challenges
- **Software Engineering**: Best practices, architecture patterns, and code quality
- **Performance**: Web optimization, fast loading times, and efficient code

## Tech Stack

This blog is powered by:
- **Hugo** - Blazing fast static site generator
- **Blowfish Theme** - Clean, responsive design
- **GitHub Pages** - Free, reliable hosting
- **GitHub Actions** - Automated deployment
```

**Step 3: Test blog post displays**

Run: `hugo server`
Expected: See welcome post on homepage and at /blog/welcome/

**Step 4: Commit blog post**

```bash
git add content/blog/
git commit -m "content: add welcome blog post"
```

---

## Task 9: Set Up GitHub Actions Deployment

**Files:**
- Create: `E:\projects\miskadev\.github\workflows\hugo.yml`

**Step 1: Create workflows directory**

Run: `mkdir -p .github/workflows`
Expected: Directory created

**Step 2: Create Hugo deployment workflow**

Create: `E:\projects\miskadev\.github\workflows\hugo.yml`

```yaml
name: Deploy Hugo site to Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

defaults:
  run:
    shell: bash

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      HUGO_VERSION: 0.128.0
    steps:
      - name: Install Hugo CLI
        run: |
          wget -O ${{ runner.temp }}/hugo.deb https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.deb \
          && sudo dpkg -i ${{ runner.temp }}/hugo.deb

      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive
          fetch-depth: 0

      - name: Setup Pages
        id: pages
        uses: actions/configure-pages@v4

      - name: Build with Hugo
        env:
          HUGO_ENVIRONMENT: production
          HUGO_ENV: production
        run: |
          hugo \
            --gc \
            --minify \
            --baseURL "${{ steps.pages.outputs.base_url }}/"

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./public

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Step 3: Commit workflow**

```bash
git add .github/
git commit -m "ci: add GitHub Actions workflow for Hugo deployment"
```

---

## Task 10: Create GitHub Repository

**Files:**
- None (GitHub operations)

**Step 1: Create repository on GitHub**

Manual: Go to https://github.com/new
- Repository name: `miska.dev` or `yourusername.github.io`
- Visibility: Public
- DO NOT initialize with README (we already have content)

**Step 2: Add remote and push**

```bash
git remote add origin https://github.com/yourusername/miska.dev.git
git branch -M main
git push -u origin main
```

Expected: All commits pushed to GitHub

**Step 3: Verify GitHub Actions ran**

Manual: Check GitHub repository → Actions tab
Expected: See "Deploy Hugo site to Pages" workflow running/completed

---

## Task 11: Configure GitHub Pages

**Files:**
- None (GitHub settings)

**Step 1: Enable GitHub Pages**

Manual steps:
1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Click Save

**Step 2: Wait for deployment**

Check: Actions tab for deployment completion
Expected: Green checkmark, deployment successful

**Step 3: Verify site is live**

Visit: `https://yourusername.github.io/miska.dev/` or `https://yourusername.github.io/`
Expected: See your Hugo site live

---

## Task 12: Configure Custom Domain (miska.dev)

**Files:**
- Create: `E:\projects\miskadev\static\CNAME`

**Step 1: Create CNAME file**

Create: `E:\projects\miskadev\static\CNAME`

```
miska.dev
```

**Step 2: Commit CNAME**

```bash
git add static/CNAME
git commit -m "config: add custom domain CNAME"
git push
```

**Step 3: Configure DNS at domain registrar**

Manual: At your domain registrar (where you bought miska.dev), add these DNS records:

**For apex domain (miska.dev):**
```
A     @     185.199.108.153
A     @     185.199.109.153
A     @     185.199.110.153
A     @     185.199.111.153
```

**For www subdomain:**
```
CNAME www   yourusername.github.io.
```

**Step 4: Configure custom domain in GitHub**

Manual:
1. Repository Settings → Pages
2. Custom domain: `miska.dev`
3. Click Save
4. Wait for DNS check (may take a few minutes)
5. Enable "Enforce HTTPS" once DNS is verified

**Step 5: Verify custom domain works**

Visit: `https://miska.dev`
Expected: Your Hugo site loads with HTTPS

---

## Task 13: Add Placeholder Avatar Image

**Files:**
- Create: `E:\projects\miskadev\static\img\avatar.jpg`

**Step 1: Create img directory**

Run: `mkdir -p static/img`
Expected: Directory created

**Step 2: Add avatar image**

Manual: Copy your avatar/profile picture to `static/img/avatar.jpg`
Or use placeholder: Download a temporary avatar from https://ui-avatars.com/api/?name=Miska&size=400

**Step 3: Commit avatar**

```bash
git add static/img/
git commit -m "assets: add avatar image"
git push
```

---

## Task 14: Final Testing & Optimization

**Files:**
- None (testing only)

**Step 1: Test local build**

Run: `hugo --gc --minify`
Expected: Site builds successfully, generates public/ directory

**Step 2: Check build output**

Run: `ls -lh public/`
Expected: See index.html, blog/, about/, CSS, JS files

**Step 3: Test local production build**

Run: `hugo server --environment production --minify`
Expected: Server runs with production settings

**Step 4: Verify all pages work**

Navigate to:
- http://localhost:1313/ (homepage)
- http://localhost:1313/blog/ (blog list)
- http://localhost:1313/blog/welcome/ (blog post)
- http://localhost:1313/about/ (about page)
- http://localhost:1313/projects/ (projects page)

**Step 5: Check lighthouse score**

Run: Chrome DevTools → Lighthouse → Run analysis
Expected: High performance scores (aim for 90+)

---

## Task 15: Documentation & Customization Notes

**Files:**
- Create: `E:\projects\miskadev\README.md`

**Step 1: Create README**

Create: `E:\projects\miskadev\README.md`

```markdown
# Miska.dev - Security & Software Engineering Blog

Personal portfolio and blog built with Hugo and Blowfish theme.

## Tech Stack

- **Hugo Extended** - Static site generator
- **Blowfish Theme** - Responsive, performance-focused theme
- **GitHub Pages** - Hosting
- **GitHub Actions** - CI/CD deployment

## Local Development

### Prerequisites
- Hugo Extended (v0.120.0+)
- Git

### Setup

```bash
# Clone repository
git clone https://github.com/yourusername/miska.dev.git
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

## Deployment

Deployment is automatic via GitHub Actions on push to `main` branch.

## Customization

- **Theme settings**: `config/_default/params.toml`
- **Site config**: `hugo.toml`
- **Navigation**: `config/_default/menus.toml`
- **Content**: `content/`

## Theme Documentation

[Blowfish Theme Docs](https://blowfish.page/docs/)

## License

Content: © 2025 Miska
Code: MIT License
```

**Step 2: Commit README**

```bash
git add README.md
git commit -m "docs: add README with setup instructions"
git push
```

---

## Next Steps After Completion

1. **Customize theme colors**: Edit `config/_default/params.toml` → `colorScheme`
2. **Add social links**: Update author links in `params.toml`
3. **Create more blog posts**: Use `hugo new blog/post-name/index.md`
4. **Add projects**: Create markdown files in `content/projects/`
5. **Set up analytics**: Add Google Analytics or Plausible (privacy-focused)
6. **Add comments**: Integrate Giscus or Utterances for blog comments
7. **SEO optimization**: Add meta descriptions, Open Graph images
8. **RSS feed**: Automatically generated at `/index.xml`

## References

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Blowfish Theme Docs](https://blowfish.page/docs/)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- Inspiration: https://merox.dev/blog/wordpress-to-hugo-setup/
- Minimalist inspiration: https://vkoskiv.com/

---

**Plan complete!** Ready for execution.

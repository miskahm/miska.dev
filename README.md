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

## License

Content: © 2025 Miska Hämäläinen
Code: MIT License

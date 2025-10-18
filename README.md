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
├── static/             # Static assets
│   ├── img/           # Images
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

### Theme Settings
Edit `config/_default/params.toml` to customize:
- Color scheme
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
- Main navigation menu
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

Content: © 2025 Miska
Code: MIT License

## Inspiration

- Design inspiration: https://vkoskiv.com/
- Setup guide: https://merox.dev/blog/wordpress-to-hugo-setup/

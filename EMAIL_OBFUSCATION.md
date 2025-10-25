# Email Obfuscation Implementation

This site uses CSS `display: none` email obfuscation to protect email addresses from spam bots while maintaining full accessibility for screen readers and legitimate users.

## How It Works

The obfuscation technique inserts a decoy domain segment that is hidden via CSS:

**HTML Output:**
```html
<span class="email">contact@miska<b>.miska</b>.dev</span>
```

**Visual Rendering:** `contact@miska.dev`

**Bot Sees:** `contact@miska.miska.dev` (invalid)

## Implementation Details

### 1. CSS Rule (assets/css/custom.css)
```css
span.email b {
  display: none;
}
```

### 2. Hugo Shortcode (layouts/shortcodes/email.html)

Use the shortcode in your markdown content:

```markdown
Contact me at {{< email >}} for inquiries.

Or specify a custom email:
{{< email "custom@example.com" >}}
```

The shortcode automatically uses `site.Params.author.email` from your configuration as the default.

### 3. Automatic Obfuscation in Templates

**Sidebar (layouts/partials/sidebar.html):**
- Email icon link uses obfuscated mailto link
- Automatically processes `site.Params.author.email`

**Footer (layouts/partials/footer.html):**
- Any `mailto:` links in footer menus are automatically obfuscated
- Works with the "Contact" menu item

## Configuration

Your email is configured in `config/_default/params.toml`:

```toml
[author]
  email = "contact@miska.dev"
  links = [
    { email = "mailto:contact@miska.dev" },
    ...
  ]
```

## Accessibility

This implementation uses `display: none` specifically for accessibility compliance. Other hiding techniques (font-size: 0, position off-screen) break screen readers. The `display: none` method:

✅ Works with screen readers
✅ Blocks spam bot email harvesters
✅ Maintains correct mailto: functionality
✅ No JavaScript required

## Effectiveness

According to research by Henk Verlinde (https://henkverlinde.com/blog/email-obfuscation/), CSS `display: none` obfuscation is highly effective against spam bots, as most email harvesters don't process CSS rules.

## Testing

To verify the obfuscation is working:

1. **Build the site:**
   ```bash
   hugo
   ```

2. **Check generated HTML** in `docs/` folder - you should see:
   ```html
   <span class="email">contact@miska<b>.miska</b>.dev</span>
   ```

3. **Visual test:** The email should display as `contact@miska.dev` in your browser

4. **Source test:** View page source - the hidden `<b>` tag should be present

## Usage Examples

### In Markdown Content

```markdown
## Contact

Feel free to reach out via email: {{< email >}}

For business inquiries: {{< email "business@example.com" >}}
```

### In HTML Templates

```html
<span class="email">
  contact@miska<b>.miska</b>.dev
</span>
```

## Limitations

- Only works for emails with single-level TLDs (.com, .dev, etc.)
- Does not support multi-level TLDs (.co.uk, .com.au) without modification
- Requires CSS to be enabled (graceful degradation)

## Future Enhancements

To support multi-level TLDs, the shortcode would need logic to handle:
- `example.co.uk` → `example<b>.example</b>.co.uk`
- `example.com.au` → `example<b>.example</b>.com.au`

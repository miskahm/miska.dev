---
title: "Laws of UX for Developers: Why You Should Care About Design Principles"
date: 2025-10-18
draft: true
description: "A technical guide to applying UX psychology principles in your code - from API design to component architecture"
tags: ["ux", "ui", "design", "frontend", "user-experience"]
---

You're a developer, not a designer. You write code, not mockups. So why should you care about UX principles?

Here's why: **Every technical decision you make affects user experience**. The API you design, the error messages you write, the loading states you implement - all of it impacts how people interact with your software.

[Laws of UX](https://lawsofux.com/) distills decades of psychology research into practical design principles. Let's translate them into terms developers understand - with code examples.

## 1. Fitts's Law: Size and Distance Matter

**The Law:** The time to acquire a target is a function of the distance to and size of the target.

**Translation for developers:** Bigger, closer buttons are easier to click. More frequently used actions should be larger and more accessible.

**Bad:**
```jsx
// Tiny, hard-to-hit delete button
<button style={{padding: '2px', fontSize: '10px'}}>Delete Account</button>
```

**Good:**
```jsx
// Large, easy-to-hit primary action
<button className="btn-primary btn-lg">
  Sign Up Now
</button>

// Destructive action is still accessible but requires more deliberate action
<button className="btn-link text-sm text-red-600">
  Delete Account
</button>
```

**Code pattern - Touch targets:**
```css
/* Minimum 44x44px touch targets for mobile (Apple HIG, WCAG guidelines) */
.btn {
  min-width: 44px;
  min-height: 44px;
  padding: 12px 24px;
}

/* Increase clickable area without changing visual size */
.icon-button {
  position: relative;
}

.icon-button::before {
  content: '';
  position: absolute;
  top: -12px;
  left: -12px;
  right: -12px;
  bottom: -12px;
}
```

## 2. Hick's Law: Too Many Choices Paralyze Users

**The Law:** The time it takes to make a decision increases with the number and complexity of choices.

**Translation for developers:** Limit options in forms, navigation, and API parameters. Progressive disclosure is your friend.

**Bad:**
```jsx
// Overwhelming form with 20 fields at once
<form>
  <input name="firstName" />
  <input name="lastName" />
  <input name="email" />
  <input name="phone" />
  <input name="address1" />
  <input name="address2" />
  <input name="city" />
  <input name="state" />
  <input name="zip" />
  <input name="country" />
  {/* 10 more fields... */}
</form>
```

**Good:**
```jsx
// Multi-step form - show only what's needed
function SignUpWizard() {
  const [step, setStep] = useState(1);

  return (
    <div>
      {step === 1 && <BasicInfo onNext={() => setStep(2)} />}
      {step === 2 && <AddressInfo onNext={() => setStep(3)} />}
      {step === 3 && <Preferences onSubmit={handleSignUp} />}
    </div>
  );
}
```

**API design example:**
```javascript
// Bad: Too many parameters
function createUser({
  name, email, password, avatar, bio, twitter, linkedin, github,
  notifications, theme, language, timezone, newsletter, ...
}) {
  // Too much to think about
}

// Good: Required fields + sensible defaults
function createUser({ name, email, password, options = {} }) {
  const defaults = {
    notifications: true,
    theme: 'auto',
    language: 'en',
    newsletter: false
  };
  return { ...defaults, ...options, name, email, password };
}
```

## 3. Miller's Law: Working Memory Holds 7±2 Items

**The Law:** The average person can hold 7±2 items in working memory.

**Translation for developers:** Group related items. Limit nav menu items. Chunk information.

**Bad:**
```jsx
// 15 top-level navigation items
<nav>
  <a href="/dashboard">Dashboard</a>
  <a href="/users">Users</a>
  <a href="/teams">Teams</a>
  <a href="/projects">Projects</a>
  <a href="/tasks">Tasks</a>
  <a href="/files">Files</a>
  <a href="/calendar">Calendar</a>
  <a href="/messages">Messages</a>
  <a href="/analytics">Analytics</a>
  <a href="/reports">Reports</a>
  <a href="/settings">Settings</a>
  {/* More items... */}
</nav>
```

**Good:**
```jsx
// Grouped into logical categories
<nav>
  <NavGroup title="Workspace">
    <NavItem>Dashboard</NavItem>
    <NavItem>Projects</NavItem>
    <NavItem>Tasks</NavItem>
  </NavGroup>

  <NavGroup title="Team">
    <NavItem>Users</NavItem>
    <NavItem>Teams</NavItem>
    <NavItem>Messages</NavItem>
  </NavGroup>

  <NavGroup title="Analytics">
    <NavItem>Reports</NavItem>
    <NavItem>Insights</NavItem>
  </NavGroup>
</nav>
```

**Practical pattern - Formatting numbers:**
```javascript
// Hard to read
const price = 1234567.89;

// Easier to parse (chunked)
const formattedPrice = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
}).format(price);
// "$1,234,567.89"
```

## 4. Jakob's Law: Users Spend Time on Other Sites

**The Law:** Users prefer your site to work the same way as all the other sites they already know.

**Translation for developers:** Don't reinvent common patterns. Use standard UI conventions.

**Bad:**
```jsx
// Custom, unintuitive search that opens on hover
<div onMouseEnter={openSearch}>
  <SearchIcon />
</div>
```

**Good:**
```jsx
// Standard search pattern everyone recognizes
<input
  type="search"
  placeholder="Search..."
  className="search-input"
/>
```

**Use established patterns:**
- Logo in top-left links to homepage
- Shopping cart icon in top-right
- Hamburger menu for mobile nav
- Ctrl/Cmd+S to save
- Escape to close modals

```jsx
// Keyboard shortcuts users expect
useEffect(() => {
  const handleKeyPress = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      save();
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

## 5. Law of Proximity: Group Related Items

**The Law:** Objects that are near each other appear related.

**Translation for developers:** Use spacing, not borders, to group related elements. Code structure should match visual hierarchy.

**Bad:**
```jsx
// Everything equally spaced - no visual hierarchy
<div style={{display: 'flex', gap: '16px'}}>
  <span>Name:</span>
  <span>{user.name}</span>
  <span>Email:</span>
  <span>{user.email}</span>
  <span>Phone:</span>
  <span>{user.phone}</span>
</div>
```

**Good:**
```jsx
// Grouped by relationship
<div className="user-info">
  <div className="info-group">
    <label>Name:</label>
    <span>{user.name}</span>
  </div>

  <div className="info-group">
    <label>Email:</label>
    <span>{user.email}</span>
  </div>

  <div className="info-group">
    <label>Phone:</label>
    <span>{user.phone}</span>
  </div>
</div>

<style>{`
  .info-group {
    margin-bottom: 24px; /* Space between groups */
  }

  .info-group label {
    display: block;
    margin-bottom: 4px; /* Tight coupling */
  }
`}</style>
```

## 6. Serial Position Effect: First and Last Are Remembered

**The Law:** Users best remember the first and last items in a series.

**Translation for developers:** Put important actions at the start or end. Don't bury critical info in the middle.

**Bad:**
```jsx
// Critical "Save" button buried in the middle
<div className="actions">
  <button>Cancel</button>
  <button>Preview</button>
  <button>Save</button>  {/* Gets lost */}
  <button>Export</button>
  <button>Share</button>
</div>
```

**Good:**
```jsx
// Primary action at the end (or start)
<div className="actions">
  <button className="btn-secondary">Cancel</button>
  <button className="btn-secondary">Preview</button>
  <button className="btn-secondary">Export</button>
  <button className="btn-primary">Save</button>  {/* Clear primary action */}
</div>
```

**Error messages pattern:**
```javascript
// Bad: Important info buried
function validateForm(data) {
  return {
    warnings: ['Field X could be improved', 'Consider adding Y'],
    errors: ['Email is required'],  // Critical error lost in the middle
    info: ['Form will be saved automatically']
  };
}

// Good: Errors first
function validateForm(data) {
  return {
    errors: ['Email is required'],  // Attention-grabbing first
    warnings: ['Field X could be improved'],
    info: ['Form will be saved automatically']
  };
}
```

## 7. Aesthetic-Usability Effect: Pretty = Usable

**The Law:** Users perceive aesthetically pleasing designs as more usable.

**Translation for developers:** Invest time in polish. Small details matter.

**Code patterns for polish:**

```jsx
// Bad: Jarring, instant transitions
<div className={isOpen ? 'modal-open' : 'modal-closed'}>
  {content}
</div>

// Good: Smooth animations
<div className={`modal ${isOpen ? 'modal-open' : 'modal-closed'}`}>
  {content}
</div>

<style>{`
  .modal {
    opacity: 0;
    transform: translateY(-20px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .modal-open {
    opacity: 1;
    transform: translateY(0);
  }
`}</style>
```

**Loading states that feel polished:**
```jsx
// Bad: No feedback
<button onClick={handleSubmit}>
  Submit
</button>

// Good: Clear loading state
<button onClick={handleSubmit} disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner /> Processing...
    </>
  ) : (
    'Submit'
  )}
</button>
```

## 8. Doherty Threshold: 400ms Response Time

**The Law:** Productivity soars when a computer and its users interact at a pace (<400ms) that ensures neither has to wait on the other.

**Translation for developers:** Optimize perceived performance. Use skeletons, optimistic updates, and instant feedback.

**Patterns for speed:**

```jsx
// Optimistic UI update
function LikeButton({ postId, initialLikes }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    // Immediate UI feedback
    setIsLiked(true);
    setLikes(prev => prev + 1);

    try {
      await api.likePost(postId);
    } catch (error) {
      // Rollback on failure
      setIsLiked(false);
      setLikes(prev => prev - 1);
      showError('Failed to like post');
    }
  };

  return (
    <button onClick={handleLike}>
      {isLiked ? '❤️' : '🤍'} {likes}
    </button>
  );
}
```

**Skeleton screens:**
```jsx
function UserProfile({ userId }) {
  const { data, isLoading } = useUser(userId);

  if (isLoading) {
    return <UserProfileSkeleton />;  // Instant, perceived performance
  }

  return <UserProfileContent data={data} />;
}

function UserProfileSkeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton-avatar" />
      <div className="skeleton-name" />
      <div className="skeleton-bio" />
    </div>
  );
}
```

## Applying Laws of UX in Your Code

### 1. Component Design Checklist

- [ ] Touch targets ≥ 44x44px (Fitts's Law)
- [ ] Limit choices to 5-7 items (Hick's Law, Miller's Law)
- [ ] Group related elements (Law of Proximity)
- [ ] Primary action visually prominent (Serial Position Effect)
- [ ] Smooth transitions, not instant (Aesthetic-Usability)
- [ ] Loading states < 400ms perceived (Doherty Threshold)
- [ ] Follow platform conventions (Jakob's Law)

### 2. Form Design Patterns

```jsx
function GoodForm() {
  return (
    <form>
      {/* Progressive disclosure - show only what's needed */}
      <FormStep>
        <Input label="Email" required />  {/* Grouped label + input */}
        <Input label="Password" type="password" required />
      </FormStep>

      {/* Feedback within 400ms */}
      <Button type="submit" loading={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Sign Up'}
      </Button>

      {/* Error at the top (Serial Position) */}
      {error && <Alert variant="error">{error}</Alert>}
    </form>
  );
}
```

### 3. Error Message Guidelines

```jsx
// Bad: Vague, technical
throw new Error('ERR_INVALID_INPUT_422');

// Good: Clear, actionable, user-friendly
throw new UserError(
  'Email address is invalid',  // What went wrong
  'Please check your email and try again'  // How to fix
);
```

## Conclusion

You don't need to be a designer to build better experiences. Understanding UX principles makes you a better developer because:

1. You write more intuitive APIs
2. Your components are easier to use
3. Your error messages actually help users
4. Your applications feel faster and more polished

**Start small:**
- Add loading states to your buttons
- Group related form fields
- Limit menu items to 7 or fewer
- Make primary actions bigger and more obvious

UX isn't just visual design - it's the sum of every decision you make as a developer.

---

*Building user-focused applications? Let's connect on [LinkedIn](https://www.linkedin.com/in/miska-hämäläinen/) or check out my [GitHub](https://github.com/miskahm) for more frontend patterns.*

**Further reading:**
- [Laws of UX](https://lawsofux.com/) - Interactive guide
- [Don't Make Me Think](https://www.amazon.com/Dont-Make-Think-Revisited-Usability/dp/0321965515) - Steve Krug
- [The Design of Everyday Things](https://www.amazon.com/Design-Everyday-Things-Revised-Expanded/dp/0465050654) - Don Norman

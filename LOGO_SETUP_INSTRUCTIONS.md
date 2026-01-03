# ScholaPulse Logo Setup Instructions

## Logo Files Required

You need to add the following logo files to the `public/` folder:

### 1. Full Logo
- **File:** `public/scholapulse-logo.png`
- **Recommended size:** 480x160px (or 3:1 aspect ratio)
- **Content:** Logo with "ScholaPulse" text and tagline "Learning, synchronized."
- **Format:** PNG with transparent background

### 2. Icon Only
- **File:** `public/scholapulse-icon.png`
- **Recommended size:** 128x128px (square)
- **Content:** Just the "S" icon with circular wave design
- **Format:** PNG with transparent background

## How to Add

1. Save the logo images you received
2. Rename them to match the filenames above
3. Place them in the `public/` folder at the root of your project:
   ```
   public/
   ├── scholapulse-logo.png
   └── scholapulse-icon.png
   ```

## Logo Component

The `ScholaPulseLogo` component will automatically use these files once they're added. It supports:
- **Full logo** (`variant="full"`) - Shows logo with text
- **Icon only** (`variant="icon"`) - Shows just the icon
- **Sizes:** `sm`, `md`, `lg`

## Usage Example

```tsx
import { ScholaPulseLogo } from '@/components/ScholaPulseLogo'

// Full logo, large size
<ScholaPulseLogo variant="full" size="lg" />

// Icon only, medium size
<ScholaPulseLogo variant="icon" size="md" />
```

## Note

If the logo files are missing, the component will show a broken image icon. Make sure to add both files for the branding to work correctly.






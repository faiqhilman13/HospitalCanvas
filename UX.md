# HospitalCanvas UX Style Guide

Comprehensive style guide for the AI-Powered Clinical Canvas platform, documenting design patterns, color systems, and component styling conventions.

## 🎨 Design Philosophy

**Core Principles:**
- **Dark Theme First**: Medical professionals work in low-light environments
- **Glass-Panel Aesthetics**: Modern, translucent UI elements with depth
- **High Contrast**: Excellent readability for clinical data
- **Accessibility**: WCAG compliant color combinations
- **Professional**: Clean, medical-grade interface design

---

## 🌈 Color System

### Primary Color Palette

**Clinical Blue (Brand Color)**
```css
--clinical-blue: #3B82F6  /* Primary brand color */
```

**Usage:**
- Primary buttons and CTAs
- Icons and accent elements
- Progress bars and active states
- Navigation elements

### Glass-Panel Color System

**Background Layers:**
```css
bg-white/5     /* Ultra-light background panels */
bg-white/10    /* Light content containers */
bg-white/20    /* Prominent elements, progress bars */
bg-white/30    /* Interactive hover states */
```

**Border System:**
```css
border-white/20    /* Subtle separators */
border-white/30    /* Standard borders */
border-white/50    /* Focus/active borders */
```

**Text Hierarchy:**
```css
text-white         /* Primary headings, important text */
text-white/90      /* Secondary headings, labels */
text-white/80      /* Body text, descriptions */
text-white/70      /* Muted text, help text */
text-white/60      /* Disabled text */
text-white/50      /* Placeholder text */
```

### Status & Semantic Colors

**Success (Green)**
```css
bg-green-500/10    /* Background */
border-green-400/30 /* Border */
text-green-200     /* Text (dark theme) */
text-green-300     /* Secondary text */
```

**Warning (Yellow/Orange)**
```css
bg-yellow-500/10   /* Background */
border-yellow-400/30 /* Border */
text-yellow-200    /* Text */
```

**Error/Critical (Red)**
```css
bg-red-500/10      /* Background */
border-red-400/30  /* Border */
text-red-200       /* Text */
```

**Info (Blue)**
```css
bg-blue-500/10     /* Background */
border-blue-400/30 /* Border */
text-blue-200      /* Text */
```

---

## 🧩 Component Patterns

### Form Elements

**Input Fields:**
```css
className="w-full text-xs bg-white/10 text-white placeholder:text-white/50 border border-white/30 rounded p-2 focus:border-white/50 focus:outline-none"
```

**Select Dropdowns:**
```css
className="w-full text-xs bg-white/10 text-white border border-white/30 rounded p-1 mt-1 focus:border-white/50 focus:outline-none"
```

**Textareas:**
```css
className="w-full text-xs bg-white/10 text-white placeholder:text-white/50 border border-white/30 rounded p-2 resize-none focus:border-white/50 focus:outline-none"
```

### Buttons

**Primary Button:**
```css
className="bg-clinical-blue text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
```

**Secondary Button:**
```css
className="bg-white/10 text-white border border-white/30 px-3 py-1 rounded hover:bg-white/20 disabled:opacity-50"
```

**Icon Button:**
```css
className="p-1 text-white/70 hover:text-white/90 hover:bg-white/10 rounded"
```

### Cards & Containers

**Main Container:**
```css
className="bg-white/5 rounded-lg p-3 space-y-2"
```

**Content Card:**
```css
className="border border-white/20 bg-white/5 rounded-lg p-3"
```

**Status Card (Dynamic):**
```css
// Success
className="border-green-400/30 bg-green-500/10 text-green-200"

// Warning  
className="border-yellow-400/30 bg-yellow-500/10 text-yellow-200"

// Error
className="border-red-400/30 bg-red-500/10 text-red-200"

// Info
className="border-blue-400/30 bg-blue-500/10 text-blue-200"
```

### Progress Elements

**Progress Bar Container:**
```css
className="w-full bg-white/20 rounded-full h-2"
```

**Progress Bar Fill:**
```css
// Success (Green)
className="h-2 rounded-full bg-green-500"

// Warning (Yellow)
className="h-2 rounded-full bg-yellow-500" 

// Error (Red)
className="h-2 rounded-full bg-red-500"
```

**Status Badges:**
```css
// High Priority
className="bg-red-500/20 text-red-200 px-2 py-0.5 rounded-full"

// Medium Priority
className="bg-yellow-500/20 text-yellow-200 px-2 py-0.5 rounded-full"

// Low Priority
className="bg-green-500/20 text-green-200 px-2 py-0.5 rounded-full"
```

---

## 🏥 Clinical Component Styles

### SOAP Generator Tabs

**Examination Prompts (SmartExaminationPrompts.tsx):**
```css
// Priority Colors
high: 'border-red-400/30 bg-red-500/10 text-red-200'
medium: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200'
low: 'border-blue-400/30 bg-blue-500/10 text-blue-200'

// Expansion Borders
border-t border-white/20

// Applied Findings
bg-green-500/10 border border-green-400/30
text-green-200 (heading)
text-green-300 (content)
```

**Medication Compliance (MedicationComplianceTracker.tsx):**
```css
// Compliance Status Colors
compliant: 'text-green-200 bg-green-500/10 border-green-400/30'
partial: 'text-yellow-200 bg-yellow-500/10 border-yellow-400/30' 
non-compliant: 'text-red-200 bg-red-500/10 border-red-400/30'

// Side Effect Badges
bg-red-500/20 text-red-200

// Clinical Action Required
bg-orange-500/10 border border-orange-400/30
text-orange-200 (heading)
text-orange-300 (content)
```

**Risk Factor Assessment (RiskFactorAssessment.tsx):**
```css
// Risk Level Colors
critical: 'border-red-400/30 bg-red-500/10 text-red-200'
high: 'border-orange-400/30 bg-orange-500/10 text-orange-200'
moderate: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200'
low: 'border-green-400/30 bg-green-500/10 text-green-200'

// Health Score Badges
80%+: 'bg-green-500/20 text-green-200'
60-79%: 'bg-yellow-500/20 text-yellow-200'
<60%: 'bg-red-500/20 text-red-200'

// Progress Indicators
bg-white/10 text-white/80
```

---

## 📱 Responsive Patterns

### Grid Systems
```css
// 2-column grid
className="grid grid-cols-2 gap-3"

// 3-column status grid
className="grid grid-cols-3 gap-2 mt-2 text-xs"

// 4-column risk grid  
className="grid grid-cols-4 gap-2 text-xs"
```

### Spacing Scale
```css
space-y-1    /* Tight spacing (4px) */
space-y-2    /* Standard spacing (8px) */
space-y-3    /* Medium spacing (12px) */  
space-y-4    /* Large spacing (16px) */

p-1         /* Tight padding (4px) */
p-2         /* Standard padding (8px) */
p-3         /* Medium padding (12px) */

gap-1       /* Tight gap (4px) */
gap-2       /* Standard gap (8px) */
gap-3       /* Medium gap (12px) */
```

---

## 🔧 Implementation Guidelines

### Color Modification Patterns

**To Change Component Colors:**

1. **Background Intensity:**
   - `/5` = Ultra-light background
   - `/10` = Light content areas  
   - `/20` = Prominent elements
   - `/30` = Interactive hovers

2. **Border Opacity:**
   - `/20` = Subtle separators
   - `/30` = Standard borders
   - `/50` = Focus states

3. **Text Opacity:**
   - `text-white` = Primary headings
   - `text-white/90` = Secondary text
   - `text-white/80` = Body text
   - `text-white/50` = Placeholders

### Status Color Mapping

**Medical Priority Levels:**
- **Critical:** Red (`red-500/10`, `red-400/30`, `red-200`)
- **High:** Orange (`orange-500/10`, `orange-400/30`, `orange-200`)  
- **Medium:** Yellow (`yellow-500/10`, `yellow-400/30`, `yellow-200`)
- **Low:** Green (`green-500/10`, `green-400/30`, `green-200`)
- **Info:** Blue (`blue-500/10`, `blue-400/30`, `blue-200`)

### Interactive States

**Hover Effects:**
```css
// Buttons
hover:bg-blue-700        /* Primary button */
hover:bg-white/20        /* Secondary button */
hover:text-white/90      /* Icon/text hover */

// Form Elements  
focus:border-white/50    /* Input focus */
focus:outline-none       /* Remove default outline */
```

**Disabled States:**
```css
disabled:opacity-50
disabled:cursor-not-allowed
```

---

## 🎭 Animation & Transitions

### Smooth Transitions
```css
className="transition-all duration-200"    /* Standard transition */
className="transition-transform"           /* Transform only */
className="hover:scale-105"               /* Subtle hover scale */
```

### Loading States
```css
className="animate-pulse"                 /* Loading skeleton */
className="animate-spin"                  /* Loading spinner */
```

---

## ♿ Accessibility Guidelines

### WCAG Compliance

**Contrast Ratios:**
- White text on dark backgrounds: ✅ 21:1 (AAA)
- Color-coded status with text labels: ✅ Not color-only
- Focus indicators: ✅ High contrast borders

**Keyboard Navigation:**
```css
focus:outline-none focus:border-white/50  /* Custom focus styles */
focus:ring-2 focus:ring-clinical-blue     /* Alternative ring focus */
```

**Screen Reader Support:**
- All interactive elements have accessible labels
- Status indicators include text descriptions
- Form fields have proper labels and placeholders

---

## 🚀 Usage Examples

### Creating a New Status Card
```tsx
const StatusCard = ({ status, children }) => {
  const getStatusStyles = (status: 'success' | 'warning' | 'error' | 'info') => {
    const styles = {
      success: 'border-green-400/30 bg-green-500/10 text-green-200',
      warning: 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200', 
      error: 'border-red-400/30 bg-red-500/10 text-red-200',
      info: 'border-blue-400/30 bg-blue-500/10 text-blue-200'
    }
    return styles[status]
  }

  return (
    <div className={`border rounded-lg p-3 ${getStatusStyles(status)}`}>
      {children}
    </div>
  )
}
```

### Creating a Form Field
```tsx
const FormField = ({ label, placeholder, value, onChange, type = "text" }) => {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-white/90">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full text-xs bg-white/10 text-white placeholder:text-white/50 border border-white/30 rounded p-2 focus:border-white/50 focus:outline-none"
      />
    </div>
  )
}
```

### Creating Priority Badges
```tsx
const PriorityBadge = ({ priority }: { priority: 'high' | 'medium' | 'low' }) => {
  const styles = {
    high: 'bg-red-500/20 text-red-200',
    medium: 'bg-yellow-500/20 text-yellow-200',
    low: 'bg-green-500/20 text-green-200'
  }

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles[priority]}`}>
      {priority}
    </span>
  )
}
```

---

## 🔄 Version History

**v1.0** - Initial dark theme implementation
- Established glass-panel design system
- Fixed white-on-white visibility issues
- Created comprehensive color palette
- Implemented consistent form styling

**v1.1** - Enhanced accessibility
- Improved focus states
- Better contrast ratios
- Consistent interactive patterns

---

## 📚 References

**Tailwind CSS Classes Used:**
- Background: `bg-white/[5-30]`, `bg-{color}-500/[10-20]`
- Borders: `border-white/[20-50]`, `border-{color}-400/30`
- Text: `text-white/[50-100]`, `text-{color}-[200-300]`
- Spacing: `p-[1-3]`, `space-y-[1-4]`, `gap-[1-3]`
- Interactive: `hover:`, `focus:`, `disabled:`

**Color Palette:**
- Clinical Blue: `#3B82F6`
- Glass White Opacity: 5%, 10%, 20%, 30%, 50%
- Status Colors: Red, Orange, Yellow, Green, Blue
- Text Opacity: 50%, 60%, 70%, 80%, 90%, 100%

---

## 📐 Canvas Node Sizing & Layout

### Default Node Sizing Configuration

**Primary Size Configuration Location:**
```typescript
// File: frontend/src/components/ClinicalCanvas.tsx
// Lines: ~175-177 in convertToReactFlowNodes function

style: {
  width: node.size?.width || 500,   // Default width fallback
  height: node.size?.height || 600, // Default height fallback
}
```

**Why This Matters:**
- Database canvas layouts don't store size properties
- Mock data sizes are only used when API fails completely
- The fallback values in `ClinicalCanvas.tsx` determine actual initial node sizes

### Node Resizing Capabilities

**Enable Unlimited Resizing:**
```typescript
// In each node component (e.g., PatientSummaryNode.tsx):

// ✅ CORRECT - Unlimited resizing
<div className="canvas-node flex flex-col h-full w-full">
  <NodeResizer 
    minWidth={300}   // Minimum width constraint
    minHeight={250}  // Minimum height constraint
    // NO maxWidth or maxHeight = unlimited resizing
    shouldResize={() => true}
  />
</div>

// ❌ INCORRECT - Limited resizing  
<div className="canvas-node min-w-[400px] min-h-[300px]">
  <NodeResizer 
    minWidth={300}
    minHeight={250}
    maxWidth={600}    // This limits horizontal resizing
    maxHeight={500}   // This limits vertical resizing
  />
</div>
```

### Node Sizing Troubleshooting

**Common Issues & Solutions:**

1. **Default sizes too small on load:**
   - **Location:** `frontend/src/components/ClinicalCanvas.tsx:175-177`
   - **Fix:** Update fallback width/height values

2. **Resizing constraints (max limits):**
   - **Location:** Each node component's `NodeResizer` props
   - **Fix:** Remove `maxWidth` and `maxHeight` properties

3. **Fixed container sizes preventing flex:**
   - **Location:** Node component root div
   - **Fix:** Use `flex flex-col h-full w-full` instead of `min-w-[Xpx] min-h-[Xpx]`

### Configuration Files Reference

**Files that control node sizing:**

1. **ClinicalCanvas.tsx** (Primary - controls actual sizing)
   ```typescript
   // Line ~176: Default fallback sizes when no size data exists
   height: node.size?.height || 600  // ← Change this for default height
   ```

2. **usePatientData.ts** (Mock data - only used when API fails)
   ```typescript
   // Lines ~32, 101, 120, 135, 156, 195: Mock canvas layout sizes
   size: { width: 500, height: 400 }  // Only used as API fallback
   ```

3. **fixtures.ts** (Test data - only used in tests)
   ```typescript
   // Lines ~32, 39, 46: Test canvas layout sizes
   size: { width: 500, height: 400 }  // Only used in testing
   ```

4. **Database (Primary data source)**
   ```sql
   -- canvas_layouts table stores JSON without size properties
   -- Backend populate_demo_data.py creates layouts without size
   -- This is why ClinicalCanvas.tsx fallbacks are used
   ```

### Quick Size Changes

**To change default node sizes:**
1. Edit `frontend/src/components/ClinicalCanvas.tsx` line ~176
2. Update the fallback values: `|| 500` (width), `|| 600` (height)
3. Restart frontend to see changes

**To modify minimum resize constraints:**
1. Edit individual node files (e.g., `PatientSummaryNode.tsx`)
2. Update `NodeResizer` props: `minWidth={300}`, `minHeight={250}`

This style guide ensures consistent, accessible, and maintainable UI components across the entire HospitalCanvas platform! 🎨✨
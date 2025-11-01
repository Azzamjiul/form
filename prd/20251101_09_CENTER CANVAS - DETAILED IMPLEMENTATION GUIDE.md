# CENTER CANVAS - DETAILED IMPLEMENTATION GUIDE
# Continuation dari GOOGLE_FORMS_CLONE_COMPLETE_SPEC.md

**Purpose:** Deep dive specification untuk Center Canvas component - area utama tempat question cards di-render dan di-edit.

**Reference:** Lihat GOOGLE_FORMS_CLONE_COMPLETE_SPEC.md Section 3 untuk overview. Document ini adalah implementation detail.

---

## OVERVIEW

Center Canvas adalah area responsif yang menampilkan:
1. Survey Header (default, di atas)
2. List of content items yang bisa disort:
   - Title/Description Section Cards
   - Question Cards (dengan berbagai tipe)
   - Page Break Cards
   - Image/Video Cards (future)

---

## CENTER CANVAS CONTAINER

### Root Container Properties

```jsx
// Container wrapper
{
  flex: 1,
  backgroundColor: "#F9F9F9",
  overflowY: "auto",
  overflowX: "hidden",
  padding: "40px 32px",
  position: "relative",
  minHeight: "100vh"
}

// Responsive padding
@media (max-width: 1024px) {
  padding: "32px 24px"
}

@media (max-width: 768px) {
  padding: "24px 16px"
}
```

### Content Wrapper (Inside Container)

```jsx
// Wrapper untuk all cards
{
  maxWidth: "900px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "24px"
}
```

---

## SURVEY HEADER CARD (ALWAYS FIRST)

### Container

```jsx
{
  background: "linear-gradient(135deg, #E8D5F2 0%, #F3E5FF 100%)",
  border: "1px solid #D0BFE0",
  borderLeft: "4px solid #5F35F5",
  borderRadius: "8px",
  padding: "24px",
  marginBottom: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  minHeight: "120px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  position: "relative"
}
```

### Title Section

```jsx
// Title input structure
{
  fontSize: "32px",
  fontWeight: 400,
  color: "#202124",
  lineHeight: 1.4,
  border: "none",
  borderBottom: "none",
  padding: "8px 0",
  background: "transparent",
  outline: "none",
  fontFamily: "inherit",
  resize: "none",
  maxHeight: "100px",
  overflow: "hidden",

  // Focus state
  "&:focus": {
    outline: "none"
  },

  // Contenteditable div alternative
  "[contenteditable]": {
    lineHeight: 1.4,
    minHeight: "40px",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word"
  }
}

// Placeholder styling
"&::placeholder": {
  color: "#808080",
  opacity: 1
}
```

### Divider

```jsx
{
  height: "1px",
  background: "#E8E8E8",
  margin: "0",
  width: "100%"
}
```

### Description Section

```jsx
{
  fontSize: "16px",
  fontWeight: 400,
  color: "#808080",
  border: "none",
  background: "transparent",
  padding: "8px 0",
  outline: "none",
  fontFamily: "inherit",
  resize: "none",
  minHeight: "40px",

  // Focus state
  "&:focus": {
    outline: "none"
  }
}
```

### Top-Right Actions

```jsx
// Action buttons container (absolute positioned)
{
  position: "absolute",
  top: "12px",
  right: "12px",
  display: "flex",
  gap: "8px"
}

// Each action button
{
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  borderRadius: "4px",
  color: "#5F6368",

  // Hover state
  "&:hover": {
    background: "rgba(0, 0, 0, 0.04)",
    color: "#5F35F5"
  }
}
```

---

## TITLE/DESCRIPTION SECTION CARD

### Container

```jsx
{
  background: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderLeft: "4px solid #5F35F5",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  padding: "24px",
  marginBottom: "24px",
  minHeight: "120px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  position: "relative"
}
```

### Title Input

```jsx
{
  fontSize: "18px",
  fontWeight: 500,
  color: "#202124",
  lineHeight: 1.5,
  border: "none",
  borderBottom: "2px solid #5F35F5",
  padding: "8px 0 12px 0",
  background: "transparent",
  outline: "none",
  fontFamily: "inherit",
  resize: "none",
  maxHeight: "100px",

  // Focus
  "&:focus": {
    outline: "none",
    borderBottom: "2px solid #5F35F5"
  }
}
```

### Text Formatting Toolbar

```jsx
// Toolbar container
{
  display: "flex",
  gap: "8px",
  marginBottom: "12px",
  paddingBottom: "12px",
  borderBottom: "1px solid #E8E8E8"
}

// Each button
{
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "1px solid transparent",
  borderRadius: "4px",
  cursor: "pointer",
  color: "#5F6368",
  fontSize: "16px",

  // Hover
  "&:hover": {
    background: "#F5F5F5",
    borderColor: "#D0D0D0"
  },

  // Active state (if text is bold, italic, etc.)
  "&.active": {
    background: "#E3F2FD",
    color: "#5F35F5",
    borderColor: "#5F35F5"
  }
}

// Button types
Bold: { fontWeight: 700, fontStyle: "normal" },
Italic: { fontWeight: 400, fontStyle: "italic" },
Underline: { textDecoration: "underline" },
Link: { display: "flex", alignItems: "center" },
Strikethrough: { textDecoration: "line-through" }
```

### Description Input

```jsx
{
  fontSize: "14px",
  fontWeight: 400,
  color: "#808080",
  lineHeight: 1.5,
  border: "none",
  borderBottom: "1px solid #E8E8E8",
  padding: "12px 0",
  background: "transparent",
  outline: "none",
  fontFamily: "inherit",
  resize: "none",
  minHeight: "60px",

  // Focus
  "&:focus": {
    outline: "none",
    borderBottom: "1px solid #5F35F5"
  }
}
```

### Action Buttons (Top-Right)

Same styling as Survey Header buttons (see above)

---

## QUESTION CARD - CONTAINER

### Base Styles

```jsx
{
  background: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderLeft: "4px solid #5F35F5",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  padding: "24px",
  marginBottom: "24px",
  minHeight: "180px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  position: "relative"
}

// Selected/Active state
"&.active": {
  borderLeft: "4px solid #5F35F5",
  background: "#FFFFFF",
  boxShadow: "0 2px 8px rgba(95, 53, 245, 0.15)"
}

// Hover state
"&:hover": {
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
}
```

### Transitions

```jsx
{
  transition: "all 0.2s ease"
}
```

---

## QUESTION CARD - SECTION 1: TITLE & DESCRIPTION

### Question Title Input

```jsx
// Input element styles
{
  fontSize: "18px",
  fontWeight: 500,
  color: "#202124",
  lineHeight: 1.5,
  border: "none",
  borderBottom: "2px solid transparent",
  padding: "8px 0",
  background: "transparent",
  outline: "none",
  fontFamily: "inherit",
  resize: "none",
  maxHeight: "150px",
  overflowY: "auto",

  // Focus state
  "&:focus": {
    outline: "none",
    borderBottom: "2px solid #5F35F5"
  },

  // Placeholder
  "&::placeholder": {
    color: "#808080"
  }
}

// If using contenteditable div
"[contenteditable]": {
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  minHeight: "32px",
  maxHeight: "150px",
  overflowY: "auto"
}
```

### Text Formatting Toolbar

Same as Title/Description Section (see above)

### Question Description Input

```jsx
{
  fontSize: "14px",
  fontWeight: 400,
  color: "#808080",
  lineHeight: 1.5,
  border: "none",
  borderBottom: "1px solid transparent",
  padding: "8px 0",
  background: "transparent",
  outline: "none",
  fontFamily: "inherit",
  resize: "none",
  minHeight: "30px",

  // Focus
  "&:focus": {
    outline: "none",
    borderBottom: "1px solid #5F35F5"
  },

  // Show only if has content
  visibility: hasContent ? "visible" : "hidden",
  height: hasContent ? "auto" : "0"
}
```

### Divider Line

```jsx
{
  height: "1px",
  background: "#E8E8E8",
  margin: "0",
  width: "100%"
}
```

---

## QUESTION CARD - SECTION 2: CONTENT (DYNAMIC)

### Question Type Selector

```jsx
// Dropdown container
{
  display: "flex",
  gap: "12px",
  marginBottom: "12px",
  alignItems: "flex-start"
}

// Dropdown button
{
  background: "#F5F5F5",
  border: "1px solid #D0D0D0",
  borderRadius: "4px",
  padding: "8px 16px",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "8px",
  minWidth: "200px",
  color: "#202124",

  // Hover
  "&:hover": {
    background: "#E8E8E8",
    borderColor: "#BDBDBD"
  },

  // Focus/Open
  "&.open": {
    background: "#FFFFFF",
    borderColor: "#5F35F5"
  }
}

// Chevron icon
{
  width: "12px",
  height: "12px",
  color: "#5F6368",
  transform: "scaleY(-1)"
}
```

### Dropdown Menu

```jsx
// Menu container (position absolute)
{
  position: "absolute",
  top: "100%",
  left: "0",
  marginTop: "4px",
  background: "#FFFFFF",
  border: "1px solid #D0D0D0",
  borderRadius: "4px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  zIndex: 100,
  minWidth: "250px",
  maxHeight: "400px",
  overflowY: "auto"
}

// Menu item
{
  padding: "12px 16px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
  fontSize: "14px",
  color: "#202124",
  border: "none",
  background: "transparent",
  width: "100%",
  textAlign: "left",

  // Hover
  "&:hover": {
    background: "#F5F5F5"
  },

  // Active/Selected
  "&.active": {
    background: "#E3F2FD",
    color: "#5F35F5",
    fontWeight: 600
  }
}

// Icon in menu item
{
  width: "20px",
  height: "20px",
  color: "inherit"
}
```

### Dynamic Content Area (SHORT TEXT)

```jsx
// Preview input (disabled/readonly)
{
  fontSize: "14px",
  color: "#808080",
  background: "#F5F5F5",
  padding: "12px 8px",
  border: "1px solid #E8E8E8",
  borderRadius: "4px",
  height: "40px",
  outline: "none",
  fontFamily: "inherit",
  cursor: "default",
  pointerEvents: "none"
}
```

### Dynamic Content Area (PARAGRAPH)

```jsx
// Preview textarea (disabled/readonly)
{
  fontSize: "14px",
  color: "#808080",
  background: "#F5F5F5",
  padding: "12px 8px",
  border: "1px solid #E8E8E8",
  borderRadius: "4px",
  height: "100px",
  resize: "none",
  outline: "none",
  fontFamily: "inherit",
  cursor: "default",
  pointerEvents: "none",
  overflowY: "hidden"
}
```

### Dynamic Content Area (MULTIPLE CHOICE)

```jsx
// Options container
{
  display: "flex",
  flexDirection: "column",
  gap: "12px"
}

// Option item
{
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "12px",
  borderRadius: "4px",
  padding: "8px",

  // Hover to show actions
  "&:hover": {
    background: "#F5F5F5"
  }
}

// Radio button
{
  width: "24px",
  height: "24px",
  minWidth: "24px",
  border: "2px solid #D0D0D0",
  borderRadius: "50%",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  // Hover
  "&:hover": {
    borderColor: "#5F35F5"
  }
}

// Option text input
{
  flex: 1,
  fontSize: "14px",
  color: "#202124",
  border: "none",
  borderBottom: "1px solid #E8E8E8",
  padding: "8px 0",
  background: "transparent",
  outline: "none",
  fontFamily: "inherit",

  // Focus
  "&:focus": {
    outline: "none",
    borderBottom: "2px solid #5F35F5"
  },

  // Placeholder
  "&::placeholder": {
    color: "#5F6368"
  }
}

// Drag handle (show on hover)
{
  width: "20px",
  height: "20px",
  color: "#5F6368",
  opacity: 0.5,
  cursor: "grab",
  display: "none",

  // Show on parent hover
  "[option-item]:hover &": {
    display: "block"
  }
}

// Delete button (show on hover)
{
  width: "20px",
  height: "20px",
  color: "#5F6368",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  borderRadius: "4px",
  display: "none",

  // Show on parent hover
  "[option-item]:hover &": {
    display: "flex"
  },

  // Hover state
  "&:hover": {
    color: "#EA4335",
    background: "#FFEBEE"
  }
}
```

### Add Option Link

```jsx
{
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "12px",
  cursor: "pointer",
  fontSize: "14px",
  color: "#5F35F5",
  border: "none",
  background: "transparent",
  padding: "0",

  // Hover
  "&:hover": {
    textDecoration: "underline"
  },

  // Radio button (unchecked)
  "svg": {
    width: "24px",
    height: "24px",
    border: "2px solid #D0D0D0",
    borderRadius: "50%"
  }
}
```

### Dynamic Content Area (LINEAR SCALE)

```jsx
// Scale container
{
  display: "flex",
  flexDirection: "column",
  gap: "12px"
}

// Range inputs row
{
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px"
}

// Min/Max input
{
  width: "60px",
  padding: "8px 12px",
  border: "1px solid #E8E8E8",
  borderRadius: "4px",
  fontSize: "14px",
  textAlign: "center",

  // Focus
  "&:focus": {
    outline: "none",
    borderColor: "#5F35F5"
  }
}

// Scale preview (radio buttons)
{
  display: "flex",
  gap: "8px",
  marginTop: "8px"
}

// Scale button
{
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #D0D0D0",
  borderRadius: "50%",
  background: "transparent",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 500,

  // Hover
  "&:hover": {
    borderColor: "#5F35F5"
  }
}
```

### Dynamic Content Area (DATE)

```jsx
{
  fontSize: "14px",
  color: "#808080",
  background: "#F5F5F5",
  padding: "12px 8px",
  border: "1px solid #E8E8E8",
  borderRadius: "4px",
  height: "40px",
  outline: "none",
  fontFamily: "inherit",
  cursor: "default",
  pointerEvents: "none"
}
```

### Dynamic Content Area (FILE UPLOAD)

```jsx
// Upload area
{
  background: "#F5F5F5",
  border: "2px dashed #D0D0D0",
  borderRadius: "4px",
  padding: "24px",
  minHeight: "80px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  textAlign: "center"
}

// Icon
{
  width: "32px",
  height: "32px",
  color: "#808080"
}

// Text
{
  fontSize: "14px",
  color: "#808080"
}
```

---

## QUESTION CARD - SECTION 3: SETTINGS

### Required Toggle Row

```jsx
// Container
{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "12px",
  borderTop: "1px solid #E8E8E8"
}

// Label
{
  fontSize: "14px",
  fontWeight: 600,
  color: "#202124"
}

// Toggle switch
{
  width: "48px",
  height: "24px",
  borderRadius: "12px",
  background: "#D3D3D3",
  border: "none",
  cursor: "pointer",
  position: "relative",
  transition: "background 0.2s ease",

  // Off state
  "background": "#D3D3D3",

  // On state
  "&.on": {
    background: "#5F35F5"
  }
}

// Toggle circle
{
  position: "absolute",
  top: "2px",
  left: "2px",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  background: "#FFFFFF",
  transition: "left 0.2s ease",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",

  // On state
  ".on &": {
    left: "26px"
  }
}
```

---

## QUESTION CARD - SECTION 4: ACTION BUTTONS

### Actions Row

```jsx
// Container
{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: "12px",
  borderTop: "1px solid #E8E8E8"
}

// Left buttons group
{
  display: "flex",
  gap: "8px"
}

// Right buttons group
{
  display: "flex",
  gap: "8px",
  alignItems: "center"
}
```

### Button Styles

```jsx
// Copy/Duplicate button
{
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  color: "#5F6368",

  // Hover
  "&:hover": {
    background: "#F5F5F5",
    color: "#5F35F5"
  }
}

// Delete button
{
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  color: "#5F6368",

  // Hover
  "&:hover": {
    background: "#FFEBEE",
    color: "#EA4335"
  }
}

// More options button
{
  width: "40px",
  height: "40px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  color: "#5F6368",

  // Hover
  "&:hover": {
    background: "#F5F5F5",
    color: "#5F35F5"
  }
}
```

### Toggle in Action Bar

Same as Required Toggle (see Section 3 above)

---

## BETWEEN CARDS: ADD ELEMENT SECTION

### Divider Container

```jsx
{
  margin: "24px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px"
}

// Divider line (left)
{
  flex: 1,
  height: "1px",
  background: "#E8E8E8"
}

// Divider line (right)
{
  flex: 1,
  height: "1px",
  background: "#E8E8E8"
}
```

### Floating Buttons

```jsx
// Buttons container (center)
{
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  justifyContent: "center"
}

// Each button
{
  background: "#F5F5F5",
  border: "1px solid #D0D0D0",
  borderRadius: "24px",
  padding: "12px 16px",
  fontSize: "14px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#5F6368",
  transition: "all 0.2s ease",
  whiteSpace: "nowrap",

  // Hover
  "&:hover": {
    background: "#E0E0E0",
    color: "#5F35F5"
  },

  // Icon
  "svg": {
    width: "16px",
    height: "16px"
  }
}
```

---

## PAGE BREAK CARD

### Section Label Badge

```jsx
{
  background: "#5F35F5",
  color: "#FFFFFF",
  fontSize: "12px",
  fontWeight: 600,
  padding: "8px 12px",
  borderRadius: "4px",
  width: "fit-content",
  marginBottom: "12px",
  position: "absolute",
  top: "12px",
  left: "12px"
}
```

### Page Break Navigation

```jsx
// Container
{
  display: "flex",
  gap: "12px",
  alignItems: "center",
  padding: "24px 0",
  margin: "0",
  borderTop: "none",
  borderBottom: "none"
}

// Text
{
  fontSize: "14px",
  color: "#808080"
}

// Dropdown
{
  background: "#FFFFFF",
  border: "1px solid #D0D0D0",
  borderRadius: "4px",
  padding: "8px 12px",
  fontSize: "14px",
  cursor: "pointer",
  flex: 1,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
}
```

### Page Break Card

```jsx
{
  background: "#FFFFFF",
  border: "1px solid #E8E8E8",
  borderLeft: "4px solid #5F35F5",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  padding: "24px",
  marginBottom: "24px",
  minHeight: "100px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  position: "relative"
}
```

### Page Break Title & Description

Same styling as Title/Description Section Card

---

## DRAG & DROP BEHAVIOR

### Dragging State

```jsx
// When dragging a question card
{
  opacity: 0.7,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  transform: "scale(1.02)",
  zIndex: 50,
  cursor: "grabbing"
}

// Drop target indicator
{
  height: "2px",
  background: "#5F35F5",
  margin: "12px 0",
  borderRadius: "1px"
}

// Hover over drop target
{
  background: "#5F35F5",
  opacity: 0.3,
  height: "24px",
  margin: "8px 0",
  borderRadius: "4px"
}
```

---

## ANIMATIONS & TRANSITIONS

### Card Appear

```jsx
// Fade in animation
@keyframes cardFadeIn {
  from {
    opacity: 0,
    transform: translateY(10px)
  }
  to {
    opacity: 1,
    transform: translateY(0)
  }
}

// Apply to new cards
{
  animation: "cardFadeIn 0.3s ease"
}
```

### Card Delete

```jsx
@keyframes cardFadeOut {
  from {
    opacity: 1,
    transform: translateY(0)
  }
  to {
    opacity: 0,
    transform: translateX(-20px)
  }
}

{
  animation: "cardFadeOut 0.3s ease"
}
```

### Option Add

```jsx
@keyframes optionSlideIn {
  from {
    opacity: 0,
    maxHeight: 0
  }
  to {
    opacity: 1,
    maxHeight: 50px
  }
}

{
  animation: "optionSlideIn 0.2s ease"
}
```

---

## STATE MANAGEMENT STRUCTURE

### Canvas State

```jsx
{
  items: [
    {
      id: "survey-header",
      type: "header",
      title: string,
      description: string,
      isEditing: boolean
    },
    {
      id: "section-1",
      type: "title-description",
      title: string,
      description: string
    },
    {
      id: "question-1",
      type: "question",
      title: string,
      description: string,
      questionType: "multiple_choice" | "short_text" | ...,
      required: boolean,
      options: Array,
      isSelected: boolean,
      isDragging: boolean
    },
    {
      id: "page-break-1",
      type: "page-break",
      sectionNumber: number,
      totalSections: number
    }
  ],

  selectedItemId: string | null,
  draggedItemId: string | null,
  isSaving: boolean,
  hasUnsavedChanges: boolean,
  lastSavedAt: Date | null
}
```

---

## LOCAL STORAGE / UNDO-REDO

### Implementation Pattern

```jsx
// Store history for undo
undoStack: [
  { items: [...], timestamp: Date },
  // ... previous states
]

redoStack: []

// On any change
handleChange(newItems) {
  undoStack.push({ items: currentItems, timestamp: now() })
  items = newItems
  redoStack = [] // Clear redo when new action occurs
}

// Undo
handleUndo() {
  if (undoStack.length > 0) {
    redoStack.push({ items: currentItems, timestamp: now() })
    const previous = undoStack.pop()
    items = previous.items
  }
}

// Redo
handleRedo() {
  if (redoStack.length > 0) {
    undoStack.push({ items: currentItems, timestamp: now() })
    const next = redoStack.pop()
    items = next.items
  }
}
```

---

## KEYBOARD NAVIGATION

### Tab Order

```
1. Survey title input (header)
2. Survey description input (header)
3. First question title
4. First question options
5. First question settings toggle
6. First question actions (copy, delete, more)
7. Add element buttons or second question
... (repeat for each question)
```

### Keyboard Handlers

```jsx
// In each card
handleKeyDown(event) {
  // Enter in title: Add new question
  if (event.key === "Enter" && isInTitle) {
    event.preventDefault()
    addNewQuestion()
  }

  // Delete key: Mark for deletion (show confirmation)
  if (event.key === "Delete") {
    event.preventDefault()
    showDeleteConfirmation()
  }

  // Escape: Deselect
  if (event.key === "Escape") {
    deselectCard()
  }

  // Tab: Next card
  if (event.key === "Tab" && !event.shiftKey) {
    moveFocusToNextCard()
  }

  // Shift+Tab: Previous card
  if (event.key === "Tab" && event.shiftKey) {
    moveFocusToPreviousCard()
  }
}
```

---

## FOCUS MANAGEMENT

### Focus Indicators

```jsx
// When tabbing
"&:focus-visible": {
  outline: "2px solid #5F35F5",
  outlineOffset: "2px",
  borderRadius: "4px"
}

// For inputs
"&:focus": {
  outline: "none",
  borderColor: "#5F35F5",
  boxShadow: "0 0 0 2px rgba(95, 53, 245, 0.1)"
}
```

### Auto-focus on Create

```jsx
// When question is created
useEffect(() => {
  if (isNewQuestion) {
    titleInputRef.current?.focus()
    // Select all if placeholder text
    titleInputRef.current?.select()
  }
}, [isNewQuestion])
```

---

## RESPONSIVE BEHAVIOR

### Tablet (768px - 1280px)

```jsx
// Reduce padding
padding: "32px 24px"

// Reduce gap between cards
gap: "20px"

// Reduce card padding
cardPadding: "20px"

// Reduce action button size
buttonSize: "36px"
```

### Mobile (< 768px)

```jsx
// Minimal padding
padding: "16px"

// Stacked elements
gap: "16px"

// Smaller card
cardPadding: "16px"

// Larger touch targets
buttonSize: "44px"

// Single column layout
flexDirection: "column"

// Full width inputs
width: "100%"

// Hide some optional elements
display: "none" // for secondary actions on mobile
```

---

## AUTO-SAVE IMPLEMENTATION

### Auto-save Logic

```jsx
// Debounced save function
const debouncedSave = debounce(saveToServer, 500)

// On any change
handleCardChange(itemId, newData) {
  // Update local state immediately
  setItems(items.map(item =>
    item.id === itemId ? { ...item, ...newData } : item
  ))

  // Mark as unsaved
  setHasUnsavedChanges(true)
  showIndicator("Menyimpan...")

  // Trigger debounced save
  debouncedSave()
}

// Save function
async function saveToServer() {
  try {
    const response = await fetch(`/api/surveys/${surveyId}`, {
      method: "PUT",
      body: JSON.stringify({ items })
    })

    if (response.ok) {
      setHasUnsavedChanges(false)
      setLastSavedAt(new Date())
      showIndicator("Disimpan", 2000) // Hide after 2 seconds
    }
  } catch (error) {
    showError("Gagal menyimpan. Coba lagi.")
  }
}
```

---

## VALIDATION

### On Change Validation

```jsx
// Validate question title
validateTitle(title) {
  if (!title || title.trim() === "") {
    return { valid: false, error: "Pertanyaan harus memiliki judul" }
  }
  if (title.length > 1000) {
    return { valid: false, error: "Judul terlalu panjang (max 1000)" }
  }
  return { valid: true }
}

// Validate options
validateOptions(type, options) {
  if (['multiple_choice', 'checkboxes', 'dropdown'].includes(type)) {
    if (options.length < 2) {
      return { valid: false, error: "Minimal 2 opsi diperlukan" }
    }

    const labels = options.map(o => o.label)
    const uniqueLabels = new Set(labels)
    if (uniqueLabels.size !== labels.length) {
      return { valid: false, error: "Opsi tidak boleh duplikat" }
    }
  }
  return { valid: true }
}

// Show validation errors
showValidationError(fieldId, error) {
  const element = document.getElementById(fieldId)
  element.classList.add("error")
  element.setAttribute("aria-describedby", `${fieldId}-error`)

  const errorElement = document.createElement("span")
  errorElement.id = `${fieldId}-error`
  errorElement.className = "error-message"
  errorElement.textContent = error
  element.parentNode.appendChild(errorElement)
}
```

---

## CONCLUSION

Document ini adalah implementasi detail untuk Center Canvas component. Gunakan styling dan struktur di atas untuk:

1. Build semua card components (Survey Header, Title/Desc, Question, Page Break)
2. Implement drag-drop dan reordering
3. Add form validation dan error handling
4. Setup auto-save dengan debounce
5. Handle responsive design
6. Manage keyboard navigation dan focus
7. Add animations dan transitions
8. Implement undo/redo functionality

Reference kembali ke GOOGLE_FORMS_CLONE_COMPLETE_SPEC.md untuk overview dan component structure yang lebih besar.

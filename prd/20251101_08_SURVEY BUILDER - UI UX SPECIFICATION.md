# SURVEY BUILDER - UI/UX SPECIFICATION
# FOKUS: Form Builder Interface (sama persis Google Forms)

---

## MAIN LAYOUT STRUCTURE

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TOP NAVBAR (56px)                           │
├────────────────┬─────────────────────────────────────────┬──────────┤
│ LEFT SIDEBAR   │          CENTER CANVAS                  │  RIGHT   │
│ QUESTIONS LIST │    (Question Editor Form)               │ TOOLBAR  │
│   (240px)      │                                         │ (80px)   │
│                │                                         │          │
│                │                                         │          │
│                │                                         │          │
│                │                                         │          │
│                │                                         │          │
│                │                                         │          │
│                │                                         │          │
└────────────────┴─────────────────────────────────────────┴──────────┘
```

---

## 1. TOP NAVBAR

### Structure
- Height: 56px
- Background: White (#FFFFFF)
- Border-bottom: 1px solid #E8E8E8
- Box-shadow: 0 1px 3px rgba(0,0,0,0.08)
- Padding: 0 16px
- Display: Flex, justify-content: space-between, align-items: center
- Position: Fixed/Sticky top
- Z-index: 100

### Left Section
- Logo or back button (optional)

### Center Section
- Survey title (bold, 20px, max width 300px)
- Editable on click (inline edit)
- Placeholder: "Formulir tanpa judul"
- Text color: #202124

### Right Section
- Buttons from left to right:
  1. Settings button (icon: gear, 24x24px)
  2. Share/Send button (icon: send, background purple #5F35F5, white text)
  3. More options (icon: three dots vertical, 24x24px)

---

## 2. LEFT SIDEBAR (QUESTIONS LIST)

### Container
- Width: 240px
- Background: White (#FFFFFF)
- Border-right: 1px solid #E8E8E8
- Position: Fixed left, full viewport height (minus navbar)
- Overflow-y: auto
- Padding: 16px 0
- Z-index: 10

### Top Section (Survey Info)
- Padding: 0 16px 16px 16px
- Title: "Pertanyaan Tanpa Judul" (20px, bold, editable)
- Description: "Deskripsi formulir" (14px, gray #808080)

### Question List

#### Each Question Item
- Layout: Flex, align-items: center
- Height: 56px
- Padding: 12px 16px
- Margin-bottom: 0
- Cursor: pointer
- Border-left: 4px solid transparent
- Background: transparent
- Transition: all 0.2s ease

**Active State (selected question):**
- Border-left: 4px solid #5F35F5
- Background: rgba(95, 53, 245, 0.08) - light purple
- Font-weight: 500
- Color: #202124

**Hover State (not active):**
- Background: rgba(0, 0, 0, 0.04) - light gray

**Content Layout:**
- Question number: "1" (font 12px, gray #808080, width 24px, text-align center)
- Question preview: text truncate 40 chars (font 14px, gray #202124, flex 1)
- Flex-gap: 12px
- Align-items: center

**Right Side Actions (show on hover):**
- Drag handle (icon: 6 dots, 16x16px, gray #5F6368, opacity 0.5)
- Padding right: 8px

### Add Question Button
- Position: Static, below question list
- Margin: 16px
- Full width minus padding
- Width: calc(100% - 32px)
- Background: Light blue #E3F2FD
- Border: 1px solid #BBDEFB
- Border-radius: 4px
- Padding: 12px 16px
- Font: 14px, color #5F35F5, bold
- Text: "+ Tambahkan pertanyaan"
- Cursor: pointer
- Display: Flex, align-items: center, justify-content: center
- Gap: 8px
- Hover: Background darken to #BBDEFB
- Icon: Plus sign (16x16px)

---

## 3. CENTER CANVAS (QUESTION EDITOR)

### Container
- Flex: 1 (grow)
- Background: #F9F9F9
- Overflow-y: auto
- Overflow-x: hidden
- Padding: 40px 32px
- Position: relative
- Min-height: 100vh

### Question Card (Main Content)

#### Overall Card Structure
- Background: White (#FFFFFF)
- Border: 1px solid #E8E8E8
- Border-radius: 8px
- Box-shadow: 0 1px 3px rgba(0,0,0,0.05)
- Padding: 24px
- Margin-bottom: 24px
- Min-height: 200px
- Layout: Flex column
- Gap: 16px

---

### Question Card - TOP SECTION: TITLE & DESCRIPTION

#### Question Title Input
- Type: Contenteditable div atau textarea
- Placeholder: "Pertanyaan Tanpa Judul"
- Font: 18px, weight 500, line-height 1.5
- Color: #202124
- Padding: 8px 0
- Border: none
- Border-bottom: 2px solid transparent
- Focus: Border-bottom: 2px solid #5F35F5
- Behavior: Auto-expand height when typing
- Resize: vertical none
- Outline: none
- Max-height: 200px (then scroll)

#### Question Description (expandable)
- Type: Contenteditable div atau textarea
- Placeholder: "Deskripsi pertanyaan"
- Font: 14px, weight 400, color #808080
- Padding: 8px 0 8px 0
- Border: none
- Border-bottom: 1px solid transparent
- Show/hide based on has content or edit focus
- Min-height: 40px
- Outline: none

#### Divider Line (between title and content)
- Horizontal line: 1px solid #E8E8E8
- Margin: 0
- Width: 100%

---

### Question Card - MIDDLE SECTION: QUESTION CONTENT

#### For SHORT TEXT Type:
- Label/Icon: Aa icon
- Preview input field (disabled/readonly)
- Placeholder: "Short answer text"
- Styling: Light gray background #F5F5F5
- Height: 40px
- Padding: 12px 8px
- Border: 1px solid #E8E8E8
- Border-radius: 4px
- Font: 14px
- Color: #808080

#### For PARAGRAPH Type:
- Label/Icon: Paragraph icon
- Preview textarea (disabled/readonly)
- Placeholder: "Long answer text"
- Multiple lines: 3 lines visible
- Styling: Light gray background #F5F5F5
- Padding: 12px 8px
- Border: 1px solid #E8E8E8
- Border-radius: 4px
- Font: 14px
- Color: #808080
- Resize: none

#### For MULTIPLE CHOICE Type:
- Label: "Multiple choice" atau radio icon
- Display: Vertical list

**Option Item Structure:**
- Layout: Flex, align-items: center, gap 12px, margin-bottom 12px
- Radio button: Empty circle (24x24px)
- Option text input: Flex 1
  - Type: Input
  - Placeholder: "Opsi 1"
  - Font: 14px
  - Border: none
  - Border-bottom: 1px solid #E8E8E8
  - Padding: 8px 0
  - Background: transparent
  - Focus: Border-bottom 2px solid #5F35F5

- Right side (show on hover):
  - Drag handle: 6 dots (20x20px, gray, opacity 0.5)
  - Delete button: X icon (20x20px, gray)
    - Hover: red #EA4335
    - Cursor: pointer

**Add Option Button:**
- Layout: Flex, align-items: center, gap 8px
- Margin-top: 12px
- Radio button: Empty circle
- Text: "Tambahkan opsi atau tambahkan 'Lainnya'" (blue #5F35F5, underline on hover)
- Font: 14px
- Cursor: pointer

#### For CHECKBOXES Type:
- Similar to MULTIPLE CHOICE but with checkbox icon (square, not circle)
- Same option structure

#### For DROPDOWN Type:
- Label: "Dropdown"
- Dropdown button showing current type label
- Style:
  - Background: White
  - Border: 1px solid #D0D0D0
  - Padding: 12px 16px
  - Border-radius: 4px
  - Font: 14px
  - Cursor: pointer
  - Display: Flex, space-between, align-items: center
  - Icon: Chevron down (12x12px right)

**Dropdown Content (when expanded):**
- Item 1: "Opsi 1"
- Item 2: "Opsi 2"
- Item: "Tambahkan opsi" (blue, clickable)

#### For LINEAR SCALE Type:
- Label: "Linear scale" atau scale icon
- Text: "Scale dari [min] ke [max]"
- Min/Max input fields
  - Type: Number input
  - Width: 60px
  - Font: 14px
  - Border: 1px solid #E8E8E8

- Scale preview: radio buttons 1-5 or 1-10
- Display horizontal
- Size: 32x32px each circle

#### For DATE Type:
- Label: "Date"
- Date picker preview (disabled/readonly)
- Display: Sample date format (e.g., "DD/MM/YYYY")
- Style: Light gray background, border

#### For TIME Type:
- Label: "Time"
- Time picker preview (disabled/readonly)
- Display: Sample time format (e.g., "12:00 PM")
- Style: Light gray background, border

#### For FILE UPLOAD Type:
- Label: "File upload"
- Upload area preview
- Style: Dashed border, light background
- Icon: Upload/cloud icon
- Text: "Pilih file di perangkat Anda"
- Font: 14px, gray

---

### Question Card - BOTTOM SECTION: SETTINGS

#### Settings Row: REQUIRED TOGGLE
- Layout: Flex, align-items: center, justify-content: space-between
- Left: Label "Wajib dijawab" (14px, bold)
- Right: Toggle switch
  - Off: Gray circle left
  - On: Blue circle right (#5F35F5), background blue
  - Height: 24px
  - Width: 48px
  - Border-radius: 12px
  - Cursor: pointer

---

### Question Card - ACTION BUTTONS ROW

#### Buttons Layout
- Layout: Flex, space-between, align-items: center
- Padding-top: 12px
- Border-top: 1px solid #E8E8E8

**Left Side Buttons:**
- Copy/Duplicate button
  - Icon: Duplicate/copy (20x20px)
  - Background: transparent
  - Hover: Light gray #F5F5F5
  - Border-radius: 4px
  - Padding: 8px
  - Cursor: pointer
  - Tooltip: "Duplicate"

- Delete button
  - Icon: Trash (20x20px, gray #5F6368)
  - Background: transparent
  - Hover: Light red/pink background, icon red #EA4335
  - Border-radius: 4px
  - Padding: 8px
  - Cursor: pointer
  - Tooltip: "Delete"

**Right Side Buttons:**
- More options (three dots)
  - Icon: Vertical ellipsis (20x20px)
  - Background: transparent
  - Hover: Light gray #F5F5F5
  - Border-radius: 4px
  - Padding: 8px
  - Cursor: pointer

- Toggle "Wajib dijawab"
  - Toggle switch (visual, same as settings row)
  - Can quickly toggle required state here

---

### Between Questions: ADD ELEMENT SECTION

#### Layout
- Margin: 24px 0
- Display: Flex, align-items: center, justify-content: center
- Gap: 16px
- On hover: Show buttons

#### Floating Buttons (appear on hover between cards)
- Background: Light gray #F5F5F5
- Border: 1px solid #D0D0D0
- Padding: 12px 16px
- Border-radius: 24px (pill style)
- Display: Flex, gap 8px
- Font: 14px

**Button Variations:**
1. Add question: "+" icon, text "Pertanyaan"
2. Add section: Text/heading icon, text "Bagian"
3. Add image: Image icon, text "Gambar"
4. Add video: Play icon, text "Video"
5. Add page break: Separator icon, text "Pemisah halaman"

All buttons:
- Cursor: pointer
- Hover: Darken background
- Click: Perform action

---

## 4. RIGHT TOOLBAR/SIDEBAR (80px width)

### Container
- Width: 80px
- Background: White (#FFFFFF)
- Border-left: 1px solid #E8E8E8
- Position: Fixed right
- Overflow-y: auto
- Padding: 16px 0
- Display: Flex
- Flex-direction: column
- Align-items: center
- Gap: 8px
- Z-index: 10

### Toolbar Icon Items (top to bottom)

Each Icon Item:
- Size: 40x40px (touch target)
- Display: Flex, align-items: center, justify-content: center
- Icon size: 24x24px
- Color: #5F6368
- Background: transparent
- Border-radius: 4px
- Cursor: pointer
- Transition: all 0.2s ease

**Hover State:**
- Background: Light gray #F5F5F5
- Color: #5F35F5

**Icon List (Order):**

1. **Icon: Add Question (+)**
   - Icon: Plus sign (24x24px)
   - Tooltip: "Add question"

2. **Icon: Add Section**
   - Icon: List/text lines (24x24px)
   - Tooltip: "Add section"

3. **Icon: Add Text/Title**
   - Icon: Text "T" (24x24px)
   - Tooltip: "Add title or description"

4. **Icon: Add Image**
   - Icon: Mountain/image (24x24px)
   - Tooltip: "Add image"

5. **Icon: Add Video**
   - Icon: Play button (24x24px)
   - Tooltip: "Add video"

6. **Icon: Design/Theme**
   - Icon: Palette/colors (24x24px)
   - Tooltip: "Customize form"

7. **Icon: More Options**
   - Icon: Three dots (24x24px)
   - Tooltip: "More options"

---

## 5. MODALS & DIALOGS

### Share Modal

**Structure:**
- Title: "Bagikan"
- Background: White with 50% dark overlay
- Position: Center of screen
- Width: 500px (max-width 90% on mobile)
- Border-radius: 8px
- Box-shadow: 0 4px 16px rgba(0,0,0,0.15)
- Z-index: 200

**Header:**
- Title: "Bagikan" (18px, bold, color #202124)
- Close button: X icon (top-right, 24x24px)
- Divider line below: 1px solid #E8E8E8

**Content (Sections):**

#### Section 1: Link Sharing
- Padding: 24px
- Border-bottom: 1px solid #E8E8E8

- Label: "Link ke formulir Anda" (14px, bold)
- Copy link button:
  - Style: Outlined button
  - Icon: Copy icon (16x16px left)
  - Text: "Salin tautan"
  - Border: 1px solid #D0D0D0
  - Padding: 8px 12px
  - Border-radius: 4px
  - Font: 14px
  - Hover: Light gray background
  - Click: Copy to clipboard, show "Tersalin!" tooltip

- Link display (below button):
  - Font: 12px, gray #5F6368
  - Selectable text field
  - Background: #F5F5F5
  - Padding: 12px
  - Border-radius: 4px
  - Height: 32px
  - Overflow: hidden, text-overflow: ellipsis

#### Section 2: Send via Email
- Padding: 24px
- Border-bottom: 1px solid #E8E8E8

- Label: "Kirim formulir" (14px, bold)
- Email input field:
  - Placeholder: "Masukkan alamat email"
  - Type: Email
  - Width: 100%
  - Padding: 12px 16px
  - Border: 1px solid #D0D0D0
  - Border-radius: 4px
  - Font: 14px

- Send button:
  - Style: Blue background #5F35F5
  - Text: "Kirim"
  - Color: White
  - Padding: 8px 24px
  - Border-radius: 4px
  - Font: 14px, bold
  - Cursor: pointer
  - Hover: Darken background
  - Margin-top: 12px

#### Section 3: Permissions/Settings
- Padding: 24px

- Label: "Siapa yang dapat mengakses" (14px, bold)
- Radio buttons:
  - Option 1: "Siapa pun dengan tautan" (selected by default)
  - Option 2: "Hanya orang yang ditentukan"
  - Font: 14px
  - Gap: 16px between options

- Checkboxes (below):
  - "Kumpulkan alamat email" (14px, checkbox left)
  - "Izinkan pengguna mengedit respons mereka" (14px, checkbox left)
  - Gap: 12px between items

#### Footer:
- Padding: 16px 24px
- Border-top: 1px solid #E8E8E8
- Button: "Tutup" atau just close button

---

### Settings Modal

**Structure:**
- Title: "Pengaturan"
- Same modal styling as Share Modal
- Width: 600px

**Tabs/Sections:**

#### Tab 1: Presentation
- Label: "Presentasi" (14px, bold)
- Options:
  1. Toggle: "Tampilkan bilah kemajuan"
  2. Toggle: "Tampilkan nomor pertanyaan"
  3. Toggle: "Acak urutan pertanyaan"
  4. Toggle: "Satu pertanyaan per halaman"

Each toggle:
- Layout: Flex, space-between, align-items: center
- Label: 14px, left
- Switch: Right
- Margin-bottom: 16px

#### Tab 2: Responses
- Label: "Respons" (14px, bold)
- Options:
  1. Toggle: "Kumpulkan alamat email"
  2. Toggle: "Izinkan pengguna mengedit respons"
  3. Toggle: "Batas satu respons per pengguna"
  4. Toggle: "Tampilkan halaman konfirmasi"

#### Tab 3: Confirmation Message
- Label: "Pesan konfirmasi" (14px, bold)
- Textarea: Custom message
  - Placeholder: "Terima kasih telah mengisi survei kami!"
  - Width: 100%
  - Min-height: 100px
  - Padding: 12px
  - Border: 1px solid #D0D0D0
  - Border-radius: 4px
  - Font: 14px

---

## 6. INTERACTIONS & ANIMATIONS

### Smooth Transitions
- All state changes: 0.2s ease
- Hover effects: subtle
- Focus indicators: Blue (#5F35F5) outline or underline
- Color transitions: 0.15s ease

### Keyboard Shortcuts
- Tab: Navigate between elements
- Shift+Tab: Navigate backwards
- Enter: Add new item (in option fields)
- Delete: Remove item (delete key on hover)
- Escape: Close modal/cancel edit
- Ctrl+Z: Undo (if supported)
- Ctrl+S: Save (if needed)

### Real-time Preview
- Right panel updates as user types
- Shows how respondent sees survey
- Update delay: < 100ms (real-time feel)

### Auto-save
- Save after every change
- Show "Menyimpan..." indicator
- Show "Disimpan" confirmation

---

## 7. RESPONSIVE BEHAVIOR

### Desktop (1920px+)
- Full 3-column layout
- All elements visible
- Fixed sidebars both sides

### Tablet (768px - 1280px)
- Right toolbar might collapse into hamburger menu
- Narrower padding
- Font sizes slightly smaller

### Mobile (< 768px)
- Hide left sidebar (show as drawer/modal)
- Hide right toolbar (show as bottom sheet menu)
- Center canvas full width
- Stacked layout
- Bottom navigation for main functions
- Hamburger menu for options
- Navbar simplified

---

## 8. COLOR PALETTE

**Primary Colors:**
- Purple/Blue: #5F35F5
- Green (success): #34A853
- Red (danger/error): #EA4335
- Orange (warning): #FBBC04

**Neutral Colors:**
- White: #FFFFFF
- Light gray background: #F9F9F9
- Light gray: #F5F5F5
- Light border: #E8E8E8
- Medium gray border: #D0D0D0
- Medium gray text: #808080
- Dark gray text: #5F6368
- Black text: #202124

**Semantic Colors:**
- Disabled: #CACBCC
- Focus: #5F35F5 (blue)
- Hover overlay: rgba(0, 0, 0, 0.04)

---

## 9. TYPOGRAPHY

**Font Family:**
- Primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif

**Font Sizes & Weights:**
- Navbar title: 20px, weight 500
- Modal title: 18px, weight 700
- Card title: 18px, weight 500
- Section label: 14px, weight 700
- Button text: 14px, weight 500
- Input/field text: 14px, weight 400
- Helper text: 12px, weight 400, gray #808080
- Placeholder text: 14px, weight 400, gray #5F6368

**Line Heights:**
- Headings: 1.4
- Body: 1.5
- Labels: 1.2

---

## 10. KEY INTERACTION PATTERNS

### Add Question Flow
1. Click "+ Tambahkan pertanyaan" button in left sidebar OR right toolbar
2. New white card appears below current question
3. Focus automatically on title input field
4. Auto-select "Short text" type
5. Show live preview in right panel
6. Left sidebar updates with new question number

### Edit Question
1. Click on question in left sidebar OR click on question card
2. Highlight active question (blue border in sidebar)
3. Form becomes focused and editable
4. Changes save automatically (auto-save)
5. Preview updates real-time

### Delete Question
1. Hover over question card
2. Delete button appears at bottom
3. Click delete button
4. Show confirmation dialog: "Hapus pertanyaan?"
5. On confirm, fade out card and remove
6. Update all question numbering below
7. Left sidebar updates

### Duplicate Question
1. Click duplicate/copy icon at bottom of card
2. Create new card immediately below with same content
3. Update numbering automatically
4. Auto-focus new question in sidebar
5. Scroll to new question position

### Reorder Questions (Drag & Drop)
1. Click drag handle (6 dots) on question item in sidebar
2. Visual feedback: Opacity 0.5, cursor grab
3. Drag over other questions
4. Drop zone appears (blue highlight or insert line)
5. On drop: Reorder list smoothly
6. Update all numbering
7. Center canvas follows focus

### Change Question Type
1. Click dropdown showing current type
2. Select new type from dropdown menu
3. Content area updates smoothly (fade transition)
4. Preserves title & description
5. Reset options to defaults for new type
6. Update preview immediately

### Add Options (for choice questions)
1. Click "Tambahkan opsi" link
2. New option input appears
3. Focus on new input field
4. Type option text
5. Press Enter or click outside to confirm
6. Repeat or auto-add next blank option

### Toggle Required Field
1. Click toggle switch at bottom
2. Switch animates (0.2s ease)
3. Status shows immediately
4. Preview updates to show asterisk (*)

### Open Settings Modal
1. Click settings/gear icon in navbar
2. Modal appears with fade transition (0.2s)
3. Focus on first tab
4. Show/hide toggles based on current settings
5. Changes apply immediately (no save button needed)
6. Close: click X or close button

### Open Share Modal
1. Click share/send button in navbar
2. Modal appears centered
3. Link is pre-copied or ready to copy
4. Can send via email
5. Can view/edit permissions

---

## 11. EMPTY STATES

### No Questions Yet (First Time)
- Show empty state illustration (optional)
- Centered text: "Tambahkan pertanyaan pertama Anda" (16px)
- Large blue button: "+ Tambahkan pertanyaan" (centered, 200px width)
- Padding: 100px top, center aligned

### No Questions Selected
- Show in center canvas
- Illustration: Form with question mark
- Text: "Buat atau edit pertanyaan Anda di sini" (16px, gray)
- Sample card shown faded/disabled

---

## 12. ERROR STATES

### Network Error
- Toast notification appears top-center
- Background: Red #EA4335
- Icon: Exclamation circle (white, 20x20px)
- Text: "Koneksi terputus. Periksa koneksi Anda." (14px, white)
- Close button: X (optional, white)
- Auto-dismiss: 5 seconds
- Box-shadow: 0 4px 12px rgba(0,0,0,0.15)

### Unsaved Changes Warning
- Icon badge appears on navbar title
- Unsaved indicator: "●" dot (red #EA4335)
- Tooltip: "Ada perubahan yang belum disimpan"
- Disappears when saved

### Validation Errors
- Red border on invalid input field
- Error message below field (12px, red #EA4335)
- Examples:
  - "Pertanyaan harus memiliki judul"
  - "Minimal 2 opsi diperlukan"
  - "Opsi tidak boleh duplikat"

### Confirmation Dialogs
- Title: Question/action
- Message: Explanation
- Buttons: "Batal" (gray) and "Hapus" (red)
- Modal styling same as settings/share

---

## 13. ACCESSIBILITY

- All buttons have ARIA labels and tooltips
- Focus indicators visible (blue outline 2px, offset 2px)
- Color not only indicator (use icons + text)
- Keyboard navigation (Tab, Shift+Tab, Enter, Escape)
- Screen reader friendly (semantic HTML)
- Sufficient color contrast (WCAG AA minimum)
- Font sizes readable (min 14px for body)
- Hover targets min 44x44px (touch-friendly)
- Alternative text for all icons
- Fieldset/legend for grouped inputs

---

## 14. FILE REFERENCES & ASSETS

**Icons Used:**
- Plus sign (+)
- Gear/Settings
- Send/Share
- Three dots (more)
- Trash/Delete
- Copy/Duplicate
- Drag handle (6 dots)
- Chevron down
- Radio button (circle)
- Checkbox (square)
- Search
- Close (X)
- Exclamation
- Success checkmark
- Image/Photo
- Video/Play
- Text/Title
- List/Section
- Upload/Cloud
- Palette/Colors
- Back arrow
- Eye/View
- Lock/Private
- User/Person
- Checkbox grid
- Linear scale
- Calendar/Date
- Clock/Time
- File
- Mountain (generic image)

**Icon Style:**
- Material Design Icons or similar
- Size: 16px, 20px, 24px depending on context
- Color: Follows text color
- Stroke-width: 2px for consistency

---

## 15. COMPONENT STATE SUMMARY

### Input Fields
- Default: Border #D0D0D0
- Focus: Border #5F35F5 (2px), shadow subtle blue
- Hover: Border #808080
- Error: Border #EA4335
- Disabled: Background #F5F5F5, color #CACBCC
- Placeholder: Color #5F6368

### Buttons
- Default: Background white, border #D0D0D0, text #202124
- Primary: Background #5F35F5, text white
- Hover: Darken primary color
- Active: Darken more
- Disabled: Background #CACBCC, text #808080, cursor not-allowed
- Focus: Blue outline 2px

### Toggles/Switches
- Off: Gray background #CACBCC, circle left
- On: Blue background #5F35F5, circle right
- Transition: 0.2s ease
- Size: 48x24px (w x h)

### Cards
- Default: White background, border #E8E8E8
- Hover: Box-shadow deeper (0 2px 8px)
- Focus/Selected: Border #5F35F5 (2px), shadow blue tint
- Error: Border #EA4335

### Modals
- Overlay: rgba(0, 0, 0, 0.5)
- Background: White
- Border-radius: 8px
- Box-shadow: 0 4px 16px rgba(0,0,0,0.15)
- Max-width: 90% (responsive)

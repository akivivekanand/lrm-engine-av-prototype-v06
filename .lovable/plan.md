## Plan: Remove Checkbox UI, Add Tag-Based Search

### Changes in `src/pages/ResourceVault.tsx`

**1. Remove checkbox & bulk action system**

- Remove `Checkbox` import (line 6)
- Remove `usePersistedState` import (line 10) — not needed here anymore
- Remove `selectedResources` state, `toggleSelect`, `clearAll`, `copyAllSelected`, `allCards` (lines 420, 426-444)
- In `renderCard`: remove `isSelected`, the checkbox div (lines 448, 453-458), and `pr-8` class on wrapper
- Remove sticky selection bar (lines 533-550)
- Remove conditional padding on nav div (line 553: remove the ternary, just use `"flex gap-3"`)
- 1. Add State for Expanded Card
  At the top of your component (near other `useState` hooks), add:
  ```
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  ```
  This stores which card is currently open.
  ---
  # 2. Update the Toggle Function
  Where your expand arrow click handler exists, change it to:
  ```
  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };
  ```
  This means:
  • clicking an open card closes it  
    
  • clicking a new card opens it
  ---
  # 3. Use the State When Rendering Cards
  Where each resource card is rendered, replace the expansion logic with:
  ```
  const isExpanded = expandedCard === resource.id;
  ```
  Then update the card click behavior:
  ```
  <div className="card">

    <div
      className="card-header cursor-pointer"
      onClick={() => toggleCard(resource.id)}
    >
      {/* title + badge + chevron */}
    </div>

    {isExpanded && (
      <div className="card-content">
        {/* content + buttons */}
      </div>
    )}

  </div>
  ```
  &nbsp;

**2. Add tags to ResourceCard interface and data**  
Add `tag?: string` field to the `ResourceCard` interface. 

```
interface ResourceCard {
  id: string
  title: string
  category: string
  content?: string
  description?: string
  tag?: string
}
```

- TEMPLATES: tags like `["networking", "outreach", "linkedin"]`, `["resume"]`, etc.
- AI_PROMPTS: `["resume", "job search"]`, `["interview"]`, `["linkedin"]`, `["networking"]`, `["career strategy"]`, etc.
- INTERVIEW_PREP: `["interview"]`
- NETWORKING: `["networking", "linkedin"]`
- SUFFOLK_RESOURCES: `["career strategy", "job search"]`

**3. Add search bar with tag filtering**  
Add a `searchQuery` state. Place an `<Input>` with placeholder "Search resources, prompts, or templates" above the Tabs.

Filter logic in each tab's card rendering: match `searchQuery` (case-insensitive) against `card.title`, `card.category`, `card.content`, `card.description`, and card.tag

```
Convert both the search query and the card fields to lowercase before comparing.

const query = searchQuery.trim().toLowerCase();

const matchesSearch =
  card.title?.toLowerCase().includes(query) ||
  card.category?.toLowerCase().includes(query) ||
  card.content?.toLowerCase().includes(query) ||
  card.description?.toLowerCase().includes(query) ||
  card.tag?.toLowerCase().includes(query);
```

Then render only if `matchesSearch`.

**4. Clean up Dashboard reference**
In `src/pages/Dashboard.tsx`: remove the `selectedResources` persisted state (line 30) and the "Your Resources" section that depends on it (lines ~305-320). Replace with a static link to Step 5 or remove the section entirely — since there's no selection system anymore, the count is meaningless.

### Files modified

- `src/pages/ResourceVault.tsx`
- `src/pages/Dashboard.tsx`
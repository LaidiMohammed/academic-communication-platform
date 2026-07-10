# Fixes for chat-page.tsx

## 1. Fix sticky header (both sidebar and chat view)

### Sidebar (around line 855)
Change:
```html
<div class="... flex-col overflow-y-auto overflow-x-hidden ...">
  <div class="... sticky top-0 z-10 bg-card">...</div>
```
To:
```html
<div class="... flex-col overflow-x-hidden ...">
  <div class="... relative bg-card">...</div>
```

Find: `<div className={`${selectedChat ? 'hidden' : 'flex'} md:flex md:w-72 bg-card border-r border-border flex-col overflow-y-auto overflow-x-hidden max-w-full relative transform-gpu`}>`
Replace with: `<div className={`${selectedChat ? 'hidden' : 'flex'} md:flex md:w-72 bg-card border-r border-border flex-col overflow-x-hidden max-w-full relative`}>`

Find: `<div className="p-3 border-b border-border relative sticky top-0 z-10 bg-card">`
Replace with: `<div className="p-3 border-b border-border relative bg-card">`

### Chat view (around line 1143)
Find: `<div className="flex flex-1 flex-col bg-card overflow-y-auto overflow-x-hidden relative min-w-0">`
Replace with: `<div className="flex flex-1 flex-col bg-card overflow-hidden relative min-w-0">`

Find: `<div className="flex-1 overflow-x-hidden px-3 py-2 space-y-2 flex flex-col">`
Replace with: `<div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-2 flex flex-col">`

Find: `<div className="border-b border-border px-3 py-2.5 flex items-center justify-between shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">`
Replace with: `<div className="border-b border-border px-3 py-2.5 flex items-center justify-between shrink-0 bg-card/80 backdrop-blur-sm">`

## 2. Voice upload fix

The `/api/upload` route expects `authorization` header (lowercase). Next.js normalizes headers to lowercase. The client sends `Authorization` (capital A). This should work via Next.js normalization. If not, check the route handler.

## 3. Call overlay

The overlay uses `animate-pulse` but needs `relative` on a parent container. Wrap it in a proper container.

## 4. Groups tab

Add this after the `filteredByMode` line:
```js
useEffect(() => {
  if (currentUser) fetchChats();
}, [chatMode]);
```

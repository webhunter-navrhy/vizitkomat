// Malé úložisko v IndexedDB (návrhy s obrázkami sa do localStorage nezmestia)
const DB = 'vizitkomat', STORE = 'kv';
let dbp;
function db() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
export async function get(key) {
  try {
    const d = await db();
    return await new Promise((res) => { const t = d.transaction(STORE).objectStore(STORE).get(key); t.onsuccess = () => res(t.result); t.onerror = () => res(undefined); });
  } catch (e) { return undefined; }
}
export async function set(key, val) {
  try {
    const d = await db();
    return await new Promise((res) => { const tx = d.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(val, key); tx.oncomplete = () => res(true); tx.onerror = () => res(false); });
  } catch (e) { return false; }
}
export async function del(key) {
  try {
    const d = await db();
    return await new Promise((res) => { const tx = d.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(key); tx.oncomplete = () => res(true); });
  } catch (e) { return false; }
}

// ---------- košík ----------
const CART = 'cart-v2';
function emit(items) {
  try { localStorage.setItem('vk2-cart-count', String(items.length)); } catch (e) { /* nič */ }
  window.dispatchEvent(new CustomEvent('vk:cart', { detail: items }));
}
export async function cartItems() { return (await get(CART)) || []; }
export async function cartAdd(item) {
  const items = await cartItems();
  item.id = item.id || Math.random().toString(36).slice(2, 10);
  item.added = Date.now();
  items.push(item); await set(CART, items); emit(items); return items;
}
export async function cartUpdate(id, patch) {
  const items = (await cartItems()).map((it) => (it.id === id ? { ...it, ...patch, config: { ...it.config, ...(patch.config || {}) } } : it));
  await set(CART, items); emit(items); return items;
}
export async function cartRemove(id) { const items = (await cartItems()).filter((it) => it.id !== id); await set(CART, items); emit(items); return items; }
export async function cartClear() { await set(CART, []); emit([]); }
export function cartCountFast() { try { return +(localStorage.getItem('vk2-cart-count') || 0); } catch (e) { return 0; } }

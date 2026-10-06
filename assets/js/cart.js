// Košík v localStorage
import { store, itemPrice } from './util.js';
const KEY = 'vk-cart-v1';

export function getCart() { return store(KEY) || []; }
function save(items) {
  store(KEY, items);
  window.dispatchEvent(new CustomEvent('vk:cart', { detail: items }));
  return items;
}
export function addItem(item) {
  const items = getCart();
  item.id = item.id || Math.random().toString(36).slice(2, 10);
  item.added = Date.now();
  items.push(item);
  try { return save(items); }
  catch (e) { // plné úložisko – zahodíme logo z návrhu
    delete item.design.logo; items[items.length - 1] = item; return save(items);
  }
}
export function updateItem(id, patch) {
  const items = getCart().map((it) => (it.id === id ? { ...it, ...patch, config: { ...it.config, ...(patch.config || {}) } } : it));
  return save(items);
}
export function removeItem(id) { return save(getCart().filter((it) => it.id !== id)); }
export function clearCart() { return save([]); }
export function cartCount() { return getCart().length; }
export function cartTotal() { return getCart().reduce((s, it) => s + itemPrice(it.config), 0); }

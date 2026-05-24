/**
 * XURCUN API Service
 * Connects the React frontend to the Node.js backend
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function fetchJSON(path: string, opts?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ─── CATEGORIES ─── */
export const getCategories = () => fetchJSON('/categories');
export const createCategory = (data: any) => fetchJSON('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id: number, data: any) => fetchJSON(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id: number) => fetchJSON(`/categories/${id}`, { method: 'DELETE' });
export const reorderCategories = (ids: number[]) => fetchJSON('/categories/reorder', { method: 'POST', body: JSON.stringify({ ids }) });

/* ─── SUBCATEGORIES ─── */
export const getSubcategories = () => fetchJSON('/subcategories');
export const createSubcategory = (data: any) => fetchJSON('/subcategories', { method: 'POST', body: JSON.stringify(data) });
export const updateSubcategory = (id: number, data: any) => fetchJSON(`/subcategories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSubcategory = (id: number) => fetchJSON(`/subcategories/${id}`, { method: 'DELETE' });
export const reorderSubcategories = (ids: number[]) => fetchJSON('/subcategories/reorder', { method: 'POST', body: JSON.stringify({ ids }) });

/* ─── ITEMS ─── */
export const getItems = () => fetchJSON('/items');
export const createItem = (data: any) => fetchJSON('/items', { method: 'POST', body: JSON.stringify(data) });
export const updateItem = (id: number, data: any) => fetchJSON(`/items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteItem = (id: number) => fetchJSON(`/items/${id}`, { method: 'DELETE' });
export const reorderItems = (ids: number[]) => fetchJSON('/items/reorder', { method: 'POST', body: JSON.stringify({ ids }) });

/* ─── BRANCHES ─── */
export const getBranchesAPI = () => fetchJSON('/branches');
export const createBranch = (data: any) => fetchJSON('/branches', { method: 'POST', body: JSON.stringify(data) });
export const updateBranch = (id: number, data: any) => fetchJSON(`/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBranch = (id: number) => fetchJSON(`/branches/${id}`, { method: 'DELETE' });

/* ─── BADGES ─── */
export const getBadgesAPI = () => fetchJSON('/badges');
export const createBadge = (data: any) => fetchJSON('/badges', { method: 'POST', body: JSON.stringify(data) });
export const updateBadge = (id: number, data: any) => fetchJSON(`/badges/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteBadge = (id: number) => fetchJSON(`/badges/${id}`, { method: 'DELETE' });

/* ─── FULL MENU ─── */
export const getFullMenu = () => fetchJSON('/menu');

/* ─── SEED ─── */
export const seedDatabase = () => fetchJSON('/seed', { method: 'POST' });

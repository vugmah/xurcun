/**
 * Generate menuEditsSeed.ts from static menu data
 * Run: node scripts/generate-seed.js
 */

const fs = require('fs');
const path = require('path');

// Read menuData.ts as text and extract items
const menuDataPath = path.join(__dirname, '../src/lib/menuData.ts');
const content = fs.readFileSync(menuDataPath, 'utf-8');

// Simple regex-based extraction of item objects
function extractItems(blockContent) {
  const items = [];
  // Match { name_az: '...', ... } objects
  const regex = /\{\s*name_az:\s*'([^']+)'\s*,\s*name_ru:\s*'([^']+)'\s*,\s*name_en:\s*'([^']+)'([^}]*?)\}/g;
  let match;
  while ((match = regex.exec(blockContent)) !== null) {
    const name_az = match[1];
    const name_ru = match[2];
    const name_en = match[3];
    const rest = match[4];
    const item = { name_az, name_ru, name_en };
    // Extract optional fields
    const priceMatch = rest.match(/price:\s*'([^']+)'/);
    if (priceMatch) item.price = priceMatch[1];
    const imgMatch = rest.match(/image_url:\s*'([^']+)'/);
    if (imgMatch) item.image_url = imgMatch[1];
    const newMatch = rest.match(/is_new:\s*true/);
    if (newMatch) item.is_new = true;
    const meatMatch = rest.match(/is_meat:\s*true/);
    if (meatMatch) item.is_meat = true;
    const fishMatch = rest.match(/is_fish:\s*true/);
    if (fishMatch) item.is_fish = true;
    const vegMatch = rest.match(/is_vegetarian:\s*true/);
    if (vegMatch) item.is_vegetarian = true;
    const halalMatch = rest.match(/is_halal:\s*true/);
    if (halalMatch) item.is_halal = true;
    const snackMatch = rest.match(/is_snack:\s*true/);
    if (snackMatch) item.is_snack = true;
    // Descriptions
    const descAzMatch = rest.match(/desc_az:\s*'([^']+)'/);
    if (descAzMatch) item.desc_az = descAzMatch[1];
    const descRuMatch = rest.match(/desc_ru:\s*'([^']+)'/);
    if (descRuMatch) item.desc_ru = descRuMatch[1];
    const descEnMatch = rest.match(/desc_en:\s*'([^']+)'/);
    if (descEnMatch) item.desc_en = descEnMatch[1];
    const nameTrMatch = rest.match(/name_tr:\s*'([^']+)'/);
    if (nameTrMatch) item.name_tr = nameTrMatch[1];
    const descTrMatch = rest.match(/desc_tr:\s*'([^']+)'/);
    if (descTrMatch) item.desc_tr = descTrMatch[1];
    items.push(item);
  }
  return items;
}

function extractCategories(sectionContent) {
  const categories = [];
  // Split by category objects
  const catRegex = /\{\s*title_az:\s*'([^']+)'\s*,\s*title_ru:\s*'([^']+)'\s*,\s*title_en:\s*'([^']+)'([^]*?)items:\s*\[([^]*?)\],?\s*\}/g;
  let match;
  while ((match = catRegex.exec(sectionContent)) !== null) {
    categories.push({
      title_az: match[1],
      title_ru: match[2],
      title_en: match[3],
      items: extractItems(match[5]),
    });
  }
  return categories;
}

// Extract food categories
const alacarteStart = content.indexOf('export const alacarteData');
const alacarteEnd = content.indexOf('// BEVERAGES');
const alacarteSection = content.substring(alacarteStart, alacarteEnd);
const foodCats = extractCategories(alacarteSection);

// Extract beverage categories
const beverageStart = content.indexOf('export const beverageData');
const beverageEnd = content.indexOf('// SHISHA') || content.indexOf('export const shishaData');
const beverageSection = content.substring(beverageStart, beverageEnd);
const bevCats = extractCategories(beverageSection);

// Extract shisha hookahs
const shishaStart = content.indexOf('export const shishaData');
const shishaSection = content.substring(shishaStart);
const shishaHookahs = extractItems(shishaSection);

// Build seed object
const seed = {};

// Process food
for (const cat of foodCats) {
  for (const item of cat.items) {
    const key = `food::${cat.title_az}::${item.name_az}`;
    const edit = {};
    if (item.image_url) edit.image_url = item.image_url;
    if (item.is_new) edit.is_new = true;
    if (item.is_meat) edit.is_meat = true;
    if (item.is_fish) edit.is_fish = true;
    if (item.is_vegetarian) edit.is_vegetarian = true;
    if (item.is_halal) edit.is_halal = true;
    if (item.is_snack) edit.is_snack = true;
    if (item.price) edit.price = item.price;
    if (item.desc_az) edit.desc_az = item.desc_az;
    if (item.desc_ru) edit.desc_ru = item.desc_ru;
    if (item.desc_en) edit.desc_en = item.desc_en;
    if (item.name_tr) edit.name_tr = item.name_tr;
    if (item.desc_tr) edit.desc_tr = item.desc_tr;
    if (Object.keys(edit).length > 0) {
      seed[key] = edit;
    }
  }
}

// Process beverage
for (const cat of bevCats) {
  for (const item of cat.items) {
    const key = `beverage::${cat.title_az}::${item.name_az}`;
    const edit = {};
    if (item.image_url) edit.image_url = item.image_url;
    if (item.is_new) edit.is_new = true;
    if (item.is_meat) edit.is_meat = true;
    if (item.is_fish) edit.is_fish = true;
    if (item.is_vegetarian) edit.is_vegetarian = true;
    if (item.is_halal) edit.is_halal = true;
    if (item.price) edit.price = item.price;
    if (item.desc_az) edit.desc_az = item.desc_az;
    if (item.desc_ru) edit.desc_ru = item.desc_ru;
    if (item.desc_en) edit.desc_en = item.desc_en;
    if (Object.keys(edit).length > 0) {
      seed[key] = edit;
    }
  }
}

// Process shisha hookahs
for (const item of shishaHookahs) {
  const key = `shisha::Qəlyan cihazları::${item.name_az}`;
  const edit = {};
  if (item.image_url) edit.image_url = item.image_url;
  if (item.is_new) edit.is_new = true;
  if (item.is_meat) edit.is_meat = true;
  if (item.is_fish) edit.is_fish = true;
  if (item.is_vegetarian) edit.is_vegetarian = true;
  if (item.is_halal) edit.is_halal = true;
  if (item.price) edit.price = item.price;
  if (Object.keys(edit).length > 0) {
    seed[key] = edit;
  }
}

// Add category layout entries
seed["food::CATLAYOUT::Səhər yeməyi"] = { qr_layout_mode: "card" };
seed["food::CATLAYOUT::Salatlar"] = { qr_layout_mode: "card" };
seed["shisha::CATLAYOUT::Qəlyan cihazları"] = { qr_layout_mode: "card" };

console.log(`Generated seed with ${Object.keys(seed).length} entries`);

// Write seed file
const seedContent = `/* ─── DEPLOYED MENU EDITS SEED ───
   
   This file contains hardcoded menu edits that are deployed with the app.
   All browsers/devices will see these edits — they are NOT localStorage.
   
   localStorage edits (per-browser) overlay on top of these seeds.
   
   HOW TO UPDATE:
   1. Edit items in admin panel, save them
   2. In admin, click "Seed Export" to generate this file's content
   3. Paste the exported code here, replacing DEPLOYED_EDITS
   4. Rebuild and redeploy
   
   WHY: Static hosting cannot run a backend. For cross-device QR visibility,
   edited images/badges/prices must be baked into the deployed bundle.
*/

import type { MenuEdit, BranchItemEdit } from "./menuStore";

/** Hardcoded item edits visible to all users (not localStorage) */
export const DEPLOYED_EDITS: Record<string, MenuEdit> = ${JSON.stringify(seed, null, 2)};

/** Hardcoded branch edits visible to all users */
export const DEPLOYED_BRANCH_EDITS: Record<string, BranchItemEdit> = {};
`;

const seedPath = path.join(__dirname, '../src/lib/menuEditsSeed.ts');
fs.writeFileSync(seedPath, seedContent);
console.log(`Seed written to ${seedPath}`);

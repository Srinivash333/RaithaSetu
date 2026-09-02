/**
 * Frontend helper for consistent, stable Agro Store fallback images with fail-safe error handling.
 */

export const DEFAULT_STORE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="100%" height="100%" fill="%231b4332"/><g fill="%232d6a4f"><path d="M0 350 L800 250 L800 500 L0 500 Z"/><circle cx="650" cy="150" r="80" fill="%2340916c" opacity="0.3"/><circle cx="150" cy="380" r="100" fill="%2352b788" opacity="0.2"/></g><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="32" font-weight="900" fill="%23d8f3dc">🌿 RAITHASETU AGRO STORE</text><text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="600" fill="%23b7e4c7">Quality Seeds • Fertilizers • Farming Tools</text></svg>`;

export const FALLBACK_AGRO_STORE_IMAGES = [
  'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80', // Fertilizer & farm inputs
  'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=800&q=80', // Seeds & grain shop
  'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=800&q=80', // Agro retail store
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80', // Agricultural products display
  'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80', // Farm tools & equipment store
  'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80', // Rural agro input shop
  'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=800&q=80', // Crop protection & fertilizer shop
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80'  // Modern agro store
];

export function getStoreImage(storeId, customImage) {
  if (customImage && typeof customImage === 'string' && customImage.trim() !== '') {
    const isGenericDefault = customImage.includes('photo-1589923188900-85dae523342b');
    if (!isGenericDefault) {
      return customImage.trim();
    }
  }

  const idStr = String(storeId || 'default-store');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % FALLBACK_AGRO_STORE_IMAGES.length;
  return FALLBACK_AGRO_STORE_IMAGES[index];
}

export function handleStoreImageError(e, storeId) {
  if (!e || !e.target) return;
  e.target.onerror = null; // Prevent infinite loop
  
  // Hash storeId to pick a secondary fallback or use default SVG
  const idStr = String(storeId || 'fallback');
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const secondaryIndex = (Math.abs(hash) + 1) % FALLBACK_AGRO_STORE_IMAGES.length;
  
  if (e.target.src !== FALLBACK_AGRO_STORE_IMAGES[secondaryIndex]) {
    e.target.src = FALLBACK_AGRO_STORE_IMAGES[secondaryIndex];
  } else {
    e.target.src = DEFAULT_STORE_SVG;
  }
}

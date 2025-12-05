const API_BASE_URL = 'http://192.168.31.162:3000/api'; 

export const API_URLS = {
  // Auth
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  
  // User Data
  ME: `${API_BASE_URL}/user/me`,
  
  // Food & Diary
  FOOD_SEARCH: `${API_BASE_URL}/food`, // /api/food?search=...
  DIARY: `${API_BASE_URL}/diary`,     // GET and POST
  
  // --- ADD THIS NEW LINE ---
  FOOD_SEARCH_BARCODE: `${API_BASE_URL}/food/barcode`, // /api/food/barcode/[upc]
  FOOD_CUSTOM: `${API_BASE_URL}/food/custom`,
  CHAT: `${API_BASE_URL}/chat`, 
   AI_RECOMMEND: `${API_BASE_URL}/ai/recommend`,
};
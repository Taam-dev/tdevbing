const axios = require('axios');

// Danh sách từ khóa dự phòng tự nhiên nếu không có Groq API Key hoặc API lỗi
const FALLBACK_KEYWORDS = [
  "thời tiết hôm nay",
  "tin tức công nghệ mới nhất",
  "cách làm cà phê muối ngon",
  "giá vàng hôm nay",
  "lịch thi đấu ngoại hạng anh",
  "top phim netflix đáng xem",
  "công nghệ ai mới nhất 2026",
  "cách chăm sóc cây cảnh trong nhà",
  "địa điểm du lịch đà lạt đẹp",
  "công thức làm bánh mì hoa cúc",
  "latest tech news today",
  "best mechanical keyboard 2026",
  "healthy dinner recipes easy",
  "space exploration discoveries",
  "world cup history facts",
  "how to improve coding speed",
  "javascript async await best practices",
  "nature documentary recommendations",
  "quantum computing basics explained",
  "top travel destinations asia"
];

let fallbackIndex = 0;

/**
 * Lấy một từ khóa tìm kiếm ngẫu nhiên từ Groq API (model qwen/qwen3.8-27b)
 * hoặc từ danh sách fallback phong phú nếu không cấu hình API Key.
 */
async function getRandomSearchKeyword() {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a search query generator. Output ONLY a single natural search query (2-5 words) that a normal person would type into Bing. Do NOT include quotes, numbering, or explanations."
            },
            {
              role: "user",
              content: "Give me 1 random, realistic search query about technology, nature, history, cuisine, or science."
            }
          ],
          temperature: 0.9,
          max_tokens: 30
        },
        {
          headers: {
            "Authorization": `Bearer ${apiKey.trim()}`,
            "Content-Type": "application/json"
          },
          timeout: 8000
        }
      );

      const raw = response.data?.choices?.[0]?.message?.content?.trim();
      if (raw) {
        // Làm sạch chuỗi
        const cleaned = raw.replace(/^["'`]+|["'`]+$/g, '').trim();
        if (cleaned.length > 2) {
          return cleaned;
        }
      }
    } catch (err) {
      console.warn(`[Groq API] Không gọi được API (${err.message}). Chuyển sang fallback keyword.`);
    }
  }

  // Fallback ngẫu nhiên không lặp
  const randomIndex = Math.floor(Math.random() * FALLBACK_KEYWORDS.length);
  const keyword = FALLBACK_KEYWORDS[randomIndex];
  // Thêm một số biến thể nhỏ để đảm bảo từ khóa luôn độc nhất
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `${keyword} ${suffix}`;
}

module.exports = {
  getRandomSearchKeyword
};

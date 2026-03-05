const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Genre color palettes
const GENRE_PALETTES = {
  'Ficção Científica': { primary: '#0a192f', secondary: '#64ffda', accent: '#ccd6f6', emoji: '🚀' },
  'Fantasia': { primary: '#1a0533', secondary: '#c084fc', accent: '#fbbf24', emoji: '✨' },
  'Romance': { primary: '#450a0a', secondary: '#f472b6', accent: '#fde68a', emoji: '💕' },
  'Thriller': { primary: '#0f172a', secondary: '#ef4444', accent: '#f8fafc', emoji: '🔪' },
  'Mistério': { primary: '#1e1b4b', secondary: '#818cf8', accent: '#e2e8f0', emoji: '🔍' },
  'Horror': { primary: '#030712', secondary: '#dc2626', accent: '#6b7280', emoji: '👁️' },
  'Autoajuda': { primary: '#064e3b', secondary: '#34d399', accent: '#fef3c7', emoji: '🌟' },
  'Negócios': { primary: '#1e3a5f', secondary: '#3b82f6', accent: '#e0f2fe', emoji: '📈' },
  'História': { primary: '#292524', secondary: '#d97706', accent: '#fef9c3', emoji: '📜' },
  'Aventura': { primary: '#14532d', secondary: '#22c55e', accent: '#fef3c7', emoji: '⚔️' },
  'Poesia': { primary: '#3b0764', secondary: '#e879f9', accent: '#faf5ff', emoji: '🌸' },
  'Infantil': { primary: '#0c4a6e', secondary: '#38bdf8', accent: '#fef08a', emoji: '🦋' },
};

const DEFAULT_PALETTE = { primary: '#1e293b', secondary: '#7c3aed', accent: '#f1f5f9', emoji: '📖' };

class CoverAgent {
  getPalette(genre) {
    return GENRE_PALETTES[genre] || DEFAULT_PALETTE;
  }

  async generateCover(bookInfo) {
    const { title, genre, description, theme } = bookInfo;
    const palette = this.getPalette(genre);

    const prompt = `Você é um designer de capas de livros especializado. Crie metadados visuais para a capa deste livro:

Título: "${title}"
Gênero: ${genre}
Descrição: ${description}
Tema: ${theme || 'Não especificado'}

Responda APENAS com JSON válido neste formato exato:
{
  "tagline": "Uma frase curta e impactante (máx. 10 palavras) que aparecerá na capa",
  "subtitle": "Subtítulo opcional do livro (ou null)",
  "symbol": "Um símbolo ou objeto que representa o livro (ex: 'Espada antiga coberta de runas', 'Galáxia espiral')",
  "mood": "A atmosfera visual (ex: 'épico e grandioso', 'misterioso e sombrio')",
  "gradientAngle": 135,
  "colorVariation": "dark|medium|light"
}`;

    try {
      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 512,
        thinking: { type: 'adaptive' },
        messages: [{ role: 'user', content: prompt }],
      });

      const response = await stream.finalMessage();
      const text = response.content.find(b => b.type === 'text')?.text || '{}';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const coverData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        ...palette,
        tagline: coverData.tagline || `Uma jornada inesquecível`,
        subtitle: coverData.subtitle || null,
        symbol: coverData.symbol || genre,
        mood: coverData.mood || 'envolvente',
        gradientAngle: coverData.gradientAngle || 135,
        colorVariation: coverData.colorVariation || 'dark',
      };
    } catch (e) {
      return {
        ...palette,
        tagline: `Uma história que você não vai esquecer`,
        subtitle: null,
        symbol: genre,
        mood: 'envolvente',
        gradientAngle: 135,
        colorVariation: 'dark',
      };
    }
  }
}

module.exports = new CoverAgent();

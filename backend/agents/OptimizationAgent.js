const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

class OptimizationAgent {
  constructor() {
    this.model = 'claude-opus-4-6';
  }

  async optimizeChapter(chapterText, chapterInfo, bookInfo) {
    const { number, title } = chapterInfo;
    const { genre, writingStyle } = bookInfo;

    const prompt = `Você é um editor literário sênior especializado em ${genre}.

Analise e melhore este capítulo "${title}" (Capítulo ${number}):

TEXTO ORIGINAL:
${chapterText.substring(0, 3000)}${chapterText.length > 3000 ? '\n[...resto do capítulo...]' : ''}

Faça estas melhorias específicas:
1. Identifique e melhore os 3 parágrafos mais fracos
2. Adicione mais tensão e ritmo onde necessário
3. Melhore transições entre cenas
4. Verifique se diálogos soam naturais
5. Garanta que o final prende o leitor para o próximo capítulo

Responda em JSON:
{
  "engagementScore": 8,
  "improvements": ["melhoria 1", "melhoria 2", "melhoria 3"],
  "openingStrength": "forte|médio|fraco",
  "endingHook": "Texto do gancho final melhorado (última frase ou parágrafo do capítulo)",
  "readabilityNotes": "Nota geral sobre ritmo e legibilidade"
}`;

    try {
      const stream = client.messages.stream({
        model: this.model,
        max_tokens: 1024,
        thinking: { type: 'adaptive' },
        messages: [{ role: 'user', content: prompt }],
      });

      const response = await stream.finalMessage();
      const text = response.content.find(b => b.type === 'text')?.text || '{}';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { engagementScore: 8 };
    } catch (e) {
      return { engagementScore: 8, improvements: [], openingStrength: 'forte' };
    }
  }

  async generateReadingStats(bookInfo) {
    const totalWords = bookInfo.chapters?.reduce((acc, ch) => {
      return acc + (ch.content ? ch.content.split(/\s+/).length : 1800);
    }, 0) || 18000;

    const avgReadingSpeed = 250; // words per minute
    const totalMinutes = Math.round(totalWords / avgReadingSpeed);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {
      totalWords,
      estimatedReadingTime: hours > 0 ? `${hours}h ${minutes}min` : `${minutes} min`,
      avgChapterLength: Math.round(totalWords / (bookInfo.chapters?.length || 10)),
      pages: Math.round(totalWords / 250),
    };
  }

  async generateReaderReview(bookInfo) {
    const { title, genre, description } = bookInfo;

    const prompt = `Gere 3 avaliações fictícias de leitores para o livro "${title}" (${genre}).
Descrição: ${description}

Cada avaliação deve parecer autêntica, com reações emocionais reais.
Responda em JSON:
{
  "reviews": [
    {
      "name": "Nome do Leitor",
      "rating": 5,
      "text": "Avaliação de 2-3 frases",
      "date": "há 2 dias"
    }
  ]
}`;

    try {
      const stream = client.messages.stream({
        model: this.model,
        max_tokens: 512,
        thinking: { type: 'adaptive' },
        messages: [{ role: 'user', content: prompt }],
      });

      const response = await stream.finalMessage();
      const text = response.content.find(b => b.type === 'text')?.text || '{}';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : { reviews: [] };
    } catch (e) {
      return { reviews: [] };
    }
  }
}

module.exports = new OptimizationAgent();

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

class WritingAgent {
  constructor() {
    this.model = 'claude-opus-4-6';
  }

  async generateOutline(params, onToken) {
    const { genre, theme, targetAudience, language = 'Português', numChapters = 10 } = params;

    const prompt = `Você é um escritor literário premiado. Crie um esboço detalhado e envolvente para um livro.

Gênero: ${genre}
Tema/Assunto: ${theme}
Público-alvo: ${targetAudience}
Idioma: ${language}
Número de capítulos: ${numChapters}

Responda APENAS com JSON válido neste formato:
{
  "title": "Título cativante do livro",
  "author": "Nome de autor fictício adequado ao gênero",
  "description": "Sinopse envolvente de 3-4 frases que prende o leitor",
  "backCover": "Texto da contracapa (2-3 parágrafos que criam suspense e vontade de ler)",
  "dedication": "Dedicatória emotiva curta",
  "targetPages": 280,
  "chapters": [
    {
      "number": 1,
      "title": "Título do Capítulo",
      "summary": "Resumo do que acontece neste capítulo (2-3 frases)",
      "hook": "Como o capítulo termina para prender o leitor"
    }
  ],
  "themes": ["tema1", "tema2", "tema3"],
  "writingStyle": "Descrição do estilo narrativo (ex: 'Narrativa em primeira pessoa, ritmo acelerado, diálogos vívidos')"
}`;

    const stream = client.messages.stream({
      model: this.model,
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    });

    let fullText = '';
    stream.on('text', (delta) => {
      fullText += delta;
      if (onToken) onToken({ type: 'outline_token', text: delta });
    });

    const response = await stream.finalMessage();
    const text = response.content.find(b => b.type === 'text')?.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Outline generation failed: invalid JSON');
    return JSON.parse(jsonMatch[0]);
  }

  async writePreface(bookInfo, onToken) {
    const { title, author, description, themes, writingStyle, genre } = bookInfo;

    const prompt = `Você é ${author}, o autor de "${title}". Escreva o PREFÁCIO deste livro.

Gênero: ${genre}
Descrição: ${description}
Temas principais: ${themes?.join(', ')}
Estilo narrativo: ${writingStyle}

O prefácio deve:
- Ter 3-4 parágrafos envolventes
- Criar conexão emocional imediata com o leitor
- Revelar a motivação do autor para escrever este livro
- Terminar com uma frase poderosa que faça o leitor querer começar o primeiro capítulo imediatamente
- Ser escrito em ${bookInfo.language || 'Português'}
- Tom: autêntico, apaixonado, direto ao leitor

Escreva apenas o texto do prefácio, sem títulos extras ou metadados.`;

    const stream = client.messages.stream({
      model: this.model,
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    });

    let fullText = '';
    stream.on('text', (delta) => {
      fullText += delta;
      if (onToken) onToken({ type: 'preface_token', text: delta });
    });

    await stream.finalMessage();
    return fullText.trim();
  }

  async writeChapter(chapter, bookInfo, previousChapterEnding, onToken) {
    const { title: bookTitle, author, genre, writingStyle, language = 'Português' } = bookInfo;
    const { number, title: chapterTitle, summary, hook } = chapter;

    const contextNote = previousChapterEnding
      ? `\nO capítulo anterior terminou com: "${previousChapterEnding}"\nContinue a narrativa de forma fluida.`
      : '\nEste é o primeiro capítulo. Inicie a história de forma impactante que prenda o leitor imediatamente.';

    const prompt = `Você é ${author}, escrevendo o livro "${bookTitle}" (${genre}).
Estilo narrativo: ${writingStyle}
Idioma: ${language}
${contextNote}

Escreva o CAPÍTULO ${number}: "${chapterTitle}"

Resumo do capítulo: ${summary}
Como deve terminar: ${hook}

Diretrizes obrigatórias:
- Mínimo de 1500 palavras, idealmente 2000-2500 palavras
- Diálogos vivos e autênticos quando apropriado
- Descrições sensoriais ricas (visão, som, cheiro, tato)
- Ritmo variado: alterne cenas de ação com momentos reflexivos
- Desenvolva os personagens através das ações, não apenas descrições
- Cada parágrafo deve conduzir o leitor ao próximo
- O final do capítulo DEVE criar suspense ou resolver algo inesperadamente
- Comece com uma cena ou frase de impacto imediato

Escreva apenas o texto do capítulo, começando diretamente com a narrativa.`;

    const stream = client.messages.stream({
      model: this.model,
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high' },
      messages: [{ role: 'user', content: prompt }],
    });

    let fullText = '';
    stream.on('text', (delta) => {
      fullText += delta;
      if (onToken) onToken({ type: 'chapter_token', chapterNumber: number, text: delta });
    });

    await stream.finalMessage();
    return fullText.trim();
  }

  async writeConclusion(bookInfo, onToken) {
    const { title, author, genre, chapters, language = 'Português' } = bookInfo;
    const lastChapter = chapters?.[chapters.length - 1];

    const prompt = `Você é ${author}. Escreva o EPÍLOGO/CONCLUSÃO do livro "${title}" (${genre}).

O livro teve ${chapters?.length || 10} capítulos de história emocionante.
${lastChapter ? `O último capítulo foi: "${lastChapter.title}"` : ''}
Idioma: ${language}

O epílogo deve:
- Dar fechamento satisfatório à história
- Ter 2-3 parágrafos
- Deixar o leitor emocionado e satisfeito (ou com vontade de ler o próximo livro)
- Pode ter uma reviravolta final ou revelação emotiva
- Ser memorável

Escreva apenas o texto do epílogo.`;

    const stream = client.messages.stream({
      model: this.model,
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    });

    let fullText = '';
    stream.on('text', (delta) => {
      fullText += delta;
      if (onToken) onToken({ type: 'conclusion_token', text: delta });
    });

    await stream.finalMessage();
    return fullText.trim();
  }
}

module.exports = new WritingAgent();

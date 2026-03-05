const writingAgent = require('./WritingAgent');
const coverAgent = require('./CoverAgent');
const optimizationAgent = require('./OptimizationAgent');
const bookStore = require('../store/books');

class ContentOrchestrator {
  /**
   * Generate a complete book with all agents, streaming progress via callback.
   * @param {object} params - { genre, theme, targetAudience, language, numChapters }
   * @param {function} onEvent - SSE event emitter: onEvent({ type, ... })
   * @returns {object} Complete book object
   */
  async generateBook(params, onEvent) {
    const emit = (data) => {
      if (onEvent) onEvent(data);
    };

    const { genre, theme, targetAudience, language = 'Português', numChapters = 8 } = params;

    // Create a placeholder book entry
    const bookEntry = bookStore.create({
      genre,
      theme,
      targetAudience,
      language,
      status: 'generating',
      progress: 0,
      title: 'Gerando...',
    });

    emit({ type: 'started', bookId: bookEntry.id, message: 'Iniciando geração do livro...' });

    try {
      // ─── STEP 1: Generate outline ─────────────────────────────────────────
      emit({ type: 'step', step: 'outline', message: 'Criando estrutura e enredo do livro...' });
      bookStore.update(bookEntry.id, { progress: 5 });

      const outline = await writingAgent.generateOutline(
        { genre, theme, targetAudience, language, numChapters },
        (token) => emit({ ...token, bookId: bookEntry.id })
      );

      bookStore.update(bookEntry.id, {
        title: outline.title,
        author: outline.author,
        description: outline.description,
        backCover: outline.backCover,
        dedication: outline.dedication,
        themes: outline.themes,
        writingStyle: outline.writingStyle,
        chapterOutlines: outline.chapters,
        progress: 15,
      });

      emit({
        type: 'outline_complete',
        bookId: bookEntry.id,
        title: outline.title,
        author: outline.author,
        description: outline.description,
        totalChapters: outline.chapters.length,
      });

      // ─── STEP 2: Generate cover ───────────────────────────────────────────
      emit({ type: 'step', step: 'cover', message: 'Desenhando a capa do livro...' });

      const coverData = await coverAgent.generateCover({
        title: outline.title,
        genre,
        description: outline.description,
        theme,
      });

      bookStore.update(bookEntry.id, { cover: coverData, progress: 20 });
      emit({ type: 'cover_complete', bookId: bookEntry.id, cover: coverData });

      // ─── STEP 3: Write preface ────────────────────────────────────────────
      emit({ type: 'step', step: 'preface', message: 'Escrevendo o prefácio...' });

      const bookInfoForWriting = {
        title: outline.title,
        author: outline.author,
        description: outline.description,
        themes: outline.themes,
        writingStyle: outline.writingStyle,
        genre,
        language,
        chapters: [],
      };

      const preface = await writingAgent.writePreface(
        bookInfoForWriting,
        (token) => emit({ ...token, bookId: bookEntry.id })
      );

      bookStore.update(bookEntry.id, { preface, progress: 25 });
      emit({ type: 'preface_complete', bookId: bookEntry.id });

      // ─── STEP 4: Write each chapter ───────────────────────────────────────
      const chapters = [];
      const progressPerChapter = 55 / outline.chapters.length;
      let previousEnding = null;

      for (const chapterOutline of outline.chapters) {
        const chapterNum = chapterOutline.number;
        const progressStart = 25 + (chapterNum - 1) * progressPerChapter;

        emit({
          type: 'step',
          step: 'chapter',
          chapterNumber: chapterNum,
          chapterTitle: chapterOutline.title,
          message: `Escrevendo Capítulo ${chapterNum}: "${chapterOutline.title}"...`,
        });

        const content = await writingAgent.writeChapter(
          chapterOutline,
          { ...bookInfoForWriting, chapters },
          previousEnding,
          (token) => emit({ ...token, bookId: bookEntry.id })
        );

        // Extract last paragraph as ending hook for next chapter
        const paragraphs = content.split('\n\n').filter(p => p.trim());
        previousEnding = paragraphs[paragraphs.length - 1]?.trim().substring(0, 200);

        const wordCount = content.split(/\s+/).length;
        const chapter = {
          number: chapterNum,
          title: chapterOutline.title,
          summary: chapterOutline.summary,
          content,
          wordCount,
        };

        chapters.push(chapter);
        bookStore.update(bookEntry.id, {
          chapters,
          progress: Math.round(progressStart + progressPerChapter),
        });

        emit({
          type: 'chapter_complete',
          bookId: bookEntry.id,
          chapterNumber: chapterNum,
          chapterTitle: chapterOutline.title,
          wordCount,
        });
      }

      // ─── STEP 5: Write conclusion/epilogue ────────────────────────────────
      emit({ type: 'step', step: 'conclusion', message: 'Escrevendo o epílogo...' });

      const conclusion = await writingAgent.writeConclusion(
        { ...bookInfoForWriting, chapters },
        (token) => emit({ ...token, bookId: bookEntry.id })
      );

      bookStore.update(bookEntry.id, { conclusion, progress: 85 });
      emit({ type: 'conclusion_complete', bookId: bookEntry.id });

      // ─── STEP 6: Reading stats & reviews ─────────────────────────────────
      emit({ type: 'step', step: 'finalize', message: 'Finalizando o livro...' });

      const readingStats = await optimizationAgent.generateReadingStats({ chapters });
      const reviewsData = await optimizationAgent.generateReaderReview({
        title: outline.title,
        genre,
        description: outline.description,
      });

      // ─── FINALIZE ─────────────────────────────────────────────────────────
      const completeBook = bookStore.update(bookEntry.id, {
        status: 'complete',
        progress: 100,
        preface,
        conclusion,
        chapters,
        cover: coverData,
        readingStats,
        reviews: reviewsData.reviews || [],
        totalWords: readingStats.totalWords,
        estimatedReadingTime: readingStats.estimatedReadingTime,
        pages: readingStats.pages,
      });

      emit({
        type: 'complete',
        bookId: bookEntry.id,
        book: completeBook,
        message: `"${outline.title}" foi criado com sucesso!`,
      });

      return completeBook;

    } catch (err) {
      console.error('ContentOrchestrator error:', err);
      bookStore.update(bookEntry.id, { status: 'error', errorMessage: err.message });
      emit({ type: 'error', bookId: bookEntry.id, message: err.message });
      throw err;
    }
  }
}

module.exports = new ContentOrchestrator();

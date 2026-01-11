import { Request, Response } from 'express';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

/**
 * Controller for AI-related endpoints (now using LangChain + Gemini)
 */
export class AIController {
  private static gemini: ChatGoogleGenerativeAI;

  /**
   * Initialize Gemini client
   */
  static initializeGemini(): void {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required');
    }
    AIController.gemini = new ChatGoogleGenerativeAI({ apiKey, model: 'gemini-2.5-flash' });
  }

  /**
   * Generate a Reddit post draft using Gemini via LangChain
   */
  static async generateDraft(req: Request, res: Response): Promise<void> {
    try {
      const { keywords, tone, customPrompt } = req.body;

      // Validate input
      if (!keywords || !tone || (tone === 'custom' && !customPrompt)) {
        res.status(400).json({ error: 'Keywords and tone are required. If using custom, provide a prompt.' });
        return;
      }

      const validTones = ['story', 'question', 'experience', 'custom'];
      if (!validTones.includes(tone)) {
        res.status(400).json({ error: 'Tone must be one of: story, question, experience, custom' });
        return;
      }

      if (!AIController.gemini) {
        AIController.initializeGemini();
      }

      // Construct prompt based on tone
      let prompt: string;
      if (tone === 'custom' && customPrompt) {
        prompt = `Generate a Reddit post about "${keywords}". ${customPrompt} Format the response as JSON with "title" and "body" fields. Keep the title under 300 characters and the body between 200-2000 characters. The body should be at least 100 words.`;
      } else {
        switch (tone) {
          case 'story':
            prompt = `Generate a Reddit post about "${keywords}". Write it as a personal story or anecdote. The post should be engaging, relatable, and encourage discussion. Format the response as JSON with "title" and "body" fields. Keep the title under 300 characters and the body between 200-2000 characters. The body should be at least 100 words.`;
            break;
          case 'question':
            prompt = `Generate a Reddit post about "${keywords}". Write it as an engaging question that encourages community discussion. The post should be thought-provoking and invite responses. Format the response as JSON with "title" and "body" fields. Keep the title under 300 characters and the body between 200-2000 characters. The body should be at least 100 words.`;
            break;
          case 'experience':
            prompt = `Generate a Reddit post about "${keywords}". Write it as a personal experience or observation that others can relate to. The post should be authentic and encourage sharing of similar experiences. Format the response as JSON with "title" and "body" fields. Keep the title under 300 characters and the body between 200-2000 characters. The body should be at least 100 words.`;
            break;
          default:
            prompt = `Generate a Reddit post about "${keywords}". Write it in a conversational tone that encourages engagement. Format the response as JSON with "title" and "body" fields. Keep the title under 300 characters and the body between 200-2000 characters. The body should be at least 100 words.`;
        }
      }

      // Use LangChain's prompt template and Gemini LLM
      const chatPrompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          'You are a helpful assistant that generates Reddit posts. Always respond with valid JSON containing "title" and "body" fields. Make the content engaging and appropriate for Reddit communities.'
        ],
        ['user', prompt]
      ]);

      const chain = RunnableSequence.from([
        chatPrompt,
        AIController.gemini
      ]);

      const response = await chain.invoke({});
      let responseText = '';
      if (typeof response === 'string') {
        responseText = response;
      } else if (Array.isArray(response) && response.length > 0 && typeof response[0].text === 'string') {
        responseText = response[0].text;
      } else if (response?.content && typeof response.content === 'string') {
        responseText = response.content;
      }

      // Parse JSON response
      let parsedResponse;
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        parsedResponse = JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error('Failed to parse Gemini response:', error);
        res.status(500).json({ error: 'Failed to parse Gemini response' });
        return;
      }

      // Validate response structure
      if (!parsedResponse.title || !parsedResponse.body) {
        res.status(500).json({ error: 'Invalid response structure from Gemini' });
        return;
      }

      // Clean and validate content
      const title = parsedResponse.title.trim();
      const body = parsedResponse.body.trim();

      // Log the generated body for debugging
      console.log('Generated body:', body, 'Length:', body.length);

      if (title.length > 300) {
        res.status(500).json({ error: 'Generated title is too long' });
        return;
      }

      if (body.length < 50 || body.length > 4000) {
        res.status(500).json({ error: 'Generated body is not within acceptable length' });
        return;
      }

      res.json({
        title,
        body,
        keywords,
        tone
      });
    } catch (error) {
      console.error('Gemini draft generation error:', error);
      res.status(500).json({ error: 'Failed to generate draft with Gemini' });
    }
  }

  /**
   * Get available tones for AI generation
   */
  static async getTones(req: Request, res: Response): Promise<void> {
    try {
      const tones = [
        {
          value: 'story',
          label: 'Personal Story',
          description: 'Share a personal anecdote or experience'
        },
        {
          value: 'question',
          label: 'Discussion Question',
          description: 'Ask an engaging question to the community'
        },
        {
          value: 'experience',
          label: 'Experience Share',
          description: 'Share an observation or experience for others to relate to'
        },
        {
          value: 'custom',
          label: 'Custom (write your own prompt)',
          description: 'Write your own custom prompt or style for the AI to use'
        }
      ];

      res.json({ tones });
    } catch (error) {
      console.error('Get tones error:', error);
      res.status(500).json({ error: 'Failed to fetch tones' });
    }
  }
} 
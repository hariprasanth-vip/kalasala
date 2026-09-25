/**
 * Ollama Service: Gemma 3 Local AI Inference Engine
 * Integrates local Gemma 3 models via Ollama API for low-latency, private pedagogical reasoning.
 */

class OllamaService {
  constructor() {
    this.baseUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
    this.model = process.env.OLLAMA_MODEL || 'gemma3:latest';
    this.timeoutMs = 180000; // 180s timeout for local GPU/CPU generation
  }

  async isAvailable() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  }

  async generateChatResponse(messages, systemInstruction = '') {
    const endpoint = `${this.baseUrl}/api/chat`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    const formattedMessages = systemInstruction 
      ? [{ role: 'system', content: systemInstruction }, ...messages]
      : messages;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.25,
            num_predict: 1200,  // Enough for full JSON response with code & diagrams
            num_ctx: 4096       // Enough for detailed system prompt + chat history
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.message || typeof data.message.content !== 'string') {
        throw new Error('Unexpected payload structure from Ollama');
      }

      let content = data.message.content.trim();
      // Strip markdown code fences if wrapped
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      }

      // Debug: Log first 200 chars of Gemma 3 output
      console.log('[Gemma 3 Raw Output Preview]:', content.slice(0, 200));

      return content;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}

module.exports = new OllamaService();

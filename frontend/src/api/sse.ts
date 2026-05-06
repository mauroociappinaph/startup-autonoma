import { type SSEReaderOptions } from "@/types/index";

/**
 * Servicio especializado para el manejo de Server-Sent Events (SSE) y Streams.
 * Desacopla la lógica de conexión y parsing de protocolo SSE del resto de la aplicación.
 */

export const sseClient = {
  /**
   * Maneja un EventSource estándar para streams GET.
   */
  connect(url: string, options: SSEReaderOptions): EventSource {
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event: MessageEvent) => {
      try {
        const rawData = event.data;
        if (rawData === "execution_complete" || rawData === '"execution_complete"') {
          options.onEnd?.();
          return;
        }
        const data = JSON.parse(rawData);
        options.onData(data);
      } catch (e) {
        options.onError?.(e);
      }
    };

    eventSource.addEventListener("end", () => {
      options.onEnd?.();
      eventSource.close();
    });

    eventSource.onerror = (err: Event) => {
      console.error("❌ [SSE Client] EventSource error crítico:", err);
      options.onError?.(err);
      eventSource.close();
    };

    return eventSource;
  },

  /**
   * Lee un ReadableStream (usado típicamente en POST con fetch).
   */
  async readStream(reader: ReadableStreamDefaultReader<Uint8Array>, options: SSEReaderOptions) {
    const decoder = new TextDecoder();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          options.onEnd?.();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const rawData = line.replace('data: ', '').trim();
            if (rawData === '"execution_complete"' || rawData === 'execution_complete') continue;

            try {
              const data = JSON.parse(rawData);
              options.onData(data);
            } catch (e) {
              console.error("❌ SSE JSON Parse Error:", e, rawData);
            }
          }
          if (line.startsWith('event: end')) {
            options.onEnd?.();
          }
        }
      }
    } catch (error) {
      options.onError?.(error);
    }
  }
};

import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { Index } from '@upstash/vector';

// Initialize Upstash Vector client
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system:
      'You are the official Gyeonggi-do Travel Assistant. ' +
      'Help users plan trips, discover attractions, learn local history, and find transportation options in Gyeonggi Province, South Korea. ' +
      'Use the getInformation tool whenever the user asks a factual question about places, transport, or events in Gyeonggi-do. ' +
      'Synthesize information carefully from the retrieved context. ' +
      'If the retrieved context does not contain any relevant information about the user request, state: "I do not have enough context in the Gyeonggi-do travel guide to answer that question."',
    messages,
    maxSteps: 2, // <--- CRITICAL FIX: Allows AI SDK to auto-execute tool and stream the final answer
    tools: {
      getInformation: tool({
        description:
          'Search the Gyeonggi-do official travel guide for information on attractions, places, history, and transport.',
        parameters: z.object({
          query: z
            .string()
            .describe('The search query or keyword to look up in the vector index.'),
        }),
        execute: async ({ query }) => {
          const hits = await index.query({
            data: query,
            topK: 10,
            includeMetadata: true,
          });

          return hits.map((hit) => ({
            page: hit.metadata?.page || 'Unknown',
            text: hit.metadata?.text || '',
            score: hit.score,
          }));
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
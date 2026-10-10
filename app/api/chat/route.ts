/**
 * Final Route Handler — Step 4 of Section 4 (RAG-as-tool-call) +
 * the source metadata used by Step 5's UI.
 *
 * The model decides whether to call the getInformation tool. When it does,
 * the tool runs vector search and returns chunk text + page + score. The
 * client renders those as collapsible sources under the assistant message.
 */
import { openai } from '@ai-sdk/openai';
import { streamText, tool, embed } from 'ai';
import { Index } from '@upstash/vector';
import { z } from 'zod';

const index = new Index();

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
model: openai('gpt-4o-mini'),
    system:
      'You are the official Gyeonggi-do Travel Assistant. ' +
      'Help users plan trips, discover attractions, learn local history, and find transportation options in Gyeonggi Province, South Korea. ' +
      'Use the getInformation tool whenever the user asks a factual question about places, transport, or events in Gyeonggi-do. ' +
      'Synthesize information carefully from the retrieved context. ' +
      'If the retrieved context does not contain any relevant information about the user request, state: "I do not have enough context in the Gyeonggi-do travel guide to answer that question."',
    messages,
    tools: {
      getInformation: tool({
        description:
          'Look up information from the official Gyeonggi-do travel guide. Use this whenever the user asks a substantive question about tourism, attractions, transportation, or history in Gyeonggi-do.',
        parameters: z.object({
          query: z
            .string()
            .describe('the topic, term, or sub-question to search for'),
        }),
        execute: async ({ query }) => {
          const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: query,
          });
          const hits = await index.query({
            vector: embedding,
            topK: 10,
            includeMetadata: true,
          });
          return hits.map((h) => ({
            text: (h.metadata?.text as string) ?? '',
            page: (h.metadata?.page as number) ?? null,
            score: h.score,
          }));
        },
      }),
    },
    maxSteps: 3,
  });

  return result.toDataStreamResponse();
}

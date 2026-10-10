'use client';

import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, setInput, append, isLoading } = useChat();

  const promptChips = [
    'Tell me about Suwon Hwaseong Fortress.',
    'Where is Semiwon Garden located?',
    'What can I see at Gwangmyeong Cave?',
    'What is the EG Tour Bus and how does it work?',
  ];

  const handleChipClick = (chipText: string) => {
    setInput(chipText);
    append({
      role: 'user',
      content: chipText,
    });
  };

  return (
    <main className="flex flex-col items-center min-h-screen p-4 md:p-8 bg-slate-50 text-slate-900">
      <div className="w-full max-w-3xl flex flex-col min-h-[90vh]">
        {/* Header */}
        <header className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Gyeonggi Province Travel Guide • South Korea
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Discover heritage sites, eco-parks, and travel routes across Gyeonggi Province.
            Sources appear under each answer.
          </p>
        </header>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
          {messages.length === 0 ? (
            /* Empty State with Suggested Prompt Chips */
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
              <p className="text-slate-500 mb-4 font-medium text-sm">
                💡 Try asking one of these questions to start:
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                {promptChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(chip)}
                    className="px-3 py-2 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-full text-xs font-medium text-slate-700 transition-colors text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message List */
            messages.map((m) => {
              // Extract retrieved sources from tool invocations if present
              const toolInvocations = m.toolInvocations;
              let sources: Array<{ page: string; text: string; score: number }> = [];

              if (toolInvocations) {
                toolInvocations.forEach((ti) => {
                  if (ti.toolName === 'getInformation' && 'result' in ti && Array.isArray(ti.result)) {
                    sources = ti.result;
                  }
                });
              }

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      m.role === 'user'
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      /* ReactMarkdown parses bold text, headers, lists, and paragraphs */
                      <div className="space-y-2 leading-relaxed [&_h3]:text-base [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1 [&_h2]:text-lg [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_strong]:font-semibold [&_strong]:text-slate-900">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Sources Accordion for Assistant Messages */}
                  {m.role === 'assistant' && sources.length > 0 && (
                    <details className="mt-2 max-w-[85%] text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2">
                      <summary className="cursor-pointer font-medium hover:text-slate-800 select-none">
                        ► Sources ({sources.length})
                      </summary>
                      <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pl-1 pr-1">
                        {sources.map((src, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-white rounded border border-slate-100 text-slate-600 text-[11px]"
                          >
                            <span className="font-semibold text-teal-700">
                              page {src.page}
                            </span>{' '}
                            <span className="text-slate-400">
                              • score {src.score?.toFixed(2)}
                            </span>
                            <p className="mt-1 line-clamp-3 italic text-slate-500">
                              "{src.text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              );
            })
          )}
          {isLoading && (
            <div className="flex items-start">
              <div className="bg-slate-100 border border-slate-200 text-slate-500 rounded-2xl rounded-bl-none px-4 py-2 text-xs animate-pulse">
                Thinking and fetching travel guide info...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about EG Tour Bus, Suwon Hwaseong Fortress, Gwangmyeong Cave..."
            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
          >
            Send
          </button>
        </form>
      </div>
    </main>
  );
}
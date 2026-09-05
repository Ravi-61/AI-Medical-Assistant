import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  FaRobot,
  FaPaperPlane,
  FaUser,
  FaTrashAlt,
  FaHeartbeat,
  FaShieldAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaInfoCircle,
} from 'react-icons/fa';
import chatService from '../services/chatService';

const SUGGESTED_PROMPTS = [
  'What is blood pressure?',
  'What are common symptoms of dehydration?',
  'Explain cholesterol in simple terms.',
  'What does a fever mean?',
];

const MAX_MESSAGE_LENGTH = 4000;

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus textarea on load
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    if (text.length > MAX_MESSAGE_LENGTH) {
      setErrorMessage(`Message is too long. Please limit to ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    setErrorMessage(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare history snapshot for API (role + content only)
    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Update session state with user message
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(text, historyPayload);

      if (response && response.success && response.data) {
        const assistantMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.message,
          model: response.data.model,
          provider: response.data.provider,
          disclaimer: response.data.disclaimer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('Unexpected response format from assistant.');
      }
    } catch (err) {
      console.error('Chat error:', err);

      let userFriendlyError = 'Unable to connect to the medical assistant right now. Please try again.';

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 401) {
          userFriendlyError = 'Your session has expired. Please log in again to continue.';
        } else if (status === 429) {
          userFriendlyError = data?.error?.message || data?.message || 'AI service is temporarily busy. Please wait a moment and try again.';
        } else if (status === 503) {
          userFriendlyError =
            data?.error?.message ||
            'The AI assistant is temporarily unavailable. Please verify configuration or try again shortly.';
        } else if (data?.error?.message) {
          userFriendlyError = data.error.message;
        } else if (data?.message) {
          userFriendlyError = data.message;
        }
      } else if (err.message && !err.message.includes('object')) {
        userFriendlyError = err.message;
      }

      setErrorMessage(userFriendlyError);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    setMessages([]);
    setErrorMessage(null);
    setInputMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-6.5rem)] min-h-[500px]">
      {/* Chat Container */}
      <div className="card h-[calc(100vh-8.5rem)] flex flex-col p-0 overflow-hidden shadow-card dark:shadow-none border border-surface-200 dark:border-surface-800">
        {/* Chat Toolbar Header */}
        <header className="px-5 py-4 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center text-lg shrink-0">
              <FaRobot />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-surface-900 dark:text-surface-50">AI Medical Assistant</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">
                Ask health-related questions and receive educational information.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              disabled={messages.length === 0 || isLoading}
              className="btn-ghost text-xs text-surface-500 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 disabled:opacity-40"
              title="Clear current session conversation"
              aria-label="Clear chat session"
            >
              <FaTrashAlt className="text-xs" />
              <span className="hidden md:inline">Clear Chat</span>
            </button>
          </div>
        </header>

        {/* Message History & Chat Canvas */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface-50/50 dark:bg-surface-950/50"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.length === 0 ? (
            /* Empty / Welcome State */
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-gradient-to-tr from-primary-100 to-secondary-100 dark:from-primary-950/80 dark:to-secondary-950/80 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm border border-primary-200/50 dark:border-primary-800/50">
                <FaHeartbeat className="text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50 mb-2">How can I help you today?</h2>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-6">
                Ask any general health question, understand medical terminology, or learn about wellness practices.
              </p>

              {/* Suggested Prompts */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    disabled={isLoading}
                    className="p-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/40 dark:hover:bg-surface-700/60 rounded-xl text-xs sm:text-sm text-surface-700 dark:text-surface-200 font-medium transition-all duration-150 shadow-sm hover:shadow text-left flex items-center gap-2"
                  >
                    <span className="text-primary-500 shrink-0">💡</span>
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-1.5 text-xs text-surface-400">
                <FaShieldAlt className="text-secondary-600" />
                <span>Session context only • Educational & non-diagnostic</span>
              </div>
            </div>
          ) : (
            /* Message List */
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 flex items-center justify-center shrink-0 text-sm mt-1 shadow-sm border border-primary-200/50 dark:border-primary-800/50">
                      <FaRobot />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-800 dark:text-surface-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm max-w-none break-words dark:prose-invert">
                        <ReactMarkdown
                          components={{
                            h1: ({ ...props }) => (
                              <h3 className="text-base font-bold text-surface-900 dark:text-surface-50 mt-3 mb-1" {...props} />
                            ),
                            h2: ({ ...props }) => (
                              <h4 className="text-sm font-bold text-surface-900 dark:text-surface-50 mt-2 mb-1" {...props} />
                            ),
                            h3: ({ ...props }) => (
                              <h5 className="text-sm font-semibold text-surface-900 dark:text-surface-50 mt-2 mb-1" {...props} />
                            ),
                            p: ({ ...props }) => (
                              <p className="text-sm text-surface-800 dark:text-surface-200 leading-relaxed mb-2 last:mb-0" {...props} />
                            ),
                            ul: ({ ...props }) => (
                              <ul className="list-disc list-inside space-y-1 mb-2 text-sm text-surface-800 dark:text-surface-200" {...props} />
                            ),
                            ol: ({ ...props }) => (
                              <ol
                                className="list-decimal list-inside space-y-1 mb-2 text-sm text-surface-800 dark:text-surface-200"
                                {...props}
                              />
                            ),
                            li: ({ ...props }) => (
                              <li className="text-sm text-surface-800 dark:text-surface-200 leading-relaxed" {...props} />
                            ),
                            strong: ({ ...props }) => (
                              <strong className="font-semibold text-surface-900 dark:text-surface-50" {...props} />
                            ),
                            em: ({ ...props }) => <em className="italic text-surface-800 dark:text-surface-200" {...props} />,
                            code: ({ inline, ...props }) =>
                              inline ? (
                                <code
                                  className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-xs font-mono text-primary-700 dark:text-primary-300"
                                  {...props}
                                />
                              ) : (
                                <pre className="p-2 rounded bg-surface-100 dark:bg-surface-900 overflow-x-auto text-xs font-mono text-surface-800 dark:text-surface-200 my-2">
                                  <code {...props} />
                                </pre>
                              ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Metadata & Timestamp */}
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end gap-2 ${
                        msg.role === 'user' ? 'text-primary-100' : 'text-surface-400 dark:text-surface-500'
                      }`}
                    >
                      {msg.role === 'assistant' && msg.model && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-300 font-mono">
                          {msg.model}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>

                  {/* User Avatar */}
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 flex items-center justify-center shrink-0 text-sm mt-1 shadow-sm">
                      <FaUser />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="flex gap-3 justify-start items-start">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 flex items-center justify-center shrink-0 text-sm mt-1 border border-primary-200/50 dark:border-primary-800/50">
                    <FaRobot />
                  </div>
                  <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-3">
                    <FaSpinner className="animate-spin text-primary-600 dark:text-primary-400 text-sm" />
                    <span className="text-xs text-surface-600 dark:text-surface-300 font-medium animate-pulse">
                      AI Medical Assistant is thinking...
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Error Alert */}
        {errorMessage && (
          <div className="px-4 py-2.5 bg-red-50 dark:bg-red-950/40 border-t border-red-100 dark:border-red-900/50 flex items-start justify-between gap-3 text-red-700 dark:text-red-300 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="font-bold hover:text-red-900 dark:hover:text-red-100 shrink-0 ml-2"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Input Area */}
        <footer className="p-3 sm:p-4 bg-white dark:bg-surface-900 border-t border-surface-100 dark:border-surface-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a medical or health question (e.g. What is blood pressure?)..."
                rows={1}
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={isLoading}
                aria-label="Ask health question"
                className="input resize-none py-2.5 pr-12 min-h-[44px] max-h-32 leading-relaxed"
                style={{ height: 'auto' }}
              />
              {inputMessage.length > 500 && (
                <div className="absolute right-2 bottom-2 text-[10px] text-surface-400 dark:text-surface-500 bg-white/90 dark:bg-surface-800/90 px-1 rounded">
                  {inputMessage.length}/{MAX_MESSAGE_LENGTH}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="btn-primary h-11 w-11 p-0 flex items-center justify-center shrink-0 rounded-xl disabled:opacity-40"
              aria-label="Send message"
            >
              {isLoading ? <FaSpinner className="animate-spin text-sm" /> : <FaPaperPlane className="text-sm" />}
            </button>
          </form>

          {/* Persistent Disclaimer */}
          <div className="mt-2.5 flex items-start gap-1.5 text-[11px] text-surface-500 dark:text-surface-400">
            <FaInfoCircle className="text-primary-500 shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Medical Disclaimer:</strong> This AI assistant provides general educational information and is
              not a substitute for professional medical advice, diagnosis, or treatment. For urgent or serious symptoms,
              seek immediate medical care.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ChatBot;


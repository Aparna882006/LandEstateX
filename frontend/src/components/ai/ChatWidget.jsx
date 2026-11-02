
import { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiMinus,
  FiHome,
  FiLoader,
  FiExternalLink,
} from 'react-icons/fi';

import { AuthContext } from '../../context/AuthContext';
import { chatWithPropertyAssistant } from '../../services/ai.service';

// ==========================================
// INITIAL CHAT MESSAGE
// ==========================================

const INITIAL_MESSAGE = {
  role: 'assistant',
  content:
    'Hello! Welcome to LandEstateX. I can help you find properties, explore prices, and understand buying or renting options. What are you looking for?',
  suggested_questions: [
    'Find apartments in Kanpur',
    'Show 2 BHK properties under 50 lakh',
    'Find rental properties',
  ],
  recommendations: [],
};

// ==========================================
// PRICE FORMATTER
// ==========================================

const formatPrice = (price) => {
  const value = Number(price);

  if (!Number.isFinite(value)) {
    return 'Price not available';
  }

  return `₹${value.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};

// ==========================================
// CHAT WIDGET
// ==========================================

const ChatWidget = () => {
  const { user, loading } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, sending]);

  // ==========================================
  // INPUT FOCUS
  // ==========================================

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Do not show chatbot before authentication loads.
  if (loading || !user) {
    return null;
  }

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = async (messageText = input) => {
    const message = messageText.trim();

    if (!message || sending) {
      return;
    }

    const userMessage = {
      role: 'user',
      content: message,
    };

    const conversationHistory = messages
      .filter(
        (item) =>
          item.role === 'user' ||
          item.role === 'assistant'
      )
      .map((item) => ({
        role: item.role,
        content: item.content,
      }))
      .slice(-20);

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput('');
    setSending(true);

    try {
      const result = await chatWithPropertyAssistant(
        message,
        conversationHistory
      );

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content:
            result?.reply ||
            'Sorry, I could not generate a response.',

          suggested_questions:
            result?.suggested_questions || [],

          recommendations:
            result?.recommendations || [],
        },
      ]);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Something went wrong. Please try again.';

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: `Sorry, I couldn't process your request. ${errorMessage}`,

          suggested_questions: [
            'Find properties in Kanpur',
            'Show rental properties',
          ],

          recommendations: [],
          isError: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // KEYBOARD HANDLER
  // ==========================================

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // ==========================================
  // RESET CHAT
  // ==========================================

  const resetChat = () => {
    if (sending) {
      return;
    }

    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      {/* ======================================
          FLOATING CHAT BUTTON
      ====================================== */}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open LandEstateX assistant"
          className="fixed bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-primary-700 text-white shadow-xl transition-all hover:scale-105 hover:bg-primary-900"
        >
          <FiMessageCircle size={25} />

          <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
        </button>
      )}

      {/* ======================================
          CHAT WINDOW
      ====================================== */}

      {isOpen && (
        <section
          aria-label="LandEstateX property assistant"
          className="fixed bottom-5 right-5 z-[1000] flex h-[min(650px,calc(100vh-40px))] w-[min(400px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
        >
          {/* HEADER */}

          <div className="flex items-center justify-between bg-primary-800 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                <FiHome size={21} />
              </div>

              <div>
                <h3 className="font-semibold">
                  LandEstateX Assistant
                </h3>

                <p className="text-xs text-white/75">
                  Property search assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetChat}
                disabled={sending}
                title="New conversation"
                aria-label="New conversation"
                className="rounded-full p-2 transition hover:bg-white/15 disabled:opacity-40"
              >
                <FiMessageCircle size={18} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                aria-label="Minimize chat"
                className="rounded-full p-2 transition hover:bg-white/15"
              >
                <FiMinus size={20} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
                className="rounded-full p-2 transition hover:bg-white/15"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* ==================================
              CHAT MESSAGES
          ================================== */}

          <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
            {messages.map((item, index) => (
              <div
                key={`${index}-${item.role}`}
                className={`flex ${
                  item.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    item.role === 'user'
                      ? 'rounded-br-sm bg-primary-700 text-white'
                      : item.isError
                        ? 'rounded-bl-sm border border-red-200 bg-red-50 text-red-800'
                        : 'rounded-bl-sm border border-gray-200 bg-white text-gray-800'
                  }`}
                >
                  {/* MESSAGE TEXT */}

                  <p className="whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>

                  {/* ==================================
                      CLICKABLE PROPERTY CARDS
                  ================================== */}

                  {item.recommendations?.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {item.recommendations.map((property) => (
                        <Link
                          key={property.property_id}
                          to={`/properties/${property.property_id}`}
                          title={`View ${property.title || 'property'} details`}
                          className="group block rounded-xl border border-gray-200 bg-white p-3 text-gray-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {/* PROPERTY HEADER */}

                          <div className="flex items-start gap-2">
                            <div className="rounded-lg bg-primary-50 p-2 text-primary-700">
                              <FiHome size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold transition-colors group-hover:text-primary-700">
                                {property.title || 'Property listing'}
                              </h4>

                              <p className="mt-1 text-sm font-bold text-primary-700">
                                {property.formatted_price ||
                                  formatPrice(property.price)}
                              </p>
                            </div>

                            <FiExternalLink
                              size={16}
                              className="shrink-0 text-gray-400 transition-colors group-hover:text-primary-700"
                            />
                          </div>

                          {/* PROPERTY DETAILS */}

                          <div className="mt-3 space-y-1 text-xs text-gray-600">
                            {(property.locality || property.city) && (
                              <p>
                                <span className="font-medium">
                                  Location:
                                </span>{' '}
                                {[property.locality, property.city]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            )}

                            {property.property_type && (
                              <p>
                                <span className="font-medium">
                                  Type:
                                </span>{' '}
                                {property.property_type}
                              </p>
                            )}

                            {property.listing_type && (
                              <p>
                                <span className="font-medium">
                                  Listing:
                                </span>{' '}
                                {property.listing_type}
                              </p>
                            )}

                            {property.bedrooms != null && (
                              <p>
                                <span className="font-medium">
                                  Bedrooms:
                                </span>{' '}
                                {property.bedrooms}
                              </p>
                            )}

                            {property.area_sqft != null && (
                              <p>
                                <span className="font-medium">
                                  Area:
                                </span>{' '}
                                {property.area_sqft} sq.ft.
                              </p>
                            )}
                          </div>

                          {/* VIEW DETAILS LABEL */}

                          <div className="mt-3 border-t border-gray-100 pt-2 text-xs font-semibold text-primary-700">
                            View Property Details →
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* ==================================
                      SUGGESTED QUESTIONS
                  ================================== */}

                  {item.role === 'assistant' &&
                    item.suggested_questions?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.suggested_questions.map((question) => (
                          <button
                            key={question}
                            type="button"
                            disabled={sending}
                            onClick={() => sendMessage(question)}
                            className="rounded-full border border-primary-200 bg-primary-50 px-3 py-2 text-left text-xs font-medium text-primary-800 transition hover:bg-primary-100 disabled:opacity-50"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* ==================================
                TYPING INDICATOR
            ================================== */}

            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
                  <FiLoader
                    className="animate-spin"
                    size={16}
                  />

                  Finding the right properties...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ==================================
              MESSAGE INPUT
          ================================== */}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="border-t border-gray-200 bg-white p-3"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about properties..."
                rows={1}
                maxLength={2000}
                disabled={sending}
                className="max-h-24 min-h-11 flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-600 focus:ring-2 focus:ring-primary-100 disabled:bg-gray-100"
              />

              <button
                type="submit"
                disabled={!input.trim() || sending}
                aria-label="Send message"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-white transition hover:bg-primary-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiSend size={19} />
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-gray-400">
              LandEstateX Property Assistant
            </p>
          </form>
        </section>
      )}
    </>
  );
};

export default ChatWidget;

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/api/chat";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Warning } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { LogoMark } from "@/components/brand/Logo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  /** Set when the turn failed, so a failure never looks like an answer. */
  failed?: boolean;
}

const OPENERS = [
  "What am I most exposed to?",
  "How are my open orders doing?",
  "What moved most today?",
  "Explain a limit order",
];

export default function Chat() {
  const { authenticated } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authenticated) navigate("/login");
  }, [authenticated, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }, [messages, loading, reduce]);

  const send = async (text: string) => {
    const body = text.trim();
    if (!body || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: body, timestamp: new Date() },
    ]);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await sendMessage(body);
      const text = (res.reply ?? res.response ?? "").trim();
      // An empty body is a failure even though the request succeeded. Without
      // this the bubble renders blank and looks like the assistant said
      // nothing, which is exactly how the field-name mismatch hid itself.
      if (!text) throw new Error("empty reply");

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: text,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      // Failures used to be pushed in as ordinary assistant messages, so a raw
      // exception string rendered in a normal bubble with a normal avatar and
      // was indistinguishable from a real answer.
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error?.message?.includes("500") || error?.message?.includes("chat")
              ? "The assistant is unavailable right now."
              : "That message did not go through.",
          timestamp: new Date(),
          failed: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const empty = messages.length === 0;

  return (
    // Fills the viewport under the header rather than a hardcoded 600px card,
    // which overflowed on short screens and wasted space on tall ones.
    <main className="mx-auto flex h-[calc(100dvh-65px)] w-full max-w-[820px] flex-col px-6 md:px-10">
      <div className="flex-1 overflow-y-auto py-10">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <LogoMark size={36} className="text-foreground" />
            <h1 className="mt-6 text-[clamp(1.6rem,3vw,2.25rem)] font-normal tracking-[-0.03em] text-foreground">
              Ask about your book.
            </h1>
            <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
              The assistant reads your live positions and open orders, so it can
              answer about your account rather than crypto in general.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {OPENERS.map((question) => (
                <button
                  key={question}
                  onClick={() => send(question)}
                  className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ul className="space-y-6">
            {messages.map((message) => (
              <motion.li
                key={message.id}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={
                  message.role === "user" ? "flex justify-end" : "flex justify-start"
                }
              >
                {message.role === "user" ? (
                  <p className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                    {message.content}
                  </p>
                ) : (
                  <div className="flex max-w-[92%] gap-3">
                    <span
                      className={
                        "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border " +
                        (message.failed
                          ? "border-destructive/40 text-destructive"
                          : "border-border text-foreground")
                      }
                    >
                      {message.failed ? (
                        <Warning size={13} weight="bold" />
                      ) : (
                        <LogoMark size={15} />
                      )}
                    </span>
                    <div>
                      {/* The model replies in plain text with bullet lines, so
                          newlines are preserved rather than collapsed. */}
                      <p
                        className={
                          "whitespace-pre-wrap text-sm leading-relaxed " +
                          (message.failed ? "text-destructive" : "text-foreground")
                        }
                      >
                        {message.content}
                      </p>
                      {message.failed && (
                        <button
                          onClick={() => send(messages[messages.length - 2]?.content ?? "")}
                          className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.li>
            ))}

            {loading && (
              <li className="flex gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border">
                  <LogoMark size={15} className="text-foreground" />
                </span>
                <span className="flex items-center gap-1 pt-2" aria-label="Thinking">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="block size-1.5 rounded-full bg-muted-foreground"
                      animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        delay: i * 0.16,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </span>
              </li>
            )}
          </ul>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(inputMessage);
        }}
        className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-background py-4"
      >
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about your positions"
          disabled={loading}
          aria-label="Message"
          className="flex-1"
        />
        <button
          type="submit"
          // The old send control was an icon with no accessible name.
          aria-label="Send message"
          disabled={loading || !inputMessage.trim()}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:-translate-y-[1px] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowUp size={17} weight="bold" />
        </button>
      </form>
    </main>
  );
}

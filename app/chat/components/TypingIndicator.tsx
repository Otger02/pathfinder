export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1" aria-label="Loading response">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 bg-text-muted rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

const TypingIndicator = () => {
  return (
    <div className="flex animate-fade-in justify-start">
      <div className="glass-strong rounded-2xl px-5 py-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-accent text-sm font-bold text-accent-foreground">
            AI
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></span>
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></span>
            <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary"></span>
          </div>
          <span className="text-sm text-muted-foreground">ટાઇપ કરી રહ્યું છે...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;

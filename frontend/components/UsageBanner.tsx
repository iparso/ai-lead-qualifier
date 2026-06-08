type Props = {
  subscriptionStatus: string;
  usageCount: number;
};

export default function UsageBanner({ subscriptionStatus, usageCount }: Props) {
  const isPaid =
    subscriptionStatus === "active" || subscriptionStatus === "trialing";
  if (isPaid) return null;

  const remaining = Math.max(0, 2 - usageCount);
  const isExhausted = remaining === 0;

  return (
    <div
      className={`mb-8 rounded-xl border px-5 py-3.5 flex items-center justify-between gap-4 ${
        isExhausted
          ? "bg-hot-muted border-hot/20"
          : "bg-surface border-border"
      }`}
    >
      <p className="text-xs text-body">
        <span
          className={`font-semibold ${isExhausted ? "text-hot" : "text-primary"}`}
        >
          {usageCount} of 2
        </span>{" "}
        free analyses used today
        {isExhausted && " — limit reached"}
        {!isExhausted && (
          <span className="text-muted ml-1">
            ({remaining} remaining, resets midnight UTC)
          </span>
        )}
      </p>
      <a
        href="/billing"
        className="text-xs font-semibold text-primary hover:opacity-70 transition-opacity shrink-0"
      >
        Upgrade →
      </a>
    </div>
  );
}

export default function PreferenceCard({
  preference,
  variant = "select",
  selected = false,
  disabled = false,
  rank = null,
  as = "button",
  children,
  onSelect,
  enterIndex = null,
}) {
  const Tag = as;
  const interactive = Tag === "button";
  const className = [
    "vrbo-v2-pref",
    `vrbo-v2-pref--${variant}`,
    selected ? "is-selected" : "",
    disabled ? "is-disabled" : "",
    enterIndex != null ? "is-stage-enter" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const enterStyle =
    enterIndex != null
      ? {
          // Handoff: 540 + floor(i/2)*120 + (i%2)*45 · 680ms · Y22
          "--stage-delay": `${
            540 + Math.floor(enterIndex / 2) * 120 + (enterIndex % 2) * 45
          }ms`,
          "--stage-duration": "680ms",
          "--stage-y": "22px",
        }
      : undefined;

  if (variant === "chip") {
    return (
      <Tag
        className={className}
        style={{
          ...(preference.image ? { backgroundImage: `url(${preference.image})` } : null),
          ...enterStyle,
        }}
        {...(interactive
          ? {
              type: "button",
              disabled,
              "aria-pressed": selected,
              onClick: () => onSelect?.(preference.id),
            }
          : {})}
      >
        <span className="vrbo-v2-pref__shade" aria-hidden="true" />
        {selected ? (
          <span className="vrbo-v2-pref__tick" aria-hidden="true">
            ✓
          </span>
        ) : null}
        <span className="vrbo-v2-pref__label">{preference.label}</span>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={className}
      style={enterStyle}
      {...(interactive
        ? {
            type: "button",
            disabled,
            "aria-pressed": selected,
            onClick: () => onSelect?.(preference.id),
          }
        : {})}
    >
      {rank != null ? <span className="vrbo-v2-pref__rank">{rank}</span> : null}
      <span className="vrbo-v2-pref__icon" aria-hidden="true">
        {preference.icon}
      </span>
      <span className="vrbo-v2-pref__label">{preference.label}</span>
      {children}
    </Tag>
  );
}

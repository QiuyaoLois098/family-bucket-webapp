export default function PreferenceCard({
  preference,
  variant = "select",
  selected = false,
  disabled = false,
  rank = null,
  as = "button",
  children,
  onSelect,
}) {
  const Tag = as;
  const interactive = Tag === "button";
  const className = [
    "vrbo-v2-pref",
    `vrbo-v2-pref--${variant}`,
    selected ? "is-selected" : "",
    disabled ? "is-disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={className}
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
      {variant === "chip" && selected ? (
        <span className="vrbo-v2-pref__tick" aria-hidden="true">
          ✓
        </span>
      ) : null}
      {variant !== "chip" ? (
        <span className="vrbo-v2-pref__icon" aria-hidden="true">
          {preference.icon}
        </span>
      ) : null}
      <span className="vrbo-v2-pref__label">{preference.label}</span>
      {children}
    </Tag>
  );
}

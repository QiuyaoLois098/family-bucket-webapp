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
    "vrbo-pref",
    `vrbo-pref--${variant}`,
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
      {rank != null ? <span className="vrbo-pref__rank">{rank}</span> : null}
      <span className="vrbo-pref__icon" aria-hidden="true">
        {preference.icon}
      </span>
      <span className="vrbo-pref__label">{preference.label}</span>
      {children}
    </Tag>
  );
}

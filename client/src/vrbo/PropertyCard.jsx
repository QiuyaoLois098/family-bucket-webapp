import { motion } from "framer-motion";

export default function PropertyCard({ property, match, votes, rank, onClick, featured = false, compact = false }) {
  const Tag = onClick ? motion.button : motion.div;
  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`vrbo-property ${featured ? "is-featured" : ""} ${compact ? "is-compact" : ""} ${rank ? "is-ranked" : ""}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="vrbo-property__image" style={{ backgroundImage: `url(${property.image})` }} />
      <span className="vrbo-property__body">
        <span className="vrbo-property__top">
          <strong>{property.name}</strong>
          {match != null ? <em>{match}% match</em> : null}
          {rank ? <b>{rank}</b> : null}
        </span>
        <span className="vrbo-property__meta">
          {property.location} · {property.setting}
        </span>
        {compact ? null : <span className="vrbo-property__copy">{property.description}</span>}
        <span className="vrbo-property__tags">
          {property.tags.map((tag) => (
            <i key={tag}>{tag}</i>
          ))}
        </span>
        {votes?.length ? (
          <span className="vrbo-property__votes">
            {votes.map((vote) => (
              <i key={vote.name} style={{ color: vote.color }}>
                {vote.name} {vote.mark}
              </i>
            ))}
          </span>
        ) : null}
      </span>
    </Tag>
  );
}

import { splitByPhrases } from "@shared/vrboChatCopy.js";

export default function RichChatText({
  text = "",
  parts,
  sharedIds,
  phraseBank = [],
  className,
}) {
  const shared = sharedIds instanceof Set ? sharedIds : new Set(sharedIds ?? []);
  const nodes = parts?.length
    ? parts.map((part) => ({
        text: part.text ?? "",
        bold: Boolean(part.id && shared.has(part.id)),
      }))
    : splitByPhrases(text, shared.size ? phraseBank : []);

  return (
    <p className={className}>
      {nodes.map((node, index) =>
        node.bold ? <strong key={index}>{node.text}</strong> : node.text,
      )}
    </p>
  );
}

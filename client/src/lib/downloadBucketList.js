import html2canvas from "html2canvas";

function slugify(value) {
  return String(value || "family-bucket-list")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function freezeForCapture(root) {
  const previous = [];
  root.querySelectorAll(".print, .letter").forEach((el) => {
    previous.push({ el, animation: el.style.animation, opacity: el.style.opacity });
    el.style.animation = "none";
    el.style.opacity = "1";
  });
  return previous;
}

function restoreAfterCapture(previous) {
  previous.forEach(({ el, animation, opacity }) => {
    el.style.animation = animation;
    el.style.opacity = opacity;
  });
}

export async function downloadBucketListImage(node, name) {
  if (!node) throw new Error("Nothing to print");
  await document.fonts.ready;

  const previous = freezeForCapture(node);
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

  try {
    const canvas = await html2canvas(node, {
      backgroundColor: "#f3e6d2",
      scale: Math.min(2, window.devicePixelRatio || 2),
      useCORS: true,
      logging: false,
      foreignObjectRendering: false,
      ignoreElements: (el) => el.classList?.contains("wall-actions"),
      onclone: (_doc, cloned) => freezeForCapture(cloned),
    });

    const filename = `Family-Bucket-List-${slugify(name)}.png`;
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Could not create image");

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  } finally {
    restoreAfterCapture(previous);
  }
}

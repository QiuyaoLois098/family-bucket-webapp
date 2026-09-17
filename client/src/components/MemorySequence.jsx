import { getDestination } from "@shared/destinations.js";

export default function MemorySequence({ itinerary, destinationId }) {
  const destination = getDestination(destinationId);
  const moments = itinerary?.moments || [];
  if (!destination || !moments.length) return null;

  const gallery = destination.gallery || [];
  const crops = destination.crops || [];
  const photo = (index) => gallery[index % gallery.length] || destination.image;
  const crop = (index) => crops[index % crops.length] || "center";
  const featured = moments[2] || moments[0];

  return (
    <div className="bucket-wall bucket-wall--display">
      <figure className="print print--hero" style={{ animationDelay: "0.05s" }}>
        <span className="print__image" style={{ backgroundImage: `url(${photo(0)})`, backgroundPosition: crop(0) }} />
      </figure>
      <figure className="print print--a" style={{ animationDelay: "0.12s" }}>
        <span className="print__image" style={{ backgroundImage: `url(${photo(1)})`, backgroundPosition: crop(1) }} />
      </figure>
      <article className="letter letter--intro" style={{ animationDelay: "0.18s" }}>
        <p className="letter__dear">Remember this</p>
        <h3>{featured.title}</h3>
        <p className="letter__body">{featured.description}</p>
        <p className="letter__sign">{destination.location}</p>
      </article>
      <figure className="print print--b" style={{ animationDelay: "0.24s" }}>
        <span className="print__image" style={{ backgroundImage: `url(${photo(2)})`, backgroundPosition: crop(2) }} />
      </figure>
      <figure className="print print--c" style={{ animationDelay: "0.3s" }}>
        <span className="print__image" style={{ backgroundImage: `url(${photo(3)})`, backgroundPosition: crop(3) }} />
      </figure>
      <article className="letter letter--0" style={{ animationDelay: "0.36s" }}>
        <p className="letter__dear">{moments[0].time},</p>
        <h3>{moments[0].title}</h3>
        <p className="letter__body">{moments[0].description}</p>
      </article>
      <figure className="print print--d" style={{ animationDelay: "0.42s" }}>
        <span className="print__image" style={{ backgroundImage: `url(${photo(1)})`, backgroundPosition: crop(0) }} />
      </figure>
      {moments[3] ? (
        <article className="letter letter--3" style={{ animationDelay: "0.48s" }}>
          <p className="letter__dear">{moments[3].time},</p>
          <h3>{moments[3].title}</h3>
          <p className="letter__body">{moments[3].description}</p>
        </article>
      ) : null}
    </div>
  );
}

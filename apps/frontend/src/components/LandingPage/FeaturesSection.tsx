import { Link } from "react-router-dom";

type FeatureCard = {
  title: string;
  description: string;
  image: string;
  colSpan: string;
  imageHeight?: string;
};

const featureCards: FeatureCard[] = [
  {
    title: "Local-first recording",
    description:
      "Each participant is recorded at the source, so weak internet does not destroy the original quality.",
    image: "https://framerusercontent.com/images/XOJqmYJPjtxJe9UgAQjlk34wiA.png?width=1014&height=1056",
    colSpan: "lg:col-span-4",
    imageHeight: "h-52",
  },
  {
    title: "Resilient background uploads",
    description:
      "Chunks upload continuously during the meeting with retry support, so progress is never lost.",
    image: "https://framerusercontent.com/images/7FvUbWvGfIYyBfH97MBjQuVo4.png?width=1536&height=1024",
    colSpan: "lg:col-span-8",
    imageHeight: "h-52",
  },
  {
    title: "Smart merge pipeline",
    description:
      "Participant tracks are stitched into a polished final recording with consistent timing and audio sync.",
    image: "https://framerusercontent.com/images/dzwGl9XM1iSJQTeMvB3RXyGOTW4.png?width=1536&height=1024",
    colSpan: "md:col-span-6 lg:col-span-4",
  },
  {
    title: "Team-ready meeting flows",
    description:
      "Create rooms, invite collaborators, and manage recordings with a workflow built for fast-moving teams.",
    image: "https://framerusercontent.com/images/PdHbKxInipkAAn0CgqbYpjXE8g.png?width=1536&height=1024",
    colSpan: "md:col-span-6 lg:col-span-4",
  },
  {
    title: "Playback and editing foundation",
    description:
      "Review merged output instantly and prepare assets for your editing and post-production process.",
    image: "https://framerusercontent.com/images/hfz4pInQcKxS8aKqzmzro9uFvBE.png?width=1536&height=1024",
    colSpan: "md:col-span-12 lg:col-span-4",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-20 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="bg-linear-to-r from-zinc-400 via-zinc-200 to-white bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-5xl">
            Features built for reliable recordings
          </h2>
          <p className="mt-5 text-base leading-7 text-zinc-400 sm:text-lg">
            Weave helps teams capture high-quality meetings, protect uploads on unstable
            networks, and deliver final recordings ready for review and production.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-12">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a111a]/90 ${card.colSpan}`}
            >
              <div className={`relative overflow-hidden ${card.imageHeight ?? "h-44"}`}>
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#0a111a] via-[#0a111a]/35 to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-white sm:text-xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-300/85">{card.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/product"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/10"
          >
            Explore product capabilities
            <span aria-hidden="true">{"->"}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
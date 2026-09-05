import { HERO_CYCLE, useHeroCycleIndex } from "./heroCycle";

export const HeroIconCycler = ({
  className = "",
  index: indexProp,
}: {
  className?: string;
  index?: number;
}) => {
  const internalIndex = useHeroCycleIndex();
  const index = indexProp ?? internalIndex;

  return (
    <div
      className={`relative shrink-0 w-24 h-24 md:w-32 md:h-32 ${className}`}
      role="img"
      aria-label={HERO_CYCLE[index].label}
    >
      {HERO_CYCLE.map((ic, i) => (
        <img
          key={ic.key}
          src={ic.src}
          alt=""
          width={1024}
          height={1024}
          className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 ease-out ${
            i === index ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        />
      ))}
    </div>
  );
};

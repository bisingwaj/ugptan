import { provincePaths, MAP_VIEWBOX } from "./mapData";

export function DRCMapSvg({
  hovered,
  clicked,
  onHover,
  onClick,
  ...props
}: Omit<React.SVGProps<SVGSVGElement>, "onClick"> & {
  hovered: string | null;
  clicked: string | null;
  onHover: (name: string | null) => void;
  // `onClick` reçoit le NOM de la province, pas l'événement — d'où l'Omit
  // ci-dessus, qui écarte le `onClick` (MouseEventHandler) de `SVGProps`.
  onClick: (name: string) => void;
}) {
  return (
    <svg
      viewBox={MAP_VIEWBOX}
      fill="var(--c-20)"
      stroke="var(--c-50)"
      strokeWidth="1"
      strokeLinejoin="round"
      {...props}
    >
      {Object.entries(provincePaths).map(([name, { path }]) => {
        const isHovered = hovered === name;
        const isClicked = clicked === name;

        return (
          <path
            key={name}
            d={path}
            fill={
              isClicked
                ? "var(--ac)"
                : isHovered
                  ? "var(--c-30)"
                  : "var(--c-20)"
            }
            style={{
              transition: "fill 0.2s",
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            onMouseEnter={() => onHover(name)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(name)}
          />
        );
      })}
    </svg>
  );
}

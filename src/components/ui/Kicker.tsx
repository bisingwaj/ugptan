import type { ReactNode } from "react";

type Props = { n?: string; light?: boolean; children: ReactNode; style?: React.CSSProperties };

/** The signature Carbon section label: a mono kicker with a leading rule. */
export function Kicker({ n, light, children, style }: Props) {
  return (
    <div className={light ? "kicker kicker--light" : "kicker"} style={style}>
      {n ? `[ ${n} ] ` : ""}
      {children}
    </div>
  );
}

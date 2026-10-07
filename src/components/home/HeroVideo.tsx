"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type ImageLoaderProps } from "next/image";
import { m, useScroll, useTransform, useSpring } from "framer-motion";
import type { CSSProperties } from "react";
import type { Lang } from "@/lib/pick";
import { usePrefersReducedMotion } from "@/components/motion/useReducedMotion";

/* Libellés du bouton de lecture : deux chaînes, gardées ici plutôt que de
   faire voyager un dictionnaire jusqu'au client pour elles. Le nom dit ce que
   fait le bouton (verbe), pas l'état de la vidéo. */
const LIBELLES = {
  pause: { fr: "Mettre en pause la vidéo d'arrière-plan", en: "Pause background video" },
  lecture: { fr: "Lire la vidéo d'arrière-plan", en: "Play background video" },
} as const;

/* Écran sur lequel la vidéo vaut ce qu'elle coûte : pointeur fin (souris,
   pavé tactile) et fenêtre plus large que la mise en page mobile (760 px,
   cf. globals.css). Un téléphone ou une tablette tenue à la main n'en voit
   que l'affiche, qui suffit : la vidéo y pèse plus d'un mégaoctet, sans son,
   sous un dégradé qui en masque la moitié. */
const ECRAN_VIDEO = "(pointer: fine) and (min-width: 761px)";

/** Réseau qui ne doit pas payer une vidéo décorative. */
function reseauLent() {
  const c = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g" || c.effectiveType === "3g");
}

/* Chargeur de l'affiche. La photographie de démonstration vient d'Unsplash,
   dont le CDN redimensionne et choisit le format (AVIF/WebP, `auto=format`) de
   lui-même : on l'interroge directement, à la largeur demandée, sans le détour
   par l'optimiseur de Next. Surtout, la largeur est PLAFONNÉE à celle de la
   source déclarée (`w=` de l'URL, 1600 px) : l'optimiseur proposait des
   variantes jusqu'à 3840 px, qu'un écran haute densité réclamait pour ne
   recevoir… que la source à 1600 px, après un aller-retour de plus. Une
   affiche servie par un autre hôte (CDN du projet, Cloudinary) repasse par
   l'optimiseur, comme toute image du site. */
function chargeurAffiche({ src, width, quality }: ImageLoaderProps) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    const plafond = Number(url.searchParams.get("w")) || 1600;
    url.searchParams.set("w", String(Math.min(width, plafond)));
    url.searchParams.set("q", String(quality ?? (Number(url.searchParams.get("q")) || 72)));
    url.searchParams.set("auto", "format");
    return url.toString();
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
}

/** Fond vidéo du héros — optimisé pour un chargement rapide.
 *  - L'affiche est peinte INSTANTANÉMENT (calque image toujours présent sous
 *    la vidéo) : c'est le candidat LCP du site.
 *  - La vidéo n'est chargée QUE sur ordinateur (pointeur fin, écran large), et
 *    jamais en « réduire les animations », en mode économie de données ou sur
 *    réseau lent. Sur téléphone : l'affiche seule, zéro octet de vidéo.
 *    L'élément <video> n'est même pas créé hors de ces cas : un attribut
 *    `preload="none"` n'y aurait rien changé, l'autoplay passant outre.
 *  - Elle ne démarre qu'une fois la page chargée (événement `load`), pour ne
 *    pas disputer la bande passante à l'affiche, aux polices et aux scripts.
 *  - Bouton Pause / Lecture visible tant que la vidéo existe : un contenu
 *    animé qui dure plus de cinq secondes doit pouvoir être arrêté (WCAG
 *    2.2.2).
 *  - Parallaxe verticale subtile, désactivée en reduced-motion.
 *  Prérequis fichier : ré-encoder le MP4 en « faststart » (moov au début) pour
 *  une lecture progressive — cf. scripts/optimize-hero-video.sh. */
export function HeroVideo({ src, srcWebm, poster, lang }: { src: string; srcWebm?: string; poster?: string; lang: Lang }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const [load, setLoad] = useState(false);
  const [enPause, setEnPause] = useState(false);

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end start"] });
  const yRaw = useTransform(scrollYProgress, [0, 1], ["0px", "64px"]);
  const y = useSpring(yRaw, { stiffness: 120, damping: 30, mass: 0.4 });

  // Faut-il charger la vidéo ? Sinon : affiche seule, zéro octet de vidéo.
  useEffect(() => {
    // Préférence encore inconnue (hydratation) : pas d'octet de vidéo avant
    // de savoir si la personne a demandé moins d'animations.
    if (reduce === null) return;
    if (reduce || !window.matchMedia(ECRAN_VIDEO).matches || reseauLent()) {
      setLoad(false);
      return;
    }
    if (document.readyState === "complete") {
      setLoad(true);
      return;
    }
    const demarrer = () => setLoad(true);
    window.addEventListener("load", demarrer, { once: true });
    return () => window.removeEventListener("load", demarrer);
  }, [reduce]);

  // Autoplay muet (React ne pose `muted` qu'en attribut). Un refus du
  // navigateur laisse la vidéo arrêtée : le bouton propose alors « Lire ».
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !load) return;
    v.muted = true;
    const p = v.play();
    if (p && typeof p.catch === "function") p.catch(() => setEnPause(true));
  }, [load]);

  const basculer = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play().then(() => setEnPause(false), () => setEnPause(true));
    } else {
      v.pause();
      setEnPause(true);
    }
  };

  const base: CSSProperties = { position: "absolute", left: 0, width: "100%", objectFit: "cover" };
  const videoStyle = reduce ? { ...base, inset: 0, height: "100%" } : { ...base, top: "-8%", height: "116%", y };
  const libelle = enPause ? LIBELLES.lecture[lang] : LIBELLES.pause[lang];

  return (
    <div ref={wrapRef} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0 }}>
        {/* Affiche : c'est le CANDIDAT LCP du site. `preload` (successeur de
            `priority`, déprécié en Next 16) insère le <link rel="preload"> dans
            le <head>, `fetchPriority` le fait passer devant les autres images.
            Variantes responsives servies directement par Unsplash, plafonnées
            à la largeur de la source (cf. `chargeurAffiche`). */}
        {poster && (
          <Image
            src={poster}
            loader={chargeurAffiche}
            alt=""
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        )}
        {load && (
          // Pas d'attribut `poster` : l'affiche est déjà peinte dessous, et une
          // seconde URL l'aurait fait télécharger deux fois.
          <m.video ref={videoRef} autoPlay muted loop playsInline style={videoStyle}>
            {srcWebm && <source src={srcWebm} type="video/webm" />}
            <source src={src} type="video/mp4" />
          </m.video>
        )}
        {/* lisibilité du texte (héros à dominante gauche) */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(11,15,26,0.94) 0%, rgba(11,15,26,0.80) 38%, rgba(11,15,26,0.46) 70%, rgba(11,15,26,0.62) 100%)" }} />
        {/* teinte de marque (duotone bleu) */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg,#0a1330,#0f62fe)", mixBlendMode: "color", opacity: 0.4 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,15,26,0.15), rgba(11,15,26,0.55))" }} />
      </div>
      {/* Pause / Lecture. Hors du calque `aria-hidden` (sinon invisible aux
          lecteurs d'écran), posé en HAUT à droite, dans le vide que laisse la
          composition : en bas, le bandeau d'avis de première visite le
          recouvrait. `z-[2]` le fait passer au-dessus de la grille du héros,
          qui le suit dans le DOM. Même verre fumé que « Voir le film ». */}
      {load && (
        <button
          type="button"
          onClick={basculer}
          aria-label={libelle}
          title={libelle}
          className="absolute top-5 right-[max(var(--pad-x),var(--sa-r))] z-[2] inline-flex size-11 items-center justify-center border border-[rgba(255,255,255,.28)] bg-[rgba(13,17,26,.55)] font-mono text-[12px] text-white backdrop-blur-[4px] transition-colors duration-200 hover:border-white"
        >
          <span aria-hidden>{enPause ? "▶" : "❚❚"}</span>
        </button>
      )}
    </div>
  );
}

"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Écran de crash AUTONOME
   (le layout racine est tombé) : un `<a>` provoque un rechargement pleine page
   vers l'accueil, qui réinitialise entièrement l'application. Un `<Link>` client
   rejouerait le rendu qui vient d'échouer, sans garantie de contexte routeur. */

/**
 * Dernier filet : une erreur levée dans le LAYOUT RACINE lui-même (ou dans un
 * segment au-dessus du layout de langue) ne peut pas être rattrapée par
 * `[lang]/error.tsx`. Sans ce fichier, elle tombait sur l'écran par défaut de
 * Next — « Application error: a client-side exception… », en anglais, sans style
 * ni sortie, sur le site institutionnel d'une unité congolaise.
 *
 * ⚠️ `global-error` REMPLACE le document entier : il doit donc rendre ses
 * propres `<html>` et `<body>`, et ne peut compter sur aucun layout, aucune
 * police, aucune feuille de style du site. Tout est donc en styles en ligne,
 * autonomes. On reste en français (langue par défaut du site) : cet écran est un
 * cas limite rare, et il ne dispose pas des paramètres de route pour connaître
 * la langue.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0f1a",
          color: "#fff",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: 560, textAlign: "center" }}>
          <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "#78a9ff", margin: 0 }}>
            UGPTN
          </p>
          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "18px 0 0" }}>
            Une erreur est survenue
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#c6c6c6", margin: "18px 0 0" }}>
            Le site a rencontré un problème inattendu. Vous pouvez réessayer, ou
            revenir à l&apos;accueil.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 32 }}>
            <button
              onClick={() => reset()}
              style={{ padding: "12px 22px", fontSize: 15, fontWeight: 600, color: "#fff", background: "#0f62fe", border: "none", cursor: "pointer" }}
            >
              Réessayer
            </button>
            <a
              href="/fr"
              style={{ padding: "12px 22px", fontSize: 15, fontWeight: 600, color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.28)", textDecoration: "none" }}
            >
              Accueil
            </a>
          </div>
          {error?.digest && (
            <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, color: "#8d8d8d", marginTop: 28 }}>
              Référence : {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}

/**
 * Règles du module « Vidéos & galeries » — vérifiées sur les modules réels.
 *
 * Rien ici ne touche au réseau ni à la base : ce sont les décisions qui
 * encadrent la lecture d'une source vidéo, l'affichage d'une durée et le
 * plafond d'un téléversement — celles dont une régression passerait inaperçue en
 * relecture parce qu'elle ne casse rien à la compilation.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TAILLE_MAX, TAILLE_MAX_VIDEO, estVideo, tailleMaxPour } from "@/lib/medias";
import { typeRessource } from "@/lib/cloudinary";
import {
  ACCEPT_GAL_MEDIA, MIMES_GAL_IMAGE, ratioVisuel, typeMediaDuFichier,
} from "@/lib/galerie/fichier";
import { dureeISO, dureeLisible, sourceVideo } from "@/lib/galerie/statut";

describe("plafond des vidéos", () => {
  it("s'applique aux types vidéo", () => {
    assert.equal(estVideo("video/mp4"), true);
    assert.equal(estVideo("image/jpeg"), false);
    assert.equal(tailleMaxPour("video/mp4"), TAILLE_MAX_VIDEO);
    assert.equal(tailleMaxPour("video/webm"), TAILLE_MAX_VIDEO);
  });

  it("reste sous la limite de corps des server actions", () => {
    // `bodySizeLimit` vaut 14 Mo dans next.config.mjs. Relever le plafond
    // applicatif au-dessus ferait échouer l'envoi avant nos contrôles, sur une
    // erreur de transport que personne ne sait lire.
    assert.ok(TAILLE_MAX_VIDEO < 14 * 1024 * 1024);
    assert.ok(TAILLE_MAX_VIDEO > TAILLE_MAX, "une vidéo pèse plus qu'une image");
  });
});

describe("type de ressource Cloudinary", () => {
  it("envoie les vidéos en « video », jamais en « raw »", () => {
    // En `raw`, le fichier se télécharge intégralement avant de commencer :
    // un film de quelques minutes devient inregardable sur une liaison
    // ordinaire. C'est aussi ce type qu'il faut redonner pour le supprimer.
    assert.equal(typeRessource("video/mp4"), "video");
    assert.equal(typeRessource("video/webm"), "video");
  });

  it("laisse images et documents où ils étaient", () => {
    assert.equal(typeRessource("image/png"), "image");
    assert.equal(typeRessource("application/pdf"), "raw");
  });
});

describe("visuels acceptés par la galerie", () => {
  it("n'accepte que des images", () => {
    for (const mime of MIMES_GAL_IMAGE) {
      assert.ok(mime.startsWith("image/"), mime);
    }
  });

  it("exclut le SVG, qui peut porter du script", () => {
    assert.ok(!(MIMES_GAL_IMAGE as readonly string[]).includes("image/svg+xml"));
  });
});

describe("source d'une vidéo", () => {
  it("ne connaît qu'une voie : le fichier téléversé", () => {
    // L'identifiant YouTube et l'adresse saisie à la main ont été retirés du
    // module : ils demandaient une saisie par vidéo, ce que le module refuse
    // par principe — l'information vit sur l'album.
    assert.equal(sourceVideo({ videoUrl: "https://res.cloudinary.com/x/video/upload/a.mp4" }), "FICHIER");
  });

  it("dit « aucune » quand rien n'est attaché", () => {
    assert.equal(sourceVideo({ videoUrl: null }), "AUCUNE");
    assert.equal(sourceVideo({ videoUrl: "   " }), "AUCUNE", "une chaîne blanche n'est pas une source");
    assert.equal(sourceVideo({}), "AUCUNE");
  });
});

describe("durée d'une vidéo", () => {
  it("n'affiche les heures que si elles existent", () => {
    // « 0:03:24 » donne à croire à un format d'horloge, pas à une durée.
    assert.equal(dureeLisible(204), "3:24");
    assert.equal(dureeLisible(3730), "1:02:10");
    assert.equal(dureeLisible(9), "0:09");
  });

  it("reste vide quand la durée n'a pas été relevée", () => {
    assert.equal(dureeLisible(null), "");
    assert.equal(dureeLisible(0), "");
  });

  it("écrit la forme ISO attendue par les données structurées", () => {
    // Les moteurs ne lisent pas « 3:24 » : sans cette forme, la vidéo perd son
    // éligibilité aux résultats vidéo.
    assert.equal(dureeISO(204), "PT3M24S");
    assert.equal(dureeISO(3600), "PT1H");
    assert.equal(dureeISO(null), null);
  });
});

describe("versement mixte d'un album", () => {
  it("reconnaît une photo et une vidéo à leur seul type MIME", () => {
    // C'est ce qui permet de sélectionner les deux d'un coup : la nature de
    // l'entrée se déduit du fichier, aucun choix préalable n'est demandé.
    assert.equal(typeMediaDuFichier("image/jpeg"), "PHOTO");
    assert.equal(typeMediaDuFichier("image/webp"), "PHOTO");
    assert.equal(typeMediaDuFichier("video/mp4"), "VIDEO");
    assert.equal(typeMediaDuFichier("video/webm"), "VIDEO");
  });

  it("refuse le reste, sans deviner", () => {
    // L'appelant en fait un échec NOMMÉ pour ce fichier, sans interrompre les
    // autres versements de la file.
    assert.equal(typeMediaDuFichier("application/pdf"), null);
    assert.equal(typeMediaDuFichier("image/svg+xml"), null, "le SVG peut porter du script");
    assert.equal(typeMediaDuFichier("video/quicktime"), null, "un .mov ne se lit pas partout");
  });

  it("accepte photos et vidéos dans la même sélection", () => {
    const accepte = ACCEPT_GAL_MEDIA.split(",");
    assert.ok(accepte.includes("image/jpeg"));
    assert.ok(accepte.includes("video/mp4"));
  });
});

describe("ratio d'un visuel", () => {
  it("donne son format natif à la cellule de la mosaïque", () => {
    assert.equal(ratioVisuel(1600, 1200), 1.33);
    assert.equal(ratioVisuel(1920, 1080), 1.78);
  });

  it("ne devine rien sans dimensions relevées", () => {
    // L'appelant retombe alors sur un format paysage, qui est le moindre mal.
    assert.equal(ratioVisuel(null, 1080), null);
    assert.equal(ratioVisuel(0, 0), null);
  });
});

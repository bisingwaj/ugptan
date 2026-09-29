/**
 * Ce que disent les notifications de la console : le total de la cloche, le
 * libellé de chaque module, et les modules qu'un compte ne voit pas.
 *
 * Un module à `null` n'est pas accessible au compte connecté : il ne doit
 * compter ni dans le total, ni allumer la cloche.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AUCUNE_NOTIFICATION,
  estCleNotification,
  estSuivi,
  lienNotification,
  resumeNotification,
  totalNotifications,
} from "@/lib/notifications-model";

describe("totalNotifications", () => {
  it("additionne les modules suivis", () => {
    assert.equal(totalNotifications({ mgp: 3, newsletter: 2 }), 5);
  });

  it("ignore les modules que le compte n'a pas", () => {
    assert.equal(totalNotifications({ mgp: null, newsletter: 4 }), 4);
    assert.equal(totalNotifications(AUCUNE_NOTIFICATION), 0);
  });
});

describe("estSuivi", () => {
  it("vaut vrai dès qu'un module est accessible, même à zéro", () => {
    assert.equal(estSuivi({ mgp: 0, newsletter: null }), true);
    assert.equal(estSuivi(AUCUNE_NOTIFICATION), false);
  });
});

describe("resumeNotification", () => {
  it("accorde au singulier et au pluriel", () => {
    assert.equal(resumeNotification("mgp", 1), "1 plainte non lue");
    assert.equal(resumeNotification("mgp", 3), "3 plaintes non lues");
    assert.equal(resumeNotification("newsletter", 1), "1 nouvelle inscription");
    assert.equal(resumeNotification("newsletter", 2), "2 nouvelles inscriptions");
  });

  it("dit l'absence en toutes lettres", () => {
    assert.equal(resumeNotification("mgp", 0), "Aucune plainte non lue");
    assert.equal(resumeNotification("newsletter", null), "Aucune nouvelle inscription");
  });
});

describe("lienNotification", () => {
  it("filtre les plaintes non lues quand il y en a", () => {
    assert.match(lienNotification("mgp", 2), /\/grievances\?f=non-lues$/);
    assert.match(lienNotification("mgp", 0), /\/grievances$/);
    assert.match(lienNotification("newsletter", 5), /\/newsletter$/);
  });
});

describe("estCleNotification", () => {
  it("ne reconnaît que les modules à bulle", () => {
    assert.equal(estCleNotification("newsletter"), true);
    assert.equal(estCleNotification("actualites"), false);
  });
});

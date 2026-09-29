/**
 * Texte de la bulle des plaintes non lues.
 *
 * La bulle se pose sur l'icône du rail replié, qui ne laisse que deux chiffres
 * de place : au-delà de 99, elle doit afficher « 99+ » et non déborder.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { UNREAD_CAP, unreadLabel } from "@/lib/mgp/model";

describe("unreadLabel", () => {
  it("affiche le compte tel quel jusqu'au plafond", () => {
    assert.equal(unreadLabel(1), "1");
    assert.equal(unreadLabel(42), "42");
    assert.equal(unreadLabel(UNREAD_CAP), "99");
  });

  it("plafonne au-delà de 99", () => {
    assert.equal(unreadLabel(UNREAD_CAP + 1), "99+");
    assert.equal(unreadLabel(1500), "99+");
  });

  it("ne descend jamais sous zéro", () => {
    assert.equal(unreadLabel(0), "0");
    assert.equal(unreadLabel(-3), "0");
  });
});

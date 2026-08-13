/**
 * Points d'entrée HTTP de Better Auth, montés sous /api/auth/*.
 *
 * Route obligatoire : c'est elle qui sert la vérification de session, la
 * déconnexion et les endpoints du plugin admin. Rien n'est écrit ici — le
 * routeur interne de Better Auth traite tout.
 *
 * Ce qui N'EST PAS exposé, et c'est intentionnel :
 *   · /api/auth/sign-up/email répond 400 (`disableSignUp`, cf. lib/auth/server.ts) ;
 *   · les endpoints du plugin admin exigent une session de rôle ADMIN.
 *
 * L'instance est résolue à la requête, pas à l'import : `auth()` lit
 * DATABASE_URL et BETTER_AUTH_SECRET, absentes pendant `next build`.
 */
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/server";

export const { GET, POST } = toNextJsHandler((request: Request) => auth().handler(request));

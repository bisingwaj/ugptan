/**
 * typescript-eslint refuse TypeScript 7 : toutes ses versions publiées plafonnent
 * à `<6.1.0` et lèvent au chargement (cf. typescript-eslint#10940). Le projet,
 * lui, tient à TypeScript 7 pour `pnpm typecheck`.
 *
 * On lui sert donc TypeScript 6 en parallèle — la voie recommandée par Microsoft.
 * Ni `overrides` ni `packageExtensions` n'y suffisent : typescript est un PEER de
 * ces paquets, donc résolu depuis la racine (TS 7) quoi qu'on ajoute. Il faut
 * retirer l'entrée peer pour que la dépendance imbriquée l'emporte.
 *
 * À supprimer dès que typescript-eslint supporte TypeScript 7.
 */
const TS_ESLINT = new Set([
  "typescript-eslint",
  "@typescript-eslint/parser",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/typescript-estree",
  "@typescript-eslint/utils",
  "@typescript-eslint/type-utils",
]);

function readPackage(pkg) {
  if (TS_ESLINT.has(pkg.name)) {
    if (pkg.peerDependencies) delete pkg.peerDependencies.typescript;
    if (pkg.peerDependenciesMeta) delete pkg.peerDependenciesMeta.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: "6.0.3" };
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };

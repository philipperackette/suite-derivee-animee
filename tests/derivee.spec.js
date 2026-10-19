/* global data */
import { test, expect } from "@playwright/test";
import { adresse, surveiller } from "./outils.js";

// Groupes réalisés par des permutations, loi (p∘q)(x) = p(q(x)).
const rond = (p, q) => q.map((x) => p[x]);
const inv = (p) => p.map((_, i) => p.indexOf(i));
const cle = (p) => p.join();
function engendre(gens, n) {
  const id = [...Array(n).keys()], vus = new Map([[cle(id), id]]), file = [id];
  while (file.length) {
    const a = file.pop();
    for (const g of gens) { const b = rond(g, a); if (!vus.has(cle(b))) { vus.set(cle(b), b); file.push(b); } }
  }
  return [...vus.values()];
}
const commutateur = (a, b) => rond(rond(rond(a, b), inv(a)), inv(b));
function suiteDerivee(G) {
  const n = G[0].length, suite = [G];
  for (;;) {
    const H = suite[suite.length - 1];
    const comms = new Map();
    for (const a of H) for (const b of H) { const c = commutateur(a, b); comms.set(cle(c), c); }
    const D = engendre([...comms.values()], n);
    if (D.length === H.length) return { ordres: suite.map((K) => K.length), resoluble: D.length === 1 };
    suite.push(D);
  }
}
const paire = (p) => engendre(p, p[0].length);
const quaternions = (() => {
  const T = { "1": { "1": "1", i: "i", j: "j", k: "k" }, i: { "1": "i", i: "-1", j: "k", k: "-j" },
    j: { "1": "j", i: "-k", j: "-1", k: "i" }, k: { "1": "k", i: "j", j: "-i", k: "-1" } };
  const el = ["1", "i", "j", "k", "-1", "-i", "-j", "-k"];
  const prod = (a, b) => {
    const r = T[a.replace("-", "")][b.replace("-", "")];
    return ((a.startsWith("-") !== b.startsWith("-")) !== r.startsWith("-") ? "-" : "") + r.replace("-", "");
  };
  return ["i", "j"].map((g) => el.map((x) => el.indexOf(prod(g, x))));
})();
const GROUPES = {
  S3: paire([[1, 0, 2], [1, 2, 0]]),
  S4: paire([[1, 0, 2, 3], [1, 2, 3, 0]]),
  S5: paire([[1, 0, 2, 3, 4], [1, 2, 3, 4, 0]]),
  A4: paire([[1, 2, 0, 3], [1, 0, 3, 2]]),
  A5: paire([[1, 2, 0, 3, 4], [0, 1, 3, 4, 2], [1, 0, 3, 2, 4]]),
  D4: paire([[1, 2, 3, 0], [0, 3, 2, 1]]),
  Q8: paire(quaternions),
  D5: paire([[1, 2, 3, 4, 0], [0, 4, 3, 2, 1]]),
};

test.beforeEach(async ({ page }) => {
  await page.goto(adresse("index.html"));
});

test("suites dérivées affichées = suites calculées", async ({ page }) => {
  const affiche = await page.evaluate(() => Object.fromEntries(Object.entries(data).map(([k, d]) => [k, {
    ordres: d.chain.filter((c) => !c.terminal).map((c) => c.ord), resoluble: d.solvable,
    abeliens: d.chain.map((c) => c.abel),
  }])));
  expect(Object.keys(affiche).sort()).toEqual(Object.keys(GROUPES).sort());
  for (const [k, G] of Object.entries(GROUPES)) {
    const calcul = suiteDerivee(G);
    expect(affiche[k].ordres, `${k} : ordres`).toEqual(calcul.ordres);
    expect(affiche[k].resoluble, `${k} : résoluble`).toBe(calcul.resoluble);
    // Seuls les derniers termes (abéliens) le sont.
    expect(affiche[k].abeliens.slice(0, -2).every((a) => !a), `${k} : abélien`).toBe(true);
  }
});

test("le commutateur des explications : [(1 2), (1 3)] = (1 2 3)", () => {
  const t12 = [1, 0, 2], t13 = [2, 1, 0];
  expect(commutateur(t12, t13)).toEqual([1, 2, 0]); // 1 ↦ 2 ↦ 3 ↦ 1
});

test("interface : déroulé pas à pas puis verdict", async ({ page }) => {
  const suivi = surveiller(page);
  await page.selectOption("#group", "S4");
  await expect(page.locator("#steps .card")).toHaveCount(1);
  await page.click("#next");
  await expect(page.locator("#steps .card")).toHaveCount(2);
  await page.click("#all");
  await expect(page.locator("#verdict .success")).toContainText("S₄ est résoluble");
  await expect(page.locator("#next")).toBeDisabled();
  await page.selectOption("#group", "A5");
  await page.click("#all");
  await expect(page.locator("#verdict .warn")).toContainText("n'est PAS résoluble");
  await page.click("#reset");
  await expect(page.locator("#steps .card")).toHaveCount(1);
  suivi.verifier();
});

[![CI](https://github.com/philipperackette/suite-derivee-animee/actions/workflows/ci.yml/badge.svg)](https://github.com/philipperackette/suite-derivee-animee/actions/workflows/ci.yml)

# Suite dérivée animée

Visualiser la résolubilité d'un groupe par itération du sous-groupe dérivé D(G).

**En ligne :** https://philipperackette.github.io/suite-derivee-animee/

## Vérifications automatiques

À chaque push et pull request, GitHub Actions lance ESLint et HTMLHint, puis des tests Playwright dans Chromium, sur écran d'ordinateur et de téléphone. Ils vérifient que chaque page s'ouvre sans erreur JavaScript ni défilement horizontal. Tests propres à ce site : les suites dérivées affichées, comparées au calcul exhaustif (S₃, S₄, S₅, A₄, A₅, D₄, Q₈, D₅).

Le site lui-même n'a aucune dépendance : `package.json` ne sert qu'à ces vérifications.

```bash
npm ci
npm run lint
npx playwright install chromium
npm test
```

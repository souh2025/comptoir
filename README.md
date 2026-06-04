# 🌿 frigogafsa-vitrine

Vitrine publique statique pour le magasin **فريقو قفصة** (engrais et médicaments agricoles).  
Hébergée sur **GitHub Pages** — 100% gratuit, aucun serveur.

---

## 📁 Structure des fichiers

```
frigogafsa-vitrine/
├── index.html               ← Page principale (liste des produits)
├── css/
│   └── style.css            ← Design vert agricole
├── js/
│   └── app.js               ← Filtrage + recherche + modal
├── images/
│   └── products/            ← Photos des produits (optionnel)
└── data/
    └── products.json        ← ⭐ FICHIER PRINCIPAL : liste des produits et prix
```

---

## 🚀 Déploiement sur GitHub Pages

1. Créez un dépôt public `souh2025/frigogafsa-vitrine`
2. Uploadez tous ces fichiers
3. Allez dans **Settings → Pages → Source → main branch → / (root)**
4. Votre vitrine sera disponible sur : `https://souh2025.github.io/frigogafsa-vitrine/`

---

## 🔄 Mise à jour des prix

Pour mettre à jour les prix depuis l'Admin Django :

1. Dans Django Admin, cliquez sur le bouton **"Exporter JSON"**
2. Téléchargez le fichier `products.json`
3. Sur GitHub, allez dans `data/products.json`
4. Cliquez sur l'icône ✏️ (modifier) et collez le nouveau contenu
5. Cliquez sur **"Commit changes"**

La page vitrine se met à jour **instantanément**.

---

## 📸 Ajouter des photos de produits

1. Placez vos photos dans `images/products/` (ex: `semadenp15.jpg`)
2. Dans `data/products.json`, mettez le chemin dans le champ `"image"` :
   ```json
   "image": "images/products/semadenp15.jpg"
   ```

---

## 📋 Format de products.json

```json
{
  "meta": {
    "boutique": "فريقو قفصة",
    "last_updated": "2025-01-15",
    "currency": "TND"
  },
  "categories": [
    { "id": "engrais", "nom": "أسمدة", "icone": "🌱" }
  ],
  "produits": [
    {
      "id": 1,
      "code_barres": "6191234560001",
      "nom": "سماد NPK 15-15-15",
      "categorie_id": "engrais",
      "description": "وصف المنتج...",
      "prix_vente": 45.500,
      "unite": "كيس 25 كغ",
      "disponible": true,
      "image": null
    }
  ]
}
```

**Valeurs possibles pour `disponible` :**
- `true` → متوفر (vert)
- `"low"` → كمية محدودة (orange)
- `false` → غير متوفر (rouge)
"# comptoir" 

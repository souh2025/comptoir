/**
 * FRIGOGAFSA VITRINE — app.js
 * Chargement des produits, filtrage par catégorie, recherche, modal détail
 */

(function () {
  "use strict";

  /* ─── CONFIG ──────────────────────────────────────── */
  const DATA_URL = "data/products.json";

  /* ─── STATE ───────────────────────────────────────── */
  let allProducts    = [];
  let allCategories  = [];
  let activeCategory = "all";
  let searchQuery    = "";

  /* ─── DOM REFS ────────────────────────────────────── */
  const grid          = document.getElementById("productsGrid");
  const searchInput   = document.getElementById("searchInput");
  const clearBtn      = document.getElementById("clearSearch");
  const filtersWrap   = document.getElementById("categoryFilters");
  const emptyState    = document.getElementById("emptyState");
  const statsBar      = document.getElementById("statsBar");
  const productCount  = document.getElementById("productCount");
  const lastUpdate    = document.getElementById("lastUpdate");
  const modalOverlay  = document.getElementById("modalOverlay");
  const modalBody     = document.getElementById("modalBody");
  const modalClose    = document.getElementById("modalClose");

  /* ─── EMOJI MAP ───────────────────────────────────── */
  const CAT_EMOJI = {
    engrais:   { emoji: "🌱", label: "أسمدة"          },
    pesticide: { emoji: "🐛", label: "مبيدات حشرات"   },
    fongicide: { emoji: "🍄", label: "مبيدات فطرية"   },
    herbicide: { emoji: "🌿", label: "مبيدات الأعشاب" },
    semences:  { emoji: "🌾", label: "بذور"           },
    materiel:  { emoji: "🔧", label: "معدات"          },
    default:   { emoji: "📦", label: "منتج"           },
  };

  function getCatInfo(catId) {
    return CAT_EMOJI[catId] || CAT_EMOJI.default;
  }

  /* ─── FORMAT PRICE ────────────────────────────────── */
  function formatPrice(val) {
    return parseFloat(val).toFixed(3);
  }

  /* ─── LOAD DATA ───────────────────────────────────── */
  async function loadData() {
    try {
      const res  = await fetch(DATA_URL + "?v=" + Date.now());
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();

      allCategories = data.categories || [];
      allProducts   = data.produits   || [];

      // Update last-update display
      if (data.meta && data.meta.last_updated) {
        const d = new Date(data.meta.last_updated);
        const opts = { year: "numeric", month: "long", day: "numeric" };
        lastUpdate.textContent = "✅ آخر تحديث للأسعار: " + d.toLocaleDateString("ar-TN", opts);
      } else {
        lastUpdate.textContent = "✅ الأسعار محدّثة";
      }

      buildFilters();
      render();
    } catch (err) {
      console.error("خطأ في تحميل البيانات:", err);
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#7a9b7e;">
          <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
          <p style="font-size:1rem;">تعذّر تحميل قائمة المنتجات. تحقق من ملف products.json.</p>
        </div>`;
      lastUpdate.textContent = "⚠️ خطأ في التحميل";
    }
  }

  /* ─── BUILD CATEGORY FILTERS ─────────────────────── */
  function buildFilters() {
    // Keep the "الكل" button, add one per category
    const existing = filtersWrap.querySelector("[data-cat='all']");
    filtersWrap.innerHTML = "";
    filtersWrap.appendChild(existing);

    allCategories.forEach(cat => {
      const usedInProducts = allProducts.some(p => p.categorie_id === cat.id);
      if (!usedInProducts) return;

      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.dataset.cat = cat.id;
      btn.textContent = (cat.icone || getCatInfo(cat.id).emoji) + " " + cat.nom;
      btn.addEventListener("click", () => setCategory(cat.id));
      filtersWrap.appendChild(btn);
    });

    // Re-bind "الكل"
    existing.addEventListener("click", () => setCategory("all"));
  }

  function setCategory(catId) {
    activeCategory = catId;
    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.cat === catId);
    });
    render();
  }

  /* ─── SEARCH ──────────────────────────────────────── */
  searchInput.addEventListener("input", () => {
    searchQuery = searchInput.value.trim();
    clearBtn.classList.toggle("visible", searchQuery.length > 0);
    render();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearBtn.classList.remove("visible");
    searchInput.focus();
    render();
  });

  /* ─── FILTER LOGIC ────────────────────────────────── */
  function getFiltered() {
    const q = searchQuery.toLowerCase();
    return allProducts.filter(p => {
      const matchCat  = activeCategory === "all" || p.categorie_id === activeCategory;
      const matchTerm = !q ||
        p.nom.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.code_barres  || "").includes(q);
      return matchCat && matchTerm;
    });
  }

  /* ─── RENDER ──────────────────────────────────────── */
  function render() {
    const filtered = getFiltered();

    // Stats
    const total = allProducts.length;
    productCount.textContent = filtered.length === total
      ? `${total} منتج متوفر`
      : `${filtered.length} نتيجة من أصل ${total} منتج`;

    if (filtered.length === 0) {
      grid.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    grid.innerHTML = filtered.map((p, idx) => buildCard(p, idx)).join("");

    // Bind click events
    grid.querySelectorAll(".product-card").forEach(card => {
      card.addEventListener("click", () => openModal(+card.dataset.id));
    });
  }

  /* ─── BUILD CARD HTML ────────────────────────────── */
  function buildCard(p, idx) {
    const catInfo = getCatInfo(p.categorie_id);
    const cat     = allCategories.find(c => c.id === p.categorie_id);
    const catName = cat ? cat.nom : catInfo.label;
    const catIcon = cat ? (cat.icone || catInfo.emoji) : catInfo.emoji;

    const imageHtml = p.image
      ? `<img src="${escHtml(p.image)}" alt="${escHtml(p.nom)}" loading="lazy" />`
      : `<div class="card-image-placeholder">
           <span class="emoji">${catIcon}</span>
           <span class="emoji-label">${escHtml(catName)}</span>
         </div>`;

    let stockHtml = "";
    if (p.disponible === false) {
      stockHtml = `<span class="card-stock stock-out">غير متوفر</span>`;
    } else if (p.disponible === "low") {
      stockHtml = `<span class="card-stock stock-low">كمية محدودة</span>`;
    } else {
      stockHtml = `<span class="card-stock stock-ok">متوفر</span>`;
    }

    return `
      <div class="product-card" data-id="${p.id}" style="animation-delay:${idx * 0.04}s">
        <div class="card-image">${imageHtml}</div>
        <div class="card-body">
          <div class="card-category">${catIcon} ${escHtml(catName)}</div>
          <div class="card-name">${escHtml(p.nom)}</div>
          <div class="card-unit">${escHtml(p.unite || "")}</div>
          <div class="card-footer">
            <div class="card-price">${formatPrice(p.prix_vente)}<span class="currency"> د.ت</span></div>
            ${stockHtml}
          </div>
        </div>
      </div>`;
  }

  /* ─── MODAL ───────────────────────────────────────── */
  function openModal(id) {
    const p = allProducts.find(pr => pr.id === id);
    if (!p) return;

    const catInfo = getCatInfo(p.categorie_id);
    const cat     = allCategories.find(c => c.id === p.categorie_id);
    const catName = cat ? cat.nom : catInfo.label;
    const catIcon = cat ? (cat.icone || catInfo.emoji) : catInfo.emoji;

    const imageHtml = p.image
      ? `<img src="${escHtml(p.image)}" alt="${escHtml(p.nom)}" style="width:100%;height:220px;object-fit:cover;" />`
      : `<div class="modal-image" style="height:220px;display:flex;align-items:center;justify-content:center;font-size:5rem;background:linear-gradient(135deg,#f3faf4,#e8f5ea);">${catIcon}</div>`;

    let stockLabel, stockColor;
    if (p.disponible === false) {
      stockLabel = "غير متوفر حالياً";
      stockColor = "#b71c1c";
    } else if (p.disponible === "low") {
      stockLabel = "كمية محدودة — اتصل للتأكيد";
      stockColor = "#e65100";
    } else {
      stockLabel = "متوفر في المخزن";
      stockColor = "#236b2b";
    }

    modalBody.innerHTML = `
      ${imageHtml}
      <div class="modal-content">
        <div class="modal-cat">${catIcon} ${escHtml(catName)}</div>
        <h2 class="modal-name">${escHtml(p.nom)}</h2>
        <p class="modal-description">${escHtml(p.description || "")}</p>
        <div class="modal-price-row">
          <span class="modal-price-label">السعر بالوحدة</span>
          <span class="modal-price-value">${formatPrice(p.prix_vente)}<span class="currency"> د.ت</span></span>
        </div>
        <div class="modal-details">
          <div class="detail-item">
            <div class="detail-label">الوحدة</div>
            <div class="detail-value">${escHtml(p.unite || "—")}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">التوفر</div>
            <div class="detail-value" style="color:${stockColor}">${stockLabel}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">رمز المنتج</div>
            <div class="detail-value" style="direction:ltr;font-size:.8rem">${escHtml(p.code_barres || "—")}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">التصنيف</div>
            <div class="detail-value">${escHtml(catName)}</div>
          </div>
        </div>
      </div>`;

    modalOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalOverlay.classList.add("hidden");
    document.body.style.overflow = "";
  }

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  /* ─── UTIL ────────────────────────────────────────── */
  function escHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }

  /* ─── INIT ────────────────────────────────────────── */
  loadData();

})();

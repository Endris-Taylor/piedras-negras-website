/**
 * Piedras Negras De Noche — Menu Loader
 * Reads menu data from data/menu.json and renders it dynamically.
 * To update the menu, simply edit menu.json — no code changes needed.
 */

(function () {
  'use strict';

  const DATA_URL = 'data/menu.json';

  // DOM references
  const menuContainer = document.getElementById('menu-container');
  const menuNav = document.getElementById('menu-nav');
  const searchInput = document.getElementById('menu-search');

  let menuData = null;

  // ---------- Fetch & Render ----------
  async function loadMenu() {
    try {
      menuContainer.innerHTML = '<div class="loading">Loading menu…</div>';
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      menuData = json.categories;
      renderNav(menuData);
      renderMenu(menuData);
    } catch (err) {
      menuContainer.innerHTML =
        `<div class="no-results"><div class="icon">⚠️</div>Could not load the menu.<br><small>${err.message}</small></div>`;
      console.error('Menu load error:', err);
    }
  }

  // ---------- Navigation Pills ----------
  function renderNav(categories) {
    if (!menuNav) return;
    menuNav.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.textContent = 'All';
    allBtn.classList.add('active');
    allBtn.addEventListener('click', () => {
      filterCategory('all');
      setActiveNav(allBtn);
    });
    menuNav.appendChild(allBtn);

    categories.forEach((cat, i) => {
      const btn = document.createElement('button');
      btn.textContent = cat.name;
      btn.addEventListener('click', () => {
        filterCategory(i);
        setActiveNav(btn);
      });
      menuNav.appendChild(btn);
    });
  }

  function setActiveNav(activeBtn) {
    menuNav.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
  }

  // ---------- Render Menu Items ----------
  function renderMenu(categories) {
    menuContainer.innerHTML = '';
    categories.forEach((cat, idx) => {
      const section = document.createElement('div');
      section.classList.add('menu-category');
      section.dataset.catIndex = idx;

      let html = `
        <div class="menu-category-header">
          <span class="cat-icon">${cat.icon || '🍽️'}</span>
          <h2>${cat.name}</h2>
        </div>`;

      if (cat.description) {
        html += `<p class="menu-category-desc">${cat.description}</p>`;
      }

      html += '<div class="menu-items">';
      cat.items.forEach(item => {
        const priceDisplay = item.priceLabel
          ? item.priceLabel
          : item.price !== null && item.price !== undefined
            ? `$${item.price.toFixed(2)}`
            : '';
        html += `
          <div class="menu-item">
            <div class="menu-item-info">
              <div class="menu-item-name">${item.name}</div>
              ${item.description ? `<div class="menu-item-desc">${item.description}</div>` : ''}
            </div>
            <div class="menu-item-price">${priceDisplay}</div>
          </div>`;
      });
      html += '</div>';

      section.innerHTML = html;
      menuContainer.appendChild(section);
    });
  }

  // ---------- Filter by Category ----------
  function filterCategory(indexOrAll) {
    if (searchInput) searchInput.value = '';
    const sections = menuContainer.querySelectorAll('.menu-category');
    sections.forEach(sec => {
      if (indexOrAll === 'all' || sec.dataset.catIndex == indexOrAll) {
        sec.style.display = '';
        // show all items in this category
        sec.querySelectorAll('.menu-item').forEach(mi => mi.style.display = '');
      } else {
        sec.style.display = 'none';
      }
    });

    if (indexOrAll !== 'all') {
      const target = menuContainer.querySelector(`[data-cat-index="${indexOrAll}"]`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ---------- Search ----------
  function handleSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
      filterCategory('all');
      setActiveNav(menuNav.querySelector('button'));
      return;
    }

    // Reset nav active
    menuNav.querySelectorAll('button').forEach(b => b.classList.remove('active'));

    const sections = menuContainer.querySelectorAll('.menu-category');
    let anyVisible = false;
    sections.forEach(sec => {
      const items = sec.querySelectorAll('.menu-item');
      let catHasMatch = false;
      items.forEach(mi => {
        const name = mi.querySelector('.menu-item-name').textContent.toLowerCase();
        const desc = mi.querySelector('.menu-item-desc')?.textContent.toLowerCase() || '';
        if (name.includes(q) || desc.includes(q)) {
          mi.style.display = '';
          catHasMatch = true;
        } else {
          mi.style.display = 'none';
        }
      });
      sec.style.display = catHasMatch ? '' : 'none';
      if (catHasMatch) anyVisible = true;
    });

    // Show "no results" if nothing matches
    let noRes = menuContainer.querySelector('.no-results');
    if (!anyVisible) {
      if (!noRes) {
        noRes = document.createElement('div');
        noRes.classList.add('no-results');
        noRes.innerHTML = '<div class="icon">🔍</div>No items found. Try a different search.';
        menuContainer.appendChild(noRes);
      }
      noRes.style.display = '';
    } else if (noRes) {
      noRes.style.display = 'none';
    }
  }

  // ---------- Event Listeners ----------
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => handleSearch(searchInput.value), 200);
    });
  }

  // ---------- Init ----------
  if (menuContainer) loadMenu();
})();

/**
 * Geoportal Municipal de Craíbas - AL | Módulo Principal de Aplicação
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializa o Mapa WebGIS em primeiro lugar com o container ativo
  initMap();

  // 2. Inicializa a Central de Downloads e Catálogo
  initDownloads();

  // 3. Configura a navegação entre Abas
  setupTabNavigation();

  // 4. Configura modal de informações institucionais
  setupInfoModal();
});

// Alternância entre as Abas Principais
function setupTabNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  // Atualiza estado visual dos botões
  document.querySelectorAll('.nav-tab-btn').forEach(b => {
    if (b.dataset.tab === tabId) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });

  // Atualiza visibilidade dos painéis
  document.querySelectorAll('.tab-panel').forEach(p => {
    if (p.id === tabId) {
      p.classList.add('active');
    } else {
      p.classList.remove('active');
    }
  });

  // Quando ativa o Mapa WebGIS, recalcula dimensões e re-enquadra
  if (tabId === 'map-tab' && map) {
    requestAnimationFrame(() => {
      map.invalidateSize();
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    });
  }
}

// Controle da Sidebar no Mobile
function toggleMobileSidebar() {
  const sidebar = document.getElementById('gis-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

// Modal de Informações Institucionais do Município
function setupInfoModal() {
  const infoBtn = document.getElementById('btn-info-geoportal');
  const modal = document.getElementById('info-modal');
  const closeBtn = document.getElementById('btn-close-info-modal');

  if (infoBtn && modal) {
    infoBtn.addEventListener('click', () => {
      modal.classList.remove('hidden');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }
}

function closeInfoModal() {
  const modal = document.getElementById('info-modal');
  if (modal) modal.classList.add('hidden');
}

// Toast de Notificação
function showToast(message, type = 'info') {
  const existing = document.getElementById('geoportal-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'geoportal-toast';
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-slate-900';
  toast.className = `fixed bottom-6 right-6 ${bg} text-white px-4 py-2.5 rounded-lg shadow-2xl text-xs font-semibold flex items-center gap-2 z-[3000] transition-opacity duration-300`;
  toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

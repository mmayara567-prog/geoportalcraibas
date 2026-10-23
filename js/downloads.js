/**
 * Geoportal Municipal de Craíbas - AL | Módulo da Central de Downloads & Catálogo de Dados
 */

let currentFilter = 'all'; // 'all' | 'laws' | 'maps' | 'layers'
let currentSearch = '';

// Inicialização do módulo de downloads
function initDownloads() {
  renderLawsSection();
  renderMapsSection();
  renderLayersDownloadSection();
  setupDownloadFilters();
}

// 1. Renderiza Legislação e Decretos Ambientais (PDF)
function renderLawsSection() {
  const container = document.getElementById('laws-list-container');
  if (!container) return;

  container.innerHTML = '';

  const filtered = ENVIRONMENTAL_LAWS.filter(item => {
    const q = currentSearch.toLowerCase();
    const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.year.includes(q);
    const matchesCat = currentFilter === 'all' || currentFilter === 'laws';
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full py-8 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">Nenhum documento legal encontrado para os filtros selecionados.</div>`;
    return;
  }

  filtered.forEach(law => {
    const card = document.createElement('div');
    card.className = 'resource-card bg-white rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-200 border border-slate-200';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-3">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <i class="fa-solid fa-file-pdf"></i> ${law.type}
          </span>
          <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Ano ${law.year}
          </span>
        </div>
        <h4 class="text-base font-bold text-slate-900 mb-2 leading-snug hover:text-blue-700 transition-colors">
          ${law.title}
        </h4>
        <p class="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
          ${law.description}
        </p>
      </div>

      <div class="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <span class="text-xs text-slate-500 font-medium">
          <i class="fa-solid fa-hard-drive mr-1 text-slate-400"></i>${law.size}
        </span>
        <div class="flex items-center gap-2">
          <a href="${encodeURI(law.file)}" target="_blank" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5" title="Visualizar documento em nova aba">
            <i class="fa-solid fa-eye"></i> Visualizar
          </a>
          <a href="${encodeURI(law.file)}" download class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5" title="Baixar arquivo original em PDF">
            <i class="fa-solid fa-download"></i> Baixar PDF
          </a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 2. Renderiza Mapas Temáticos em Alta Resolução (PNG)
function renderMapsSection() {
  const container = document.getElementById('maps-list-container');
  if (!container) return;

  container.innerHTML = '';

  const filtered = HIGH_RES_MAPS.filter(item => {
    const q = currentSearch.toLowerCase();
    const matchesSearch = !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    const matchesCat = currentFilter === 'all' || currentFilter === 'maps';
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="col-span-full py-8 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">Nenhum mapa temático encontrado para os filtros selecionados.</div>`;
    return;
  }

  filtered.forEach(mapItem => {
    const card = document.createElement('div');
    card.className = 'resource-card bg-white rounded-xl overflow-hidden flex flex-col justify-between border border-slate-200 hover:shadow-lg transition-all duration-200';
    card.innerHTML = `
      <div>
        <div class="relative h-44 bg-slate-100 overflow-hidden group cursor-pointer" onclick="openMapLightbox('${mapItem.id}')">
          <img src="${encodeURI(mapItem.file)}" alt="${mapItem.title}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" loading="lazy">
          <div class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span class="px-3 py-1.5 bg-white/90 backdrop-blur text-slate-800 text-xs font-bold rounded-lg shadow">
              <i class="fa-solid fa-magnifying-glass-plus mr-1"></i> Ampliar Mapa
            </span>
          </div>
          <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/75 backdrop-blur text-white text-[11px] font-semibold">
            ${mapItem.category}
          </span>
          <span class="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-white text-[11px] font-mono">
            ${mapItem.size}
          </span>
        </div>

        <div class="p-4">
          <h4 class="text-sm font-bold text-slate-900 mb-1.5 leading-snug line-clamp-1 hover:text-blue-700 cursor-pointer" onclick="openMapLightbox('${mapItem.id}')">
            ${mapItem.title}
          </h4>
          <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            ${mapItem.description}
          </p>
        </div>
      </div>

      <div class="px-4 pb-4 pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
        <button onclick="openMapLightbox('${mapItem.id}')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5">
          <i class="fa-solid fa-expand"></i> Ver Zoom
        </button>
        <a href="${encodeURI(mapItem.file)}" download class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5">
          <i class="fa-solid fa-download"></i> Baixar PNG
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

// 3. Renderiza Camadas Georreferenciadas & Metadados (GeoJSON, GeoTIFF, QMD)
function renderLayersDownloadSection() {
  const container = document.getElementById('layers-download-container');
  if (!container) return;

  container.innerHTML = '';

  // Inclui também a Hipsometria GeoTIFF
  const allLayers = [
    ...LAYERS_CONFIG,
    {
      id: "hipso_tif",
      name: "Modelo Digital de Elevação / Hipsometria (GeoTIFF)",
      typology: "mineracao_solos",
      geomType: "Raster GeoTIFF",
      fileDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA DE HIPSOMETRIA.tif",
      qmdDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA DE HIPSOMETRIA.tif.aux.xml",
      featureCount: "Raster 30m"
    }
  ];

  const filtered = allLayers.filter(item => {
    const q = currentSearch.toLowerCase();
    const typObj = MAP_TYPOLOGIES.find(t => t.id === item.typology) || {};
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || typObj.title.toLowerCase().includes(q);
    const matchesCat = currentFilter === 'all' || currentFilter === 'layers';
    return matchesSearch && matchesCat;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div class="py-8 text-center text-slate-400 italic bg-white rounded-xl border border-dashed border-slate-200">Nenhuma camada espacial encontrada para os filtros selecionados.</div>`;
    return;
  }

  let tableRows = '';
  filtered.forEach(layer => {
    const typObj = MAP_TYPOLOGIES.find(t => t.id === layer.typology) || { title: 'Geral', color: '#1e3a8a', icon: 'fa-layer-group' };
    const isRaster = layer.geomType.includes("Raster");
    const formatBadge = isRaster
      ? `<span class="px-2 py-0.5 bg-purple-100 text-purple-700 font-semibold text-[11px] rounded">GeoTIFF</span>`
      : `<span class="px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold text-[11px] rounded">GeoJSON</span>`;

    const viewInMapBtn = !isRaster
      ? `<button onclick="switchToMapAndFocus('${layer.id}')" class="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1" title="Ver no Mapa Interativo">
          <i class="fa-solid fa-map-location-dot"></i> Ver no Mapa
        </button>`
      : '';

    tableRows += `
      <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 text-xs">
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs" style="background-color: ${typObj.color}">
              <i class="fa-solid ${typObj.icon}"></i>
            </span>
            <div>
              <span class="font-bold text-slate-900 block">${layer.name}</span>
              <span class="text-[11px] text-slate-500">${typObj.title}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4">${formatBadge}</td>
        <td class="py-3 px-4 font-mono text-slate-600">${layer.featureCount} ${isRaster ? '' : 'feições'}</td>
        <td class="py-3 px-4 text-slate-500">SIRGAS 2000 / WGS84</td>
        <td class="py-3 px-4">
          <div class="flex items-center gap-2 justify-end">
            ${viewInMapBtn}
            <a href="${encodeURI(layer.fileDownload)}" download class="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1" title="Baixar camada geoespacial">
              <i class="fa-solid fa-file-arrow-down"></i> Baixar Camada
            </a>
            ${layer.qmdDownload ? `
              <a href="${encodeURI(layer.qmdDownload)}" download class="px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1" title="Baixar Metadados do QGIS">
                <i class="fa-solid fa-circle-info"></i> QMD
              </a>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  container.innerHTML = `
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th class="py-3 px-4">Camada Espacial & Tipologia</th>
              <th class="py-3 px-4">Formato</th>
              <th class="py-3 px-4">Registros</th>
              <th class="py-3 px-4">Sistema de Coordenadas</th>
              <th class="py-3 px-4 text-right">Downloads & Ações</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

// Filtros da barra de pesquisa e categorias
function setupDownloadFilters() {
  const searchInput = document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      refreshAllDownloads();
    });
  }

  document.querySelectorAll('.filter-tab-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active de todos, adiciona apenas no clicado
      document.querySelectorAll('.filter-tab-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentFilter = btn.dataset.filter;
      refreshAllDownloads();
    });
  });
}

function refreshAllDownloads() {
  renderLawsSection();
  renderMapsSection();
  renderLayersDownloadSection();
}

// Alternar para o Mapa e dar foco na camada escolhida
function switchToMapAndFocus(layerId) {
  // Troca de aba para o Mapa Interativo
  switchTab('map-tab');

  setTimeout(() => {
    zoomToLayer(layerId);
  }, 200);
}

// Lightbox Modal para Visualização em Alta Resolução dos Mapas PNG
let currentMapZoom = 1;

function openMapLightbox(mapId) {
  const mapItem = HIGH_RES_MAPS.find(m => m.id === mapId);
  if (!mapItem) return;

  const modal = document.getElementById('map-lightbox-modal');
  const titleEl = document.getElementById('lightbox-map-title');
  const catEl = document.getElementById('lightbox-map-cat');
  const sizeEl = document.getElementById('lightbox-map-size');
  const imgEl = document.getElementById('lightbox-map-img');
  const downloadLink = document.getElementById('lightbox-download-link');

  if (titleEl) titleEl.textContent = mapItem.title;
  if (catEl) catEl.textContent = mapItem.category;
  if (sizeEl) sizeEl.textContent = `Tamanho: ${mapItem.size}`;
  if (imgEl) {
    imgEl.src = encodeURI(mapItem.file);
    imgEl.style.transform = 'scale(1)';
    currentMapZoom = 1;
  }
  if (downloadLink) {
    downloadLink.href = encodeURI(mapItem.file);
    downloadLink.download = mapItem.title + '.png';
  }

  modal.classList.remove('hidden');
}

function closeMapLightbox() {
  const modal = document.getElementById('map-lightbox-modal');
  if (modal) modal.classList.add('hidden');
}

function zoomLightbox(factor) {
  const imgEl = document.getElementById('lightbox-map-img');
  if (!imgEl) return;

  currentMapZoom *= factor;
  if (currentMapZoom < 0.5) currentMapZoom = 0.5;
  if (currentMapZoom > 4) currentMapZoom = 4;

  imgEl.style.transform = `scale(${currentMapZoom})`;
}

function resetLightboxZoom() {
  const imgEl = document.getElementById('lightbox-map-img');
  if (!imgEl) return;
  currentMapZoom = 1;
  imgEl.style.transform = 'scale(1)';
}

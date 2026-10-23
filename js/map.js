/**
 * Geoportal Municipal de Craíbas - AL | Módulo de Mapa WebGIS
 */

let map = null;
let currentBasemap = null;
const mapLayers = {}; // ID -> L.geoJSON
const layerOpacities = {}; // ID -> float
let selectedLayerForTable = null;
let measureMode = null; // 'distance' | 'area' | null
let measurePoints = [];
let measureLayer = null;
let activeTypologyFilter = 'all';

// Extensão geográfica de Craíbas - AL
const CRAIBAS_BOUNDS = [
  [-9.7295743, -36.9047975], // Sudoeste
  [-9.5502193, -36.6802401]  // Nordeste
];
const CRAIBAS_CENTER = [-9.6398968, -36.7925188];

// Provedores de Basemaps (Apenas opções funcionais: Satélite e Relevo)
const BASEMAP_TILES = {
  satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19
  }),
  topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17
  })
};

// Inicialização do Mapa
function initMap() {
  if (map) return;

  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  map = L.map('map', {
    center: CRAIBAS_CENTER,
    zoom: 12,
    zoomControl: false,
    minZoom: 9,
    maxZoom: 18
  });

  // Basemap padrão: Imagem de Satélite de Alta Resolução Esri
  currentBasemap = BASEMAP_TILES.satellite;
  currentBasemap.addTo(map);

  // Ajusta visão inicial com margens confortáveis
  map.fitBounds(CRAIBAS_BOUNDS, { padding: [25, 25] });

  // Controle de Zoom
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Escala gráfica
  L.control.scale({ imperial: false, metric: true, position: 'bottomright' }).addTo(map);

  // Camada de medições
  measureLayer = L.featureGroup().addTo(map);

  // Coordenadas em tempo real
  map.on('mousemove', function(e) {
    const coordsEl = document.getElementById('mouse-coordinates');
    if (coordsEl) {
      coordsEl.innerHTML = `Lat: ${e.latlng.lat.toFixed(5)}° | Lng: ${e.latlng.lng.toFixed(5)}° | Zoom: ${map.getZoom()}`;
    }
  });

  // Evento de clique para medição
  map.on('click', handleMapClick);

  // Redimensionamento responsivo
  window.addEventListener('resize', () => {
    if (map) map.invalidateSize();
  });

  // Renderiza a árvore de camadas na barra lateral
  renderLayerTree();

  // Carrega as camadas georreferenciadas
  loadGeoLayers();

  // Atualiza legenda
  updateDynamicLegend();
}

// Alternar Basemap
function switchBasemap(key) {
  if (currentBasemap && map.hasLayer(currentBasemap)) {
    map.removeLayer(currentBasemap);
  }
  if (BASEMAP_TILES[key]) {
    currentBasemap = BASEMAP_TILES[key];
    currentBasemap.addTo(map);
  }

  document.querySelectorAll('.basemap-option').forEach(el => {
    if (el.dataset.basemap === key) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

// Carregamento de camadas GeoJSON a partir de window.GEODATA
function loadGeoLayers() {
  if (!window.GEODATA) {
    console.warn("window.GEODATA não carregado.");
    return;
  }

  LAYERS_CONFIG.forEach(cfg => {
    const rawData = window.GEODATA[cfg.id];
    if (!rawData) return;

    try {
      const geojsonData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

      const geoLayer = L.geoJSON(geojsonData, {
        pointToLayer: function(feature, latlng) {
          if (cfg.geomType === "Point") {
            const isSaude = cfg.id === "saude";
            const iconHtml = `<div class="flex items-center justify-center w-7 h-7 rounded-full shadow-lg ${isSaude ? 'bg-red-600 text-white' : 'bg-blue-700 text-white'} border-2 border-white hover:scale-110 transition-transform">
              <i class="fa-solid ${isSaude ? 'fa-hospital' : 'fa-landmark'} text-xs"></i>
            </div>`;

            const customIcon = L.divIcon({
              className: 'custom-div-icon',
              html: iconHtml,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14]
            });

            return L.marker(latlng, { icon: customIcon });
          }
          return L.circleMarker(latlng, cfg.style || {});
        },
        style: function(feature) {
          if (cfg.getStyle) {
            return cfg.getStyle(feature);
          }
          return cfg.style || { color: '#2563eb', weight: 2 };
        },
        onEachFeature: function(feature, layer) {
          layer.on({
            mouseover: function(e) {
              const target = e.target;
              if (cfg.geomType !== "Point") {
                target.setStyle({
                  weight: (cfg.style?.weight || 2) + 1.5,
                  opacity: 1,
                  fillOpacity: (cfg.style?.fillOpacity || 0.5) + 0.2
                });
              }
            },
            mouseout: function(e) {
              if (cfg.geomType !== "Point") {
                geoLayer.resetStyle(e.target);
                if (layerOpacities[cfg.id] !== undefined) {
                  applyLayerOpacity(cfg.id, layerOpacities[cfg.id]);
                }
              }
            },
            click: function(e) {
              L.DomEvent.stopPropagation(e);
            }
          });

          const popupContent = buildPopupContent(feature, cfg);
          layer.bindPopup(popupContent, { maxWidth: 360 });
        }
      });

      mapLayers[cfg.id] = geoLayer;
      layerOpacities[cfg.id] = 1.0;

      // Camadas ativas por padrão
      if (cfg.visibleDefault) {
        geoLayer.addTo(map);
      }
    } catch (err) {
      console.error(`Erro ao carregar camada ${cfg.name}:`, err);
    }
  });

  updateActiveLayerCount();
}

// Criação do conteúdo dos Popups
function buildPopupContent(feature, cfg) {
  const props = feature.properties || {};
  let title = cfg.name;
  if (props.Name) title = props.Name;
  else if (props.NM_LOG) title = `${props.NM_TIP_LOG || ''} ${props.NM_LOG}`;
  else if (props.ZONA) title = props.ZONA;
  else if (props.SUBS) title = `Minério: ${props.SUBS}`;
  else if (props.NOME_BACIA) title = `Bacia: ${props.NOME_BACIA}`;
  else if (props.NOORIGINAL) title = `Rio: ${props.NOORIGINAL}`;
  else if (props.nom_unidad) title = `Solo: ${props.nom_unidad}`;
  else if (props.Nome_via) title = `Via: ${props.Nome_via}`;

  const typologyObj = MAP_TYPOLOGIES.find(t => t.id === cfg.typology) || {};

  let rowsHtml = '';
  cfg.fields.forEach(f => {
    let val = props[f.key];
    if (val !== undefined && val !== null && val !== '') {
      if (f.format) val = f.format(val);
      rowsHtml += `
        <div class="popup-row">
          <span class="popup-label">${f.label}:</span>
          <span class="popup-val">${val}</span>
        </div>
      `;
    }
  });

  return `
    <div class="popup-container">
      <div class="popup-header">
        <div class="flex items-center gap-2 mb-1">
          <span class="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-white/20 text-white">
            <i class="fa-solid ${typologyObj.icon || 'fa-layer-group'} mr-1"></i>${typologyObj.title || 'Informação'}
          </span>
        </div>
        <h4 class="text-sm font-bold leading-tight">${title}</h4>
      </div>
      <div class="popup-body">
        ${rowsHtml || '<p class="text-xs text-gray-500 italic">Sem atributos cadastrados.</p>'}
      </div>
    </div>
  `;
}

// Renderização da Árvore de Camadas por Tipologia
function renderLayerTree() {
  const container = document.getElementById('layers-tree-container');
  if (!container) return;

  container.innerHTML = '';

  MAP_TYPOLOGIES.forEach(typ => {
    if (activeTypologyFilter !== 'all' && activeTypologyFilter !== typ.id) return;

    const layersInTypology = LAYERS_CONFIG.filter(l => l.typology === typ.id);
    if (layersInTypology.length === 0) return;

    const typSection = document.createElement('div');
    typSection.className = 'typology-section';
    typSection.dataset.typology = typ.id;

    const header = document.createElement('div');
    header.className = 'typology-header';
    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;background:${typ.color};flex-shrink:0;">
          <i class="fa-solid ${typ.icon}" style="color:#fff;font-size:0.7rem"></i>
        </div>
        <div>
          <div style="font-size:0.75rem;font-weight:700;color:#1f2937">${typ.title}</div>
          <div style="font-size:0.65rem;color:#9ca3af">${layersInTypology.length} camada(s)</div>
        </div>
      </div>
      <i class="fa-solid fa-chevron-down typ-arrow" style="font-size:0.65rem;color:#9ca3af;transition:transform .2s"></i>
    `;

    const body = document.createElement('div');
    body.className = 'typology-body hidden';
    body.style.cssText = 'padding:6px 10px 10px;display:none';

    layersInTypology.forEach(l => {
      const card = document.createElement('div');
      card.className = 'layer-card';
      card.id = `layer-card-${l.id}`;

      let swatch = `<span style="width:13px;height:13px;border-radius:50%;border:1px solid #d1d5db;background:${l.style?.color || l.pointColor || '#16a34a'};display:inline-block;flex-shrink:0"></span>`;
      if (l.geomType === 'Point') {
        swatch = `<i class="fa-solid ${l.pointIcon || 'fa-location-dot'}" style="color:${l.pointColor || '#dc2626'};font-size:0.8rem;flex-shrink:0"></i>`;
      } else if (l.geomType === 'LineString') {
        swatch = `<span style="width:18px;height:3px;border-radius:2px;background:${l.style?.color || '#dc2626'};display:inline-block;flex-shrink:0"></span>`;
      }

      card.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px">
          <label style="display:flex;align-items:center;gap:7px;cursor:pointer;flex:1;min-width:0">
            <input type="checkbox" id="chk-${l.id}" ${l.visibleDefault ? 'checked' : ''}
              style="width:14px;height:14px;accent-color:#16a34a;cursor:pointer;flex-shrink:0"
              onchange="toggleLayer('${l.id}')">
            <div style="display:flex;align-items:center;gap:6px;flex:1;min-width:0">
              ${swatch}
              <span style="font-size:0.73rem;font-weight:600;color:#374151;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${l.name}">${l.name}</span>
            </div>
          </label>
          <span style="font-size:0.65rem;font-weight:600;color:#6b7280;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:99px;padding:1px 7px;flex-shrink:0">${l.featureCount}</span>
        </div>
        <div style="margin-top:7px;padding-top:6px;border-top:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between;gap:8px">
          <div style="display:flex;align-items:center;gap:6px;flex:1">
            <i class="fa-solid fa-circle-half-stroke" style="font-size:0.6rem;color:#9ca3af"></i>
            <input type="range" min="0" max="100" value="100" class="opacity-slider"
              oninput="changeLayerOpacity('${l.id}', this.value)">
          </div>
          <div style="display:flex;align-items:center;gap:2px">
            <button onclick="zoomToLayer('${l.id}')"
              style="padding:4px 6px;border:none;background:transparent;cursor:pointer;color:#9ca3af;border-radius:5px;font-size:0.7rem;transition:color .12s"
              onmouseover="this.style.color='#16a34a';this.style.background='#f0fdf4'"
              onmouseout="this.style.color='#9ca3af';this.style.background='transparent'"
              title="Zoom para a camada">
              <i class="fa-solid fa-expand"></i>
            </button>
            <button onclick="openAttributeTable('${l.id}')"
              style="padding:4px 6px;border:none;background:transparent;cursor:pointer;color:#9ca3af;border-radius:5px;font-size:0.7rem;transition:color .12s"
              onmouseover="this.style.color='#16a34a';this.style.background='#f0fdf4'"
              onmouseout="this.style.color='#9ca3af';this.style.background='transparent'"
              title="Tabela de Atributos">
              <i class="fa-solid fa-table"></i>
            </button>
          </div>
        </div>
      `;

      body.appendChild(card);
    });

    header.addEventListener('click', () => {
      const isHidden = body.style.display === 'none' || body.style.display === '';
      body.style.display = isHidden ? 'block' : 'none';
      header.querySelector('.typ-arrow').style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
    });

    // Grupos abertos por padrão
    if (typ.id === 'gestao_publica' || typ.id === 'limites_demografia' || typ.id === 'zoneamento') {
      body.style.display = 'block';
      setTimeout(() => {
        const arrow = header.querySelector('.typ-arrow');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      }, 0);
    }

    typSection.appendChild(header);
    typSection.appendChild(body);
    container.appendChild(typSection);
  });
}

// Filtro rápido por tipologia
function filterByTypology(typologyId) {
  activeTypologyFilter = typologyId;
  document.querySelectorAll('.typology-pill-btn').forEach(b => {
    const isActive = b.dataset.typ === typologyId;
    b.classList.toggle('active', isActive);
  });
  renderLayerTree();
}

// Alternar visibilidade da camada
function toggleLayer(layerId) {
  const chk = document.getElementById(`chk-${layerId}`);
  const geoLayer = mapLayers[layerId];

  if (!geoLayer || !chk) return;

  if (chk.checked) {
    if (!map.hasLayer(geoLayer)) {
      geoLayer.addTo(map);
    }
  } else {
    if (map.hasLayer(geoLayer)) {
      map.removeLayer(geoLayer);
    }
  }

  updateActiveLayerCount();
  updateDynamicLegend();
}

// Opacidade
function changeLayerOpacity(layerId, value) {
  const opacity = parseFloat(value) / 100;
  layerOpacities[layerId] = opacity;
  applyLayerOpacity(layerId, opacity);
}

function applyLayerOpacity(layerId, opacity) {
  const geoLayer = mapLayers[layerId];
  if (!geoLayer) return;

  const cfg = LAYERS_CONFIG.find(l => l.id === layerId);
  if (!cfg) return;

  geoLayer.eachLayer(layer => {
    if (layer.setOpacity) {
      layer.setOpacity(opacity);
    }
    if (layer.setStyle) {
      if (cfg.geomType === "LineString") {
        layer.setStyle({ opacity: opacity });
      } else {
        layer.setStyle({
          fillOpacity: (cfg.style?.fillOpacity || 0.5) * opacity,
          opacity: opacity
        });
      }
    }
  });
}

// Zoom na camada
function zoomToLayer(layerId) {
  const geoLayer = mapLayers[layerId];
  const chk = document.getElementById(`chk-${layerId}`);

  if (!geoLayer) return;

  if (chk && !chk.checked) {
    chk.checked = true;
    toggleLayer(layerId);
  }

  try {
    const bounds = geoLayer.getBounds();
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  } catch (e) {
    console.warn("Ajuste de extensão:", e);
  }
}

// Ativar todas
function enableAllLayers() {
  LAYERS_CONFIG.forEach(cfg => {
    const chk = document.getElementById(`chk-${cfg.id}`);
    if (chk && !chk.checked) {
      chk.checked = true;
      toggleLayer(cfg.id);
    }
  });
}

// Desativar todas
function disableAllLayers() {
  LAYERS_CONFIG.forEach(cfg => {
    const chk = document.getElementById(`chk-${cfg.id}`);
    if (chk && chk.checked) {
      chk.checked = false;
      toggleLayer(cfg.id);
    }
  });
}

// Resetar visão para Craíbas
function resetCraibasExtent() {
  if (map) {
    map.fitBounds(CRAIBAS_BOUNDS, { padding: [25, 25] });
  }
}

// Mapas Rápidos / Presets Temáticos de Gestão
function applyThematicPreset(preset) {
  disableAllLayers();

  if (preset === 'geral') {
    switchBasemap('satellite');
    ['limites', 'rodovias', 'adm', 'saude'].forEach(id => {
      const chk = document.getElementById(`chk-${id}`);
      if (chk) { chk.checked = true; toggleLayer(id); }
    });
  } else if (preset === 'planejamento') {
    switchBasemap('topo');
    ['limites', 'zon_urbano', 'zon_rural', 'zpa'].forEach(id => {
      const chk = document.getElementById(`chk-${id}`);
      if (chk) { chk.checked = true; toggleLayer(id); }
    });
  } else if (preset === 'ambiental') {
    switchBasemap('satellite');
    ['limites', 'bacias', 'drenagem', 'mineracao', 'pedologia'].forEach(id => {
      const chk = document.getElementById(`chk-${id}`);
      if (chk) { chk.checked = true; toggleLayer(id); }
    });
  } else if (preset === 'social') {
    switchBasemap('satellite');
    ['limites', 'populacao', 'logradouros', 'saude', 'adm'].forEach(id => {
      const chk = document.getElementById(`chk-${id}`);
      if (chk) { chk.checked = true; toggleLayer(id); }
    });
  }

  resetCraibasExtent();
  showToast(`Mapa Temático carregado com sucesso!`, 'success');
}

// Atualizar contador de camadas
function updateActiveLayerCount() {
  let count = 0;
  Object.keys(mapLayers).forEach(k => {
    if (map.hasLayer(mapLayers[k])) count++;
  });

  const countBadge = document.getElementById('active-layers-badge');
  if (countBadge) {
    countBadge.textContent = `${count} ativa(s)`;
  }
}

// Legenda Dinâmica
function updateDynamicLegend() {
  const container = document.getElementById('dynamic-legend-content');
  if (!container) return;

  let activeHtml = '';

  LAYERS_CONFIG.forEach(cfg => {
    const geoLayer = mapLayers[cfg.id];
    if (geoLayer && map.hasLayer(geoLayer)) {
      activeHtml += `<div class="mb-2 pb-1.5 border-b border-slate-100 last:border-b-0">
        <div class="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
          <i class="fa-solid fa-layer-group text-blue-600 text-[10px]"></i> ${cfg.name}
        </div>`;

      if (cfg.colorScale) {
        activeHtml += `<div class="space-y-1">`;
        cfg.colorScale.forEach(cs => {
          activeHtml += `
            <div class="flex items-center gap-2 text-[10px] text-slate-600">
              <span class="w-3.5 h-3.5 rounded border border-gray-300 inline-block" style="background-color: ${cs.color}"></span>
              <span>${cs.label}</span>
            </div>
          `;
        });
        activeHtml += `</div>`;
      } else if (cfg.colorMap) {
        activeHtml += `<div class="space-y-1">`;
        Object.keys(cfg.colorMap).slice(0, 15).forEach(k => {
          activeHtml += `
            <div class="flex items-center gap-2 text-[10px] text-slate-600 truncate" title="${k}">
              <span class="w-3.5 h-3.5 rounded border border-gray-400 inline-block flex-shrink-0" style="background-color: ${cfg.colorMap[k]}"></span>
              <span class="truncate">${k}</span>
            </div>
          `;
        });
        activeHtml += `</div>`;
      } else {
        let swatch = `<span class="w-4 h-3 rounded border border-gray-300 inline-block" style="background-color: ${cfg.style?.fillColor || '#2563eb'}"></span>`;
        if (cfg.geomType === "Point") {
          swatch = `<i class="fa-solid ${cfg.pointIcon || 'fa-location-dot'} text-xs" style="color: ${cfg.pointColor || '#dc2626'}"></i>`;
        } else if (cfg.geomType === "LineString") {
          swatch = `<span class="w-5 h-1 inline-block rounded" style="background-color: ${cfg.style?.color || '#dc2626'}"></span>`;
        }
        activeHtml += `
          <div class="flex items-center gap-2 text-[10px] text-slate-600">
            ${swatch}
            <span>Padrão Cartográfico</span>
          </div>
        `;
      }

      activeHtml += `</div>`;
    }
  });

  if (!activeHtml) {
    container.innerHTML = `<p class="text-xs text-slate-400 italic">Nenhuma camada ativada no momento.</p>`;
  } else {
    container.innerHTML = activeHtml;
  }
}

// Filtro textual de camadas
function filterLayersInTree(query) {
  const q = query.toLowerCase().trim();
  LAYERS_CONFIG.forEach(cfg => {
    const card = document.getElementById(`layer-card-${cfg.id}`);
    if (card) {
      const match = cfg.name.toLowerCase().includes(q) || cfg.typology.toLowerCase().includes(q);
      card.style.display = match ? 'block' : 'none';
    }
  });
}

// Busca no mapa
function searchMapFeatures(query) {
  const q = query.toLowerCase().trim();
  const resultsContainer = document.getElementById('map-search-results');
  if (!resultsContainer) return;

  if (q.length < 2) {
    resultsContainer.classList.add('hidden');
    resultsContainer.innerHTML = '';
    return;
  }

  const results = [];
  const searchableLayers = ['adm', 'saude', 'logradouros', 'rodovias', 'bacias'];
  searchableLayers.forEach(layerId => {
    const rawData = window.GEODATA[layerId];
    if (!rawData) return;
    const geojsonData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    const cfg = LAYERS_CONFIG.find(l => l.id === layerId);

    geojsonData.features.forEach(f => {
      let label = f.properties.Name || f.properties.NM_LOG || f.properties.Nome_via || f.properties.NOME_BACIA || '';
      if (label && label.toLowerCase().includes(q)) {
        results.push({
          label: label,
          type: cfg.name,
          layerId: cfg.id,
          feature: f
        });
      }
    });
  });

  if (results.length === 0) {
    resultsContainer.innerHTML = `<div class="p-3 text-xs text-gray-500 italic">Nenhum resultado encontrado para "${query}".</div>`;
    resultsContainer.classList.remove('hidden');
    return;
  }

  let html = '';
  results.slice(0, 10).forEach((res, i) => {
    html += `
      <div class="p-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 cursor-pointer flex items-center justify-between text-xs" onclick="selectSearchResult(${res.feature.geometry.coordinates ? 'true' : 'false'}, '${res.layerId}', ${i})">
        <div>
          <span class="font-bold text-slate-800 block">${res.label}</span>
          <span class="text-[10px] text-blue-600 font-medium">${res.type}</span>
        </div>
        <i class="fa-solid fa-arrow-right text-[10px] text-gray-400"></i>
      </div>
    `;
  });

  window._currentSearchResults = results;
  resultsContainer.innerHTML = html;
  resultsContainer.classList.remove('hidden');
}

function selectSearchResult(hasCoords, layerId, index) {
  const res = window._currentSearchResults ? window._currentSearchResults[index] : null;
  if (!res) return;

  const resultsContainer = document.getElementById('map-search-results');
  if (resultsContainer) resultsContainer.classList.add('hidden');

  const chk = document.getElementById(`chk-${layerId}`);
  if (chk && !chk.checked) {
    chk.checked = true;
    toggleLayer(layerId);
  }

  const geom = res.feature.geometry;
  if (geom.type === "Point") {
    const latlng = [geom.coordinates[1], geom.coordinates[0]];
    map.setView(latlng, 16);
    L.popup()
      .setLatLng(latlng)
      .setContent(buildPopupContent(res.feature, LAYERS_CONFIG.find(l => l.id === layerId)))
      .openOn(map);
  } else {
    const tempGeo = L.geoJSON(res.feature);
    map.fitBounds(tempGeo.getBounds(), { padding: [40, 40] });
    L.popup()
      .setLatLng(tempGeo.getBounds().getCenter())
      .setContent(buildPopupContent(res.feature, LAYERS_CONFIG.find(l => l.id === layerId)))
      .openOn(map);
  }
}

// Localização GPS
function locateUser() {
  if (!navigator.geolocation) {
    alert("Geolocalização não suportada.");
    return;
  }

  map.locate({ setView: true, maxZoom: 16 });
  map.on('locationfound', function(e) {
    L.circle(e.latlng, { radius: e.accuracy / 2, color: '#3b82f6', fillColor: '#93c5fd', fillOpacity: 0.3 }).addTo(map);
    L.marker(e.latlng)
      .addTo(map)
      .bindPopup("<b>Sua Localização Aproximada</b><br>Precisão: ~" + Math.round(e.accuracy) + " m.")
      .openPopup();
  });
  map.on('locationerror', function(e) {
    alert("Erro ao obter localização: " + e.message);
  });
}

// Ferramentas de Medição
function setMeasureMode(mode) {
  measureMode = mode;
  measurePoints = [];
  measureLayer.clearLayers();

  const distBtn = document.getElementById('measure-dist-btn');
  const areaBtn = document.getElementById('measure-area-btn');

  if (distBtn) distBtn.classList.toggle('text-blue-600', mode === 'distance');
  if (areaBtn) areaBtn.classList.toggle('text-blue-600', mode === 'area');

  const tooltipEl = document.getElementById('measure-info-box');
  if (tooltipEl) {
    if (mode) {
      tooltipEl.classList.remove('hidden');
      tooltipEl.innerHTML = `<span class="font-bold">${mode === 'distance' ? 'Modo Distância' : 'Modo Área'}:</span> Clique no mapa para adicionar pontos. Clique novamente na ferramenta para finalizar.`;
    } else {
      tooltipEl.classList.add('hidden');
    }
  }
}

function handleMapClick(e) {
  if (!measureMode) return;

  measurePoints.push(e.latlng);

  if (measureMode === 'distance') {
    if (measurePoints.length > 1) {
      measureLayer.clearLayers();
      L.polyline(measurePoints, { color: '#dc2626', weight: 3, dashArray: '5, 5' }).addTo(measureLayer);
      const totalMeters = calculateTotalDistance(measurePoints);
      const formatted = totalMeters > 1000 ? `${(totalMeters / 1000).toFixed(2)} km` : `${Math.round(totalMeters)} metros`;

      const tooltipEl = document.getElementById('measure-info-box');
      if (tooltipEl) tooltipEl.innerHTML = `<span class="font-bold">Distância Total:</span> ${formatted} (${measurePoints.length} pontos)`;
    }
  } else if (measureMode === 'area') {
    if (measurePoints.length >= 3) {
      measureLayer.clearLayers();
      L.polygon(measurePoints, { color: '#059669', fillColor: '#10b981', fillOpacity: 0.35 }).addTo(measureLayer);
      const areaM2 = calculatePolygonArea(measurePoints);
      const formatted = areaM2 > 10000 ? `${(areaM2 / 10000).toFixed(2)} hectares (${Math.round(areaM2).toLocaleString('pt-BR')} m²)` : `${Math.round(areaM2).toLocaleString('pt-BR')} m²`;

      const tooltipEl = document.getElementById('measure-info-box');
      if (tooltipEl) tooltipEl.innerHTML = `<span class="font-bold">Área Calculada:</span> ${formatted}`;
    }
  }
}

function calculateTotalDistance(latlngs) {
  let total = 0;
  for (let i = 0; i < latlngs.length - 1; i++) {
    total += latlngs[i].distanceTo(latlngs[i + 1]);
  }
  return total;
}

function calculatePolygonArea(latlngs) {
  const radius = 6378137;
  if (latlngs.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < latlngs.length; i++) {
    const p1 = latlngs[i];
    const p2 = latlngs[(i + 1) % latlngs.length];
    total += ((p2.lng - p1.lng) * (Math.PI / 180)) * (2 + Math.sin(p1.lat * (Math.PI / 180)) + Math.sin(p2.lat * (Math.PI / 180)));
  }
  return Math.abs(total * radius * radius / 2);
}

// Tabela de Atributos Interativa
function openAttributeTable(layerId) {
  selectedLayerForTable = layerId;
  const cfg = LAYERS_CONFIG.find(l => l.id === layerId);
  const rawData = window.GEODATA[layerId];
  if (!cfg || !rawData) return;

  const geojsonData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
  const drawer = document.getElementById('attribute-drawer');
  const titleEl = document.getElementById('table-layer-title');
  const countEl = document.getElementById('table-count-badge');
  const tableContainer = document.getElementById('table-data-container');

  if (titleEl) titleEl.textContent = cfg.name;
  if (countEl) countEl.textContent = `${geojsonData.features.length} registros`;

  let headerHtml = '<tr><th class="w-10">#</th>';
  cfg.fields.forEach(f => {
    headerHtml += `<th>${f.label}</th>`;
  });
  headerHtml += '<th class="w-20">Ações</th></tr>';

  let bodyHtml = '';
  geojsonData.features.forEach((feat, index) => {
    bodyHtml += `<tr onclick="zoomToFeatureFromTable('${layerId}', ${index})">`;
    bodyHtml += `<td class="text-gray-400 font-mono text-[11px]">${index + 1}</td>`;
    cfg.fields.forEach(f => {
      let val = feat.properties[f.key];
      if (val === undefined || val === null) val = '-';
      if (f.format) val = f.format(val);
      bodyHtml += `<td>${val}</td>`;
    });
    bodyHtml += `<td><button class="text-blue-600 hover:text-blue-800 text-xs font-semibold"><i class="fa-solid fa-location-crosshairs mr-1"></i>Ver</button></td>`;
    bodyHtml += `</tr>`;
  });

  tableContainer.innerHTML = `
    <table class="attr-table">
      <thead>${headerHtml}</thead>
      <tbody>${bodyHtml}</tbody>
    </table>
  `;

  drawer.classList.add('open');
}

function closeAttributeTable() {
  const drawer = document.getElementById('attribute-drawer');
  if (drawer) drawer.classList.remove('open');
}

function zoomToFeatureFromTable(layerId, index) {
  const rawData = window.GEODATA[layerId];
  if (!rawData) return;
  const geojsonData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
  const feat = geojsonData.features[index];
  if (!feat) return;

  const cfg = LAYERS_CONFIG.find(l => l.id === layerId);

  const chk = document.getElementById(`chk-${layerId}`);
  if (chk && !chk.checked) {
    chk.checked = true;
    toggleLayer(layerId);
  }

  const geom = feat.geometry;
  if (geom.type === "Point") {
    const latlng = [geom.coordinates[1], geom.coordinates[0]];
    map.setView(latlng, 16);
    L.popup()
      .setLatLng(latlng)
      .setContent(buildPopupContent(feat, cfg))
      .openOn(map);
  } else {
    const tempGeo = L.geoJSON(feat);
    map.fitBounds(tempGeo.getBounds(), { padding: [50, 50] });
    L.popup()
      .setLatLng(tempGeo.getBounds().getCenter())
      .setContent(buildPopupContent(feat, cfg))
      .openOn(map);
  }
}

// Exportar CSV
function exportCurrentTableToCSV() {
  if (!selectedLayerForTable) return;
  const cfg = LAYERS_CONFIG.find(l => l.id === selectedLayerForTable);
  const rawData = window.GEODATA[selectedLayerForTable];
  if (!cfg || !rawData) return;

  const geojsonData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
  let csv = [];

  const headers = cfg.fields.map(f => `"${f.label.replace(/"/g, '""')}"`);
  csv.push(headers.join(';'));

  geojsonData.features.forEach(feat => {
    const row = cfg.fields.map(f => {
      let v = feat.properties[f.key];
      if (v === undefined || v === null) v = '';
      return `"${String(v).replace(/"/g, '""')}"`;
    });
    csv.push(row.join(';'));
  });

  const blob = new Blob(["\uFEFF" + csv.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${cfg.name.replace(/[^a-zA-Z0-9]/g, '_')}_Craibas.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Painel de Camadas Flutuante (estilo IMA) ─────────────────────────────────
let _layersPanelOpen = true;

function toggleLayersPanel() {
  const panel = document.getElementById('layers-panel');
  const btn   = document.getElementById('toggle-layers-panel-btn');
  if (!panel) return;

  _layersPanelOpen = !_layersPanelOpen;

  if (_layersPanelOpen) {
    panel.style.transform = 'translateX(0)';
    if (btn) btn.title = 'Fechar Painel de Camadas';
  } else {
    panel.style.transform = 'translateX(100%)';
    if (btn) btn.title = 'Abrir Painel de Camadas';
  }

  // Re-renderiza o Leaflet após a animação CSS (300 ms)
  setTimeout(() => { if (map) map.invalidateSize(); }, 320);
}


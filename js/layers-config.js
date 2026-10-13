/**
 * Configuração de Camadas Georreferenciadas - Geoportal Craíbas - AL
 * Organizadas por Tipologia de Mapa
 */

const MAP_TYPOLOGIES = [
  {
    id: "gestao_publica",
    title: "Gestão Pública & Equipamentos Sociais",
    icon: "fa-landmark",
    color: "#1e3a8a",
    description: "Sedes de secretarias, prefeitura, serviços municipais e unidades básicas de saúde."
  },
  {
    id: "limites_demografia",
    title: "Divisão Territorial & Demografia",
    icon: "fa-map-location-dot",
    color: "#4f46e5",
    description: "Perímetro municipal oficial e setores censitários do IBGE com dados populacionais."
  },
  {
    id: "sistema_viario",
    title: "Mobilidade & Sistema Viário",
    icon: "fa-road",
    color: "#d97706",
    description: "Rodovias estaduais, acessos alternativos vicinais e faces de logradouros urbanos."
  },
  {
    id: "zoneamento",
    title: "Planejamento Territorial & Zoneamento",
    icon: "fa-draw-polygon",
    color: "#059669",
    description: "Zoneamento urbano, zoneamento ambiental/rural e zonas de proteção ambiental (ZPA)."
  },
  {
    id: "mineracao_solos",
    title: "Recursos Minerais & Pedologia",
    icon: "fa-gem",
    color: "#b45309",
    description: "Áreas de mineração (cobre, calcário, areia) e mapeamento pedológico dos solos."
  },
  {
    id: "hidrografia",
    title: "Recursos Hídricos & Meio Ambiente",
    icon: "fa-water",
    color: "#0284c7",
    description: "Bacias hidrográficas delimitadas e rede de drenagem detalhada com rios e riachos."
  }
];

const LAYERS_CONFIG = [
  // 1. GESTÃO PÚBLICA & EQUIPAMENTOS
  {
    id: "adm",
    name: "Administração Pública & Órgãos Municipais",
    typology: "gestao_publica",
    geomType: "Point",
    visibleDefault: true,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA LOCAIS DE ADMINISTRACAO PUBLICA.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA LOCAIS DE ADMINISTRACAO PUBLICA.qmd",
    featureCount: 10,
    pointIcon: "fa-building-columns",
    pointColor: "#1e3a8a",
    pointBg: "#3b82f6",
    labelField: "Name",
    style: {
      radius: 8,
      fillColor: "#1d4ed8",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    },
    fields: [
      { key: "Name", label: "Órgão / Equipamento" },
      { key: "descriptio", label: "Descrição / Local" }
    ]
  },
  {
    id: "saude",
    name: "Unidades de Saúde & UBS",
    typology: "gestao_publica",
    geomType: "Point",
    visibleDefault: true,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA DE LOCALIZACAO DAS UNDADES DE SAUDE.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA DE LOCALIZACAO DAS UNDADES DE SAUDE.qmd",
    featureCount: 7,
    pointIcon: "fa-hospital",
    pointColor: "#dc2626",
    pointBg: "#ef4444",
    labelField: "Name",
    style: {
      radius: 8,
      fillColor: "#dc2626",
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.95
    },
    fields: [
      { key: "Name", label: "Unidade de Saúde" },
      { key: "descriptio", label: "Informações Complementares" }
    ]
  },

  // 2. DIVISÃO TERRITORIAL & DEMOGRAFIA
  {
    id: "limites",
    name: "Limite Municipal de Craíbas",
    typology: "limites_demografia",
    geomType: "Polygon",
    visibleDefault: true,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/Limites do Municipio de Craibas.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/Limites do Municipio de Craibas.qmd",
    featureCount: 1,
    style: {
      fillColor: "#3b82f6",
      fillOpacity: 0.04,
      color: "#1e293b",
      weight: 3.5,
      dashArray: "6, 4",
      opacity: 1
    },
    fields: [
      { key: "NM_MUN", label: "Município" },
      { key: "SIGLA_UF", label: "Estado" },
      { key: "AREA_KM2", label: "Área Territorial", format: v => (v ? `${parseFloat(v).toFixed(2)} km²` : "277.62 km²") },
      { key: "CD_MUN", label: "Código IBGE" }
    ]
  },
  {
    id: "populacao",
    name: "População por Setores Censitários (IBGE)",
    typology: "limites_demografia",
    geomType: "Polygon",
    visibleDefault: false,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA TOTAIS DE PESSOAS - Setores Censitarios.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA TOTAIS DE PESSOAS - Setores Censitarios.qmd",
    featureCount: 43,
    colorScale: [
      { min: 0, max: 300, color: "#e0e7ff", label: "Até 300 hab." },
      { min: 301, max: 600, color: "#a5b4fc", label: "301 a 600 hab." },
      { min: 601, max: 900, color: "#6366f1", label: "601 a 900 hab." },
      { min: 901, max: 1500, color: "#4338ca", label: "901 a 1.500 hab." },
      { min: 1501, max: 99999, color: "#312e81", label: "Mais de 1.500 hab." }
    ],
    getStyle: function(feature) {
      const pop = parseInt(feature.properties.v0001 || 0, 10);
      let col = "#e0e7ff";
      if (pop > 1500) col = "#312e81";
      else if (pop > 900) col = "#4338ca";
      else if (pop > 600) col = "#6366f1";
      else if (pop > 300) col = "#a5b4fc";

      return {
        fillColor: col,
        fillOpacity: 0.65,
        color: "#ffffff",
        weight: 1.5,
        opacity: 0.9
      };
    },
    fields: [
      { key: "CD_SETOR", label: "Código do Setor" },
      { key: "NM_DIST", label: "Distrito" },
      { key: "v0001", label: "Total de Moradores (Censo)", format: v => (v ? `${Number(v).toLocaleString('pt-BR')} hab.` : "0") },
      { key: "v0002", label: "Total de Domicílios Particulares", format: v => (v ? `${Number(v).toLocaleString('pt-BR')} dom.` : "0") },
      { key: "AREA_KM2", label: "Área do Setor (km²)" }
    ]
  },

  // 3. MOBILIDADE & SISTEMA VIÁRIO
  {
    id: "rodovias",
    name: "Rodovias Principais & Acessos",
    typology: "sistema_viario",
    geomType: "LineString",
    visibleDefault: true,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/Rodovias.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/Rodovias.qmd",
    featureCount: 3,
    style: {
      color: "#dc2626",
      weight: 4,
      opacity: 0.95
    },
    fields: [
      { key: "Nome_via", label: "Nome da Via" },
      { key: "Prefixo", label: "Prefixo / Sigla" },
      { key: "Categoria", label: "Categoria" },
      { key: "comp km", label: "Extensão", format: v => (v ? `${parseFloat(v).toFixed(2)} km` : "N/D") }
    ]
  },
  {
    id: "vias_alt",
    name: "Vias Alternativas & Estradas Vicinais",
    typology: "sistema_viario",
    geomType: "LineString",
    visibleDefault: false,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/Vias Alternativas.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/Vias Alternativas.qmd",
    featureCount: 11,
    style: {
      color: "#ea580c",
      weight: 2.5,
      dashArray: "5, 4",
      opacity: 0.9
    },
    fields: [
      { key: "id", label: "Identificador" },
      { key: "tipo", label: "Tipo de Via" }
    ]
  },
  {
    id: "logradouros",
    name: "Faces de Logradouro (Malha Urbana)",
    typology: "sistema_viario",
    geomType: "LineString",
    visibleDefault: false,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/Faces de logradouro.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/Faces de logradouro.qmd",
    featureCount: 997,
    style: {
      color: "#475569",
      weight: 1.8,
      opacity: 0.8
    },
    fields: [
      { key: "NM_LOG", label: "Nome do Logradouro" },
      { key: "NM_TIP_LOG", label: "Tipo" },
      { key: "NM_TIT_LOG", label: "Título" },
      { key: "TOT_GERAL", label: "Total de Imóveis" },
      { key: "TOT_RES", label: "Imóveis Residenciais" }
    ]
  },

  // 4. PLANEJAMENTO TERRITORIAL & ZONEAMENTO
  {
    id: "zon_urbano",
    name: "Zoneamento Urbano Municipal",
    typology: "zoneamento",
    geomType: "Polygon",
    visibleDefault: true,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/ZONEAMENTO PRÉVIO/ZONEAMENTO URBANO - CRAÍBAS-AL.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/ZONEAMENTO PRÉVIO/ZONEAMENTO URBANO - CRAÍBAS-AL.qmd",
    featureCount: 36,
    colorMap: {
      "Áreas Especiais de Urbanização Específica - AEUE": "#c9827c",
      "Zonas de Expansão - ZE": "#b8d5d2",
      "Zona de Centralidade - ZC": "#ddaf8e",
      "Zonas de Estruturação Urbana - ZEU 01": "#a1a1a1",
      "Zonas de Estruturação Urbana - ZEU 02": "#e8d49a",
      "Zonas de Especial Interesse Social - ZEIS": "#91b6c5"
    },
    getStyle: function(feature) {
      const z = (feature.properties.ZONA || "").trim();
      let col = "#a1a1a1";

      if (z.includes("Urbanização Específica") || z.includes("AEUE")) {
        col = "#c9827c"; // Terracota avermelhado
      } else if (z.includes("Expansão") || z.includes("ZE")) {
        col = "#b8d5d2"; // Menta claro / ciano acinzentado
      } else if (z.includes("Centralidade") || z.includes("ZC")) {
        col = "#ddaf8e"; // Pêssego / ocre suave
      } else if (z.includes("01") || z.includes("ZEU 01")) {
        col = "#a1a1a1"; // Cinza médio
      } else if (z.includes("02") || z.includes("ZEU 02")) {
        col = "#e8d49a"; // Amarelo areia
      } else if (z.includes("Interesse Social") || z.includes("ZEIS")) {
        col = "#91b6c5"; // Azul acinzentado
      }

      return {
        fillColor: col,
        fillOpacity: 0.93,
        color: "#1e293b",
        weight: 1.5,
        opacity: 1
      };
    },
    fields: [
      { key: "ZONA", label: "Classificação da Zona" },
      { key: "area_2", label: "Área (m²)", format: v => (v ? Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : "N/D") }
    ]
  },
  {
    id: "zon_rural",
    name: "Zoneamento Ambiental e Rural",
    typology: "zoneamento",
    geomType: "Polygon",
    visibleDefault: false,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/ZONEAMENTO PRÉVIO/ZONEAMENTO AMBIENTAL E RURAL - CRAÍBAS -AL.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/ZONEAMENTO PRÉVIO/ZONEAMENTO AMBIENTAL E RURAL - CRAÍBAS -AL.qmd",
    featureCount: 15,
    colorMap: {
      "Área Especial de Interesse Minerário - AEIM": "#98958f",
      "Zonas de Proteção Ambiental - ZPA": "#a3e4d7",
      "Zonas Rural de Produção Agrícola - ZRPA": "#829d78",
      "Zona de Desenvolvimento Econômico - ZDE": "#a4ff12",
      "Zona Rural de Produção Agropecuária - ZRPAP": "#b2c8b2",
      "Zona de Proteção Paisagística e Ambiental - ZPPA": "#207f7e",
      "Zona Ambiental de Uso e Ocupação Especial - ZAUOE": "#7fa99b",
      "Zonas Ambiental de Restrição para Controle e Transição - ZARCT": "#dadada"
    },
    getStyle: function(feature) {
      const z = (feature.properties.ZONA || "").trim();
      let col = "#98958f";

      if (z.includes("Minerário") || z.includes("AEIM")) {
        col = "#98958f"; // Cinza taupe
      } else if (z.includes("ZPA") || (z.includes("Proteção Ambiental") && !z.includes("Paisagística"))) {
        col = "#a3e4d7"; // Turquesa claro
      } else if (z.includes("Agropecuária") || z.includes("ZRPAP")) {
        col = "#b2c8b2"; // Verde sálvia claro
      } else if (z.includes("Agrícola") || z.includes("Agricola") || z.includes("ZRPA")) {
        col = "#829d78"; // Verde musgo
      } else if (z.includes("Desenvolvimento Econômico") || z.includes("ZDE")) {
        col = "#a4ff12"; // Verde limão vibrante
      } else if (z.includes("Paisagística") || z.includes("ZPPA")) {
        col = "#207f7e"; // Verde azulado / teal escuro
      } else if (z.includes("Ocupação Especial") || z.includes("ZAUOE")) {
        col = "#7fa99b"; // Verde ardósia suave
      } else if (z.includes("Restrição") || z.includes("ZARCT") || z.includes("Transição")) {
        col = "#dadada"; // Prata / cinza muito claro
      }

      return {
        fillColor: col,
        fillOpacity: 0.93,
        color: "#1e293b",
        weight: 1.5,
        opacity: 1
      };
    },
    fields: [
      { key: "ZONA", label: "Zoneamento Rural / Ambiental" },
      { key: "SIGLAS", label: "Sigla Oficial" },
      { key: "area_2", label: "Área Calculada" }
    ]
  },
  {
    id: "zpa",
    name: "Zonas de Proteção Ambiental - ZPA",
    typology: "zoneamento",
    geomType: "Polygon",
    visibleDefault: false,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/ZONEAMENTO PRÉVIO/Zona de Proteção Ambiental - ZPA.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/ZONEAMENTO PRÉVIO/Zona de Proteção Ambiental - ZPA.qmd",
    featureCount: 9,
    style: {
      fillColor: "#a3e4d7",
      fillOpacity: 0.93,
      color: "#1e293b",
      weight: 1.5,
      opacity: 1
    },
    fields: [
      { key: "NOME", label: "Nome da Zona de Preservação" },
      { key: "Tipo", label: "Tipologia Ambiental" },
      { key: "Bacia", label: "Bacia Hidrográfica" }
    ]
  },

  // 5. RECURSOS MINERAIS & PEDOLOGIA
  {
    id: "mineracao",
    name: "Concessões & Substâncias Minerais",
    typology: "mineracao_solos",
    geomType: "Polygon",
    visibleDefault: false,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA DE MINERAÇÃO - Substancias.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA DE MINERAÇÃO - Substancias.qmd",
    featureCount: 4,
    colorMap: {
      "COBRE": "#ea580c",
      "MINÉRIO DE COBRE": "#c2410c",
      "CALCÁRIO": "#78716c",
      "AREIA": "#ca8a04"
    },
    getStyle: function(feature) {
      const s = feature.properties.SUBS || "";
      const colorMap = {
        "COBRE": "#ea580c",
        "MINÉRIO DE COBRE": "#c2410c",
        "CALCÁRIO": "#78716c",
        "AREIA": "#ca8a04"
      };
      const col = colorMap[s] || "#f97316";
      return {
        fillColor: col,
        fillOpacity: 0.65,
        color: "#431407",
        weight: 2,
        opacity: 1
      };
    },
    fields: [
      { key: "SUBS", label: "Substância Mineral Concedida" }
    ]
  },
  {
    id: "pedologia",
    name: "Mapeamento Pedológico (Solos)",
    typology: "mineracao_solos",
    geomType: "Polygon",
    visibleDefault: false,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA DE PEDOLOGIA.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA DE PEDOLOGIA.qmd",
    featureCount: 6,
    colorMap: {
      "LAd15": "#b45309",
      "SXe5": "#78716c",
      "TCo26": "#a16207",
      "LVe1": "#9a3412"
    },
    getStyle: function(feature) {
      const u = feature.properties.nom_unidad || "";
      const colorMap = {
        "LAd15": "#b45309",
        "SXe5": "#78716c",
        "TCo26": "#a16207",
        "LVe1": "#9a3412"
      };
      const col = colorMap[u] || "#d97706";
      return {
        fillColor: col,
        fillOpacity: 0.5,
        color: "#78350f",
        weight: 1.5,
        opacity: 0.85
      };
    },
    fields: [
      { key: "nom_unidad", label: "Unidade de Solo" },
      { key: "ordem", label: "Ordem Pedológica" },
      { key: "componente", label: "Componente Principal" },
      { key: "legenda", label: "Descrição da Legenda" },
      { key: "relevo", label: "Relevo Dominante" },
      { key: "textura", label: "Textura do Solo" }
    ]
  },

  // 6. RECURSOS HÍDRICOS & MEIO AMBIENTE
  {
    id: "bacias",
    name: "Bacias Hidrográficas Municipais",
    typology: "hidrografia",
    geomType: "Polygon",
    visibleDefault: false,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA HIDROGRAFIA - BACIAS.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA HIDROGRAFIA - BACIAS.qmd",
    featureCount: 8,
    style: {
      fillColor: "#0284c7",
      fillOpacity: 0.15,
      color: "#0369a1",
      weight: 2,
      dashArray: "4, 3",
      opacity: 0.95
    },
    fields: [
      { key: "NOME_BACIA", label: "Nome da Bacia Hidrográfica" },
      { key: "REGIAO", label: "Região Hidrográfica" },
      { key: "AREA", label: "Área da Bacia" }
    ]
  },
  {
    id: "drenagem",
    name: "Rede de Drenagem (Rios e Córregos)",
    typology: "hidrografia",
    geomType: "LineString",
    visibleDefault: false,
    fileDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA HIDROGRAFIA - REDE DE DRENAGEM.geojson",
    qmdDownload: "ARQUIVOS GEORREFERENCIADOS/MAPA HIDROGRAFIA - REDE DE DRENAGEM.qmd",
    featureCount: 773,
    style: {
      color: "#0284c7",
      weight: 1.8,
      opacity: 0.85
    },
    fields: [
      { key: "NOORIGINAL", label: "Nome do Rio / Riacho" },
      { key: "NORIOCOMP", label: "Curso d'Água Completo" },
      { key: "NUSTRAHLER", label: "Ordem de Strahler" }
    ]
  }
];

// Dados dos Mapas Temáticos Oficiais em Alta Resolução (PNG)
const HIGH_RES_MAPS = [
  {
    id: "map_adm",
    title: "Mapa de Administração Pública e Sedes Oficiais",
    file: "MAPAS/MAPA - ADMINISTRAÇÃO PÚBLICA.png",
    size: "4.51 MB",
    category: "Gestão Municipal",
    description: "Distribuição espacial dos prédios da Prefeitura Municipal, Secretarias, Fóruns, Cartórios e Segurança Pública."
  },
  {
    id: "map_ensino",
    title: "Mapa de Instituições de Ensino",
    file: "MAPAS/MAPA -  INSTITUIÇÕES DE ENSINO.png",
    size: "3.21 MB",
    category: "Educação",
    description: "Mapeamento das escolas municipais, estaduais e creches no território urbano e rural de Craíbas."
  },
  {
    id: "map_saude",
    title: "Mapa Prévio de Unidades de Saúde",
    file: "MAPAS/MAPA PRÉVIO - UNIDADES DE SAÚDE.png",
    size: "3.31 MB",
    category: "Saúde",
    description: "Localização de postos de saúde, Unidades Básicas de Saúde (UBS), clínicas e centro médico municipal."
  },
  {
    id: "map_pop",
    title: "Mapa de Total de Pessoas por Setor",
    file: "MAPAS/MAPA - TOTAL DE PESSOAS.png",
    size: "1.34 MB",
    category: "Demografia",
    description: "Distribuição demográfica da população de Craíbas com base no Censo Demográfico do IBGE."
  },
  {
    id: "map_hidro",
    title: "Mapa de Recursos Hídricos e Hidrografia",
    file: "MAPAS/MAPA - HIDROGRAFIA.png",
    size: "3.42 MB",
    category: "Recursos Hídricos",
    description: "Bacias e sub-bacias hidrográficas (Coruripe, Traipu, Itiúba), cursos d'água e rede de drenagem municipal."
  },
  {
    id: "map_hipso",
    title: "Mapa de Hipsometria e Relevo",
    file: "MAPAS/MAPA - HIPSOMETRIA.png",
    size: "13.58 MB",
    category: "Topografia & Relevo",
    description: "Curvas de nível e faixas altimétricas com Modelo Digital de Elevação (MDE) em altíssima definição."
  },
  {
    id: "map_miner_fase",
    title: "Mapa de Mineração (Fase do Processo)",
    file: "MAPAS/MAPA - MINERAÇÃO (fase).png",
    size: "11.09 MB",
    category: "Mineração",
    description: "Processos minerários da ANM categorizados por fase de concessão, lavra e requerimento em Craíbas."
  },
  {
    id: "map_miner_subs",
    title: "Mapa de Mineração (Substâncias)",
    file: "MAPAS/MAPA - MINERAÇÃO (substâncias).png",
    size: "11.02 MB",
    category: "Mineração",
    description: "Mapeamento das reservas e concessões de minério de cobre, calcário, areia e outros minerais."
  },
  {
    id: "map_pedologia",
    title: "Mapa de Pedologia e Solos",
    file: "MAPAS/MAPA - PEDOLOGIA.png",
    size: "12.26 MB",
    category: "Solos & Meio Ambiente",
    description: "Classes taxonômicas de solos (Latossolos, Planossolos, Neossolos) segundo classificação IBGE/CPRM."
  },
  {
    id: "map_zoneamento",
    title: "Mapa de Zoneamento Urbano e Rural - Craíbas-AL",
    file: "MAPAS/MAPA - ZONEAMENTO - CRAÍBAS-AL.png",
    size: "1.73 MB",
    category: "Planejamento Territorial",
    description: "Mapa oficial de Zoneamento Urbano e Ambiental/Rural do Município de Craíbas - AL, com delimitação das zonas de uso e ocupação do solo conforme a legislação municipal."
  }
];

// Legislação e Decretos Ambientais Municipais (PDF)
const ENVIRONMENTAL_LAWS = [
  {
    id: "lei_413_2017",
    title: "Lei Municipal Nº 413/2017 - Código de Meio Ambiente",
    file: "LEIS AMBIENTAIS/LEI 413 2017 CODIGO DE MEIO AMBIENTE CRAÍBAS.pdf",
    size: "5.43 MB",
    year: "2017",
    type: "Lei Ordinária",
    description: "Institui o Código Municipal de Meio Ambiente do Município de Craíbas - AL, dispondo sobre o Sistema Municipal de Meio Ambiente, licenciamento, fiscalização e penalidades."
  },
  {
    id: "lei_413_2016",
    title: "Lei Municipal Nº 413/2016 - Política Municipal de Proteção Ambiental",
    file: "LEIS AMBIENTAIS/Lei 413 2016 Política Proteção Meio Ambiente.pdf",
    size: "28.80 MB",
    year: "2016",
    type: "Lei Ordinária",
    description: "Estabelece as diretrizes da Política Municipal de Proteção, Conservação e Recuperação do Meio Ambiente e uso sustentável dos recursos naturais em Craíbas."
  },
  {
    id: "lei_440_2018",
    title: "Lei Municipal Nº 440/2018 - Alteração da Legislação Ambiental",
    file: "LEIS AMBIENTAIS/Lei nº 440-2018 - Meio Ambiente - Altera a Lei nº 413-2016.pdf",
    size: "1.24 MB",
    year: "2018",
    type: "Lei Modificativa",
    description: "Altera dispositivos da Lei nº 413/2016 relativos a procedimentos de fiscalização, competências e adequações dos órgãos gestores ambientais."
  },
  {
    id: "dec_62_2021",
    title: "Decreto Municipal Nº 62 de 14 de Setembro de 2021",
    file: "LEIS AMBIENTAIS/DECRETO Nº 62 14 de Setembro 2021.pdf",
    size: "2.86 MB",
    year: "2021",
    type: "Decreto Executivo",
    description: "Regulamenta normas complementares de licenciamento e procedimentos administrativos ambientais no âmbito do Poder Executivo de Craíbas."
  },
  {
    id: "dec_64_2021",
    title: "Decreto Municipal Nº 64 de 21 de Setembro de 2021",
    file: "LEIS AMBIENTAIS/DECRETO Nº 64 21 de Setembro de 2021.pdf",
    size: "0.93 MB",
    year: "2021",
    type: "Decreto Executivo",
    description: "Dispõe sobre critérios técnicos de enquadramento de atividades e empreendimentos sujeitos a licenciamento ambiental municipal."
  },
  {
    id: "dec_80_2024",
    title: "Decreto Municipal Nº 80/2024 - 1ª Conferência de Meio Ambiente",
    file: "LEIS AMBIENTAIS/DECRETO Nº 80-2024 - Convoca a 1ª Conferência Municipal do Meio Ambiente em Craíbas.pdf",
    size: "0.56 MB",
    year: "2024",
    type: "Decreto Executivo",
    description: "Convoca oficialmente a 1ª Conferência Municipal do Meio Ambiente de Craíbas e institui a Comissão Organizadora."
  }
];

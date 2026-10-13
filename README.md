# GEOPORTAL MUNICIPAL DE CRAÍBAS - ALAGOAS
**Sistema Integrado de Gestão Territorial, Meio Ambiente e Dados Espaciais**

Desenvolvido para apoio à gestão pública municipal, planejamento urbano, fiscalização ambiental, transparência e suporte a técnicos, engenheiros e cidadãos.

---

## 🚀 Como Abrir o Geoportal

Você pode abrir o Geoportal de duas formas muito simples:

1. **Opção 1 (Mais Rápida):** Dê um duplo-clique no arquivo `abrir_geoportal.bat`. Ele abrirá automaticamente o Geoportal no seu navegador de internet padrão (Microsoft Edge, Google Chrome, Firefox, etc.).
2. **Opção 2:** Dê um duplo-clique diretamente no arquivo `index.html`.

Não é necessária nenhuma instalação prévia de servidor, banco de dados ou dependência externa! O Geoportal roda de forma rápida e autônoma.

---

## 🗺️ 1. O Geoportal / Mapa Interativo (Tela Principal)
O sistema abre diretamente no **Geoportal Interativo**, enquadrado no território de Craíbas:

- **Camadas Organizadas por Tipologia de Mapa:**
  1. 🏛️ **Gestão Pública & Equipamentos Sociais:**
     - Sedes Administrativas, Secretarias, Fóruns, Cartórios e Prefeitura
     - Unidades Básicas de Saúde (UBS), Clínicas e Centro Médico
  2. 🗺️ **Divisão Territorial & Demografia:**
     - Limite Municipal Oficial de Craíbas (277,62 km²)
     - Setores Censitários do IBGE (mapa coroplético graduado por total de moradores e domicílios particulares)
  3. 🛣️ **Mobilidade & Sistema Viário:**
     - Rodovias Principais (AL-115, etc.)
     - Vias Alternativas e Acessos Vicinais
     - Faces de Logradouro (997 trechos da malha urbana com contagem de imóveis)
  4. 🏙️ **Planejamento Territorial & Zoneamento:**
     - Zoneamento Urbano (Centralidade, Estruturação Urbana 01 e 02, ZEIS, Expansão, AEUE)
     - Zoneamento Ambiental e Rural (AEIM - Mineração, ZARCT, ZAUOE, ZDE, ZPPA, ZRPA)
     - Zona de Proteção Ambiental (ZPA)
  5. ⛏️ **Recursos Minerais & Pedologia:**
     - Concessões e Substâncias Minerais (Cobre, Minério de Cobre, Areia, Calcário)
     - Pedologia / Classes de Solos (Latossolos, Planossolos, etc.)
  6. 💧 **Recursos Hídricos & Meio Ambiente:**
     - Bacias Hidrográficas (Rio Coruripe, Rio Traipu, Rio Itiúba, Rio Perucaba...)
     - Rede de Drenagem Hidrográfica (773 trechos de rios, riachos e córregos categorizados)

- **Mapas Rápidos de Gestão (Presets de 1 Clique):**
  - **Visão Geral:** Limites + Rodovias + Prédios Públicos + Saúde.
  - **Zoneamento:** Limites + Zoneamento Urbano + Zoneamento Rural + ZPA.
  - **Meio Ambiente:** Limites + Satélite Esri + Bacias + Rios + Mineração + Solos.
  - **Demografia Censo:** Limites + Setores Censitários por População + Logradouros.

- **Recursos Interativos no Mapa:**
  - **Alternador de Mapas Base:** Imagem de Satélite de Alta Resolução (Esri) e Cartografia de Relevo / Topografia (OpenTopoMap).
  - **Controle Individual de Opacidade:** Controle deslizante de 0% a 100% para cada camada.
  - **Ferramentas de Medição:** Régua de medição de distância (metros/km) e ferramenta de medição de área (m² e hectares).
  - **Busca Rápida de Feições:** Pesquisa em tempo real de nomes de ruas, UBS, prédios públicos e rios com aproximação automática.
  - **Tabela de Atributos Interativa:** Gaveta retrátil na base da tela que permite consultar todos os dados da camada selecionada com busca interna, zoom na feição clicada e **exportação em planilha CSV**.
  - **Legenda Dinâmica Automática:** Atualiza e exibe somente as convenções cartográficas das camadas que estiverem ligadas no momento.
  - **Geolocalização (GPS):** Botão para centralizar no ponto exato onde o usuário está localizado em campo.
  - **Impressão e Exportação:** Botão para impressão e geração de prancha em PDF/impressora.

---

## 📥 2. Central de Downloads & Catálogo de Documentos
Acesso rápido na barra superior para baixar arquivos originais:

- **Legislação & Decretos Ambientais (PDF):**
  - Lei Municipal nº 413/2017 (Código Municipal de Meio Ambiente de Craíbas)
  - Lei Municipal nº 413/2016 (Política Municipal de Proteção, Conservação e Recuperação do Meio Ambiente)
  - Lei Municipal nº 440/2018 (Alterações e adequações na legislação ambiental)
  - Decreto nº 62/2021 (Normas de licenciamento e procedimentos)
  - Decreto nº 64/2021 (Critérios técnicos de enquadramento)
  - Decreto nº 80/2024 (Convocação da 1ª Conferência Municipal do Meio Ambiente de Craíbas)

- **Mapas Temáticos Oficiais em Alta Resolução (PNG):**
  - Administração Pública, Instituições de Ensino, Unidades de Saúde, Total de Pessoas (Censo IBGE), Hidrografia, Hipsometria / Relevo MDE (13.5 MB), Mineração por Fase, Mineração por Substâncias e Pedologia (Solos).
  *Inclui visualizador interativo em tela cheia (Lightbox) com ferramentas de Zoom (+ / -) e Pan antes de baixar.*

- **Arquivos Georreferenciados para Softwares SIG (GeoJSON, GeoTIFF, QMD):**
  - Tabela com todas as 14 camadas vetoriais e raster no sistema **SIRGAS 2000 / WGS84**.
  - Download direto do arquivo vetorial (`.geojson` / `.tif`), dos metadados oficiais do QGIS (`.qmd`) e botão *"Ver no Mapa"*.

---

## 🏛️ Dados Geodésicos & Técnicos
- **Município:** Craíbas - AL (Código IBGE: 2702355)
- **Área Territorial:** 277,62 km²
- **População:** 25.397 habitantes (Censo IBGE)
- **Datum Oficial:** SIRGAS 2000 (EPSG: 4674) / WGS84 (EPSG: 4326)
- **Fontes Oficiais:** Prefeitura Municipal de Craíbas, IBGE, SEMARH-AL, ANM e CPRM / Serviço Geológico do Brasil.

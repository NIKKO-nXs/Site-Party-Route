// Executa somente após o DOM estar totalmente carregado
document.addEventListener('DOMContentLoaded', function () {

  // ----- Mapa base -----
  var map = L.map('map').setView([-23.55, -46.63], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // ----- Locais iniciais -----
  const locais = [
    { nome: "Bar Alegria", coords: [-23.56, -46.65] },
    { nome: "Restaurante Sabor", coords: [-23.55, -46.62] },
    { nome: "Hotel Conforto", coords: [-23.54, -46.61] },
    { nome: "Motel Lua", coords: [-23.57, -46.64] },
    { nome: "Pizzaria Bella", coords: [-23.53, -46.60] }  
    
  ];

  // Adiciona marcadores no mapa
  locais.forEach(local => {
    L.marker(local.coords).addTo(map).bindPopup(local.nome);
  });

  // ----- Variáveis globais -----
  let routeControl = null;
  let summaryDiv = null;

  // ----- Cria a UI flutuante -----
  function createRoutingUI() {
    const container = document.createElement('div');
    container.id = 'routing-ui';
    container.style.maxWidth = '520px';
    container.style.margin = '12px auto';
    container.style.background = 'white';
    container.style.padding = '10px';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    container.style.fontFamily = 'sans-serif';
    container.style.fontSize = '14px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';

    const title = document.createElement('div');
    title.textContent = 'Criar rota';
    title.style.fontWeight = '700';
    title.style.marginBottom = '2px';
    container.appendChild(title);

    const selectsWrap = document.createElement('div');
    selectsWrap.style.display = 'flex';
    selectsWrap.style.gap = '8px';
    selectsWrap.style.alignItems = 'center';

    const startSelect = document.createElement('select');
    startSelect.id = 'startSelect';
    startSelect.style.flex = '1';

    const endSelect = document.createElement('select');
    endSelect.id = 'endSelect';
    endSelect.style.flex = '1';

    // Preenche selects
    locais.forEach((loc, idx) => {
      const opt1 = document.createElement('option');
      opt1.value = idx;
      opt1.textContent = loc.nome;
      startSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = idx;
      opt2.textContent = loc.nome;
      endSelect.appendChild(opt2);
    });

    selectsWrap.appendChild(startSelect);
    selectsWrap.appendChild(endSelect);
    container.appendChild(selectsWrap);

    const controlsRow = document.createElement('div');
    controlsRow.style.display = 'flex';
    controlsRow.style.gap = '8px';
    controlsRow.style.justifyContent = 'center';

    const btnRoute = document.createElement('button');
    btnRoute.textContent = 'Fazer rota';
    btnRoute.id = 'btnRoute';
    btnRoute.style.padding = '8px 12px';
    btnRoute.style.cursor = 'pointer';

    const btnClear = document.createElement('button');
    btnClear.textContent = 'Limpar';
    btnClear.id = 'btnClear';
    btnClear.style.padding = '8px 12px';
    btnClear.style.cursor = 'pointer';

    controlsRow.appendChild(btnRoute);
    controlsRow.appendChild(btnClear);
    container.appendChild(controlsRow);

    // Insere o painel logo após o mapa
    const mapEl = document.getElementById('map');
    if (mapEl && mapEl.parentNode) {
      mapEl.parentNode.insertBefore(container, mapEl.nextSibling);
    } else {
      document.body.appendChild(container);
    }

    // Eventos dos botões
    btnRoute.addEventListener('click', () => {
      const s = parseInt(startSelect.value, 10);
      const e = parseInt(endSelect.value, 10);
      if (isNaN(s) || isNaN(e)) {
        alert('Selecione início e destino.');
        return;
      }
      if (s === e) {
        alert('Escolha pontos diferentes para início e destino.');
        return;
      }
      const start = locais[s].coords;
      const end = locais[e].coords;
      makeRoute(start, end);
    });

    btnClear.addEventListener('click', clearRoute);
  }

  // ----- Criação da rota -----
  function makeRoute(startCoords, endCoords) {
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }

    routeControl = L.Routing.control({
      waypoints: [
        L.latLng(startCoords[0], startCoords[1]),
        L.latLng(endCoords[0], endCoords[1])
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      showAlternatives: false,
      fitSelectedRoute: true,
      routeWhileDragging: true,
      createMarker: function(i, wp, n) {
        const marker = L.marker(wp.latLng, { draggable: true });
        marker.bindPopup(i === 0 ? 'Início' : (i === n - 1 ? 'Destino' : 'Ponto'));
        return marker;
      },
      lineOptions: {
        styles: [{ color: '#007bff', opacity: 0.8, weight: 6 }]
      }
    }).addTo(map);

    routeControl.on('routesfound', function(e) {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const summary = routes[0].summary;
        const distKm = (summary.totalDistance / 1000).toFixed(2);
        const mins = Math.round(summary.totalTime / 60);
        showRouteSummary(`${distKm} km — ${mins} min`);
      }
    });

    routeControl.on('routingerror', function(err) {
      console.error('Routing error:', err);
      alert('Erro ao calcular rota. Tente outro par de pontos.');
    });
  }

  // ----- Mostra resumo -----
  function showRouteSummary(text) {
    if (summaryDiv) {
      summaryDiv.textContent = text;
      return;
    }

    summaryDiv = document.createElement('div');
    summaryDiv.id = 'route-summary';
    summaryDiv.style.maxWidth = '520px';
    summaryDiv.style.margin = '6px auto';
    summaryDiv.style.background = 'rgba(255,255,255,0.95)';
    summaryDiv.style.padding = '8px 12px';
    summaryDiv.style.borderRadius = '8px';
    summaryDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)';
    summaryDiv.style.fontFamily = 'sans-serif';
    summaryDiv.style.fontSize = '13px';
    summaryDiv.style.textAlign = 'center';

    const ui = document.getElementById('routing-ui');
    if (ui && ui.parentNode) {
      ui.parentNode.insertBefore(summaryDiv, ui.nextSibling);
    } else {
      document.body.appendChild(summaryDiv);
    }
    summaryDiv.textContent = text;
  }

  // ----- Limpa rota -----
  function clearRoute() {
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }
    if (summaryDiv) {
      summaryDiv.remove();
      summaryDiv = null;
    }
  }

  // ----- Inicializa tudo -----
  createRoutingUI();

  // ----- Geocoding opcional -----
  if (typeof L.Control.Geocoder !== 'undefined') {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false
    })
    .on('markgeocode', function(e) {
      const latlng = e.geocode.center;
      L.marker(latlng).addTo(map).bindPopup(e.geocode.name || '').openPopup();
      map.setView(latlng, 16);
    })
    .addTo(map);
  }

});

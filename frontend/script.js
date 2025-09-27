var map = L.map('map').setView([-23.55, -46.63], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const locais = [
  { nome: "Bar Alegria", coords: [-23.56, -46.65] },
  { nome: "Restaurante Sabor", coords: [-23.55, -46.62] },
  { nome: "Hotel Conforto", coords: [-23.54, -46.61] },
  { nome: "Motel Lua", coords: [-23.57, -46.64] }
];

locais.forEach(local => {
  L.marker(local.coords).addTo(map).bindPopup(local.nome);
});
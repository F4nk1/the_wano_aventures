// Board tiles - 40 tiles of the Monopolio Peruano
// Positions and layout remain exactly the same as original

const BOARD_TILES = [
  // LADO INFERIOR (De Derecha a Izquierda, y = 900)
  { id: 0, name: "PARADERO INICIAL", type: "go", x: 900, y: 900, next: [1], description: "Cobra S/. 200 de sueldo minimo al pasar." },
  { id: 1, name: "Cerro El Pino", type: "property", group: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], housePrice: 50, mortgageValue: 30, x: 820, y: 900, next: [2] },
  { id: 2, name: "Bono Yanapay", type: "chest", x: 740, y: 900, next: [3] },
  { id: 3, name: "Huaycan", type: "property", group: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], housePrice: 50, mortgageValue: 30, x: 660, y: 900, next: [4] },
  { id: 4, name: "Impuesto a la SUNAT", type: "tax", cost: 200, x: 580, y: 900, next: [5], description: "Paga S/. 200 de impuesto de renta." },
  { id: 5, name: "El Metropolitano", type: "railroad", group: "transport", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, x: 500, y: 900, next: [6] },
  { id: 6, name: "La Parada", type: "property", group: "cyan", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, mortgageValue: 50, x: 420, y: 900, next: [7] },
  { id: 7, name: "Ampay de Magaly", type: "chance", x: 340, y: 900, next: [8] },
  { id: 8, name: "Polvos Azules", type: "property", group: "cyan", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, mortgageValue: 50, x: 260, y: 900, next: [9] },
  { id: 9, name: "Las Malvinas", type: "property", group: "cyan", price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50, mortgageValue: 60, x: 180, y: 900, next: [10] },

  // ESQUINA INFERIOR IZQUIERDA (x = 100, y = 900)
  { id: 10, name: "Comisaria", type: "jail", x: 100, y: 900, next: [11], description: "Comisaria de detencion y visitas." },

  // LADO IZQUIERDO (De Abajo hacia Arriba, x = 100)
  { id: 11, name: "Av. Petit Thouars", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, mortgageValue: 70, x: 100, y: 820, next: [12] },
  { id: 12, name: "Luz del Sur", type: "utility", group: "utility", price: 150, mortgageValue: 75, x: 100, y: 740, next: [13] },
  { id: 13, name: "Lince", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, mortgageValue: 70, x: 100, y: 660, next: [14] },
  { id: 14, name: "Av. Arequipa", type: "property", group: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100, mortgageValue: 80, x: 100, y: 580, next: [15] },
  { id: 15, name: "Linea 1 del Metro", type: "railroad", group: "transport", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, x: 100, y: 500, next: [16] },
  { id: 16, name: "Gamarra", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, mortgageValue: 90, x: 100, y: 420, next: [17] },
  { id: 17, name: "Bono Yanapay", type: "chest", x: 100, y: 340, next: [18] },
  { id: 18, name: "Mercado Central", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, mortgageValue: 90, x: 100, y: 260, next: [19] },
  { id: 19, name: "Mesa Redonda", type: "property", group: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100, mortgageValue: 100, x: 100, y: 180, next: [20] },

  // ESQUINA SUPERIOR IZQUIERDA (x = 100, y = 100)
  { id: 20, name: "Pollada Bailable", type: "parking", x: 100, y: 100, next: [21], description: "Descanso gratis con tus amigos." },

  // LADO SUPERIOR (De Izquierda a Derecha, y = 100)
  { id: 21, name: "Plaza San Martin", type: "property", group: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150, mortgageValue: 110, x: 180, y: 100, next: [22] },
  { id: 22, name: "Ampay de Magaly", type: "chance", x: 260, y: 100, next: [23] },
  { id: 23, name: "El Huaralino", type: "property", group: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150, mortgageValue: 110, x: 340, y: 100, next: [24] },
  { id: 24, name: "Centro Civico", type: "property", group: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 150, mortgageValue: 120, x: 420, y: 100, next: [25] },
  { id: 25, name: "Combi Chama", type: "railroad", group: "transport", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, x: 500, y: 100, next: [26] },
  { id: 26, name: "Costa Verde", type: "property", group: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, mortgageValue: 130, x: 580, y: 100, next: [27] },
  { id: 27, name: "Barranco", type: "property", group: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, mortgageValue: 130, x: 660, y: 100, next: [28] },
  { id: 28, name: "SEDAPAL", type: "utility", group: "utility", price: 150, mortgageValue: 75, x: 740, y: 100, next: [29] },
  { id: 29, name: "Larcomar", type: "property", group: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150, mortgageValue: 140, x: 820, y: 100, next: [30] },

  // ESQUINA SUPERIOR DERECHA (x = 900, y = 100)
  { id: 30, name: "AL CALABOZO", type: "go-to-jail", x: 900, y: 100, next: [31], description: "Te detiene el Serenazgo y vas a la comisaria." },

  // LADO DERECHO (De Arriba hacia Abajo, x = 900)
  { id: 31, name: "Av. Avelino Caceres", type: "property", group: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, mortgageValue: 150, x: 900, y: 180, next: [32] },
  { id: 32, name: "Jiron de la Union", type: "property", group: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, mortgageValue: 150, x: 900, y: 260, next: [33] },
  { id: 33, name: "Bono Yanapay", type: "chest", x: 900, y: 340, next: [34] },
  { id: 34, name: "San Isidro", type: "property", group: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], housePrice: 200, mortgageValue: 160, x: 900, y: 420, next: [35] },
  { id: 35, name: "Mototaxi", type: "railroad", group: "transport", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100, x: 900, y: 500, next: [36] },
  { id: 36, name: "Ampay de Magaly", type: "chance", x: 900, y: 580, next: [37] },
  { id: 37, name: "Las Cucardas", type: "property", group: "blue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], housePrice: 200, mortgageValue: 175, x: 900, y: 660, next: [38] },
  { id: 38, name: "Arbitrios Municipales", type: "tax", cost: 100, x: 900, y: 740, next: [39], description: "Paga S/. 100 de arbitrios." },
  { id: 39, name: "Residencial San Felipe", type: "property", group: "blue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], housePrice: 200, mortgageValue: 200, x: 900, y: 820, next: [0] }
];

module.exports = { BOARD_TILES };

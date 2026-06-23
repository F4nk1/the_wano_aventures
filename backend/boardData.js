const BOARD_TILES = [
  { id: 0, name: "PARADERO INICIAL (SALIDA)", type: "go", description: "Cobra 200 soles al pasar por aquí." },
  { id: 1, name: "Cerro El Pino", type: "property", group: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], housePrice: 50, mortgageValue: 30 },
  { id: 2, name: "Bono Yanapay (Caja)", type: "chest" },
  { id: 3, name: "Huaycán", type: "property", group: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], housePrice: 50, mortgageValue: 30 },
  { id: 4, name: "Impuesto a la SUNAT", type: "tax", cost: 200, description: "Paga 200 soles de multa/impuesto." },
  { id: 5, name: "El Metropolitano", type: "railroad", group: "transport", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  { id: 6, name: "La Parada", type: "property", group: "cyan", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, mortgageValue: 50 },
  { id: 7, name: "Ampay de Magaly (Suerte)", type: "chance" },
  { id: 8, name: "Polvos Azules", type: "property", group: "cyan", price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50, mortgageValue: 50 },
  { id: 9, name: "Las Malvinas", type: "property", group: "cyan", price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50, mortgageValue: 60 },
  { id: 10, name: "Comisaría (De Visita)", type: "jail" },
  { id: 11, name: "Av. Petit Thouars", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, mortgageValue: 70 },
  { id: 12, name: "Luz del Sur (ENEL)", type: "utility", group: "utility", price: 150, mortgageValue: 75 },
  { id: 13, name: "Lince", type: "property", group: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100, mortgageValue: 70 },
  { id: 14, name: "Av. Arequipa", type: "property", group: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100, mortgageValue: 80 },
  { id: 15, name: "Línea 1 del Metro", type: "railroad", group: "transport", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  { id: 16, name: "Gamarra", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, mortgageValue: 90 },
  { id: 17, name: "Bono Yanapay (Caja)", type: "chest" },
  { id: 18, name: "Mercado Central", type: "property", group: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100, mortgageValue: 90 },
  { id: 19, name: "Mesa Redonda", type: "property", group: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100, mortgageValue: 100 },
  { id: 20, name: "Pollada Bailable (Parada)", type: "parking", description: "Descanso gratis y chelas con tus amigos." },
  { id: 21, name: "Plaza San Martín", type: "property", group: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150, mortgageValue: 110 },
  { id: 22, name: "Ampay de Magaly (Suerte)", type: "chance" },
  { id: 23, name: "El Huaralino", type: "property", group: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150, mortgageValue: 110 },
  { id: 24, name: "Centro Cívico", type: "property", group: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 150, mortgageValue: 120 },
  { id: 25, name: "Combi Asesina (Chama)", type: "railroad", group: "transport", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  { id: 26, name: "Costa Verde", type: "property", group: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, mortgageValue: 130 },
  { id: 27, name: "Barranco (Bajada de Baños)", type: "property", group: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150, mortgageValue: 130 },
  { id: 28, name: "SEDAPAL", type: "utility", group: "utility", price: 150, mortgageValue: 75 },
  { id: 29, name: "Larcomar", type: "property", group: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150, mortgageValue: 140 },
  { id: 30, name: "¡CHAPA TU CHORO! (Al Calabozo)", type: "go-to-jail", description: "Te cayó el Serenazgo. Vas directo a la comisaría." },
  { id: 31, name: "Av. Avelino Cáceres", type: "property", group: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, mortgageValue: 150 },
  { id: 32, name: "Jirón de la Unión", type: "property", group: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200, mortgageValue: 150 },
  { id: 33, name: "Bono Yanapay (Caja)", type: "chest" },
  { id: 34, name: "San Isidro (Las Begonias)", type: "property", group: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], housePrice: 200, mortgageValue: 160 },
  { id: 35, name: "Mototaxi Chapa Tu Chamba", type: "railroad", group: "transport", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
  { id: 36, name: "Ampay de Magaly (Suerte)", type: "chance" },
  { id: 37, name: "Las Cucardas", type: "property", group: "blue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], housePrice: 200, mortgageValue: 175 },
  { id: 38, name: "Cobro de Arbitrios/Serenazgo", type: "tax", cost: 100, description: "Paga 100 soles de arbitrios a la municipalidad." },
  { id: 39, name: "Residencial San Felipe", type: "property", group: "blue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], housePrice: 200, mortgageValue: 200 }
];

const CHANCE_CARDS = [
  { text: "¡Ampay de Magaly! Salías con otra que no era tu firme. Paga 50 soles para silenciar a los urracos.", action: "pay", value: 50 },
  { text: "Bono Alimentario del Gobierno. Cobras 100 soles.", action: "receive", value: 100 },
  { text: "Esquivaste un bache en la Av. Javier Prado sin reventar llanta. Avanzas al Paradero Inicial.", action: "go-to-tile", value: 0 },
  { text: "Te robó un choro pero lo alcanzaron los vecinos: ¡Chapa tu choro! Vas directo a la comisaría sin cobrar nada.", action: "go-to-jail" },
  { text: "Hiciste taxi de noche y te fue bien. Recibes 150 soles.", action: "receive", value: 150 },
  { text: "Te subió el pasaje el cobrador de la combi por feriado. Paga 20 soles.", action: "pay", value: 20 },
  { text: "Tu tía te mandó una encomienda desde provincia. Recibes 50 soles.", action: "receive", value: 50 },
  { text: "Pasaste por el peaje de Línea Amarilla. Paga 30 soles.", action: "pay", value: 30 }
];

const CHEST_CARDS = [
  { text: "Ganaste la Tinka (o al menos un raspadito). Recibes 200 soles.", action: "receive", value: 200 },
  { text: "Es hora de pagar el recibo de Sedapal y Enel. Paga 80 soles.", action: "pay", value: 80 },
  { text: "Hiciste una pollada bailable pro-fondos y se llenó tu patio. Recibes 150 soles.", action: "receive", value: 150 },
  { text: "Compraste comida en la carretilla y te dio infección estomacal. Paga 50 soles de consulta médica.", action: "pay", value: 50 },
  { text: "Devolución de impuestos de la SUNAT (¡Milagro!). Recibes 100 soles.", action: "receive", value: 100 },
  { text: "Paga los arbitrios de tu lote. Paga 100 soles.", action: "pay", value: 100 },
  { text: "Es tu cumpleaños y tus causas te hacen una chancha. Recibes 100 soles.", action: "receive", value: 100 }
];

module.exports = {
  BOARD_TILES,
  CHANCE_CARDS,
  CHEST_CARDS
};

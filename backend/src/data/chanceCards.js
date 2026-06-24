// Expanded Chance Cards - 22 cards with new action types
// Peruvian chicha theme, no emojis

const CHANCE_CARDS = [
  { text: "Ampay de Magaly! Pagas S/. 50 para silenciar a los urracos.", action: "pay", value: 50 },
  { text: "Bono Alimentario del Gobierno. Cobras S/. 100.", action: "receive", value: 100 },
  { text: "Esquivaste un bache en la Av. Javier Prado. Avanzas al Paradero Inicial.", action: "go-to-tile", value: 0 },
  { text: "El Serenazgo te detiene. Vas a la comisaria.", action: "go-to-jail" },
  { text: "Hiciste taxi de noche y te fue bien. Recibes S/. 150.", action: "receive", value: 150 },
  { text: "Pasaje subio por feriado. Paga S/. 20.", action: "pay", value: 20 },
  { text: "Tu tia te mando encomienda de provincia. Recibes S/. 50.", action: "receive", value: 50 },
  { text: "Peaje de Linea Amarilla. Paga S/. 30.", action: "pay", value: 30 },
  { text: "Tu anticucho se hizo viral en TikTok. Cada jugador te paga S/. 25.", action: "receive-all", value: 25 },
  { text: "Operativo municipal. Pagas S/. 25 a cada jugador por solidaridad.", action: "pay-all", value: 25 },
  { text: "Retrocede 3 calles por desvio de obras.", action: "move-back", value: 3 },
  { text: "Tu compadre del juzgado te dio un salvoconducto. Tarjeta libre de comisaria.", action: "free-jail-card" },
  { text: "Le robaste el ceviche al vecino en la pollada. Robas S/. 75 a un rival.", action: "steal", value: 75 },
  { text: "La municipalidad te cobra por mejoras de pistas. Paga S/. 25 por estera y S/. 100 por hotel.", action: "repair", value: { perHouse: 25, perHotel: 100 } },
  { text: "Sube al Metropolitano mas cercano. Si es de alguien, paga doble.", action: "nearest-railroad" },
  { text: "Necesitas agua urgente. Ve al servicio publico mas cercano.", action: "nearest-utility" },
  { text: "Es tu cumple y tus causas cooperan. Cada jugador te da S/. 10.", action: "birthday", value: 10 },
  { text: "Ganaste sorteo de la bodega. Avanza a Costa Verde.", action: "go-to-tile", value: 26 },
  { text: "Te multaron por botar basura. Paga S/. 40.", action: "pay", value: 40 },
  { text: "Venta de garage exitosa. Cobras S/. 200.", action: "receive", value: 200 },
  { text: "Choque de combis en la Panamericana. Retrocede 2 casillas.", action: "move-back", value: 2 },
  { text: "Tu prima vende ropa americana y te da comision. Recibes S/. 60.", action: "receive", value: 60 }
];

module.exports = { CHANCE_CARDS };

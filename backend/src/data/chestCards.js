// Expanded Chest Cards - 18 cards with new action types
// Peruvian chicha theme, no emojis

const CHEST_CARDS = [
  { text: "Ganaste la Tinka en raspadito. Recibes S/. 200.", action: "receive", value: 200 },
  { text: "Recibo de Sedapal. Paga S/. 80.", action: "pay", value: 80 },
  { text: "Pollada bailable pro-fondos. Recibes S/. 150.", action: "receive", value: 150 },
  { text: "Comida de carretilla te dio infeccion. Paga S/. 50.", action: "pay", value: 50 },
  { text: "Devolucion de impuestos SUNAT. Recibes S/. 100.", action: "receive", value: 100 },
  { text: "Arbitrios de tu lote. Paga S/. 100.", action: "pay", value: 100 },
  { text: "Cumple y tus causas hacen chancha. Recibes S/. 100.", action: "receive", value: 100 },
  { text: "Herencia de tu abuelita de Huancayo. Recibes S/. 250.", action: "receive", value: 250 },
  { text: "Error bancario a tu favor. Cobras S/. 75.", action: "receive", value: 75 },
  { text: "Multa por no votar en elecciones. Paga S/. 30.", action: "pay", value: 30 },
  { text: "Salvoconducto de la comisaria. Tarjeta libre.", action: "free-jail-card" },
  { text: "Reparacion de fachada obligatoria. Paga S/. 40 por estera y S/. 115 por hotel.", action: "repair", value: { perHouse: 40, perHotel: 115 } },
  { text: "Segundo puesto en concurso de marinera. Recibes S/. 50.", action: "receive", value: 50 },
  { text: "Colegiatura adelantada. Paga S/. 150.", action: "pay", value: 150 },
  { text: "Vendiste chicharron en el parque. Recibes S/. 80.", action: "receive", value: 80 },
  { text: "Gol de Peru en eliminatorias. La fiesta te costo S/. 60.", action: "pay", value: 60 },
  { text: "Ganaste concurso de salsa. Cobras S/. 120.", action: "receive", value: 120 },
  { text: "Se te rompio la tuberia. Paga S/. 70 de plomero.", action: "pay", value: 70 }
];

module.exports = { CHEST_CARDS };

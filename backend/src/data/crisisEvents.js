// Expanded Crisis Events - 12 events
// National crisis events that affect the entire game

const CRISIS_EVENTS = [
  { name: "Inflacion del Dolar", text: "El alquiler de todas las propiedades se duplica por los proximos turnos.", type: "inflation" },
  { name: "Fenomeno del Nino", text: "Lluvias intensas destruyen calaminas. Se destruye 1 estera al azar en 3 propiedades distintas.", type: "destruction" },
  { name: "Paro de Transportistas", text: "Huelga nacional. Los paraderos de combi y metropolitano quedan bloqueados; nadie cobra alquiler en ellos.", type: "transport_strike" },
  { name: "Redada Municipal", text: "Control de identidad por el Serenazgo. Todos los jugadores que esten en zonas baratas (marron o celeste) van a la comisaria.", type: "raid" },
  { name: "Terremoto en Lima", text: "Sismo fuerte en la capital. Se destruye 1 estera en cada propiedad mejorada (maximo 5 propiedades).", type: "earthquake" },
  { name: "Elecciones Generales", text: "Dia de elecciones obligatorias. Cada jugador paga S/. 50 por gastos electorales.", type: "elections" },
  { name: "Pandemia Nacional", text: "Emergencia sanitaria. El alquiler se reduce a la mitad por los proximos turnos.", type: "pandemic" },
  { name: "Copa America en Lima", text: "Fiebre deportiva en la ciudad. Las propiedades amarillas y rojas cobran triple de alquiler.", type: "copa" },
  { name: "Corte de Agua Masivo", text: "SEDAPAL corta el servicio. Los servicios publicos no cobran alquiler.", type: "water_cut" },
  { name: "Boom del Bitcoin", text: "Fiebre de criptomonedas. Todos los jugadores reciben S/. 100 por sus inversiones.", type: "crypto_boom" },
  { name: "Huelga de Maestros", text: "Profesores en huelga nacional. Jugadores en propiedades rosadas pagan S/. 30 extra.", type: "teacher_strike" },
  { name: "Festival de la Cancion Criolla", text: "Fiesta nacional con musica criolla. Cada jugador recibe S/. 50 de celebracion.", type: "festival" }
];

module.exports = { CRISIS_EVENTS };

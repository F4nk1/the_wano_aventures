# Monopolio Peruano Random 🇵🇪 (Chicha Edition)

¡Bienvenido! Este es un juego de Monopoly online y en tiempo real diseñado especialmente para jugar con tus amigos desde tu propio ordenador como servidor.

Esta versión cuenta con una temática 100% peruana chicha y random, adaptada con memes locales, distritos icónicos, cartas divertidas de suerte/caja comunal, y construcciones al puro estilo autoconstrucción.

---

## 🚀 Cómo Iniciar el Juego (Producción Rápida)

Para jugar de inmediato de forma unificada (el backend sirve tanto el API como la interfaz web en el puerto `4000`):

1. **Ejecuta el script de inicio unificado**:
   ```bash
   ./start.sh
   ```
2. **Entra a la interfaz**:
   Abre tu navegador en [http://localhost:4000](http://localhost:4000).

---

## 🌐 Cómo Jugar con Amigos Online (Cloudflare Tunnel)

Para que tus amigos puedan conectarse a tu ordenador sin necesidad de configurar redirección de puertos (Port Forwarding) ni exponer tu IP pública:

1. **Instala Cloudflare Tunnel (cloudflared)**:
   * **Arch Linux**:
     ```bash
     sudo pacman -S cloudflared
     ```
   * **Linux/Ubuntu/Debian**:
     ```bash
     curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb && dpkg -i cloudflared.deb
     ```
   * **macOS / Windows**: Descarga desde la web oficial de Cloudflare.

2. **Expon tu puerto local**:
   Con el servidor corriendo (`./start.sh`), abre otra terminal y ejecuta:
   ```bash
   cloudflared tunnel --url http://localhost:4000
   ```

3. **Comparte el enlace**:
   Cloudflare te dará una dirección pública segura del tipo `https://xxxx-xxxx-xxxx.trycloudflare.com`.
   * **¡Listo!** Pásale ese enlace a tus amigos. Ellos podrán conectarse e iniciar sesión desde sus casas sin configurar nada.

---

## 💻 Desarrollo (Hot Reloading)

Si deseas modificar el código o desarrollar nuevas funcionalidades de manera cómoda:

### 1. Iniciar Backend (Modo Desarrollo)
```bash
cd backend
npm run dev
```
* El servidor corre en [http://localhost:4000](http://localhost:4000) y se reinicia automáticamente con cada cambio.

### 2. Iniciar Frontend (Modo Desarrollo)
```bash
cd frontend
npm run dev
```
* Corre en [http://localhost:5173](http://localhost:5173) (o el puerto que te indique la consola) con recarga rápida de React y Tailwind CSS v4.

---

## 🎲 Características del Monopolio Chicha

* **Inicio (Go)**: "Paradero Inicial" (Cobras tus 200 soles de sueldo mínimo).
* **Cárcel (Jail)**: "Comisaría" (Detenido por el Serenazgo o por chapa tu choro).
* **Parada Libre (Free Parking)**: "Pollada Bailable" (Chelas gratis y música).
* **Construcciones**: Esteras / calamina para casas y edificios sin tarrajear de 5 pisos para los hoteles.
* **Propiedades**: Cerro El Pino, Gamarra, Polvos Azules, Lince, Larcomar, El Huaralino y hasta Las Cucardas.
* **Transportes y Servicios**: El Metropolitano, Línea 1, Combi Asesina (Chama), Sedapal y Enel.
* **Cartas Random**: Ampays de Magaly, multas de la SUNAT, cobros de pasaje escolar, bonos del gobierno y baches evadidos.
* **Sistema de Cuentas Sencillo**: Login simple sin correos (contraseñas hasheadas de forma segura con `bcryptjs` en la base de datos local SQLite).
* **Partidas Guardadas**: Guarda el estado del juego con un click para continuar otro día usando el código de sala.

# Ghid de utilizare pe Termux

Această bibliotecă WhatsApp Web Core a fost special adaptată pentru a funcționa pe Termux și alte medii restrictive, înlocuind dependențele native cu implementări pure JavaScript.

## Instalare pe Termux

1. Actualizați Termux:
```bash
pkg update
pkg upgrade
```

2. Instalați Node.js și dependențele:
```bash
pkg install nodejs
pkg install git
```

3. Instalați biblioteca WhatsApp Web Core:
```bash
npm install @gyovannyvpn123/whatsapp-core
```

## Rezolvarea problemelor comune în Termux

### Problema curve25519-n (rezolvată)

Biblioteca originală WhatsApp Web folosește pachetul `curve25519-n` care necesită compilare nativă cu Android NDK. Această versiune a bibliotecii înlocuiește `curve25519-n` cu `tweetnacl`, o implementare pură JavaScript care nu necesită compilare nativă.

### Optimizări pentru Termux

1. **Opțiuni browser optimizate**: Argumentele browser-ului sunt configurate special pentru a funcționa pe Termux
2. **Detectare automată a mediului**: Biblioteca detectează automat când rulează în Termux și ajustează configurația
3. **Gestionare memorie îmbunătățită**: Optimizări pentru a funcționa pe dispozitive cu resurse limitate

## Exemplu de utilizare pe Termux

Creați un fișier `test-whatsapp.js` cu următorul conținut:

```javascript
const { createClient } = require('@gyovannyvpn123/whatsapp-core');
const qrcode = require('qrcode-terminal');

// Creați clientul WhatsApp
const client = createClient({
  sessionId: 'termux-session',
  debug: true
});

// Ascultați evenimentul QR
client.on('qr', (qrData) => {
  console.log('Scanează acest cod QR cu WhatsApp de pe telefonul tău:');
  qrcode.generate(qrData, { small: true });
});

// Ascultați evenimentul de autentificare
client.on('authenticated', () => {
  console.log('Autentificare reușită!');
});

// Ascultați evenimentul ready
client.on('ready', () => {
  console.log('Client gata! Poți trimite și primi mesaje acum.');
});

// Ascultați mesajele primite
client.on('message', (message) => {
  console.log(`Mesaj primit de la ${message.from}: ${message.body}`);
  
  // Răspundeți automat la mesaje
  if (!message.fromMe) {
    client.reply(message, 'Am primit mesajul tău!');
  }
});

// Inițializați clientul
client.initialize()
  .catch(error => {
    console.error('Eroare la inițializare:', error);
  });
```

Rulați cu:
```bash
node test-whatsapp.js
```

## Sfaturi pentru performanță în Termux

1. **Sesiuni persistente**: Folosiți mereu același ID de sesiune pentru reconectare rapidă
2. **Limitați funcționalitățile**: Activați doar ce aveți nevoie pentru a economisi resurse
3. **Verificați memoria**: Folosiți `free -h` pentru a monitoriza memoria disponibilă
4. **Restartare automată**: Configurați un script de restart în caz de erori

## Depanare

1. **Eroare "Cannot find module"**: Verificați calea de instalare și reinstalați dacă este necesar
2. **Memoria insuficientă**: Măriți memoria swap în Termux sau reduceți numărul de funcționalități active
3. **Probleme de conexiune**: Verificați conexiunea la internet și permisiunile Termux
4. **Codul QR nu apare**: Asigurați-vă că aveți instalat `qrcode-terminal` și că terminalul suportă afișarea ASCII

## Compatibilitate

Această bibliotecă a fost testată și confirmată că funcționează pe:
- Termux pe Android 7+
- Node.js 16+
- Diferite distribuții Linux
- macOS și Windows
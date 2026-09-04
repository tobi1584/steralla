<div align="center">
  <img src="assets/icon.png" alt="Steralla" width="120" />

# Steralla

**Mapa celeste en tiempo real con realidad aumentada para dispositivos móviles.**

Steralla utiliza la cámara, la ubicación y los sensores del dispositivo para mostrar la posición del Sol, la Luna y los planetas según hacia dónde estés apuntando con el teléfono.

</div>

## ✨ Características

- Visualización de cuerpos celestes sobre la imagen de la cámara.
- Posición astronómica calculada en tiempo real según la ubicación del usuario.
- Seguimiento de la orientación del dispositivo mediante sensores de movimiento y magnetómetro.
- Compatibilidad con orientación vertical y horizontal.
- Calibración del magnetómetro para mejorar la precisión del apuntado.
- Actualización periódica de las efemérides astronómicas.
- Información de estado de GPS, sensores, cámara y orientación.

Actualmente se muestran:

- Sol
- Luna
- Mercurio
- Venus
- Marte
- Júpiter
- Saturno
- Urano
- Neptuno

## 🛠️ Tecnologías

- **React Native**
- **Expo**
- **JavaScript**
- **Astronomy Engine** para los cálculos astronómicos
- **expo-location** para ubicación GPS y rumbo
- **expo-sensors** para movimiento y magnetómetro
- **expo-camera** para la vista de realidad aumentada

## 📱 Funcionamiento

Steralla obtiene la ubicación del dispositivo y calcula el azimut y la altitud de los distintos cuerpos celestes.

Al mismo tiempo, utiliza los sensores del teléfono para determinar hacia dónde está apuntando el usuario. Con ambos datos, proyecta los cuerpos celestes sobre la vista de la cámara en su posición correspondiente.

El objetivo es que puedas mover el teléfono por el cielo y localizar visualmente planetas, el Sol y la Luna en tiempo real.

### Requisitos

- Node.js
- npm
- Expo
- Un dispositivo Android o iOS con cámara, GPS, magnetómetro y sensores de movimiento

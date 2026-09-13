<div align="center">
  <img src="assets/icon.png" alt="Icono de Steralla" width="120" />

# Steralla

**Mapa celeste en tiempo real con realidad aumentada para dispositivos móviles.**

Steralla combina la cámara, la ubicación y los sensores del dispositivo para
mostrar dónde se encuentran planetas, constelaciones y otros objetos celestes
según la dirección hacia la que apunta el teléfono.

</div>

## Descripción

La aplicación calcula la posición aparente de los objetos celestes para la
ubicación y hora actuales del usuario. Después transforma esas coordenadas en
una proyección sobre la cámara utilizando la orientación del dispositivo.

El resultado es una experiencia de exploración en la que se puede recorrer el
cielo, identificar objetos visibles y seleccionar un destino para que Steralla
indique en qué dirección encontrarlo.

## Características

- Posición astronómica calculada en tiempo real a partir de la ubicación del
  usuario.
- Marcadores superpuestos sobre la imagen de la cámara.
- Seguimiento de la orientación mediante sensores de movimiento, magnetómetro
  y rumbo del dispositivo.
- Guía direccional para localizar objetos que están fuera del encuadre.
- Línea e indicador del horizonte.
- Compatibilidad con orientación vertical y horizontal.
- Calibración de la brújula y ajuste manual del campo de visión y los desfases
  de la proyección.
- Fase actual y porcentaje iluminado de la Luna.
- Información del estado de la cámara, GPS, sensores y efemérides.
- Frecuencias de actualización adaptadas por plataforma para mantener fluida la
  interfaz.

### Objetos incluidos

- El Sol y la Luna.
- Mercurio, Venus, Marte, Júpiter, Saturno, Urano y Neptuno.
- La Estrella Polar.
- 18 constelaciones: Osa Mayor, Osa Menor, Orión, Casiopea, Can Mayor, Cruz del
  Sur y las 12 constelaciones zodiacales.
- La Galaxia de Andrómeda (M31).

## Tecnologías

- [React Native](https://reactnative.dev/) para la interfaz móvil.
- [Expo](https://expo.dev/) como plataforma de desarrollo y compilación.
- [Astronomy Engine](https://github.com/cosinekitty/astronomy) para las
  efemérides y transformaciones astronómicas.
- `expo-camera` para la vista de cámara.
- `expo-location` para la ubicación GPS y el rumbo.
- `expo-sensors` para el movimiento y el magnetómetro.
- JavaScript.

## Cómo funciona

1. Steralla solicita acceso a la cámara y a la ubicación del dispositivo.
2. Astronomy Engine calcula el azimut y la altitud de cada objeto para las
   coordenadas y la hora actuales.
3. Los datos del magnetómetro y de movimiento se combinan para construir una
   referencia de orientación estabilizada.
4. La aplicación transforma cada posición astronómica al sistema de la cámara
   y la proyecta sobre la pantalla.
5. La capa de realidad aumentada actualiza los marcadores, las constelaciones,
   el horizonte y la guía del objeto seleccionado.

## Puesta en marcha

### Requisitos

- Node.js y npm.
- Un dispositivo Android o iOS con cámara, GPS, magnetómetro y sensores de
  movimiento.
- Expo Go o un development build compatible con la versión de Expo del
  proyecto.

Los emuladores no suelen proporcionar todos los sensores necesarios, por lo
que se recomienda utilizar un dispositivo físico.

### Instalación

```bash
git clone https://github.com/tobi1584/steralla.git
cd steralla
npm install
npx expo start
```

Después, abre el proyecto en el dispositivo desde Expo Go o desde el
development build.

También están disponibles los comandos:

```bash
npm run android
npm run ios
npm run web
```

La versión web permite revisar parte de la interfaz, pero la experiencia de
realidad aumentada depende de sensores propios de un dispositivo móvil.

## Estructura del proyecto

```text
.
├── App.js                    # Composición principal de la aplicación
├── assets/                   # Iconos e imágenes de la aplicación
└── src/
    ├── components/           # Cámara, interfaz y capa de realidad aumentada
    ├── data/                 # Catálogo de estrellas y constelaciones
    ├── hooks/                # Cámara, sensores, efemérides y calibración
    └── utils/                # Vectores, orientación y proyección
```

La lógica está separada en hooks especializados. Los cálculos de vectores,
orientación y proyección se mantienen fuera de los componentes para aislar el
trabajo matemático de la representación visual.

## Retos técnicos

- Convertir coordenadas astronómicas en posiciones útiles para una cámara
  móvil.
- Combinar datos de distintos sensores y suavizar el movimiento sin introducir
  demasiado retraso.
- Mantener una referencia coherente al cambiar entre orientación vertical y
  horizontal.
- Dibujar cuerpos, líneas de constelaciones y guías sin bloquear el renderizado
  de la cámara.
- Compensar las diferencias de precisión y frecuencia de los sensores entre
  dispositivos.

## Privacidad

Steralla necesita permisos de cámara, ubicación y movimiento para funcionar.
Los datos se utilizan en el propio dispositivo para calcular y representar el
cielo; la aplicación no incluye cuentas de usuario, analítica ni un servidor al
que envíe esos datos.

## Limitaciones

- La precisión depende de la calidad de los sensores del dispositivo.
- Fundas magnéticas, objetos metálicos y otras interferencias pueden afectar a
  la brújula.
- Puede ser necesario recalibrar el magnetómetro o ajustar el campo de visión
  para alinear los marcadores con la cámara.
- La aplicación sirve como herramienta de exploración y no como instrumento
  astronómico de precisión.

## Estado del proyecto

Steralla se encuentra en desarrollo. Entre las posibles mejoras futuras están
la ampliación del catálogo de cielo profundo, la persistencia de los perfiles
de calibración y la incorporación de pruebas automatizadas para los cálculos de
orientación y proyección.

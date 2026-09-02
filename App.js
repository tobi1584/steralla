import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';

import * as Location from 'expo-location';
import { Magnetometer, DeviceMotion } from 'expo-sensors';

export default function App() {
  // =========================
  // UBICACIÓN
  // =========================

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // =========================
  // MAGNETÓMETRO
  // =========================

  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [subscription, setSubscription] = useState(null);

  // =========================
  // MOVIMIENTO
  // =========================

  const [{ alpha, beta, gamma }, setDMotion] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  // =========================
  // FUNCIONES MAGNETÓMETRO
  // =========================

  const _subscribe = () => {
    const newSubscription = Magnetometer.addListener((result) => {

    let angulo = Math.atan2(result.x, result.y);
    result.x = angulo.x * 180 / Math.PI
    result.y = angulo.y * 180 / Math.PI

    return setData(result)

    });

    setSubscription(newSubscription);
  };

  const _unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  const _slow = () => {
    Magnetometer.setUpdateInterval(50);
  };

  const _fast = () => {
    Magnetometer.setUpdateInterval(100);
  };

  

  // =========================
  // UBICACIÓN
  // =========================

  useEffect(() => {
    async function getCurrentLocation() {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg(
          'Permission to access location was denied'
        );
        return;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({});

      setLocation(currentLocation);
    }

    getCurrentLocation();
  }, []);

  // =========================
  // MAGNETÓMETRO
  // =========================

  useEffect(() => {
    Magnetometer.setUpdateInterval(500);

    const newSubscription = Magnetometer.addListener((result) => {
      setData(result);
    });

    setSubscription(newSubscription);

    return () => {
      newSubscription.remove();
    };
  }, []);

  // =========================
  // DEVICE MOTION
  // =========================

  useEffect(() => {
    DeviceMotion.setUpdateInterval(500);

    const motionSubscription = DeviceMotion.addListener((data) => {
      if (data.rotation) {
        setDMotion({
          alpha: data.rotation.alpha ?? 0,
          beta: data.rotation.beta ?? 0,
          gamma: data.rotation.gamma ?? 0,
        });
      }
    });

    return () => {
      motionSubscription.remove();
    };
  }, []);

  // =========================
  // TEXTO UBICACIÓN
  // =========================

  let text = 'Waiting...';

  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Latitud: ${location.coords.latitude}
Longitud: ${location.coords.longitude}`;
  }

  // =========================
  // PANTALLA
  // =========================

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>
        {text}
      </Text>

      {/* MAGNETÓMETRO */}
      <View style={styles.section}>
        <Text style={styles.title}>
          Magnetómetro
        </Text>
        <Text style={styles.text}>
          X: {x.toFixed(2)}
        </Text>
        <Text style={styles.text}>
          Y: {y.toFixed(2)}
        </Text>
        <Text style={styles.text}>
          Z: {z.toFixed(2)}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={subscription ? _unsubscribe : _subscribe}
            style={styles.button}
          >
            <Text>
              {subscription ? 'Desactivar' : 'Activar'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={_slow}
            style={[styles.button, styles.middleButton]}
          >
            <Text>Slow</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={_fast}
            style={styles.button}
          >
            <Text>Fast</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DEVICE MOTION */}
      <View style={styles.section}>
        <Text style={styles.title}>
          Movimiento
        </Text>
        <Text>
          Alpha: {alpha.toFixed(2)}
        </Text>
        <Text>
          Beta: {beta.toFixed(2)}
        </Text>
        <Text>
          Gamma: {gamma.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}


// =========================
// ESTILOS
// =========================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },

  section: {
    marginVertical: 15,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  text: {
    textAlign: 'center',
    fontSize: 16,
  },

  buttonContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },

  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },

  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },

});
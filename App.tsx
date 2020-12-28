import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'

interface ILocation {
  latitude: number;
  longitude: number;
}

export default function App() {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false)
  const [heading, setHeading] = useState<number>(0)
  const [location, setLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  })
  const [errorMessage, setErrorMessage] = useState<string>('')

  const getPermissions = async () => {
    let permissions = await Permissions.getAsync(Permissions.LOCATION)

    if (permissions.granted) {
      setPermissionGranted(true)
    } else {
      permissions = await Permissions.askAsync(Permissions.LOCATION)

      if (permissions.granted) {
        setPermissionGranted(true)
      } else {
        setErrorMessage('Permission to access location was denied')
      }
    }
  }

  const watchPosition = async () => {
    // const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest })
    // const currentLocation: object | null = await Location.getLastKnownPositionAsync()

    Location.watchPositionAsync({ accuracy: Location.Accuracy.Highest }, (newLocation) => {
      const { latitude, longitude } = newLocation.coords
      setLocation({ latitude, longitude })
    })
  }

  const watchHeading = async () => {
    Location.watchHeadingAsync(heading => setHeading(Math.round(heading.trueHeading)))
  }

  useEffect(() => {
    getPermissions()
  }, [])

  useEffect(() => {
    watchHeading()
    watchPosition()
  }, [permissionGranted])

  const getDirectionLabel = () => {
    const points = [
      'North','NNE','NE','ENE',
      'East', 'ESE','SE','SSE',
      'South','SSW','SW','WSW',
      'West', 'WNW','NW','NNW',
      'North',
    ]
    return points[Math.round(heading / 22.5)]
  }
  const rotation = heading >= 45 ? heading : heading + 360
  const compassRotateStyle = {
    transform: [{ rotate: `${rotation - 45}deg`}],
  }

  console.log(`State: ${JSON.stringify(location)} / ${Object.keys(location).length} | ${JSON.stringify(heading)} | ${errorMessage}.`)

  return (
    <View style={styles.container}>
      <Image source={require('./assets/compass.png')} style={[styles.compass, compassRotateStyle]} />

      {errorMessage.length > 0 &&
        <Text style={styles.heading2}>{errorMessage}</Text>
      }

      <Text style={styles.heading2}>
        {getDirectionLabel()}{' '}

        <Text style={styles.heading3}>({heading}&deg;)</Text>
      </Text>

      {Object.keys(location).length > 0 &&
        <Text style={styles.heading3}>{`${location.latitude}, ${location.longitude}`}</Text>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    alignItems: "center",
    backgroundColor: "#ffffff70",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  compass: {
    height: 200,
    marginBottom: 32,
    width: 200,
  },
  heading1: {
    color: "#777",
    fontSize: 32,
    fontWeight: "bold",
    margin: 20
  },
  heading2: {
    color: "#777",
    fontSize: 18,
    fontWeight: "bold",
    margin: 5,
  },
  heading3: {
    color: "#777",
    fontWeight: 'normal',
    margin: 5,
  }
})

import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'

interface ILocation {
  latitude: number;
  longitude: number;
}

interface IGeocode {
  city: string|null;
  district: string|null;
  street: string|null;
  region: string|null;
  subregion: string|null;
  postalCode: string|null;
  country: string| null;
  name: string|null;
  isoCountryCode: string|null;
  timezone: string|null;
}

export default function App() {
  const [location, setLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0,
  })
  const [geocode, setGeocode] = useState<IGeocode>({
    city: null,
    district: null,
    street: null,
    region: null,
    subregion: null,
    postalCode: null,
    country:  null,
    name: null,
    isoCountryCode: null,
    timezone: null,
  })
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    getLocationAsync()
  }, [])

  const getGeocodeAsync = async (location: ILocation) => {

    console.log(`Location: ${JSON.stringify(location)}`)

    const googleApiKey = 'AIzaSyD1KHCXa1E8lXFdZshXL-4_I4iVCb3BYgo'
    Location.setGoogleApiKey(googleApiKey)
    let reverseGeocode:IGeocode|null = await Location.reverseGeocodeAsync(location)

    console.log(`Geocode: ${JSON.stringify(reverseGeocode)}`)

    setGeocode(reverseGeocode)
  }

  const getLocationAsync = async () => {
    let permissions = await Permissions.getAsync(Permissions.LOCATION);
    if (!permissions.granted) {
      permissions = await Permissions.askAsync(Permissions.LOCATION)
    }

    if (!permissions.granted) {
      setErrorMessage('Permission to access location was denied')
    }

    const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest })
    // const currentLocation: object | null = await Location.getLastKnownPositionAsync()

    if (currentLocation !== null) {
      console.log(`GLA Location: ${JSON.stringify(currentLocation)}`)

      const { latitude, longitude } = currentLocation.coords

      getGeocodeAsync({ latitude, longitude }).catch(error => setErrorMessage(error))
      setLocation({ latitude, longitude })
    }
  }

  console.log(`State: ${JSON.stringify(location)} / ${Object.keys(location).length} | ${JSON.stringify(geocode)} | ${errorMessage}.`)

  return (
    <View style={styles.container}>
      <Image source={ require("./assets/marker.png") } style={{ width: 100, height: 100 }} />

      {errorMessage.length > 0 &&
        <Text style={styles.heading2}>{errorMessage}</Text>
      }

      {Object.keys(geocode).length > 0 &&
        <>
          <Text style={styles.heading1}>{geocode  ? `${geocode.city}, ${geocode.isoCountryCode}` : ""}</Text>
          <Text style={styles.heading2}>{geocode ? geocode.street :""}</Text>
        </>
      }

      {Object.keys(location).length > 0 &&
        <Text style={styles.heading3}>{`${location.latitude}, ${location.longitude}`}</Text>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#000',
    flex: 1,
    justifyContent: 'center',
  },
  overlay:{
    alignItems: "center",
    backgroundColor: "#00000070",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  heading1:{
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    margin: 20
  },
  heading2:{
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    margin: 5,
  },
  heading3:{
    color: "#fff",
    margin: 5,
  }
})

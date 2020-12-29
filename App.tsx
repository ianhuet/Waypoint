import React, { useEffect, useState } from 'react'
import { Button, Image, ImageBackground, StyleSheet, Text, View } from 'react-native'

import * as Location from 'expo-location'
import * as Permissions from 'expo-permissions'
import { calcBearing, calcDistance, convertDecimalToDMS, } from './calculations'

interface ILocation {
  altitude: number;
  latitude: number;
  longitude: number;
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
  waypoint: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  heading1: {
    color: "#777",
    fontFamily: 'AvenirNext-Regular',
    fontSize: 32,
    fontWeight: "bold",
    margin: 20
  },
  heading2: {
    color: "#777",
    fontFamily: 'AvenirNext-Regular',
    fontSize: 32,
    fontWeight: "bold",
    margin: 5,
  },
  heading3: {
    color: "#777",
    fontFamily: 'AvenirNext-Regular',
    fontSize: 26,
    fontWeight: 'normal',
    margin: 5,
  },
  heading4: {
    color: "#777",
    fontFamily: 'AvenirNext-Regular',
    fontSize: 18,
    fontWeight: 'normal',
    lineHeight: 20,
    margin: 5,
  },

  compass: {
    height: 350,
    width: 350,
    marginBottom: 32,
  },
  dial: {
    height: 350,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 350,
  },
  pointer: {
    height: 150,
    left: '28.5%',
    opacity: 0.5,
    position: 'absolute',
    top: '28.5%',
    transform: [{ rotate: '-28deg'}],
    width: 150,
    zIndex: -1,
  },

  bottomButton: {
    bottom: 48,
    position: 'absolute',
    textAlign: 'center',
  },
  topButton: {
    position: 'absolute',
    textAlign: 'center',
    top: 48,
  },
})

export default function App() {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const [heading, setHeading] = useState<number>(0)
  const [location, setLocation] = useState<ILocation>({
    altitude: 0,
    latitude: 0,
    longitude: 0,
  })

  const [waypoint, setWayPoint] = useState<ILocation>({
    altitude: 0,
    latitude: 0,
    longitude: 0,
  })
  const [wayPointer, setWayPointer] = useState<boolean>(false)

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
    Location.watchPositionAsync({ accuracy: Location.Accuracy.Highest }, (newPosition) => {
      const { altitude, latitude, longitude } = newPosition.coords
      setLocation({ altitude, latitude, longitude })
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
  const dialRotateStyle = () => {
    const pointer: number = wayPointer ? 0 : rotation

    return ({
      transform: [{ rotate: `${pointer}deg`}],
    })
  }
  const pointerRotateStyle = () => {
    const pointer: number = wayPointer
      ? calcBearing(
          location.latitude,
          location.longitude,
          waypoint.latitude,
          waypoint.longitude,
          heading,
        )
      : -28

    return ({
      transform: [{ rotate: `${pointer}deg`}],
      zIndex: 10,
    })
  }

  const formatDistance = (distance: number) => {
    let distanceString = ''
    if (distance < 1) {
      distanceString = `${Math.round(distance * 1000)}m`
    } else {
      distanceString = `${distance.toFixed(2)}km`
    }

    return distanceString
  }
  const activeWaypoint = waypoint.latitude !== 0 || waypoint.longitude !== 0
  const waypointButtonLabel = activeWaypoint ? 'Clear Waypoint' : 'Set Waypoint'
  const waypointButtonColour = activeWaypoint ? '#11AB11' : '#666'
  const toggleWaypoint = () => {
    if (activeWaypoint) {
      setWayPoint({ altitude: 0, latitude: 0, longitude: 0 })
      setWayPointer(false)
    } else {
      setWayPoint({
        altitude: location.altitude,
        latitude: location.latitude,
        longitude: location.longitude
      })
    }
  }
  const distanceToWayPoint: number = calcDistance(location.latitude, location.longitude, waypoint.latitude, waypoint.longitude)
  const atWayPointRange: number = 3

  return (
    <View style={styles.container}>
      <View style={styles.topButton}>
        <Button
          title={waypointButtonLabel}
          color={waypointButtonColour}
          onPress={() => toggleWaypoint()}
        />

        {activeWaypoint &&
          <View style={styles.waypoint}>
            {distanceToWayPoint > atWayPointRange &&
              <>
                <Text style={styles.heading4}>{convertDecimalToDMS(waypoint.latitude, waypoint.longitude)}</Text>
                <View style={styles.waypoint}>
                  <Text style={styles.heading4}>Distance: {formatDistance(distanceToWayPoint)}</Text>
                  <Text style={styles.heading4}>Elevation: {waypoint.altitude.toFixed(0)}m</Text>
                </View>
              </>
            }
            {distanceToWayPoint <= atWayPointRange &&
              <Text style={styles.heading2}>At Waypoint</Text>
            }
          </View>
        }
      </View>

      <View style={styles.compass}>
        <Image source={require('./assets/dial.png')} style={[styles.dial, dialRotateStyle()]} />
        <ImageBackground source={require('./assets/compass.png')} style={[styles.pointer, pointerRotateStyle()]} />
      </View>

      {errorMessage.length > 0 &&
        <Text style={styles.heading2}>{errorMessage}</Text>
      }

      {!wayPointer &&
        <Text style={styles.heading2}>
          {heading}&deg; {getDirectionLabel()}
        </Text>
      }
      {(activeWaypoint && wayPointer) &&
        <Text style={styles.heading2}>Way Pointer Engaged</Text>
      }

      <Text style={styles.heading3}>{convertDecimalToDMS(location.latitude, location.longitude)}</Text>
      <Text style={styles.heading3}>{location.altitude.toFixed(0)}m elevation</Text>

      {activeWaypoint &&
        <View style={styles.bottomButton}>
          <Button
            title='Waypointer Bearing'
            color='#11AB11'
            onPress={() => setWayPointer(!wayPointer)}
          />
        </View>
      }
    </View>
  )
}

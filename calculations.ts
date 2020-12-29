const toRadians = (degrees: number) => degrees * Math.PI / 180
const toDegrees = (radians: number) => radians * 180 / Math.PI

const toDegreesMinutesAndSeconds = (coordinate: number) => {
  const absolute = Math.abs(coordinate);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

  return `${degrees}\u00B0 ${minutes}' ${seconds}"`;
}

export const calcBearing = (startLat: number, startLng: number, destLat: number, destLng: number, heading: number) => {
  startLat = toRadians(startLat);
  startLng = toRadians(startLng);
  destLat = toRadians(destLat);
  destLng = toRadians(destLng);

  const y: number = Math.sin(destLng - startLng) * Math.cos(destLat)
  const x: number = Math.cos(startLat) * Math.sin(destLat) -
        Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng)
  let bearing: number = Math.atan2(y, x)
  bearing = toDegrees(bearing)
  return (bearing + 360) % 360 + heading
}
export const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0
  }

  const radLat1 = Math.PI * lat1/180
  const radLat2 = Math.PI * lat2/180
  const theta = lon1 - lon2
  const radTheta = Math.PI * theta/180
  let dist: number = Math.sin(radLat1) * Math.sin(radLat2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta)

  if (dist > 1) {
    dist = 1
  }
  dist = Math.acos(dist)
  dist = dist * 180/Math.PI
  dist = dist * 60 * 1.1515
  dist = dist * 1.609344
  return dist
}
export const convertDecimalToDMS = (lat: number, lng: number) => {
  const latitude = toDegreesMinutesAndSeconds(lat);
  const latitudeCardinal = lat >= 0 ? "N" : "S";

  const longitude = toDegreesMinutesAndSeconds(lng);
  const longitudeCardinal = lng >= 0 ? "E" : "W";

  return `${latitude} ${latitudeCardinal} ${longitude} ${longitudeCardinal}`;
}

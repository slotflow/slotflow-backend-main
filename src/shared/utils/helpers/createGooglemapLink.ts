import { GeoLocation } from "../../../domain/commands/address.commands";

export const createGoogleMapsUrl = (location?: GeoLocation): string | undefined => {
  if (!location?.coordinates || location.coordinates.length < 2) return undefined;
  
  const [longitude, latitude] = location.coordinates;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
};
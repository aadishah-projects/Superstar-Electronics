"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import * as L from "leaflet";

const DEFAULT_CENTER: [number, number] = [27.6833, 84.4333];

function googleMapsUrl(latitude: string, longitude: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

function validCoordinates(latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

function parseCoordinatePair(value: string): [number, number] | null {
  const patterns = [
    /@\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/,
    /(?:[?&#](?:q|query|ll|center)=)(-?\d+(?:\.\d+)?)[,%20]+(-?\d+(?:\.\d+)?)/i,
    /#map=\d+(?:\.\d+)?\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/i,
    /(^|[^\d-])(-?\d{1,3}(?:\.\d{3,})?)\s*,\s*(-?\d{1,3}(?:\.\d{3,})?)(?!\d)/,
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (!match) continue;
    const offset = pattern === patterns[3] ? 2 : 1;
    const latitude = Number(match[offset]);
    const longitude = Number(match[offset + 1]);
    if (validCoordinates(latitude, longitude)) return [latitude, longitude];
  }

  return null;
}

function coordinateText(latitude: number, longitude: number) {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

export function MapPinPicker({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  const initialPin = latitude !== null && longitude !== null && validCoordinates(latitude, longitude) ? [latitude, longitude] as [number, number] : null;
  const [pin, setPin] = useState<[number, number] | null>(initialPin);
  const [locationLink, setLocationLink] = useState("");
  const [message, setMessage] = useState("");
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const displayPin = useMemo(() => pin ? coordinateText(pin[0], pin[1]) : "No pin selected yet", [pin]);

  function setSelectedPin(nextPin: [number, number], nextMessage = "Pin selected. Save the job to keep this location.") {
    const rounded: [number, number] = [Number(nextPin[0].toFixed(6)), Number(nextPin[1].toFixed(6))];
    setPin(rounded);
    setMessage(nextMessage);
    markerRef.current?.setLatLng(rounded);
    mapRef.current?.setView(rounded, Math.max(mapRef.current.getZoom(), 16));
  }

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;
    const startingPoint = initialPin ?? DEFAULT_CENTER;
    const map = L.map(mapElement.current, { scrollWheelZoom: false }).setView(startingPoint, initialPin ? 17 : 13);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    const marker = L.marker(startingPoint, {
      icon: L.divIcon({ className: "portal-map-marker", html: "<span></span>", iconSize: [22, 22], iconAnchor: [11, 11] }),
    }).addTo(map);
    marker.bindTooltip(initialPin ? "Saved job location" : "Click the map to set the job location");
    map.on("click", (event) => setSelectedPin([event.latlng.lat, event.latlng.lng]));
    mapRef.current = map;
    markerRef.current = marker;
    window.setTimeout(() => map.invalidateSize(), 0);
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // The map is intentionally created once; later pin changes update its marker and view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("This browser cannot provide a current location.");
      return;
    }
    setMessage("Requesting your location…");
    navigator.geolocation.getCurrentPosition(
      (position) => setSelectedPin([position.coords.latitude, position.coords.longitude], "Pin set from this device. Save the job to keep it."),
      () => setMessage("Location access was blocked. Click the map or paste a location link instead."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function usePastedLocation() {
    const parsed = parseCoordinatePair(locationLink);
    if (!parsed) {
      setMessage("That link did not contain a readable map location. Copy the full Google Maps, Apple Maps, or OpenStreetMap link.");
      return;
    }
    setSelectedPin(parsed, "Location link converted to a job pin. Save the job to keep it.");
  }

  return (
    <div className="portal-map-picker grid gap-3 border-t border-line px-4 pb-4 pt-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block text-sm font-semibold text-ink">Paste a map location link
          <input value={locationLink} onChange={(event) => setLocationLink(event.target.value)} onPaste={(event) => { const pasted = event.clipboardData.getData("text"); setLocationLink(pasted); }} placeholder="Paste a Google Maps or other map link" className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10" />
        </label>
        <button type="button" onClick={usePastedLocation} className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white px-4 text-xs font-semibold text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue/[0.04]">Use pasted link</button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div><p className="text-sm font-semibold text-ink">Click the map to place the pin</p><p className="mt-1 text-xs copy-muted">{displayPin}</p></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={useCurrentLocation} className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3 text-xs font-semibold text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue/[0.04]">Use this device&apos;s location</button>
          {pin ? <a href={googleMapsUrl(String(pin[0]), String(pin[1]))} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-lg bg-brand-blue px-3 text-xs font-semibold text-white transition hover:bg-brand-blue/90">Check in Google Maps</a> : null}
        </div>
      </div>
      <div ref={mapElement} className="h-72 overflow-hidden rounded-[0.9rem] border border-line bg-[#edf3f8]" aria-label="Interactive map for selecting the job location" />
      {pin ? <input type="hidden" name="siteLatitude" value={pin[0]} /> : null}
      {pin ? <input type="hidden" name="siteLongitude" value={pin[1]} /> : null}
      {message ? <p className="text-xs leading-5 copy-muted" role="status">{message}</p> : null}
      <p className="text-xs leading-5 copy-muted">Map data © OpenStreetMap contributors. Your technician will receive the saved location as a Google Maps link.</p>
    </div>
  );
}

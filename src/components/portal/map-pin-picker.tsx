"use client";

import { useMemo, useState } from "react";

function googleMapsUrl(latitude: string, longitude: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`;
}

export function MapPinPicker({ latitude, longitude }: { latitude: number | null; longitude: number | null }) {
  const [lat, setLat] = useState(latitude === null ? "" : String(latitude));
  const [lng, setLng] = useState(longitude === null ? "" : String(longitude));
  const [message, setMessage] = useState("");
  const hasPin = useMemo(() => {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    return lat.trim() !== "" && lng.trim() !== "" && Number.isFinite(parsedLat) && Number.isFinite(parsedLng) && parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180;
  }, [lat, lng]);

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setMessage("This browser cannot provide your current location.");
      return;
    }
    setMessage("Requesting your location…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setMessage("Pin set from this device. Save the job to keep it.");
      },
      () => setMessage("Location access was blocked. You can still enter the coordinates manually."),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="grid gap-4 border-t border-line px-4 pb-4 pt-3 sm:grid-cols-2">
      <label className="block text-sm font-semibold text-ink">Latitude<input name="siteLatitude" type="number" step="any" value={lat} onChange={(event) => setLat(event.target.value)} placeholder="27.7172" className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10" /></label>
      <label className="block text-sm font-semibold text-ink">Longitude<input name="siteLongitude" type="number" step="any" value={lng} onChange={(event) => setLng(event.target.value)} placeholder="85.3240" className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none transition placeholder:text-gray-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10" /></label>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <button type="button" onClick={useCurrentLocation} className="inline-flex h-9 items-center rounded-lg border border-line bg-white px-3 text-xs font-semibold text-brand-blue transition hover:border-brand-blue hover:bg-brand-blue/[0.04]">Use this device&apos;s location</button>
        {hasPin ? <a href={googleMapsUrl(lat, lng)} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-lg bg-brand-blue px-3 text-xs font-semibold text-white transition hover:bg-brand-blue/90">Open this pin in Google Maps</a> : null}
        {message ? <span className="text-xs copy-muted">{message}</span> : null}
      </div>
      <p className="text-xs leading-5 copy-muted sm:col-span-2">Use the device button at the customer site, or paste the latitude and longitude from Google Maps. The saved pin opens directly in Google Maps for the technician.</p>
    </div>
  );
}

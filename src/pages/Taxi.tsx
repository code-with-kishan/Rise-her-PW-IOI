import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GlassCard, Button } from '@/components/UI';
import { Car, MapPin, Navigation, Shield, Star, UserRound } from 'lucide-react';
import { DirectionsRenderer, DirectionsService, GoogleMap, LoadScript, MarkerF } from '@react-google-maps/api';
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type TaxiStatus = 'idle' | 'searching' | 'assigned' | 'in-progress';

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 28.6139, lng: 77.209 };
const DEMO_MIN_TRIP_MS = 8000;
const DEMO_MAX_TRIP_MS = 26000;
const CAR_SYMBOL_PATH = 'M4 13h1l1-3h10l1 3h1c0.55 0 1 0.45 1 1v3h-1a2 2 0 0 1-4 0H8a2 2 0 0 1-4 0H3v-3c0-0.55 0.45-1 1-1Zm3.1-3h7.8l-0.8-2.2a1 1 0 0 0-.94-.67H8.84a1 1 0 0 0-.94.67L7.1 10ZM6 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type MapPoint = { lat: number; lng: number };

const createFallbackRoute = (start: MapPoint, end: MapPoint, steps = 36): MapPoint[] => {
  const points: MapPoint[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    points.push({
      lat: start.lat + (end.lat - start.lat) * t,
      lng: start.lng + (end.lng - start.lng) * t,
    });
  }
  return points;
};

const queryToDemoPoint = (query: string, center: MapPoint): MapPoint => {
  const text = query.trim().toLowerCase();
  if (!text) {
    return center;
  }

  const hash = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const latOffset = ((hash % 27) - 13) * 0.0042;
  const lngOffset = ((Math.floor(hash / 3) % 27) - 13) * 0.0051;

  return {
    lat: center.lat + latOffset,
    lng: center.lng + lngOffset,
  };
};

const RecenterLeafletMap = ({ center }: { center: MapPoint }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom(), { animate: true });
  }, [center.lat, center.lng, map]);

  return null;
};

const rides = [
  { id: 'mini', type: 'Shark Mini', price: '₹289', eta: '3 min', capacity: '3 seats' },
  { id: 'comfort', type: 'Shark Comfort', price: '₹399', eta: '5 min', capacity: '4 seats' },
  { id: 'premium', type: 'Shark Premium', price: '₹599', eta: '7 min', capacity: '4 seats' },
];

const driversByRide: Record<string, { name: string; car: string; rating: number; eta: string }[]> = {
  mini: [
    { name: 'Ananya', car: 'Hyundai i10', rating: 4.8, eta: '3 min' },
    { name: 'Neha', car: 'Suzuki Celerio', rating: 4.7, eta: '4 min' },
  ],
  comfort: [
    { name: 'Priya', car: 'Honda Amaze', rating: 4.9, eta: '5 min' },
    { name: 'Ritika', car: 'Toyota Etios', rating: 4.8, eta: '6 min' },
  ],
  premium: [
    { name: 'Sarah', car: 'Toyota Prius', rating: 4.9, eta: '7 min' },
    { name: 'Kavya', car: 'Hyundai Verna', rating: 4.9, eta: '8 min' },
  ],
};

const Taxi = () => {
  const [status, setStatus] = useState<TaxiStatus>('idle');
  const [selectedRideId, setSelectedRideId] = useState('mini');
  const [pickup, setPickup] = useState('Connaught Place, New Delhi');
  const [dropoff, setDropoff] = useState('');
  const [assignedDriverIndex, setAssignedDriverIndex] = useState(0);
  const [routeRequest, setRouteRequest] = useState<google.maps.DirectionsRequest | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [demoRoutePath, setDemoRoutePath] = useState<MapPoint[]>([]);
  const [demoMapCenter, setDemoMapCenter] = useState<MapPoint>(DEFAULT_CENTER);
  const [routeError, setRouteError] = useState('');
  const [travelProgress, setTravelProgress] = useState(0);
  const [tripNotice, setTripNotice] = useState('');
  const [etaText, setEtaText] = useState('');
  const [tripDurationMs, setTripDurationMs] = useState(14000);
  const mapRef = useRef<google.maps.Map | null>(null);
  const timeoutRefs = useRef<number[]>([]);
  const progressRafRef = useRef<number | null>(null);
  const progressStartRef = useRef<number | null>(null);

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  const selectedRide = useMemo(() => rides.find((ride) => ride.id === selectedRideId) || rides[0], [selectedRideId]);
  const availableDrivers = driversByRide[selectedRideId] || [];
  const assignedDriver = availableDrivers[Math.min(assignedDriverIndex, Math.max(availableDrivers.length - 1, 0))];

  const googleRoutePath = useMemo(() => {
    const points = directions?.routes?.[0]?.overview_path;
    if (!points?.length) {
      return [] as MapPoint[];
    }

    return points.map((point) => ({ lat: point.lat(), lng: point.lng() }));
  }, [directions]);

  const routePath = mapsApiKey ? googleRoutePath : demoRoutePath;

  const currentCarPosition = useMemo(() => {
    if (routePath.length === 0) {
      return DEFAULT_CENTER;
    }

    if (routePath.length === 1) {
      return routePath[0];
    }

    const segmentCount = routePath.length - 1;
    const scaled = Math.min(1, Math.max(0, travelProgress)) * segmentCount;
    const currentIndex = Math.min(segmentCount - 1, Math.floor(scaled));
    const remainder = scaled - currentIndex;
    const start = routePath[currentIndex];
    const end = routePath[currentIndex + 1];

    return {
      lat: start.lat + (end.lat - start.lat) * remainder,
      lng: start.lng + (end.lng - start.lng) * remainder,
    };
  }, [routePath, travelProgress]);

  const carHeading = useMemo(() => {
    if (routePath.length < 2) {
      return 0;
    }

    const segmentCount = routePath.length - 1;
    const scaled = Math.min(1, Math.max(0, travelProgress)) * segmentCount;
    const currentIndex = Math.min(segmentCount - 1, Math.floor(scaled));
    const fromPoint = routePath[currentIndex];
    const toPoint = routePath[Math.min(routePath.length - 1, currentIndex + 1)];

    const y = toPoint.lng - fromPoint.lng;
    const x = toPoint.lat - fromPoint.lat;
    const degrees = (Math.atan2(y, x) * 180) / Math.PI;
    return (degrees + 360) % 360;
  }, [routePath, travelProgress]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((id) => window.clearTimeout(id));
      timeoutRefs.current = [];

      if (progressRafRef.current !== null) {
        window.cancelAnimationFrame(progressRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && status === 'in-progress' && routePath.length > 1) {
      mapRef.current.panTo(currentCarPosition);
    }
  }, [currentCarPosition, routePath.length, status]);

  useEffect(() => {
    if (status !== 'in-progress' || routePath.length <= 1) {
      if (progressRafRef.current !== null) {
        window.cancelAnimationFrame(progressRafRef.current);
        progressRafRef.current = null;
      }
      progressStartRef.current = null;
      return;
    }

    if (progressRafRef.current !== null) {
      window.cancelAnimationFrame(progressRafRef.current);
    }

    const animate = (timestamp: number) => {
      if (progressStartRef.current === null) {
        progressStartRef.current = timestamp;
      }

      const elapsed = timestamp - progressStartRef.current;
      const linearProgress = Math.min(1, elapsed / tripDurationMs);
      const easedProgress = easeInOutCubic(linearProgress);

      setTravelProgress(easedProgress);

      if (linearProgress >= 1) {
        progressRafRef.current = null;
        progressStartRef.current = null;
        setTravelProgress(0);
        setTripNotice('Arrived at destination. Ride completed successfully.');
        setStatus('idle');
        return;
      }

      progressRafRef.current = window.requestAnimationFrame(animate);
    };

    progressRafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (progressRafRef.current !== null) {
        window.cancelAnimationFrame(progressRafRef.current);
        progressRafRef.current = null;
      }
      progressStartRef.current = null;
    };
  }, [routePath.length, status, tripDurationMs]);

  const handleBook = () => {
    if (!dropoff.trim()) {
      return;
    }

    timeoutRefs.current.forEach((id) => window.clearTimeout(id));
    timeoutRefs.current = [];

    if (progressRafRef.current !== null) {
      window.cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = null;
    }
    progressStartRef.current = null;

    setAssignedDriverIndex(Math.floor(Math.random() * Math.max(availableDrivers.length, 1)));
    setStatus('searching');
    setDirections(null);
    setDemoRoutePath([]);
    setRouteError('');
    setTripNotice('');
    setEtaText('');
    setTripDurationMs(14000);
    setTravelProgress(0);
    if (mapsApiKey) {
      setRouteRequest({
        origin: pickup,
        destination: dropoff,
        travelMode: 'DRIVING' as google.maps.TravelMode,
        provideRouteAlternatives: false,
      });
    } else {
      setRouteRequest(null);

      const loadDemoRoute = async () => {
        const origin = queryToDemoPoint(pickup, demoMapCenter);
        const destination = queryToDemoPoint(dropoff, {
          lat: demoMapCenter.lat + 0.034,
          lng: demoMapCenter.lng + 0.048,
        });

        const routePoints = createFallbackRoute(origin, destination, 42);
        const roughDistanceKm = Math.hypot(destination.lat - origin.lat, destination.lng - origin.lng) * 111;
        const etaMinutes = Math.max(4, Math.round(roughDistanceKm * 5.5));

        setDemoRoutePath(routePoints);
        setDemoMapCenter(origin);
        setEtaText(`${etaMinutes} min`);
        setTripDurationMs(Math.min(DEMO_MAX_TRIP_MS, Math.max(DEMO_MIN_TRIP_MS, etaMinutes * 1100)));
        setRouteError('Offline demo routing active. Route generated instantly without external APIs.');
      };

      void loadDemoRoute();
    }

    timeoutRefs.current.push(window.setTimeout(() => setStatus('assigned'), 1800));
    timeoutRefs.current.push(window.setTimeout(() => setStatus('in-progress'), 5200));
  };

  const handleDirectionsCallback = (result: google.maps.DirectionsResult | null, callbackStatus: google.maps.DirectionsStatus) => {
    if (!result || callbackStatus !== 'OK') {
      setRouteError('Unable to fetch a live route for these locations right now.');
      return;
    }

    setDirections(result);
    setRouteError('');

    const durationText = result.routes?.[0]?.legs?.[0]?.duration?.text;
    const durationSeconds = result.routes?.[0]?.legs?.[0]?.duration?.value;
    if (durationText) {
      setEtaText(durationText);
    }
    if (typeof durationSeconds === 'number' && Number.isFinite(durationSeconds)) {
      const demoDuration = Math.min(DEMO_MAX_TRIP_MS, Math.max(DEMO_MIN_TRIP_MS, durationSeconds * 220));
      setTripDurationMs(demoDuration);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-5 lg:gap-8">
      <GlassCard className="w-full lg:w-96 flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">RISEher Taxi</h1>
          <p className="text-slate-500">Women-only safe transportation.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
            <input
              type="text"
              placeholder="Pickup Location"
              value={pickup}
              onChange={(event) => setPickup(event.target.value)}
              className="w-full glass pl-12 pr-4 py-4 rounded-2xl focus:outline-none"
            />
          </div>
          <div className="relative">
            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Where to?"
              value={dropoff}
              onChange={(event) => setDropoff(event.target.value)}
              className="w-full glass pl-12 pr-4 py-4 rounded-2xl focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Available Rides</h4>
          {rides.map((ride) => (
            <button
              key={ride.id}
              type="button"
              onClick={() => setSelectedRideId(ride.id)}
              className={
                selectedRideId === ride.id
                  ? 'w-full flex items-center justify-between p-4 rounded-2xl border-2 border-primary bg-primary/5 transition-all'
                  : 'w-full flex items-center justify-between p-4 rounded-2xl border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all'
              }
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <Car size={20} />
                </div>
                <div className="text-left">
                  <div className="font-bold">{ride.type}</div>
                  <div className="text-xs text-slate-400">{ride.eta} away • {ride.capacity}</div>
                </div>
              </div>
              <div className="font-bold text-primary">{ride.price}</div>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Alloted Driver Pool</p>
          <div className="mt-2 space-y-2">
            {availableDrivers.map((driver) => (
              <div key={driver.name} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <UserRound size={14} className="text-primary" />
                  <span className="font-medium">{driver.name}</span>
                </div>
                <span className="text-slate-500">{driver.car}</span>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleBook} disabled={status !== 'idle' || !dropoff.trim()} className="w-full py-4 text-lg mt-auto">
          {status === 'idle' ? 'Book Safe Ride' : 'Booking...'}
        </Button>
      </GlassCard>

      <GlassCard className="flex-1 p-0 overflow-hidden relative bg-slate-100 min-h-[26rem]">
        {!mapsApiKey ? (
          <MapContainer
            center={[demoMapCenter.lat, demoMapCenter.lng]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <RecenterLeafletMap center={demoMapCenter} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {routePath.length > 1 && (
              <Polyline positions={routePath.map((point) => [point.lat, point.lng])} pathOptions={{ color: '#38bdf8', weight: 5 }} />
            )}

            {routePath.length > 0 && (
              <CircleMarker center={[routePath[0].lat, routePath[0].lng]} radius={8} pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.95, weight: 2 }}>
                <Tooltip permanent direction="top" offset={[0, -10]}>Pickup</Tooltip>
              </CircleMarker>
            )}
            {routePath.length > 1 && (
              <CircleMarker
                center={[routePath[routePath.length - 1].lat, routePath[routePath.length - 1].lng]}
                radius={8}
                pathOptions={{ color: '#059669', fillColor: '#10b981', fillOpacity: 0.95, weight: 2 }}
              >
                <Tooltip permanent direction="top" offset={[0, -10]}>Drop</Tooltip>
              </CircleMarker>
            )}

            {routePath.length > 1 && (
              <CircleMarker
                center={[currentCarPosition.lat, currentCarPosition.lng]}
                radius={10}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.95, weight: 2 }}
              >
                <Tooltip permanent direction="top" offset={[0, -12]}>{`🚕 ${Math.round(travelProgress * 100)}%`}</Tooltip>
              </CircleMarker>
            )}
          </MapContainer>
        ) : (
          <LoadScript googleMapsApiKey={mapsApiKey}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={routePath[0] || DEFAULT_CENTER}
              zoom={13}
              onLoad={(map) => {
                mapRef.current = map;
              }}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
              }}
            >
              {routeRequest && !directions && <DirectionsService options={routeRequest} callback={handleDirectionsCallback} />}

              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#38bdf8',
                      strokeOpacity: 0.9,
                      strokeWeight: 5,
                    },
                  }}
                />
              )}

              {routePath.length > 0 && <MarkerF position={routePath[0]} label="P" />}
              {routePath.length > 1 && <MarkerF position={routePath[routePath.length - 1]} label="D" />}

              {routePath.length > 1 && (
                <MarkerF
                  position={currentCarPosition}
                  icon={{
                    path: CAR_SYMBOL_PATH,
                    scale: 1.45,
                    fillColor: '#38bdf8',
                    fillOpacity: 1,
                    strokeColor: '#0ea5e9',
                    strokeWeight: 1,
                    rotation: carHeading,
                    anchor: new window.google.maps.Point(10, 11),
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>
        )}

        <div className="absolute left-3 top-3 sm:left-8 sm:top-8 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow max-w-[42vw] sm:max-w-none truncate">
          Pickup: {pickup || 'Not set'}
        </div>
        <div className="absolute right-3 top-3 sm:right-8 sm:top-8 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow max-w-[42vw] sm:max-w-none truncate text-right">
          Drop: {dropoff || 'Not set'}
        </div>

        {!mapsApiKey && (
          <div className="absolute left-3 top-16 sm:left-8 sm:top-20 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700 shadow">
            Demo Mode: Real OpenStreetMap (no API key needed)
          </div>
        )}

        {etaText && (
          <div className="absolute left-3 top-16 sm:left-8 sm:top-20 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow">
            ETA: {etaText}
          </div>
        )}

        {routeError && (
          <div className="absolute left-3 right-3 top-24 sm:left-8 sm:right-auto rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 shadow sm:max-w-md">
            {routeError}
          </div>
        )}

        {tripNotice && (
          <div className="absolute left-3 right-3 top-24 sm:left-8 sm:right-auto rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 shadow sm:max-w-md">
            {tripNotice}
          </div>
        )}

        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-20 left-3 right-3 sm:bottom-16 sm:left-8 sm:right-8">
              <GlassCard className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                    <Car size={32} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary uppercase tracking-widest">
                      {status === 'searching' ? 'Searching for driver...' : status === 'assigned' ? 'Driver Assigned' : 'Ride in Progress'}
                    </div>
                    <div className="text-xl font-bold">
                      {status === 'searching'
                        ? `Finding ${selectedRide.type}`
                        : status === 'assigned'
                          ? `${assignedDriver?.name || 'Driver'} (${assignedDriver?.car || selectedRide.type})`
                          : `On the way with ${assignedDriver?.name || 'driver'}`}
                    </div>
                  </div>
                </div>
                {(status === 'assigned' || status === 'in-progress') && assignedDriver && (
                  <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-xl font-bold">
                    <Star size={18} fill="currentColor" /> {assignedDriver.rating.toFixed(1)}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-16 right-3 sm:top-20 sm:right-8 flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold shadow-lg text-xs sm:text-sm">
          <Shield size={18} /> Verified Safe
        </div>
      </GlassCard>
    </div>
  );
};

export default Taxi;
 

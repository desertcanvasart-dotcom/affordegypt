// ServiceBookingForm — inline booking form for /services/:slug.
//
// Each catalog row carries a single trip type (the import collapses
// `${vehicle}_${tripType}` keys to a single trip type per row, see
// catalog-service-picker.tsx). So the trip-type dropdown is normally a
// read-only label; if a row ever does carry multiple, we expose them as
// a select.

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TRIP_TYPE_LABELS,
  VEHICLE_LABELS,
  type VehicleSlug,
} from "@/components/catalog-service-picker";
import { CheckCircle2 } from "lucide-react";

const ALL_VEHICLES: VehicleSlug[] = ["sedan", "minivan", "van"];

interface ServiceForForm {
  slug: string;
  name: string;
  city: string;
  vehicle_prices: Record<string, number>;
}

interface Props {
  service: ServiceForForm;
}

interface VehicleTripCombos {
  vehicles: VehicleSlug[];
  tripTypes: string[];
  // matrix[vehicle][tripType] = price | undefined
  matrix: Record<string, Record<string, number>>;
}

function deriveCombos(prices: Record<string, number>): VehicleTripCombos {
  const matrix: Record<string, Record<string, number>> = {};
  const tripSet = new Set<string>();
  const vehSet = new Set<VehicleSlug>();
  for (const [key, value] of Object.entries(prices)) {
    if (!Number.isFinite(value) || value <= 0) continue;
    for (const v of ALL_VEHICLES) {
      if (key.startsWith(`${v}_`)) {
        const trip = key.slice(v.length + 1);
        if (!matrix[v]) matrix[v] = {};
        matrix[v][trip] = value;
        tripSet.add(trip);
        vehSet.add(v);
        break;
      }
    }
  }
  const vehicles = ALL_VEHICLES.filter((v) => vehSet.has(v));
  const tripTypes = Array.from(tripSet);
  return { vehicles, tripTypes, matrix };
}

function tomorrowIsoDate(): string {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const formatEGP = (n: number) =>
  `EGP ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n))}`;

interface ServerResponse {
  ok: boolean;
  errors?: Record<string, string>;
  summary?: {
    service_name: string;
    vehicle_label: string;
    trip_type_label: string;
    service_date: string;
    pickup_time: string;
    passenger_count: number;
    price_egp: number;
  };
}

export default function ServiceBookingForm({ service }: Props) {
  const combos = useMemo(() => deriveCombos(service.vehicle_prices), [service.vehicle_prices]);

  const initialVehicle = combos.vehicles[0] ?? "sedan";
  const initialTrip = (combos.matrix[initialVehicle] && Object.keys(combos.matrix[initialVehicle])[0]) ?? "";

  const [vehicle, setVehicle] = useState<VehicleSlug>(initialVehicle);
  const [tripType, setTripType] = useState<string>(initialTrip);
  const [serviceDate, setServiceDate] = useState<string>("");
  const [pickupTime, setPickupTime] = useState<string>("");
  const [passengers, setPassengers] = useState<number>(2);
  const [pickupNotes, setPickupNotes] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<ServerResponse["summary"] | null>(null);

  // Trip types available for the chosen vehicle. When vehicle changes
  // and the current tripType isn't priced for that vehicle, we auto-fall
  // back to the first option.
  const tripTypesForVehicle = useMemo(() => {
    const m = combos.matrix[vehicle];
    return m ? Object.keys(m) : [];
  }, [combos, vehicle]);

  const livePrice = combos.matrix[vehicle]?.[tripType];

  function onVehicleChange(next: VehicleSlug) {
    setVehicle(next);
    const opts = combos.matrix[next] ? Object.keys(combos.matrix[next]) : [];
    if (!opts.includes(tripType)) {
      setTripType(opts[0] ?? "");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries/transportation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: service.slug,
          vehicle_slug: vehicle,
          trip_type_slug: tripType,
          service_date: serviceDate,
          pickup_time: pickupTime,
          passenger_count: passengers,
          pickup_notes: pickupNotes || null,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          message: message || null,
        }),
      });
      const data = (await res.json().catch(() => null)) as ServerResponse | null;
      if (!res.ok || !data?.ok) {
        setErrors(data?.errors ?? { _global: `Request failed (${res.status})` });
        return;
      }
      setSuccess(data.summary ?? null);
    } catch (err: any) {
      setErrors({ _global: err?.message ?? "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  function resetForAnother() {
    setSuccess(null);
    setServiceDate("");
    setPickupTime("");
    setPassengers(2);
    setPickupNotes("");
    setMessage("");
    setErrors({});
  }

  if (success) {
    return (
      <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xl font-semibold text-green-900">
              Your transfer inquiry has been received.
            </h3>
            <p className="text-green-800 mt-1">
              We'll respond within 1 hour via WhatsApp during Cairo business hours.
            </p>
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 text-sm space-y-1 border border-green-200">
          <div><span className="font-medium">{success.service_name}</span></div>
          <div className="text-gray-700">
            {success.vehicle_label} &middot; {success.trip_type_label}
          </div>
          <div className="text-gray-700">
            {success.service_date} at {success.pickup_time} &middot; {success.passenger_count} passenger
            {success.passenger_count === 1 ? "" : "s"}
          </div>
          <div className="text-lg font-bold text-primary mt-2">{formatEGP(success.price_egp)}</div>
        </div>
        <button
          type="button"
          onClick={resetForAnother}
          className="mt-4 text-primary font-medium hover:underline"
        >
          Book another transfer →
        </button>
      </div>
    );
  }

  if (combos.vehicles.length === 0) {
    return (
      <div className="rounded-xl border bg-amber-50 border-amber-200 p-6 text-amber-900">
        This service isn't currently bookable online. Please contact us on WhatsApp.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-white p-6 space-y-5 shadow-sm">
      <div>
        <h3 className="text-xl font-semibold">Reserve this transfer</h3>
        <p className="text-sm text-gray-600 mt-1">
          We'll confirm on WhatsApp within 1 hour. No payment required at this stage.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vehicle">Vehicle</Label>
          <Select value={vehicle} onValueChange={(v) => onVehicleChange(v as VehicleSlug)}>
            <SelectTrigger id="vehicle"><SelectValue /></SelectTrigger>
            <SelectContent>
              {combos.vehicles.map((v) => (
                <SelectItem key={v} value={v}>{VEHICLE_LABELS[v]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicle_slug && <p className="text-xs text-red-600 mt-1">{errors.vehicle_slug}</p>}
        </div>

        <div>
          <Label htmlFor="trip-type">Trip type</Label>
          <Select value={tripType} onValueChange={setTripType}>
            <SelectTrigger id="trip-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              {tripTypesForVehicle.map((t) => (
                <SelectItem key={t} value={t}>{TRIP_TYPE_LABELS[t] ?? t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.trip_type_slug && <p className="text-xs text-red-600 mt-1">{errors.trip_type_slug}</p>}
        </div>
      </div>

      {typeof livePrice === "number" && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="text-xs uppercase tracking-wide text-primary font-medium">Your price</div>
          <div className="text-3xl font-bold text-primary">{formatEGP(livePrice)}</div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="service-date">Service date</Label>
          <Input
            id="service-date"
            type="date"
            min={tomorrowIsoDate()}
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            required
          />
          {errors.service_date && <p className="text-xs text-red-600 mt-1">{errors.service_date}</p>}
        </div>

        <div>
          <Label htmlFor="pickup-time">Pickup time</Label>
          <Input
            id="pickup-time"
            type="time"
            placeholder="e.g. 09:00"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            required
          />
          {errors.pickup_time && <p className="text-xs text-red-600 mt-1">{errors.pickup_time}</p>}
        </div>

        <div>
          <Label htmlFor="passengers">Number of passengers</Label>
          <Input
            id="passengers"
            type="number"
            min={1}
            max={12}
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value) || 1)}
            required
          />
          {errors.passenger_count && <p className="text-xs text-red-600 mt-1">{errors.passenger_count}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="pickup-notes">Pickup location notes (optional)</Label>
        <Textarea
          id="pickup-notes"
          rows={2}
          placeholder="Hotel name, flight number, or address"
          value={pickupNotes}
          onChange={(e) => setPickupNotes(e.target.value)}
        />
      </div>

      <div className="border-t pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cust-name">Your name</Label>
          <Input id="cust-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          {errors.customer_name && <p className="text-xs text-red-600 mt-1">{errors.customer_name}</p>}
        </div>
        <div>
          <Label htmlFor="cust-email">Email</Label>
          <Input id="cust-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
          {errors.customer_email && <p className="text-xs text-red-600 mt-1">{errors.customer_email}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cust-phone">WhatsApp / phone</Label>
          <Input
            id="cust-phone"
            type="tel"
            placeholder="+20 ... or your country code"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
          />
          {errors.customer_phone && <p className="text-xs text-red-600 mt-1">{errors.customer_phone}</p>}
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="message">Message (optional)</Label>
          <Textarea
            id="message"
            rows={2}
            placeholder="Anything else we should know?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>

      {errors._global && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm p-3">
          {errors._global}
        </div>
      )}

      <Button type="submit" disabled={submitting} size="lg" className="w-full sm:w-auto">
        {submitting ? "Sending..." : "Confirm booking inquiry"}
      </Button>
    </form>
  );
}

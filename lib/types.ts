export type Band = "low" | "moderate" | "high";

export type Answers = Record<string, string[]>;

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  experience: string;
  experienceYears: number;
  photo: string;
  centreIds: string[];
}

export interface Centre {
  id: string;
  name: string;
  city: string;
  label: string;
  rating: number;
  address: string;
  mapsQuery: string;
  lat: number;
  lng: number;
}

export interface Slot {
  start: string;
  end: string;
}

export interface SlotOption extends Slot {
  available: boolean;
}

export interface SlotDay {
  date: string;
  closed: boolean;
  slots: SlotOption[];
}

export interface DoctorOption {
  doctor: Doctor;
  centre: Centre;
  distanceKm: number | null;
  recommended: boolean;
  reason?: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export type PaymentMode = "hospital" | "online";
export type PaymentStatus = "pending" | "paid";
export type Companion = "partner" | "alone";

export interface Fees {
  consultation: number;
  registration: number;
  total: number;
}

export interface PatientProfile {
  id: string;
  name: string;
  age?: number;
}

export type BookingPatientChoice =
  | { kind: "registered"; patientId: string }
  | { kind: "new"; name: string; age: number };

export interface Booking {
  id: string;
  createdAt: string;
  centre: Centre;
  doctor: Doctor;
  slot: Slot;
  patient: {
    name: string;
    phone: string;
    age?: number;
    companion: Companion;
    patientId?: string;
    /** True when this booking created the patient's registration. */
    newlyRegistered?: boolean;
  };
  fees: Fees;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
}

export interface ScoreResult {
  score: number;
  band: Band;
}

export interface ApiError {
  error: string;
  retryAfter?: number;
}

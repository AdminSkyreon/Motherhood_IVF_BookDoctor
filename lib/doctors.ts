import { CENTRES, DEFAULT_CENTRE_ID, DOCTORS, getCentre } from "@/lib/data/centres";
import type { Centre, Doctor, DoctorOption, LatLng } from "@/lib/types";

export interface RankInput {
  location: LatLng | null;
  fallbackCentreId?: string | null;
  /** High fertility-risk band or prior IUI/IVF: favour the most senior specialist. */
  complexCase?: boolean;
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function isSenior(doctor: Doctor): boolean {
  return /senior/i.test(doctor.specialty) || doctor.experienceYears >= 18;
}

/** Best match among one hospital's doctors, using the same rule as rankDoctors. */
export function recommendAtCentre(centreId: string, complexCase: boolean): Doctor | undefined {
  const doctors = DOCTORS.filter((d) => d.centreIds.includes(centreId)).sort((a, b) => {
    if (complexCase && isSenior(a) !== isSenior(b)) return isSenior(a) ? -1 : 1;
    return b.experienceYears - a.experienceYears;
  });
  return doctors[0];
}

function centresOf(doctor: Doctor): Centre[] {
  return doctor.centreIds.map((id) => getCentre(id)).filter((c): c is Centre => Boolean(c));
}

/**
 * Orders every doctor by how close their nearest centre is to the patient (or to the
 * chosen centre when location is unavailable) and flags one recommendation.
 */
export function rankDoctors({ location, fallbackCentreId, complexCase = false }: RankInput): DoctorOption[] {
  const anchorCentre = getCentre(fallbackCentreId) ?? getCentre(DEFAULT_CENTRE_ID) ?? CENTRES[0];
  const origin: LatLng = location ?? anchorCentre;

  const options = DOCTORS.map((doctor) => {
    const [centre, km] = centresOf(doctor)
      .map((c) => [c, distanceKm(origin, c)] as const)
      .sort((a, b) => a[1] - b[1])[0];
    return { doctor, centre, km };
  }).sort((a, b) => a.km - b.km || b.doctor.experienceYears - a.doctor.experienceYears);

  const nearestKm = options[0].km;
  // Doctors within a short drive of the closest centre are all reasonable picks.
  const nearby = options.filter((o) => o.km <= nearestKm + 5);
  const pick = [...nearby].sort((a, b) => {
    if (complexCase && isSenior(a.doctor) !== isSenior(b.doctor)) return isSenior(a.doctor) ? -1 : 1;
    return b.doctor.experienceYears - a.doctor.experienceYears || a.km - b.km;
  })[0];

  const where = pick.centre.name.split(",")[0];
  const reason = complexCase
    ? `${pick.doctor.experience} in fertility care. Best suited to answers like yours, consulting at ${where}.`
    : `${pick.doctor.experience} of experience, consulting ${location ? "closest to you " : ""}at ${where}.`;

  const ordered = [pick, ...options.filter((o) => o !== pick)];
  return ordered.map(({ doctor, centre, km }) => ({
    doctor,
    centre,
    distanceKm: location ? Math.round(km * 10) / 10 : null,
    recommended: doctor.id === pick.doctor.id,
    reason: doctor.id === pick.doctor.id ? reason : undefined,
  }));
}

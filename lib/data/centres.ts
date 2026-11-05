import type { Centre, Doctor, Fees } from "@/lib/types";

// Coordinates are area-level approximations; replace with exact centre locations.
export const CENTRES: Centre[] = [
  {
    id: "electronic-city",
    name: "Electronic City, Bangalore",
    city: "Bengaluru",
    label: "Bengaluru Center",
    rating: 4.9,
    address: "Motherhood Fertility & IVF, Electronic City, Bengaluru",
    mapsQuery: "Motherhood Hospital Electronic City Bangalore",
    lat: 12.8456,
    lng: 77.6603,
  },
  {
    id: "sarjapur",
    name: "Sarjapur Road, Bangalore",
    city: "Bengaluru",
    label: "Bengaluru Center",
    rating: 4.8,
    address: "Motherhood Fertility & IVF, Sarjapur Road, Bengaluru",
    mapsQuery: "Motherhood Hospital Sarjapur Road Bangalore",
    lat: 12.9105,
    lng: 77.687,
  },
  {
    id: "banashankari",
    name: "Banashankari, Bangalore",
    city: "Bengaluru",
    label: "Bengaluru Center",
    rating: 4.8,
    address: "Motherhood Fertility & IVF, Banashankari, Bengaluru",
    mapsQuery: "Motherhood Hospital Banashankari Bangalore",
    lat: 12.9255,
    lng: 77.5468,
  },
  {
    id: "hrbr-layout",
    name: "HRBR Layout, Bangalore",
    city: "Bengaluru",
    label: "Bengaluru Center",
    rating: 4.8,
    address: "Motherhood Fertility & IVF, HRBR Layout, Bengaluru",
    mapsQuery: "Motherhood Hospital HRBR Layout Bangalore",
    lat: 13.0213,
    lng: 77.644,
  },
  {
    id: "kothanur",
    name: "Kothanur, Bangalore",
    city: "Bengaluru",
    label: "Bengaluru Center",
    rating: 4.8,
    address: "Motherhood Fertility & IVF, Kothanur, Bengaluru",
    mapsQuery: "Motherhood Hospital Kothanur Bangalore",
    lat: 13.061,
    lng: 77.646,
  },
  {
    id: "indiranagar",
    name: "Indiranagar, Bangalore",
    city: "Bengaluru",
    label: "Bengaluru Center",
    rating: 4.9,
    address: "Motherhood Fertility & IVF, Indiranagar, Bengaluru",
    mapsQuery: "Motherhood Hospital Indiranagar Bangalore",
    lat: 12.9719,
    lng: 77.6412,
  },
  {
    id: "kharghar",
    name: "Kharghar, Navi Mumbai",
    city: "Navi Mumbai",
    label: "Navi Mumbai Center",
    rating: 4.8,
    address: "Motherhood Fertility & IVF, Kharghar, Navi Mumbai",
    mapsQuery: "Motherhood Hospital Kharghar Navi Mumbai",
    lat: 19.0473,
    lng: 73.0699,
  },
  {
    id: "indore",
    name: "Rajiv Gandhi Circle, Indore",
    city: "Indore",
    label: "Indore Center",
    rating: 4.9,
    address: "Ground Floor, Motherhood Hospital, Rajiv Gandhi Circle, AB Road, Opp. Unity One Mall, Indore 452007",
    mapsQuery: "Motherhood Hospital Rajiv Gandhi Circle AB Road Indore 452007",
    lat: 22.6922,
    lng: 75.8678,
  },
  {
    id: "noida",
    name: "Noida",
    city: "Noida",
    label: "Noida Center",
    rating: 4.8,
    address: "Motherhood Fertility & IVF, Noida",
    mapsQuery: "Motherhood Hospital Noida",
    lat: 28.5355,
    lng: 77.391,
  },
  {
    id: "gurugram",
    name: "Gurugram",
    city: "Gurugram",
    label: "Gurugram Center",
    rating: 4.8,
    address: "Motherhood Fertility & IVF, Gurugram",
    mapsQuery: "Motherhood Hospital Gurugram",
    lat: 28.4595,
    lng: 77.0266,
  },
  {
    id: "mohali",
    name: "Mohali",
    city: "Mohali",
    label: "Mohali Center",
    rating: 4.8,
    address: "Motherhood Fertility & IVF, Mohali",
    mapsQuery: "Motherhood Hospital Mohali",
    lat: 30.7046,
    lng: 76.7179,
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: "madhu-patil",
    name: "Dr. Madhu Patil",
    specialty: "Consultant - Reproductive Medicine",
    credentials: "MBBS, DGO, DNB, Diploma in Reproductive Medicine (Germany)",
    experience: "13+ Years",
    experienceYears: 13,
    photo: "/doctors/dr-madhu-patil.webp",
    centreIds: ["electronic-city", "sarjapur"],
  },
  {
    id: "amitha-n",
    name: "Dr. Amitha N.",
    specialty: "Consultant - Reproductive Medicine",
    credentials: "MBBS, MS (OBG), Fellowship in Reproductive Medicine",
    experience: "14+ Years",
    experienceYears: 14,
    photo: "/doctors/dr-amitha-n.webp",
    centreIds: ["electronic-city"],
  },
  {
    id: "sharvari-mundhe",
    name: "Dr. Sharvari Mundhe",
    specialty: "Consultant - Gynaecology & Reproductive Medicine",
    credentials: "MBBS, MS (OBG), DNB, FRM, DRM (Diploma in Advanced ART)",
    experience: "12+ Years",
    experienceYears: 12,
    photo: "/doctors/dr-sharvari-mundhe.webp",
    centreIds: ["sarjapur"],
  },
  {
    id: "bhavana-girish",
    name: "Dr. Bhavana Girish",
    specialty: "Consultant - Reproductive Medicine",
    credentials: "MBBS, MD, DNB, FRM, FMAS",
    experience: "12+ Years",
    experienceYears: 12,
    photo: "/doctors/dr-bhavana-girish.webp",
    centreIds: ["banashankari"],
  },
  {
    id: "priyanka-reddy",
    name: "Dr. Priyanka Reddy",
    specialty: "Consultant - Reproductive Medicine",
    credentials: "MBBS, MS (OBG), Fellowship in Reproductive Medicine, Fellowship & Diploma in Minimal Access Surgery",
    experience: "10+ Years",
    experienceYears: 10,
    photo: "/doctors/dr-priyanka-reddy.webp",
    centreIds: ["hrbr-layout", "kothanur"],
  },
  {
    id: "sandhya-ghode",
    name: "Dr. Sandhya Ghode",
    specialty: "Consultant - Reproductive Medicine",
    credentials: "MBBS, MS, DNB, FICOG (BOM)",
    experience: "10+ Years",
    experienceYears: 10,
    photo: "/doctors/dr-sandhya-ghode.webp",
    centreIds: ["indiranagar"],
  },
  {
    id: "anuranjita-pallavi",
    name: "Dr. Anuranjita Pallavi",
    specialty: "Senior IVF Consultant",
    credentials: "MBBS, MS (OBGY) - Gold Medalist, Fellowship in Reproductive Medicine (FRM)",
    experience: "11+ Years",
    experienceYears: 11,
    photo: "/doctors/dr-anuranjita-pallavi.webp",
    centreIds: ["kharghar"],
  },
  {
    id: "asha-baxi",
    name: "Dr. Asha Baxi",
    specialty: "Consultant - Obstetrics, Gynaecology & Reproductive Medicine",
    credentials: "MBBS, MS, FICOG, FRCOG",
    experience: "30+ Years",
    experienceYears: 30,
    photo: "/doctors/dr-asha-baxi.webp",
    centreIds: ["indore"],
  },
  {
    id: "aakriti-lamba",
    name: "Dr. Aakriti Lamba",
    specialty: "Consultant - IVF & Fertility",
    credentials: "MBBS, M.S. (Obstetrics & Gynaecology), FRM (Fellowship in Reproductive Medicine)",
    experience: "6+ Years",
    experienceYears: 6,
    photo: "/doctors/dr-aakriti-lamba.webp",
    centreIds: ["indore"],
  },
  {
    id: "mandavi-rai",
    name: "Dr. Mandavi Rai",
    specialty: "Senior Consultant - Reproductive Medicine",
    credentials:
      "MBBS, MS (OBG), M.MAS, PGDS, Fellowship in Reproductive Medicine (Singapore), PG Diploma in Reproductive Medicine (UK)",
    experience: "10+ Years",
    experienceYears: 10,
    photo: "/doctors/dr-mandavi-rai.webp",
    centreIds: ["noida"],
  },
  {
    id: "jyoti-gupta",
    name: "Dr. Jyoti Gupta",
    specialty: "Senior Consultant - Reproductive Medicine",
    credentials: "MBBS, MD, DNB, MNAMS, FMAS, DCR, MRCOG(I)",
    experience: "18+ Years",
    experienceYears: 18,
    photo: "/doctors/dr-jyoti-gupta.webp",
    centreIds: ["gurugram"],
  },
  {
    id: "vandna-narula",
    name: "Dr. Vandna Narula",
    specialty: "Consultant - Reproductive Medicine",
    credentials: "MBBS, MD (Obstetrics & Gynaecology)",
    experience: "25+ Years",
    experienceYears: 25,
    photo: "/doctors/dr-vandna-narula.webp",
    centreIds: ["mohali"],
  },
];

export const DEFAULT_CENTRE_ID = CENTRES[0].id;

export const CITIES: string[] = [...new Set(CENTRES.map((c) => c.city))];

export function centresInCity(city: string): Centre[] {
  return CENTRES.filter((c) => c.city === city);
}

export function doctorsAtCentre(centreId: string): Doctor[] {
  return DOCTORS.filter((d) => d.centreIds.includes(centreId)).sort((a, b) => b.experienceYears - a.experienceYears);
}

const CONSULTATION_FEE = 900;
const REGISTRATION_FEE = 250;

/** Registered (returning) patients don't pay the one-time registration charge. */
export function feesFor(registered: boolean): Fees {
  const registration = registered ? 0 : REGISTRATION_FEE;
  return { consultation: CONSULTATION_FEE, registration, total: CONSULTATION_FEE + registration };
}

export function getCentre(id: string | null | undefined): Centre | undefined {
  return CENTRES.find((c) => c.id === id);
}

export function getDoctor(id: string | null | undefined): Doctor | undefined {
  return DOCTORS.find((d) => d.id === id);
}

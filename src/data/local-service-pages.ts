export interface LocalServicePage {
  path: string;
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  summary: string;
  keywords: string[];
  services: Array<{ title: string; description: string }>;
  bestFor: string[];
  process: Array<{ step: string; title: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
}

export const localServicePages: LocalServicePage[] = [
  {
    path: "/cctv-installation-chitwan",
    title: "CCTV Installation in Chitwan | Super Star Electronics",
    description:
      "Professional CCTV installation in Chitwan for homes, shops, offices, and factories, including camera planning, clean wiring, recording setup, and mobile viewing support.",
    eyebrow: "CCTV installation in Chitwan",
    headline: "A CCTV system planned for the way your space actually works.",
    intro:
      "Super Star Electronics helps homes, shops, offices, and factories in Chitwan move from a camera idea to a dependable working system. We look at the space, recommend practical coverage, install carefully, and show you how to use the system.",
    summary:
      "Site review, camera placement, wiring, recorder setup, remote viewing, and handover support from our Narayangarh team.",
    keywords: [
      "CCTV installation Chitwan",
      "CCTV installer Bharatpur",
      "security camera installation Narayangarh",
    ],
    services: [
      {
        title: "Coverage planning",
        description:
          "We review entrances, counters, gates, storage areas, and other points that matter before recommending camera positions.",
      },
      {
        title: "Neat installation",
        description:
          "Our team handles camera mounting, cable routing, power, and recorder connections for a clean and practical setup.",
      },
      {
        title: "Recording and mobile viewing",
        description:
          "We configure the recorder and help connect supported systems for convenient viewing from a phone or computer.",
      },
      {
        title: "Handover and support",
        description:
          "You receive a clear handover with basic guidance, followed by repair, maintenance, and after-sales support when needed.",
      },
    ],
    bestFor: ["Homes and apartments", "Retail shops", "Offices", "Factories and institutions"],
    process: [
      { step: "01", title: "Understand the space", description: "Tell us what needs protecting and where you need visibility." },
      { step: "02", title: "Plan the coverage", description: "We match cameras, recording, networking, and budget to the site." },
      { step: "03", title: "Install and configure", description: "We mount, connect, test, and organize the system." },
      { step: "04", title: "Hand over clearly", description: "We explain everyday use and remain available after installation." },
    ],
    faqs: [
      {
        question: "Can you install CCTV in an existing building?",
        answer:
          "Yes. We can review the existing wiring, network, power, and recorder before recommending whether to reuse, repair, or upgrade the system.",
      },
      {
        question: "Can I view the cameras on my phone?",
        answer:
          "Supported systems can be configured for mobile viewing when the site has suitable internet and network access. We help with the setup and basic handover.",
      },
      {
        question: "Do you provide a site visit in Chitwan?",
        answer:
          "Free site visits are available in Chitwan for camera planning and coverage advice. Contact us first so we can confirm timing and location.",
      },
    ],
  },
  {
    path: "/cctv-repair-maintenance-chitwan",
    title: "CCTV Repair & Maintenance in Chitwan | Super Star Electronics",
    description:
      "CCTV repair and maintenance in Chitwan for cameras, DVRs, NVRs, power, cabling, networking, storage, and remote viewing problems.",
    eyebrow: "CCTV repair and maintenance",
    headline: "When your cameras stop helping, start with a clear diagnosis.",
    intro:
      "Super Star Electronics supports customers who need an existing CCTV system checked, repaired, cleaned, upgraded, or made easier to use. We can assess systems installed by us or by another provider.",
    summary:
      "Fault diagnosis, camera and recorder checks, power and cable troubleshooting, remote-viewing help, maintenance, and upgrade advice.",
    keywords: [
      "CCTV repair Chitwan",
      "CCTV maintenance Bharatpur",
      "DVR NVR repair Narayangarh",
    ],
    services: [
      {
        title: "Camera and recorder checks",
        description:
          "We investigate blank screens, missing channels, recording failures, image problems, and recorder settings.",
      },
      {
        title: "Power, cable, and network faults",
        description:
          "We check power supplies, connectors, cable runs, switches, routers, and network access affecting the system.",
      },
      {
        title: "Remote viewing support",
        description:
          "We help identify problems with mobile apps, internet access, permissions, and the connection between the site and your device.",
      },
      {
        title: "Maintenance and upgrades",
        description:
          "Cleaning, camera replacement, storage improvements, additional coverage, and practical upgrade recommendations are available.",
      },
    ],
    bestFor: ["Homes with an older system", "Shops with recording problems", "Offices with network issues", "Sites needing additional cameras"],
    process: [
      { step: "01", title: "Describe the problem", description: "Send us the symptoms, photos, or a short video if useful." },
      { step: "02", title: "Check the system", description: "We inspect the likely causes across camera, recorder, power, and network." },
      { step: "03", title: "Explain the options", description: "You receive a practical repair, replacement, or upgrade recommendation." },
      { step: "04", title: "Test the result", description: "We check the system again and explain what was changed." },
    ],
    faqs: [
      {
        question: "Can you repair a CCTV system installed by another company?",
        answer:
          "Yes. We can inspect existing systems and advise on repair, replacement, or expansion based on the condition of the equipment and wiring.",
      },
      {
        question: "Why is my CCTV recording not working?",
        answer:
          "Common causes include storage problems, recorder settings, power faults, disconnected cameras, damaged cables, or network issues. A system check is needed to identify the actual cause.",
      },
      {
        question: "Do you support CCTV maintenance in Bharatpur and Narayangarh?",
        answer:
          "We are based at Ganesh Market, Narayangarh, and support customers in Chitwan. Contact us with your location and issue so we can confirm service availability.",
      },
    ],
  },
  {
    path: "/security-systems-bharatpur",
    title: "Security Systems in Bharatpur & Narayangarh | Super Star Electronics",
    description:
      "CCTV cameras, wireless security, access control, networking, installation, and after-sales support for homes and businesses in Bharatpur, Narayangarh, and Chitwan.",
    eyebrow: "Security systems in Bharatpur",
    headline: "Practical security systems for homes, shops, offices, and institutions.",
    intro:
      "From a single wireless camera to a complete business setup, Super Star Electronics helps customers in Bharatpur and Narayangarh choose products that fit the space, the network, and the budget.",
    summary:
      "CCTV supply, installation, recording, networking, access control, repair, and local support from Ganesh Market, Narayangarh.",
    keywords: [
      "security systems Bharatpur",
      "CCTV shop Narayangarh",
      "security camera dealer Chitwan",
    ],
    services: [
      {
        title: "Home security",
        description:
          "Entry points, gates, floors, and mobile viewing for practical everyday monitoring at home.",
      },
      {
        title: "Shop and office monitoring",
        description:
          "Coverage for counters, reception areas, storage, workspaces, and other important business zones.",
      },
      {
        title: "Networking and remote access",
        description:
          "Routers, switches, PoE, and network planning to keep connected security systems stable and usable.",
      },
      {
        title: "Access and security devices",
        description:
          "We also support access control, biometric devices, intercoms, and related security equipment.",
      },
    ],
    bestFor: ["Homes and apartments", "Retail and wholesale businesses", "Offices and schools", "Factories and institutions"],
    process: [
      { step: "01", title: "Share the requirement", description: "Tell us the property type, location, coverage area, and main concern." },
      { step: "02", title: "Compare the right options", description: "We help you compare cameras, recorders, networking, and budget." },
      { step: "03", title: "Build the working setup", description: "Buy the equipment with installation and configuration support when needed." },
      { step: "04", title: "Stay supported", description: "Reach the team for guidance, maintenance, repair, and future expansion." },
    ],
    faqs: [
      {
        question: "Where is Super Star Electronics located?",
        answer:
          "We are located at Ganesh Market, Narayangarh, Chitwan. Call or WhatsApp before visiting to confirm product availability or request a site visit.",
      },
      {
        question: "Do you supply products as well as install them?",
        answer:
          "Yes. We provide wholesale and retail supply for CCTV, networking, recording, access control, and related security products, with installation support available.",
      },
      {
        question: "Which brands do you work with?",
        answer:
          "Our current website catalogue and brand range include Hikvision, EZVIZ, HiLook, IMOU, Tiandy, Consistent, and ZKTeco. Availability can vary, so contact us for current models.",
      },
    ],
  },
];

export function getLocalServicePage(path: string) {
  return localServicePages.find((page) => page.path === path);
}

export function getRequiredLocalServicePage(path: string): LocalServicePage {
  const page = getLocalServicePage(path);
  if (!page) throw new Error(`Missing local service page data for ${path}`);
  return page;
}

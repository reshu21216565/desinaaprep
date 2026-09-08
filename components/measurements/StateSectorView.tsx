"use client";

import { useState, useMemo, useEffect } from "react";
import { Measurement, Sector } from "@/types";
import MeasurementCard from "@/components/measurements/MeasurementCard";
import { Table, LayoutGrid, Sparkles, ExternalLink } from "lucide-react";

interface StateSectorViewProps {
  stateName: string;
  measurements: Measurement[];
  sectors: Sector[];
}

// Canonical ordering for sectors as requested
const SECTOR_ORDER = [
  "transportation-distance",
  "land-measurement",
  "livestock-dairy",
  "household",
  "gold-jewellery",
  "agriculture",
  "currency-money",
  "storage-transport",
  "religious-cultural",
  "trade-commerce",
  "textile-handloom",
  "medicine",
  "architecture",
];

// Display title lookup map for all possible sector keys
const SECTOR_TITLE_MAP: Record<string, string> = {
  "transportation-distance": "Transportation & Distance",
  "trans-dist": "Transportation & Distance",
  "land-measurement": "Land Measurement",
  "land": "Land Measurement",
  "livestock-dairy": "Livestock & Dairy",
  "dairy": "Livestock & Dairy",
  "household": "Household & Daily Life",
  "hh": "Household & Daily Life",
  "gold-jewellery": "Gold & Jewellery",
  "gold": "Gold & Jewellery",
  "agriculture": "Seed & Crop (Agriculture)",
  "agri": "Seed & Crop (Agriculture)",
  "seed-crop": "Seed & Crop (Agriculture)",
  "currency-money": "Currency & Money",
  "currency": "Currency & Money",
  "storage-transport": "Storage & Transportation",
  "storage": "Storage & Transportation",
  "religious-cultural": "Religious & Cultural",
  "relig": "Religious & Cultural",
  "trade-commerce": "Trade & Commerce",
  "trade": "Trade & Commerce",
  "textile-handloom": "Textile & Handloom",
  "textile": "Textile & Handloom",
  "medicine": "Medicine (Ayurveda)",
  "med": "Medicine (Ayurveda)",
  "architecture": "Construction & Architecture",
  "arch": "Construction & Architecture",
  "construction": "Construction & Architecture",
};

export default function StateSectorView({
  stateName,
  measurements,
  sectors,
}: StateSectorViewProps) {
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sector display name lookup map
  const sectorNameMap = useMemo(() => {
    const map = new Map<string, string>();
    // Pre-populate with standard titles
    Object.entries(SECTOR_TITLE_MAP).forEach(([k, v]) => {
      map.set(k, v);
    });
    // Add dynamically provided sectors from props
    sectors.forEach((s) => {
      map.set(s.slug, s.name);
      map.set(s.id, s.name);
      map.set(s.name.toLowerCase(), s.name);
    });
    return map;
  }, [sectors]);

  // Determine local language subtitle based on state name
  const localLangSubtitle = useMemo(() => {
    const s = stateName.toLowerCase();
    if (s.includes("jharkhand")) return "Nagpuri/Sadri";
    if (s.includes("bihar")) return "Hindi";
    if (s.includes("haryana")) return "Haryanvi/Hindi";
    if (s.includes("assam")) return "Assamese/Hindi";
    if (s.includes("uttar pradesh") || s === "up") return "Hindi/Awadhi";
    if (s.includes("telangana") || s.includes("andhra")) return "Telugu";
    if (s.includes("tamil nadu")) return "Tamil";
    if (s.includes("karnataka")) return "Kannada";
    if (s.includes("maharashtra")) return "Marathi";
    if (s.includes("gujarat")) return "Gujarati";
    if (s.includes("rajasthan")) return "Rajasthani";
    if (s.includes("bengal")) return "Bengali";
    if (s.includes("odisha")) return "Odia";
    if (s.includes("kerala")) return "Malayalam";
    if (s.includes("punjab")) return "Punjabi";
    return "Local Language";
  }, [stateName]);

  // Group measurements by sector key
  const sectorGroups = useMemo(() => {
    const map = new Map<string, Measurement[]>();
    measurements.forEach((m) => {
      const key = m.sector || "other";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(m);
    });
    return map;
  }, [measurements]);

  // Active sector keys ordered canonically
  const activeSectorKeys = useMemo(() => {
    const keys = Array.from(sectorGroups.keys());
    return keys.sort((a, b) => {
      const indexA = SECTOR_ORDER.indexOf(a);
      const indexB = SECTOR_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [sectorGroups]);

  // Filtered measurements list
  const filtered = useMemo(() => {
    if (selectedSector === "all") {
      return measurements;
    }
    return sectorGroups.get(selectedSector) || [];
  }, [selectedSector, measurements, sectorGroups]);

  // Dynamic banner title
  const currentSectorTitle = selectedSector === "all"
    ? `${stateName} Traditional Measurement Units`
    : `${sectorNameMap.get(selectedSector) || selectedSector} — ${stateName} Traditional Measurement Units (Small → Large)`;

  return (
    <div className="space-y-6 w-full">
      {/* Sector Filter & View Switcher Box */}
      <div className="bg-white border border-[#E8DED1] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0E6D8] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6F4E37]" />
            <h3 className="font-serif font-bold text-base text-[#2E2A26]">
              Sectors in {stateName}
            </h3>
          </div>

          {/* View Mode Switcher Button (Top-Right) */}
          <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#E8DED1] p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "table"
                  ? "bg-[#6F4E37] text-white shadow-sm font-semibold"
                  : "text-[#7A6E65] hover:text-[#2E2A26] hover:bg-[#EAE2D5]"
              }`}
              title="Switch to Excel Table View"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Excel Table</span>
            </button>

            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === "card"
                  ? "bg-[#6F4E37] text-white shadow-sm font-semibold"
                  : "text-[#7A6E65] hover:text-[#2E2A26] hover:bg-[#EAE2D5]"
              }`}
              title="Switch to Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* Rounded Sector Pills */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedSector("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              selectedSector === "all"
                ? "bg-[#6F4E37] text-white shadow-sm font-semibold border border-[#6F4E37]"
                : "bg-[#FAF7F2] text-[#6F4E37] border border-[#E8DED1] hover:border-[#6F4E37] hover:bg-[#6F4E37] hover:text-white"
            }`}
          >
            All Sectors ({measurements.length})
          </button>

          {activeSectorKeys.map((secKey) => {
            const count = sectorGroups.get(secKey)?.length || 0;
            const displayName = sectorNameMap.get(secKey) || secKey;

            return (
              <button
                key={secKey}
                onClick={() => setSelectedSector(secKey)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedSector === secKey
                    ? "bg-[#6F4E37] text-white shadow-sm font-semibold border border-[#6F4E37]"
                    : "bg-[#FAF7F2] text-[#6F4E37] border border-[#E8DED1] hover:border-[#6F4E37] hover:bg-[#6F4E37] hover:text-white"
                }`}
              >
                {displayName} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Showing count indicator */}
      <div className="text-xs text-[#7A6E65] font-medium flex items-center justify-between px-1">
        <span>
          Showing <strong className="text-[#2E2A26]">{filtered.length}</strong> of{" "}
          <strong className="text-[#2E2A26]">{measurements.length}</strong> units
          {selectedSector !== "all" && (
            <span>
              {" "}
              in <strong className="text-[#6F4E37]">{sectorNameMap.get(selectedSector) || selectedSector}</strong>
            </span>
          )}
        </span>
      </div>

      {/* Main Measurements Display (Excel Data Table vs Cards) */}
      {filtered.length > 0 ? (
        viewMode === "table" ? (
          /* Spreadsheet Excel Data Table Matching Uploaded Spreadsheets (9 Styled Columns) */
          <div className="bg-white border border-[#E8DED1] rounded-xl shadow-sm overflow-hidden w-full">
            {/* Dark Burgundy Header Banner Bar */}
            <div className="bg-[#7A282B] text-white px-5 py-3 font-serif font-bold text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#601F22]">
              <span>{currentSectorTitle}</span>
              <span className="text-xs font-sans font-normal text-[#F3D5D7] bg-[#5C1D20] px-2.5 py-0.5 rounded-full border border-[#8B3538] self-start sm:self-auto">
                {filtered.length} {filtered.length === 1 ? "Unit" : "Units"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[960px]">
                <thead>
                  <tr className="bg-[#802426] text-white font-semibold border-b border-[#671C1E] divide-x divide-[#9C3A3C]">
                    <th className="py-3.5 px-3 w-10 text-center">#</th>
                    <th className="py-3.5 px-4 font-bold min-w-[120px]">Unit Name</th>
                    <th className="py-3.5 px-4 min-w-[130px]">Sanskrit Name</th>
                    <th className="py-3.5 px-4 min-w-[150px]">
                      Local Language Name
                      <span className="block text-[10px] text-[#E5C4C5] font-normal font-sans mt-0.5">
                        ({localLangSubtitle})
                      </span>
                    </th>
                    <th className="py-3.5 px-4 min-w-[110px]">Hindi Name</th>
                    <th className="py-3.5 px-3 min-w-[110px]">Type / Category</th>
                    <th className="py-3.5 px-4 min-w-[140px]">Approx. Modern Equivalent</th>
                    <th className="py-3.5 px-4 min-w-[140px]">Relation / Hierarchy</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Used In / Context and Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DED1] text-[#2E2A26]">
                  {filtered.map((m, idx) => (
                    <tr
                      key={m.id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-[#FDF3ED]"
                      } hover:bg-[#F5E6DA] transition-colors divide-x divide-[#E8DED1]`}
                    >
                      {/* # */}
                      <td className="py-3.5 px-3 text-center font-bold text-[#802426]">
                        {idx + 1}
                      </td>

                      {/* Unit Name */}
                      <td className="py-3.5 px-4 font-bold text-[#2E2A26]">
                        {m.name_english}
                      </td>

                      {/* Sanskrit Name */}
                      <td className="py-3.5 px-4 text-[#4A3E39]">
                        {m.name_sanskrit || "—"}
                      </td>

                      {/* Local Language Name */}
                      <td className="py-3.5 px-4 text-[#2E2A26] font-medium">
                        {m.local_names && m.local_names.length > 0
                          ? m.local_names.join(", ")
                          : "—"}
                      </td>

                      {/* Hindi Name */}
                      <td className="py-3.5 px-4 text-[#2E2A26]">
                        {m.name_hindi || "—"}
                      </td>

                      {/* Type / Category */}
                      <td className="py-3.5 px-3 capitalize">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-[#FAF0E6] text-[#7A282B] border border-[#E8DED1]">
                          {m.category}
                        </span>
                      </td>

                      {/* Approx. Modern Equivalent */}
                      <td className="py-3.5 px-4 text-[#7A282B] font-mono text-[11px] font-semibold">
                        {m.modern_equivalent || "—"}
                      </td>

                      {/* Relation / Hierarchy */}
                      <td className="py-3.5 px-4 text-[#4A3E39] text-[11px]">
                        {m.conversion_formula ||
                          (m.hierarchy && m.hierarchy.length > 0
                            ? m.hierarchy.map((h) => h.unit).join("; ")
                            : "—")}
                      </td>

                      {/* Used In / Context and Reference */}
                      <td className="py-3.5 px-4 text-[#3D3531] text-[11px] leading-relaxed max-w-sm">
                        <div>
                          {m.meaning || (m.used_in && m.used_in.join(", ")) || "—"}
                        </div>
                        {m.references && m.references.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {m.references.map((refUrl, rIdx) => (
                              <a
                                key={rIdx}
                                href={refUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-[#7A282B] hover:text-[#52181A] hover:underline bg-[#FAF0E6] border border-[#E8DED1] px-1.5 py-0.5 rounded truncate max-w-[200px]"
                                title={refUrl}
                              >
                                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="truncate">{refUrl}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {filtered.map((m) => (
              <MeasurementCard key={m.id} m={m} />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-12 bg-white border border-[#E8DED1] rounded-xl w-full">
          <p className="text-[#A09080] text-sm">
            No measurements found for this sector.
          </p>
        </div>
      )}
    </div>
  );
}


"use client";

type EngagementRecord = readonly [
  `0x${string}`,
  string,
  string,
  `0x${string}`,
  `0x${string}`,
  string,
  string,
  bigint
];

export function LoveTree({ records }: { records: readonly EngagementRecord[] }) {
  const visibleRecords = records.length > 0 ? records : demoRecords;
  const centerX = 190;
  const rootY = 40;

  return (
    <section className="rounded-lg border border-[#d7b77d] bg-white/75 p-4 shadow-sm backdrop-blur">
      <h2 className="text-lg font-bold text-[#281a1f]">Cay tinh yeu</h2>
      <svg viewBox="0 0 380 360" className="mt-3 aspect-[19/18] w-full rounded-md bg-[#f4fbf7]" role="img" aria-label="Love tree visualizer">
        <circle cx={centerX} cy={rootY} r="25" fill="#2f7a5b" />
        <text x={centerX} y={rootY + 5} textAnchor="middle" className="fill-white text-[12px] font-bold">
          LOVE
        </text>
        {visibleRecords.map((record, index) => {
          const angle = (Math.PI / (visibleRecords.length + 1)) * (index + 1);
          const x = 40 + Math.sin(angle) * 300;
          const y = 104 + index * 54;
          return (
            <g key={`${record[1]}-${record[2]}-${index}`}>
              <path className="tree-link" d={`M${centerX} ${rootY + 25} C${centerX} ${y - 24}, ${x} ${y - 24}, ${x} ${y}`} fill="none" />
              <circle cx={x} cy={y} r="24" fill={index % 2 === 0 ? "#d94f70" : "#c9932f"} />
              <text x={x} y={y - 2} textAnchor="middle" className="fill-white text-[10px] font-bold">
                {record[1].slice(0, 8)}
              </text>
              <text x={x} y={y + 10} textAnchor="middle" className="fill-white text-[10px] font-bold">
                {record[2].slice(0, 8)}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

const demoRecords: EngagementRecord[] = [
  ["0x0000000000000000000000000000000000000000", "Minh", "Linh", zeroHash, zeroHash, "Demo", "Demo", 0n],
  ["0x0000000000000000000000000000000000000000", "Bao", "An", zeroHash, zeroHash, "Demo", "Demo", 0n]
];

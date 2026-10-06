"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Heart, Landmark, ShieldCheck, Trees, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { formatEther, keccak256, parseEther, toBytes } from "viem";
import { injected } from "@wagmi/core";
import { useAccount, useConnect, useReadContract, useWriteContract } from "wagmi";
import { LoveTree } from "@/components/LoveTree";
import { engagementAbi, engagementAddress } from "@/lib/contract";

type FormState = {
  husbandName: string;
  wifeName: string;
  husbandPromise: string;
  wifePromise: string;
  husbandHash: `0x${string}` | "";
  wifeHash: `0x${string}` | "";
};

const initialForm: FormState = {
  husbandName: "",
  wifeName: "",
  husbandPromise: "",
  wifePromise: "",
  husbandHash: "",
  wifeHash: ""
};

function countWords(value: string) {
  return value.trim() === "" ? 0 : value.trim().split(/\s+/).length;
}

export default function Home() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState("Chua gui giao dich.");
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { writeContractAsync, isPending } = useWriteContract();

  const { data: systemFee } = useReadContract({
    abi: engagementAbi,
    address: engagementAddress,
    functionName: "systemFeeWei"
  });

  const { data: engagements, refetch } = useReadContract({
    abi: engagementAbi,
    address: engagementAddress,
    functionName: "getAllEngagements"
  });

  const canSubmit = useMemo(() => {
    return (
      isConnected &&
      form.husbandName &&
      form.wifeName &&
      form.husbandHash &&
      form.wifeHash &&
      countWords(form.husbandPromise) <= 100 &&
      countWords(form.wifePromise) <= 100
    );
  }, [form, isConnected]);

  async function hashFile(file: File, key: "husbandHash" | "wifeHash") {
    const buffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", buffer);
    const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    setForm((current) => ({ ...current, [key]: `0x${hex}` as `0x${string}` }));
  }

  async function submitEngagement() {
    if (!canSubmit) {
      setStatus("Hay ket noi vi, dien du thong tin va upload anh CCCD de tao hash.");
      return;
    }

    try {
      setStatus("Meo Cha xu dang doc loi hua tren blockchain...");
      const txHash = await writeContractAsync({
        abi: engagementAbi,
        address: engagementAddress,
        functionName: "createEngagement",
        args: [
          form.husbandName,
          form.wifeName,
          form.husbandHash || keccak256(toBytes("missing-husband-hash")),
          form.wifeHash || keccak256(toBytes("missing-wife-hash")),
          form.husbandPromise,
          form.wifePromise
        ],
        value: systemFee ?? parseEther("0.02")
      });
      setStatus(`Da gui giao dich: ${txHash.slice(0, 10)}...`);
      await refetch();
      setForm(initialForm);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Giao dich bi huy hoac that bai.");
    }
  }

  return (
    <main className="min-h-screen chapel-floor">
      <section className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-8 px-4 py-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="flex flex-col justify-between rounded-lg border border-[#d7b77d] bg-white/70 p-5 shadow-sm backdrop-blur">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9cf9d] pb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#2f7a5b]">Engagement dApp</p>
              <h1 className="text-3xl font-bold text-[#281a1f] sm:text-5xl">Le duong meo</h1>
            </div>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#281a1f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#47333a]"
              onClick={() => connect({ connector: injected() })}
            >
              <Wallet size={18} />
              {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Ket noi vi"}
            </button>
          </header>

          <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[280px_1fr]">
            <motion.div
              className="relative mx-auto aspect-[3/4] w-full max-w-[280px]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <CatChapel />
            </motion.div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput label="Ten chu re" value={form.husbandName} onChange={(value) => setForm({ ...form, husbandName: value })} />
                <TextInput label="Ten co dau" value={form.wifeName} onChange={(value) => setForm({ ...form, wifeName: value })} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <KycUpload label="Anh CCCD chu re" hash={form.husbandHash} onFile={(file) => hashFile(file, "husbandHash")} />
                <KycUpload label="Anh CCCD co dau" hash={form.wifeHash} onFile={(file) => hashFile(file, "wifeHash")} />
              </div>

              <PromiseInput label="Loi hua chu re" value={form.husbandPromise} onChange={(value) => setForm({ ...form, husbandPromise: value })} />
              <PromiseInput label="Loi hua co dau" value={form.wifePromise} onChange={(value) => setForm({ ...form, wifePromise: value })} />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={!canSubmit || isPending}
                  onClick={submitEngagement}
                  className="inline-flex min-h-12 items-center gap-2 rounded-md bg-[#d94f70] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#bd3d5c] disabled:cursor-not-allowed disabled:bg-[#c9b7b7]"
                >
                  <Heart size={19} />
                  Tao hon uoc
                </button>
                <span className="text-sm font-medium text-[#5c4c45]">
                  Phi he thong: {systemFee ? `${formatEther(systemFee)} BNB` : "demo 0.02 BNB"}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={status}
                  className="rounded-md border border-[#e9cf9d] bg-[#fff8f1] px-3 py-2 text-sm text-[#5c4c45]"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  {status}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <aside className="grid gap-4">
          <InfoTile icon={<ShieldCheck size={20} />} title="KYC gia lap" text="Anh CCCD duoc bam SHA-256 tren trinh duyet; contract chi luu hash bytes32." />
          <InfoTile icon={<Landmark size={20} />} title="Du lieu on-chain" text="Ten, hash va loi hua duoc ghi vao storage. Loi hua dai hon se ton gas hon." />
          <InfoTile icon={<Trees size={20} />} title="Cay tinh yeu" text="Danh sach cap doi doc tu smart contract va ve thanh cac nut noi bang SVG." />
          <LoveTree records={engagements ?? []} />
        </aside>
      </section>
    </main>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm font-semibold text-[#281a1f]">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-md border border-[#d7b77d] bg-white px-3 outline-none focus:border-[#d94f70]"
      />
    </label>
  );
}

function PromiseInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const words = countWords(value);
  return (
    <label className="block text-sm font-semibold text-[#281a1f]">
      <span className="flex items-center justify-between gap-2">
        {label}
        <span className={words > 100 ? "text-[#bd3d5c]" : "text-[#2f7a5b]"}>{words}/100 tu</span>
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-1 w-full resize-none rounded-md border border-[#d7b77d] bg-white px-3 py-2 outline-none focus:border-[#d94f70]"
      />
    </label>
  );
}

function KycUpload({ label, hash, onFile }: { label: string; hash: string; onFile: (file: File) => void }) {
  return (
    <label className="block rounded-md border border-dashed border-[#c9932f] bg-[#fff8f1] p-3 text-sm font-semibold text-[#281a1f]">
      {label}
      <input
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
        }}
        className="mt-2 block w-full text-xs"
      />
      <span className="mt-2 block overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium text-[#2f7a5b]">
        {hash || "Chua co hash"}
      </span>
    </label>
  );
}

function InfoTile({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-[#d7b77d] bg-white/75 p-4 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 font-bold text-[#281a1f]">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-[#5c4c45]">{text}</p>
    </div>
  );
}

function CatChapel() {
  return (
    <svg viewBox="0 0 260 340" role="img" aria-label="Cat wedding chapel" className="h-full w-full">
      <rect x="24" y="42" width="212" height="274" rx="8" fill="#fff8f1" stroke="#c9932f" strokeWidth="4" />
      <path d="M40 160 C75 94 185 94 220 160" fill="none" stroke="#2f7a5b" strokeWidth="8" />
      <circle cx="130" cy="88" r="24" fill="#d94f70" />
      <path d="M96 52 L130 18 L164 52" fill="#f5dfc7" stroke="#c9932f" strokeWidth="4" />
      <Cat x={64} y={184} color="#f0b45f" />
      <Cat x={152} y={184} color="#f6d8df" veil />
      <Cat x={108} y={132} color="#9a7b5b" priest />
      <path d="M76 292 C105 270 155 270 184 292" fill="none" stroke="#d94f70" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function Cat({ x, y, color, veil = false, priest = false }: { x: number; y: number; color: string; veil?: boolean; priest?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M18 10 L28 -10 L38 10 Z" fill={color} stroke="#281a1f" strokeWidth="3" />
      <path d="M52 10 L62 -10 L72 10 Z" fill={color} stroke="#281a1f" strokeWidth="3" />
      <circle cx="45" cy="28" r="32" fill={color} stroke="#281a1f" strokeWidth="3" />
      <circle cx="34" cy="24" r="3" fill="#281a1f" />
      <circle cx="56" cy="24" r="3" fill="#281a1f" />
      <path d="M45 30 L40 36 L50 36 Z" fill="#d94f70" />
      <path d="M28 44 Q45 56 62 44" fill="none" stroke="#281a1f" strokeWidth="3" strokeLinecap="round" />
      {veil && <path d="M18 8 Q45 -18 72 8 L78 58 Q45 76 12 58 Z" fill="rgba(255,255,255,0.55)" stroke="#d7b77d" strokeWidth="2" />}
      {priest && <path d="M18 58 H72 L64 102 H26 Z" fill="#281a1f" />}
      {!priest && <path d="M24 58 H66 L74 110 H16 Z" fill={veil ? "#ffffff" : "#5f7fb8"} stroke="#281a1f" strokeWidth="3" />}
      {priest && <rect x="41" y="62" width="8" height="28" fill="#fff8f1" />}
    </g>
  );
}

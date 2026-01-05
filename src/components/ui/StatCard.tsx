import { motion } from "framer-motion";

interface Props {
  title: string;
  value: string;
  hint: string;
  color?: "red" | "yellow";
}

export function StatCard({ title, value, hint, color = "red" }: Props) {
  const accent = color === "red" ? "bg-brand-red" : "bg-brand-yellow";
  return (
    <motion.div
      className="card p-5 space-y-2"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className={`h-2 w-12 rounded-full ${accent}`}></div>
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{hint}</p>
    </motion.div>
  );
}

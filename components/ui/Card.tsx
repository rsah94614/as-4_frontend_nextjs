//Placeholder for cards (ui)
export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm">
      {children}
    </div>
  );
}

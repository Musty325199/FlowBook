export default function Spinner({ size = 20 }) {
  return (
    <div className="flex items-center justify-center">
      <div
        style={{ width: size, height: size }}
        className="border-2 border-accent border-t-transparent rounded-full animate-spin"
      />
    </div>
  );
}
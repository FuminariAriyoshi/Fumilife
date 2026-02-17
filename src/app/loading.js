export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0e0e0e",
        color: "#888",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
      }}
    >
      Loading...
    </div>
  );
}

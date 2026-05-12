export default function DestinationLoading() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-[60vh] bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 px-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

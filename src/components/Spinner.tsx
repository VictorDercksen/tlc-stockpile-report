export function Spinner({ small = false }: { small?: boolean }) {
  const sz = small ? 18 : 30;
  const dot = small ? 9 : 15;

  return (
    <div style={{ transform: `scale(${small ? 0.6 : 1})` }}>
      <div
        className="ctrlfleet-spinner"
        style={{ width: sz, height: sz, position: 'relative', transform: 'rotate(45deg)' }}
      >
        <div style={{
          position: 'absolute', width: dot, height: dot, borderRadius: 1,
          left: 0, top: 0, background: '#00b67a',
          animation: 'spinner-shape1 1.5s ease 0s infinite reverse',
        }} />
        <div style={{
          position: 'absolute', width: dot, height: dot, borderRadius: 1,
          right: 0, top: 0, background: '#a6a6a6',
          animation: 'spinner-shape2 1.5s ease 0s infinite reverse',
        }} />
        <div style={{
          position: 'absolute', width: dot, height: dot, borderRadius: 1,
          left: 0, bottom: 0, background: '#f6f3f3',
          animation: 'spinner-shape3 1.5s ease 0s infinite reverse',
        }} />
        <div style={{
          position: 'absolute', width: dot, height: dot, borderRadius: 1,
          right: 0, bottom: 0, background: '#000000',
          animation: 'spinner-shape4 1.5s ease 0s infinite reverse',
        }} />
      </div>
    </div>
  );
}

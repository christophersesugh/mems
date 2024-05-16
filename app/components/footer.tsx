export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-blue-950 p-4 fixed bottom-0 w-full">
      <p className="text-center text-lg text-slate-300">&copy;{year} MEMS</p>
    </footer>
  );
}

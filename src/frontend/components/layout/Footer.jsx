import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <ul className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-white/90 font-medium">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
          </ul>
          
          <div className="text-xs text-white/70 text-center md:text-right">
            <p>© {new Date().getFullYear()} Shivam General Store. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

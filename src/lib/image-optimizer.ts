export function optimizeImage(url: string, width: number = 300, quality: number = 80): string {
  if (!url) return "/placeholder.svg";
  if (url.startsWith('/')) return url; // Local images
  if (url.includes('placeholder')) return url;

  // Hapus protokol biar aman buat wsrv.nl
  const cleanUrl = url.replace(/^https?:\/\//, '');
  
  // Pake wsrv.nl (Gratis, Fast, Support WebP)
  // w = width, q = quality, output = webp (next gen format)
  return `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&q=${quality}&output=webp`;
}

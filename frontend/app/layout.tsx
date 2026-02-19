import './globals.css';

export const metadata = {
  title: 'PDF Export Client',
  description: 'Upload PDF and download processed export.zip'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

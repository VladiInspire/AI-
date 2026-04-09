import './globals.css';

export const metadata = {
  title: 'Analise',
  description: 'Chat s Analise — tvoje AI asistentka pro inspiraci',
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}

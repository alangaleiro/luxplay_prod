import Link from 'next/link';
import { Container } from './Container';

export function Footer() {
  return (
    <footer className="border-t py-8 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              LUXPLAY
            </h2>
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} All rights reserved</span>
          </div>
          
          <div className="flex gap-6">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/connect" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Connect
            </Link>
            <Link href="/prize-program" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Prize Program
            </Link>
            <Link href="/invite" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Invite
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
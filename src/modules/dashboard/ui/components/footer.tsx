import Link from "next/link";

export function Footer() {
  return (
    <div className="z-20 w-full bg-background shadow backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-4 flex h-14 items-center md:mx-8">
        <p className="text-left text-xs leading-loose text-muted-foreground md:text-sm">
          Build by{" "}
          <Link
            href="https://mirado-vonjiniaina.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Mirado Vonjiniaina
          </Link>
          . Any Question, contact support{" "}
          <Link
            href="/support"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Support
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useBag } from "./lib/BagProvider";

const LOGO =
  "https://gotbluff.com/cdn/shop/files/BLUFF_LOGO_White.png?v=1787179258&width=600";

function BagIcon() {
  return (
    <svg className="bag-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M4.75 8.25h14.5v11.25a1.75 1.75 0 0 1-1.75 1.75h-11a1.75 1.75 0 0 1-1.75-1.75V8.25Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.25c0-2.35 1.45-4 3.5-4s3.5 1.65 3.5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SiteHeader() {
  const { count } = useBag();
  return (
    <>
      <div className="announce">Complimentary PR requests · Available sizes only</div>
      <header className="site-header">
        <Link className="brand" href="/">
          <img src={LOGO} alt="Got Bluff" />
          <span className="brand-tag">PR Packs</span>
        </Link>
        <nav className="header-nav">
          <Link className="header-link" href="/">
            Shop
          </Link>
          <Link className="header-bag" href="/request" aria-label={count ? `Bag, ${count} items` : "Bag"}>
            <BagIcon />
            {count ? <span className="bag-count">{count}</span> : null}
          </Link>
        </nav>
      </header>
    </>
  );
}

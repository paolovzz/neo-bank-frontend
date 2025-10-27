import React, { useMemo, useState } from "react";
import "./CreditCard.css";

/**
 * Props:
 *  - cardNumber: string (solo cifre o con spazi)
 *  - cardHolder: string
 *  - expiry: string in format "MM/YY" or "MM/YYYY"
 *  - showFullByDefault: boolean (false)
 *  - brand: optional ("visa"|"mastercard"|"amex"|null) - otherwise auto-detect
 */
export default function CreditCard({
  cardNumber = "",
  cardHolder = "NOME COGNOME",
  expiry = "MM/YY",
  showFullByDefault = false,
  brand = null,
}) {
  const [showFull, setShowFull] = useState(Boolean(showFullByDefault));

  // Normalize digits only
  const digits = (cardNumber || "").replace(/\D/g, "");

  // detect brand (simple heuristics)
  const detectedBrand = useMemo(() => {
    if (brand) return brand;
    if (/^3[47]/.test(digits)) return "amex";
    if (/^4/.test(digits)) return "visa";
    if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return "mastercard";
    return null;
  }, [digits, brand]);

  // format groups (Amex uses 4-6-5)
  const formatCardNumber = (digs) => {
    if (!digs) return "•••• •••• •••• ••••";
    if (detectedBrand === "amex") {
      // 4 - 6 - 5
      const a = digs.slice(0, 4);
      const b = digs.slice(4, 10);
      const c = digs.slice(10, 15);
      return [a, b, c].filter(Boolean).join(" ").padEnd(17, "•");
    }
    // default groups of 4
    const groups = [];
    for (let i = 0; i < Math.max(16, digs.length); i += 4) {
      groups.push(digs.slice(i, i + 4));
    }
    // join and pad with bullets if short
    const joined = groups
      .map((g) => (g ? g : "••••"))
      .slice(0, 4)
      .join(" ");
    return joined;
  };

  const maskedNumber = useMemo(() => {
    const last4 = digits.slice(-4);
    if (!digits) return "•••• •••• •••• ••••";
    // For amex, keep last 5? But common practice shows last 4. We'll show last 4.
    const maskedPart = digits.slice(0, -4).replace(/\d/g, "•");
    const combined = maskedPart + last4;
    // format same as above
    if (detectedBrand === "amex") {
      const a = combined.slice(0, 4);
      const b = combined.slice(4, 10);
      const c = combined.slice(10, 15);
      return [a, b, c].filter(Boolean).join(" ");
    }
    const groups = [];
    for (let i = 0; i < 16; i += 4) {
      groups.push(combined.slice(i, i + 4).padEnd(4, "•"));
    }
    return groups.join(" ");
  }, [digits, detectedBrand]);

  const displayNumber = showFull ? formatCardNumber(digits) : maskedNumber;

  // simple Luhn check
  const isValidLuhn = (num) => {
    const s = (num || "").replace(/\D/g, "");
    if (!s) return false;
    let sum = 0;
    let alt = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let n = parseInt(s.charAt(i), 10);
      if (alt) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  };

  const valid = isValidLuhn(digits);

  return (
    <div className="cc-wrapper" aria-live="polite">
      <div className="cc-card">
        <div className="cc-top">
          <div className="cc-chip" aria-hidden="true" />
          <div className="cc-brand">{renderBrandIcon(detectedBrand)}</div>
        </div>

        <div className="cc-number" title={showFull ? digits : undefined}>
          {displayNumber}
        </div>

        <div className="cc-bottom">
          <div className="cc-holder">
            <div className="label">Intestatario</div>
            <div className="value">{cardHolder.toUpperCase()}</div>
          </div>

          <div className="cc-meta">
            <div className="expiry">
              <div className="label">Scadenza</div>
              <div className="value">{expiry}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// minimal SVG brand icons (inline)
function renderBrandIcon(brand) {
  if (brand === "visa") {
    return (
      <svg width="56" height="20" viewBox="0 0 56 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="56" height="20" rx="3" fill="#1a1f71"/>
        <text x="6" y="14" fill="#fff" fontFamily="Verdana,Geneva,sans-serif" fontWeight="700" fontSize="12">VISA</text>
      </svg>
    );
  }
  if (brand === "mastercard") {
    return (
      <svg width="56" height="20" viewBox="0 0 56 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="56" height="20" rx="3" fill="#000" />
        <g transform="translate(6,2)">
          <circle cx="8" cy="8" r="6" fill="#ff5f00"/>
          <circle cx="16" cy="8" r="6" fill="#eb001b" />
          <path d="M11 8a6 6 0 0 0 0 0" fill="#f79e1b" />
        </g>
      </svg>
    );
  }
  if (brand === "amex") {
    return (
      <svg width="56" height="20" viewBox="0 0 56 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="56" height="20" rx="3" fill="#2e77bb"/>
        <text x="6" y="14" fill="#fff" fontFamily="Verdana,Geneva,sans-serif" fontWeight="700" fontSize="10">AMEX</text>
      </svg>
    );
  }
  // fallback generic
  return (
    <div className="brand-placeholder" aria-hidden="true">
      <svg width="56" height="20" viewBox="0 0 56 20" xmlns="http://www.w3.org/2000/svg">
        <rect width="56" height="20" rx="3" fill="#444" />
      </svg>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { createWhatsAppTrackingUrl, type WhatsAppTrackingOptions } from "@/lib/whatsappTracking";

export interface TrackedWhatsAppLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    WhatsAppTrackingOptions {
  children: React.ReactNode;
}

export function TrackedWhatsAppLink({
  cta,
  accountId,
  productId,
  accountSlug,
  text,
  number,
  campaign,
  sourcePage,
  sourcePath,
  referrer,
  className,
  children,
  target = "_blank",
  rel = "noopener noreferrer",
  ...rest
}: TrackedWhatsAppLinkProps) {
  const [href, setHref] = useState(() =>
    createWhatsAppTrackingUrl({
      cta,
      accountId,
      productId,
      accountSlug,
      text,
      number,
      campaign,
      sourcePage,
      sourcePath,
      referrer,
    })
  );

  const buildFreshUrl = () =>
    createWhatsAppTrackingUrl({
      cta,
      accountId,
      productId,
      accountSlug,
      text,
      number,
      campaign,
      sourcePage,
      sourcePath,
      referrer,
    });

  // Update tracking URL on client hydration or parameter changes
  useEffect(() => {
    setHref(buildFreshUrl());
  }, [cta, accountId, productId, accountSlug, text, number, campaign, sourcePage, sourcePath, referrer]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (rest.onClick) {
      rest.onClick(e);
    }
  };

  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const effectiveTarget = isMobile ? undefined : target;
  const effectiveRel = isMobile ? undefined : rel;

  return (
    <a href={href} target={effectiveTarget} rel={effectiveRel} className={className} {...rest} onClick={handleClick}>
      {children}
    </a>
  );
}

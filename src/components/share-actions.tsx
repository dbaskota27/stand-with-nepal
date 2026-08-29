import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DONATE_URL, SHARE_TEXT } from "@/data/relief";

function currentHref() {
  return window.location.href.split("#")[0];
}

function isPublicShareHost(href: string) {
  try {
    const host = new URL(href).hostname;
    return host === "grok.me" || host.endsWith(".grok.me");
  } catch {
    return false;
  }
}

/** Public grok.me URL when published; otherwise nothing (preview is not shareable). */
export function publicPageUrl() {
  const href = currentHref();
  return isPublicShareHost(href) ? href : null;
}

export function composeShareText() {
  const page = publicPageUrl();
  return page && !SHARE_TEXT.includes(page) ? `${SHARE_TEXT}\n\n${page}` : SHARE_TEXT;
}

function openXCompose(text: string) {
  const intent = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  const a = document.createElement("a");
  a.href = intent;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.click();
}

export function shareOnX() {
  const text = composeShareText();
  if (!publicPageUrl()) {
    toast.message(
      "This chat preview is not a public link. The post opens with the official PM Relief Fund URL.",
    );
  }
  try {
    openXCompose(text);
  } catch {
    void copyReadyPost();
  }
}

export async function copyPageLink() {
  const page = publicPageUrl();
  const toCopy = page ?? DONATE_URL;
  try {
    await navigator.clipboard.writeText(toCopy);
    toast.success(
      page
        ? "Link copied — paste it on X"
        : "Preview isn’t public — copied the official donate link instead",
    );
  } catch {
    toast.message("Copy the official donate link: pmdrf.nchl.com.np");
  }
}

export async function copyReadyPost() {
  try {
    await navigator.clipboard.writeText(composeShareText());
    toast.success("Post copied — paste it into X");
  } catch {
    toast.message("Could not copy. Use Share on X, or paste pmdrf.nchl.com.np");
  }
}

export function nativeShare() {
  shareOnX();
}

export function ShareOnXButton({
  variant = "outline",
  size = "md",
  label = "Share on X",
}: {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  return (
    <Button type="button" variant={variant} size={size} onClick={shareOnX}>
      <Share2 />
      {label}
    </Button>
  );
}

export function CopyLinkButton({
  variant = "ghost",
  size = "md",
}: {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={async () => {
        await copyPageLink();
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}

export function CopyPostButton() {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      onClick={async () => {
        await copyReadyPost();
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? "Post copied" : "Copy a ready post"}
    </Button>
  );
}

import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type Theme = "light" | "dark";

export interface NavLink {
  label: string;
  href: `#${string}`;
}

export interface ImageAsset {
  src: string;
  alt: string;
}

export interface CallToActionLink {
  label: string;
  href: string;
}

export interface HeroContent {
  lead: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  primaryCta: CallToActionLink;
  secondaryCta: CallToActionLink;
  background: ImageAsset;
}

export interface IntroContent {
  tagline: string;
}

export interface ValueProp {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
}

export interface ShowcaseScene {
  id: string;
  step: string;
  title: string;
  description: string;
  bullets: readonly string[];
  image: ImageAsset;
}

export interface Solution {
  id: string;
  icon: LucideIcon;
  name: string;
  tagline: string;
  description: string;
  benefits: readonly string[];
  ctaLabel: string;
  image: ImageAsset;
}

export interface SecurityFeature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface SecurityStat {
  id: string;
  value: number;
  suffix: string;
  label: string;
}

export interface FooterColumn {
  title: string;
  links: readonly CallToActionLink[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
}

export type IconComponent = ComponentType<{ size?: number; className?: string }>;

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  icon: IconComponent;
}

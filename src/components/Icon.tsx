import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";

/**
 * Sistema de ícones do produto: **Phosphor Icons, peso "light"** — traço fino,
 * alinhado à identidade serifada/editorial (decisão 07). Ênfase se ganha por
 * tamanho ou cor, nunca engrossando o traço (pesos "regular"/"bold" ficam de fora).
 * Estados ativos/selecionados podem usar o peso "fill" do mesmo ícone — ex.: o
 * coração cheio no card já favoritado (`ResultCard`).
 */
export const iconDefaults = { weight: "light", size: 20 } as const;

type IconComponent = ComponentType<IconProps>;

export interface IconProps_ extends IconProps {
  icon: IconComponent;
}

export function Icon({ icon: PhosphorIcon, ...props }: IconProps_) {
  return <PhosphorIcon {...iconDefaults} {...props} />;
}

import type { ComponentType } from "react";
import type { IconProps } from "@tabler/icons-react";

/**
 * Defaults do sistema de ícones da identidade visual:
 * biblioteca Tabler, estilo outline, stroke-width 1 (mais fino que o padrão 2),
 * tamanho base 20px. Ênfase se ganha por tamanho/cor, nunca engrossando o traço.
 */
export const iconDefaults = { stroke: 1, size: 20 } as const;

type IconComponent = ComponentType<IconProps>;

export interface IconProps_ extends IconProps {
  icon: IconComponent;
}

export function Icon({ icon: TablerIcon, ...props }: IconProps_) {
  return <TablerIcon {...iconDefaults} {...props} />;
}

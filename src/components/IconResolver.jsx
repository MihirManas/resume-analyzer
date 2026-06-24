import React from 'react';
import { Cpu, Database, Code, Network, Zap } from 'lucide-react';

const iconMap = {
  cpu: Cpu,
  database: Database,
  code: Code,
  network: Network,
  zap: Zap,
};

const IconResolver = ({ iconId, size = 160, strokeWidth = 1 }) => {
  const Icon = iconMap[iconId] || Cpu;
  return <Icon size={size} strokeWidth={strokeWidth} />;
};

export default IconResolver;

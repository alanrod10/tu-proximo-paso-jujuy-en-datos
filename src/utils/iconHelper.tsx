import React from 'react';
import {
  Sprout,
  Pickaxe,
  Factory,
  Zap,
  HardHat,
  ShoppingCart,
  Utensils,
  Truck,
  Landmark,
  Building2,
  GraduationCap,
  HeartPulse,
  Briefcase
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const AreaIcon: React.FC<IconProps> = ({ name, className = "w-6 h-6", size = 24 }) => {
  switch (name) {
    case 'sprout':
      return <Sprout className={className} size={size} />;
    case 'pickaxe':
      return <Pickaxe className={className} size={size} />;
    case 'factory':
      return <Factory className={className} size={size} />;
    case 'zap':
      return <Zap className={className} size={size} />;
    case 'hard-hat':
      return <HardHat className={className} size={size} />;
    case 'shopping-cart':
      return <ShoppingCart className={className} size={size} />;
    case 'utensils':
      return <Utensils className={className} size={size} />;
    case 'truck':
      return <Truck className={className} size={size} />;
    case 'landmark':
      return <Landmark className={className} size={size} />;
    case 'building':
      return <Building2 className={className} size={size} />;
    case 'graduation-cap':
      return <GraduationCap className={className} size={size} />;
    case 'heart-pulse':
      return <HeartPulse className={className} size={size} />;
    default:
      return <Briefcase className={className} size={size} />;
  }
};

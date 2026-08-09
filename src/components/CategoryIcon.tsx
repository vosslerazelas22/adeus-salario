import React from 'react';
import {
  Utensils,
  Bus,
  Home,
  ShoppingBag,
  HeartPulse,
  Film,
  Receipt,
  FolderKanban,
  Tag,
  CreditCard,
  Car,
  Gift,
  Coffee,
  Plane,
  Briefcase,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name?: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', ...props }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils className={className} {...props} />;
    case 'Bus':
      return <Bus className={className} {...props} />;
    case 'Home':
      return <Home className={className} {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag className={className} {...props} />;
    case 'HeartPulse':
      return <HeartPulse className={className} {...props} />;
    case 'Film':
      return <Film className={className} {...props} />;
    case 'Receipt':
      return <Receipt className={className} {...props} />;
    case 'Coffee':
      return <Coffee className={className} {...props} />;
    case 'Car':
      return <Car className={className} {...props} />;
    case 'Plane':
      return <Plane className={className} {...props} />;
    case 'Gift':
      return <Gift className={className} {...props} />;
    case 'CreditCard':
      return <CreditCard className={className} {...props} />;
    case 'Briefcase':
      return <Briefcase className={className} {...props} />;
    case 'FolderKanban':
    default:
      return <FolderKanban className={className} {...props} />;
  }
};

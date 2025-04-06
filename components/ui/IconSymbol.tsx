import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Add your SFSymbol to AntDesign/Entypo mappings here.
const MAPPING = {
  // SF Symbols to AntDesign/Entypo mappings
  'house.fill': { library: 'AntDesign', name: 'home' },
  'paperplane.fill': { library: 'AntDesign', name: 'rocket1' },
  'chevron.left.forwardslash.chevron.right': { library: 'AntDesign', name: 'code' },
  'chevron.right': { library: 'AntDesign', name: 'right' },
  'add-to-list': { library: 'Entypo', name: 'add-to-list' }, // Added Entypo mapping
} as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses AntDesign or Entypo icons as a fallback for SF Symbols.
 * This ensures a consistent look across platforms.
 *
 * Icon `name`s are based on SF Symbols and require manual mapping to AntDesign/Entypo icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color = 'White',
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
}) {
  const mappedIcon = MAPPING[name];

  if (!mappedIcon) {
    console.error(`Icon "${name}" is not mapped to an AntDesign or Entypo icon. Please add it to the MAPPING object.`);
    return null; // Return null if the icon name is not mapped
  }

  // Dynamically render the appropriate icon component
  const IconComponent = mappedIcon.library === 'AntDesign' ? AntDesign : Entypo;

  return <IconComponent name={mappedIcon.name} size={size} color={color} style={style} />;
}
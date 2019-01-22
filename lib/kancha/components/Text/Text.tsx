/***
 *  Copyright (C) 2018 ConsenSys AG
 *
 *  This file is part of uPort Mobile App
 *  uPort Mobile App is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.

 *  uPort Mobile App is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  ERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
 * 
 ***/

import * as React from 'react'
import { Text, TextStyle } from 'react-native'
import { TextThemeMap, TextTypes, Theme } from '@kancha'

/**
 * Kancha Text Props
 */
interface KanchaTextProps {
  /**
   * The type of text to display. This will be styled accordinly to the theme
   */
  type: string

  /**
   * Overide the color with a warning color
   */
  warn?: boolean

  /**
   * Make the text bold
   */
  bold?: boolean

  /**
   * The padding around the text
   */
  padding?: number

  /**
   * A bottom padding for the text. Useful for headings
   */
  paddingBottom?: number | boolean | undefined;

  /**
   * The margin around the text
   */
  margin?: number
}

const KanchaText: React.FC<KanchaTextProps> = props => {
  const styles: TextStyle = {
    ...TextThemeMap[props.type],
    ...(props.bold ? { fontWeight: 'bold' } : {}),
    ...(props.warn ? { color: Theme.colors.warning } : {}),
    ...(props.paddingBottom ? { paddingBottom: props.paddingBottom } : {}),
    ...(props.paddingBottom && typeof props.paddingBottom === 'boolean' ? { paddingBottom: Theme.spacing.default } : {}),
    
  }

  return <Text style={styles}>{props.children}</Text>
}

export default KanchaText

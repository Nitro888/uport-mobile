interface IndexSignature {
  [index: string]: any
}

interface TextDefaultThemeMapTypes extends IndexSignature {}


interface KanchaTheme extends IndexSignature {
  text: {
    lineHeights: {
      body: number;
    };
    sizes: {
      h1: number;
      h2: number;
      h3: number;
      h4: number;
      h5: number;
      h6: number;
      subTitle: number;
      listItem: number;
      listItemRight: number;
      listItemNote: number;
      sectionHeader: number;
      summary: number;
      body: number;
    }
  }
}

/**
 * Base DefaultTheme file
 */
const DefaultTheme: KanchaTheme = {
  text: {
    lineHeights: {
      body: 22,
    },
    sizes: {
      h1: 32,
      h2: 24,
      h3: 20,
      h4: 18,
      h5: 16,
      h6: 14,
      subTitle: 14,
      listItem: 18,
      listItemRight: 18,
      listItemNote: 15,
      sectionHeader: 14,
      summary: 18,
      body: 16,
    },
  },
  colors: {
    warning: '#e74c3c',
    confirm: 'green',
    primary: {
      brand: '#5C50CA',
      text: '#333333',
      background: '#FFFFFF',
      divider: '#CCCCCC',
      accessories: '#BBBBBB',
      underlay: '#CCCCCC',
    },
    secondary: {
      brand: 'green',
      text: '#AAAAAA',
      background: '#efeef3',
      divider: '#CCCCCC',
      accessories: '#BBBBBB',
      underlay: '#CCCCCC',
    },
    tertiary: {
      brand: 'green',
      text: '#AAAAAA',
      background: '#CCCCCC',
      divider: '#CCCCCC',
      accessories: '#BBBBBB',
      underlay: '#CCCCCC',
    },
    accent: {
      text: '#AAAAAA',
      background: '#F6F7F8',
      divider: '#CCCCCC',
      accessories: '#BBBBBB',
    },
  },
  spacing: {
    default: 15,
    section: 20,
  },
}

/** 
 * For RNN
 */
const NavigationThemeDefault = {
  largeTitle: false,
  navBarBackgroundColor: DefaultTheme.colors.primary.brand,
  navBarButtonColor: DefaultTheme.colors.primary.background,
  navBarTextColor: DefaultTheme.colors.primary.background,
}

/**
 * Append nav theming
 */
const Theme = DefaultTheme
Theme.navigation = NavigationThemeDefault

/**
 * Temporary implementaion.
 * Refactor later to make more succint.
 */
const TextTypes = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  ListItem: 'listItem',
  ListItemRight: 'listItemRight',
  ListItemNote: 'listItemNote',
  SubTitle: 'subTitle',
  Body: 'body',
  Summary: 'summary',
  SectionHeader: 'sectionHeader',
}

/**
 * Temportary implementaion. Refactor later to make more succint.
 * Just here to initially define each font style.
 * Padding size todo
 */
const TextThemeMap: TextDefaultThemeMapTypes = {
  h1: {
    fontSize: DefaultTheme.text.sizes.h1,
    color: DefaultTheme.colors.primary.text,
  },
  h2: {
    fontSize: DefaultTheme.text.sizes.h2,
    color: DefaultTheme.colors.primary.text,
  },
  h3: {
    fontSize: DefaultTheme.text.sizes.h3,
    color: DefaultTheme.colors.primary.text,
  },
  h4: {
    fontSize: DefaultTheme.text.sizes.h4,
    color: DefaultTheme.colors.primary.text,
  },
  h5: {
    fontSize: DefaultTheme.text.sizes.h5,
    color: DefaultTheme.colors.primary.text,
  },
  subTitle: {
    fontSize: DefaultTheme.text.sizes.subTitle,
    color: DefaultTheme.colors.secondary.text,
  },
  listItem: {
    fontSize: DefaultTheme.text.sizes.listItem,
    color: DefaultTheme.colors.primary.text,
  },
  listItemNote: {
    fontSize: DefaultTheme.text.sizes.listItemNote,
    color: DefaultTheme.colors.secondary.text,
  },
  listItemRight: {
    fontSize: DefaultTheme.text.sizes.listItemRight,
    color: DefaultTheme.colors.secondary.text,
  },
  summary: {
    fontSize: DefaultTheme.text.sizes.summary,
    color: DefaultTheme.colors.secondary.text,
  },
  body: {
    fontSize: DefaultTheme.text.sizes.body,
    color: DefaultTheme.colors.primary.text,
    lineHeight: DefaultTheme.text.lineHeights.body,
  },
  sectionHeader: {
    fontSize: DefaultTheme.text.sizes.sectionHeader,
    color: DefaultTheme.colors.secondary.text,
  },
}

export { TextThemeMap, Theme, TextTypes }

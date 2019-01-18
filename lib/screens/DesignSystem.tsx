import * as React from 'react';
import { Container, Text, TextTypes, ListItem, Screen, Section } from '@kancha';

interface FakeAvatarProps {}

const FakeAvatar: React.FC<FakeAvatarProps> = (props) => {
  return (
    <Container w={40} h={40} background={'secondary'} />
  )
}

class DesignSystem extends React.Component {

  render() {
    return (
      <Screen>
        <Container flex={1}>
          <Section>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => { 1 === 1 }}
              infoNoteRight={'22 ETH'}
            >
              Advanced
            </ListItem>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => { 1 === 1 }}
              infoNoteRight={'Content'}
            >
              Privacy
            </ListItem>
            <ListItem
              avatarComponent={<FakeAvatar />}
              onPress={() => { 1 === 1 }}
            >
              General
            </ListItem>
            <ListItem
              last
              avatarComponent={<FakeAvatar />}
              onPress={() => { 1 === 1 }}
            >
              Back Up
            </ListItem>
          </Section>
          <Section>
            <ListItem>Static list item</ListItem>
            <ListItem>Static list item</ListItem>
            <ListItem>Static list item</ListItem>
            <ListItem>Static list item</ListItem>
            <ListItem>Static list item</ListItem>
            <ListItem>Static list item</ListItem>
            <ListItem last>Static list item</ListItem>
          </Section>
          <Section title={'TYPEOGRAPHY'}>
            <Text type={TextTypes.H1}>Heading 1</Text>
            <Text type={TextTypes.H2}>Heading 2</Text>
            <Text type={TextTypes.H3}>Heading 3</Text>
            <Text type={TextTypes.H4}>Heading 4</Text>
            <Text type={TextTypes.H5}>Heading 5</Text>
            <Text type={TextTypes.Body}>Body Text</Text>
            <Text type={TextTypes.Summary}>Summary Text</Text>
            <Text type={TextTypes.SectionHeader}>Section Header</Text>
          </Section>
        </Container>
      </Screen>
    )
  }

}

export default DesignSystem;

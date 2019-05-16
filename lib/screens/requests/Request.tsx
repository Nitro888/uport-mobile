import * as React from 'react'
import { Request, Screen } from '@kancha'

interface RequestScreenProps {}
interface RequestScreenState {}

class RequestScreen extends React.Component<RequestScreenProps, RequestScreenState> {
  constructor(props: RequestScreenProps) {
    super(props)

    this.state = {}
  }

  closeRequestScreen() {
    /**
     * Close modal
     */
  }

  render() {
    return (
      <Screen>
        <Request
          activity={''}
          type={''}
          loading={false}
          actions={{
            accept: () => {
              ''
            },
            reject: () => {
              ''
            },
          }}
          content={[{ title: 'Jack Black', subTitle: 'Name' }]}
          createKeys={false}
          self={{ currentIdentity: '' }}
          initiator={{}}
        />
      </Screen>
    )
  }
}

export default RequestScreen

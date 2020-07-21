import {NativeModules} from 'react-native'
/*
const axios = require('axios')
const atob = require('atob')

function bufferDecode (value) {
  return Uint8Array.from(atob(value), c => c.charCodeAt(0))
}
*/
async function makeCredential (did) {
  try {
    console.log('makeCredential', did)
    /*
    const response = await axios.get(`https://webauthn.io/makeCredential/${did}`, {
      attType: 'none',
      authType: '',
      userVerification: 'discouraged',
      residentKeyRequirement: 'false',
      txAuthExtension: ''
    })
    const makeCredentialOptions = response.data
    console.log('makeCredential', JSON.stringify(makeCredentialOptions))
    */
    /*
    makeCredentialOptions.publicKey.challenge = bufferDecode(makeCredentialOptions.publicKey.challenge)
    makeCredentialOptions.publicKey.user.id = bufferDecode(makeCredentialOptions.publicKey.user.id)
    if (makeCredentialOptions.publicKey.excludeCredentials) {
      for (var i = 0; i < makeCredentialOptions.publicKey.excludeCredentials.length; i++) {
        makeCredentialOptions.publicKey.excludeCredentials[i].id = bufferDecode(makeCredentialOptions.publicKey.excludeCredentials[i].id)
      }
    }
    */
    const makeCredentialOptions = {
      'authenticatorExtensions': '', // optional and currently ignored
      'clientDataHash': 'LTCT/hWLtJenIgi0oUhkJz7dE8ng+pej+i6YI1QQu60=', // base64
      'credTypesAndPubKeyAlgs': [
          ['public-key', -7]
      ],
      'excludeCredentials': [
        {
          'type': 'public-key',
          'id': 'lVGyXHwz6vdYignKyctbkIkJto/ADbYbHhE7+ss/87o=' // base64
              // "transports" member optional but ignored
        }
      ],
      'requireResidentKey': true,
      'requireUserPresence': true,
      'requireUserVerification': false,
      'rp': {
        'name': 'webauthn.io',
        'id': 'webauthn.io'
      },
      'user': {
        'name': 'testuser',
        'displayName': 'Test User',
        'id': '/QIAAAAAAAAAAA==' // base64
      }
    }
    const credential = await NativeModules.FidoManager.makeCredential(JSON.stringify(makeCredentialOptions))
    console.log('makeCredential', credential)
  } catch (error) {
    console.log(error)
  }
}

export {makeCredential}

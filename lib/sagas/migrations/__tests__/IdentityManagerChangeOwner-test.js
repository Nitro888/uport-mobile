// Copyright (C) 2018 ConsenSys AG
//
// This file is part of uPort Mobile App.
//
// uPort Mobile App is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// uPort Mobile App is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with uPort Mobile App.  If not, see <http://www.gnu.org/licenses/>.
//
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { select, call } from 'redux-saga/effects'

import migrate, { identityManagerInstance, isOwner, addOwner, waitForSuccess } from '../IdentityManagerChangeOwner'
import { signFunctionCall } from 'uPortMobile/lib/sagas/requests/transactionRequest'
import { waitForTransactionReceipt } from 'uPortMobile/lib/sagas/blockchain'

import {
  selectOrCreateSeed
} from 'uPortMobile/lib/sagas/keychain'

import {
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  saveMessage,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

import {
  networkSettings,
  isFullyHD,
  web3ForNetwork
} from 'uPortMobile/lib/selectors/chains'

import {
  hdRootAddress
} from 'uPortMobile/lib/selectors/hdWallet'

const step = MigrationStep.IdentityManagerChangeOwner

describe('IdentityManagerChangeOwner', () => {
  const network = 'rinkeby'
  const hexAddress = '0xidentity'
  const address = 'IdentityMNID'
  const controllerAddress = '0xcontroller'
  const deviceAddress = '0xoldDevice'
  const newOwner = '0xNewRoot'

  for (let signerType of ['IdentityManager', 'MetaIdentityManager']) {
    describe('migrate()', () => {
      describe(signerType, () => {
        const settings = {
          signerType,
          network,
          address,
          hexAddress,
          deviceAddress,
          controllerAddress
        }
        const identityManager = 'identityManagerInstance'
        const tx = '0xtxhash'

        describe('already fully HD', () => {
          it('should not do anything', () => {
            return expectSaga(migrate)
              .provide([
                [select(isFullyHD), true]
              ])
              .returns(true)
              .run()
          })
        })

        describe('addOwner transaction had gone through but app did not register this', () => {
          it('should not do anything', () => {
            return expectSaga(migrate)
              .provide([
                [select(isFullyHD), false],
                [call(selectOrCreateSeed), newOwner],
                [call(isOwner, {identityManager, identity: hexAddress, newOwner}), true],
                [select(networkSettings), settings],
                [call(identityManagerInstance, settings), identityManager]
              ])
              .call(isOwner, {identityManager, identity: hexAddress, newOwner})
              .returns(true)
              .run()
          })
        })

        describe('happy path', () => {
          it('should call create addOwner transaction', () => {
            return expectSaga(migrate)
              .provide([
                [select(isFullyHD), false],
                [call(selectOrCreateSeed), newOwner],
                [call(isOwner, {identityManager, identity: hexAddress, newOwner}), false],
                [select(networkSettings), settings],
                [call(identityManagerInstance, settings), identityManager],
                [call(addOwner, settings, newOwner), {tx}],
                [call(waitForSuccess, settings, tx, hexAddress, newOwner), true]
              ])
              .call(selectOrCreateSeed)
              .put(saveMessage(step, `New Seed Created ${newOwner}`))
              .call(isOwner, {identityManager, identity: hexAddress, newOwner})
              .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
              .call(addOwner, settings, newOwner)
              .put(saveMessage(step, `Waiting for transaction ${tx} to mine`))
              .call(waitForSuccess, settings, tx, hexAddress, newOwner)
              .put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${address} was successfull`))
              .put(saveMessage(step, `Owner status of ${address} successfully changed to ${newOwner}`))
              .returns(true)
              .run()
          })
        })

        describe('transaction did not go through', () => {
          for (let attempt = 0; attempt < 2 ; attempt ++) {
            describe(`attempt: ${attempt + 1}`, () => {
              it('should retry', () => {
                return expectSaga(migrate, attempt)
                .provide([
                  [call(selectOrCreateSeed), newOwner],
                  [select(isFullyHD), false],
                  [select(networkSettings), settings],
                  [call(identityManagerInstance, settings), identityManager],
                  [call(isOwner, {identityManager, identity: hexAddress, newOwner}), false],
                  [call(addOwner, settings, newOwner), {tx}],
                  [call(waitForSuccess, settings, tx, hexAddress, newOwner), false],
                  [call(migrate, attempt + 1), false]
                ])
                .call(selectOrCreateSeed)
                .call(isOwner, {identityManager, identity: hexAddress, newOwner})
                .put(saveMessage(step, `New Seed Created ${newOwner}`))
                .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
                .call(addOwner, settings, newOwner)
                .put(saveMessage(step, `Waiting for transaction ${tx} to mine`))
                .put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${address} was successfull`))
                .call(migrate, attempt + 1)
                .returns(false)
                .run()
              })
            })
          }

          describe('4th attempt', () => {
            it('should fail process', () => {
              return expectSaga(migrate, 3)
                .provide([
                  [call(selectOrCreateSeed), newOwner],
                  [select(isFullyHD), false],
                  [select(networkSettings), settings],
                  [call(identityManagerInstance, settings), identityManager],
                  [call(isOwner, {identityManager, identity: hexAddress, newOwner}), false],
                  [call(addOwner, settings, newOwner), {tx}],
                  [call(waitForSuccess, settings, tx, hexAddress, newOwner), false]
                ])
                .call(selectOrCreateSeed)
                .call(isOwner, {identityManager, identity: hexAddress, newOwner})
                .put(saveMessage(step, `New Seed Created ${newOwner}`))
                .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
                .call(addOwner, settings, newOwner)
                .put(saveMessage(step, `Waiting for transaction ${tx} to mine`))
                .put(saveMessage(step, `Checking if ownership change to ${newOwner} of ${address} was successfull`))
                .put(failProcess(step, `Transaction Failed to add ${newOwner} as owner of ${settings.address} - ${tx}`))
                .not.call(migrate, 4)
                .returns(false)
                .run()
            })
          })
        })

        describe('error thrown', () => {
          it('should fail process', () => {
            return expectSaga(migrate)
              .provide([
                [call(selectOrCreateSeed), newOwner],
                [select(isFullyHD), false],
                [select(networkSettings), settings],
                [call(identityManagerInstance, settings), identityManager],
                [call(isOwner, {identityManager, identity: hexAddress, newOwner}), false],
                [call(addOwner, settings, newOwner), throwError(new Error('Signing Did not Work'))]
              ])
              .call(selectOrCreateSeed)
              .put(saveMessage(step, `New Seed Created ${newOwner}`))
              .put(saveMessage(step, `Adding ${newOwner} as owner of ${address}`))
              .call(addOwner, settings, newOwner)
              .put(failProcess(step, 'Signing Did not Work'))
              .returns(false)
              .run()
          })
        })
      })
    })
  }
})

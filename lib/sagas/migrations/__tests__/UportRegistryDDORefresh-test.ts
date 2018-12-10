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
import { select, call, cps } from 'redux-saga/effects'
import { delay } from 'redux-saga'

import migrate, { isProfileUpToDate } from '../UportRegistryDDORefresh'

import {
  savePublicUport,
  registry,
  profileTemplate
} from 'uPortMobile/lib/sagas/persona'

import {
  MigrationStep
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import {
  saveMessage,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'

import {
  currentAddress, publicUportForAddress
} from 'uPortMobile/lib/selectors/identities'

const step = MigrationStep.UportRegistryDDORefresh

describe('UportRegistryDDORefresh', () => {
  const address = '0xroot'

  describe('migrate()', () => {
    describe('already up to date', () => {
      it('should exit true', () => {
        return expectSaga(migrate)
          .provide([
            [select(currentAddress), address],
            [call(isProfileUpToDate, address, 1), true]
          ])
          .put(saveMessage(step, `Profile is already up to date for ${address}`))
          .not.call(savePublicUport, {address, force: false})
          .returns(true)
          .run()
      })
    })

    describe('happy path', () => {
      it('should update data', () => {
        return expectSaga(migrate)
          .provide([
            [select(currentAddress), address],
            [call(isProfileUpToDate, address, 1), false],
            [call(savePublicUport, {address, force: false}), true],
            [call(isProfileUpToDate, address), true],
            [call(delay, 5000), undefined]
          ])
          .call(isProfileUpToDate, address, 1)
          .put(saveMessage(step, `Updating uPort Registry for ${address}`))
          .call(savePublicUport, {address, force: false})
          .call(isProfileUpToDate, address)
          .returns(true)
          .run()
      })
    })

    describe('saving fails', () => {
      for (let attempt = 0; attempt < 2 ; attempt ++) {
        describe(`attempt: ${attempt + 1}`, () => {
          it('should retry', () => {
            let force = attempt > 0
            return expectSaga(migrate, attempt)
              .provide([
                [select(currentAddress), address],
                [call(isProfileUpToDate, address, 1), false],
                [call(savePublicUport, {address, force}), false],
                [call(migrate, attempt + 1), false]
              ])
              .put(saveMessage(step, `Updating uPort Registry for ${address}`))
              .call(savePublicUport, {address, force})
              .call(migrate, attempt + 1)
              .returns(false)
              .run()
          })  
        })
      }  

      describe(`attempt: 4`, () => {
        it('should fail', () => {
          return expectSaga(migrate, 3)
            .provide([
              [select(currentAddress), address],
              [call(isProfileUpToDate, address, 1), false],
              [call(savePublicUport, {address, force: true}), false]
            ])
            .put(saveMessage(step, `Updating uPort Registry for ${address}`))
            .put(failProcess(step, 'Did not successfully update profile'))
            .call(savePublicUport, {address, force: true})
            .not.call(migrate, 4)
            .returns(false)
            .run()
        })  
      })
    })

    describe('transaction mined but failed', () => {
      for (let attempt = 0; attempt < 2 ; attempt ++) {
        describe(`attempt: ${attempt + 1}`, () => {
          it('should retry', () => {
            let force = attempt > 0
            return expectSaga(migrate, attempt)
              .provide([
                [select(currentAddress), address],
                [call(isProfileUpToDate, address, 1), false],
                [call(savePublicUport, {address, force}), true],
                [call(isProfileUpToDate, address), false],
                [call(migrate, attempt + 1), false],
                [call(delay, 5000), undefined]
              ])
              .put(saveMessage(step, `Updating uPort Registry for ${address}`))
              .call(savePublicUport, {address, force})
              .call(migrate, attempt + 1)
              .returns(false)
              .run()
          })
        })
      }  

      describe(`attempt: 4`, () => {
        it('should fail', () => {
          return expectSaga(migrate, 3)
            .provide([
              [select(currentAddress), address],
              [call(isProfileUpToDate, address, 1), false],
              [call(savePublicUport, {address, force: true}), true],
              [call(isProfileUpToDate, address), false],
              [call(delay, 5000), undefined]
            ])
            .put(saveMessage(step, `Updating uPort Registry for ${address}`))
            .put(failProcess(step, 'Transaction updating profile failed'))
            .call(savePublicUport, {address, force: true})
            .not.call(migrate, 4)
            .returns(false)
            .run()
        })  
      })
    })
  })

  describe('isProfileUpToDate()', () => {
    const attributes = {publicKey: '0xpub', publicEncKey: '0xencpub'}

    describe('fetched profile matches our own', () => {
      const profile = {...profileTemplate, ...attributes}
      it('should return true', () => {
        return expectSaga(isProfileUpToDate, address)
          .provide([
            [cps(registry, address), profile],
            [select(publicUportForAddress, address), attributes]
          ])
          .returns(true)
          .run()
      })
    })

    describe('fetched profile does not match', () => {
      const profile = {...profileTemplate, publicKey: '0xoldpub', publicEncKey: '0xencpub'}
      it('should return false', () => {
        return expectSaga(isProfileUpToDate, address)
          .provide([
            [cps(registry, address), profile],
            [select(publicUportForAddress, address), attributes]
          ])
          .returns(false)
          .run()
      })
    })
  })
})


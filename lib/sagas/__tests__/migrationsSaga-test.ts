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
import { delay } from 'redux-saga'
import migrationsSaga, { performStep, runImplementationStep } from '../migrationsSaga'
import IdentityManagerChangeOwner from '../migrations/IdentityManagerChangeOwner'
import { listSeedAddresses } from 'uPortMobile/lib/sagas/keychain'
import { 
  RUN_MIGRATIONS,
  MigrationStep, 
  MigrationTarget, 
  MigrationStatus,
  TargetAction, 
  StepAction
} from 'uPortMobile/lib/constants/MigrationActionTypes'

import { loadedDB } from 'uPortMobile/lib/actions/globalActions'
import { 
  runMigrations,
  addMigrationTarget,
  startedMigrationStep,
  completedMigrationStep,
  failedMigrationStep
} from 'uPortMobile/lib/actions/migrationActions'
import {
  startWorking,
  stopWorking,
  saveMessage,
  completeProcess,
  failProcess
} from 'uPortMobile/lib/actions/processStatusActions'
import { NavigationActions } from 'uPortMobile/lib/utilities/NavigationActions'

import { migrationStepStatus, migrationTargets, pendingMigrations, migrationCompleted } from 'uPortMobile/lib/selectors/migrations'
import { isFullyHD } from 'uPortMobile/lib/selectors/chains'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'

describe('checkup', () => {
  const root = '0xroot'

  describe('hd wallet', () => {
    it('does not Add Migration Target', () => {
      return expectSaga(migrationsSaga)
          .provide([
            [select(isFullyHD), true],
            [select(hdRootAddress), root],
            [call(listSeedAddresses), [root]],
            [select(pendingMigrations), []]
          ])
          .not.put(addMigrationTarget(MigrationTarget.PreHD))
          .dispatch(loadedDB())
          .silentRun()
    })
  })

  describe('pre hd', () => {
    describe('no seed', () => {
      it('adds a Migration Target', () => {
        return expectSaga(migrationsSaga)
            .provide([
              [select(isFullyHD), false],
              [select(hdRootAddress), undefined],
              [call(listSeedAddresses), []],
              [call(delay, 2000), undefined],
              [select(pendingMigrations), [MigrationTarget.PreHD]]
            ])
            .put(addMigrationTarget(MigrationTarget.PreHD))
            .call(NavigationActions.push, {
              screen: `migrations.PreHD`,
              animationType: 'slide-up'
            })
            .dispatch(loadedDB())
            .silentRun()
      })  
    })

    describe('with working seed', () => {
      it('adds a Migration Target', () => {
        return expectSaga(migrationsSaga)
            .provide([
              [select(isFullyHD), false],
              [select(hdRootAddress), root],
              [call(listSeedAddresses), [root]],
              [call(delay, 2000), undefined],
              [select(pendingMigrations), [MigrationTarget.PreHD]]
            ])
            .put(addMigrationTarget(MigrationTarget.PreHD))
            .call(NavigationActions.push, {
              screen: `migrations.PreHD`,
              animationType: 'slide-up'
            })
            .dispatch(loadedDB())
            .silentRun()
      })  
    })

    describe('with missing seed', () => {
      it('adds a Migration Target', () => {
        return expectSaga(migrationsSaga)
            .provide([
              [select(isFullyHD), false],
              [select(hdRootAddress), root],
              [call(listSeedAddresses), []],
              [call(delay, 2000), undefined],
              [select(pendingMigrations), [MigrationTarget.PreHD]]
            ])
            .put(addMigrationTarget(MigrationTarget.PreHD))
            .call(NavigationActions.push, {
              screen: `migrations.PreHD`,
              animationType: 'slide-up'
            })
            .dispatch(loadedDB())
            .silentRun()
      })  
    })
  })
})

describe('runMigrations', () => {
  describe('no targets', () => {
    it('should not run any steps', () => {
      return expectSaga(migrationsSaga)
        .provide([
          [select(migrationTargets), []]
        ])
        .not.call(performStep)
        .dispatch(runMigrations(MigrationTarget.PreHD))
        .silentRun()
    })
  })

  describe('with targets', () => {
    it('should run all steps', () => {
      return expectSaga(migrationsSaga)
        .provide([
          [select(migrationTargets), [MigrationTarget.PreHD]],
          [select(migrationStepStatus, MigrationStep.CleanUpAfterMissingSeed), MigrationStatus.Completed],
          [select(migrationStepStatus, MigrationStep.IdentityManagerChangeOwner), MigrationStatus.Completed],
          [select(migrationStepStatus, MigrationStep.UpdatePreHDRootToHD), MigrationStatus.Completed],
          [select(migrationStepStatus, MigrationStep.UportRegistryDDORefresh), MigrationStatus.Completed],
          [select(migrationCompleted, MigrationTarget.PreHD), true],
          [matchers.call.fn(performStep), undefined]
        ])
        .put(startWorking(MigrationTarget.PreHD))
        .call(performStep, MigrationStep.CleanUpAfterMissingSeed)
        .call(performStep, MigrationStep.IdentityManagerChangeOwner)
        .call(performStep, MigrationStep.UpdatePreHDRootToHD)
        .call(performStep, MigrationStep.UportRegistryDDORefresh)
        .put(completeProcess(MigrationTarget.PreHD))
        .dispatch(runMigrations(MigrationTarget.PreHD))
        .silentRun()
    })
  })

  it('should stop running unless a step was completed', () => {
    return expectSaga(migrationsSaga)
      .provide([
        [select(migrationTargets), [MigrationTarget.PreHD]],
        [select(migrationStepStatus, MigrationStep.CleanUpAfterMissingSeed), MigrationStatus.Completed],
        [select(migrationStepStatus, MigrationStep.IdentityManagerChangeOwner), MigrationStatus.Completed],
        [select(migrationStepStatus, MigrationStep.UpdatePreHDRootToHD), MigrationStatus.Error],
        [select(migrationStepStatus, MigrationStep.UportRegistryDDORefresh), undefined],
        [select(migrationCompleted, MigrationTarget.PreHD), false],
        [matchers.call.fn(performStep), undefined]
      ])
      .call(performStep, MigrationStep.CleanUpAfterMissingSeed)
      .call(performStep, MigrationStep.IdentityManagerChangeOwner)
      .call(performStep, MigrationStep.UpdatePreHDRootToHD)
      .not.call(performStep, MigrationStep.UportRegistryDDORefresh)
      .put(completeProcess(MigrationTarget.PreHD))
      .dispatch(runMigrations(MigrationTarget.PreHD))
      .silentRun()
  })

})

describe('performStep', () => {
  const step = MigrationStep.IdentityManagerChangeOwner
  describe('completed', () => {
    it('should not do anything', () => {
      return expectSaga(performStep, step)
        .provide([
          [select(migrationStepStatus, step), MigrationStatus.Completed]
        ])
        .not.put(startedMigrationStep(step))
        .not.put(startWorking(step))
        .not.call(runImplementationStep, step)
        .not.put(stopWorking(step))
        .not.put(completedMigrationStep(step))
        .run()
    })
  })

  for (let status of [MigrationStatus.NotStarted, MigrationStatus.Started, MigrationStatus.Error]) {
    describe(MigrationStatus[status], () => {
      it('should go through all steps', () => {
        return expectSaga(performStep, step)
          .provide([
            [select(migrationStepStatus, step), status],
            [call(runImplementationStep, step), true]
          ])
          .put(startedMigrationStep(step))
          .put(startWorking(step))
          .call(runImplementationStep, step)
          .put(completedMigrationStep(step))
          .put(stopWorking(step))
          .run()
      })

      it('should handle failure', () => {
        return expectSaga(performStep, step)
          .provide([
            [select(migrationStepStatus, step), status],
            [call(runImplementationStep, step), false]
          ])
          .put(startedMigrationStep(step))
          .put(startWorking(step))
          .call(runImplementationStep, step)
          .put(failedMigrationStep(step))
          .not.put(completedMigrationStep(step))
          .not.put(stopWorking(step))
          .run()
      })

      it('should handle errors thrown', () => {
        return expectSaga(performStep, step)
          .provide([
            [select(migrationStepStatus, step), status],
            [call(runImplementationStep, step), throwError(new Error('Something bad happend'))]
          ])
          .put(startedMigrationStep(step))
          .put(startWorking(step))
          .call(runImplementationStep, step)
          .put(failedMigrationStep(step))
          .put(failProcess(step, 'Something bad happend'))
          .not.put(completedMigrationStep(step))
          .not.put(stopWorking(step))
          .run()
      })
    })
  }
})

describe('runImplementationStep', () => {
  it('should select and run actual migration', () => {
    return expectSaga(runImplementationStep, MigrationStep.IdentityManagerChangeOwner)
      .provide([
        [call(IdentityManagerChangeOwner), true]
      ])
      .call(IdentityManagerChangeOwner)
      .returns(true)
      .run()
  })
})
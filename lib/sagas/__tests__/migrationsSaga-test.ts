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
import migrationsSaga, { performStep, runImplementationStep, checkIfAbleToSign, checkForLegacy, runMigrations, alert } from '../migrationsSaga'
import IdentityManagerChangeOwner from '../migrations/IdentityManagerChangeOwner'
import { listSeedAddresses, canSignFor, hasWorkingSeed } from 'uPortMobile/lib/sagas/keychain'
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
  runMigrations as runMigrationAction,
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
import { isFullyHD, isHD } from 'uPortMobile/lib/selectors/chains'
import { hdRootAddress } from 'uPortMobile/lib/selectors/hdWallet'
import { migrateableIdentities, currentAddress, hasMainnetAccounts } from 'uPortMobile/lib/selectors/identities'
import { hasAttestations } from 'uPortMobile/lib/selectors/attestations';
import { Alert } from 'react-native';

describe('checkup', () => {
  const root = '0xroot'

  describe('no identity', () => {
    it('does not add migration target', () => {
      return expectSaga(migrationsSaga)
          .provide([
            [select(currentAddress), undefined]
          ])
          .not.put(addMigrationTarget(MigrationTarget.Legacy))
          .dispatch(loadedDB())
          .silentRun()

    })
  })

  describe('ethr did', () => {
    it('does not Add Migration Target', () => {
      return expectSaga(migrationsSaga)
          .provide([
            [select(currentAddress), root],
            [call(canSignFor, root), true],
            [select(pendingMigrations), []],
            [select(migrateableIdentities), []]
          ])
          .not.put(addMigrationTarget(MigrationTarget.Legacy))
          .dispatch(loadedDB())
          .silentRun()
    })

    describe('unable to sign', () => {
      describe('missing seed', () => {
        it('adds Migration Target', () => {
          return expectSaga(migrationsSaga)
              .provide([
                [select(currentAddress), root],
                [select(hdRootAddress), root],
                [call(hasWorkingSeed), false],
                [call(canSignFor, root), false],
                [select(isHD, root), true],
                [select(pendingMigrations), []],
                [select(migrateableIdentities), []]
              ])
              .put(addMigrationTarget(MigrationTarget.RecoverSeed))
              .dispatch(loadedDB())
              .silentRun()
        })
      })
    })
  })

  describe('Legacy Identity', () => {
    describe('has Full HD Wallet', () => {
      describe('has attestations', () => {
        it('should not do anything', () => {
          return expectSaga(migrationsSaga)
          .provide([
            [select(currentAddress), root],
            [call(canSignFor, root), true],
            [select(isFullyHD), true],
            [select(hasMainnetAccounts), false],
            [select(hasAttestations), true],
            [select(pendingMigrations), []],
            [select(migrateableIdentities), [{address: '0x'}]]
          ])
          .not.put(addMigrationTarget(MigrationTarget.Legacy))
          .not.put(addMigrationTarget(MigrationTarget.PreHD))
          .dispatch(loadedDB())
          .silentRun()
        })
      })

      describe('has mainnet accounts', () => {
        it('should not do anything', () => {
          return expectSaga(migrationsSaga)
          .provide([
            // TODO add selector for mainnet
            [select(currentAddress), root],
            [call(canSignFor, root), true],
            [select(isFullyHD), true],
            [select(hasMainnetAccounts), true],
            [select(hasAttestations), false],
            [select(pendingMigrations), []],
            [select(migrateableIdentities), [{address: '0x'}]]
          ])
          .not.put(addMigrationTarget(MigrationTarget.Legacy))
          .not.put(addMigrationTarget(MigrationTarget.PreHD))
          .dispatch(loadedDB())
          .silentRun()
        })
      })

      describe('without attestations or mainnet accounts', () => {
        it('should migrate to Ethr DID', () => {
          return expectSaga(migrationsSaga)
          .provide([
            [select(currentAddress), root],
            [call(canSignFor, root), true],
            [select(isFullyHD), true],
            [select(hasMainnetAccounts), false],
            [select(hasAttestations), false],
            [select(pendingMigrations), []],
            [select(migrateableIdentities), [{address: '0x'}]]
          ])
          .put(addMigrationTarget(MigrationTarget.Legacy))
          .not.put(addMigrationTarget(MigrationTarget.PreHD))
          .dispatch(loadedDB())
          .silentRun()
        })
      })
    })

    describe('Pre HD wallet', () => {
      describe('able to sign', () => {
        describe('has attestations', () => {
          it('adds PreHD Migration Target', () => {
            return expectSaga(migrationsSaga)
                .provide([
                  [select(currentAddress), root],
                  [select(isFullyHD), false],
                  [call(canSignFor, root), true],
                  [select(hasMainnetAccounts), false],
                  [select(hasAttestations), true],      
                  [select(pendingMigrations), []],
                  [select(migrateableIdentities), [{address: '0x'}]]
                ])
                .put(addMigrationTarget(MigrationTarget.PreHD))
                .dispatch(loadedDB())
                .silentRun()
          })
        })

        describe('without attestations', () => {
          it('adds PreHD Migration Target', () => {
            return expectSaga(migrationsSaga)
                .provide([
                  [select(currentAddress), root],
                  [call(canSignFor, root), true],
                  [select(isFullyHD), false],
                  [select(hasMainnetAccounts), false],
                  [select(hasAttestations), false],      
                  [select(pendingMigrations), []],
                  [select(migrateableIdentities), [{address: '0x'}]],
                  [select(hasAttestations), false]
                ])
                .put(addMigrationTarget(MigrationTarget.Legacy))
                .dispatch(loadedDB())
                .silentRun()
          })          
        })
      })

      describe('unable to sign', () => {
        describe('has attestations', () => {
          return expectSaga(migrationsSaga)
          .provide([
            [select(currentAddress), root],
            [call(canSignFor, root), false],
            [select(hasMainnetAccounts), false],
            [select(hasAttestations), true],
            [select(pendingMigrations), []],
            [select(hdRootAddress), undefined],
            [call(hasWorkingSeed), false],
            [select(isHD, root), false],
            [select(migrateableIdentities), [{address: '0x'}]],
            [select(hasAttestations), false]
          ])
          .put(addMigrationTarget(MigrationTarget.Legacy))
          .dispatch(loadedDB())
          .silentRun()

        })

        describe('without attestations', () => {
          return expectSaga(migrationsSaga)
          .provide([
            [select(currentAddress), root],
            [call(canSignFor, root), false],
            [select(isFullyHD), false],
            [select(hasMainnetAccounts), false],
            [select(hasAttestations), false],
            [select(pendingMigrations), []],
            [select(hdRootAddress), undefined],
            [call(hasWorkingSeed), false],
            [select(isHD, root), false],
            [select(migrateableIdentities), [{address: '0x'}]],
            [select(hasAttestations), false]
          ])
          .put(addMigrationTarget(MigrationTarget.Legacy))
          .dispatch(loadedDB())
          .silentRun()    
        })
      })
    })    
  })

  describe('preHD', () => {
    describe('Trigger Migration Screen', () => {      
      describe('pending migrations contains at least one migration', () => {
        it('Shows migration modal', () => {
          return expectSaga(migrationsSaga)
              .provide([
                [select(currentAddress), root],
                [call(checkIfAbleToSign), true],
                [call(checkForLegacy), true],
                [select(isFullyHD), false],
                [select(hasMainnetAccounts), false],
                [select(hasAttestations), true],      
                [call(delay, 1000), undefined],
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

  describe('Legacy', () => {
    describe('Trigger Migration Screen', () => {      
      describe('pending migrations contains at least one migration', () => {
        it('runs migration and shows alert', () => {
          return expectSaga(migrationsSaga)
              .provide([
                [select(currentAddress), root],
                [call(checkIfAbleToSign), true],
                [call(checkForLegacy), true],
                [select(isFullyHD), false],
                [select(hasMainnetAccounts), false],
                [select(hasAttestations), false],      
                [select(pendingMigrations), [MigrationTarget.Legacy]],
                [call(runMigrations, runMigrationAction(MigrationTarget.Legacy)), true]
              ])
              .put(addMigrationTarget(MigrationTarget.Legacy))
              .call(runMigrations, runMigrationAction(MigrationTarget.Legacy))
              .call(alert, 
                'Your Identity has been upgraded', 
                'You had an old test net identity. Thank you for being an early uPort user. We have now upgraded your identity to live on the Ethereum Mainnet.'
              )
              .dispatch(loadedDB())
              .silentRun()
        })  
      })
    })  
  })
})

describe('runMigrations', () => {
  describe('with targets', () => {
    it('should run all steps', () => {
      return expectSaga(runMigrations, runMigrationAction(MigrationTarget.PreHD))
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
        .returns(true)
        .silentRun()
    })
  })

  it('should stop running unless a step was completed', () => {
    return expectSaga(runMigrations, runMigrationAction(MigrationTarget.PreHD))
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
      .put(failProcess(MigrationTarget.PreHD))
      .returns(false)
      .dispatch(runMigrationAction(MigrationTarget.PreHD))
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
import * as E from 'fp-ts/Either'
import * as NEA from 'fp-ts/NonEmptyArray'
import * as O from 'fp-ts/Option'
import { Newtype, Concat } from 'newtype-ts'
import { NonEmptyString } from 'newtype-ts/lib/NonEmptyString'
import { Char } from 'newtype-ts/lib/Char'
import { PositiveInteger } from 'newtype-ts/lib/PositiveInteger'
import { Integer } from 'newtype-ts/lib/Integer'

export interface UnverifiedUser {
  readonly type: 'UnverifiedUser'
  readonly firstName: NonEmptyString50
  readonly lastName: NonEmptyString50
  readonly emailAddress: EmailAddress
  readonly middleNameInitial: O.Option<Char>
  readonly remainingReadings: PositiveInteger
}

export interface VerifiedUser extends Omit<UnverifiedUser, 'type' | 'remainingReadings'> {
  readonly type: 'VerifiedUser'
  readonly verifiedDate: Timestamp
}

export type User = UnverifiedUser | VerifiedUser

type String50 = Newtype<{ readonly String50: unique symbol }, string>
export type NonEmptyString50 = Concat<String50, NonEmptyString>

export type EmailAddress = Newtype<{ readonly EmailAddress: unique symbol }, string>

export type Timestamp = Concat<Newtype<{ readonly Timestamp: unique symbol }, number>, Integer>

export type UserLike = Record<'firstName' | 'lastName' | 'emailAddress', unknown> &
  Partial<Record<'middleNameInitial' | 'verifiedDate' | 'remainingReadings', unknown>>

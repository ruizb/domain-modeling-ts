import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Apply'
import * as NEA from 'fp-ts/NonEmptyArray'
import { flow, pipe } from 'fp-ts/function'
import { isNonEmptyString } from 'newtype-ts/lib/NonEmptyString'
import { Char, isChar } from 'newtype-ts/lib/Char'
import { PositiveInteger, isPositiveInteger } from 'newtype-ts/lib/PositiveInteger'
import { isInteger } from 'newtype-ts/lib/Integer'
import { EmailAddress, NonEmptyString50, Timestamp, UnverifiedUser, User, UserLike, VerifiedUser } from './types'

/**
 * Data type constructors
 */
const unverifiedUser = (fields: Omit<UnverifiedUser, 'type'>): User => ({
  type: 'UnverifiedUser',
  ...fields
})

const verifiedUser = (fields: Omit<VerifiedUser, 'type'>): User => ({
  type: 'VerifiedUser',
  ...fields
})

/**
 * Type guard functions for each domain type
 */
function isNonEmptyString50(s: unknown): s is NonEmptyString50 {
  return typeof s === 'string' && isNonEmptyString(s) && s.length <= 50
}

function isEmailAddress(s: unknown): s is EmailAddress {
  // https://stackoverflow.com/a/201378/5202773
  const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i
  return typeof s === 'string' && emailPattern.test(s)
}

function isTimestamp(t: unknown): t is Timestamp {
  return typeof t === 'number' && isInteger(t) && t >= -8640000000000000 && t <= 8640000000000000
}

function isUserLike(value: unknown): value is UserLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'firstName' in value &&
    'lastName' in value &&
    'emailAddress' in value
  )
}

/**
 * Parsers for each domain type (could be combined with predicate functions)
 */
type Validation<A> = E.Either<NEA.NonEmptyArray<string>, A>

type Parser<A> = (value: unknown) => Validation<A>

const parseUserLike: Parser<UserLike> = E.fromPredicate(isUserLike, val =>
  NEA.of(`Input value must have at least firstName, lastName and emailAddress properties, got: ${JSON.stringify(val)}`)
)

const parseName = (label: string) =>
  E.fromPredicate(isNonEmptyString50, val =>
    NEA.of(`${label} value must be a string (size between 1 and 50 chars), got: ${val}`)
  )

const parseFirstName: Parser<NonEmptyString50> = parseName('First name')

const parseLastName: Parser<NonEmptyString50> = parseName('Last name')

const parseMiddleNameInitial: Parser<O.Option<Char>> = flow(
  O.fromPredicate((s): s is string => typeof s === 'string'),
  O.traverse(E.either)(
    E.fromPredicate(isChar, val => NEA.of(`Middle name initial value must be a single character, got: ${val}`))
  )
) as Parser<O.Option<Char>>

const parseRemainingReadings: Parser<PositiveInteger> = flow(
  E.fromPredicate(
    (n: unknown): n is number => typeof n === 'number',
    val => NEA.of(`Remaining readings value must be a number, got: ${val}`)
  ),
  E.chain(
    E.fromPredicate(isPositiveInteger, val =>
      NEA.of(`Remaining readings value must be a positive integer, got: ${val}`)
    )
  )
) as Parser<PositiveInteger>

const parseEmailAddress: Parser<EmailAddress> = E.fromPredicate(isEmailAddress, val =>
  NEA.of(`Email address value must be a valid email address, got: ${val}`)
)

const parseTimestamp: Parser<Timestamp> = E.fromPredicate(isTimestamp, val =>
  NEA.of(`Timestamp value must be a valid timestamp, got: ${val}`)
)

/**
 * Validation functions that use the parsers
 */
const validationApplicativeInstance = E.getApplicativeValidation(NEA.getSemigroup<string>())

const validateStruct = A.sequenceS(validationApplicativeInstance)

type UserLikePartiallyValid = Pick<User, 'firstName' | 'lastName' | 'emailAddress' | 'middleNameInitial'> &
  Pick<UserLike, 'remainingReadings' | 'verifiedDate'>

const detectUserVerification = <A>({
  onUnverified,
  onVerified
}: {
  onUnverified: (userLikeObject: UserLikePartiallyValid) => A
  onVerified: (userLikeObject: UserLikePartiallyValid & { verifiedDate: unknown }) => A
}) => ({ verifiedDate, ...rest }: UserLikePartiallyValid): A =>
  pipe(
    O.fromNullable(verifiedDate),
    O.fold(
      () => onUnverified(rest),
      verifiedDate => onVerified({ ...rest, verifiedDate })
    )
  )

const validateCommonProperties = ({
  firstName,
  lastName,
  emailAddress,
  middleNameInitial,
  ...rest
}: UserLike): Validation<UserLikePartiallyValid> =>
  pipe(
    validateStruct({
      firstName: parseFirstName(firstName),
      middleNameInitial: parseMiddleNameInitial(middleNameInitial),
      lastName: parseLastName(lastName),
      emailAddress: parseEmailAddress(emailAddress)
    }),
    E.map(validProperties => ({ ...validProperties, ...rest }))
  )

const validateUnverifiedUser = (userLikeObject: UserLikePartiallyValid): Validation<User> =>
  pipe(
    parseRemainingReadings(userLikeObject.remainingReadings),
    E.map(remainingReadings => unverifiedUser({ ...userLikeObject, remainingReadings }))
  )

const validateVerifiedUser = (userLikeObject: UserLikePartiallyValid): Validation<User> =>
  pipe(
    parseTimestamp(userLikeObject.verifiedDate),
    E.map(verifiedDate => verifiedUser({ ...userLikeObject, verifiedDate }))
  )

export const parseUser: (input: unknown) => Validation<User> = input =>
  pipe(
    parseUserLike(input),
    E.chain(validateCommonProperties),
    E.chain(
      detectUserVerification({
        onUnverified: validateUnverifiedUser,
        onVerified: validateVerifiedUser
      })
    )
  )

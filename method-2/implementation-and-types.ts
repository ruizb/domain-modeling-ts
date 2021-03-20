import * as t from 'io-ts'
import { flow, pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'
import { optionFromNullable, withMessage } from 'io-ts-types'

interface NonEmptyString50Brand {
  readonly NonEmptyString50: unique symbol
}
const NonEmptyString50 = t.brand(
  t.string,
  (s: string): s is t.Branded<string, NonEmptyString50Brand> => s.length > 0 && s.length <= 50,
  'NonEmptyString50'
)
type NonEmptyString50 = t.TypeOf<typeof NonEmptyString50>

const FirstName = withMessage(
  NonEmptyString50,
  input => `First name value must be a string (size between 1 and 50 chars), got: ${input}`
)

const LastName = withMessage(
  NonEmptyString50,
  input => `Last name value must be a string (size between 1 and 50 chars), got: ${input}`
)

interface EmailAddressBrand {
  readonly EmailAddress: unique symbol
}
// https://stackoverflow.com/a/201378/5202773
const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i
const EmailAddress = withMessage(
  t.brand(t.string, (s: string): s is t.Branded<string, EmailAddressBrand> => emailPattern.test(s), 'EmailAddress'),
  input => `Email address value must be a valid email address, got: ${input}`
)
type EmailAddress = t.TypeOf<typeof EmailAddress>

interface CharBrand {
  readonly Char: unique symbol
}
const Char = t.brand(t.string, (s): s is t.Branded<string, CharBrand> => s.length === 1, 'Char')
type Char = t.TypeOf<typeof Char>

const MiddleNameInitial = withMessage(
  optionFromNullable(Char),
  input => `Middle name initial value must be a single character, got: ${input}`
)

interface PositiveIntBrand {
  readonly PositiveInt: unique symbol
}
const PositiveInt = t.brand(t.Int, (n: t.Int): n is t.Branded<t.Int, PositiveIntBrand> => n >= 0, 'PositiveInt')
type PositiveInt = t.TypeOf<typeof PositiveInt>

const RemainingReadings = withMessage(
  PositiveInt,
  input => `Remaining readings value must be a positive integer, got: ${input}`
)

interface TimestampBrand {
  readonly Timestamp: unique symbol
}
const Timestamp = t.brand(
  t.Int,
  (t: t.Int): t is t.Branded<t.Int, TimestampBrand> => t >= -8640000000000000 && t <= 8640000000000000,
  'Timestamp'
)
type Timestamp = t.TypeOf<typeof Timestamp>

const VerifiedDate = withMessage(
  Timestamp,
  input =>
    `Timestamp value must be a valid timestamp (integer between -8640000000000000 and 8640000000000000), got: ${input}`
)

const UserLikePartiallyValid = t.strict({
  firstName: FirstName,
  lastName: LastName,
  emailAddress: EmailAddress,
  middleNameInitial: MiddleNameInitial
})
// const UserLikePartiallyValid = t.exact(
//   t.intersection([
//     t.type({
//       firstName: NonEmptyString50,
//       lastName: NonEmptyString50,
//       emailAddress: EmailAddress
//     }),
//     t.partial({
//       middleNameInitial: Char
//     })
//   ])
// )
type UserLikePartiallyValid = t.TypeOf<typeof UserLikePartiallyValid>

const UntaggedUnverifiedUser = t.intersection(
  [
    UserLikePartiallyValid,
    t.strict({
      remainingReadings: RemainingReadings
    })
  ],
  'UntaggedUnverifiedUser'
)
type UntaggedUnverifiedUser = t.TypeOf<typeof UntaggedUnverifiedUser>
type UnverifiedUser = UntaggedUnverifiedUser & { readonly type: 'UnverifiedUser' }

const UntaggedVerifiedUser = t.intersection(
  [
    UserLikePartiallyValid,
    t.strict({
      verifiedDate: VerifiedDate
    })
  ],
  'UntaggedVerifiedUser'
)
type UntaggedVerifiedUser = t.TypeOf<typeof UntaggedVerifiedUser>
type VerifiedUser = UntaggedVerifiedUser & { readonly type: 'VerifiedUser' }

/**
 * Data type constructors
 */
const unverifiedUser = (fields: UntaggedUnverifiedUser): User => ({ ...fields, type: 'UnverifiedUser' })
const verifiedUser = (fields: UntaggedVerifiedUser): User => ({ ...fields, type: 'VerifiedUser' })

export type User = UnverifiedUser | VerifiedUser

const UserLike = t.intersection([
  t.type({
    firstName: t.unknown,
    lastName: t.unknown,
    emailAddress: t.unknown
  }),
  t.partial({
    middleNameInitial: t.unknown,
    verifiedDate: t.unknown,
    remainingReadings: t.unknown
  })
])
type UserLike = t.TypeOf<typeof UserLike>

const detectUserType = <A>({
  onUnverified,
  onVerified
}: {
  onUnverified: (userLikeObject: UserLike) => A
  onVerified: (userLikeObject: UserLike & { verifiedDate: unknown }) => A
}) => ({ verifiedDate, ...rest }: UserLike): A =>
  pipe(
    O.fromNullable(verifiedDate),
    O.fold(
      () => onUnverified(rest),
      verifiedDate => onVerified({ ...rest, verifiedDate })
    )
  )

export const parseUser: (input: unknown) => t.Validation<User> = flow(
  UserLike.decode,
  E.chain(
    detectUserType({
      onUnverified: flow(UntaggedUnverifiedUser.decode, E.map(unverifiedUser)),
      onVerified: flow(UntaggedVerifiedUser.decode, E.map(verifiedUser))
    })
  )
)

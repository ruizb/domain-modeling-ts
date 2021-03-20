import { PathReporter } from 'io-ts/PathReporter'
import * as E from 'fp-ts/Either'
import { pipe, absurd } from 'fp-ts/lib/function'
import { parseUser } from './implementation-and-types'

const res0 = parseUser(42)
console.log(PathReporter.report(res0))

const res1 = parseUser({ firstName: 'Bob' })
console.log(PathReporter.report(res1))

const res2 = parseUser({
  firstName: 'Bob',
  middleNameInitial: 'B',
  lastName: 'Barker',
  emailAddress: 'test@yes.com',
  remainingReadings: 3
})
console.log(PathReporter.report(res2))

const res3 = parseUser({
  firstName: 'Bob',
  lastName: 'Barker',
  emailAddress: 'test@yes.com',
  verifiedDate: 1615339130200
})
console.log(PathReporter.report(res3))

const input = {
  firstName: 'Bob',
  middleNameInitial: 'B',
  lastName: 'Barker',
  emailAddress: 'test@yes.com',
  remainingReadings: 3
  // verifiedDate: 1615339130200
}

pipe(
  input,
  parseUser,
  E.fold(
    errorMessages => {
      console.error('Input contained errors: ', errorMessages)
    },
    user => {
      switch (user.type) {
        case 'UnverifiedUser':
          return console.log('Got an unverified user', user)
        case 'VerifiedUser':
          return console.log('Got a verified user', user)
        default:
          absurd(user)
      }
    }
  )
)

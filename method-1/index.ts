import * as E from 'fp-ts/Either'
import { pipe, absurd } from 'fp-ts/function'
import { parseUser } from './implementation'

const res0 = parseUser(42)
console.log(res0)

const res1 = parseUser({ firstName: 'Bob' })
console.log(res1)

const res2 = parseUser({
  firstName: 'Bob',
  middleNameInitial: 'B',
  lastName: 'Barker',
  emailAddress: 'test@yes.com',
  remainingReadings: 3
})
console.log(res2)

const res3 = parseUser({
  firstName: 'Bob',
  lastName: 'Barker',
  emailAddress: 'test@yes.com',
  verifiedDate: 1615339130200
})
console.log(res3)

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

interface User {
  account: string
  username: string
  password:string
  age: number
}
export default {
  mark2022: {
    account: 'mark2022',
    username: 'mark',
    password:'123456',
    age: 20,
  },
  john996: {
    account: 'john996',
    username: 'john',
    password:'123456',
    age: 20,
  },
} as Record<string, User>

declare module 'bcryptjs' {
  export function genSaltSync(rounds?: number): string
  export function hashSync(s: string, salt: string): string
  export function compareSync(s: string, hash: string): boolean
  export function genSalt(rounds?: number): Promise<string>
  export function hash(s: string, salt: string): Promise<string>
  export function compare(s: string, hash: string): Promise<boolean>

  const _default: {
    genSaltSync: typeof genSaltSync
    hashSync: typeof hashSync
    compareSync: typeof compareSync
    genSalt: typeof genSalt
    hash: typeof hash
    compare: typeof compare
  }
  export default _default
}

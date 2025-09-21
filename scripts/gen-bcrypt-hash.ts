import bcrypt from 'bcryptjs'

async function main() {
  const pwd = process.argv[2]
  if (!pwd) {
    console.error('Uso: pnpm hash:pwd <contraseña>')
    process.exit(1)
  }
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(pwd, salt)
  console.log(hash)
}

main()

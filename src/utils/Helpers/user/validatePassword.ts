import bcrypt from "bcrypt";

export default async function validatePassword(
  password: string,
  hashedPassword: string,
) {
  const isValid = await bcrypt.compare(password, hashedPassword);
  return isValid;
}

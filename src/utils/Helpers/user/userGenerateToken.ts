import jwt from "jsonwebtoken";

export default function userGenerateToken(
  user: any,
  expiresIn: string,
): string | undefined {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  if (!process.env.SECRET_KEY) {
    console.error("JWT SECRET_KEY not found!");
    process.exit(1);
  }

  return jwt.sign(payload, process.env.SECRET_KEY, { expiresIn });
}

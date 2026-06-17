import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

export const deriveKey = (password, salt) =>
  crypto.pbkdf2Sync(password, salt, 100000, 32, "sha256");

export const encrypt = (text, key) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let enc = cipher.update(text, "utf8", "hex");
  enc += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${enc}`;
};

export const decrypt = (data, key) => {
  const [ivHex, authTagHex, enc] = data.split(":");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let dec = decipher.update(enc, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};

import bcrypt from "bcrypt";
import { Schema, model, Model } from "mongoose";

export interface IFile {
  path: string;
  isProtected: boolean;
  originalName: string;
  password?: string;
  downloadCount?: number;
}

interface IFileMethods {
  validatePassword: (password: string) => Promise<boolean>;
}

type FileModel = Model<IFile, {}, IFileMethods>;

const fileSchema = new Schema<IFile, FileModel, IFileMethods>({
  path: { type: String, required: true, unique: true },
  isProtected: { type: Boolean, required: true, default: false },
  originalName: { type: String, required: true },
  password: { type: String, required: false },
  downloadCount: { type: Number, required: true, default: 0 },
});

fileSchema.pre("save", async function (next) {
  if (!this.password) {
    next();
  }

  if (!this.isNew && !this.isModified("password")) {
    next();
  }

  const hashedPassword = await bcrypt.hash(this.password!, 10);
  this.password = hashedPassword;

  next();
});

fileSchema.methods.validatePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password!);
};

const File = model<IFile, FileModel>("File", fileSchema);

export default File;

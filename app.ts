import express from "express";
import type { Request, Response } from "express";
import File, { IFile } from "./models/Files";
import { HydratedDocument } from "mongoose";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("pages/index");
});

app.post("/upload", upload.single("upload_file"), async (req, res) => {
  console.log("path reached");

  if (!req.file || req.file?.path === undefined) {
    return res.send("No file selected");
  }

  const fileData: IFile = {
    path: req.file.path,
    originalName: req.file?.originalname,
    isProtected: false,
  };

  const password = req.body?.password;

  if (password && password.length > 0) {
    fileData.isProtected = true;
    fileData.password = password;
  }

  const file: HydratedDocument<IFile> = new File({
    ...fileData,
  });

  await file.save();

  // create a like to that file and send to the user

  // console.log(req.headers)
  const filePath = `${req.headers.origin}/file/${file._id}`;
  res.render("pages/upload", {
    filePath,
    isProtected: file.isProtected,
  });
});

const getFile = async (fileId: string, res: Response) => {
  try {
    const file = await File.findById(fileId);
    return file;
  } catch (error) {
    throw "document not found";
  }
};
const handleDownloadFile = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;

    if (!fileId) {
      return res.send("No file id provided");
    }

    const file = await getFile(fileId, res);

    if (!file) {
      throw "file not found";
    }

    if (file.isProtected) {
      return res.render("pages/protected");
    }

    return res.download(file.path, file.originalName);
  } catch (error) {
    return res.render("pages/error", { error: true, message: error });
  }
};

const handleProtectedFileDownload = async (req: Request, res: Response) => {
  try {
    const password = req.body?.password;
    if (!password) {
      return res.render("pages/protected", {
        error: true,
        message: "No password provided",
      });
    }

    const file = await getFile(req.params.id, res);
    if (!file) {
      return res.send("File not found");
    }
    const isValid = await file.validatePassword(password);
    if (!isValid) {
      return res.render("pages/protected", {
        error: true,
        message: "Invalid password",
      });
    }
    res.render("pages/success")
    // return res.download(file.path, file.originalName);
  } catch (error) {
    return res.render("pages/error", { error: true, message: error });
  }
};

app
  .route("/file/:id")
  .get(handleDownloadFile)
  .post(handleProtectedFileDownload);

export default app;

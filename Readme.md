# File Share project

- learning all about how to send file , usually protected, to the client from the server

  ```typescript
  import express from "express";
  import type { Request, Response } from "express";

  const app = express();

  app.route("/dowload").get(async (req: Request, res: Response) => {
    res.download("<filePath>", "name to save the as");
  });

  const port = process.env.PORT;
  app.listen(process.env.PORT, () => {
    console.log("server running at port " + port);
  });
  ```

- learning how to use template engine ejs

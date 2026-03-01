import { Request, Response } from "express";
import { createUser, getUsers } from "./user.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const user = await createUser(email, name);
    return res.status(201).json({
      user,
    });
  } catch (error) {
    req.log.error({ err: error }, "Failed to create user");

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          message: "email already exists",
        });
      }
    }
    return res.status(500).json({
      message: "server error (error creating user)",
    });
  }
};

export const getUsersHandler = async (req: Request, res: Response) => {
  try {
    const users = await getUsers();
    return res.status(200).json({ users });
  } catch (error) {
    req.log.error({ err: error }, "Failed to fetch users");
    return res.status(500).json({
      message: "server error (error getting users)",
    });
  }
};

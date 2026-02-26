import express from "express"
import workspaceController from "../controllers/workspace.controller.js"

const invitationRouter = express.Router()

invitationRouter.get(
  "/accept",
  workspaceController.acceptInvitation
)

export default invitationRouter
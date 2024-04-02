var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to Task Manager! Stay Effecttive!");
});

// authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

// userApi
const userApi = require("./user.api");
router.use("/users", userApi);

// verificationApi
const verificationApi = require("./verification.api");
router.use("/verifications", verificationApi);

// invitationApi
const invitationApi = require("./invitation.api");
router.use("/invitations", invitationApi);

// projectApi
const projectApi = require("./project.api");
router.use("/projects", projectApi);

// tagApi
const tagApi = require("./tag.api");
router.use("/tags", tagApi);

// taskApi
const taskApi = require("./task.api");
router.use("/tasks", taskApi);

// checklistApi
const checklistApi = require("./checklist.api");
router.use("/checklists", checklistApi);

// checklistItemApi
const checklistItemApi = require("./checklistItem.api");
router.use("/checklistItems", checklistItemApi);

// commentApi
const commentApi = require("./comment.api");
router.use("/comments", commentApi);

// notificationApi
const notificationApi = require("./notification.api");
router.use("/notifications", notificationApi);

/**
 * @route POST /auth/login
 *
 * @route POST /users
 * @route GET /users
 * @route GET /users/:id
 * @route GET /users/me
 * @route PUT /users/:id
 * @route DELETE /users/:id
 * @route GET /users/:id/tasks
 * @route GET /users/me/tasks
 * @route GET /users/me/invitations
 * @route GET /users/me/notifications
 *
 * @route POST /invitations
 * @route PUT /invitations/:id
 * @route PUT /invitations/:id
 * @route DELETE /invitations/:id
 *
 * @route POST /projects
 * @route GET /projects
 * @route PUT /projects/:id
 * @route DELETE /projects/:id
 * @route GET /projects/:id
 * @route GET /projects/:id/tasks
 * @route GET /projects/:id/comments
 *
 * @route POST /tasks
 * @route GET /tasks
 * @route PUT /tasks/:id
 * @route DELETE /tasks/:id
 * @route GET /tasks/:id
 * @route GET /tasks/:id/comments
 * @route GET /tasks/:id/notifications
 * @route GET /tasks/:id/notifications/:id
 *
 * @route POST /comments
 * @route PUT /comments/:id
 * @route DELETE /comments/:id
 * @route GET /comments/:id
 *
 * @route POST /notifications/reminders
 * @route GET /notifications/reminders
 * @route PUT /notifications/reminders/:id
 * @route DELETE /notifications/reminders/:id
 */
module.exports = router;

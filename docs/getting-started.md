# Task Manager

## Application Goals, Target Users and General Description

### Goals: A task management web application that helps individuals, teams and businesses to stay on track with work deadlines and quality through work organization, prioritization and visualization.

### Target Users:

- Individuals: managing personal tasks
- Project Teams: Team members and project managers
- Businesses: Employees and Managers

### General Description:

Task Manager App is a task management web app that allows the managers and their team members to create and manage their tasks. The App will help individuals and teams to stay organized and on track with their daily tasks and projects.

<!--
There are 2 roles, Manager and Employee, which have different accessibility, responsibilities and features. -->

To register, each user should provide a name, an email, a password to create an account. The email address should be unique and not link to any account in the system.

<!-- Only a Manager can create an account by themselves. A team members will need an invitation from his/her manager to set up their account through email. Therefore, the role will be automatically assigned:

- If it is self created, the account role will be Manager
- If it is created through invitation, the account role will be Employee. System will automatically set up T+1 (the manager) of the employee. -->

<!-- After registration, in task management, a Manager can create a project with title, description and add existing tasks to it, or he/she can create a new task by entering title, description and add to the project. All created project and tasks by the manager will be shown in the users' panel and can be viewed by his/her team members. The manager can assign tasks to themselves or to team members by selecting from a list of users, add priority and deadline to tasks. -->

After registration and login, an user can create a project and become the project owner. As project owner, he/she can invite others to become project members, can set project managers.

For task management, user can create tasks for themselves. Project owners and managers can create tasks within projects to assign to others. Users can see all the tasks of proejcts and projects that they follow.

<!-- For team members, they can view their all their tasks and projects in one place. They can also assign the task to themselves if the created task doesn't have an assignee. In addition, they can update the status of their assigned task as they progress. -->

<!-- All team members can view other members' tasks and projects. They can leave comments on other members' tasks and projects -->

For notification, when there is an update in task, incoming deadlines, users can receive email and/or in app notifications. When there is a newly created task, the assigned employee will receive the notification.

For reminders, users can create task reminders with message and time to send to themselves.

## User Stories

### Authentication

<!--
- [ ] As a manager, I can create an account and log in/out of the manager's app with name, email, and password.
- [ ] As a team member, I cannot register by myself but need managers' email invitation to et up the account with name, email, and password.
- [ ] As a team member, after initial setup, I can log in/out of the app using email and password. -->

- [ ] As a user, I can create and account with firstName, lastName, email and password.
- [ ] As a user, I can login with my email and password

### User

<!-- - [ ] As a manager, I can delete a team member user account.

- [ ] As a manager or team member, I can see a list of other members
- [ ] As a manager or team member, I can update my name
- [ ] As a manager or team member, I can get my current profile info (stay signed in after page refresh)
- [ ] As a manager or team member, I can see the profile of a specific member given a user ID. -->

- [ ] As a user, I can see a list of users with pagination
- [ ] As a user, I can update my firstName, lastName, and password.
- [ ] As a user, I can delete/close my account.

### Invitation

<!-- - [ ] As a manager, I can create an invitation for account creation with targeted employee's email
- [ ] As a manger, I can get my list of invitations
- [ ] As a manager, I can update my invitations
- [ ] As a manager, I can delete my invitations

- [ ] As a team member, I can receive invitation by email to open account -->

- [ ] As a project owner, I can create an invitation to other user to become project members of my project.
- [ ] As a project owner, I can see a list of my invitations
- [ ] As a project owner, I can update my invitations
- [ ] As a project owner, I can delete my invitations

- [ ] As the invitee, I can receive invitation by email and/or in app to join the project owner's project as project members.

### Project

<!-- - [ ] As a manager, I can create a project with title, description and projectStatus. I then will be come the project owner.
- [ ] As a manager, I can view all of the projects using filter (search, status ...)
- [ ] As a manager, I can edit the everything in the projects, including subtasks, statuses, etc. .
- [ ] As a manager, I can deleted the projects.

- [ ] As a team member, I can view all projects of my team. -->

- [ ] As a user, I can create a project with title, description and projectStatus, startAt and dueAt. I then will become the project owner.
- [ ] As a user, I can view all the projects that I own or I am a member of.

- [ ] As a project owner, I can update the projects that I own.
- [ ] As a project owner, I can set project members to become project managers.

- [ ] As a project owner, I can delete the projects that I own.

### Task

<!-- - [ ] As a manager, I can create a task with title, description, assignee, project, start date, due date and add files to it.
- [ ] As a manager, I can view all of my tasks in one place
- [ ] As a manager, I can view all of the tasks of all members using filter (assignee, project, status, ...)
- [ ] As a manager, I can edit all fields of tasks, including: title, description, status, priority, assignee, project, start date and due date
- [ ] As a manager, I can delete tasks

- [ ] As a team member, I can view all of my tasks in one place
- [ ] As a team member, I can view other members' tasks using filter (assignee, project, status, ...)
- [ ] As a team member, only if the task is unassigned, I can assign it to myself.
- [ ] As a team member, I can only edit the task assigned to me, on the following fields: status, add files and delete files I uploaded. -->

- [ ] As a user, I can create a task with title, description, assignee, project, startAt, dueAt and files.
- [ ] As a project owner or project manager, I can create tasks within the project.

- [ ] As a user, I can view all of my tasks in one place.
- [ ] As a user, I can view all the tasks of other members of the projects which I own or I am in.

- [ ] As a user, I can edit the tasks that I created.
- [ ] As a project owner or project manager, I can edit tasks within the project.
- [ ] As a normal project member, I can only update taskStatus that I am assigned with.

- [ ] As a user, I can delete the tasks that I created.

### Comment

<!-- - [ ] As a manager OR team member, I can leave comments on other members' tasks and projects with content and file.
- [ ] As a manager OR team member, I can see a list of comments on a task or a project
- [ ] As a manager OR team member, I can only edit my comments content and file list.
- [ ] As a manager OR team member, I can only delete my comments. -->

- [ ] As a user, I can create comments on the projects or tasks of projects that I am in, with content and files.
- [ ] As a user, I can see list of comments on a project or tasks of projects that I am in.
- [ ] As a user, I can edit my comments.
- [ ] As a user, I can delete my comments.

### Notification and Reminder

<!-- - [ ] As a team member or manager, I can get a list of notifications of a task with pagination and filters
- [ ] As a team member or manager, I can get information of a specific notification of a task with notification ID

- [ ] As a manager, I can receive notification when a task is updated by other team members.

- [ ] As a team member, I can receive notification when a task is assigned to me
- [ ] As a team member, I can receive notification when my assigned task is updated by the manager.
- [ ] As a team member, I can receive notification when my assigned task is deleted by the manager. -->

- [ ] As a user, I can create a reminder on the tasks or projects I follow to myself, with title, message, sendTime, targetType, targetID.
- System will create a notification in the following scenarios:

  - [ ] As an assignee and to-be project member, I can receive notification when there is an invitation sent to me to join a project.
  - [ ] As project member, I can receive notification when a task is assigned to me.
  - [ ] As a user, I can receive notification when a task or project I follow is updated by others.

- [ ] As a user, I can get a list of notifications and reminders sent to me with pagination and filters.
- [ ] As a user, I can get information of a specific notification or reminder.

- [ ] As a user, I can update the reminders that I created.

- [ ] As a user, I can delete the reminders that I created.

## Endpoint APIs

### Auth APIs

```javascript
/**
 * @route POST /auth/login
 * @description Login with email and password
 * @body { email, password }
 * @access Public
 */
```

### User APIs

```javascript
/**
 * @route POST /users
 * @description Create new account
 * @body { firstName, lastName, email, password }
 * @access Public
 */
```

```javascript
/**
 * @route GET /users
 * @description Get users with pagination
 * @access login required
 */
```

```javascript
/**
 * @route GET /users/:id
 * @description Get a single user info
 * @access login required
 */
```

```javascript
/**
 * @route GET /users/me
 * @description Get the current user info
 * @access login required
 */
```

```javascript
/**
 * @route PUT /users/:id
 * @description Update user profile
 * @body {firstName, lastName, password}
 * @access login required
 */
```

```javascript
/**
 * @route DELETE /users/:id
 * @description Delete a user profile
 * @access login required
 */
```

```javascript
/**
 * @route GET /users/:id/tasks
 * @description get a list of tasks of a user
 * @access login required
 */
```

```javascript
/**
 * @route GET /users/me/tasks
 * @description get a list of tasks of current user
 * @access login required
 */
```

```javascript
/**
 * @route GET /users/me/invitations
 * @description get a list of my sent invitations
 * @access login required - project owner
 */
```

```javascript
/**
 * @route GET /users/me/notifications
 * @description get a list of my notifications with pagination
 * @access login required
 */
```

### Invitation APIs

```javascript
/**
 * @route POST /invitations
 * @description create an invitation to targeted email to open account
 * @body { toEmail, projectID }
 * @access login required - project owner
 */
```

```javascript
/**
 * @route PUT /invitations/:id
 * @description update a sent invitation
 * @body { toEmail, projectID }
 * @access login required - project owner
 */
```

```javascript
/**
 * @route PUT /invitations/:id
 * @description accept an invitation
 * @body { isAccepted }
 * @access Public/login required - invitee receiving invitation - to check later
 */
```

```javascript
/**
 * @route DELETE /invitations/:id
 * @description delete an invitation
 * @access login required - project owner
 */
```

### Project APIs

```javascript
/**
 * @route POST /projects
 * @description Create a project
 * @body {title, description, projectStatus, startAt, dueAt}
 * @access login required
 */
```

```javascript
/**
 * @route GET /projects
 * @description Get a list of projects
 * @access login required
 */
```

```javascript
/**
 * @route PUT /projects/:id
 * @description Update project
 * @access login required - project owner
 */
```

```javascript
/**
 * @route DELETE /projects/:id
 * @description delete a project
 * @access login required - project owner
 */
```

```javascript
/**
 * @route GET /projects/:id
 * @description get detail of a project
 * @access login required
 */
```

```javascript
/**
 * @route GET /projects/:id/tasks
 * @description get a list of tasks of a project
 * @access login required
 */
```

```javascript
/**
 * @route GET /projects/:id/comments
 * @description get a list of comments of a project with pagination
 * @access login required
 */
```

### Task APIs

```javascript
/**
 * @route POST /tasks
 * @description create a task
 * @body {title, description, assignee, project, startAt, dueAt, files}
 * @access login required - project owner, project manager for projects. Any user can create task for personal tasks.
 */
```

```javascript
/**
 * @route GET /tasks
 * @description get a list of tasks with pagination
 * @access login required
 */
```

```javascript
/**
 * @route PUT /tasks/:id
 * @description edit fields of tasks
 * @body { title, description, assignee, project, taskStatus: "Backlog" or "Pending" or "InProgress" or "Completed" or "Reviewed" or "Archived", priority: "Critical" or "High" or "Medium" or "Low", startAt, dueAt, files }
 * @access login required - project owner, project manager for projects, normal project member can only update taskStatus. Any user can edit personal tasks.
 */
```

```javascript
/**
 * @route DELETE /tasks/:id
 * @description delete a task
 * @access login required - same as edit task
 */
```

```javascript
/**
 * @route GET /tasks/:id
 * @description get detail of a task
 * @access login required
 */
```

```javascript
/**
 * @route GET /tasks/:id/comments
 * @description get a list of comments in a task with pagination
 * @access login required
 */
```

```javascript
/**
 * @route GET /tasks/:id/notifications
 * @description get a list of notification of a tasks with pagination
 * @access login required
 */
```

```javascript
/**
 * @route GET /tasks/:id/notifications/:id
 * @description get info of a notification with notification ID
 * @access login required
 */
```

### Comment APIs

```javascript
/**
 * @route POST /comments
 * @description Create a comment
 * @body { targetType: "Task" or "Project", targetID, content, files } // files only allow if targetType is Task
 * @access login required
 */
```

```javascript
/**
 * @route PUT /comments/:id
 * @description Edit comment content
 * @body { content, files }
 * @access login required
 */
```

```javascript
/**
 * @route DELETE /comments/:id
 * @description Delete a comment
 * @access login required
 */
```

```javascript
/**
 * @route GET /comments/:id
 * @description Get detail of a comment
 * @access login required
 */
```

### Notification and Reminder APIs

```javascript
/**
 * @route POST /notifications/reminders
 * @description create a reminder notification for current user
 * @body { title, message, targetType, targetID, sendTime}
 * @access login required
 */
```

```javascript
/**
 * @route GET /notifications/reminders
 * @description get my list of my reminders with pagination
 * @access login required
 */
```

```javascript
/**
 * @route PUT /notifications/reminders/:id
 * @description edit my reminder
 * @body { title, message, sendTime}
 * @access login required
 */
```

```javascript
/**
 * @route DELETE /notifications/reminders/:id
 * @description delete my reminder
 * @access login required
 */
```

## Entity Relationship Diagram

![Alt text](task-manager-api-ERD.drawio.png)

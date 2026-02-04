# notscared - Vision

A lightweight project management tool for small creative teams shipping video games. Combines task tracking, project oversight, and a freeform ideas space.

## Core Entities

### Users
Simple user accounts. Assign users to projects and tasks. No per-project roles or disciplines - users are users.

### Projects
The top-level container for work. Properties:
- **Stage**: idea / planning / active / paused / shipped / archived / shelved (configurable)
- **Priority**: low / medium / high (optional, configurable)
- **Assignees**: users working on the project
- **State**: freeform writeup of where things are at
- **Description**: rich text (ProseMirror) with inline assets
- **Attachments**: file list

### Tasks
Belong to a project. Properties:
- **Status**: backlog / todo / in progress / done (configurable)
- **Priority**: low / medium / high (optional, configurable)
- **Assignees**: users working on the task
- **Description**: rich text (ProseMirror) with inline assets
- **Attachments**: file list
- **Subtasks**: tasks can have child tasks

### Ideas
Standalone creative soup - not tied to projects. Properties:
- **Content**: rich markdown (ProseMirror) with inline assets
- **Links**: bidirectional connections to other ideas

Ideas don't "graduate" into tasks. They exist in their own space. Projects/tasks can reference ideas for context, but ideas remain separate.

## Views

### Task Table (Daily Driver)
- Filterable table of tasks
- Default filter: assigned to current user
- Can expand filters to see broader views (by project, by status, etc.)
- No kanban - just a table with filters

### Ideas Graph
- d3.js node graph visualization (like Obsidian/Logseq)
- Spatial navigation - click nodes to open idea pages
- No list view - the graph is the interface
- Create new ideas easily from the graph

### Project Overview
- See all projects and their current state
- Filter by stage, assignees, etc.

## Shared Components

### Rich Editor
Reusable ProseMirror-based editor with:
- Markdown support
- Inline image/asset uploads
- Used for: idea content, project descriptions, task descriptions

### Attachments
Reusable file attachment component:
- Upload files
- List/download attached files
- Used on: projects, tasks (not ideas - those use inline only)

## Technical Notes

- Stages, statuses, priorities stored as configurable values in database
- File uploads are temporary/early-stage - assets eventually migrate to source control
- SQLite + Drizzle ORM (already in place)
- React Router for frontend (already in place)

## What's Not Included

- Time tracking
- Effort/points estimation
- Kanban boards
- Milestones as separate entity
- Per-project roles
- Complex permissions

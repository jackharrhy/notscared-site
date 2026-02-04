import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("register", "routes/register.tsx"),
  route("invite/:code", "routes/invite.$code.tsx"),
  layout("routes/dev.layout.tsx", [
    route("dev", "routes/dev.index.tsx", { index: true }),
    route("dev/users", "routes/dev.users.tsx"),
    route("dev/users/create", "routes/dev.users.create.tsx"),
    route("dev/projects", "routes/dev.projects.tsx"),
    route("dev/projects/create", "routes/dev.projects.create.tsx"),
    route("dev/projects/:name", "routes/dev.projects.$name.tsx"),
    route("dev/events", "routes/dev.events.tsx"),
    route("dev/design", "routes/dev.design.tsx"),
  ]),
] satisfies RouteConfig;

import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { PostRoutes } from "../modules/post/post.route";
import { VoteRoutes } from "../modules/vote/vote.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/posts",
    route: PostRoutes,
  },
  {
    path: "/votes",
    route: VoteRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = require("../modules/auth/auth.route");
const user_route_1 = require("../modules/user/user.route");
const post_route_1 = require("../modules/post/post.route");
const vote_route_1 = require("../modules/vote/vote.route");
const comment_route_1 = require("../modules/comment/comment.route");
const payment_route_1 = require("../modules/payment/payment.route");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/users",
        route: user_route_1.UserRoutes,
    },
    {
        path: "/posts",
        route: post_route_1.PostRoutes,
    },
    {
        path: "/votes",
        route: vote_route_1.VoteRoutes,
    },
    {
        path: "/comments",
        route: comment_route_1.CommentRoutes,
    },
    {
        path: "/payments",
        route: payment_route_1.PaymentRoutes,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;

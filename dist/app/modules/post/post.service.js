"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const mongoose_1 = require("mongoose");
const post_model_1 = __importDefault(require("./post.model"));
const user_model_1 = __importDefault(require("../user/user.model"));
const vote_model_1 = __importDefault(require("../vote/vote.model"));
const comment_model_1 = __importDefault(require("../comment/comment.model")); // Add this import
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createPost = (userId, postData) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield post_model_1.default.startSession();
    session.startTransaction();
    try {
        // Find the UserProfile
        const userProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(userId),
        }).session(session);
        if (!userProfile) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
        }
        // Set premium to true only if the user is verified, otherwise false
        const isPremium = userProfile.verified ? true : false;
        const newPost = yield post_model_1.default.create([
            Object.assign(Object.assign({}, postData), { author: userProfile._id, premium: isPremium }),
        ], { session });
        if (!newPost || newPost.length === 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Failed to create post");
        }
        const createdPost = newPost[0];
        // Update user profile with the new post
        userProfile.posts = userProfile.posts || [];
        userProfile.posts.push({ post: createdPost._id });
        yield userProfile.save({ session });
        yield session.commitTransaction();
        session.endSession();
        // Populate the author field
        yield createdPost.populate({
            path: "author",
            //select: "user profilePicture bio verified", // Select the fields you want to include
            populate: {
                path: "user",
                select: "name email",
            },
        });
        return createdPost;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getPosts = (_a) => __awaiter(void 0, [_a], void 0, function* ({ category, author, searchTerm, sortOrder = "desc", page = 1, limit = 10, currentUserId, }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = {};
    // Category filter
    if (category) {
        query.category = category;
    }
    // Author filter
    if (author) {
        const userProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(author),
        });
        if (userProfile) {
            query.author = userProfile._id;
        }
        else {
            return { posts: [], totalPosts: 0, hasMore: false };
        }
    }
    // Search functionality
    if (searchTerm) {
        const searchRegex = new RegExp(searchTerm, "i");
        query.$or = [
            { title: { $regex: searchRegex } },
            { content: { $regex: searchRegex } },
            { tags: { $in: [searchRegex] } },
        ];
        // Search for author name in UserProfile
        const matchingProfiles = yield user_model_1.default.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            {
                $match: {
                    "userDetails.name": { $regex: searchRegex },
                },
            },
            {
                $project: { _id: 1 },
            },
        ]);
        if (matchingProfiles.length > 0) {
            query.$or.push({
                author: { $in: matchingProfiles.map((profile) => profile._id) },
            });
        }
    }
    // Premium post handling
    let userIsVerified = false;
    if (currentUserId) {
        const currentUserProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(currentUserId),
        });
        userIsVerified = (currentUserProfile === null || currentUserProfile === void 0 ? void 0 : currentUserProfile.verified) || false;
    }
    if (!userIsVerified) {
        query.premium = { $ne: true };
    }
    const skip = (page - 1) * limit;
    // Count total posts
    const totalPosts = yield post_model_1.default.countDocuments(query);
    // Sorting
    let sortOptions = {};
    if (sortOrder === "asc" || sortOrder === "desc") {
        sortOptions = { createdAt: sortOrder };
    }
    else {
        sortOptions = { createdAt: "desc" }; // Default sort
    }
    // Execute query
    const posts = yield post_model_1.default.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate({
        path: "author",
        populate: [
            {
                path: "user",
                select: "name email",
            },
            {
                path: "posts",
                options: { limit: 2 },
                populate: {
                    path: "post",
                    select: "title createdAt image category tags premium upVotes downVotes totalComments",
                },
            },
        ],
    });
    const hasMore = totalPosts > skip + posts.length;
    return { posts, totalPosts, hasMore };
});
const getPostsByUserId = (userId, sortOrder) => __awaiter(void 0, void 0, void 0, function* () {
    const userProfile = yield user_model_1.default.findOne({
        user: new mongoose_1.Types.ObjectId(userId),
    });
    if (!userProfile) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
    }
    let query = post_model_1.default.find({ author: userProfile._id });
    // Apply sorting only if sortOrder is specified
    if (sortOrder) {
        const sortOptions = {
            upVotes: sortOrder,
        };
        query = query.sort(sortOptions);
    }
    const posts = yield query.populate({
        path: "author",
        populate: [
            {
                path: "user",
                select: "name email",
            },
            {
                path: "posts",
                options: { limit: 2 },
                populate: {
                    path: "post",
                },
            },
        ],
    });
    return posts;
});
const getPostById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const post = yield post_model_1.default.findById(id).populate({
        path: "author",
        select: "user profilePicture bio verified following followers",
        //populate: {
        //  path: "user",
        //  select: "name email",
        //},
        populate: [
            {
                path: "user",
                select: "name email",
            },
            {
                path: "posts",
            },
        ],
    });
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
    }
    return post;
});
const updatePost = (postId, userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the user's profile
    const userProfile = yield user_model_1.default.findOne({
        user: new mongoose_1.Types.ObjectId(userId),
    });
    if (!userProfile) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
    }
    // Find the post and check if the user is the author
    const post = yield post_model_1.default.findOne({ _id: postId, author: userProfile._id });
    if (!post) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found or you're not authorized to update this post");
    }
    // Remove premium, upVotes, and downVotes from updateData
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { premium, upVotes, downVotes } = updateData, allowedUpdates = __rest(updateData, ["premium", "upVotes", "downVotes"]);
    // Update the post with only allowed fields
    Object.assign(post, allowedUpdates);
    yield post.save();
    // Populate the author information
    yield post.populate({
        path: "author",
        select: "user profilePicture bio verified",
        populate: {
            path: "user",
            select: "name email",
        },
    });
    return post;
});
const deletePost = (postId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield post_model_1.default.startSession();
    session.startTransaction();
    try {
        const post = yield post_model_1.default.findById(postId).session(session);
        if (!post) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
        }
        const userProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(userId),
        }).session(session);
        if (!userProfile) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
        }
        // Check if the user is the author of the post or an admin
        if (post.author.toString() !== userProfile._id.toString() &&
            userRole !== "admin") {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not authorized to delete this post");
        }
        // Remove the post from the user's posts array
        yield user_model_1.default.updateOne({ _id: post.author }, { $pull: { posts: { post: post._id } } }, { session });
        // Delete all comments associated with this post
        yield comment_model_1.default.deleteMany({ post: post._id }).session(session);
        // Delete all votes associated with this post
        yield vote_model_1.default.deleteMany({ post: post._id }).session(session);
        // Delete the post
        const deletedPost = yield post_model_1.default.findByIdAndDelete(postId).session(session);
        yield session.commitTransaction();
        return deletedPost;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const upvotePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield post_model_1.default.startSession();
    session.startTransaction();
    try {
        const post = yield post_model_1.default.findById(postId).session(session);
        if (!post) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
        }
        const userProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(userId),
        }).session(session);
        if (!userProfile) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
        }
        // Check if the user has already voted on this post
        const existingVote = yield vote_model_1.default.findOne({
            user: userId,
            post: postId,
        }).session(session);
        if (existingVote) {
            if (existingVote.voteType === "upvote") {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have already upvoted this post");
            }
            else {
                // Change downvote to upvote
                existingVote.voteType = "upvote";
                yield existingVote.save({ session });
                post.upVotes += 1;
                post.downVotes -= 1;
            }
        }
        else {
            // Create new upvote
            yield vote_model_1.default.create([{ user: userId, post: postId, voteType: "upvote" }], {
                session,
            });
            post.upVotes += 1;
        }
        yield post.save({ session });
        // Update author's totalUpvotes
        const authorProfile = yield user_model_1.default.findById(post.author).session(session);
        if (authorProfile) {
            authorProfile.totalUpvotes += 1;
            yield authorProfile.save({ session });
        }
        yield session.commitTransaction();
        return post;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const downvotePost = (postId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield post_model_1.default.startSession();
    session.startTransaction();
    try {
        const post = yield post_model_1.default.findById(postId).session(session);
        if (!post) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Post not found");
        }
        const userProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(userId),
        }).session(session);
        if (!userProfile) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
        }
        // Check if the user has already voted on this post
        const existingVote = yield vote_model_1.default.findOne({
            user: userId,
            post: postId,
        }).session(session);
        if (existingVote) {
            if (existingVote.voteType === "downvote") {
                throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have already downvoted this post");
            }
            else {
                // Change upvote to downvote
                existingVote.voteType = "downvote";
                yield existingVote.save({ session });
                post.upVotes -= 1;
                post.downVotes += 1;
                // Decrease author's totalUpvotes
                const authorProfile = yield user_model_1.default.findById(post.author).session(session);
                if (authorProfile) {
                    authorProfile.totalUpvotes = Math.max(authorProfile.totalUpvotes - 1, 0);
                    yield authorProfile.save({ session });
                }
            }
        }
        else {
            // Create new downvote
            yield vote_model_1.default.create([{ user: userId, post: postId, voteType: "downvote" }], { session });
            post.downVotes += 1;
        }
        yield post.save({ session });
        yield session.commitTransaction();
        return post;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const getAllPosts = () => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield post_model_1.default.find();
    return posts;
});
exports.PostService = {
    createPost,
    getPosts,
    getPostsByUserId,
    getPostById,
    updatePost,
    deletePost,
    upvotePost,
    downvotePost,
    getAllPosts,
};

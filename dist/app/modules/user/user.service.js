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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const auth_model_1 = require("../auth/auth.model");
const getUsers = (searchQuery) => __awaiter(void 0, void 0, void 0, function* () {
    // Define the search filter if a search query is provided
    const filter = searchQuery
        ? {
            $or: [
                { "user.name": { $regex: new RegExp(searchQuery, "i") } },
                { "user.email": { $regex: new RegExp(searchQuery, "i") } },
            ],
        }
        : {};
    // Fetch the user profiles and populate the user, followers, and following fields
    const users = yield user_model_1.default.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        { $match: filter },
        {
            $lookup: {
                from: "userprofiles",
                localField: "following.userProfile",
                foreignField: "_id",
                as: "followingProfiles",
            },
        },
        {
            $lookup: {
                from: "userprofiles",
                localField: "followers.userProfile",
                foreignField: "_id",
                as: "followerProfiles",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "followingProfiles.user",
                foreignField: "_id",
                as: "followingUsers",
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "followerProfiles.user",
                foreignField: "_id",
                as: "followerUsers",
            },
        },
        {
            $project: {
                _id: 1,
                user: { _id: 1, name: 1, email: 1 },
                profilePicture: 1,
                bio: 1,
                verified: 1,
                following: {
                    $map: {
                        input: "$followingProfiles",
                        as: "profile",
                        in: {
                            _id: "$$profile._id",
                            user: {
                                $let: {
                                    vars: {
                                        userObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$followingUsers",
                                                        cond: { $eq: ["$$this._id", "$$profile.user"] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: {
                                        _id: "$$userObj._id",
                                        name: "$$userObj.name",
                                        email: "$$userObj.email",
                                    },
                                },
                            },
                            verified: "$$profile.verified",
                            profilePicture: "$$profile.profilePicture",
                        },
                    },
                },
                followers: {
                    $map: {
                        input: "$followerProfiles",
                        as: "profile",
                        in: {
                            _id: "$$profile._id",
                            user: {
                                $let: {
                                    vars: {
                                        userObj: {
                                            $arrayElemAt: [
                                                {
                                                    $filter: {
                                                        input: "$followerUsers",
                                                        cond: { $eq: ["$$this._id", "$$profile.user"] },
                                                    },
                                                },
                                                0,
                                            ],
                                        },
                                    },
                                    in: {
                                        _id: "$$userObj._id",
                                        name: "$$userObj.name",
                                        email: "$$userObj.email",
                                    },
                                },
                            },
                            verified: "$$profile.verified",
                            profilePicture: "$$profile.profilePicture",
                        },
                    },
                },
                createdAt: 1,
                updatedAt: 1,
            },
        },
    ]);
    return users;
});
const getUserById = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ user: new mongoose_1.Types.ObjectId(userId) })
        .populate("user", "name email")
        .populate({
        path: "following.userProfile",
        //select: "user verified profilePicture",
        populate: {
            path: "user",
            select: "name email",
        },
    })
        .populate({
        path: "followers.userProfile",
        //select: "user verified profilePicture",
        populate: {
            path: "user",
            select: "name email",
        },
    })
        .populate({
        path: "posts.post",
    });
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    return user;
});
const updateUserProfile = (userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield user_model_1.default.startSession();
    session.startTransaction();
    try {
        const userProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(userId),
        }).session(session);
        if (!userProfile) {
            throw new Error("User profile not found");
        }
        if (updateData.name) {
            yield auth_model_1.AuthModel.findByIdAndUpdate(userId, {
                name: updateData.name,
            }).session(session);
        }
        if (updateData.profilePicture) {
            userProfile.profilePicture = updateData.profilePicture;
        }
        if (updateData.bio) {
            userProfile.bio = updateData.bio;
        }
        yield userProfile.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return userProfile.populate("user", "name email role");
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const updateUserFollowing = (followerUserId, followingUserId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    // Check if follower and following IDs are the same
    if (followerUserId === followingUserId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You cannot follow yourself");
    }
    const session = yield user_model_1.default.startSession();
    session.startTransaction();
    try {
        const followerProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(followerUserId),
        }).session(session);
        const followingProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(followingUserId),
        }).session(session);
        if (!followerProfile || !followingProfile) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
        }
        // Check if already following
        const isAlreadyFollowing = (_a = followerProfile.following) === null || _a === void 0 ? void 0 : _a.some((f) => f.userProfile.toString() === followingProfile._id.toString());
        if (isAlreadyFollowing) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You are already following this user");
        }
        // Update follower's following list
        (_b = followerProfile.following) === null || _b === void 0 ? void 0 : _b.push({ userProfile: followingProfile._id });
        yield followerProfile.save({ session });
        // Update following's followers list
        (_c = followingProfile.followers) === null || _c === void 0 ? void 0 : _c.push({ userProfile: followerProfile._id });
        yield followingProfile.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return {
            follower: yield followerProfile.populate({
                path: "user",
                select: "name email",
            }),
            following: yield followingProfile.populate({
                path: "user",
                select: "name email",
            }),
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const unfollowUser = (followerUserId, unfollowUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (followerUserId === unfollowUserId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You cannot unfollow yourself");
    }
    const session = yield user_model_1.default.startSession();
    session.startTransaction();
    try {
        const followerProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(followerUserId),
        }).session(session);
        const unfollowedProfile = yield user_model_1.default.findOne({
            user: new mongoose_1.Types.ObjectId(unfollowUserId),
        }).session(session);
        if (!followerProfile || !unfollowedProfile) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
        }
        // Initialize following and followers arrays if they don't exist
        if (!followerProfile.following)
            followerProfile.following = [];
        if (!unfollowedProfile.followers)
            unfollowedProfile.followers = [];
        // Check if already following
        const isFollowing = followerProfile.following.some((f) => f.userProfile &&
            f.userProfile.toString() === unfollowedProfile._id.toString());
        if (!isFollowing) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You are not following this user");
        }
        // Remove unfollowed user from follower's following list
        followerProfile.following = followerProfile.following.filter((f) => f.userProfile &&
            f.userProfile.toString() !== unfollowedProfile._id.toString());
        yield followerProfile.save({ session });
        // Remove follower from unfollowed user's followers list
        unfollowedProfile.followers = unfollowedProfile.followers.filter((f) => f.userProfile &&
            f.userProfile.toString() !== followerProfile._id.toString());
        yield unfollowedProfile.save({ session });
        yield session.commitTransaction();
        session.endSession();
        return {
            follower: yield followerProfile.populate({
                path: "user",
                select: "name email",
            }),
            unfollowed: yield unfollowedProfile.populate({
                path: "user",
                select: "name email",
            }),
        };
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
//TODO: Test this
const requestVerification = (userId, paymentIntentId) => __awaiter(void 0, void 0, void 0, function* () {
    const userProfile = yield user_model_1.default.findOne({
        user: new mongoose_1.Types.ObjectId(userId),
    });
    if (!userProfile) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User profile not found");
    }
    if (userProfile.verified) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User is already verified");
    }
    if (userProfile.totalUpvotes < 1) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "User must have at least 1 upvote to request verification");
    }
    // TODO: Implement actual payment verification with AAMARPAY or Stripe
    if (!paymentIntentId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Payment information is missing");
    }
    userProfile.verified = true;
    userProfile.verificationRequestDate = new Date();
    yield userProfile.save();
    return userProfile;
});
exports.UserService = {
    getUsers,
    getUserById,
    updateUserProfile,
    updateUserFollowing,
    unfollowUser,
    requestVerification,
};

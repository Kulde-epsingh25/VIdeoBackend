import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

commentSchema.pre("validate", function () {
    const hasVideo = Boolean(this.video);
    const hasTweet = Boolean(this.tweet);

    if (hasVideo === hasTweet) {
        throw new Error(
            "A comment must belong to either a video or a tweet, not both"
        );
    }
});

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
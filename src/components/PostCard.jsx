import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { NoProfile } from "../assets";
import { BiComment, BiLike, BiSolidLike } from "react-icons/bi";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { useForm } from "react-hook-form";
import TextInput from "./TextInput";
import Loading from "./Loading";
import CustomButton from "./CustomButton";
import { apiRequest } from "../utils";

// Helper to fetch comments safely
const getPostComments = async (id) => {
  try {
    const res = await apiRequest({ url: `/posts/comments/${id}`, method: "GET" });
    return Array.isArray(res?.data) ? res.data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Reply card component
const ReplyCard = ({ reply, user, handleLikeReply }) => (
  <div className="w-full py-3 ml-12">
    <div className="flex gap-3 items-center mb-1">
      <Link to={`/profile/${reply?.userId?._id ?? ""}`}>
        <img
          src={reply?.userId?.profileUrl ?? NoProfile}
          alt={reply?.userId?.firstName ?? "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
      </Link>
      <div>
        <Link to={`/profile/${reply?.userId?._id ?? ""}`}>
          <p className="font-medium text-base text-ascent-1">
            {reply?.userId?.firstName ?? "Unknown"} {reply?.userId?.lastName ?? ""}
          </p>
        </Link>
        <span className="text-ascent-2 text-sm">{moment(reply?.createdAt).fromNow()}</span>
      </div>
    </div>
    <p className="text-ascent-2">{reply?.comment ?? ""}</p>
    <p
      className="flex gap-2 items-center text-base text-ascent-2 cursor-pointer"
      onClick={handleLikeReply}
    >
      {reply?.likes?.includes(user?._id) ? <BiSolidLike size={20} color="blue" /> : <BiLike size={20} />}
      {reply?.likes?.length || 0} Likes
    </p>
  </div>
);

// Comment form component
const CommentForm = ({ user, postId, replyAt, refreshComments }) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!data.comment) return;
    setLoading(true);
    setErrMsg("");

    try {
      const URL = replyAt ? `/posts/reply-comment/${postId}` : `/posts/comment/${postId}`;
      const payload = {
        comment: data.comment,
        replyAt: replyAt || null,
        from: user?.firstName + " " + user?.lastName,
      };

      const res = await apiRequest({
        url: URL,
        data: payload,
        token: user?.token,
        method: "POST",
      });

      if (res?.status === "failed") {
        setErrMsg(res?.message || "Failed to post comment");
      } else {
        reset();
        refreshComments();
      }
    } catch (error) {
      console.error(error);
      setErrMsg("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full border-b border-[#66666645]">
      <div className="w-full flex items-center gap-2 py-4">
        <img
          src={user?.profileUrl ?? NoProfile}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <TextInput
          name="comment"
          styles="w-full rounded-full py-3"
          placeholder={replyAt ? `Reply @${replyAt}` : "Comment this post"}
          register={register("comment", { required: "Comment cannot be empty" })}
          error={errors.comment?.message}
        />
      </div>
      {errMsg && <span className="text-sm text-[#f64949fe]">{errMsg}</span>}
      <div className="flex justify-end pb-2">
        {loading ? <Loading /> : <CustomButton
          title="Submit"
          type="submit"
          containerStyles="bg-[#0444a4] text-white py-1 px-3 rounded-full text-sm"
        />}
      </div>
    </form>
  );
};

// Main PostCard Component
const PostCard = ({ post, user, deletePost }) => {
  const [likes, setLikes] = useState(post?.likes || []);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);

  const refreshComments = async () => {
    if (!post?._id) return;
    const res = await getPostComments(post._id);
    setComments(res);
  };

  const handleLikePost = async () => {
    try {
      if (!post?._id) return;
      const res = await apiRequest({
        url: `/posts/like/${post._id}`,
        token: user?.token,
        method: "POST",
      });
      setLikes(res?.data?.likes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      if (!commentId) return;
      await apiRequest({
        url: `/posts/like-comment/${commentId}`,
        token: user?.token,
        method: "POST",
      });
      refreshComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeReply = async (commentId, replyId) => {
    try {
      if (!commentId || !replyId) return;
      await apiRequest({
        url: `/posts/like-comment/${commentId}/${replyId}`,
        token: user?.token,
        method: "POST",
      });
      refreshComments();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showComments) refreshComments();
  }, [showComments]);

  if (!post) return null;

  // Helper to handle uploaded image URL
  const getPostImageUrl = (img) => {
    if (!img) return null;
    return img.startsWith("http") ? img : `http://localhost:8800/${img}`;
  };

  return (
    <div className="mb-2 bg-primary p-4 rounded-xl">
      {/* Header */}
      <div className="flex gap-3 items-center mb-2">
        <Link to={`/profile/${post?.userId?._id ?? ""}`}>
          <img
            src={post?.userId?.profileUrl ?? NoProfile}
            alt={post?.userId?.firstName ?? "User"}
            className="w-14 h-14 object-cover rounded-full"
          />
        </Link>
        <div className="w-full flex justify-between">
          <div>
            <Link to={`/profile/${post?.userId?._id ?? ""}`}>
              <p className="font-medium text-lg text-ascent-1">
                {post?.userId?.firstName ?? "Unknown"} {post?.userId?.lastName ?? ""}
              </p>
            </Link>
            <span className="text-ascent-2">{post?.userId?.location ?? ""}</span>
          </div>
          <span className="text-ascent-2">{moment(post?.createdAt).fromNow()}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-ascent-2">{post?.description ?? ""}</p>

      {/* Post Image */}
      {post?.image && (
        <img
          src={getPostImageUrl(post.image)}
          alt="Post"
                 className="mt-2 rounded-lg object-cover w-full max-h-[700px]"

        />
      )}

      {/* Actions */}
      <div className="mt-4 flex justify-between items-center border-t border-[#66666645] py-2 px-3 text-ascent-2 text-base">
        <p className="flex gap-2 items-center cursor-pointer" onClick={handleLikePost}>
          {likes.includes(user?._id) ? <BiSolidLike size={20} color="blue" /> : <BiLike size={20} />}
          {likes.length} Likes
        </p>
        <p className="flex gap-2 items-center cursor-pointer" onClick={() => setShowComments(!showComments)}>
          <BiComment size={20} /> {comments.length} Comments
        </p>
        {user?._id && user?._id === post?.userId?._id && (
          <div className="flex gap-1 items-center cursor-pointer" onClick={() => deletePost(post._id)}>
            <MdOutlineDeleteOutline size={20} />
            <span>Delete</span>
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4">
          <CommentForm user={user} postId={post._id} refreshComments={refreshComments} />

          {Array.isArray(comments) && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment?._id ?? Math.random()} className="py-2">
                <div className="flex gap-3 items-center">
                  <Link to={`/profile/${comment?.userId?._id ?? ""}`}>
                    <img
                      src={comment?.userId?.profileUrl ?? NoProfile}
                      alt={comment?.userId?.firstName ?? "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link to={`/profile/${comment?.userId?._id ?? ""}`}>
                      <p className="font-medium text-base text-ascent-1">
                        {comment?.userId?.firstName ?? "Unknown"} {comment?.userId?.lastName ?? ""}
                      </p>
                    </Link>
                    <span className="text-ascent-2 text-sm">{moment(comment?.createdAt).fromNow()}</span>
                  </div>
                </div>

                <p className="ml-12 text-ascent-2">{comment?.comment ?? ""}</p>

                <div className="ml-12 mt-2 flex gap-6">
                  <p className="flex gap-2 cursor-pointer" onClick={() => handleLikeComment(comment?._id)}>
                    {comment?.likes?.includes(user?._id) ? <BiSolidLike size={20} color="blue" /> : <BiLike size={20} />}
                    {comment?.likes?.length || 0} Likes
                  </p>
                  <CommentForm
                    user={user}
                    postId={comment?._id}
                    replyAt={comment?.from}
                    refreshComments={refreshComments}
                  />
                </div>

                {/* Replies */}
                {Array.isArray(comment?.replies) && comment.replies.map((reply) => (
                  <ReplyCard
                    key={reply?._id ?? Math.random()}
                    reply={reply}
                    user={user}
                    handleLikeReply={() => handleLikeReply(comment?._id, reply?._id)}
                  />
                ))}
              </div>
            ))
          ) : (
            <span className="flex text-sm py-4 text-ascent-2 text-center">No comments yet. Be the first to comment!</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;



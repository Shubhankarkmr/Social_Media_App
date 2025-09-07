import React, { useState } from "react";
import { useForm } from "react-hook-form";
import TextInput from "./TextInput";
import CustomButton from "./CustomButton";
import Loading from "./Loading";
import { apiRequest } from "../utils";

const CommentForm = ({ postId, commentId, user, replyAt, refreshComments }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    if (!data.comment) return;
    setLoading(true);

    const URL = commentId
      ? `/posts/reply-comment/${commentId}`
      : `/posts/comment/${postId}`;

    try {
      await apiRequest({
        url: URL,
        method: "POST",
        token: user?.token,
        data: {
          comment: data.comment,
          from: `${user.firstName} ${user.lastName}`,
          replyAt: replyAt || null,
          userId: user._id,
        },
      });
      reset();
      refreshComments();
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full my-2">
      <div className="flex items-center gap-2">
        <img
          src={user.profileUrl ?? ""}
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <TextInput
          placeholder={replyAt ? `Reply @${replyAt}` : "Write a comment..."}
          register={register("comment", { required: true })}
          styles="w-full rounded-full py-2"
        />
        {loading ? <Loading /> : <CustomButton title="Send" type="submit" />}
      </div>
    </form>
  );
};

export default CommentForm;

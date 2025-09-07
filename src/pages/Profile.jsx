import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FriendsCard, Loading, PostCard, ProfileCard, TopBar } from "../components";
import { fetchPosts, getUserInfo, likePost, deletePost as deletePostApi } from "../utils";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get user info
  const getUser = async () => {
    try {
      const res = await getUserInfo(user?.token, id);
      setUserInfo(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Get user's posts
  const getUserPosts = async () => {
    try {
      setLoading(true);
      const uri = `/posts/get-user-post/${id}`;
      await fetchPosts(user.token, dispatch, uri);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDelete = async (postId) => {
    try {
      await deletePostApi(postId, user.token);
      await getUserPosts();
    } catch (err) {
      console.error(err);
    }
  };

  // Like post
  const handleLikePost = async (postId) => {
    try {
      await likePost({ uri: `/posts/like/${postId}`, token: user?.token });
      await getUserPosts();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getUser();
    getUserPosts();
  }, [id]);

  return (
    <div className="home w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
      <TopBar />
      <div className="w-full flex gap-2 lg:gap-4 md:pl-4 pt-5 pb-10 h-full">
        {/* LEFT */}
        <div className="hidden w-1/3 lg:w-1/4 md:flex flex-col gap-6 overflow-y-auto">
          <ProfileCard user={userInfo} />
          <div className="block lg:hidden">
            <FriendsCard friends={userInfo?.friends} />
          </div>
        </div>

        {/* CENTER */}
        <div className="flex-1 h-full bg-primary px-4 flex flex-col gap-6 overflow-y-auto">
          {loading ? (
            <Loading />
          ) : posts && posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post?._id}
                post={post}
                user={user}
                deletePost={handleDelete}
                likePost={handleLikePost}
              />
            ))
          ) : (
            <div className="flex w-full h-full items-center justify-center">
              <p className="text-lg text-ascent-2">No Post Available</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto">
          <FriendsCard friends={userInfo?.friends} />
        </div>
      </div>
    </div>
  );
};

export default Profile;


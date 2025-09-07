import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TextInput,
  TopBar,
} from "../components";

import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import { BsFiletypeGif, BsPersonFillAdd } from "react-icons/bs";
import { BiDislike, BiImages, BiSolidVideo } from "react-icons/bi";
import { useForm } from "react-hook-form";
import {
  apiRequest,
  handleFileUpload,
  fetchPosts,
  likePost,
  deletePost,
  sendFriendRequest,
  getUserInfo,
} from "../utils";
import { UserLogin } from "../redux/userSlice";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const { posts } = useSelector((state) => state.posts);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Submit new post
  const handlePostSubmit = async (data) => {
    if (!user?.token) return;
    setPosting(true);
    setErrMsg("");

    try {
      const uri = file && (await handleFileUpload(file));
      const newData = uri ? { ...data, image: uri } : data;

      const res = await apiRequest({
        url: "/posts/create-post",
        data: newData,
        token: user?.token,
        method: "POST",
      });

      if (res?.status === "failed") {
        setErrMsg(res);
      } else {
        reset({ description: "" });
        setFile(null);
        setErrMsg("");
        await fetchPost();
      }
    } catch (error) {
      console.error(error);
    }
    setPosting(false);
  };

  // Fetch posts
  const fetchPost = async () => {
    if (!user?.token) return;
    setLoading(true);
    await fetchPosts(user?.token, dispatch);
    setLoading(false);
  };

  // Like post
  const handleLikePost = async (postId) => {
    if (!user?.token) return;
    try {
      await likePost({ postId, token: user.token });
      await fetchPost();
    } catch (error) {
      console.error(error);
    }
  };

  // Delete post
  const handleDelete = async (id) => {
    if (!user?.token) return;
    await deletePost(id, user.token);
    await fetchPost();
  };

  // Fetch friend requests
  const fetchFriendRequests = async () => {
    try {
      const res = await apiRequest({
        url: "/users/get-friend-request",
        token: user?.token,
        method: "POST",
      });
      setFriendRequest(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch suggested friends
  const fetchSuggestedFriends = async () => {
    try {
      const res = await apiRequest({
        url: "/users/suggested-friends",
        token: user?.token,
        method: "POST",
      });

      if (!Array.isArray(res?.data)) return setSuggestedFriends([]);

      const requestsFrom = friendRequest?.map((req) => req?.requestFrom?._id) || [];
      const requestsTo = friendRequest?.map((req) => req?.requestTo?._id) || [];
      const existingFriends = user?.friends?.map((f) => f?._id) || [];

      const filtered = res.data.filter(
        (friend) =>
          friend?._id &&
          friend._id !== user?._id &&
          !existingFriends.includes(friend._id) &&
          !requestsFrom.includes(friend._id) &&
          !requestsTo.includes(friend._id)
      );

      setSuggestedFriends(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  // Send friend request
  const handleFriendRequest = async (id) => {
    if (!user?.token) return;
    if (friendRequest.some((req) => req?.requestFrom?._id === id || req?.requestTo?._id === id)) return;

    try {
      await sendFriendRequest(user.token, id);
      await fetchSuggestedFriends();
    } catch (error) {
      console.log(error);
    }
  };

  // Accept or deny friend request
  const acceptFriendRequest = async (id, status) => {
    try {
      const res = await apiRequest({
        url: "/users/accept-request",
        token: user?.token,
        method: "POST",
        data: { rid: id, status },
      });

      setFriendRequest((prev) => prev.filter((req) => req._id !== id));

      if (status === "Accepted") {
        const newFriend = res?.data?.friend;
        if (newFriend) {
          dispatch(UserLogin({ ...user, friends: [...(user?.friends || []), newFriend] }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch user info
  const getUser = async () => {
    try {
      const res = await getUserInfo(user?.token);
      dispatch(UserLogin({ token: user?.token, ...res }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    getUser();
    fetchPost();
    fetchFriendRequests();
    fetchSuggestedFriends();
  }, []);

  return (
    <>
      <div className="w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-bgColor lg:rounded-lg h-screen overflow-hidden">
        <TopBar />

        <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full">
          {/* LEFT */}
          <div className="hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto">
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          {/* CENTER */}
          <div className="flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg">
            {/* Create Post Form */}
            <form onSubmit={handleSubmit(handlePostSubmit)} className="bg-primary px-4 rounded-lg">
              <div className="w-full flex items-center gap-2 py-4 border-b border-[#66666645]">
                <img src={user?.profileUrl ?? NoProfile} alt="User Image" className="w-14 h-14 rounded-full object-cover" />
                <TextInput
                  styles="w-full rounded-full py-5"
                  placeholder="What's on your mind...."
                  name="description"
                  register={register("description", { required: "Write something about post" })}
                  error={errors.description ? errors.description.message : ""}
                />
              </div>

              {errMsg?.message && (
                <span role="alert" className={`text-sm ${errMsg?.status === "failed" ? "text-[#f64949fe]" : "text-[#2ba150fe]"} mt-0.5`}>
                  {errMsg?.message}
                </span>
              )}

              <div className="flex items-center justify-between py-4">
                {/* File Inputs */}
                <label htmlFor="imgUpload" className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer">
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="imgUpload" accept=".jpg, .png, .jpeg" />
                  <BiImages />
                  <span>Image</span>
                </label>
                <label htmlFor="videoUpload" className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer">
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="videoUpload" accept=".mp4, .wav" />
                  <BiSolidVideo />
                  <span>Video</span>
                </label>
                <label htmlFor="vgifUpload" className="flex items-center gap-1 text-base text-ascent-2 hover:text-ascent-1 cursor-pointer">
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="vgifUpload" accept=".gif" />
                  <BsFiletypeGif />
                  <span>Gif</span>
                </label>

                <div>{posting ? <Loading /> : <CustomButton type="submit" title="Post" containerStyles="bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm" />}</div>
              </div>
            </form>

            {/* Posts */}
            {loading ? (
              <Loading />
            ) : Array.isArray(posts) && posts.length > 0 ? (
              posts.map((post) =>
                post && post._id ? (
                  <PostCard key={post._id} post={post} user={user} deletePost={handleDelete} likePost={() => handleLikePost(post._id)} />
                ) : null
              )
            ) : (
              <div className="flex w-full h-full items-center justify-center">
                <p className="text-lg text-ascent-2">No Post Available</p>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto">
            {/* Friend Requests */}
            <div className="w-full bg-primary shadow-sm rounded-lg px-6 py-5">
              <div className="flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]">
                <span>Friend Request</span>
                <span>{friendRequest?.length || 0}</span>
              </div>

              <div className="w-full flex flex-col gap-4 pt-4">
                {Array.isArray(friendRequest) &&
                  friendRequest.map(({ _id, requestFrom: from }) =>
                    from?._id ? (
                      <div key={_id || from._id} className="flex items-center justify-between">
                        <Link to={"/profile/" + from._id} className="w-full flex gap-4 items-center cursor-pointer">
                          <img src={from?.profileUrl ?? NoProfile} alt={from?.firstName} className="w-10 h-10 object-cover rounded-full" />
                          <div className="flex-1">
                            <p className="text-base font-medium text-ascent-1">{from?.firstName} {from?.lastName}</p>
                            <span className="text-sm text-ascent-2">{from?.profession ?? "No Profession"}</span>
                          </div>
                        </Link>
                        <div className="flex gap-1">
                          <CustomButton title="Accept" onClick={() => acceptFriendRequest(_id, "Accepted")} containerStyles="bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full" />
                          <CustomButton title="Deny" onClick={() => acceptFriendRequest(_id, "Denied")} containerStyles="border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full" />
                        </div>
                      </div>
                    ) : null
                  )}
              </div>
            </div>

            {/* Suggested Friends */}
            <div className="w-full bg-primary shadow-sm rounded-lg px-5 py-5">
              <div className="flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]">
                <span>Friend Suggestion</span>
              </div>
              <div className="w-full flex flex-col gap-4 pt-4">
                {Array.isArray(suggestedFriends) &&
                  suggestedFriends.map((friend) =>
                    friend?._id ? (
                      <div className="flex items-center justify-between" key={friend._id}>
                        <Link to={"/profile/" + friend._id} className="w-full flex gap-4 items-center cursor-pointer">
                          <img src={friend?.profileUrl ?? NoProfile} alt={friend?.firstName} className="w-10 h-10 object-cover rounded-full" />
                          <div className="flex-1">
                            <p className="text-base font-medium text-ascent-1">{friend?.firstName} {friend?.lastName}</p>
                            <span className="text-sm text-ascent-2">{friend?.profession ?? "No Profession"}</span>
                          </div>
                        </Link>
                        <div className="flex gap-1">
                          <button className="bg-[#0444a430] text-sm text-white p-1 rounded" onClick={() => handleFriendRequest(friend._id)}>
                            <BsPersonFillAdd size={20} className="text-[#0f52b6]" />
                          </button>
                        </div>
                      </div>
                    ) : null
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {edit && <EditProfile />}
    </>
  );
};

export default Home;




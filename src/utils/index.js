import axios from "axios";
import { SetPosts } from "../redux/postSlice";
const API_URL = "http://localhost:8800";

export const API = axios.create({
  baseURL: API_URL,
  responseType: "json",
});

export const apiRequest = async ({ url, data, token, method }) => {
  try {
    const config = {
      url,
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    };

    if (data !== undefined) {
      config.data = data;
    }

    const response = await API(config);
    return response.data;
  } catch (error) {
    const err = error.response?.data || { success: false, message: error.message };
    console.error(err);
    return { status: err.success, message: err.message };
  }
};



export const handleFileUpload = async (uploadFile) => {
  if (!uploadFile) {
    throw new Error("No file provided for upload");
  }

  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("upload_preset", "FullStackSocialMedia-main");

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dxfipuy9u/image/upload",
      formData
    );

    if (response.status === 200 && response.data?.secure_url) {
      return response.data.secure_url; // Return uploaded image URL
    } else {
      console.error("Unexpected response:", response);
      throw new Error("File upload failed");
    }
  } catch (error) {
    console.error("File Upload Error:", error);
    throw error;
  }
};


export const fetchPosts = async (token, dispatch, uri, data) => {
    try {
        const res = await apiRequest({
            url: uri || "/posts",
            token: token,
            method: "POST",
            data: data || {},
        });
        dispatch(SetPosts(res?.data));
    } catch (error) {
        console.log(error);
    }
};


// utils/index.js
// utils/index.js
export const likePost = async ({ postId, token }) => {
  if (!token) {
    console.error("❌ Token is missing. Please log in again.");
    return { success: false, message: "Unauthorized" };
  }

  if (!postId) {
    console.error("❌ Post ID is missing!");
    return { success: false, message: "Post ID is required" };
  }

  try {
    const res = await apiRequest({
      url: `/posts/like/${postId}`, // matches backend route
      token,
      method: "POST",
      data: {}, // ✅ send empty object instead of null
    });

    return res; // parsed JSON
  } catch (error) {
    console.error("❌ Error liking post:", error.message);
    return { success: false, message: error.message };
  }
};




export const getComments = async (postId, token) => {
  if (!postId) {
    console.error('Post ID is missing');
    return [];
  }

  try {
    const res = await apiRequest({
      url: `/posts/comments/${postId}`,
      token: token,
    });
    return res?.data?.comments || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

export const submitComment = async (data, token, postId, replyAt) => {
  if (!data?.comment || !postId) {
    throw new Error("Comment or post ID is missing");
  }

  const URL = !replyAt ? `/posts/comment/${postId}` : `/posts/reply-comment/${postId}`;
  const newData = {
    comment: data.comment,
    from: data.from,  // pass user name from component
    replyAt: replyAt,
  };

  try {
    const res = await apiRequest({
      url: URL,
      data: newData,
      token: token,
      method: "POST",
    });
    return res;
  } catch (error) {
    console.error('Error submitting comment:', error);
    throw error;
  }
};


export const deletePost = async (id, token) => {
    try {
       const res= await apiRequest({
            url: `/posts/${id}`,
            token: token,
            method: "DELETE",
        });
        return;
    } catch (error) {
        console.error("Delete Post Error:", error);
    }
};

export const getUserInfo = async (token,id) => {
    try {
        const uri = id=== undefined ? "/users/get-user":"/users/get-user/"+id;
        const res = await apiRequest({
            url: uri,
            token: token,
            method: "POST",
        });
        if (res?.message === "Authentication failed") {
            localStorage.removeItem("user");
            window.alert("User session expired. Please log in again.");
            window.location.replace("/login");
        }
        return res?.user;
    } catch (error) {
        console.error("Get User Info Error:", error);
        throw error;
    }
};

export const sendFriendRequest = async (token, id) => {
    try {
        const response = await apiRequest({
            url: "/users/friend-request",
            token: token,
            method: "POST",
            data: { requestTo: id },
        });

        if (response.success === false) {
            throw new Error(response.message || 'Failed to send friend request');
        }

        return;
    } catch (error) {
        console.error("Send Friend Request Error:", error.message || JSON.stringify(error));
        throw error;
    }
};

export const viewUserProfile = async (token, id) => {
    try {
        const res = await apiRequest({
            url: "/users/profile-view",
            token: token,
            method: "POST",
            data: { id },
        });
       return;
    } catch (error) {
        console.error("View User Profile Error:", error);
    }
};

export const updateUserProfile = async (id, token, updateData) => {
    try {
        const res = await apiRequest({
            url: `/users/update/${id}`,
            token: token,
            method: "PUT",
            data: updateData,
        });
        return res;
    } catch (error) {
        console.error("Update User Profile Error:", error);
        throw error;
    }
};

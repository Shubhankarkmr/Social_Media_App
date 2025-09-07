import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { LiaEditSolid } from "react-icons/lia";
import { BsBriefcase, BsFacebook, BsInstagram, BsPersonFillAdd } from "react-icons/bs";
import { FaTwitterSquare } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import moment from "moment";

import { NoProfile } from "../assets";
import { UpdateProfile } from "../redux/userSlice";

const ProfileCard = () => {
  const { user: data } = useSelector((state) => state.user); // ✅ use Redux user
  const dispatch = useDispatch();

  return (
    <div>
      <div className="w-full bg-primary flex flex-col items-center shadow-sm rounded-xl px-6 py-4">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b pb-5 border-[#66666645]">
          <div className="flex gap-2">
            <img
              src={data?.profileUrl ?? NoProfile}
              alt={data?.email}
              className="w-14 h-14 object-cover rounded-full"
            />
            <div className="flex flex-col justify-center">
              <p className="text-lg font-medium text-ascent-1">
                {data?.firstName} {data?.lastName}
              </p>
              <span className="text-ascent-2">{data?.profession ?? "No Profession"}</span>
            </div>
          </div>

          <div>
            <LiaEditSolid
              size={22}
              className="text-blue cursor-pointer"
              onClick={() => dispatch(UpdateProfile(true))}
            />
          </div>
        </div>

        {/* Location & Profession */}
        <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
          <div className="flex gap-2 items-center text-ascent-2">
            <CiLocationOn className="text-xl text-ascent-1" />
            <span>{data?.location ?? "Add Location"}</span>
          </div>
          <div className="flex gap-2 items-center text-ascent-2">
            <BsBriefcase className="text-lg text-ascent-1" />
            <span>{data?.profession ?? "Add Profession"}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="w-full flex flex-col gap-2 py-4 border-b border-[#66666645]">
          <p className="text-xl text-ascent-1 font-semibold">{data?.friends?.length} Friends</p>

          <div className="flex items-center justify-between">
            <span className="text-ascent-2">Who viewed your profile</span>
            <span className="text-ascent-1 text-lg">{data?.views?.length}</span>
          </div>

          <span className="text-base text-blue">{data?.verified ? "Verified Account" : "Not Verified"}</span>

          <div className="flex items-center justify-between">
            <span className="text-ascent-2">Joined</span>
            <span className="text-ascent-1 text-base">{moment(data?.createdAt).fromNow()}</span>
          </div>
        </div>

        {/* Social Profiles */}
        <div className="w-full flex flex-col gap-4 py-4 pb-6">
          <p className="text-ascent-1 text-lg font-semibold">Social Profile</p>

          <div className="flex gap-2 items-center text-ascent-2">
            <BsInstagram className="text-xl text-ascent-1" />
            <span>Instagram</span>
          </div>
          <div className="flex gap-2 items-center text-ascent-2">
            <FaTwitterSquare className="text-xl text-ascent-1" />
            <span>Twitter</span>
          </div>
          <div className="flex gap-2 items-center text-ascent-2">
            <BsFacebook className="text-xl text-ascent-1" />
            <span>Facebook</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserInfo } from '../../../utils/localStorageHelper';

const UserProfileCard = () => {
  const [userInfo, setUserInfo] = useState({
    name: 'Guest User',
    role: 'No Role Assigned',
    avatar: 'assets/images/users/avatar-1.jpg',
    profileImg: 'assets/images/profile-img.png',
    projects: 0,
    revenue: 0
  });

  useEffect(() => {
    const storedUserInfo = getUserInfo();
    if (storedUserInfo) {
      setUserInfo(storedUserInfo);
    } else {
      console.error("No user data found in localStorage");
    }
  }, []);

  return (
    <>
      <div className="card overflow-hidden position-relative">
        <div className="bg-primary bg-soft">
          <div className="row">
            <div className="col-7">
              <div className="text-primary p-3">
                <h5 className="text-primary">Welcome Back!</h5>
              </div>
            </div>
            <div className="col-5 align-self-end">
              <img
                src={userInfo.profileImg ? userInfo.profileImg : 'assets/images/profile-img.png'}
                alt="Profile"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
        <div className="card-body pt-0">
          <div className="row">
            <div className="col-sm-4">
              <div className="avatar-md profile-user-wid mb-4">
                <img
                  src={userInfo.avatar ? userInfo.avatar : 'assets/images/users/avatar-1.jpg'}
                  alt="User Avatar"
                  className="img-thumbnail rounded-circle"
                />
              </div>
              <h5 className="font-size-15 text-truncate">{userInfo.name}</h5>
              <p className="text-muted mb-0 text-truncate">{userInfo.role}</p>
            </div>

            <div className="col-sm-8">
              <div className="pt-4">
                {userInfo.projects && userInfo.revenue ? (
                  <>
                    <div className="row">
                      <div className="col-6">
                        <h5 className="font-size-15">{userInfo.projects}</h5>
                        <p className="text-muted mb-0">Projects</p>
                      </div>
                      <div className="col-6">
                        <h5 className="font-size-15">${userInfo.revenue}</h5>
                        <p className="text-muted mb-0">Revenue</p>
                      </div>
                    </div>
                  </>
                ) : ''}
              </div>
            </div>
          </div>
        </div>
        <div className="position-absolute bottom-0 end-0 mb-3 me-3">
          <Link to="/profile" className="btn btn-primary waves-effect waves-light btn-sm">
            View Profile <i className="mdi mdi-arrow-right ms-1"></i>
          </Link>
        </div>
      </div>
    </>
  );
};

export default UserProfileCard;

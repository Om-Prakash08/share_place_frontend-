import React, { useEffect, useState } from "react";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

import UsersList from "../components/UsersList";

const Users = () => {
  // const USERS = [
  //   {
  //     id: "u1",
  //     name: "Max Schwarz",
  //     image:
  //       "https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
  //     places: 3,
  //   },
  // ];

  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUser] = useState();
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          `${process.env.REACT_APP_BACKEND_URL}/users`
        );
        setLoadedUser(responseData.users);
      } catch (err) {}
    };
    fetchUsers();
  }, [sendRequest]); // run whenever something change inside array [] .

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}></ErrorModal>
      {isLoading && (
        <div className="center">
          <LoadingSpinner></LoadingSpinner>
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />};
    </React.Fragment>
  );
};

export default Users;

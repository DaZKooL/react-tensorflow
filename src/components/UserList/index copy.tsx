import React from "react";
import User from "../User";
import './UserList.css';

function UsersList(props: any) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    const results:[] = props.results;

    const url = "https://randomuser.me/api/?results=" + results;
    fetch(url)
      .then((response) => response.json())
      .then((json) => setData(json["results"]))
      .catch((error) => console.log(error));
  }, []);

  React.useEffect(() => {
    if (data.length !== 0) {
      setIsLoading(false);
    }
    console.log(data);
  }, [data]);

  type User = {
    name: {
      first: string;
      last: string;
    };
  };


  return (
    <div>
      {isLoading && <h1>Loading...</h1>}
      <ul className="user-list">
        {data.map((user: User) => (
          <User key={user.name.first + user.name.last} user={user}/>
        ))}
        
      </ul>
    </div>
  );
}

export default UsersList;

import React from "react";
import './User.css';
 
function User(props:any) {
  const [open, setOpen] = React.useState(false);
  const [count,setCount] = React.useState(0);
  const user= props.user;

  const showUserDetails = (user:User) => {
    console.log (user);
    console.log (count)
    setOpen(count%2==0);
    setCount (count+1);
  }


  type User = {
    name: {
      first: string;
      last: string;
    };
  };

  return (
    <div className="user-details" onClick={() => showUserDetails(user)}>
      {user.name.first}{user.name.last} 

      {open && <li>
            {user.gender} - {user.email}
          </li>}
     
    </div>
  );
}

export default User;
